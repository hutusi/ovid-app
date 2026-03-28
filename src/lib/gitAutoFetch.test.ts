import { describe, expect, it, mock } from "bun:test";
import {
  AUTO_FETCH_COOLDOWN_MS,
  runAutoFetchOnFocus,
  shouldAutoFetchOnFocus,
} from "./gitAutoFetch";

describe("shouldAutoFetchOnFocus", () => {
  it("returns false when the window is not focused", () => {
    expect(
      shouldAutoFetchOnFocus({
        focused: false,
        now: AUTO_FETCH_COOLDOWN_MS,
        lastFetchedAt: 0,
      })
    ).toBe(false);
  });

  it("returns false when the cooldown has not elapsed", () => {
    expect(
      shouldAutoFetchOnFocus({
        focused: true,
        now: AUTO_FETCH_COOLDOWN_MS - 1,
        lastFetchedAt: 0,
      })
    ).toBe(false);
  });

  it("returns true when focus is regained after the cooldown", () => {
    expect(
      shouldAutoFetchOnFocus({
        focused: true,
        now: AUTO_FETCH_COOLDOWN_MS,
        lastFetchedAt: 0,
      })
    ).toBe(true);
  });
});

describe("runAutoFetchOnFocus", () => {
  it("runs fetch and returns the new timestamp when eligible", async () => {
    const fetchRemoteStatus = mock(async () => {});

    await expect(
      runAutoFetchOnFocus(
        {
          focused: true,
          now: AUTO_FETCH_COOLDOWN_MS,
          lastFetchedAt: 0,
        },
        fetchRemoteStatus
      )
    ).resolves.toBe(AUTO_FETCH_COOLDOWN_MS);

    expect(fetchRemoteStatus).toHaveBeenCalledTimes(1);
  });

  it("does not run fetch before the cooldown", async () => {
    const fetchRemoteStatus = mock(async () => {});

    await expect(
      runAutoFetchOnFocus(
        {
          focused: true,
          now: AUTO_FETCH_COOLDOWN_MS - 1,
          lastFetchedAt: 0,
        },
        fetchRemoteStatus
      )
    ).resolves.toBe(0);

    expect(fetchRemoteStatus).not.toHaveBeenCalled();
  });

  it("swallows fetch failures and still advances the timestamp", async () => {
    const fetchRemoteStatus = mock(async () => {
      throw new Error("network down");
    });

    await expect(
      runAutoFetchOnFocus(
        {
          focused: true,
          now: AUTO_FETCH_COOLDOWN_MS,
          lastFetchedAt: 0,
        },
        fetchRemoteStatus
      )
    ).resolves.toBe(AUTO_FETCH_COOLDOWN_MS);

    expect(fetchRemoteStatus).toHaveBeenCalledTimes(1);
  });
});
