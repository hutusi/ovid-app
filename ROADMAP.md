# Roadmap

Ovid App is purpose-built for content creators working in Amytis workspaces. This roadmap is organized into deliberate phases — each phase must feel complete and polished before the next begins.

---

## Completed

1. ✅ **Workspace open** — Tauri folder picker; walks file tree, auto-detects Amytis `content/` subdir
2. ✅ **File read/write** — load `.md` into editor on select; debounced atomic save (750ms); frontmatter preserved verbatim
3. ✅ **Frontmatter parsing** — YAML parsed with `js-yaml`; stripped from editor view; shown in collapsible properties panel
4. ✅ **Dark mode** — follows system preference; manual toggle in status bar; persisted in `localStorage`; no flash-of-wrong-theme
5. ✅ **Properties panel** — inline bar above editor showing title, date, tags, draft badge; collapsible

---

## ✅ Phase 1 — Core UX Polish
> Goal: make what exists feel complete and intentional. No new features until these feel right.

6. ✅ **Sidebar collapse** (`Cmd+\`) — toggle sidebar visibility to maximize writing space; animate width; remember state across sessions
7. ✅ **Directory expand/collapse** — sidebar directories currently show all children always; add click-to-toggle with chevron; persist expanded state per workspace
8. ✅ **Keyboard shortcuts** — register global shortcuts:
   - `Cmd+\` — toggle sidebar
   - `Cmd+Shift+P` — toggle properties panel
   - `Cmd+S` — force-save immediately (bypass debounce)
   - `Cmd+W` — close current file (return to blank state)
9. ✅ **Save status indicator** — subtle dot in status bar: grey = saved, amber = unsaved; never intrusive
10. ✅ **Error notifications** — replace `console.error` with a brief toast (2s, bottom-center); never block writing
11. ✅ **Empty state** — when no workspace is open or no file selected, show a calm, intentional empty state (not a blank white box)

---

## ✅ Phase 2 — File Management
> Goal: a content creator should never need to leave the app to manage files.

12. ✅ **New file** (`Cmd+N`) — create a new `.md` file; prompt for filename; auto-insert Amytis frontmatter template (`title`, `date`, `draft: true`); open immediately in editor
13. ✅ **Rename file** (`F2` or double-click filename in sidebar) — inline rename; validates no duplicate names; updates open editor tab if renaming current file
14. ✅ **Delete file** — right-click context menu or keyboard shortcut; confirmation dialog; moves to system Trash (not permanent delete)
15. ✅ **Editable properties panel** — click any field to edit inline; writes changes back to frontmatter on disk verbatim; tab between fields; `Esc` to cancel; support adding new fields
16. ✅ **New folder** — create subdirectory from sidebar; useful for organizing Amytis content collections

---

## ✅ Phase 3 — Navigation & Discovery
> Goal: moving between files should be instant and effortless.

17. ✅ **Quick file switcher** (`Cmd+P`) — fuzzy search by filename and frontmatter `title`; keyboard-navigable; shows path for disambiguation; searches across entire workspace tree
18. ✅ **Recent files** — track last 10 opened files per workspace; show in empty state and at top of switcher; persisted in `localStorage`
19. ✅ **Sidebar title display** — show frontmatter `title` instead of filename in sidebar when available; fall back to filename; reduces visual noise of slugs
20. ✅ **Sidebar draft indicator** — dim files with `draft: true`; helps distinguish published vs in-progress content at a glance

---

## ✅ Phase 4 — Search
> Goal: find anything across the workspace instantly.

21. ✅ **Full-text search** (`Cmd+Shift+F`) — search panel replaces sidebar; queries run in Rust; results show filename, matched line with context; match highlighted in result
22. ✅ **Search result navigation** — click result or matched line to open file; match highlighted in result row
23. ✅ **Frontmatter search** — full file content searched (including frontmatter); finds by tag, draft status, date, or any field value

---

## ✅ Phase 5 — Amytis Integration
> Goal: seamlessly support the full Amytis publish workflow without leaving the app.

24. ✅ **Workspace validation** — on open, detect `site.config.ts`; parse content type schema if available; warn if workspace doesn't look like an Amytis project
25. ✅ **Content type templates** — if `site.config.ts` defines content types (e.g. `post`, `page`, `note`), offer type selection when creating new files; pre-fill frontmatter fields accordingly
26. ✅ **Git status indicators** — show per-file dirty/staged/untracked markers in sidebar; requires `git` on PATH; gracefully no-ops if not a git repo
27. ✅ **Commit & push** (`Cmd+Shift+G`) — simple commit dialog: auto-filled message (`Update: <title>`), branch name shown; push toggle; runs via Rust `git` subprocess
28. ✅ **Draft → publish flow** — one-click to toggle `draft: true/false` in properties panel with a clear "Publish" affordance; auto-commits if git integration is active

---

## ✅ Phase 6 — Rich Editing
> Goal: the editor should feel as capable as it is calm.

29. ✅ **Image handling** — drag-and-drop image into editor: copy to workspace `assets/` (or configured asset dir), insert relative markdown path; show inline preview
30. ✅ **Code block syntax highlighting** — syntax-highlighted code blocks in the editor (read-only highlight; doesn't affect saved markdown)
31. ✅ **Focus / Zen mode** (`Cmd+Shift+Z`) — hide sidebar, properties panel, status bar; center editor with generous margins; `Esc` to exit
32. ✅ **Typewriter mode** — keep the active line vertically centered as you type; reduces eye movement during long writing sessions
33. ✅ **Writing session stats** — track words written in current session (not total); show +N words added in status bar

---

## ✅ Phase 7 — Polish & Power
> Goal: the details that separate a good app from one people love.

34. ✅ **Workspace persistence** — remember last opened workspace; re-open automatically on launch (with user opt-out)
35. ✅ **Multiple workspaces** — switch between recently opened workspaces without going through the folder picker every time
36. ✅ **Customizable fonts** — let users choose editor font (serif / sans / mono) and size; persisted preference
37. ✅ **Spell check** — native OS spell check via Tauri webview; highlight misspellings without disrupting writing flow
38. ✅ **Word count goal** — set a session word count target; subtle progress indicator; no gamification, just awareness
39. ✅ **Link preview** — hover over a URL to see a preview tooltip after a short delay

---

## Phase 8 — Editing Power
> Goal: close the gap between Ovid and a professional writing tool for in-document editing.

40. **Find & replace** (`Cmd+H`) — search within the current file; highlight all matches simultaneously; navigate with `Enter` / `Shift+Enter`; replace one or all; optional regex mode; closes with `Esc`
41. **Tables** — insert and edit Markdown tables inline via Tiptap table extension; `Tab` to advance cells, `Shift+Tab` to go back; add/remove rows and columns via context menu; serialized as GFM table syntax
42. **Footnotes** — `[^1]` inline syntax rendered as superscript number; footnote definitions collected at bottom of editor view; exported as standard Markdown; click footnote to jump to definition
43. **Paragraph focus mode** — dim all paragraphs except the one under the cursor; adjustable dim level; pairs naturally with zen mode and typewriter mode; toggle from status bar
44. **Text folding** — collapse / expand sections by heading level; click chevron next to any heading; folded state persisted per file; useful for long documents with many sections
45. **Math / LaTeX** — inline (`$...$`) and block (`$$...$$`) expressions rendered via KaTeX; display-only (raw LaTeX preserved in the markdown); syntax-error indicator on invalid expressions

---

## Phase 9 — Document Intelligence
> Goal: give writers insight into their own writing without leaving the flow.

46. **Reading time** — estimated reading time shown in the status bar alongside word count; calculated at ~200 wpm; updates live
47. **Writing stats panel** — sentence count, average sentence length, paragraph count, Flesch–Kincaid reading ease score; shown in a toggleable panel below the properties bar; never intrusive
48. **Grammar & style check** — integration with LanguageTool (local binary or self-hosted API); underlines grammar and style issues separately from spell check; click to see suggestion and accept/dismiss; never blocks writing
49. **Local snapshots** — automatic version history saved to `.ovid/snapshots/<filename>/` every 5 minutes and on manual save; independent of git; browse past versions in a timeline panel; one-click restore
50. **Writing streak** — track consecutive days with at least N words written (configurable threshold); subtle streak counter in the status bar; resets if a day is missed; no gamification beyond awareness
51. **Workspace-wide find & replace** — Rust-powered search across all files; preview all matches before replacing; confirm per-file or all at once; regex support; replaces the current search panel when in replace mode

---

## Phase 10 — Knowledge Graph
> Goal: turn a collection of files into a connected body of knowledge.

52. **Wikilinks** (`[[filename]]`) — type `[[` to open an inline autocomplete picker of workspace files; resolves by filename or frontmatter `title`; renders as a styled clickable link; `Cmd+Click` to navigate; serialized as standard markdown link on disk
53. **Backlinks panel** — collapsible panel below the editor listing every file in the workspace that links to the current file; shows the linking sentence for context; click to navigate; updates on save
54. **Outline view** — H1 / H2 / H3 heading tree shown in a sidebar panel (replaces file tree when toggled); click any heading to jump to it in the editor; indented to reflect nesting level; updates live as you write
55. **Tags browser** — sidebar panel listing all unique frontmatter `tags` values across the workspace with file counts; click a tag to filter the sidebar file list; multi-select to filter by multiple tags
56. **Graph view** — visual canvas of file connections via wikilinks and markdown links; nodes are files, edges are links; zoom/pan; node size reflects link count; click a node to open the file; graceful no-op with no links
57. **Calendar view** — month grid showing files by frontmatter `date`; click a date to open the file; navigate months with arrow keys; dots indicate multiple files on the same date; useful for blog-style editorial planning

---

## Phase 11 — Publishing Pipeline
> Goal: the full Amytis publish workflow — from draft to live — without leaving the app.

58. **In-app preview** (`Cmd+Shift+V`) — render the current file as it would appear on the published Amytis site; split-pane or overlay toggle; uses the site's CSS from the workspace if available; live-updates as you type
59. **Build & deploy** — trigger `amytis build` and `amytis deploy` from the command palette or a toolbar button; stream stdout/stderr to a collapsible log panel; show success / error status with timestamp; cancel in-progress builds
60. **Git history per file** — browse the full commit history for the current file in a timeline panel; view the file content at any past commit; diff against current version; one-click restore to any version
61. **Branch management** — create, switch, and delete branches from within the app; current branch name shown in the status bar; visual indicator when the branch is ahead/behind remote; fetch and pull from remote
62. **Draft scheduling** — set a future `date` in the properties panel and mark `draft: true`; Ovid shows a "scheduled" badge; optionally auto-toggles `draft: false` on the scheduled date; integrates with the calendar view
63. **SEO panel** — dedicated collapsible panel for SEO-specific frontmatter: `description`, `og:image`, `og:title`, `canonical`; character counters for `description` (optimal 120–160 chars); preview how the entry would look in a search result snippet

---

## Phase 12 — Multi-file & Workspace Power
> Goal: the app should handle real workspaces at scale — many files, many sessions.

64. **File watcher** — detect when the currently open file is modified externally (e.g. edited in another editor or by a script); prompt to reload or keep the in-memory version; uses Rust `notify` crate; no polling
65. **Tabs** — open multiple files simultaneously in a tab bar above the editor; `Cmd+T` opens a new tab, `Cmd+W` closes the current tab; drag to reorder tabs; unsaved indicator per tab; restore previous tab session on relaunch
66. **Split view** (`Cmd+Shift+\`) — divide the editor area into two independent panes; each pane has its own file, scroll position, and cursor; useful for referencing one file while writing another; resizable divider
67. **Bulk file operations** — multi-select files in the sidebar with `Shift+Click` / `Cmd+Click`; batch delete (to Trash), move to a different folder, or tag (add frontmatter `tags`); confirmation dialog for destructive operations
68. **Asset manager** — dedicated sidebar panel for browsing `assets/`; thumbnail grid for images; click to insert at cursor; drag into editor; shows file name and size; delete unused assets; configurable asset directory per workspace
69. **Drag to reorganize** — drag files and folders in the sidebar to move them; visual drop target indicator; updates disk on drop; internal links and wikilinks to moved files optionally updated automatically

---

## Phase 13 — Rich Content
> Goal: support the full range of content a modern Amytis site might contain.

70. **Mermaid diagrams** — fenced code blocks with ` ```mermaid ` rendered as live diagrams (flowcharts, sequence, Gantt, etc.); edit source in the block, preview updates inline; exported as raw mermaid fences in the markdown
71. **Math rendering** — move KaTeX from Phase 8 if deferred; ensure full equation alignment, matrix, and multi-line support; consistent rendering in both editor and in-app preview
72. **Image optimization** — on drag-drop, offer to compress images before saving to `assets/`; show original vs compressed size; configurable quality slider (default 85%); skips SVG
73. **Audio / video attachments** — drag audio or video files into the editor; copies to `assets/`; inserts an HTML5 `<audio>` or `<video>` element in the markdown; inline playback in the editor
74. **Embed previews** — paste a YouTube, Vimeo, or Twitter/X URL to get an inline preview card; stored as a markdown link on disk (no external dependency in the saved file); display-only in the editor
75. **Scratchpad** — persistent side panel for quick notes not tied to any file; survives across sessions and workspace switches; plain text only; `Cmd+Shift+S` to toggle; never saved to the workspace

---

## Phase 14 — Customization & Export
> Goal: let writers shape the tool to their own habits and share their work in any format.

76. **Export** — export the current file as HTML (with site CSS), PDF (via headless WebView print), or DOCX (via pandoc if available); export dialog with format and destination options; batch export of multiple files
77. **Custom keyboard shortcuts** — remap any named action from a settings panel; shortcuts persisted in `.ovid/keybindings.json`; conflict detection with visual warning; reset to defaults button
78. **Custom themes** — built-in preset color schemes beyond light/dark (e.g. Solarized, Nord, Rosé Pine); import a custom theme JSON; live preview before applying; export current theme
79. **Custom editor CSS** — inject user-authored CSS scoped to the editor pane; persisted in `.ovid/editor.css`; changes applied live; "reset to default" option; for writers who want precise typographic control
80. **Snippets / text expansion** — define trigger words (e.g. `;date`) that expand to text or frontmatter fragments; manage snippets from a settings panel; triggers fire on `Space` or `Tab` after the keyword
81. **Command palette** (`Cmd+Shift+K`) — search all app actions by name; keyboard-navigable; shows shortcut hints; replaces needing to memorize bindings; also accepts file names to open
82. **Settings UI** — persistent settings panel (not localStorage); organized into sections (editor, workspace, git, snippets, shortcuts, themes); import/export settings as JSON for portability across machines

---

## Phase 15 — Daily Writing Workflow
> Goal: support the habits and rituals that make writing a sustainable practice.

83. **Daily notes** (`Cmd+Shift+D`) — create or open today's note in a configurable folder (e.g. `journal/`); auto-named by date (e.g. `2026-03-15.md`); uses a user-defined template; quick-capture without leaving the current file
84. **Focus timer** — configurable Pomodoro-style writing timer visible in the status bar; set duration (default 25 min); gentle visual indicator when time is up; logs completed sessions; pairs with word count goal
85. **Starred files** — star any file from the sidebar (right-click or `Cmd+D`); starred files shown in a pinned section at the top of the sidebar and in the empty state; persisted per workspace
86. **Reading mode** — toggle a distraction-free read-only view of the current file (`Cmd+Shift+R`); no cursor, no editing affordances; clean typography; useful for proofreading; `Esc` or same shortcut to return to editing
87. **Quick capture** (menu bar) — macOS/Windows system tray icon; click to open a minimal floating input for a quick note; saved to a configurable inbox file or daily note; available even when the main window is closed

---

## Phase 16 — Extensibility & Platform
> Goal: open the app to the ecosystem and support advanced multi-workspace power users.

88. **Plugin system** — JavaScript plugins loaded from `.ovid/plugins/`; plugins can register commands, add sidebar panels, and extend the editor with custom Tiptap extensions; sandboxed with a documented API; managed from the settings UI
89. **Multiple OS windows** — open different workspaces in separate native OS windows simultaneously (`Cmd+Shift+N`); each window is fully independent; useful for referencing one workspace while writing in another
90. **Import from other tools** — import an Obsidian vault, Bear export (`.bearbak`), Ulysses sheets, or Notion Markdown export; map their internal link formats and tags to Amytis frontmatter; one-time migration wizard
91. **Cloud backup** — optional automatic backup of the workspace to iCloud Drive, Dropbox, or any configured folder; configurable frequency (on save, hourly, daily); separate from git; restores via the settings UI
