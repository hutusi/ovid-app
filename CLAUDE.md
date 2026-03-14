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
bun run validate         # Type-check + lint + test (run before committing)
bun run lint             # Biome check
bun run lint:fix         # Biome auto-fix
bun run test             # Vitest unit tests
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
- `Editor.tsx` — Tiptap WYSIWYG editor (StarterKit + Placeholder + Typography + Link + Image + tiptap-markdown)
- `Sidebar.tsx` — File tree; shows only `.md` / `.mdx` files
- `StatusBar.tsx` — Filename, word count, dark mode toggle
- `PropertiesPanel.tsx` — Collapsible bar above editor showing parsed frontmatter fields

**`src/lib/`**
- `types.ts` — Shared interfaces (`FileNode`, `WorkspaceState`)
- `frontmatter.ts` — `parseFrontmatter` / `joinFrontmatter` (raw round-trip) + `parseYamlFrontmatter` (js-yaml)
- `useTheme.ts` — Hook for system/manual dark mode; syncs to `localStorage`; applies `data-theme` on `<html>`

**`src/styles/`**
- `global.css` — CSS reset + design tokens (CSS custom properties, light + dark sets)
- `editor.css` — ProseMirror / Tiptap prose typography

**`src-tauri/`** — Rust backend (Tauri 2).
- `open_workspace` — folder picker dialog (async, tokio oneshot); walks file tree
- `read_file` / `write_file` — path-validated against workspace root; atomic saves via temp-file + rename

## Design Principles

Aesthetic:
- **Typora-style WYSIWYG** — markdown renders inline as you type; no split pane
- **Typography-first** — Georgia serif for prose, generous line height, 680px max-width
- **Minimal chrome** — sidebar collapses, no toolbar cluttering the editor
- **Keyboard-first** (goal) — all primary actions reachable without mouse

Product (non-negotiable):
- **Writing first** — every feature must justify itself against the cost of distraction it adds
- **Files stay plain** — on-disk format is always valid `.md`; no app-specific syntax or metadata bleed
- **Amytis-native** — frontmatter, content types, and publish workflow are first-class, not afterthoughts
- **Graceful degradation** — features requiring git, Rust tools, or network access fail silently and informatively
- **Keyboard reachable** — every action must have a keyboard path; mouse is optional

## Key Design Decisions

- **Tauri 2** over Electron — smaller binary, faster, no Chromium overhead
- **Tiptap v3** (ProseMirror-based) for WYSIWYG — most mature ecosystem for this use case
- **`tiptap-markdown`** for markdown serialization/deserialization
- **Bun** as runtime and package manager — consistent with the TUI sibling project
- **No shared code** with the TUI (`ovid`) — different runtime APIs; reference TUI for domain logic only
- File I/O goes through **Tauri FS plugin** (`@tauri-apps/plugin-fs`) or Rust commands — never direct Node/Bun APIs
- **All frontend state lives in `App.tsx`** — no external state library (no Zustand, Redux, etc.)
- **No editor toolbar** — keyboard-first design; don't add toolbars or button bars to the editor

## Amytis Workspace

An Amytis workspace is identified by the presence of `site.config.ts` + `content/` directory. Content files are `.md` with YAML frontmatter. Frontmatter is parsed with `js-yaml`, stripped from the editor view, and displayed in the properties panel. The raw frontmatter block is always written back verbatim to preserve formatting.

## Error Handling

- Tauri Rust commands return `Result<T, String>` — errors surface as rejected promises in the frontend
- Display errors via `console.error` or in-UI feedback; no global error boundary currently exists
- Path validation happens in Rust (`read_file` / `write_file` reject paths outside workspace root)

## Context Compression Hints

When compressing conversation history, preserve in priority order:

1. **Architecture decisions** — especially any deviations from constraints in this file
2. **Modified files and key changes** — which files changed and why
3. **Tauri command changes** — Rust-side commands being added/modified (separate from frontend)
4. **Verification status** — current `bun run validate` pass/fail state
5. **Open TODOs and rollback notes**
6. **Tool output** — can be dropped; keep pass/fail summary only

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full phased plan. Features are organized into 7 phases; complete each phase before starting the next.
