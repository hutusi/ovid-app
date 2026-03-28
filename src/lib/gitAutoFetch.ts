export const AUTO_FETCH_COOLDOWN_MS = 60_000;

interface AutoFetchOptions {
  focused: boolean;
  now: number;
  lastFetchedAt: number;
  cooldownMs?: number;
}

export function shouldAutoFetchOnFocus({
  focused,
  now,
  lastFetchedAt,
  cooldownMs = AUTO_FETCH_COOLDOWN_MS,
}: AutoFetchOptions): boolean {
  if (!focused) return false;
  return now - lastFetchedAt >= cooldownMs;
}

export async function runAutoFetchOnFocus(
  options: AutoFetchOptions,
  fetchRemoteStatus: () => Promise<void>
): Promise<number> {
  if (!shouldAutoFetchOnFocus(options)) {
    return options.lastFetchedAt;
  }

  try {
    await fetchRemoteStatus();
  } catch {
    // Auto-fetch is intentionally silent; manual Git actions surface errors.
  }

  return options.now;
}
