# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

思源笔记插件"粉刷匠"——所见即所得的文档样式编辑器。通过右侧面板调整标题、加粗、引述块、代码块、列表等元素的颜色/字体/间距，实时注入 CSS 到思源编辑器 DOM。

技术栈：TypeScript + Vue 3 (`<script setup lang="ts">`) + Vite 6 + SiYuan Plugin SDK。

## 常用命令

```bash
npm install --legacy-peer-deps    # 安装依赖
npm run dev                       # 开发模式，构建到思源插件目录并自动刷新
npm run build                     # 生产构建到 dist/，自动打包 package.zip
npm test                          # Vitest 单次运行（jsdom 环境）
npm run release                   # 交互式版本发布（bump + commit + tag + push）
npm run release:patch|minor|major # 非交互式版本发布
```

开发前需配置 `.env` 文件（参考 `.env.example`），设置 `VITE_SIYUAN_WORKSPACE_PATH` 指向本地思源工作空间路径。

## 架构概览

### 生命周期

`src/index.ts`（Plugin 类）→ `src/main.ts`（Vue 挂载/卸载桥接）→ `src/App.vue`（面板 UI）

- Plugin 的 `onload()` 调用 `init()` 初始化运行时并注册 Dock 面板
- `onunload()` 调用 `destroy()` 卸载 Vue 应用并清理运行时

### 核心运行时

`src/style-editor-runtime.ts` 是中枢模块，管理：
- Vue `reactive()` 全局状态（样式配置、功能开关、自定义调色板）
- CSS `<style>` 元素注入（id: `siyuan-style-editor-style`）
- 通过 SiYuan `loadData`/`saveData` API 持久化（key: `style-editor.json`）
- 暴露所有公开操作接口

### 三层代码组织

| 层 | 目录 | 职责 |
|---|---|---|
| 领域逻辑 | `src/lib/` | 纯函数，无 Vue 依赖。样式生成、状态转换、颜色计算、导入导出 |
| 组合函数 | `src/composables/` | Vue composition API，编排面板交互（调色板、拖拽、主题检测等） |
| 视图层 | `src/components/StyleEditorShell/` | Vue SFC 组件（WorkspaceHero、TargetStudio、FeatureStudio、FloatingPalettePanel） |

### 关键领域模型

- **StyleTarget** (`src/lib/style-target-catalog.ts`): 14 种样式目标（h1-h6、strong、blockquote、inlineCode、mark、codeBlock、bulletList、orderedList、taskList），每个目标有 `cssSelector` 和 `extractSelector`
- **StyleProfile**: `Record<StyleTarget, StyleRule>`，StyleRule 含 color/backgroundColor/fontWeight/fontStyle/textDecoration
- **FeatureStyleId** (`src/lib/style-feature-catalog.ts`): 14 种高级定制（段落悬停、引用框、图片圆角等），每个功能自含 `buildCss(config)` 和 controls 元数据
- **StyleEditorState** (`src/lib/style-editor-state.ts`): 不可变状态转换函数

### 样式注入机制

`style-editor-runtime.ts` 在 profile 或 featureProfile 变更时，调用 `buildStyleCss()` 和 `buildFeatureStyleCss()` 生成完整 CSS 字符串，写入 `<style>` 元素。所有生成的 CSS 规则使用 `!important` 覆盖思源默认样式。

## 编码规范

- 使用 `@antfu/eslint-config`（ESLint 9 flat config），单引号、尾逗号、多行对象格式
- `.editorconfig`：UTF-8、2 空格缩进、去尾空格、文件末换行
- Vue 组件 PascalCase，composables 命名 `use-*.ts`，测试文件 `*.test.ts` 与源码并置
- 路径别名：`@/*` → `src/*`，`@/libs/*` → `src/lib/*`

## 测试

- Vitest 配置于 `vitest.config.ts`，jsdom 环境
- 测试覆盖 `src/lib/`、composables、runtime、组件逻辑
- 修改导出函数、状态转换、样式生成、导出行为时需同步更新测试

## 提交规范

使用中文简要描述修改，前缀：`feat:` / `fix:` / `docs:` / `refactor:` 等。
