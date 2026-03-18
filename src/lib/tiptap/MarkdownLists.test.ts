import { describe, expect, it } from "bun:test";
import { TaskItem, TaskList } from "@tiptap/extension-list";

type MarkdownNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: MarkdownNode[];
  text?: string;
};

type MarkdownToken = {
  type: string;
  checked?: boolean;
  text?: string;
  items?: MarkdownToken[];
  tokens?: MarkdownToken[];
  nestedTokens?: MarkdownToken[];
  raw?: string;
};

function parseTaskMarkdown(markdown: string): MarkdownNode {
  const tokenizer = TaskList.config.markdownTokenizer;
  if (!tokenizer) {
    throw new Error("TaskList markdown tokenizer is unavailable");
  }

  const token = tokenizer.tokenize(markdown, [], {
    inlineTokens(text: string) {
      return [{ type: "text", text, raw: text }];
    },
    blockTokens(content: string) {
      return [{ type: "text", text: content, raw: content }];
    },
  });

  if (!token) {
    throw new Error("Task list markdown did not tokenize");
  }

  return parseToken(token);
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

const parserHelper = {
  createNode(type: string, attrs: Record<string, unknown>, content: MarkdownNode[] = []) {
    return { type, attrs, content };
  },
  parseChildren(tokens: MarkdownToken[]) {
    return tokens.map(parseToken);
  },
  parseInline(tokens: MarkdownToken[]) {
    return tokens.map(parseToken);
  },
};

function renderNode(node: MarkdownNode): string {
  switch (node.type) {
    case "taskList":
      return (
        TaskList.config.renderMarkdown?.(node, {
          renderChildren(nodes: MarkdownNode[]) {
            return nodes.map(renderNode).join("\n");
          },
        }) ?? ""
      );
    case "taskItem":
      return (
        TaskItem.config.renderMarkdown?.(node, {
          renderChildren(nodes: MarkdownNode[]) {
            return nodes.map(renderNode).join("");
          },
          indent(text: string) {
            return `  ${text}`;
          },
        }) ?? ""
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
});
