import { confirm } from "@tauri-apps/plugin-dialog";
import type { MutableRefObject } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { commands } from "./commands";
import { type FlatFile, flattenTree } from "./fileSearch";
import {
  createAmytisFrontmatter,
  createTodayFlowFrontmatter,
  createTypedFrontmatter,
} from "./frontmatter";
import { measureAsync } from "./perf";
import { buildPostTargetPath } from "./postPath";
import { createPostFromExistingContent } from "./postTemplate";
import { forContentMode } from "./sidebarUtils";
import type { FileNode } from "./types";
import { syncRecentDelete, syncRecentRename } from "./useRecentFiles";

interface WorkspaceResult {
  name: string;
  rootPath: string;
  treeRoot: string;
  assetRoot: string;
  tree: FileNode[];
  isAmytisWorkspace: boolean;
  cdnBase?: string;
  defaultAuthor?: string;
}

interface UseWorkspaceOptions {
  showToast: (msg: string) => void;
  flushPendingSave: () => Promise<void>;
  handleCloseFile: () => Promise<void>;
  handleSelectFile: (node: FileNode) => Promise<void>;
  selectedFile: FileNode | null;
  selectedPathRef: MutableRefObject<string | null>;
  setSelectedFile: (node: FileNode | null) => void;
  resetFileState: () => void;
  onPathRenamed?: (oldPath: string, newPath: string) => void;
  onPathRemoved?: (path: string) => void;
}

function findNode(nodes: FileNode[], path: string): FileNode | undefined {
  for (const n of nodes) {
    if (n.path === path) return n;
    if (n.children) {
      const found = findNode(n.children, path);
      if (found) return found;
    }
  }
}

