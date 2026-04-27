import { describe, expect, it } from "bun:test";
import {
  addTabPath,
  filterRemovedTabPaths,
  MAX_OPEN_TABS,
  removeTabPath,
  reorderTabsArray,
  rewriteTabPaths,
} from "./useOpenTabs";

describe("addTabPath", () => {
  it("appends a new path", () => {
    expect(addTabPath(["a"], "b")).toEqual(["a", "b"]);
  });

  it("returns the same array when path already present", () => {
    const tabs = ["a", "b"];
    expect(addTabPath(tabs, "a")).toBe(tabs);
  });

  it("drops the oldest tab when capacity is exceeded", () => {
    const full = Array.from({ length: MAX_OPEN_TABS }, (_, i) => `t${i}`);
    const next = addTabPath(full, "new");
    expect(next).toHaveLength(MAX_OPEN_TABS);
    expect(next[0]).toBe("t1");
    expect(next[next.length - 1]).toBe("new");
  });
});

describe("removeTabPath", () => {
  it("removes the path and returns the right neighbor", () => {
    const result = removeTabPath(["a", "b", "c"], "b");
    expect(result.tabs).toEqual(["a", "c"]);
    expect(result.neighbor).toBe("c");
  });

  it("falls back to the left neighbor when removing the last tab", () => {
    const result = removeTabPath(["a", "b", "c"], "c");
    expect(result.tabs).toEqual(["a", "b"]);
    expect(result.neighbor).toBe("b");
  });

  it("returns null neighbor when the list becomes empty", () => {
    const result = removeTabPath(["a"], "a");
    expect(result.tabs).toEqual([]);
    expect(result.neighbor).toBe(null);
  });

  it("returns the same array when path is not present", () => {
    const tabs = ["a", "b"];
    const result = removeTabPath(tabs, "missing");
    expect(result.tabs).toBe(tabs);
    expect(result.neighbor).toBe(null);
  });
});

describe("reorderTabsArray", () => {
  it("moves a tab forward", () => {
    expect(reorderTabsArray(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
  });

  it("moves a tab backward", () => {
    expect(reorderTabsArray(["a", "b", "c", "d"], 3, 1)).toEqual(["a", "d", "b", "c"]);
  });

  it("returns the same array when indices are equal or out of bounds", () => {
    const tabs = ["a", "b"];
    expect(reorderTabsArray(tabs, 0, 0)).toBe(tabs);
    expect(reorderTabsArray(tabs, -1, 0)).toBe(tabs);
    expect(reorderTabsArray(tabs, 0, 5)).toBe(tabs);
  });
});

describe("rewriteTabPaths", () => {
  it("rewrites an exact path match", () => {
    expect(
      rewriteTabPaths(
        ["/ws/posts/hello.md", "/ws/posts/keep.md"],
        "/ws/posts/hello.md",
        "/ws/posts/world.md"
      )
    ).toEqual(["/ws/posts/world.md", "/ws/posts/keep.md"]);
  });

  it("rewrites paths nested under a renamed folder", () => {
    expect(
      rewriteTabPaths(["/ws/posts/hello/index.md"], "/ws/posts/hello", "/ws/posts/world")
    ).toEqual(["/ws/posts/world/index.md"]);
  });

  it("leaves unrelated paths untouched", () => {
    expect(
      rewriteTabPaths(["/ws/posts/hello-world.md"], "/ws/posts/hello", "/ws/posts/world")
    ).toEqual(["/ws/posts/hello-world.md"]);
  });
});

describe("filterRemovedTabPaths", () => {
  it("removes the exact path", () => {
    expect(filterRemovedTabPaths(["a", "b"], "a")).toEqual(["b"]);
  });

  it("removes descendants of a deleted folder", () => {
    expect(
      filterRemovedTabPaths(["/ws/posts/hello/index.md", "/ws/posts/keep.md"], "/ws/posts/hello")
    ).toEqual(["/ws/posts/keep.md"]);
  });

  it("does not remove paths that share a prefix without a slash boundary", () => {
    expect(filterRemovedTabPaths(["/ws/posts/hello-world.md"], "/ws/posts/hello")).toEqual([
      "/ws/posts/hello-world.md",
    ]);
  });
});
