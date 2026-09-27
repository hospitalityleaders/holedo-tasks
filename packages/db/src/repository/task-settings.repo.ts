import { eq } from "drizzle-orm";

import type { dbClient } from "@kan/db/client";
import type { TaskRuntimeSettings } from "@kan/shared";
import { taskSettings } from "@kan/db/schema";

const SETTINGS_KEY = "default";

export const get = async (db: dbClient) => {
  const result = await db.query.taskSettings.findFirst({
    columns: { config: true },
    where: eq(taskSettings.key, SETTINGS_KEY),
  });

  return result?.config;
};

export const upsert = async (db: dbClient, config: TaskRuntimeSettings) => {
  const [result] = await db
    .insert(taskSettings)
    .values({ key: SETTINGS_KEY, config })
    .onConflictDoUpdate({
      target: taskSettings.key,
      set: { config, updatedAt: new Date() },
    })
    .returning({ config: taskSettings.config });

  return result?.config;
};
