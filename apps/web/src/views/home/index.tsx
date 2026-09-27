import Link from "next/link";
import { HiOutlinePlusSmall } from "react-icons/hi2";

import { authClient } from "@kan/auth/client";

import { HoledoPublicShell } from "~/components/HoledoPublicShell";
import { PageHead } from "~/components/PageHead";
import { useTaskSettings } from "~/hooks/useTaskSettings";
import { DEFAULT_TASK_RUNTIME_SETTINGS } from "~/utils/task-settings";

const boardColumns = [
  {
    name: "Capture",
    accent: "bg-[#32a3fd]",
    cards: ["Prepare weekly priorities", "Follow up with the events team"],
  },
  {
    name: "Next",
    accent: "bg-[#7dc81b]",
    cards: ["Review supplier proposal", "Confirm Friday meeting"],
  },
  {
    name: "Waiting",
    accent: "bg-[#f2b533]",
    cards: ["Menu photography approval"],
  },
  {
    name: "Done",
    accent: "bg-[#9ca4bc]",
    cards: ["Share launch notes"],
  },
];

export default function HomeView() {
  const { data: settings = DEFAULT_TASK_RUNTIME_SETTINGS } = useTaskSettings();
  const { data: session } = authClient.useSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <HoledoPublicShell settings={settings} isAuthenticated={isAuthenticated}>
      <PageHead
        title={settings.metaTitle}
        description={settings.metaDescription}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-12 sm:py-16 lg:px-14">
        <section className="mb-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold leading-tight tracking-[-0.02em] text-[#272e41] sm:text-6xl">
              {settings.heroTitle}
            </h1>
            <p className="mt-3 max-w-[820px] text-xl leading-8 text-[#7c8990]">
              {settings.heroSubtitle}
            </p>
          </div>
          <Link
            href={isAuthenticated ? "/boards" : settings.signupUrl}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start bg-[#32a3fd] px-6 text-lg font-semibold text-white transition-colors hover:bg-[#168fe8] lg:self-auto"
          >
            <HiOutlinePlusSmall className="h-6 w-6" aria-hidden="true" />
            {isAuthenticated ? "Open Tasks" : "Start capturing"}
          </Link>
        </section>

        <section className="border border-[#d9e0e5] bg-white">
          <div className="border-b border-[#dfe5e9] p-6 sm:p-8">
            <label
              htmlFor="welcome-capture"
              className="mb-2 block text-base font-semibold text-[#272e41]"
            >
              Capture
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="welcome-capture"
                type="text"
                readOnly
                placeholder="What needs to be done?"
                className="h-12 flex-1 border border-[#d8dfe5] bg-white px-4 text-base text-[#4b5660] placeholder:text-[#9ca7ad] focus:border-[#32a3fd] focus:ring-[#32a3fd]"
              />
              <Link
                href={isAuthenticated ? "/boards" : settings.loginUrl}
                className="inline-flex h-12 items-center justify-center bg-[#32a3fd] px-6 text-base font-semibold text-white transition-colors hover:bg-[#168fe8]"
              >
                Add task
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#272e41]">My Tasks</h2>
                <p className="mt-1 text-base text-[#89969d]">
                  Capture first. Decide and organise when you are ready.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {boardColumns.map((column) => (
                <div key={column.name} className="bg-[#eef2f4] p-3">
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${column.accent}`}
                    />
                    <span className="font-semibold text-[#384677]">
                      {column.name}
                    </span>
                    <span className="ml-auto text-sm text-[#99a4aa]">
                      {column.cards.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {column.cards.map((card) => (
                      <div
                        key={card}
                        className="border border-[#dce2e6] bg-white p-3 text-sm font-semibold leading-5 text-[#4b5660]"
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </HoledoPublicShell>
  );
}
