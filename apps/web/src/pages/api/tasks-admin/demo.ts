import { createHmac } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import { initAuth } from "@kan/auth/server";
import { createDrizzleClient } from "@kan/db/client";
import * as userRepo from "@kan/db/repository/user.repo";

import { env } from "~/env";
import { hasAdminSession, hasValidOrigin } from "~/server/tasks-admin";

const db = createDrizzleClient();
const auth = initAuth(db);

const demoEmail = () => env.DEMO_USER_EMAIL ?? "demo@tasks.holedo.com";
const demoPassword = () =>
  createHmac("sha256", env.ADMIN_SESSION_SECRET ?? env.BETTER_AUTH_SECRET)
    .update(`holedo-tasks-demo:${demoEmail()}`)
    .digest("hex");
const demoProvisioningToken = () =>
  createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(`holedo-tasks-demo-provision:${demoEmail()}`)
    .digest("hex");

const copyAuthCookie = (response: Response, res: NextApiResponse) => {
  const cookie = response.headers.get("set-cookie");
  if (cookie) res.setHeader("Set-Cookie", cookie);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }
  if (!hasAdminSession(req)) {
    return res.status(401).json({ message: "Administrator access required" });
  }
  if (!hasValidOrigin(req)) {
    return res.status(403).json({ message: "Invalid request origin" });
  }
  if (env.NEXT_PUBLIC_ALLOW_CREDENTIALS?.toLowerCase() !== "true") {
    return res.status(503).json({
      message: "Demo access is disabled because production SSO is active.",
    });
  }

  const email = demoEmail();
  const password = demoPassword();
  const existingUser = await userRepo.getByEmail(db, email);
  const response = existingUser
    ? await auth.api.signInEmail({
        body: { email, password, rememberMe: false },
        asResponse: true,
      })
    : await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: "Holedo Tasks Demo",
          rememberMe: false,
        },
        headers: new Headers({
          "x-holedo-demo-provision": demoProvisioningToken(),
        }),
        asResponse: true,
      });

  if (!response.ok) {
    return res
      .status(response.status)
      .json({ message: "Unable to open the demo workspace" });
  }

  copyAuthCookie(response, res);
  return res.status(200).json({ redirect: "/boards" });
}
