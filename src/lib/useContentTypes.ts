import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import type { ContentType } from "./types";

export function useContentTypes(workspaceRoot: string | null, isAmytisWorkspace: boolean) {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  useEffect(() => {
    if (!workspaceRoot || !isAmytisWorkspace) {
      setContentTypes([]);
      return;
    }
    let cancelled = false;
    invoke<ContentType[]>("get_content_types")
      .then((result) => {
        if (!cancelled) setContentTypes(result);
      })
      .catch(() => {
        if (!cancelled) setContentTypes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceRoot, isAmytisWorkspace]);

  return contentTypes;
}
