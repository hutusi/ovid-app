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

  it("rewrites nested recent paths for renamed folders", () => {
    const result = rewriteRecentPaths(
      [{ path: "/workspace/content/posts/hello/index.md", name: "hello" }],
      "/workspace/content/posts/hello",
      "/workspace/content/posts/renamed"
    );
    expect(result).toEqual([{ path: "/workspace/content/posts/renamed/index.md", name: "hello" }]);
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
