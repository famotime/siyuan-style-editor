# Refactor Plan

## 1. Project Snapshot

- Generated on: 2026-03-28
- Scope: `siyuan-style-editor`
- Goal: Reduce the growing interaction and view complexity introduced by recent export/import, batch-apply, and drag-swap features, while preserving current plugin behavior and test coverage.

## 2. Architecture and Module Analysis

| Module | Key Files | Current Responsibility | Main Pain Points | Test Coverage Status |
| --- | --- | --- | --- | --- |
| Plugin entry and lifecycle | `src/index.ts`, `src/main.ts` | Plugin bootstrap, runtime init/teardown, dock mount lifecycle | Small and stable; low immediate refactor value | Good direct lifecycle coverage in `src/main.test.ts` |
| Runtime orchestration | `src/style-editor-runtime.ts` | Runtime state, persistence, stylesheet injection, extract/import/export, preset palette persistence, palette batch apply, channel swapping | File has grown to `310` lines and now mixes pure state transitions with orchestration concerns; mutation scenarios are expanding | Strong direct coverage in `src/style-editor-runtime.test.ts` |
| Pure state transitions | `src/lib/style-editor-state.ts` | Color updates, background updates, reset, channel swapping | Healthy boundary, but runtime still duplicates orchestration around these operations | Good focused coverage in `src/lib/style-editor-state.test.ts` |
| Shell controller | `src/composables/use-style-editor-shell.ts`, `src/composables/use-style-transfer-actions.ts` | High-level shell wiring, transfer action bridging, status copy exposure | `use-style-editor-shell.ts` is small, but action APIs are spreading across composables and the shell is accumulating adapter glue | Good behavior coverage in `src/composables/use-style-editor-shell.test.ts` |
| Inline interaction controller | `src/composables/use-inline-palette-session.ts` | Floating palette lifecycle, keyboard/scroll listeners, preview/commit/cancel, palette tab selection, batch apply, channel swap synchronization | `547` lines; now owns many unrelated responsibilities: event listeners, palette positioning, preview state, batch operations, swap synchronization | Covered by high-value behavior tests, but internal coupling remains high |
| Workspace hero view | `src/components/StyleEditorShell/WorkspaceHero.vue` | Hero copy, import/export controls, export metadata form, status copy | `417` lines; template/style weight is rising but concerns are still mostly local | Covered indirectly via `src/app-shell.test.ts` |
| Target workspace view | `src/components/StyleEditorShell/TargetStudio.vue` | Target grid rendering, save form, channel orb interactions, desktop drag-swap gesture, drag preview visual state | `808` lines; mixes rendering, form behavior, drag-and-drop gesture state, hover targeting, and visual feedback in one SFC | Covered indirectly in `src/app-shell.test.ts`, but not with component-local unit tests |
| Floating palette view | `src/components/StyleEditorShell/FloatingPalettePanel.vue` | Inline color picker, preset palette tabs, delete confirmation, batch-apply double click, clear/apply controls | `995` lines; very large presentational surface with several micro-interactions and state-specific class behaviors | Covered via `src/app-shell.test.ts`, but coverage is integration-heavy rather than component-focused |
| Domain helpers and catalogs | `src/lib/style-profile.ts`, `src/lib/style-target-catalog.ts`, `src/lib/style-transfer.ts`, `src/lib/preset-palette-catalog.ts` | Style schema, target ordering, transfer metadata, preset palette data | Overall healthy; target order is now used by more features, so invariants matter more | Good focused coverage |

## 3. Prioritized Refactor Backlog

| ID | Priority | Module/Scenario | Files in Scope | Refactor Objective | Risk Level | Pre-Refactor Test Checklist | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-201 | P0 | Decompose target workspace drag/swap interactions | `src/components/StyleEditorShell/TargetStudio.vue`, new helper/composable under `src/components/StyleEditorShell/` or `src/composables/`, `src/app-shell.test.ts` | Extract drag-and-swap gesture state, drop targeting, and click suppression from the monolithic SFC so target-card rendering is separated from interaction orchestration | High | - [x] Dragging an orb past threshold swaps source and target channels only on drop; - [x] Dragging must not trigger `activate-channel`; - [x] Cross-channel swap (`color` <-> `backgroundColor`) remains supported; - [x] Drag hover and drag preview visual states are still rendered | done |
| RF-202 | P0 | Split inline palette interaction orchestration | `src/composables/use-inline-palette-session.ts`, possible new composables/helpers under `src/composables/` or `src/lib/`, `src/composables/use-style-editor-shell.test.ts` | Separate viewport listeners, floating palette positioning, preview/commit state, and preset-palette operations into explicit sub-units to reduce coupling and future regression risk | High | - [x] Escape/backdrop/outside-scroll still cancel correctly; - [x] Preview vs commit vs cancel behavior remains unchanged; - [x] Batch apply and swap still sync current draft/committed state correctly; - [x] Active preset palette and collapse state remain stable | done |
| RF-203 | P1 | Break floating palette presentational surface into smaller view units | `src/components/StyleEditorShell/FloatingPalettePanel.vue`, new presentational subcomponents, `src/app-shell.test.ts` | Split custom color controls, preset palette tabs, and swatch grid into smaller components so the main floating panel stops carrying all markup and style branches | Medium | - [x] Preset palette tabs still support select, double-click batch apply, and delete confirmation; - [x] Clear/apply controls remain visible and wired; - [x] Existing class hooks relied on by tests remain intentionally preserved or replaced with behavior assertions | done |
| RF-204 | P1 | Consolidate runtime mutation orchestration around a smaller command surface | `src/style-editor-runtime.ts`, `src/lib/style-editor-state.ts`, `src/style-editor-runtime.test.ts` | Introduce clearer runtime-level mutation helpers so apply, reset, batch apply, swap, import, and preset mutations share consistent orchestration paths | Medium | - [x] Palette apply, batch apply, swap, import, save preset, and delete preset still persist exactly once where expected; - [x] Injected stylesheet output remains unchanged for equivalent profile states | done |
| RF-205 | P2 | Reduce shell adapter glue and document new boundaries | `src/composables/use-style-editor-shell.ts`, `docs/project-structure.md`, possibly `README.md` | Trim pass-through handlers and refresh architecture docs after the higher-priority decompositions land | Low | - [x] App wiring still exposes the same public handlers to `App.vue`; - [x] Documentation reflects actual component/composable boundaries | done |

