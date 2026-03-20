import { Extension } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";

export function shouldLiftListItemOnBackspace(state: EditorState): boolean {
  const { selection } = state;

  if (!selection.empty) {
    return false;
  }

  const { $from } = selection;
  if ($from.parent.type.name !== "paragraph" || $from.parentOffset !== 0) {
    return false;
  }

  if ($from.parent.content.size === 0) {
    return false;
  }

  const listItemDepth = $from.depth - 1;
  if (listItemDepth < 0 || $from.node(listItemDepth).type.name !== "listItem") {
    return false;
  }

  return $from.index(listItemDepth) === 0;
}

export const ListBackspace = Extension.create({
  name: "listBackspace",

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { state, commands } = this.editor;
        if (!shouldLiftListItemOnBackspace(state)) {
          return false;
        }

        return commands.liftListItem("listItem");
      },
    };
  },
});
