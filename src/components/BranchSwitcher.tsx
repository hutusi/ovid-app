import { useEffect, useMemo, useRef, useState } from "react";
import { getRemoteSummary } from "../lib/gitUi";
import type { GitBranch, GitRemote, GitRemoteInfo } from "../lib/types";
import { useFocusTrap } from "../lib/useFocusTrap";
import "./Modal.css";
import "./WorkspaceSwitcher.css";

interface BranchSwitcherProps {
  branches: GitBranch[];
  remoteInfo: GitRemoteInfo;
  onSelect: (branch: string) => void;
  onCreateBranch: () => void;
  onPushAndTrack?: (remoteName: string) => void;
  onOpenRemote: (remoteName?: string) => void;
  onCopyRemoteUrl: (remoteName?: string) => void;
  onClose: () => void;
}

export function BranchSwitcher({
  branches,
  remoteInfo,
  onSelect,
  onCreateBranch,
  onPushAndTrack,
  onOpenRemote,
  onCopyRemoteUrl,
  onClose,
}: BranchSwitcherProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useFocusTrap<HTMLDivElement>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredBranches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return branches;
    return branches.filter((branch) => branch.name.toLowerCase().includes(normalized));
  }, [branches, query]);

  function getRemoteMeta(remote: GitRemote): string {
    if (remoteInfo.upstream?.startsWith(`${remote.name}/`)) {
      return `${remoteInfo.upstream}${remoteInfo.aheadBehind ? ` ${remoteInfo.aheadBehind}` : ""}`;
    }
    if (remote.name === remoteInfo.remoteName) {
      return "Preferred push remote";
    }
    return remote.url ?? "Remote URL unavailable";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key === "Enter" && filteredBranches.length > 0) {
      e.preventDefault();
      onSelect(filteredBranches[0].name);
    }
  }

  return (
    <div className="modal-overlay" role="presentation">
      <button type="button" className="modal-backdrop" aria-label="Close" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Switch branch"
        className="modal-panel"
        style={{ width: 420, maxWidth: "calc(100vw - 48px)" }}
        onKeyDown={handleKeyDown}
      >
        <p className="modal-title">Switch branch</p>

        {(remoteInfo.upstream || remoteInfo.remotes.length > 0) && (
          <div className="modal-branch-row">
            <span className="modal-branch-label">Tracking</span>
            <div className="modal-inline-actions">
              <span className="modal-selection-count">{getRemoteSummary(remoteInfo)}</span>
              {!remoteInfo.upstream && remoteInfo.remoteName && onPushAndTrack && (
                <button
                  type="button"
                  className="modal-inline-btn"
                  onClick={() => onPushAndTrack(remoteInfo.remoteName as string)}
                >
                  Push + Track
                </button>
              )}
              {remoteInfo.remoteUrl && (
                <>
                  <button
                    type="button"
                    className="modal-inline-btn"
                    onClick={() => onOpenRemote(remoteInfo.remoteName ?? undefined)}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="modal-inline-btn"
                    onClick={() => onCopyRemoteUrl(remoteInfo.remoteName ?? undefined)}
                  >
                    Copy URL
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {remoteInfo.remotes.length > 1 && (
          <div className="ws-list">
            {remoteInfo.remotes.map((remote) => (
              <div key={remote.name} className="ws-item ws-item--static">
                <span className="ws-item-name">{remote.name}</span>
                <span className="ws-item-path">{getRemoteMeta(remote)}</span>
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
                  {!remoteInfo.upstream && onPushAndTrack && (
                    <button
                      type="button"
                      className="modal-inline-btn"
                      onClick={() => onPushAndTrack(remote.name)}
                    >
                      Push + Track
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <input
          ref={inputRef}
          className="modal-input"
          aria-label="Search branches"
          value={query}
          placeholder="Search branches"
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="ws-list">
          {filteredBranches.map((branch) => (
            <button
              key={branch.name}
              type="button"
              className={`ws-item${branch.isCurrent ? " ws-item--active" : ""}`}
              onClick={() => onSelect(branch.name)}
            >
              <span className="ws-item-name">{branch.name}</span>
              <span className="ws-item-path">
                {branch.upstream
                  ? `${branch.upstream}${branch.aheadBehind ? ` ${branch.aheadBehind}` : ""}`
                  : "No upstream"}
              </span>
              {branch.isCurrent && <span className="ws-item-badge">current</span>}
            </button>
          ))}
          {filteredBranches.length === 0 && <p className="ws-empty">No branches match.</p>}
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onCreateBranch}>
            New branch…
          </button>
          <div className="modal-spacer" />
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
