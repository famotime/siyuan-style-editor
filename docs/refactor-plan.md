# Refactor Plan

## 1. Project Snapshot

- Generated on: 2026-03-26
- Scope: `siyuan-style-editor`
- Goal: Continue refactoring after the recent feature expansion, with focus on reducing shell-layer coupling, replacing brittle source-string tests with behavior-oriented tests, and tightening runtime/UI boundaries without changing plugin behavior.
- Baseline:
  - `npm test`: pass (`15` test files, `86` tests)
  - Current repository state: clean working tree
- Plan note: This plan supersedes the completed 2026-03-25 plan and reflects the codebase after the latest `git pull`.

## 2. Architecture and Module Analysis

| Module | Key Files | Current Responsibility | Main Pain Points | Test Coverage Status |
| --- | --- | --- | --- | --- |
| Plugin entry and lifecycle | `src/index.ts`, `src/main.ts` | Plugin bootstrap, runtime init/teardown, dock mount/unmount | Logic is compact but mostly untested; mount/unmount behavior relies on mutable module singletons | No direct automated tests |
| Shell view | `src/App.vue` | Panel template, scoped styles, interaction wiring | File is `1053` lines again; template and scoped style surface are both large; tests assert raw source strings instead of rendered behavior | Covered by `src/app-shell.test.ts`, but coverage is brittle and source-structure-dependent |
| Shell controller | `src/composables/use-style-editor-shell.ts` | Theme sync, floating palette positioning, pointer tracking, preview/apply/cancel flow, file import/export wiring, status copy | `636` lines; multiple concerns mixed into one composable; behavior-heavy logic is only lightly protected by source assertions | `src/composables/use-style-editor-shell-source.test.ts` checks source presence, not controller behavior |
| Runtime orchestration | `src/style-editor-runtime.ts` | Runtime state, persistence integration, stylesheet injection, extract/import/export entry points, preset palette data exposure | Runtime owns both core state transitions and some UI-facing constants, which weakens dependency boundaries | Good direct coverage in `src/style-editor-runtime.test.ts` |
| Domain helpers | `src/lib/style-profile.ts`, `src/lib/style-target-catalog.ts`, `src/lib/style-transfer.ts`, `src/lib/style-editor-state.ts` | Style schema, target catalog, transfer serialization, pure state transitions | Mostly healthy; remaining issue is responsibility placement rather than local complexity | Good focused coverage |
| UI support helpers | `src/lib/custom-color.ts`, `src/lib/inline-color-picker.ts`, `src/lib/floating-palette.ts`, `src/lib/panel-theme.ts`, `src/lib/target-preview.ts` | Color normalization, HSV conversion, palette positioning, theme vars, preview styles | Small modules with clear seams; should stay stable and be reused by shell refactors | Good focused coverage |

## 3. Prioritized Refactor Backlog

| ID | Priority | Module/Scenario | Files in Scope | Refactor Objective | Risk Level | Pre-Refactor Test Checklist | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-101 | P0 | Decompose shell controller responsibilities | `src/composables/use-style-editor-shell.ts`, new focused composables and/or helpers under `src/composables/` or `src/lib/` | Split inline palette session state, viewport/theme listeners, and file transfer actions into explicit seams so the shell controller stops acting as a monolith | High | - [x] Add behavior tests for preview vs commit vs cancel flows; - [x] Add tests for escape/backdrop/outside-scroll dismissal and inside-palette scroll preservation; - [x] Add tests for import input reset and preset palette tab/collapse behavior | done |
| RF-102 | P0 | Break `App.vue` into presentational view units and modernize test strategy | `src/App.vue`, `src/app-shell.test.ts`, new view components under `src/components/` | Move hero actions, target grid/cards, and floating palette panel into presentational subcomponents, while replacing source-string assertions with render-level assertions that survive internal file moves | High | - [x] Add render-focused tests covering hero actions, hidden import input, target cards, and floating palette sections; - [x] Preserve current visible copy, action order, and interaction wiring; - [x] Keep layout-critical class hooks covered where still required | done |
| RF-103 | P1 | Separate UI-only assets and browser side effects from runtime state | `src/style-editor-runtime.ts`, `src/composables/use-style-editor-shell.ts`, `src/lib/style-transfer.ts`, new helper modules as needed | Move preset palette catalog and browser download/input helpers out of runtime-facing modules so runtime owns state/persistence/styling only | Medium | - [x] Add tests proving preset palette data and order remain unchanged; - [x] Add tests for export payload schema and download filename format; - [x] Add tests for import error handling parity | done |
| RF-104 | P2 | Harden plugin lifecycle seams with direct tests | `src/index.ts`, `src/main.ts`, targeted new tests | Add explicit lifecycle coverage for repeated mount, remount, and destroy paths before any future bootstrap cleanup | Medium | - [x] Add tests for `mountDock` idempotence on the same element; - [x] Add tests for remounting on a different element; - [x] Add tests for `destroy` clearing the app container and runtime side effects | done |

