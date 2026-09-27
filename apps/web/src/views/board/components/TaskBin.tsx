import { useDroppable } from "@dnd-kit/core";
import { t } from "@lingui/core/macro";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  HiOutlineArrowUturnUp,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineTrash,
} from "react-icons/hi2";

import type { BinDropData } from "../dnd/types";
import Button from "~/components/Button";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";
import { TASK_BIN_ID } from "../dnd/ids";

interface TaskBinProps {
  boardPublicId: string;
  isDraggingCard: boolean;
  canRestore: boolean;
}

export function TaskBin({
  boardPublicId,
  isDraggingCard,
  canRestore,
}: TaskBinProps) {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const { data: cards = [] } = api.card.archivedByBoard.useQuery(
    { boardPublicId },
    { enabled: !!boardPublicId },
  );
  const { setNodeRef, isOver } = useDroppable({
    id: TASK_BIN_ID,
    data: { type: "BIN" } satisfies BinDropData,
    disabled: !isDraggingCard || !canRestore,
  });

  const groups = useMemo(() => {
    const grouped = new Map<
      string,
      { listName: string; listIndex: number; cards: typeof cards }
    >();

    cards.forEach((card) => {
      const group = grouped.get(card.listPublicId) ?? {
        listName: card.listName,
        listIndex: card.listIndex,
        cards: [],
      };
      group.cards.push(card);
      grouped.set(card.listPublicId, group);
    });

    return [...grouped.values()].sort((a, b) => a.listIndex - b.listIndex);
  }, [cards]);

  const restoreCard = api.card.restore.useMutation({
    onError: () => {
      showPopup({
        header: t`Unable to restore task`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSuccess: () => {
      showPopup({
        header: t`Task restored`,
        message: t`The task is back in its original list.`,
        icon: "success",
      });
    },
    onSettled: async () => {
      await Promise.all([
        utils.card.archivedByBoard.invalidate({ boardPublicId }),
        utils.board.byId.invalidate(),
      ]);
    },
  });

  const showDropTarget = isDraggingCard && canRestore;

  return (
    <section
      ref={setNodeRef}
      className={`z-20 mx-6 mb-4 overflow-hidden rounded-lg border transition-all md:mx-8 ${
        showDropTarget
          ? isOver
            ? "border-red-700 bg-red-600 text-white ring-4 ring-red-300"
            : "border-red-500 bg-red-500 text-white"
          : "border-light-400 bg-light-50/95 dark:border-dark-400 dark:bg-dark-100/95"
      }`}
      aria-label={t`Task Bin`}
    >
      <button
        type="button"
        className={`flex w-full items-center justify-between px-4 py-3 text-left ${
          showDropTarget ? "min-h-16" : ""
        }`}
        onClick={() => !showDropTarget && setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 font-semibold">
          <HiOutlineTrash className="h-5 w-5" aria-hidden="true" />
          <span>{showDropTarget ? t`Move task to Bin` : t`Bin`}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              showDropTarget
                ? "bg-white/20 text-white"
                : "bg-light-300 text-light-900 dark:bg-dark-300 dark:text-dark-900"
            }`}
          >
            {cards.length}
          </span>
        </span>
        {!showDropTarget &&
          (isOpen ? (
            <HiOutlineChevronDown className="h-5 w-5" />
          ) : (
            <HiOutlineChevronUp className="h-5 w-5" />
          ))}
      </button>

      {isOpen && !showDropTarget && (
        <div className="border-t border-light-400 bg-red-50 p-3 dark:border-dark-400 dark:bg-red-950/20">
          {groups.length === 0 ? (
            <p className="py-3 text-center text-sm text-light-800 dark:text-dark-800">
              {t`The Bin is empty`}
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {groups.map((group) => (
                <div
                  key={`${group.listIndex}.${group.listName}`}
                  className="w-72 shrink-0 rounded-md border border-red-200 bg-white p-2 dark:border-red-900 dark:bg-dark-200"
                >
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-light-800 dark:text-dark-800">
                    {group.listName}
                  </h3>
                  <div className="space-y-2">
                    {group.cards.map((card) => (
                      <article
                        key={card.publicId}
                        className="rounded-md border border-light-400 bg-light-50 p-3 shadow-sm dark:border-dark-400 dark:bg-dark-100"
                      >
                        <p className="text-sm font-medium text-light-1000 dark:text-dark-1000">
                          {card.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-light-800 dark:text-dark-800">
                            {t`Moved ${format(card.deletedAt, "d MMM yyyy")}`}
                          </span>
                          <Button
                            type="button"
                            size="xs"
                            variant="secondary"
                            iconLeft={
                              <HiOutlineArrowUturnUp className="h-4 w-4" />
                            }
                            disabled={!canRestore}
                            isLoading={
                              restoreCard.isPending &&
                              restoreCard.variables.cardPublicId ===
                                card.publicId
                            }
                            onClick={() =>
                              restoreCard.mutate({
                                cardPublicId: card.publicId,
                              })
                            }
                          >
                            {t`Restore`}
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
