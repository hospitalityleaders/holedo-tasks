export interface TaskNavigationItem {
  label: string;
  url: string;
  order: number;
  enabled: boolean;
}

export interface TaskRuntimeSettings {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonLabel: string;
  heroButtonUrl: string;
  heroHeight: number;
  heroBackgroundColor: string;
  heroFontColor: string;
  eyebrowFontFamily: string;
  headlineFontFamily: string;
  subtitleFontFamily: string;
  boardTitle: string;
  activeCountLabel: string;
  captureColumnLabel: string;
  nextColumnLabel: string;
  waitingColumnLabel: string;
  doneColumnLabel: string;
  captureCardOne: string;
  captureCardTwo: string;
  nextCardOne: string;
  nextCardTwo: string;
  waitingCard: string;
  doneCard: string;
  binLabel: string;
  completedContextLabel: string;
  personalFeatureTitle: string;
  personalFeatureDescription: string;
  companyFeatureTitle: string;
  companyFeatureDescription: string;
  contextFeatureTitle: string;
  contextFeatureDescription: string;
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
  privacyLabel: string;
  cookieLabel: string;
  termsLabel: string;
  imprintLabel: string;
  privacySettingsLabel: string;
  showPrivacySettings: boolean;
}

export const DEFAULT_TASK_RUNTIME_SETTINGS: TaskRuntimeSettings = {
  eyebrow: "Holedo Tasks",
  heroTitle: "Capture and manage tasks.",
  heroSubtitle:
    "Capture what matters, organise the work and move every commitment to completion.",
  heroButtonLabel: "Start Now",
  heroButtonUrl: "https://www.holedo.com/register/",
  heroHeight: 520,
  heroBackgroundColor: "#384677",
  heroFontColor: "#ffffff",
  eyebrowFontFamily: "Source Sans Pro",
  headlineFontFamily: "Source Sans Pro",
  subtitleFontFamily: "Source Sans Pro",
  boardTitle: "My Tasks",
  activeCountLabel: "7 active",
  captureColumnLabel: "Capture",
  nextColumnLabel: "Next",
  waitingColumnLabel: "Waiting",
  doneColumnLabel: "Done",
  captureCardOne: "Prepare weekly priorities",
  captureCardTwo: "Follow up",
  nextCardOne: "Review proposal",
  nextCardTwo: "Confirm meeting",
  waitingCard: "Approval",
  doneCard: "Launch notes",
  binLabel: "Recoverable Bin",
  completedContextLabel: "Completed work stays in context",
  personalFeatureTitle: "Your own workspace",
  personalFeatureDescription:
    "Every Holedo member gets a private Tasks workspace from their first sign-in.",
  companyFeatureTitle: "One shared company",
  companyFeatureDescription:
    "Companies can bring their team into one shared workspace while personal Tasks stay private.",
  contextFeatureTitle: "Work stays in context",
  contextFeatureDescription:
    "Capture first, move work forward and recover anything placed in the Bin.",
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
  loginUrl: "https://www.holedo.com/login/",
  signupLabel: "Sign Up Free",
  signupUrl: "https://www.holedo.com/register/",
  privacyUrl: "https://www.iubenda.com/privacy-policy/84980546",
  cookieUrl: "https://www.iubenda.com/privacy-policy/84980546/cookie-policy",
  termsUrl: "https://www.iubenda.com/terms-and-conditions/84980546",
  imprintUrl: "https://www.holedo.com/imprint/",
  privacyLabel: "Privacy",
  cookieLabel: "Cookies",
  termsLabel: "Terms",
  imprintLabel: "Imprint",
  privacySettingsLabel: "Privacy settings",
  showPrivacySettings: true,
};

const stringValue = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;

