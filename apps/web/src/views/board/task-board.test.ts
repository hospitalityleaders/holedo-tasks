import { describe, expect, it } from "vitest";

import type { BoardList } from "./types";
import { getCaptureList, getWorkflowLists } from "./task-board";

const makeList = (publicId: string, name: string) =>
  ({ publicId, name }) as BoardList;

describe("task board lists", () => {
  it("recognises Capture without depending on case or whitespace", () => {
    const lists = [makeList("capture", "  CAPTURE "), makeList("next", "Next")];

    expect(getCaptureList(lists)?.publicId).toBe("capture");
  });

  it("supports Inbox as a backwards-compatible capture name", () => {
    const lists = [makeList("inbox", "Inbox")];

    expect(getCaptureList(lists)?.publicId).toBe("inbox");
  });

  it("keeps the capture list out of the workflow", () => {
    const lists = [
      makeList("capture", "Capture"),
      makeList("next", "Next"),
      makeList("done", "Done"),
    ];

    expect(getWorkflowLists(lists).map((list) => list.publicId)).toEqual([
      "next",
      "done",
    ]);
  });

  it("leaves ordinary boards unchanged", () => {
    const lists = [makeList("todo", "To do"), makeList("done", "Done")];

    expect(getWorkflowLists(lists)).toBe(lists);
  });
});