Priority definition:
- `P0`: highest value and risk, execute first
- `P1`: medium value or risk, execute after P0
- `P2`: low-risk cleanup, execute last

Status definition:
- `pending`
- `in_progress`
- `done`
- `blocked`

## 4. Execution Log

| ID | Start Date | End Date | Test Commands | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| BASELINE | 2026-03-28 | 2026-03-28 | `npm test`; `npm run build` | pass | Current baseline after drag-swap feature: `18` test files and `90` tests passing |
| RF-201 | 2026-03-28 | 2026-03-28 | `npx vitest run src/components/StyleEditorShell/TargetStudio.test.ts`; `npx vitest run src/components/StyleEditorShell/TargetStudio.test.ts src/app-shell.test.ts src/composables/use-style-editor-shell.test.ts`; `npx vitest run src/style-editor-runtime.test.ts src/lib/style-editor-state.test.ts` | pass | Extracted drag-and-swap gesture state from `TargetStudio.vue` into `src/composables/use-target-orb-drag-session.ts` and added direct component coverage for drag preview/drop-target behavior |
| RF-202 | 2026-03-28 | 2026-03-28 | `npx vitest run src/composables/use-style-editor-shell.test.ts`; `npx vitest run src/composables/use-style-editor-shell.test.ts src/app-shell.test.ts`; `npx vitest run src/components/StyleEditorShell/TargetStudio.test.ts src/style-editor-runtime.test.ts src/lib/style-editor-state.test.ts`; `npm test` | pass | Split `use-inline-palette-session.ts` into orchestration plus `use-inline-palette-color-session.ts`, `use-inline-palette-layout-session.ts`, and `use-preset-palette-session.ts`; added regression checks for batch-apply cancel behavior and preview-then-swap behavior |
| RF-203 | 2026-03-28 | 2026-03-28 | `npx vitest run src/components/StyleEditorShell/FloatingPalettePanel.test.ts`; `npx vitest run src/components/StyleEditorShell/FloatingPalettePanel.test.ts src/app-shell.test.ts`; `npx vitest run src/composables/use-style-editor-shell.test.ts src/components/StyleEditorShell/TargetStudio.test.ts`; `npm test` | pass | Split `FloatingPalettePanel.vue` into `FloatingPaletteCustomSection.vue` and `FloatingPalettePresetSection.vue`; added direct component coverage for preset/delete/clear/apply interactions |
| RF-204 | 2026-03-28 | 2026-03-28 | `npx vitest run src/style-editor-runtime.test.ts`; `npx vitest run src/style-editor-runtime.test.ts src/lib/style-editor-state.test.ts`; `npx vitest run src/composables/use-style-editor-shell.test.ts src/app-shell.test.ts src/style-editor-runtime.test.ts`; `npm test` | pass | Consolidated repeated runtime mutation paths behind a shared `commitState()` helper and tightened stylesheet assertions for batch apply and swap paths |
| RF-205 | 2026-03-28 | 2026-03-28 | `npx vitest run src/composables/use-style-editor-shell.test.ts src/app-shell.test.ts src/main.test.ts`; `npm test` | pass | Removed redundant shell pass-through wrappers and refreshed `docs/project-structure.md` to document the new composable and component boundaries |

## 5. Decision and Confirmation

- User approved items: `RF-201`, `RF-202`, `RF-203`, `RF-204`, `RF-205` (2026-03-28)
- Deferred items:
- Blocked items and reasons:

## 6. Next Actions

1. All approved refactor items are complete.
2. Keep `docs/project-structure.md` aligned when new composables/components are added.
3. Extend component-level tests first if future UI decomposition continues around `WorkspaceHero.vue` or other large SFCs.
