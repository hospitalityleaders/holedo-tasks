import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import type { TaskRuntimeSettings } from "@kan/shared";

export const taskSettings = pgTable("task_settings", {
  key: text("key").primaryKey(),
  config: jsonb("config").$type<TaskRuntimeSettings>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}).enableRLS();
