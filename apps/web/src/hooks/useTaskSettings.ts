import { useQuery } from "@tanstack/react-query";

import {
  DEFAULT_TASK_RUNTIME_SETTINGS,
  normalizeTaskRuntimeSettings,
} from "~/utils/task-settings";

export function useTaskSettings() {
  return useQuery({
    queryKey: ["task-runtime-settings"],
    queryFn: async () => {
      const response = await fetch("/api/tasks-settings");
      if (!response.ok) throw new Error("Unable to load Tasks settings");
      return normalizeTaskRuntimeSettings(await response.json());
    },
    placeholderData: DEFAULT_TASK_RUNTIME_SETTINGS,
    staleTime: 30_000,
  });
}
