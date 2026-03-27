import { useEffect } from "react";
import type { GitSyncPopoverState } from "../lib/gitUi";
import { useFocusTrap } from "../lib/useFocusTrap";
import "./Modal.css";

interface GitSyncPopoverProps {
  state: GitSyncPopoverState;
  onClose: () => void;
  onAction?: () => void;
}

export function GitSyncPopover({ state, onClose, onAction }: GitSyncPopoverProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" role="presentation">
      <button type="button" className="modal-backdrop" aria-label="Close" onClick={onClose} />
      <div
        ref={dialogRef}
        className="modal-panel git-sync-popover-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Git sync status"
      >
        <div className="git-sync-popover-header">
          <p className="modal-title">Sync status</p>
          <button
            type="button"
            className="git-sync-popover-close"
            onClick={onClose}
            aria-label="Close sync status"
          >
            ×
          </button>
        </div>
        <div className="modal-branch-row git-sync-popover-status-row">
          <span className="modal-branch-label">State</span>
          <span className="modal-badge">{state.title}</span>
        </div>
        <div className="modal-branch-row git-sync-popover-tracking-row">
          <span className="modal-branch-label">Tracking</span>
          <span className="modal-selection-count">{state.tracking}</span>
        </div>
        <p className="git-sync-popover-description">{state.description}</p>
        <div className="modal-actions git-sync-popover-actions">
          <div className="modal-spacer" />
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>
            Close
          </button>
          {state.actionLabel && onAction && (
            <button type="button" className="modal-btn modal-btn-primary" onClick={onAction}>
              {state.actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