export function useWorkspace({
  showToast,
  flushPendingSave,
  handleCloseFile,
  handleSelectFile,
  selectedFile,
  selectedPathRef,
  setSelectedFile,
  resetFileState,
  onPathRenamed,
  onPathRemoved,
}: UseWorkspaceOptions) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [workspaceRoot, setWorkspaceRoot] = useState<string | null>(null);
  const [workspaceRootPath, setWorkspaceRootPath] = useState<string | null>(null);
  const [isAmytisWorkspace, setIsAmytisWorkspace] = useState(false);
  const [assetRoot, setAssetRoot] = useState<string | undefined>(undefined);
  const [cdnBase, setCdnBase] = useState<string | undefined>(undefined);
  const [defaultAuthor, setDefaultAuthor] = useState<string | undefined>(undefined);
  const refreshIdRef = useRef(0);

  // Cmd+P / openFileByPath operate on the markdown-only projection of the
  // canonical tree. Derived rather than mirrored so it stays in lockstep with
  // tree mutations without explicit setFlatFiles calls.
  const flatFiles: FlatFile[] = useMemo(() => {
    if (!workspaceRoot || !workspaceRootPath) return [];
    return flattenTree(
      forContentMode(tree, { workspaceRoot: workspaceRootPath, treeRoot: workspaceRoot })
    );
  }, [tree, workspaceRoot, workspaceRootPath]);

  const refreshTree = useCallback(async (): Promise<FileNode[]> => {
    const requestId = ++refreshIdRef.current;
    try {
      const updated = (await measureAsync("list_workspace_tree.invoke", () =>
        commands.workspace.tree()
      )) as FileNode[];
      if (requestId !== refreshIdRef.current) return updated;
      setTree(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to refresh tree:", err);
      showToast(`Failed to refresh workspace: ${message}`);
      return [];
    }
  }, [showToast]);

  const applyWorkspaceResult = useCallback(
    (result: WorkspaceResult) => {
      setTree(result.tree);
      setWorkspaceName(result.name);
      setWorkspaceRoot(result.treeRoot);
      setWorkspaceRootPath(result.rootPath);
      setIsAmytisWorkspace(result.isAmytisWorkspace);
      setAssetRoot(result.assetRoot);
      setCdnBase(result.cdnBase ?? undefined);
      setDefaultAuthor(result.defaultAuthor ?? undefined);
      resetFileState();
      if (!result.isAmytisWorkspace) {
        showToast("This folder doesn't look like an Amytis workspace.");
      }
    },
    [resetFileState, showToast]
  );

  const openWorkspaceAtPath = useCallback(
    async (path: string) => {
      await flushPendingSave();
      try {
        const result = (await measureAsync(
          "open_workspace_at_path.invoke",
          () => commands.workspace.openAtPath({ path }),
          { path }
        )) as WorkspaceResult | null;
        if (result) {
          applyWorkspaceResult(result);
        } else showToast("Could not open workspace — path may no longer be valid.");
      } catch (err) {
        console.error("Failed to open workspace:", err);
        showToast(`Failed to open workspace: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
    [flushPendingSave, showToast, applyWorkspaceResult]
  );

  const handleOpenWorkspace = useCallback(async () => {
    await flushPendingSave();
    try {
      const result = (await measureAsync("open_workspace.invoke", () =>
        commands.workspace.open()
      )) as WorkspaceResult | null;
      if (result) {
        applyWorkspaceResult(result);
      }
    } catch (err) {
      console.error("Failed to open workspace:", err);
      showToast(`Failed to open workspace: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [flushPendingSave, showToast, applyWorkspaceResult]);

  const handleNewTodayFlow = useCallback(async () => {
    if (!workspaceRoot) return;
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dirPath = `${workspaceRoot}/flows/${year}/${month}`;
    const filePath = `${dirPath}/${day}.md`;
    try {
      await commands.files.ensureDir({ path: dirPath });
      try {
        await commands.files.create({ path: filePath, content: createTodayFlowFrontmatter() });
      } catch (err) {
        if (!String(err).includes("already exists")) throw err;
      }
      const updated = await refreshTree();
      const node = findNode(updated, filePath);
      if (node) await handleSelectFile(node);
    } catch (err) {
      console.error("Failed to open today's flow:", err);
      showToast(`Failed to open today's flow: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [workspaceRoot, refreshTree, handleSelectFile, showToast]);

  async function handleNewFile(dirPath: string, filename: string, contentType?: string) {
    const slug = filename.replace(/\.md$/, "");
    const filePath = `${dirPath}/${slug}.md`;
    const content = contentType
      ? createTypedFrontmatter(slug, contentType)
      : createAmytisFrontmatter(slug);
    try {
      await commands.files.create({ path: filePath, content });
      const updated = await refreshTree();
      const newNode = findNode(updated, filePath);
      if (newNode) await handleSelectFile(newNode);
    } catch (err) {
      console.error("Failed to create file:", err);
      showToast(`Failed to create file: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleRename(node: FileNode, newName: string) {
    await flushPendingSave();
    const { oldPath, newPath, folderBacked, entryFileName } = buildPostTargetPath(node, newName);
    try {
      await commands.files.rename({ oldPath, newPath });
      if (workspaceRoot) syncRecentRename(workspaceRoot, oldPath, newPath);
      onPathRenamed?.(oldPath, newPath);
      const updated = await refreshTree();
      if (selectedFile?.path === node.path) {
        const selectedPath = folderBacked ? `${newPath}/${entryFileName}` : newPath;
        const renamed = findNode(updated, selectedPath);
        if (renamed) {
          selectedPathRef.current = selectedPath;
          setSelectedFile(renamed);
        }
      } else if (selectedFile?.path.startsWith(`${oldPath}/`)) {
        const selectedPath = newPath + selectedFile.path.slice(oldPath.length);
        const renamed = findNode(updated, selectedPath);
        if (renamed) {
          selectedPathRef.current = selectedPath;
          setSelectedFile(renamed);
        }
      }
    } catch (err) {
      console.error("Failed to rename file:", err);
      showToast(`Failed to rename: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleDuplicate(node: FileNode, newName: string) {
    await flushPendingSave();
    const { oldPath, newPath, folderBacked, entryFileName } = buildPostTargetPath(node, newName);

    try {
      await commands.files.duplicate({ srcPath: oldPath, destPath: newPath });
      const updated = await refreshTree();
      const duplicatedPath = folderBacked ? `${newPath}/${entryFileName}` : newPath;
      const duplicated = findNode(updated, duplicatedPath);
      if (duplicated) {
        await handleSelectFile(duplicated);
      }
    } catch (err) {
      console.error("Failed to duplicate file:", err);
      showToast(`Failed to duplicate: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleNewFromExisting(node: FileNode, newName: string) {
    await flushPendingSave();
    const { newPath, folderBacked, entryFileName } = buildPostTargetPath(node, newName);
    const targetPath = folderBacked ? `${newPath}/${entryFileName}` : newPath;

    if (findNode(tree, newPath)) {
      showToast(`Failed to create post from existing: "${newName}" already exists`);
      return;
    }

    try {
      const raw = await commands.files.read({ path: node.path });
      const content = createPostFromExistingContent(raw);

      if (folderBacked) {
        await commands.files.ensureDir({ path: newPath });
      }

      await commands.files.create({ path: targetPath, content });
      const updated = await refreshTree();
      const created = findNode(updated, targetPath);
      if (created) {
        await handleSelectFile(created);
      }
    } catch (err) {
      console.error("Failed to create post from existing:", err);
      showToast(
        `Failed to create post from existing: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async function handleDelete(node: FileNode) {
    const targetPath = node.containerDirPath ?? node.path;
    const confirmed = await confirm(`Move "${node.name}" to Trash?`, {
      title: "Delete",
      kind: "warning",
    });
    if (!confirmed) return;
    if (selectedPathRef.current === node.path) {
      await flushPendingSave();
    }
    try {
      await commands.files.trash({ path: targetPath });
      if (workspaceRoot) syncRecentDelete(workspaceRoot, targetPath);
      onPathRemoved?.(targetPath);
      if (selectedPathRef.current === node.path) await handleCloseFile();
      await refreshTree();
    } catch (err) {
      console.error("Failed to delete file:", err);
      showToast(`Failed to delete: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    tree,
    flatFiles,
    workspaceName,
    workspaceRoot,
    workspaceRootPath,
    isAmytisWorkspace,
    assetRoot,
    cdnBase,
    defaultAuthor,
    handleOpenWorkspace,
    openWorkspaceAtPath,
    handleNewFile,
    handleNewTodayFlow,
    handleRename,
    handleDuplicate,
    handleNewFromExisting,
    handleDelete,
    refreshTree,
  };
}
