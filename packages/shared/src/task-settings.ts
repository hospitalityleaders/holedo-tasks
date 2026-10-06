export interface TaskNavigationItem {
  label: string;
  url: string;
  order: number;
  enabled: boolean;
}

export interface TaskRuntimeSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonLabel: string;
  heroButtonUrl: string;
  metaTitle: string;
  metaDescription: string;
  accentColor: string;
  headerBackgroundColor: string;
  headerFontColor: string;
  siteIconUrl: string;
  openGraphImageUrl: string;
  headerCode: string;
  footerCode: string;
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
  heroButtonLabel: "Start Now",
  heroButtonUrl: "/signup",
  metaTitle: "Holedo Tasks",
  metaDescription:
    "Capture, organise and complete tasks in your personal or shared Holedo workspace.",
  accentColor: "#32a3fd",
  headerBackgroundColor: "#384677",
  headerFontColor: "#ffffff",
  siteIconUrl: "/assets/branding/holedo-icon.png",
  openGraphImageUrl: "",
  headerCode: "",
  footerCode: "",
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
    heroButtonLabel: stringValue(
      input.heroButtonLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.heroButtonLabel,
    ),
    heroButtonUrl: stringValue(
      input.heroButtonUrl,
      DEFAULT_TASK_RUNTIME_SETTINGS.heroButtonUrl,
    ),
    metaTitle: stringValue(
      input.metaTitle,
      DEFAULT_TASK_RUNTIME_SETTINGS.metaTitle,
    ),
    metaDescription: stringValue(
      input.metaDescription,
      DEFAULT_TASK_RUNTIME_SETTINGS.metaDescription,
    ),
    accentColor: stringValue(
      input.accentColor,
      DEFAULT_TASK_RUNTIME_SETTINGS.accentColor,
    ),
    headerBackgroundColor: stringValue(
      input.headerBackgroundColor,
      DEFAULT_TASK_RUNTIME_SETTINGS.headerBackgroundColor,
    ),
    headerFontColor: stringValue(
      input.headerFontColor,
      DEFAULT_TASK_RUNTIME_SETTINGS.headerFontColor,
    ),
    siteIconUrl: stringValue(
      input.siteIconUrl,
      DEFAULT_TASK_RUNTIME_SETTINGS.siteIconUrl,
    ),
    openGraphImageUrl: stringValue(
      input.openGraphImageUrl,
      DEFAULT_TASK_RUNTIME_SETTINGS.openGraphImageUrl,
    ),
    headerCode: stringValue(
      input.headerCode,
      DEFAULT_TASK_RUNTIME_SETTINGS.headerCode,
    ),
    footerCode: stringValue(
      input.footerCode,
      DEFAULT_TASK_RUNTIME_SETTINGS.footerCode,
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
