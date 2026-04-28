# Changelog

All notable changes to Ovid will be documented in this file.

The format is based on Keep a Changelog, adapted to match the project's
release cadence and Conventional Commit history.

## 0.11.0 - 2026-04-28

### Added
- Open-file tab bar above the editor with drag-to-reorder, middle-click or close-button to close,
  per-workspace persistence, and active tab scroll-into-view; hidden in zen mode and only shown
  with two or more open tabs.
- Properties panel now appears for files with no frontmatter, showing an empty state with
  add-field prompts so frontmatter can be created from scratch.
- Schema-aware metadata insertion and typed custom metadata dialog for Amytis content types.
- New-from-existing post workflow: create a post pre-populated from an existing file's content,
  with dates and draft status reset.
- Post duplication from the sidebar context menu ("Make a Copy").
- Status bar path rename flow for quick in-place file renaming.

### Changed
- Sidebar filter replaced with an integrated pill-style search field: Search icon prefix, subtle
  tinted background, accent focus ring on `:focus-within`, and an X clear button.
  Autocorrect, autocapitalize, and spellcheck disabled so filenames are not rewritten by macOS.
- Folder-backed posts (a directory containing `index.md`) are now shown as a single content item
  in the sidebar rather than as a raw directory.
- Sidebar rename is now routed through the path rename dialog for consistency with the status bar
  flow.
- Sidebar folder headers no longer use uppercase styling.
- Selected file is now revealed in the sidebar by force-expanding all ancestor folders when
  navigating between files.
- Expanded folder state is lazy-loaded on restore so unloaded directories are fetched on demand.
- Metadata panel improvements: boolean fields rendered as checkboxes, removal controls added,
  frontmatter keys canonicalized, custom field values preserve their original type semantics.
- Draft control moved into the publishing metadata section of the properties panel.
- Close-file menu item respects the tab bar the same way Cmd+W does.
- Status bar file controls aligned with git action layout.

### Fixed
- File deletion confirmation now uses Tauri's native async dialog so the delete no longer runs
  before the user acknowledges the prompt (the browser `window.confirm` is non-blocking in
  Tauri's WKWebView).
- `handleDelete` reads the active path from `selectedPathRef` after the async confirm returns
  rather than using a potentially stale closure snapshot.
- Duplicate of folder-backed index posts now uses the correct entry filename.
- Windows path separators normalized to forward slashes in paths emitted to the frontend.
- Windows git actions no longer flash console windows in front of the app.
- Amytis `cdnBaseUrl` images now resolve correctly in the editor.

## 0.10.0 - 2026-04-21

### Added
- Keyboard-first workspace and file navigation with workspace switcher, file switcher, and
  full-text search.
- Markdown editing with frontmatter-aware properties, Typora-style rich editing, code blocks,
  tables, images, links, footnotes, and structural editing behavior.
- Amytis-oriented content workflows including content types, draft/publish handling, and
  writing-focused workspace behavior.
- Built-in Git workflow support for status, commit, branch switching, fetch, pull, push, and
  remote actions.
- In-app manual update checks and updater infrastructure for signed release bundles, stable
  `latest.json` publishing, and end-to-end Windows plus local macOS release operations.

### Changed
- Improved release and packaging workflows with Windows CI publishing, local macOS automation,
  bundled app branding, and clearer release operator documentation.
- Refined the desktop app presentation with the first Ovid app logo and regenerated packaged
  icon set.
- Continued stabilization and performance work across workspace opening, sidebar loading, search,
  editing, and save flows.

### Known Limits
- macOS public distribution is still limited by the missing Apple signing and notarization work.
- Some release and updater steps are still optimized for careful operator-driven publishing rather
  than fully automated public distribution.

## 0.10.0 - 2026-04-21

### Added
- Keyboard-first workspace and file navigation with workspace switcher, file switcher, and
  full-text search.
- Markdown editing with frontmatter-aware properties, Typora-style rich editing, code blocks,
  tables, images, links, footnotes, and structural editing behavior.
- Amytis-oriented content workflows including content types, draft/publish handling, and
  writing-focused workspace behavior.
- Built-in Git workflow support for status, commit, branch switching, fetch, pull, push, and
  remote actions.
- In-app manual update checks and updater infrastructure for signed release bundles, stable
  `latest.json` publishing, and end-to-end Windows plus local macOS release operations.

### Changed
- Improved release and packaging workflows with Windows CI publishing, local macOS automation,
  bundled app branding, and clearer release operator documentation.
- Refined the desktop app presentation with the first Ovid app logo and regenerated packaged
  icon set.
- Continued stabilization and performance work across workspace opening, sidebar loading, search,
  editing, and save flows.

### Known Limits
- macOS public distribution is still limited by the missing Apple signing and notarization work.
- Some release and updater steps are still optimized for careful operator-driven publishing rather
  than fully automated public distribution.

## 0.9.0 - 2026-04-13

### Added
- Keyboard-first workspace and file navigation with workspace switcher, file switcher, and
  full-text search.
- Markdown editing with frontmatter-aware properties, Typora-style rich editing, code blocks,
  tables, images, links, footnotes, and structural editing behavior.
- Amytis-oriented content workflows including content types, draft/publish handling, and
  writing-focused workspace behavior.
- Built-in Git workflow support for status, commit, branch switching, fetch, pull, push, and
  remote actions.

### Notes
- `0.9.0` established the first public preview scope for Ovid.
