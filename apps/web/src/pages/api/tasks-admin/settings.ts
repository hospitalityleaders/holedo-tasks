import type { NextApiRequest, NextApiResponse } from "next";

import { createNextApiContext } from "@kan/api/trpc-context";
import * as taskSettingsRepo from "@kan/db/repository/task-settings.repo";

import { hasAdminSession, hasValidOrigin } from "~/server/tasks-admin";
import {
  normalizeTaskRuntimeSettings,
  taskRuntimeSettingsSchema,
} from "~/utils/task-settings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!hasAdminSession(req)) {
    return res.status(401).json({ message: "Admin session required" });
  }

  if (req.method !== "GET" && req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { db } = await createNextApiContext(req);

  if (req.method === "GET") {
    const settings = await taskSettingsRepo.get(db);
    return res.status(200).json(normalizeTaskRuntimeSettings(settings));
  }

  if (!hasValidOrigin(req)) {
    return res.status(403).json({ message: "Invalid request origin" });
  }

  const parsed = taskRuntimeSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid settings",
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const settings = await taskSettingsRepo.upsert(db, parsed.data);
  return res.status(200).json(normalizeTaskRuntimeSettings(settings));
}
