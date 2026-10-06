import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  HiOutlineArchiveBox,
  HiOutlineBuildingOffice2,
  HiOutlineUser,
} from "react-icons/hi2";

import { authClient } from "@kan/auth/client";

import { HoledoPublicShell } from "~/components/HoledoPublicShell";
import { PageHead } from "~/components/PageHead";
import { useTaskSettings } from "~/hooks/useTaskSettings";
import { DEFAULT_TASK_RUNTIME_SETTINGS } from "~/utils/task-settings";

const boardColumns = [
  { name: "CAPTURE", cards: ["Prepare weekly priorities", "Follow up"] },
  { name: "NEXT", cards: ["Review proposal", "Confirm meeting"] },
  { name: "WAITING", cards: ["Approval"] },
  { name: "DONE", cards: ["Launch notes"] },
];

const features = [
  {
    title: "Your own workspace",
    description:
      "Every Holedo member gets a private Tasks workspace from their first sign-in.",
    icon: HiOutlineUser,
  },
  {
    title: "One shared company",
    description:
      "Companies can bring their team into one shared workspace while personal Tasks stay private.",
    icon: HiOutlineBuildingOffice2,
  },
  {
    title: "Work stays in context",
    description:
      "Capture first, move work forward and recover anything placed in the Bin.",
    icon: HiOutlineArchiveBox,
  },
];

export default function HomeView() {
  const router = useRouter();
  const { data: settings = DEFAULT_TASK_RUNTIME_SETTINGS } = useTaskSettings();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      void router.replace("/boards");
    }
  }, [isPending, router, session?.user]);

  if (isPending || session?.user) {
    return (
      <div
        className="min-h-screen bg-[#f6f8fa] dark:bg-[#151820]"
        aria-label="Opening Holedo Tasks"
      />
    );
  }

  return (
    <HoledoPublicShell settings={settings}>
      <PageHead
        title={settings.metaTitle}
        description={settings.metaDescription}
        siteIconUrl={settings.siteIconUrl}
        openGraphImageUrl={settings.openGraphImageUrl}
      />

      <main className="flex-1">
        <section
          className="text-white"
          style={{ backgroundColor: settings.headerBackgroundColor }}
        >
          <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-6 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-14 lg:py-16">
            <div className="max-w-[650px]">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--holedo-accent)]">
                Holedo Tasks
              </p>
              <h1 className="mt-[5px] text-5xl font-bold leading-[1.04] tracking-[-0.02em] sm:text-6xl">
                {settings.heroTitle}
              </h1>
              <p className="mt-6 max-w-[610px] text-xl leading-8 text-white/75">
                {settings.heroSubtitle}
              </p>
              <Link
                href={settings.heroButtonUrl}
                className="mt-7 inline-flex h-12 items-center rounded-[2px] bg-[var(--holedo-accent)] px-6 text-lg font-semibold text-white transition-opacity hover:opacity-90"
              >
                {settings.heroButtonLabel}
                <span className="ml-2" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>

            <div className="rounded-[2px] border-2 border-[var(--holedo-accent)] bg-white/10 p-3 sm:p-5">
              <div className="rounded-[2px] bg-[#eef2f7] p-4 text-[#272e41] sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-bold">My Tasks</p>
                  <span className="rounded-[2px] bg-[#def1c6] px-2.5 py-1 text-xs font-semibold text-[#4e7c18]">
                    7 active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {boardColumns.map((column) => (
                    <div key={column.name} className="bg-[#e4e9ee] p-2">
                      <p className="mb-2 text-[10px] font-bold tracking-[0.05em] text-[#77828d]">
                        {column.name}
                      </p>
                      <div className="space-y-2">
                        {column.cards.map((card) => (
                          <div
                            key={card}
                            className="rounded-[2px] border border-[#d7dde3] bg-white p-2 text-xs font-semibold text-[#66717b]"
                          >
                            <span className="mb-1 block h-1.5 w-2/3 rounded-full bg-[#cbd3db]" />
                            {card}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t-2 border-[#fd3732] pt-3 text-[11px] font-bold uppercase tracking-[0.05em] text-[#fd3732]">
                  <span>Recoverable Bin</span>
                  <span>Completed work stays in context</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1600px] gap-5 px-6 py-12 lg:grid-cols-3 lg:px-14">
          {features.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[2px] bg-white p-6 shadow-sm dark:bg-[#20242e]"
            >
              <Icon
                className="h-8 w-8 text-[var(--holedo-accent)]"
                aria-hidden="true"
              />
              <h2 className="mt-5 text-xl font-bold text-[#272e41] dark:text-white">
                {title}
              </h2>
              <p className="mt-3 text-base leading-7 text-[#7c8990] dark:text-[#a6adba]">
                {description}
              </p>
            </article>
          ))}
        </section>
      </main>
    </HoledoPublicShell>
  );
}
