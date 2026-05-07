import { describe, expect, it } from "bun:test";
import { filterRemovedRecentPaths, rewriteRecentPaths } from "./useRecentFiles";

describe("rewriteRecentPaths", () => {
  it("rewrites exact recent paths for renamed files", () => {
    const result = rewriteRecentPaths(
      [{ path: "/workspace/content/posts/hello.md", name: "hello.md" }],
      "/workspace/content/posts/hello.md",
      "/workspace/content/posts/renamed.md"
    );
    expect(result).toEqual([{ path: "/workspace/content/posts/renamed.md", name: "renamed.md" }]);
  });

  it("rewrites nested recent paths AND the label for folder-backed posts", () => {
    // Folder-backed recents (from collapseIndexNodes) carry the parent
    // folder's name as their label; renaming the folder must update both.
    const result = rewriteRecentPaths(
      [{ path: "/workspace/content/posts/hello/index.md", name: "hello" }],
      "/workspace/content/posts/hello",
      "/workspace/content/posts/renamed"
    );
    expect(result).toEqual([
      { path: "/workspace/content/posts/renamed/index.md", name: "renamed" },
    ]);
  });

  it("leaves descendant labels alone when they're not the folder's name", () => {
    // A non-index file inside a renamed folder should keep its own filename
    // as its label — only the path needs rewriting.
    const result = rewriteRecentPaths(
      [{ path: "/workspace/content/posts/hello/draft.md", name: "draft.md" }],
      "/workspace/content/posts/hello",
      "/workspace/content/posts/renamed"
    );
    expect(result).toEqual([
      { path: "/workspace/content/posts/renamed/draft.md", name: "draft.md" },
    ]);
  });

  it("leaves unrelated entries untouched", () => {
    const entries = [
      { path: "/workspace/content/posts/keep.md", name: "keep.md" },
      { path: "/workspace/content/posts/hello.md", name: "hello.md" },
    ];
    const result = rewriteRecentPaths(
      entries,
      "/workspace/content/posts/hello.md",
      "/workspace/content/posts/renamed.md"
    );
    expect(result[0]).toEqual(entries[0]);
    expect(result[1].path).toBe("/workspace/content/posts/renamed.md");
  });
});

describe("filterRemovedRecentPaths", () => {
  it("removes an exact deleted file path from recents", () => {
    const result = filterRemovedRecentPaths(
      [
        { path: "/workspace/content/posts/hello.md", name: "hello.md" },
        { path: "/workspace/content/posts/keep.md", name: "keep.md" },
      ],
      "/workspace/content/posts/hello.md"
    );
    expect(result).toEqual([{ path: "/workspace/content/posts/keep.md", name: "keep.md" }]);
  });

  it("removes deleted folder descendants from recents", () => {
    const result = filterRemovedRecentPaths(
      [
        { path: "/workspace/content/posts/hello/index.md", name: "hello" },
        { path: "/workspace/content/posts/hello/extra.md", name: "extra.md" },
        { path: "/workspace/content/posts/keep.md", name: "keep.md" },
      ],
      "/workspace/content/posts/hello"
    );
    expect(result).toEqual([{ path: "/workspace/content/posts/keep.md", name: "keep.md" }]);
  });
});
