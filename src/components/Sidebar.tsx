import { useState } from "react";
import type { FileNode } from "../lib/types";

interface SidebarProps {
  tree: FileNode[];
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
  onOpenWorkspace: () => void;
  workspaceName: string | null;
  visible: boolean;
}

interface FileItemProps {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
}

function FileItem({ node, depth, selectedPath, onSelect }: FileItemProps) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = node.path === selectedPath;
  const isMarkdown = node.extension === ".md" || node.extension === ".mdx";

  if (node.isDirectory) {
    return (
      <div>
        <button
          type="button"
          className="sidebar-dir"
          style={{ paddingLeft: `${12 + depth * 14}px` }}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="sidebar-icon sidebar-chevron">{expanded ? "▾" : "▸"}</span>
          {node.name}
        </button>
        {expanded &&
          node.children?.map((child) => (
            <FileItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
      </div>
    );
  }

  if (!isMarkdown) return null;

  return (
    <button
      type="button"
      className={`sidebar-file ${isSelected ? "selected" : ""}`}
      style={{ paddingLeft: `${12 + depth * 14}px` }}
      onClick={() => onSelect(node)}
    >
      <span className="sidebar-icon">◦</span>
      {node.name.replace(/\.mdx?$/, "")}
    </button>
  );
}

export function Sidebar({
  tree,
  selectedPath,
  onSelect,
  onOpenWorkspace,
  workspaceName,
  visible,
}: SidebarProps) {
  return (
    <div className={`sidebar ${visible ? "" : "hidden"}`}>
      <div className="sidebar-header">
        <span className="sidebar-workspace-name">{workspaceName ?? "No workspace"}</span>
        <button
          type="button"
          className="sidebar-open-btn"
          onClick={onOpenWorkspace}
          title="Open workspace"
        >
          ⊕
        </button>
      </div>

      <div className="sidebar-tree">
        {tree.length === 0 ? (
          <div className="sidebar-empty">
            <p>No workspace open.</p>
            <button type="button" className="sidebar-open-workspace-btn" onClick={onOpenWorkspace}>
              Open folder
            </button>
          </div>
        ) : (
          tree.map((node) => (
            <FileItem
              key={node.path}
              node={node}
              depth={0}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
