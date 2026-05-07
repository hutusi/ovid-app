import { describe, expect, it } from "bun:test";
import type { FileNode } from "./types";
import { selectionAfterRename, selectionShouldCloseAfterRemove } from "./useEditorSession";

function makeFile(path: string): FileNode {
  return {
    name: path.split("/").pop() ?? path,
    path,
    isDirectory: false,
    extension: ".md",
  };
}

describe("selectionAfterRename", () => {
  it("returns null when nothing is selected", () => {
    expect(selectionAfterRename(null, "/a/b.md", "/a/c.md")).toBeNull();
  });

  it("returns null when the rename doesn't touch the selected path", () => {
    const sel = makeFile("/workspace/posts/keep.md");
    expect(
      selectionAfterRename(sel, "/workspace/posts/other.md", "/workspace/posts/renamed.md")
    ).toBeNull();
  });

  it("rewrites to the new path when the selected file itself is renamed", () => {
    const sel = makeFile("/workspace/posts/hello.md");
    expect(
      selectionAfterRename(sel, "/workspace/posts/hello.md", "/workspace/posts/renamed.md")
    ).toBe("/workspace/posts/renamed.md");
  });

  it("rewrites the suffix when the selected file lives under a renamed folder", () => {
    const sel = makeFile("/workspace/posts/hello/index.md");
    expect(selectionAfterRename(sel, "/workspace/posts/hello", "/workspace/posts/renamed")).toBe(
      "/workspace/posts/renamed/index.md"
    );
  });

  it("does not match a sibling whose name is a prefix (no trailing slash)", () => {
    const sel = makeFile("/workspace/posts/hello-world.md");
    // Renaming "/workspace/posts/hello" must not affect "/workspace/posts/hello-world.md"
    expect(
      selectionAfterRename(sel, "/workspace/posts/hello", "/workspace/posts/renamed")
    ).toBeNull();
  });
});

describe("selectionShouldCloseAfterRemove", () => {
  it("returns false when nothing is selected", () => {
    expect(selectionShouldCloseAfterRemove(null, "/a/b.md")).toBe(false);
  });

  it("returns true when the selected file itself is removed", () => {
    const sel = makeFile("/workspace/posts/hello.md");
    expect(selectionShouldCloseAfterRemove(sel, "/workspace/posts/hello.md")).toBe(true);
  });

  it("returns true when the selected file lives under a removed folder", () => {
    const sel = makeFile("/workspace/posts/hello/index.md");
    expect(selectionShouldCloseAfterRemove(sel, "/workspace/posts/hello")).toBe(true);
  });

  it("returns false when an unrelated file is removed", () => {
    const sel = makeFile("/workspace/posts/keep.md");
    expect(selectionShouldCloseAfterRemove(sel, "/workspace/posts/other.md")).toBe(false);
  });

  it("does not match a sibling whose name is a prefix of the removed path", () => {
    const sel = makeFile("/workspace/posts/hello-world.md");
    expect(selectionShouldCloseAfterRemove(sel, "/workspace/posts/hello")).toBe(false);
  });
});
