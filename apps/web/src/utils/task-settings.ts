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

const optionalRelativeOrAbsoluteUrl = z.union([
  z.literal(""),
  relativeOrAbsoluteUrl,
]);

const color = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Enter a six-digit hex colour");

export const taskRuntimeSettingsSchema = z.object({
  eyebrow: z.string().trim().min(1).max(60),
  heroTitle: z.string().trim().min(1).max(100),
  heroSubtitle: z.string().trim().min(1).max(240),
  heroButtonLabel: z.string().trim().min(1).max(40),
  heroButtonUrl: relativeOrAbsoluteUrl,
  heroHeight: z.number().int().min(320).max(900),
  heroBackgroundColor: color,
  heroFontColor: color,
  eyebrowFontFamily: z.string().trim().min(1).max(100),
  headlineFontFamily: z.string().trim().min(1).max(100),
  subtitleFontFamily: z.string().trim().min(1).max(100),
  boardTitle: z.string().trim().min(1).max(60),
  activeCountLabel: z.string().trim().min(1).max(40),
  captureColumnLabel: z.string().trim().min(1).max(30),
  nextColumnLabel: z.string().trim().min(1).max(30),
  waitingColumnLabel: z.string().trim().min(1).max(30),
  doneColumnLabel: z.string().trim().min(1).max(30),
  captureCardOne: z.string().trim().min(1).max(80),
  captureCardTwo: z.string().trim().min(1).max(80),
  nextCardOne: z.string().trim().min(1).max(80),
  nextCardTwo: z.string().trim().min(1).max(80),
  waitingCard: z.string().trim().min(1).max(80),
  doneCard: z.string().trim().min(1).max(80),
  binLabel: z.string().trim().min(1).max(60),
  completedContextLabel: z.string().trim().min(1).max(80),
  personalFeatureTitle: z.string().trim().min(1).max(80),
  personalFeatureDescription: z.string().trim().min(1).max(240),
  companyFeatureTitle: z.string().trim().min(1).max(80),
  companyFeatureDescription: z.string().trim().min(1).max(240),
  contextFeatureTitle: z.string().trim().min(1).max(80),
  contextFeatureDescription: z.string().trim().min(1).max(240),
  metaTitle: z.string().trim().min(1).max(70),
  metaDescription: z.string().trim().min(1).max(180),
  accentColor: color,
  headerBackgroundColor: color,
  headerFontColor: color,
  siteIconUrl: optionalRelativeOrAbsoluteUrl,
  openGraphImageUrl: optionalRelativeOrAbsoluteUrl,
  headerCode: z.string().max(100_000),
  footerCode: z.string().max(100_000),
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
  privacyLabel: z.string().trim().min(1).max(40),
  cookieLabel: z.string().trim().min(1).max(40),
  termsLabel: z.string().trim().min(1).max(40),
  imprintLabel: z.string().trim().min(1).max(40),
  privacySettingsLabel: z.string().trim().min(1).max(60),
  showPrivacySettings: z.boolean(),
});

export { DEFAULT_TASK_RUNTIME_SETTINGS, normalizeTaskRuntimeSettings };
