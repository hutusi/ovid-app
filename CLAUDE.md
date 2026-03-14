# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**Ovid App** is a minimalist, elegant desktop GUI application for managing [Amytis](https://github.com/hutusi/amytis) content workspaces — a native desktop alternative to Obsidian, purpose-built for the Amytis workspace format.

Built with **Tauri 2 + React + TypeScript + Vite**, using **Bun** as the package manager.

## Commands

```bash
bun install              # Install dependencies
bun run tauri dev        # Run with hot reload (requires Rust)
bun run build            # Build frontend only
bun run tauri build      # Build distributable app
bun tsc --noEmit         # Type-check without emitting
```

## Architecture

Three-zone layout managed by `src/App.tsx`:

```
┌──────────────┬──────────────────────────────────┐
│  Sidebar     │  Editor                          │
│  (file tree) │  (Tiptap WYSIWYG)                │
│  240px       │  flex: 1                         │
└──────────────┴──────────────────────────────────┘
│  StatusBar (28px, dark)                         │
└─────────────────────────────────────────────────┘
```

**`src/App.tsx`** — Root component; owns all global state (workspace, selected file, word count).

**`src/components/`**
- `Editor.tsx` — Tiptap WYSIWYG editor (StarterKit + Placeholder + Typography + Link + Image)
- `Sidebar.tsx` — File tree; shows only `.md` / `.mdx` files
- `StatusBar.tsx` — Filename + word count

**`src/lib/`**
- `types.ts` — Shared interfaces (`FileNode`, `WorkspaceState`)

**`src/styles/`**
- `global.css` — CSS reset + design tokens (CSS custom properties)
- `editor.css` — ProseMirror / Tiptap prose typography

**`src/theme.ts`** — Design tokens mirrored as TypeScript constants.

**`src-tauri/`** — Rust backend (Tauri 2). File I/O and git operations will live here as Tauri commands.

## Design Principles

- **Typora-style WYSIWYG** — markdown renders inline as you type; no split pane
- **Typography-first** — Georgia serif for prose, generous line height, 680px max-width
- **Minimal chrome** — sidebar collapses, no toolbar cluttering the editor
- **Keyboard-first** — all actions reachable without mouse
- **Files on disk are always plain `.md`** — Tiptap reads/writes markdown; Amytis workspace format is untouched

## Key Design Decisions

- **Tauri 2** over Electron — smaller binary, faster, no Chromium overhead
- **Tiptap v3** (ProseMirror-based) for WYSIWYG — most mature ecosystem for this use case
- **`tiptap-markdown`** for markdown serialization/deserialization
- **Bun** as runtime and package manager — consistent with the TUI sibling project
- **No shared code** with the TUI (`ovid-for-app`) — different runtime APIs; reference TUI for domain logic only
- File I/O goes through **Tauri FS plugin** (`@tauri-apps/plugin-fs`) or Rust commands — never direct Node/Bun APIs

## Amytis Workspace

An Amytis workspace is identified by the presence of `site.config.ts` + `content/` directory. Content files are `.md` with YAML frontmatter. Frontmatter should be parsed and stripped from the editor view (shown separately in a properties panel later).

## Roadmap (what's not built yet)

1. **Workspace open** — Tauri `dialog.open()` to pick a folder, walk file tree via Tauri FS
2. **File read/write** — load `.md` into editor, save on change (debounced)
3. **Frontmatter** — parse YAML, strip from editor, show in properties panel
4. **Dark mode** — follow system preference, toggle manually
5. **Properties panel** — right sidebar showing frontmatter fields
