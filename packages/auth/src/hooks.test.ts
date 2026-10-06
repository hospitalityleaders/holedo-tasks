import { createHmac } from "crypto";
import { env } from "next-runtime-env";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as memberRepo from "@kan/db/repository/member.repo";

import { createDatabaseHooks } from "./hooks";

vi.mock("next-runtime-env", () => ({
  env: vi.fn(),
}));

vi.mock("@kan/db/repository/member.repo", () => ({
  getByEmailAndStatus: vi.fn(),
  getByPublicId: vi.fn(),
  acceptInvite: vi.fn(),
}));

vi.mock("@kan/db/repository/user.repo", () => ({
  update: vi.fn(),
}));

vi.mock("@kan/email", () => ({
  createSubscriber: vi.fn(),
  triggerSubscriberWorkflow: vi.fn(),
}));

vi.mock("@kan/shared", () => ({
  createS3Client: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: vi.fn(),
}));

const mockEnv = env as ReturnType<typeof vi.fn>;
const mockGetByEmailAndStatus = memberRepo.getByEmailAndStatus as ReturnType<
  typeof vi.fn
>;

const db = {} as Parameters<typeof createDatabaseHooks>[0];

const fakeUser = {
  id: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  email: "test@example.com",
  emailVerified: false,
  name: "Test User",
};
const emailSignUpContext = { path: "/sign-up/email" };

describe("createDatabaseHooks", () => {
  const hooks = createDatabaseHooks(db);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("user.create.before", () => {
    it("allows sign-up when DISABLE_SIGN_UP is not set", async () => {
      mockEnv.mockReturnValue(undefined);

      const result = await hooks.user.create.before(
        fakeUser,
        emailSignUpContext,
      );
      expect(result).toBe(true);
      expect(mockGetByEmailAndStatus).not.toHaveBeenCalled();
    });

    it("allows sign-up when DISABLE_SIGN_UP is false", async () => {
      mockEnv.mockImplementation((key: string) =>
        key === "NEXT_PUBLIC_DISABLE_SIGN_UP" ? "false" : undefined,
      );

      const result = await hooks.user.create.before(
        fakeUser,
        emailSignUpContext,
      );
      expect(result).toBe(true);
      expect(mockGetByEmailAndStatus).not.toHaveBeenCalled();
    });

    it("blocks sign-up when disabled and user has no pending invitation", async () => {
      mockEnv.mockImplementation((key: string) =>
        key === "NEXT_PUBLIC_DISABLE_SIGN_UP" ? "true" : undefined,
      );
      mockGetByEmailAndStatus.mockResolvedValue(undefined);

      const result = await hooks.user.create.before(
        fakeUser,
        emailSignUpContext,
      );
      expect(result).toBe(false);
      expect(mockGetByEmailAndStatus).toHaveBeenCalledWith(
        db,
        "test@example.com",
        "invited",
      );
    });

    it("allows sign-up when disabled but user has a pending invitation", async () => {
      mockEnv.mockImplementation((key: string) =>
        key === "NEXT_PUBLIC_DISABLE_SIGN_UP" ? "true" : undefined,
      );
      mockGetByEmailAndStatus.mockResolvedValue({
        id: "member-1",
        email: "test@example.com",
        status: "invited",
      });

      const result = await hooks.user.create.before(
        fakeUser,
        emailSignUpContext,
      );
      expect(result).toBe(true);
      expect(mockGetByEmailAndStatus).toHaveBeenCalledWith(
        db,
        "test@example.com",
        "invited",
      );
    });

    it("blocks sign-up when disabled and invitation exists but domain is not allowed", async () => {
      mockEnv.mockImplementation((key: string) =>
        key === "NEXT_PUBLIC_DISABLE_SIGN_UP" ? "true" : undefined,
      );
      process.env.BETTER_AUTH_ALLOWED_DOMAINS = "acme.com";
      mockGetByEmailAndStatus.mockResolvedValue({
        id: "member-1",
        email: "test@example.com",
        status: "invited",
      });

      const result = await hooks.user.create.before(
        fakeUser,
        emailSignUpContext,
      );
      expect(result).toBe(false);

      delete process.env.BETTER_AUTH_ALLOWED_DOMAINS;
    });

    it("allows OIDC/social sign-up when local credential sign-up is disabled", async () => {
      mockEnv.mockImplementation((key: string) =>
        key === "NEXT_PUBLIC_DISABLE_SIGN_UP" ? "true" : undefined,
      );
      const oidcUser = {
        ...fakeUser,
        id: "user-oidc",
        email: "sso@corp.com",
        image: "https://provider.com/avatar.jpg",
      };
      const result = await hooks.user.create.before(oidcUser, {
        path: "/callback/oidc",
      });
      expect(result).toBe(true);
      expect(mockGetByEmailAndStatus).not.toHaveBeenCalled();
    });

    it("still applies the allowed-domain policy to OIDC/social sign-up", async () => {
      mockEnv.mockImplementation((key: string) =>
        key === "NEXT_PUBLIC_DISABLE_SIGN_UP" ? "true" : undefined,
      );
      process.env.BETTER_AUTH_ALLOWED_DOMAINS = "corp.com";
      const oidcUser = {
        ...fakeUser,
        id: "user-oidc",
        email: "random@external.com",
        image: "https://provider.com/avatar.jpg",
      };
      const result = await hooks.user.create.before(oidcUser, {
        path: "/callback/oidc",
      });
      expect(result).toBe(false);
      expect(mockGetByEmailAndStatus).not.toHaveBeenCalled();

      delete process.env.BETTER_AUTH_ALLOWED_DOMAINS;
    });

    it("allows the signed administrator demo provision request", async () => {
      const secret = "test-auth-secret";
      const demoEmail = "demo@tasks.holedo.com";
      mockEnv.mockImplementation((key: string) => {
        if (key === "NEXT_PUBLIC_DISABLE_SIGN_UP") return "true";
        if (key === "DEMO_USER_EMAIL") return demoEmail;
        if (key === "BETTER_AUTH_SECRET") return secret;
        return undefined;
      });
      const token = createHmac("sha256", secret)
        .update(`holedo-tasks-demo-provision:${demoEmail}`)
        .digest("hex");

      const result = await hooks.user.create.before(
        { ...fakeUser, email: demoEmail },
        {
          path: "/sign-up/email",
          headers: new Headers({ "x-holedo-demo-provision": token }),
        },
      );

      expect(result).toBe(true);
      expect(mockGetByEmailAndStatus).not.toHaveBeenCalled();
    });

    it("allows sign-up when disabled, invitation exists, and domain is allowed", async () => {
      mockEnv.mockImplementation((key: string) =>
        key === "NEXT_PUBLIC_DISABLE_SIGN_UP" ? "true" : undefined,
      );
      process.env.BETTER_AUTH_ALLOWED_DOMAINS = "example.com";
      mockGetByEmailAndStatus.mockResolvedValue({
        id: "member-1",
        email: "test@example.com",
        status: "invited",
      });

      const result = await hooks.user.create.before(
        fakeUser,
        emailSignUpContext,
      );
      expect(result).toBe(true);

      delete process.env.BETTER_AUTH_ALLOWED_DOMAINS;
    });
  });
});
