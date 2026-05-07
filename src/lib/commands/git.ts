import type { GitBranch } from "./generated/GitBranch";
import type { GitCommitChange } from "./generated/GitCommitChange";
import type { GitFileStatus } from "./generated/GitFileStatus";
import type { GitRemoteBranch } from "./generated/GitRemoteBranch";
import type { GitRemoteInfo } from "./generated/GitRemoteInfo";
import { invokeCmd } from "./internal";

export interface GitCommitArgs {
  message: string;
  push: boolean;
  paths: string[];
}

export interface GitPushArgs {
  remoteName?: string;
}

export interface GitSwitchBranchArgs {
  branch: string;
}

export interface GitCreateBranchArgs {
  branch: string;
}

export interface GitRenameBranchArgs {
  oldBranch: string;
  newBranch: string;
}

export interface GitDeleteBranchArgs {
  branch: string;
}

export interface GitCheckoutRemoteBranchArgs {
  remoteRef: string;
}

export interface GitOpenRemoteArgs {
  remoteName?: string;
}

export const git = {
  status: () => invokeCmd<GitFileStatus[]>("get_git_status"),
  commitChanges: () => invokeCmd<GitCommitChange[]>("get_git_commit_changes"),
  branch: () => invokeCmd<string>("get_git_branch"),
  branches: () => invokeCmd<GitBranch[]>("get_git_branches"),
  remoteBranches: () => invokeCmd<GitRemoteBranch[]>("get_git_remote_branches"),
  remoteInfo: () => invokeCmd<GitRemoteInfo>("get_git_remote_info"),
  commit: (args: GitCommitArgs) => invokeCmd<void>("git_commit", args),
  push: (args?: GitPushArgs) => invokeCmd<void>("git_push", args),
  pull: () => invokeCmd<void>("git_pull"),
  fetch: () => invokeCmd<void>("git_fetch"),
  switchBranch: (args: GitSwitchBranchArgs) => invokeCmd<void>("git_switch_branch", args),
  createBranch: (args: GitCreateBranchArgs) => invokeCmd<void>("git_create_branch", args),
  renameBranch: (args: GitRenameBranchArgs) => invokeCmd<void>("git_rename_branch", args),
  deleteBranch: (args: GitDeleteBranchArgs) => invokeCmd<void>("git_delete_branch", args),
  checkoutRemoteBranch: (args: GitCheckoutRemoteBranchArgs) =>
    invokeCmd<void>("git_checkout_remote_branch", args),
  openRemote: (args?: GitOpenRemoteArgs) => invokeCmd<void>("open_git_remote", args),
};
