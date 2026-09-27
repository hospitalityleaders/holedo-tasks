import { createHmac, timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "~/env";

const COOKIE_NAME = "holedo_tasks_admin";
const SESSION_SECONDS = 60 * 60 * 8;

const hash = (value: string) =>
  createHmac("sha256", "holedo-tasks-admin-compare").update(value).digest();

const secureEqual = (left: string, right: string) =>
  timingSafeEqual(hash(left), hash(right));

const sessionSecret = () => {
  const configuredSecret = env.ADMIN_SESSION_SECRET;
  return configuredSecret?.length ? configuredSecret : env.BETTER_AUTH_SECRET;
};

export const isAdminConfigured = () =>
  Boolean(env.ADMIN_TOKEN && sessionSecret());

export const verifyAdminToken = (token: string) =>
  Boolean(env.ADMIN_TOKEN && secureEqual(token, env.ADMIN_TOKEN));

const sign = (payload: string) =>
  createHmac("sha256", sessionSecret()).update(payload).digest("base64url");

export const createAdminSession = () => {
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: Date.now() + SESSION_SECONDS * 1000 }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
};

export const hasAdminSession = (req: NextApiRequest) => {
  const value = req.cookies[COOKIE_NAME];
  if (!value || !sessionSecret()) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature || !secureEqual(signature, sign(payload))) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { expiresAt?: unknown };
    return (
      typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
};

export const setAdminCookie = (res: NextApiResponse, value: string) => {
  const secure = env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`,
  );
};

export const clearAdminCookie = (res: NextApiResponse) => {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
  );
};

export const hasValidOrigin = (req: NextApiRequest) => {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};
