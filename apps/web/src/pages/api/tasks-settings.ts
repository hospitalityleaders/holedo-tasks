import type { NextApiRequest, NextApiResponse } from "next";

import { createNextApiContext } from "@kan/api/trpc-context";
import * as taskSettingsRepo from "@kan/db/repository/task-settings.repo";

import { normalizeTaskRuntimeSettings } from "~/utils/task-settings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { db } = await createNextApiContext(req);
  const settings = await taskSettingsRepo.get(db);

  res.setHeader(
    "Cache-Control",
    "public, max-age=30, stale-while-revalidate=300",
  );
  return res.status(200).json(normalizeTaskRuntimeSettings(settings));
}
