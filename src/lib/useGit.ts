import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";
import type { GitStatus } from "./types";

interface GitFileStatus {
  path: string;
  status: string;
}

export function useGit(workspaceRoot: string | null) {
  const [gitStatusMap, setGitStatusMap] = useState<Map<string, GitStatus>>(new Map());
  const [isGitRepo, setIsGitRepo] = useState(false);

  const refreshGitStatus = useCallback(async () => {
    if (!workspaceRoot) {
      setGitStatusMap(new Map());
      setIsGitRepo(false);
      return;
    }
    try {
      // get_git_branch returns "" for non-git workspaces (graceful degradation)
      const branch = await invoke<string>("get_git_branch");
      const inRepo = branch.length > 0;
      setIsGitRepo(inRepo);
      if (inRepo) {
        const statuses = await invoke<GitFileStatus[]>("get_git_status");
        setGitStatusMap(new Map(statuses.map((s) => [s.path, s.status as GitStatus])));
      } else {
        setGitStatusMap(new Map());
      }
    } catch {
      setIsGitRepo(false);
      setGitStatusMap(new Map());
    }
  }, [workspaceRoot]);

  useEffect(() => {
    void refreshGitStatus();
  }, [refreshGitStatus]);

  async function handleCommit(message: string, push: boolean): Promise<void> {
    try {
      await invoke("git_commit", { message, push });
    } finally {
      void refreshGitStatus();
    }
  }

  async function getBranch(): Promise<string> {
    return invoke<string>("get_git_branch");
  }

  return { gitStatusMap, isGitRepo, refreshGitStatus, handleCommit, getBranch };
}
