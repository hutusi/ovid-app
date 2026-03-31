const PERF_FLAG_KEY = "ovid:perf";
const MAX_EVENTS = 40;

export interface PerfEvent {
  id: number;
  name: string;
  elapsedMs: number;
  detail?: Record<string, string | number | boolean>;
  at: number;
}

let nextPerfEventId = 1;
let perfEvents: PerfEvent[] = [];
const perfListeners = new Set<() => void>();

export function isPerfLoggingEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PERF_FLAG_KEY) === "1";
}

export function formatDetail(
  detail?: Record<string, string | number | boolean>,
  leadingSpace = true
): string {
  if (!detail) return "";
  const suffix = Object.entries(detail)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(" ");
  if (!suffix) return "";
  return leadingSpace ? ` ${suffix}` : suffix;
}

function notifyPerfListeners(): void {
  for (const listener of perfListeners) listener();
}

function pushPerfEvent(
  name: string,
  elapsedMs: number,
  detail?: Record<string, string | number | boolean>
): void {
  perfEvents = [
    {
      id: nextPerfEventId++,
      name,
      elapsedMs: Math.round(elapsedMs),
      detail,
      at: Date.now(),
    },
    ...perfEvents,
  ].slice(0, MAX_EVENTS);
  notifyPerfListeners();
}

export function getPerfEvents(): PerfEvent[] {
  return perfEvents;
}

export function subscribePerfEvents(listener: () => void): () => void {
  perfListeners.add(listener);
  return () => {
    perfListeners.delete(listener);
  };
}

export function logPerf(
  name: string,
  elapsedMs: number,
  detail?: Record<string, string | number | boolean>
): void {
  if (!isPerfLoggingEnabled()) return;
  pushPerfEvent(name, elapsedMs, detail);
  console.info(`[perf] ${name} took ${Math.round(elapsedMs)}ms${formatDetail(detail)}`);
}

export function measureSync<T>(
  name: string,
  work: () => T,
  detail?: Record<string, string | number | boolean>
): T {
  const started = performance.now();
  try {
    return work();
  } finally {
    logPerf(name, performance.now() - started, detail);
  }
}

export async function measureAsync<T>(
  name: string,
  work: () => Promise<T>,
  detail?: Record<string, string | number | boolean>
): Promise<T> {
  const started = performance.now();
  try {
    return await work();
  } finally {
    logPerf(name, performance.now() - started, detail);
  }
}
