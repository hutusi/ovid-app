import { useCallback, useState } from "react";
import type { RecentWorkspace } from "./types";

const MAX_WORKSPACES = 5;
const STORAGE_KEY = "ovid:recentWorkspaces";

function loadWorkspaces(): RecentWorkspace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentWorkspace[]) : [];
  } catch {
    return [];
  }
}

function saveWorkspaces(workspaces: RecentWorkspace[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  } catch {
    // localStorage quota exceeded — silently ignore
  }
}

export function useRecentWorkspaces() {
  const [recentWorkspaces, setRecentWorkspaces] = useState<RecentWorkspace[]>(loadWorkspaces);

  const pushRecentWorkspace = useCallback((rootPath: string, name: string) => {
    setRecentWorkspaces((prev) => {
      const entry: RecentWorkspace = { rootPath, name, lastOpenedAt: Date.now() };
      const filtered = prev.filter((w) => w.rootPath !== rootPath);
      const next = [entry, ...filtered].slice(0, MAX_WORKSPACES);
      saveWorkspaces(next);
      return next;
    });
  }, []);

  return { recentWorkspaces, pushRecentWorkspace };
}
