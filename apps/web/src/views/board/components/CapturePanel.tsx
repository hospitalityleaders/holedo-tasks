import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { t } from "@lingui/core/macro";
import { useMemo } from "react";
import { HiOutlineInboxArrowDown } from "react-icons/hi2";

import type { ListBodyDragData } from "../dnd/types";
import type { BoardCard, BoardList } from "../types";
import { getListBodyId } from "../dnd/ids";
import SortableCard from "./SortableCard";

interface CapturePanelProps {
  list: BoardList;
  cards: BoardCard[];
  cardPrefix: string;
  canEditCard: boolean;
  getCardHref: (cardPublicId: string) => string;
  onContextMenu: (event: React.MouseEvent, cardPublicId: string) => void;
}

export function CapturePanel({
  list,
  cards,
  cardPrefix,
  canEditCard,
  getCardHref,
  onContextMenu,
}: CapturePanelProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: getListBodyId(list.publicId),
    data: {
      type: "LIST_BODY",
      listPublicId: list.publicId,
    } satisfies ListBodyDragData,
  });
  const cardIds = useMemo(() => cards.map((card) => card.publicId), [cards]);

  return (
    <section className="z-10 mx-6 mb-4 md:mx-8" aria-label={t`Captured tasks`}>
      <div
        ref={setNodeRef}
        className={`rounded-lg border bg-light-100/90 p-3 shadow-sm transition-colors dark:bg-dark-100/90 ${
          isOver
            ? "border-light-900 ring-2 ring-light-500 dark:border-dark-900 dark:ring-dark-500"
            : "border-light-400 dark:border-dark-400"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineInboxArrowDown
              className="h-5 w-5 text-light-900 dark:text-dark-900"
              aria-hidden="true"
            />
            <h2 className="text-sm font-bold text-light-1000 dark:text-dark-1000">
              {t`Capture`}
            </h2>
          </div>
          <span className="rounded-full bg-light-300 px-2 py-0.5 text-xs font-semibold text-light-900 dark:bg-dark-300 dark:text-dark-900">
            {cards.length}
          </span>
        </div>
        <div className="max-h-52 min-h-10 overflow-y-auto pr-1">
          <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
          >
            {cards.length === 0 ? (
              <div className="flex min-h-10 items-center justify-center rounded-md border border-dashed border-light-500 text-xs text-light-800 dark:border-dark-500 dark:text-dark-800">
                {t`Newly captured tasks will wait here`}
              </div>
            ) : (
              cards.map((card) => (
                <SortableCard
                  key={card.publicId}
                  card={card}
                  listPublicId={list.publicId}
                  cardPrefix={cardPrefix}
                  cardHref={getCardHref(card.publicId)}
                  canEditCard={canEditCard}
                  onContextMenu={onContextMenu}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </section>
  );
}