Priority definition:
- `P0`: highest value and risk, execute first
- `P1`: medium value or risk, execute after P0
- `P2`: low-risk cleanup, execute last

Status definition:
- `pending`
- `in_progress`
- `done`
- `blocked`

## 4. Expected Behavior Invariants

### RF-101

- Previewing a color must update the live stylesheet immediately but must not persist until an explicit commit path runs.
- Cancelling the floating palette must restore the last committed color when a preview is in progress.
- Scroll events from inside the floating palette must not close it; escape, backdrop, and outside scroll must still close it.
- Existing status copy for extract/reset/export/import flows must remain unchanged.

### RF-102

- The hero area must still expose the same four actions in the same order: extract, reset, export, import.
- The hidden local JSON file input must remain wired through the import action.
- The target grid must still show all `STYLE_TARGET_OPTIONS`, selected target state, and both channel controls per card.
- The floating palette must still contain the inline color board, preset palette tabs, collapse toggle, and clear/apply actions.

### RF-103

- `exportCurrentStyles()` and `importStyles()` must keep the same portable document schema and compatibility with persisted config payloads.
- Preset palette collection IDs, labels, color values, and ordering must remain unchanged.
- Exported filenames must remain timestamped and continue using the `siyuan-style-editor-styles-...json` pattern.

### RF-104

- Plugin load must still initialize runtime before dock usage.
- Re-mounting the same dock element must remain a no-op.
- Destroy must still unmount Vue, clear the mount element, and tear down the runtime stylesheet/state.

## 5. Execution Log

| ID | Start Date | End Date | Test Commands | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| BASELINE | 2026-03-26 | 2026-03-26 | `npm test` | pass | `15` test files and `86` tests passed before any new refactor work |
| RF-101 | 2026-03-27 | 2026-03-27 | `npx vitest run src/composables/use-style-editor-shell.test.ts`; `npx vitest run src/composables/use-style-editor-shell.test.ts src/app-shell.test.ts src/lib/style-editor-shell-actions.test.ts`; `npm test` | pass | Extracted `use-panel-theme-vars.ts`, `use-inline-palette-session.ts`, and `use-style-transfer-actions.ts`; replaced brittle shell source assertions with behavior tests and removed `src/composables/use-style-editor-shell-source.test.ts` |
| RF-102 | 2026-03-27 | 2026-03-27 | `npx vitest run src/app-shell.test.ts`; `npx vitest run src/app-shell.test.ts src/composables/use-style-editor-shell.test.ts`; `npm test` | pass | Replaced `src/app-shell.test.ts` source assertions with render tests, added Vue SFC support in `vitest.config.ts`, split `src/App.vue` into `WorkspaceHero.vue`, `TargetStudio.vue`, and `FloatingPalettePanel.vue` |
| RF-103 | 2026-03-27 | 2026-03-27 | `npx vitest run src/lib/preset-palette-catalog.test.ts src/lib/style-transfer-download.test.ts src/composables/use-style-editor-shell.test.ts src/style-editor-runtime.test.ts`; `npm test` | pass | Moved preset palette data to `src/lib/preset-palette-catalog.ts`, moved filename/download logic to `src/lib/style-transfer-download.ts`, and removed UI-only catalog data from `src/style-editor-runtime.ts` |
| RF-104 | 2026-03-27 | 2026-03-27 | `npx vitest run src/main.test.ts`; `npm test` | pass | Added direct lifecycle coverage for `init`, same-element mount reuse, remount cleanup, and `destroy`; `src/main.ts` now removes stale dock classes when remounting or tearing down |

## 6. Decision and Confirmation

- User approved items: `RF-101`, `RF-102`, `RF-103`, `RF-104` (2026-03-27)
- Deferred items:
- Blocked items and reasons:

## 7. Next Actions

1. All approved items are complete.
2. Keep `docs/project-structure.md` and `README.md` aligned with the new component and helper boundaries if the architecture changes again.
3. If lifecycle behavior expands further, extend `src/main.test.ts` before modifying `src/main.ts`.
