import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export async function invokeCmd<T>(name: string, args?: object): Promise<T> {
  try {
    return await invoke<T>(name, args as Record<string, unknown> | undefined);
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error(typeof err === "string" ? err : String(err));
  }
}

export function listenEvent<T>(name: string, handler: (payload: T) => void): () => void {
  let unlisten: UnlistenFn | undefined;
  let cancelled = false;
  void listen<T>(name, (event) => {
    if (!cancelled) handler(event.payload);
  })
    .then((fn) => {
      if (cancelled) {
        fn();
      } else {
        unlisten = fn;
      }
    })
    .catch((err) => {
      console.error(`listenEvent("${name}") failed:`, err);
    });
  return () => {
    cancelled = true;
    unlisten?.();
  };
}
