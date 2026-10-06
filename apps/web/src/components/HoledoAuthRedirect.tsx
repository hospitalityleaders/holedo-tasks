import { useEffect } from "react";

import { PageHead } from "~/components/PageHead";
import { useTaskSettings } from "~/hooks/useTaskSettings";
import { DEFAULT_TASK_RUNTIME_SETTINGS } from "~/utils/task-settings";

export function HoledoAuthRedirect({ kind }: { kind: "login" | "signup" }) {
  const { data: settings = DEFAULT_TASK_RUNTIME_SETTINGS } = useTaskSettings();
  const destination = kind === "login" ? settings.loginUrl : settings.signupUrl;

  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return (
    <>
      <PageHead
        title={`Opening Holedo ${kind === "login" ? "Login" : "Registration"}`}
      />
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fa] px-6 text-center text-lg font-semibold text-[#384677] dark:bg-[#151820] dark:text-white">
        Opening Holedo {kind === "login" ? "Login" : "Registration"}…
      </main>
    </>
  );
}
