import { useEffect, useState } from "react";
import { commands } from "./commands";
import type { ContentType } from "./types";

export function useContentTypes(workspaceRoot: string | null, isAmytisWorkspace: boolean) {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  useEffect(() => {
    if (!workspaceRoot || !isAmytisWorkspace) {
      setContentTypes([]);
      return;
    }
    let cancelled = false;
    commands.contentTypes
      .get()
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
