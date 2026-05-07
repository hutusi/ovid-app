import type { FileNode } from "./generated/FileNode";
import type { WorkspaceResult } from "./generated/WorkspaceResult";
import { invokeCmd } from "./internal";

export interface OpenWorkspaceAtPathArgs {
  path: string;
}

export interface ListWorkspaceChildrenArgs {
  path: string;
  allFiles?: boolean;
}

export const workspace = {
  open: () => invokeCmd<WorkspaceResult | null>("open_workspace"),
  openAtPath: (args: OpenWorkspaceAtPathArgs) =>
    invokeCmd<WorkspaceResult | null>("open_workspace_at_path", args),
  list: () => invokeCmd<FileNode[]>("list_workspace"),
  listChildren: (args: ListWorkspaceChildrenArgs) =>
    invokeCmd<FileNode[]>("list_workspace_children", args),
  getRevision: () => invokeCmd<string>("get_workspace_revision"),
};
