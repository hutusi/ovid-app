import type { FileNode } from "./generated/FileNode";
import type { WorkspaceResult } from "./generated/WorkspaceResult";
import { invokeCmd } from "./internal";

export interface OpenWorkspaceAtPathArgs {
  path: string;
}

export const workspace = {
  open: () => invokeCmd<WorkspaceResult | null>("open_workspace"),
  openAtPath: (args: OpenWorkspaceAtPathArgs) =>
    invokeCmd<WorkspaceResult | null>("open_workspace_at_path", args),
  tree: () => invokeCmd<FileNode[]>("list_workspace_tree"),
  getRevision: () => invokeCmd<string>("get_workspace_revision"),
};
