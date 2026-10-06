import { describe, expect, it } from "vitest";

import {
  DEFAULT_TASK_RUNTIME_SETTINGS,
  normalizeTaskRuntimeSettings,
} from "./task-settings";

describe("normalizeTaskRuntimeSettings", () => {
  it("fills the full Tasks presentation from defaults", () => {
    expect(normalizeTaskRuntimeSettings(null)).toEqual(
      DEFAULT_TASK_RUNTIME_SETTINGS,
    );
  });

  it("upgrades old local authentication links to central Holedo", () => {
    const settings = normalizeTaskRuntimeSettings({
      loginUrl: "/login",
      signupUrl: "/signup",
      heroButtonUrl: "/signup",
    });

    expect(settings.loginUrl).toBe("https://www.holedo.com/login/");
    expect(settings.signupUrl).toBe("https://www.holedo.com/register/");
    expect(settings.heroButtonUrl).toBe("https://www.holedo.com/register/");
  });

  it("preserves administrator-provided external destinations", () => {
    const settings = normalizeTaskRuntimeSettings({
      loginUrl: "https://accounts.holedo.com/login",
      signupUrl: "https://accounts.holedo.com/register",
      heroButtonUrl: "https://accounts.holedo.com/register",
    });

    expect(settings.loginUrl).toBe("https://accounts.holedo.com/login");
    expect(settings.signupUrl).toBe("https://accounts.holedo.com/register");
    expect(settings.heroButtonUrl).toBe(
      "https://accounts.holedo.com/register",
    );
  });
});
