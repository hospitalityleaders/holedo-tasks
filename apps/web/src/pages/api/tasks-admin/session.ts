import type { NextApiRequest, NextApiResponse } from "next";

import { withRateLimit } from "@kan/api/utils/rateLimit";

import {
  clearAdminCookie,
  createAdminSession,
  hasAdminSession,
  hasValidOrigin,
  isAdminConfigured,
  setAdminCookie,
  verifyAdminToken,
} from "~/server/tasks-admin";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return res.status(200).json({ authenticated: hasAdminSession(req) });
  }

  if (req.method === "DELETE") {
    if (!hasValidOrigin(req)) {
      return res.status(403).json({ message: "Invalid request origin" });
    }
    clearAdminCookie(res);
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!hasValidOrigin(req)) {
    return res.status(403).json({ message: "Invalid request origin" });
  }

  if (!isAdminConfigured()) {
    return res.status(503).json({ message: "Admin access is not configured" });
  }

  const token =
    typeof req.body === "object" && req.body !== null
      ? (req.body as { token?: unknown }).token
      : undefined;

  if (typeof token !== "string" || !verifyAdminToken(token)) {
    return res.status(401).json({ message: "Invalid admin token" });
  }

  setAdminCookie(res, createAdminSession());
  return res.status(200).json({ authenticated: true });
};

export default withRateLimit({ points: 10, duration: 60 }, handler);
