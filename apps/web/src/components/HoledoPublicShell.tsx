import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HiLockClosed } from "react-icons/hi2";

import type { TaskRuntimeSettings } from "@kan/shared";

interface HoledoPublicShellProps {
  children: ReactNode;
  settings: TaskRuntimeSettings;
  isAuthenticated?: boolean;
}

const isExternal = (url: string) => /^https?:\/\//i.test(url);
const themeOrder = ["light", "dark", "system"] as const;

function ThemeControl() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <span>Theme: Auto</span>;

  const activeTheme = themeOrder.includes(theme as (typeof themeOrder)[number])
    ? (theme as (typeof themeOrder)[number])
    : "system";
  const label =
    activeTheme === "system"
      ? "Auto"
      : `${activeTheme[0]!.toUpperCase()}${activeTheme.slice(1)}`;

  return (
    <button
      type="button"
      onClick={() => {
        const index = themeOrder.indexOf(activeTheme);
        setTheme(themeOrder[(index + 1) % themeOrder.length]!);
      }}
      className="hover:text-[var(--holedo-accent)]"
    >
      Theme: {label}
    </button>
  );
}

export function HoledoPublicShell({
  children,
  settings,
  isAuthenticated = false,
}: HoledoPublicShellProps) {
  useEffect(() => {
    if (document.querySelector("script[data-holedo-iubenda-policy-loader]")) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.iubenda.com/iubenda.js";
    script.async = true;
    script.dataset.holedoIubendaPolicyLoader = "true";
    document.body.appendChild(script);
  }, []);

  const primaryUrl = isAuthenticated ? "/boards" : settings.loginUrl;
  const primaryLabel = isAuthenticated ? "Open Tasks" : settings.loginLabel;

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa] text-[#272e41] dark:bg-[#151820] dark:text-[#f6f8fa]">
      <header
        className="h-[62px]"
        style={{
          backgroundColor: settings.headerBackgroundColor,
          color: settings.headerFontColor,
        }}
      >
        <div className="mx-auto flex h-full max-w-[1600px] items-center px-4 sm:px-7">
          <Link
            href="/"
            aria-label="Holedo Tasks home"
            className="mr-7 flex h-full items-center"
          >
            <Image
              src="/assets/branding/holedo-icon.png"
              alt="Holedo"
              width={58}
              height={36}
              priority
              className="h-9 w-[58px] object-contain"
            />
          </Link>

          <nav className="hidden h-full items-stretch sm:flex">
            {settings.navigation
              .filter((item) => item.enabled)
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const active = item.url === "/";
                const className = `relative flex items-center px-4 text-[15px] font-semibold transition-colors ${
                  active
                    ? "bg-black/10 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-[var(--holedo-accent)]"
                    : "opacity-70 hover:bg-black/10 hover:opacity-100"
                }`;

                return isExternal(item.url) ? (
                  <a
                    key={`${item.label}-${item.order}`}
                    href={item.url}
                    className={className}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={`${item.label}-${item.order}`}
                    href={item.url}
                    className={className}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <Link
              href={primaryUrl}
              className="flex h-10 items-center gap-2 rounded-[2px] bg-[#1f2b56] px-4 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <HiLockClosed aria-hidden="true" />
              {primaryLabel}
            </Link>
            {!isAuthenticated && (
              <Link
                href={settings.signupUrl}
                className="hidden h-10 items-center rounded-[2px] bg-[var(--holedo-accent)] px-5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 sm:flex"
              >
                {settings.signupLabel}
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="mt-auto bg-white dark:bg-[#151820]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-3 gap-y-2 px-6 py-7 text-sm text-[#7c8990] dark:text-[#8c94a5]">
          <a
            href={settings.privacyUrl}
            className="iubenda-white no-brand iubenda-noiframe iubenda-embed hover:text-[var(--holedo-accent)]"
            title="Privacy Policy"
          >
            {settings.privacyLabel}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={settings.cookieUrl}
            className="iubenda-white no-brand iubenda-noiframe iubenda-embed hover:text-[var(--holedo-accent)]"
            title="Cookie Policy"
          >
            {settings.cookieLabel}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={settings.termsUrl}
            className="iubenda-white no-brand iubenda-noiframe iubenda-embed hover:text-[var(--holedo-accent)]"
            title="Terms and Conditions"
          >
            {settings.termsLabel}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={settings.imprintUrl}
            className="hover:text-[var(--holedo-accent)]"
          >
            {settings.imprintLabel}
          </a>
          {settings.showPrivacySettings && (
            <>
              <span aria-hidden="true">·</span>
              <a
                href="#"
                className="iubenda-cs-preferences-link hover:text-[var(--holedo-accent)]"
              >
                {settings.privacySettingsLabel}
              </a>
            </>
          )}
          <span aria-hidden="true">·</span>
          <ThemeControl />
        </div>
      </footer>
    </div>
  );
}
