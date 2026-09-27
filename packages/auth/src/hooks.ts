import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createAuthMiddleware } from "better-auth/api";
import { env } from "next-runtime-env";

import type { dbClient } from "@kan/db/client";
import * as boardRepo from "@kan/db/repository/board.repo";
import * as listRepo from "@kan/db/repository/list.repo";
import * as memberRepo from "@kan/db/repository/member.repo";
import * as userRepo from "@kan/db/repository/user.repo";
import * as workspaceRepo from "@kan/db/repository/workspace.repo";
import { createSubscriber, triggerSubscriberWorkflow } from "@kan/email";
import { createLogger } from "@kan/logger";
import { createS3Client, generateUID, getAvatarBucketName } from "@kan/shared";

import { downloadImage } from "./utils";

const log = createLogger("auth");

type BetterAuthUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  stripeCustomerId?: string | null | undefined;
} & Record<string, unknown>;

export function createDatabaseHooks(db: dbClient) {
  return {
    user: {
      create: {
        async before(user: BetterAuthUser, _context: unknown) {
          if (env("NEXT_PUBLIC_DISABLE_SIGN_UP")?.toLowerCase() === "true") {
            const pendingInvitation = await memberRepo.getByEmailAndStatus(
              db,
              user.email,
              "invited",
            );

            if (!pendingInvitation) {
              return Promise.resolve(false);
            }

            // Fall through to any additional checks below
          }
          // Enforce allowed domains (OIDC/social) if configured
          const allowed = process.env.BETTER_AUTH_ALLOWED_DOMAINS?.split(",")
            .map((d) => d.trim().toLowerCase())
            .filter(Boolean);
          if (allowed && allowed.length > 0) {
            const domain = user.email.split("@")[1]?.toLowerCase();
            if (!domain || !allowed.includes(domain)) {
              return Promise.resolve(false);
            }
          }
          return Promise.resolve(true);
        },
        async after(user: BetterAuthUser, _context: unknown) {
          try {
            const workspacePublicId = generateUID();
            const firstName = user.name.trim().split(/\s+/)[0] ?? "My";
            await workspaceRepo.create(db, {
              publicId: workspacePublicId,
              name: `${firstName}'s Tasks`,
              slug: workspacePublicId,
              createdBy: user.id,
              createdByEmail: user.email,
            });

            const workspaceRecord = await workspaceRepo.getByPublicId(
              db,
              workspacePublicId,
            );

            if (!workspaceRecord) {
              throw new Error(
                "Personal workspace was not found after creation",
              );
            }

            const board = await boardRepo.create(db, {
              publicId: generateUID(),
              name: "My Tasks",
              slug: "my-tasks",
              createdBy: user.id,
              workspaceId: workspaceRecord.id,
            });

            if (!board) {
              throw new Error("Personal task board could not be created");
            }

            await listRepo.bulkCreate(
              db,
              ["Capture", "Next", "Waiting", "Done"].map((name, index) => ({
                publicId: generateUID(),
                name,
                boardId: board.id,
                createdBy: user.id,
                index,
              })),
            );
          } catch (error) {
            log.error(
              { err: error, userId: user.id },
              "Error provisioning personal Tasks workspace",
            );
          }

          if (
            user.image &&
            (user.image.startsWith("http://") ||
              user.image.startsWith("https://"))
          ) {
            try {
              const client = createS3Client();

              const allowedFileExtensions = ["jpg", "jpeg", "png", "webp"];

              const fileExtension =
                user.image.split(".").pop()?.split("?")[0] ?? "jpg";
              const key = `${user.id}/avatar.${!allowedFileExtensions.includes(fileExtension) ? "jpg" : fileExtension}`;

              const imageBuffer = await downloadImage(user.image);

              await client.send(
                new PutObjectCommand({
                  Bucket: getAvatarBucketName(),
                  Key: key,
                  Body: imageBuffer,
                  ContentType: `image/${!allowedFileExtensions.includes(fileExtension) ? "jpeg" : fileExtension}`,
                }),
              );

              await userRepo.update(db, user.id, {
                image: key,
              });
            } catch (error) {
              console.error(error);
            }
          }

          const [firstName, ...rest] = (user.name || "")
            .split(" ")
            .filter(Boolean);
          const lastName = rest.length ? rest.join(" ") : undefined;

          try {
            const avatarUrl =
              user.image?.startsWith("http://") ||
              user.image?.startsWith("https://")
                ? user.image
                : undefined;

            await createSubscriber({
              publicId: user.id,
              email: user.email,
              externalId: user.id,
              firstName,
              lastName,
              name: user.name,
              attributes: {
                avatarUrl,
                emailVerified: user.emailVerified,
                stripeCustomerId: user.stripeCustomerId,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
              },
            });
          } catch (error) {
            log.error({ err: error }, "Error creating subscriber");
          }

          try {
            log.info(
              { workflowId: "user-signup", userId: user.id, email: user.email },
              "Triggering user-signup workflow",
            );
            await triggerSubscriberWorkflow("user-signup", {
              publicId: user.id,
            });
            log.info(
              { workflowId: "user-signup", userId: user.id },
              "user-signup workflow triggered",
            );
          } catch (error) {
            log.error({ err: error }, "Error triggering user-signup workflow");
          }
        },
      },
    },
  };
}

export function createMiddlewareHooks(db: dbClient) {
  return {
    after: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/magic-link/verify" &&
        (ctx.query?.callbackURL as string | undefined)?.includes("type=invite")
      ) {
        const userId = ctx.context.newSession?.session.userId;
        const callbackURL = ctx.query?.callbackURL as string | undefined;
        const memberPublicId = callbackURL?.split("memberPublicId=")[1];

        if (userId && memberPublicId) {
          const member = await memberRepo.getByPublicId(db, memberPublicId);

          if (member?.id) {
            await memberRepo.acceptInvite(db, {
              memberId: member.id,
              userId,
            });
          }
        }
      }
    }),
  };
}
