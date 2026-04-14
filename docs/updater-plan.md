# Updater Plan

This document defines the first implementation slice for Ovid application updates after
`0.9.0`.

The goal is to make updates trustworthy before they become automatic.

## Current State

As of `0.9.0`, Ovid has:

- native packaged artifacts for macOS (`.dmg`) and Windows (`.msi`)
- a GitHub-based release flow
- a GitHub Actions workflow for building the Windows MSI

Ovid does **not** yet have:

- the Tauri updater plugin configured
- updater signing keys in place
- updater metadata generation or hosting
- an in-app update check or install flow

## Product Decision

Updater work should ship in this order:

1. release pipeline readiness
2. manual update check
3. manual update install
4. automatic background check

Do not start with silent or background auto-installation.

## Why This Order

- The updater depends on release metadata and signature discipline, not just app UI.
- A visible manual flow is easier to test and debug on macOS and Windows.
- Early updater failures damage user trust more than most normal feature bugs.

## Ovid-Specific UX Plan

### Entry Points

- Add `Check for Updates` to the native `Help` menu.
- Later, expose updater settings in preferences once background checks exist.

### Manual Update Check

The first in-app updater UI should show:

- current app version
- latest available version
- release notes summary or release link
- explicit `Up to date` state
- explicit offline/error state

### Manual Install Flow

The app should:

- download only after explicit user intent
- show platform-appropriate status and failure messages
- avoid blocking the editor until installation is actually required

### Automatic Checks

After the manual flow is stable:

- check on launch or at a calm interval
- notify instead of forcing install
- allow the user to defer

## Release Pipeline Requirements

Before runtime updater code is added, the release pipeline must support:

- signed updater artifacts
- stable release metadata per platform
- a reliable endpoint for updater JSON
- consistent asset naming and publishing

For Ovid, that likely means:

- GitHub Releases remain the distribution source
- updater metadata is generated as part of release publishing
- macOS and Windows updater artifacts are published together for each version

## Tauri 2 Requirements

The current Tauri 2 updater model requires:

- updater plugin setup in both Rust and frontend
- updater endpoints in Tauri config
- updater public key (`pubkey`) in Tauri config
- updater artifacts enabled in bundling

Relevant official docs:

- https://v2.tauri.app/plugin/updater/

Important implications:

- signatures are required; updater verification is not optional
- release assets alone are not enough; metadata must also be published
- updater behavior is platform-sensitive and must be tested on macOS and Windows

## Implementation Phases

### Phase 12.70 — Updater Release Pipeline

Deliverables:

- choose metadata hosting approach
- generate persistent updater signing keys
- enable updater artifact generation
- document release publishing steps for updater-compatible releases

Exit criteria:

- a release can publish all updater inputs without manual guesswork

### Phase 12.71 — Manual Update Check

Deliverables:

- `Check for Updates` menu action
- update query wiring
- modal or dialog for update state

Exit criteria:

- users can reliably tell whether a newer version exists

### Phase 12.72 — Manual Update Install

Deliverables:

- user-initiated download/install flow
- clear progress and failure handling

Exit criteria:

- a user can upgrade from inside Ovid without visiting GitHub manually

### Phase 12.73+ — Automatic Update Behavior

Deliverables:

- background check timing
- update preferences
- resilience for offline and partial-failure cases

Exit criteria:

- background checks are helpful and non-disruptive

## Open Decisions

- Whether updater metadata should be committed to the repo, published by CI, or stored in a
  separate release bucket
- Whether the first updater-supported macOS release should use the existing DMG path or a
  different updater-compatible artifact path
- Whether Windows install mode should stay conservative (`passive`) for the first updater
  release

## Recommendation

Start with Phase `12.70` only.

Do not add updater UI or plugin runtime code until the release pipeline, metadata strategy,
and signing key handling are all defined clearly enough to test end-to-end.
