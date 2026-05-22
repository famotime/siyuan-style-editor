# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vite + Vue 3 + TypeScript plugin for SiYuan. Main source files live in `src/`: plugin entry points are `src/main.ts`, `src/index.ts`, and `src/App.vue`; reusable logic is in `src/lib/`; Vue UI is in `src/components/`; composables are in `src/composables/`; locale files are in `src/i18n/`; shared types are in `src/types/`. Tests are colocated with implementation as `*.test.ts`. Static and release assets include `asset/`, `icon.png`, `preview.png`, `plugin.json`, and generated `dist/` / `package.zip`. Reference material is in `docs/` and `developer_docs/`; `plugin-sample-vite-vue/` is a sample project, not the main plugin.

## Build, Test, and Development Commands

- `npm run dev`: runs `vite build --watch` for iterative plugin development.
- `npm run build`: creates a production build in `dist/`.
- `npm test`: runs the Vitest suite once.
- `npm run release`: builds release artifacts through `release.js`.
- `npm run release:patch|minor|major`: bumps the version and packages a release for the selected semver level.
- `npm run release:manual`: packages without automatic version bumping.

## Coding Style & Naming Conventions

Use TypeScript, Vue single-file components, and ES modules. Follow `.editorconfig`: UTF-8, spaces, 2-space indentation, trimmed trailing whitespace, and final newlines. ESLint uses `@antfu/eslint-config` with Vue and TypeScript enabled; prefer single quotes, multiline object formatting, and trailing commas for multiline structures. Name Vue components in PascalCase, composables as `use-*.ts`, and tests as `module-name.test.ts`.

## Testing Guidelines

Vitest is the test runner, configured by `vitest.config.ts`. Keep tests near the code they cover, especially for `src/lib/`, composables, runtime behavior, and UI component logic. Add or update tests when changing exported helpers, state transitions, style generation, download/export behavior, or user-visible plugin workflows. Run `npm test` before submitting changes.

## Commit & Pull Request Guidelines

Recent history includes release tags, short imperative summaries, and Conventional Commit prefixes. Prefer concise Chinese commit messages with prefixes such as `feat:`, `fix:`, `docs:`, or `refactor:`. Example: `fix: 修复导出签名字段溢出`. Pull requests should include a clear change summary, test results, linked issues when applicable, and screenshots or GIFs for visible UI changes.

## Agent-Specific Instructions

Unless the user explicitly requests another language, respond in Simplified Chinese. When committing code, briefly describe the change in Chinese and use a recognized prefix such as `feat:`, `fix:`, `docs:`, or `refactor:`.
