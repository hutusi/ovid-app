import { useEffect, useRef } from "react";
import { getGitSyncDescription, getGitSyncLabel, getRemoteSummary } from "../lib/gitUi";
import type { GitRemoteInfo } from "../lib/types";
import { useFocusTrap } from "../lib/useFocusTrap";
import "./Modal.css";
import "./WorkspaceSwitcher.css";

interface GitPanelProps {
  branch: string;
  remoteInfo: GitRemoteInfo;
  onCommit: () => void;
  onPush: (remoteName?: string) => void;
  onPull: () => void;
  onFetch: () => void;
  onSwitchBranch: () => void;
  onNewBranch: () => void;
  onOpenRemote: (remoteName?: string) => void;
  onCopyRemoteUrl: (remoteName?: string) => void;
  onClose: () => void;
}

export function GitPanel({
  branch,
  remoteInfo,
  onCommit,
  onPush,
  onPull,
  onFetch,
  onSwitchBranch,
  onNewBranch,
  onOpenRemote,
  onCopyRemoteUrl,
  onClose,
}: GitPanelProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>();
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const syncLabel = getGitSyncLabel(remoteInfo);
  const syncDescription = getGitSyncDescription(remoteInfo);

  useEffect(() => {
    firstActionRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  }

  return (
    <div className="modal-overlay" role="presentation">
      <button type="button" className="modal-backdrop" aria-label="Close" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Git panel"
        className="modal-panel"
        style={{ width: 440, maxWidth: "calc(100vw - 48px)" }}
        onKeyDown={handleKeyDown}
      >
        <div className="modal-branch-row">
          <p className="modal-title">Git</p>
          {syncLabel && <span className="modal-badge modal-badge-accent">{syncLabel}</span>}
        </div>

        <div className="modal-info-grid">
          <span className="modal-branch-label">Branch</span>
          <code className="modal-badge">{branch}</code>
          <span className="modal-branch-label">Tracking</span>
          <span className="modal-selection-count">{getRemoteSummary(remoteInfo)}</span>
          <span className="modal-branch-label">Status</span>
          <span className="modal-selection-count">{syncDescription}</span>
        </div>

        {remoteInfo.remotes.length > 0 && (
          <div className="ws-list">
            {remoteInfo.remotes.map((remote) => {
              const isTrackingRemote = remoteInfo.upstream?.startsWith(`${remote.name}/`) ?? false;
              const isPushRemote = remote.name === remoteInfo.remoteName;
              return (
                <div key={remote.name} className="ws-item ws-item--static">
                  <span className="ws-item-name">{remote.name}</span>
                  <span className="ws-item-path">
                    {isTrackingRemote
                      ? `${remoteInfo.upstream}${remoteInfo.aheadBehind ? ` ${remoteInfo.aheadBehind}` : ""}`
                      : isPushRemote
                        ? "Preferred push remote"
                        : (remote.url ?? "Remote URL unavailable")}
                  </span>
                  <div className="modal-inline-actions ws-inline-actions">
                    {remote.url && (
                      <>
                        <button
                          type="button"
                          className="modal-inline-btn"
                          onClick={() => onOpenRemote(remote.name)}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          className="modal-inline-btn"
                          onClick={() => onCopyRemoteUrl(remote.name)}
                        >
                          Copy URL
                        </button>
                      </>
                    )}
                    {!remoteInfo.upstream && (
                      <button
                        type="button"
                        className="modal-inline-btn"
                        onClick={() => onPush(remote.name)}
                      >
                        Push + Track
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-action-grid">
          <button
            ref={firstActionRef}
            type="button"
            className="modal-btn modal-btn-cancel"
            onClick={onCommit}
          >
            Commit
          </button>
          <button type="button" className="modal-btn modal-btn-cancel" onClick={() => onPush()}>
            Push
          </button>
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onPull}>
            Pull
          </button>
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onFetch}>
            Fetch
          </button>
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onSwitchBranch}>
            Switch branch
          </button>
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onNewBranch}>
            New branch
          </button>
        </div>

        <div className="modal-actions">
          <div className="modal-spacer" />
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