const centralAuthUrl = (
  value: unknown,
  legacyPath: "/login" | "/signup",
  fallback: string,
) => {
  const configured = stringValue(value, fallback);
  return configured === legacyPath ? fallback : configured;
};

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
    eyebrow: stringValue(input.eyebrow, DEFAULT_TASK_RUNTIME_SETTINGS.eyebrow),
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
    heroButtonUrl: centralAuthUrl(
      input.heroButtonUrl,
      "/signup",
      DEFAULT_TASK_RUNTIME_SETTINGS.heroButtonUrl,
    ),
    heroHeight:
      typeof input.heroHeight === "number"
        ? input.heroHeight
        : DEFAULT_TASK_RUNTIME_SETTINGS.heroHeight,
    heroBackgroundColor: stringValue(
      input.heroBackgroundColor,
      DEFAULT_TASK_RUNTIME_SETTINGS.heroBackgroundColor,
    ),
    heroFontColor: stringValue(
      input.heroFontColor,
      DEFAULT_TASK_RUNTIME_SETTINGS.heroFontColor,
    ),
    eyebrowFontFamily: stringValue(
      input.eyebrowFontFamily,
      DEFAULT_TASK_RUNTIME_SETTINGS.eyebrowFontFamily,
    ),
    headlineFontFamily: stringValue(
      input.headlineFontFamily,
      DEFAULT_TASK_RUNTIME_SETTINGS.headlineFontFamily,
    ),
    subtitleFontFamily: stringValue(
      input.subtitleFontFamily,
      DEFAULT_TASK_RUNTIME_SETTINGS.subtitleFontFamily,
    ),
    boardTitle: stringValue(
      input.boardTitle,
      DEFAULT_TASK_RUNTIME_SETTINGS.boardTitle,
    ),
    activeCountLabel: stringValue(
      input.activeCountLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.activeCountLabel,
    ),
    captureColumnLabel: stringValue(
      input.captureColumnLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.captureColumnLabel,
    ),
    nextColumnLabel: stringValue(
      input.nextColumnLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.nextColumnLabel,
    ),
    waitingColumnLabel: stringValue(
      input.waitingColumnLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.waitingColumnLabel,
    ),
    doneColumnLabel: stringValue(
      input.doneColumnLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.doneColumnLabel,
    ),
    captureCardOne: stringValue(
      input.captureCardOne,
      DEFAULT_TASK_RUNTIME_SETTINGS.captureCardOne,
    ),
    captureCardTwo: stringValue(
      input.captureCardTwo,
      DEFAULT_TASK_RUNTIME_SETTINGS.captureCardTwo,
    ),
    nextCardOne: stringValue(
      input.nextCardOne,
      DEFAULT_TASK_RUNTIME_SETTINGS.nextCardOne,
    ),
    nextCardTwo: stringValue(
      input.nextCardTwo,
      DEFAULT_TASK_RUNTIME_SETTINGS.nextCardTwo,
    ),
    waitingCard: stringValue(
      input.waitingCard,
      DEFAULT_TASK_RUNTIME_SETTINGS.waitingCard,
    ),
    doneCard: stringValue(
      input.doneCard,
      DEFAULT_TASK_RUNTIME_SETTINGS.doneCard,
    ),
    binLabel: stringValue(
      input.binLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.binLabel,
    ),
    completedContextLabel: stringValue(
      input.completedContextLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.completedContextLabel,
    ),
    personalFeatureTitle: stringValue(
      input.personalFeatureTitle,
      DEFAULT_TASK_RUNTIME_SETTINGS.personalFeatureTitle,
    ),
    personalFeatureDescription: stringValue(
      input.personalFeatureDescription,
      DEFAULT_TASK_RUNTIME_SETTINGS.personalFeatureDescription,
    ),
    companyFeatureTitle: stringValue(
      input.companyFeatureTitle,
      DEFAULT_TASK_RUNTIME_SETTINGS.companyFeatureTitle,
    ),
    companyFeatureDescription: stringValue(
      input.companyFeatureDescription,
      DEFAULT_TASK_RUNTIME_SETTINGS.companyFeatureDescription,
    ),
    contextFeatureTitle: stringValue(
      input.contextFeatureTitle,
      DEFAULT_TASK_RUNTIME_SETTINGS.contextFeatureTitle,
    ),
    contextFeatureDescription: stringValue(
      input.contextFeatureDescription,
      DEFAULT_TASK_RUNTIME_SETTINGS.contextFeatureDescription,
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
    loginUrl: centralAuthUrl(
      input.loginUrl,
      "/login",
      DEFAULT_TASK_RUNTIME_SETTINGS.loginUrl,
    ),
    signupLabel: stringValue(
      input.signupLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.signupLabel,
    ),
    signupUrl: centralAuthUrl(
      input.signupUrl,
      "/signup",
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
    privacyLabel: stringValue(
      input.privacyLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.privacyLabel,
    ),
    cookieLabel: stringValue(
      input.cookieLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.cookieLabel,
    ),
    termsLabel: stringValue(
      input.termsLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.termsLabel,
    ),
    imprintLabel: stringValue(
      input.imprintLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.imprintLabel,
    ),
    privacySettingsLabel: stringValue(
      input.privacySettingsLabel,
      DEFAULT_TASK_RUNTIME_SETTINGS.privacySettingsLabel,
    ),
    showPrivacySettings:
      typeof input.showPrivacySettings === "boolean"
        ? input.showPrivacySettings
        : DEFAULT_TASK_RUNTIME_SETTINGS.showPrivacySettings,
  };
}
