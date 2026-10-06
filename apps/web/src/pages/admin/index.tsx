import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import type { TaskRuntimeSettings } from "@kan/shared";

import { HoledoPublicShell } from "~/components/HoledoPublicShell";
import { PageHead } from "~/components/PageHead";
import { DEFAULT_TASK_RUNTIME_SETTINGS } from "~/utils/task-settings";

const fieldClass =
  "h-11 w-full rounded-[2px] border border-[#d8dfe5] bg-white px-3 text-base text-[#272e41] outline-none transition focus:border-[var(--holedo-accent)] focus:ring-2 focus:ring-[color:var(--holedo-accent)]/20 dark:border-[#3a404c] dark:bg-[#20242e] dark:text-white";
const textAreaClass = `${fieldClass} h-24 py-3`;

const Field = ({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-[#384677]">
      {label}
    </span>
    {multiline ? (
      <textarea
        className={textAreaClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    ) : (
      <input
        className={fieldClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    )}
  </label>
);

export default function TasksAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState("");
  const [settings, setSettings] = useState<TaskRuntimeSettings>(
    DEFAULT_TASK_RUNTIME_SETTINGS,
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    const response = await fetch("/api/tasks-admin/settings");
    if (!response.ok) throw new Error("Unable to load settings");
    setSettings((await response.json()) as TaskRuntimeSettings);
  };

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/tasks-admin/session");
        const result = (await response.json()) as { authenticated?: boolean };
        if (result.authenticated) {
          setAuthenticated(true);
          await loadSettings();
        }
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const connect = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/tasks-admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      setMessage(result.message ?? "Unable to connect");
      return;
    }

    setToken("");
    setAuthenticated(true);
    await loadSettings();
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/tasks-admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = (await response.json()) as
        | TaskRuntimeSettings
        | { message?: string };
      if (!response.ok) {
        setMessage(
          "message" in result
            ? (result.message ?? "Unable to save")
            : "Unable to save",
        );
        return;
      }
      setSettings(result as TaskRuntimeSettings);
      setMessage("Settings saved. The public page will update shortly.");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof TaskRuntimeSettings>(
    key: K,
    value: TaskRuntimeSettings[K],
  ) => setSettings((current) => ({ ...current, [key]: value }));

  if (checking) {
    return (
      <HoledoPublicShell settings={DEFAULT_TASK_RUNTIME_SETTINGS}>
        <div className="mx-auto max-w-5xl px-6 py-24 text-lg text-[#7c8990]">
          Checking admin access…
        </div>
      </HoledoPublicShell>
    );
  }

  if (!authenticated) {
    return (
      <HoledoPublicShell settings={DEFAULT_TASK_RUNTIME_SETTINGS}>
        <PageHead title="Tasks administration | Holedo" />
        <main className="tasks-admin mx-auto max-w-5xl px-6 py-20">
          <div className="bg-white p-9 shadow-sm sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--holedo-accent)]">
              Tasks administration
            </p>
            <h1 className="mt-[5px] text-5xl font-bold text-[#272e41]">Admin</h1>
            <p className="mt-7 text-xl text-[#97a1a8]">
              Use the server-side admin token to manage Tasks presentation
              settings.
            </p>
            <form onSubmit={connect} className="mt-8">
              <label className="block text-base font-semibold text-[#384677]">
                Admin token
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  type="password"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  className={fieldClass}
                  autoComplete="current-password"
                />
                <button
                  type="submit"
                  className="h-11 rounded-[2px] bg-[var(--holedo-accent)] px-7 text-lg font-semibold text-white hover:opacity-90"
                >
                  Connect
                </button>
              </div>
              <p className="mt-3 text-sm text-[#a7b0b7]">
                Enter the token configured in Portainer.
              </p>
              {message && <p className="mt-4 text-[#d63a36]">{message}</p>}
            </form>
          </div>
        </main>
      </HoledoPublicShell>
    );
  }

  return (
    <HoledoPublicShell settings={settings}>
      <PageHead title="Runtime settings | Holedo Tasks" />
      <main className="tasks-admin mx-auto max-w-[1400px] px-5 py-14 sm:px-8">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--holedo-accent)]">
              Tasks administration
            </p>
            <h1 className="mt-[5px] text-5xl font-bold text-[#272e41]">
              Runtime settings
            </h1>
            <p className="mt-5 text-xl text-[#7c8990]">
              Changes apply without rebuilding the Tasks image.
            </p>
          </div>
          <button
            onClick={() => {
              void fetch("/api/tasks-admin/session", { method: "DELETE" }).then(
                () => setAuthenticated(false),
              );
            }}
            className="rounded-[2px] border border-[#d8dfe5] bg-white px-5 py-2.5 font-semibold text-[#384677]"
          >
            Disconnect
          </button>
        </div>

        <form onSubmit={save} className="space-y-5">
          <section className="bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-[#272e41]">
              Public landing
            </h2>
            <p className="mt-2 text-[#8b969d]">
              The main promise shown to logged-out visitors.
            </p>
            <div className="mt-6 grid gap-5">
              <Field
                label="Headline"
                value={settings.heroTitle}
                onChange={(value) => update("heroTitle", value)}
              />
              <Field
                label="Subline"
                value={settings.heroSubtitle}
                onChange={(value) => update("heroSubtitle", value)}
                multiline
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Hero button wording"
                  value={settings.heroButtonLabel}
                  onChange={(value) => update("heroButtonLabel", value)}
                />
                <Field
                  label="Hero button destination"
                  value={settings.heroButtonUrl}
                  onChange={(value) => update("heroButtonUrl", value)}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-[#272e41]">Navigation</h2>
            <p className="mt-2 text-[#8b969d]">
              Enabled items are displayed in order in the Holedo bar.
            </p>
            <div className="mt-6 space-y-4">
              {settings.navigation.map((item, index) => (
                <div
                  key={`${index}-${item.label}`}
                  className="grid gap-3 border-b border-[#edf0f2] pb-4 md:grid-cols-[1fr_2fr_110px_auto_auto] md:items-end"
                >
                  <Field
                    label="Label"
                    value={item.label}
                    onChange={(value) => {
                      const next = [...settings.navigation];
                      next[index] = { ...item, label: value };
                      update("navigation", next);
                    }}
                  />
                  <Field
                    label="URL"
                    value={item.url}
                    onChange={(value) => {
                      const next = [...settings.navigation];
                      next[index] = { ...item, url: value };
                      update("navigation", next);
                    }}
                  />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-[#384677]">
                      Order
                    </span>
                    <input
                      type="number"
                      className={fieldClass}
                      value={item.order}
                      onChange={(event) => {
                        const next = [...settings.navigation];
                        next[index] = {
                          ...item,
                          order: Number(event.target.value),
                        };
                        update("navigation", next);
                      }}
                    />
                  </label>
                  <label className="flex h-11 items-center gap-2 font-semibold text-[#384677]">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(event) => {
                        const next = [...settings.navigation];
                        next[index] = {
                          ...item,
                          enabled: event.target.checked,
                        };
                        update("navigation", next);
                      }}
                    />
                    Enabled
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "navigation",
                        settings.navigation.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                    className="h-11 border border-[#d8dfe5] px-4 font-semibold text-[#384677]"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  update("navigation", [
                    ...settings.navigation,
                    {
                      label: "New item",
                      url: "/",
                      order: settings.navigation.length * 10,
                      enabled: true,
                    },
                  ])
                }
                className="border border-[#d8dfe5] bg-white px-5 py-2.5 font-semibold text-[#384677]"
              >
                Add menu item
              </button>
            </div>
          </section>

          <section className="grid gap-8 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="text-2xl font-bold text-[#272e41]">
                Branding, SEO and sharing
              </h2>
              <p className="mt-3 text-[#8b969d]">
                Browser and sharing assets can change without rebuilding the
                image. The Holedo header mark remains separate.
              </p>
            </div>
            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field
                  label="Accent colour"
                  value={settings.accentColor}
                  onChange={(value) => update("accentColor", value)}
                />
                <Field
                  label="Header background colour"
                  value={settings.headerBackgroundColor}
                  onChange={(value) =>
                    update("headerBackgroundColor", value)
                  }
                />
                <Field
                  label="Header font colour"
                  value={settings.headerFontColor}
                  onChange={(value) => update("headerFontColor", value)}
                />
              </div>
              <Field
                label="Meta title"
                value={settings.metaTitle}
                onChange={(value) => update("metaTitle", value)}
              />
              <Field
                label="Meta description"
                value={settings.metaDescription}
                onChange={(value) => update("metaDescription", value)}
                multiline
              />
              <Field
                label="Site icon URL (SVG or PNG)"
                value={settings.siteIconUrl}
                onChange={(value) => update("siteIconUrl", value)}
              />
              {settings.siteIconUrl && (
                <div className="flex items-center gap-4 border border-[#e2e7ec] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.siteIconUrl}
                    alt="Configured site icon preview"
                    className="h-14 w-14 rounded-[2px] object-contain"
                  />
                  <p className="text-sm text-[#7c8990]">
                    Browser icon preview. This does not replace the Holedo
                    header logo.
                  </p>
                </div>
              )}
              <Field
                label="Open Graph image URL"
                value={settings.openGraphImageUrl}
                onChange={(value) => update("openGraphImageUrl", value)}
              />
              {settings.openGraphImageUrl && (
                <div className="border border-[#e2e7ec] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.openGraphImageUrl}
                    alt="Configured social sharing preview"
                    className="max-h-52 w-full rounded-[2px] object-contain object-left"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-8 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="text-2xl font-bold text-[#272e41]">
                Access and account buttons
              </h2>
              <p className="mt-3 text-[#8b969d]">
                Keep local paths for the demo. They can point to Holedo identity
                endpoints when production SSO is enabled.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Login button wording"
                value={settings.loginLabel}
                onChange={(value) => update("loginLabel", value)}
              />
              <Field
                label="Login destination"
                value={settings.loginUrl}
                onChange={(value) => update("loginUrl", value)}
              />
              <Field
                label="Sign-up button wording"
                value={settings.signupLabel}
                onChange={(value) => update("signupLabel", value)}
              />
              <Field
                label="Sign-up destination"
                value={settings.signupUrl}
                onChange={(value) => update("signupUrl", value)}
              />
            </div>
          </section>

          <section className="grid gap-8 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="text-2xl font-bold text-[#272e41]">Legal</h2>
              <p className="mt-3 text-[#8b969d]">
                Footer links shared with the Holedo Office presentation.
              </p>
            </div>
            <div className="grid gap-5">
              <Field
                label="Privacy policy URL"
                value={settings.privacyUrl}
                onChange={(value) => update("privacyUrl", value)}
              />
              <Field
                label="Cookie policy URL"
                value={settings.cookieUrl}
                onChange={(value) => update("cookieUrl", value)}
              />
              <Field
                label="Terms URL"
                value={settings.termsUrl}
                onChange={(value) => update("termsUrl", value)}
              />
              <Field
                label="Imprint URL"
                value={settings.imprintUrl}
                onChange={(value) => update("imprintUrl", value)}
              />
            </div>
          </section>

          <section className="grid gap-8 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="text-2xl font-bold text-[#272e41]">
                Code injection
              </h2>
              <p className="mt-3 text-[#8b969d]">
                Trusted HTML, scripts, styles and verification tags. Injection
                runs on the public and signed-in product, never on this admin
                page, so the editor remains recoverable.
              </p>
            </div>
            <div className="grid gap-5">
              <Field
                label="Header code (inside head)"
                value={settings.headerCode}
                onChange={(value) => update("headerCode", value)}
                multiline
              />
              <Field
                label="Footer code (before closing body)"
                value={settings.footerCode}
                onChange={(value) => update("footerCode", value)}
                multiline
              />
            </div>
          </section>

          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[#dfe5e9] bg-[#f6f8fa]/95 py-4 sm:flex-row sm:items-center sm:justify-end">
            {message && (
              <p className="mr-auto font-semibold text-[#637178]">{message}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="h-12 rounded-[2px] bg-[var(--holedo-accent)] px-8 text-lg font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save runtime settings"}
            </button>
          </div>
        </form>
      </main>
    </HoledoPublicShell>
  );
}
