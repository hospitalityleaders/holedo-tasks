import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiLockClosed } from "react-icons/hi2";

import type { TaskRuntimeSettings } from "@kan/shared";

interface HoledoPublicShellProps {
  children: ReactNode;
  settings: TaskRuntimeSettings;
  isAuthenticated?: boolean;
}

const isExternal = (url: string) => /^https?:\/\//i.test(url);

export function HoledoPublicShell({
  children,
  settings,
  isAuthenticated = false,
}: HoledoPublicShellProps) {
  const primaryUrl = isAuthenticated ? "/boards" : settings.loginUrl;
  const primaryLabel = isAuthenticated ? "Open Tasks" : settings.loginLabel;

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa] text-[#272e41]">
      <header className="h-[62px] bg-[#384677] text-white shadow-sm">
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
                    ? "bg-[#435285] text-white after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-[#32a3fd]"
                    : "text-[#c4cada] hover:bg-[#435285] hover:text-white"
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
              className="flex h-10 items-center gap-2 bg-[#1f2b56] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#182348]"
            >
              <HiLockClosed aria-hidden="true" />
              {primaryLabel}
            </Link>
            {!isAuthenticated && (
              <Link
                href={settings.signupUrl}
                className="hidden h-10 items-center bg-[#32a3fd] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#168fe8] sm:flex"
              >
                {settings.signupLabel}
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="mt-auto border-t border-[#e2e7ec] bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-6 py-7 text-sm text-[#7c8990] sm:flex-row sm:items-center sm:justify-between">
          <p>Holedo Tasks · Capture, organise, complete.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={settings.privacyUrl}>Privacy</a>
            <a href={settings.cookieUrl}>Cookies</a>
            <a href={settings.termsUrl}>Terms</a>
            <a href={settings.imprintUrl}>Imprint</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
