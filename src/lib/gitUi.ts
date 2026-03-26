import type { GitRemoteInfo } from "./types";

export function getPushSuccessMessage(remoteInfo: GitRemoteInfo): string {
  return !remoteInfo.upstream && remoteInfo.remoteName
    ? "Pushed and set upstream"
    : "Pushed to remote";
}

export function getGitSyncLabel(remoteInfo: GitRemoteInfo): string | null {
  if (remoteInfo.aheadBehind === ">") return "Ahead";
  if (remoteInfo.aheadBehind === "<") return "Behind";
  if (remoteInfo.aheadBehind === "<>") return "Diverged";
  if (!remoteInfo.upstream && remoteInfo.remoteName) return "No upstream";
  if (!remoteInfo.upstream && !remoteInfo.remoteName && remoteInfo.remotes.length > 1) {
    return "Choose remote";
  }
  return null;
}

export function getGitSyncDescription(remoteInfo: GitRemoteInfo): string {
  if (remoteInfo.aheadBehind === ">") return "Local commits are ahead of the upstream branch.";
  if (remoteInfo.aheadBehind === "<") return "Remote commits are available to pull.";
  if (remoteInfo.aheadBehind === "<>") return "Local and remote branches have diverged.";
  if (!remoteInfo.upstream && remoteInfo.remoteName) {
    return `Push once to start tracking ${remoteInfo.remoteName}.`;
  }
  if (!remoteInfo.upstream && !remoteInfo.remoteName && remoteInfo.remotes.length > 1) {
    return "Choose a remote before setting upstream.";
  }
  return "Branch is in sync with its configured tracking branch.";
}

export function getRemoteSummary(remoteInfo: GitRemoteInfo): string {
  if (remoteInfo.upstream) {
    return remoteInfo.upstream;
  }
  if (remoteInfo.remoteName) {
    return `${remoteInfo.remoteName}${remoteInfo.aheadBehind ? ` ${remoteInfo.aheadBehind}` : ""}`;
  }
  if (remoteInfo.remotes.length > 1) {
    return `${remoteInfo.remotes.length} remotes configured`;
  }
  if (remoteInfo.remotes.length === 1) {
    return remoteInfo.remotes[0].name;
  }
  return "No upstream";
}

export function getGitBranchTitle(branch: string, remoteInfo: GitRemoteInfo): string {
  return [
    `Current branch: ${branch}`,
    remoteInfo.upstream ? `Upstream: ${remoteInfo.upstream}` : "No upstream configured",
    !remoteInfo.upstream && remoteInfo.remoteName ? `Push remote: ${remoteInfo.remoteName}` : null,
    !remoteInfo.upstream && !remoteInfo.remoteName && remoteInfo.remotes.length > 1
      ? `Remotes: ${remoteInfo.remotes.map((remote) => remote.name).join(", ")}`
      : null,
    remoteInfo.aheadBehind ? `Tracking: ${remoteInfo.aheadBehind}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
