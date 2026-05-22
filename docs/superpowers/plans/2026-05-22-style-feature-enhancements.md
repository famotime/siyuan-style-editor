# Style Feature Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first phase of configurable style enhancement modules to the SiYuan style editor plugin.

**Architecture:** Keep the current target color editor intact, and add a separate `featureProfile` state branch for switchable style modules. Generate CSS by combining existing target CSS with modular feature CSS builders. Render a compact feature panel below the existing target workspace so users can enable, configure, preview, reset, export, and import these features.

**Tech Stack:** Vue 3, TypeScript, Vite, Vitest, SCSS, SiYuan plugin runtime CSS injection.

---

## File Structure

- Create `src/lib/style-feature-catalog.ts`: feature IDs, labels, defaults, control metadata, normalization, CSS generation.
- Create `src/lib/style-feature-catalog.test.ts`: tests for defaults, normalization, and CSS output.
- Modify `src/lib/style-editor-state.ts`: add `featureProfile` to editor state, normalize/reset/update helpers.
- Modify `src/lib/style-editor-state.test.ts`: cover feature state defaults, normalization, updates, and reset behavior.
- Modify `src/lib/style-editor-persistence.ts`: persist `featureProfile`.
- Modify `src/lib/style-transfer.ts`: export/import `featureProfile` with backwards-compatible version handling.
- Modify `src/lib/style-transfer.test.ts`: cover feature export/import and legacy imports.
- Modify `src/style-editor-runtime.ts`: expose feature state and update/reset APIs, merge target and feature CSS.
- Modify `src/style-editor-runtime.test.ts`: cover injected feature CSS and persistence.
- Create `src/components/StyleEditorShell/FeatureStudio.vue`: compact feature cards with toggles, color controls, sliders, and selects.
- Create `src/components/StyleEditorShell/FeatureStudio.test.ts`: cover rendering and emitted updates.
- Modify `src/composables/use-style-editor-shell.ts`: expose feature helpers to `App.vue`.
- Modify `src/App.vue`: render `FeatureStudio`.

## Task 1: Feature Catalog And CSS Builder

- [ ] Write tests in `src/lib/style-feature-catalog.test.ts` for default features, normalization, and CSS output.
- [ ] Run `npm test -- src/lib/style-feature-catalog.test.ts`; expected failure because module does not exist.
- [ ] Implement `src/lib/style-feature-catalog.ts` with eight feature modules:
  - `paragraphHover`
  - `blockquoteFrame`
  - `imageRadius`
  - `tableStyle`
  - `linkStyle`
  - `underlineStyle`
  - `strikethroughStyle`
  - `taskListStyle`
- [ ] Run `npm test -- src/lib/style-feature-catalog.test.ts`; expected pass.

## Task 2: State, Persistence, And Transfer

- [ ] Add failing tests for `featureProfile` defaults, normalization, updates, reset, persistence, export, import, and legacy import compatibility.
- [ ] Run targeted tests:
  - `npm test -- src/lib/style-editor-state.test.ts`
  - `npm test -- src/lib/style-transfer.test.ts`
- [ ] Extend state with `featureProfile`, add `updateFeatureConfig`, and make reset clear both target and feature styles.
- [ ] Persist `featureProfile` in `style-editor.json`.
- [ ] Include `featureProfile` in transfer documents while accepting older files that only contain `profile`.
- [ ] Run the same targeted tests; expected pass.

## Task 3: Runtime CSS Injection

- [ ] Add failing runtime tests that enabling a feature injects its CSS, persists it, and reset removes it.
- [ ] Run `npm test -- src/style-editor-runtime.test.ts`; expected failure.
- [ ] Merge `buildStyleCss(profile)` and `buildFeatureStyleCss(featureProfile)` in runtime CSS injection.
- [ ] Expose `updateFeatureStyle`, `resetFeatureStyles`, and `getFeatureConfig`.
- [ ] Run `npm test -- src/style-editor-runtime.test.ts`; expected pass.

## Task 4: Feature Studio UI

- [ ] Add component tests for feature card rendering and emitted config updates.
- [ ] Run `npm test -- src/components/StyleEditorShell/FeatureStudio.test.ts`; expected failure because component does not exist.
- [ ] Implement `FeatureStudio.vue` with feature cards, enable switches, and typed controls.
- [ ] Wire it through `use-style-editor-shell.ts` and `App.vue`.
- [ ] Run the component test; expected pass.

## Task 5: Full Verification

- [ ] Run `npm test`; expected all tests pass.
- [ ] Run `npm run build`; expected production build succeeds.
- [ ] Review `git diff --stat` and confirm changes are limited to the feature implementation and docs.
