import type { GitRemoteInfo } from "./types";

export function getPushSuccessMessage(remoteInfo: GitRemoteInfo): string {
  return !remoteInfo.upstream && remoteInfo.remoteName
    ? "Pushed and set upstream"
    : "Pushed to remote";
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
