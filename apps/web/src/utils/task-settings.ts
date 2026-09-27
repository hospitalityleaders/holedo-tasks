import { z } from "zod";

import {
  DEFAULT_TASK_RUNTIME_SETTINGS,
  normalizeTaskRuntimeSettings,
} from "@kan/shared";

const relativeOrAbsoluteUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (value.startsWith("/")) return true;

    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Enter a relative path or a valid HTTP(S) URL");

export const taskRuntimeSettingsSchema = z.object({
  heroTitle: z.string().trim().min(1).max(100),
  heroSubtitle: z.string().trim().min(1).max(240),
  metaTitle: z.string().trim().min(1).max(70),
  metaDescription: z.string().trim().min(1).max(180),
  navigation: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        url: relativeOrAbsoluteUrl,
        order: z.number().int().min(0).max(10000),
        enabled: z.boolean(),
      }),
    )
    .max(12),
  loginLabel: z.string().trim().min(1).max(40),
  loginUrl: relativeOrAbsoluteUrl,
  signupLabel: z.string().trim().min(1).max(40),
  signupUrl: relativeOrAbsoluteUrl,
  privacyUrl: relativeOrAbsoluteUrl,
  cookieUrl: relativeOrAbsoluteUrl,
  termsUrl: relativeOrAbsoluteUrl,
  imprintUrl: relativeOrAbsoluteUrl,
});

export { DEFAULT_TASK_RUNTIME_SETTINGS, normalizeTaskRuntimeSettings };
