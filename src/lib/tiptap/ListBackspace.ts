import { Extension } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";

export function shouldUnwrapBlockOnBackspace(state: EditorState): "listItem" | "blockquote" | null {
  const { selection } = state;

  if (!selection.empty) {
    return null;
  }

  const { $from } = selection;
  if ($from.parent.type.name !== "paragraph" || $from.parentOffset !== 0) {
    return null;
  }

  if ($from.parent.content.size === 0) {
    return null;
  }

  for (let depth = $from.depth - 1; depth >= 0; depth--) {
    const node = $from.node(depth);

    if (node.type.name === "listItem") {
      return $from.index(depth) === 0 ? "listItem" : null;
    }

    if (node.type.name === "blockquote") {
      return "blockquote";
    }
  }

  return null;
}

export const ListBackspace = Extension.create({
  name: "listBackspace",

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { state, commands } = this.editor;
        const target = shouldUnwrapBlockOnBackspace(state);
        if (!target) {
          return false;
        }

        if (target === "listItem") {
          return commands.liftListItem("listItem");
        }

        return commands.lift("blockquote");
      },
    };
  },
});
