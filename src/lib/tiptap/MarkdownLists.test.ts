import { describe, expect, it } from "bun:test";
import type {
  JSONContent,
  MarkdownLexerConfiguration,
  MarkdownParseHelpers,
  MarkdownRendererHelpers,
  MarkdownToken,
  RenderContext,
} from "@tiptap/core";
import { TaskItem, TaskList } from "@tiptap/extension-list";

type MarkdownNode = JSONContent;

function parseTaskMarkdown(markdown: string): MarkdownNode {
  const tokenizer = TaskList.config.markdownTokenizer;
  if (!tokenizer) {
    throw new Error("TaskList markdown tokenizer is unavailable");
  }

  const lexer: MarkdownLexerConfiguration = {
    inlineTokens(text: string) {
      return [{ type: "text", text, raw: text } as MarkdownToken];
    },
    blockTokens(content: string) {
      return [{ type: "text", text: content, raw: content } as MarkdownToken];
    },
  };

  const token = tokenizer.tokenize(markdown, [], lexer);

  if (!token) {
    throw new Error("Task list markdown did not tokenize");
  }

  return parseToken(token as MarkdownToken);
}

function parseToken(token: MarkdownToken): MarkdownNode {
  switch (token.type) {
    case "taskList":
      return TaskList.config.parseMarkdown?.(token, parserHelper) as MarkdownNode;
    case "taskItem":
      return TaskItem.config.parseMarkdown?.(token, parserHelper) as MarkdownNode;
    case "text":
      return { type: "text", text: token.text ?? token.raw ?? "" };
    default:
      throw new Error(`Unsupported token type: ${token.type}`);
  }
}

const parserHelper: MarkdownParseHelpers = {
  createNode(type: string, attrs?: Record<string, unknown>, content: MarkdownNode[] = []) {
    return { type, attrs, content };
  },
  createTextNode(text: string, marks = []) {
    return marks.length > 0 ? { type: "text", text, marks } : { type: "text", text };
  },
  applyMark(markType: string, content: MarkdownNode[], attrs?: Record<string, unknown>) {
    return { mark: markType, content, attrs };
  },
  parseChildren(tokens: MarkdownToken[]) {
    return tokens.map(parseToken);
  },
  parseInline(tokens: MarkdownToken[]) {
    return tokens.map(parseToken);
  },
};

const renderContext: RenderContext = {
  index: 0,
  level: 0,
  parentType: null,
};

function renderNode(node: MarkdownNode): string {
  switch (node.type) {
    case "taskList":
      return (
        TaskList.config.renderMarkdown?.(
          node,
          {
            renderChildren(nodes: MarkdownNode[]) {
              return nodes.map(renderNode).join("\n");
            },
          } as MarkdownRendererHelpers,
          renderContext
        ) ?? ""
      );
    case "taskItem":
      return (
        TaskItem.config.renderMarkdown?.(
          node,
          {
            renderChildren(nodes: MarkdownNode[]) {
              return nodes.map(renderNode).join("");
            },
            indent(text: string) {
              return `  ${text}`;
            },
          } as MarkdownRendererHelpers,
          renderContext
        ) ?? ""
      );
    case "paragraph":
      return (node.content ?? []).map(renderNode).join("");
    case "text":
      return node.text ?? "";
    default:
      throw new Error(`Unsupported node type: ${node.type}`);
  }
}

describe("task list markdown support", () => {
  it("round-trips task list checked state", () => {
    const markdown = ["- [ ] draft intro", "- [x] ship update"].join("\n");

    expect(renderNode(parseTaskMarkdown(markdown))).toBe(markdown);
  });

  it("round-trips nested task lists", () => {
    const markdown = [
      "- [ ] launch",
      "  - [x] write changelog",
      "  - [ ] post release notes",
      "- [x] archive beta notes",
    ].join("\n");

    expect(renderNode(parseTaskMarkdown(markdown))).toBe(markdown);
  });

  it("serializes checked-state changes back to markdown", () => {
    const unchecked = {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "draft intro" }],
            },
          ],
        },
      ],
    };
    const checked = {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "draft intro" }],
            },
          ],
        },
      ],
    };

    expect(renderNode(unchecked)).toBe("- [ ] draft intro");
    expect(renderNode(checked)).toBe("- [x] draft intro");
  });
});
