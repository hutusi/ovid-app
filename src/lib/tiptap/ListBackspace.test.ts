import { describe, expect, it } from "bun:test";
import StarterKit from "@tiptap/starter-kit";
import { Editor } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { shouldLiftListItemOnBackspace } from "./ListBackspace";

function createEditor(content: Record<string, unknown>) {
  return new Editor({
    extensions: [StarterKit],
    content,
  });
}

describe("ListBackspace", () => {
  it("detects a non-empty list item at text start", () => {
    const editor = createEditor({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "alpha" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "beta" }],
                },
              ],
            },
          ],
        },
      ],
    });

    const betaStart = 12;
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, betaStart)));

    expect(shouldLiftListItemOnBackspace(editor.state)).toBe(true);

    editor.destroy();
  });

  it("falls through when the cursor is not at the start of the list item text", () => {
    const editor = createEditor({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "alpha" }],
                },
              ],
            },
          ],
        },
      ],
    });

    const middleOfAlpha = 4;
    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, middleOfAlpha))
    );

    expect(shouldLiftListItemOnBackspace(editor.state)).toBe(false);

    editor.destroy();
  });

  it("falls through for empty list items", () => {
    const editor = createEditor({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph" }],
            },
          ],
        },
      ],
    });

    const emptyItemStart = 3;
    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, emptyItemStart))
    );

    expect(shouldLiftListItemOnBackspace(editor.state)).toBe(false);

    editor.destroy();
  });
});
