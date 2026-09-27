import type { BoardList } from "./types";

const CAPTURE_LIST_NAMES = new Set(["capture", "inbox"]);

type NamedList = Pick<BoardList, "name" | "publicId">;

export function getCaptureList<TList extends NamedList>(
  lists: TList[],
): TList | undefined {
  return lists.find((list) =>
    CAPTURE_LIST_NAMES.has(list.name.trim().toLocaleLowerCase()),
  );
}

export function getWorkflowLists(lists: BoardList[]): BoardList[] {
  const captureList = getCaptureList(lists);

  if (!captureList) return lists;

  return lists.filter((list) => list.publicId !== captureList.publicId);
}
