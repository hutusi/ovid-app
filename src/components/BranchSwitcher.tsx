import { useEffect, useMemo, useRef, useState } from "react";
import type { GitBranch } from "../lib/types";
import { useFocusTrap } from "../lib/useFocusTrap";
import "./Modal.css";
import "./WorkspaceSwitcher.css";

interface BranchSwitcherProps {
  branches: GitBranch[];
  onSelect: (branch: string) => void;
  onCreateBranch: () => void;
  onClose: () => void;
}

export function BranchSwitcher({
  branches,
  onSelect,
  onCreateBranch,
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
