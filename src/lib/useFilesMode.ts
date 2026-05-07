import { useEffect, useState } from "react";
import type { SidebarMode } from "../components/Sidebar";
import type { FileNode } from "./types";

const SIDEBAR_MODE_KEY_PREFIX = "ovid:sidebarMode";

interface UseFilesModeOptions {
  workspaceRootPath: string | null;
}

export function useFilesMode({ workspaceRootPath }: UseFilesModeOptions) {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("content");
  const [fileViewerNode, setFileViewerNode] = useState<FileNode | null>(null);

  // Restore sidebarMode from localStorage when the workspace changes
  useEffect(() => {
    const key = workspaceRootPath
      ? `${SIDEBAR_MODE_KEY_PREFIX}:${workspaceRootPath}`
      : SIDEBAR_MODE_KEY_PREFIX;
    const stored = localStorage.getItem(key);
    setSidebarMode(stored === "files" ? "files" : "content");
    setFileViewerNode(null);
  }, [workspaceRootPath]);

  // Persist sidebarMode whenever it changes
  useEffect(() => {
    const key = workspaceRootPath
      ? `${SIDEBAR_MODE_KEY_PREFIX}:${workspaceRootPath}`
      : SIDEBAR_MODE_KEY_PREFIX;
    localStorage.setItem(key, sidebarMode);
    if (sidebarMode === "content") {
      setFileViewerNode(null);
    }
  }, [sidebarMode, workspaceRootPath]);

  function handleToggleSidebarMode() {
    setSidebarMode((prev) => (prev === "content" ? "files" : "content"));
  }

  return {
    sidebarMode,
    fileViewerNode,
    setFileViewerNode,
    handleToggleSidebarMode,
  };
}
