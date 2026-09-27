import { t } from "@lingui/core/macro";
import { useState } from "react";
import { HiOutlineBolt } from "react-icons/hi2";

import { generateUID } from "@kan/shared/utils";

import type { RouterInputs } from "~/utils/api";
import Button from "~/components/Button";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

interface CaptureBarProps {
  listPublicId?: string;
  queryParams: RouterInputs["board"]["byId"];
  canCreateCard: boolean;
}

export function CaptureBar({
  listPublicId,
  queryParams,
  canCreateCard,
}: CaptureBarProps) {
  const [title, setTitle] = useState("");
  const utils = api.useUtils();
  const { showPopup } = usePopup();

  const createCard = api.card.create.useMutation({
    onMutate: async (args) => {
      await utils.board.byId.cancel(queryParams);
      const previousState = utils.board.byId.getData(queryParams);

      utils.board.byId.setData(queryParams, (oldBoard) => {
        if (!oldBoard) return oldBoard;

        return {
          ...oldBoard,
          lists: oldBoard.lists.map((list) => {
            if (list.publicId !== args.listPublicId) return list;

            const placeholder = {
              publicId: `PLACEHOLDER_${generateUID()}`,
              title: args.title,
              listId: 0,
              description: "",
              dueDate: null,
              cardNumber: null,
              comments: [],
              checklists: [],
              attachments: [],
              labels: [],
              members: [],
              _filteredLabels: [],
              _filteredMembers: [],
              index: 0,
            };

            return {
              ...list,
              cards: [
                placeholder,
                ...list.cards.map((card, index) => ({
                  ...card,
                  index: index + 1,
                })),
              ],
            };
          }),
        };
      });

      return { previousState };
    },
    onError: (_error, _args, context) => {
      utils.board.byId.setData(queryParams, context?.previousState);
      showPopup({
        header: t`Unable to capture task`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSuccess: () => setTitle(""),
    onSettled: async () => {
      await utils.board.byId.invalidate(queryParams);
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !listPublicId || !canCreateCard) return;

    createCard.mutate({
      title: trimmedTitle,
      description: "",
      listPublicId,
      labelPublicIds: [],
      memberPublicIds: [],
      position: "start",
      dueDate: null,
    });
  };

  return (
    <form
      onSubmit={submit}
      className="z-10 mx-6 mb-4 flex flex-col gap-2 rounded-lg border border-light-400 bg-light-50/95 p-3 shadow-sm backdrop-blur dark:border-dark-400 dark:bg-dark-100/95 md:mx-8 md:flex-row md:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="rounded-md bg-light-200 p-2 text-light-1000 dark:bg-dark-300 dark:text-dark-1000">
          <HiOutlineBolt className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <label htmlFor="quick-capture" className="sr-only">
            {t`Capture a task`}
          </label>
          <input
            id="quick-capture"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t`What needs your attention?`}
            disabled={!canCreateCard || !listPublicId || createCard.isPending}
            className="w-full border-0 bg-transparent p-0 text-sm font-medium text-light-1000 placeholder:text-light-800 focus:ring-0 focus-visible:outline-none dark:text-dark-1000 dark:placeholder:text-dark-800"
          />
          <p className="mt-0.5 hidden text-xs text-light-800 dark:text-dark-800 sm:block">
            {t`Get it out of your head. Organise it when you're ready.`}
          </p>
        </div>
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={!title.trim() || !canCreateCard || !listPublicId}
        isLoading={createCard.isPending}
      >
        {t`Capture`}
      </Button>
    </form>
  );
}
