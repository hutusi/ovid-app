import { describe, expect, mock, test } from "bun:test";

// Stand-in for @tauri-apps/api/core's `invoke`. Each test resets it.
let nextInvokeImpl: (...args: unknown[]) => Promise<unknown> = () => Promise.resolve();

mock.module("@tauri-apps/api/core", () => ({
  invoke: (name: string, args?: unknown) => nextInvokeImpl(name, args),
}));

mock.module("@tauri-apps/api/event", () => ({
  listen: () => Promise.resolve(() => {}),
}));

// Import after the mock is registered so the wrapper closes over the stub.
const { invokeCmd } = await import("./internal");

describe("invokeCmd", () => {
  test("forwards the resolved value through unchanged", async () => {
    nextInvokeImpl = () => Promise.resolve({ ok: true, count: 3 });
    const result = await invokeCmd<{ ok: boolean; count: number }>("noop");
    expect(result).toEqual({ ok: true, count: 3 });
  });

  test("forwards args to invoke verbatim", async () => {
    const seen: unknown[] = [];
    nextInvokeImpl = (name, args) => {
      seen.push([name, args]);
      return Promise.resolve(undefined);
    };
    await invokeCmd<void>("write_file", { path: "a.md", content: "hi" });
    expect(seen).toEqual([["write_file", { path: "a.md", content: "hi" }]]);
  });

  test("normalises a rejected string into an Error with the string as message", async () => {
    nextInvokeImpl = () => Promise.reject("file not found");
    let caught: unknown;
    try {
      await invokeCmd<void>("read_file");
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe("file not found");
  });

  test("passes an existing Error rejection through unchanged", async () => {
    const original = new Error("upstream broke");
    nextInvokeImpl = () => Promise.reject(original);
    let caught: unknown;
    try {
      await invokeCmd<void>("noop");
    } catch (err) {
      caught = err;
    }
    // Re-thrown by reference so callers can match on the original error
    // (e.g. instanceof a custom subclass) without losing the stack.
    expect(caught).toBe(original);
  });

  test("stringifies non-string non-Error rejections into an Error", async () => {
    nextInvokeImpl = () => Promise.reject({ code: 42 });
    let caught: unknown;
    try {
      await invokeCmd<void>("noop");
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    // Standard Object.prototype.toString fallback — not pretty, but never
    // loses information vs. silently swallowing the error.
    expect((caught as Error).message).toBe("[object Object]");
  });
});
