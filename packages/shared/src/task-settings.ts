export interface TaskNavigationItem {
  label: string;
  url: string;
  order: number;
  enabled: boolean;
}

export interface TaskRuntimeSettings {
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  navigation: TaskNavigationItem[];
  loginLabel: string;
  loginUrl: string;
  signupLabel: string;
  signupUrl: string;
  privacyUrl: string;
  cookieUrl: string;
  termsUrl: string;
  imprintUrl: string;
}

export const DEFAULT_TASK_RUNTIME_SETTINGS: TaskRuntimeSettings = {
  heroTitle: "Capture and manage tasks.",
  heroSubtitle:
    "Capture what matters, organise the work and move every commitment to completion.",
  metaTitle: "Holedo Tasks",
  metaDescription:
    "Capture, organise and complete tasks in your personal or shared Holedo workspace.",
  navigation: [
    { label: "Tasks", url: "/", order: 0, enabled: true },
    {
      label: "Office",
      url: "https://office.holedo.com",
      order: 10,
      enabled: true,
    },
    {
      label: "Docs",
      url: "https://docs.holedo.com",
      order: 20,
      enabled: true,
    },
    {
      label: "Sheets",
      url: "https://sheets.holedo.com",
      order: 30,
      enabled: true,
    },
    {
      label: "Meet",
      url: "https://meet.holedo.com",
      order: 40,
      enabled: true,
    },
  ],
  loginLabel: "Login",
  loginUrl: "/login",
  signupLabel: "Sign Up Free",
  signupUrl: "/signup",
  privacyUrl: "https://www.iubenda.com/privacy-policy/84980546",
  cookieUrl: "https://www.iubenda.com/privacy-policy/84980546/cookie-policy",
  termsUrl: "https://www.iubenda.com/terms-and-conditions/84980546",
  imprintUrl: "https://www.holedo.com/imprint/",
};

const stringValue = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;

const isTaskNavigationItem = (value: unknown): value is TaskNavigationItem => {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.label === "string" && typeof item.url === "string";
};

export function normalizeTaskRuntimeSettings(
  value: unknown,
): TaskRuntimeSettings {
  const input: Record<string, unknown> =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  const navigation = Array.isArray(input.navigation)
    ? input.navigation
        .filter(isTaskNavigationItem)
        .map((item, index) => ({
          label: item.label,
          url: item.url,
          order: typeof item.order === "number" ? item.order : index * 10,
          enabled: typeof item.enabled === "boolean" ? item.enabled : true,
        }))
        .sort((a, b) => a.order - b.order)
    : DEFAULT_TASK_RUNTIME_SETTINGS.navigation;

  return {
    heroTitle: stringValue(
      input.heroTitle,
      DEFAULT_TASK_RUNTIME_SETTINGS.heroTitle,
    ),
    heroSubtitle: stringValue(
      input.heroSubtitle,
      DEFAULT_TASK_RUNTIME_SETTINGS.heroSubtitle,
    ),
    metaTitle: stringValue(
      input.metaTitle,
      DEFAULT_TASK_RUNTIME_SETTINGS.metaTitle,
    ),
    metaDescription: stringValue(
      input.metaDescription,
      DEFAULT_TASK_RUNTIME_SETTINGS.metaDescription,
    ),
    navigation,
    loginLabel: stringValue(
      input.loginLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.loginLabel,
    ),
    loginUrl: stringValue(
      input.loginUrl,
      DEFAULT_TASK_RUNTIME_SETTINGS.loginUrl,
    ),
    signupLabel: stringValue(
      input.signupLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.signupLabel,
    ),
    signupUrl: stringValue(
      input.signupUrl,
      DEFAULT_TASK_RUNTIME_SETTINGS.signupUrl,
    ),
    privacyUrl: stringValue(
      input.privacyUrl,
      DEFAULT_TASK_RUNTIME_SETTINGS.privacyUrl,
    ),
    cookieUrl: stringValue(
      input.cookieUrl,
      DEFAULT_TASK_RUNTIME_SETTINGS.cookieUrl,
    ),
    termsUrl: stringValue(
      input.termsUrl,
      DEFAULT_TASK_RUNTIME_SETTINGS.termsUrl,
    ),
    imprintUrl: stringValue(
      input.imprintUrl,
      DEFAULT_TASK_RUNTIME_SETTINGS.imprintUrl,
    ),
  };
}
