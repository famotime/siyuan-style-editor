# 项目结构

## 顶层概览

- `src/index.ts`：思源插件入口，负责注册 Dock 与生命周期衔接。
- `src/main.ts`：Vue 应用挂载层，连接插件生命周期与运行时初始化/销毁。
- `src/App.vue`：面板 UI 壳层，保留模板和样式。
- `src/composables/use-style-editor-shell.ts`：面板交互编排，组合 shell、transfer 与 inline palette 子能力。
- `src/style-editor-runtime.ts`：运行时公开接口，负责状态驱动、颜色应用、样式提取与对外 API。

## `src/lib`

### 样式目标与样式规则

- `style-target-catalog.ts`：样式目标单一目录，集中维护 target 顺序、selector、标签和提示文案。
- `style-profile.ts`：样式领域模型，负责默认 profile、归一化和 CSS 生成。
- `style-extractor.ts`：从当前文档 DOM 提取显式颜色样式。

### 功能样式目录（拆分自原 `style-feature-catalog.ts`）

- `feature-style-types.ts`（~130 行）：功能样式类型定义（`FeatureStyleId`、`FeatureStyleConfig`、`FeatureStyleControl` 等）与辅助函数（`px`、`em`、`stringValue`、`lineStyleValue` 等）。
- `feature-style-definitions.ts`（~1920 行）：34 个功能定义数组，每项含 `buildCss(config)` CSS 生成函数、控件元数据与默认值。
- `style-feature-catalog.ts`（~130 行）：归一化、导出 API（`createDefaultFeatureProfile`、`normalizeFeatureProfile`、`buildFeatureStyleCss`、`FEATURE_STYLE_OPTIONS` 等），对外保持原有导入路径不变。

### 编辑器状态与运行时辅助

- `style-editor-state.ts`：纯状态更新函数，处理颜色更新、重置与 channel 交换。
- `style-editor-persistence.ts`：运行时持久化读写封装。
- `style-editor-stylesheet.ts`：运行时注入 `<style>` 节点的创建、更新与清理。
- `style-editor-shell-actions.ts`：UI 交互规则辅助函数，处理自定义颜色、清空操作和反馈文案。
- `style-transfer.ts`：样式导入/导出序列化与元数据。
- `style-transfer-download.ts`：导出文件的下载触发。
- `style-preview-document.ts`：生成预览文档的逻辑。

### 面板 UI 辅助

- `target-preview.ts`：预览卡片和颜色圆点的展示样式辅助。
- `custom-color.ts`：十六进制颜色归一化与颜色选择器默认值逻辑。
- `inline-palette.ts`：内联调色板开关状态机。
- `inline-color-picker.ts`：内联颜色选择器逻辑。
- `floating-palette.ts`：浮层定位计算。
- `panel-theme.ts`：面板 light/dark 主题 token 生成。
- `preset-palette-catalog.ts`：预设色卡集合定义与归一化。

## `src/composables`

- `use-inline-palette-session.ts`：内联调色板总编排，衔接 runtime 选择切换与 UI 会话。
- `use-inline-palette-color-session.ts`：颜色草稿、HSV 选择器、预览/提交/回滚逻辑。
- `use-inline-palette-layout-session.ts`：浮层定位、视口响应与布局同步。
- `use-preset-palette-session.ts`：预设色卡集合、活动 tab、折叠状态与批量应用入口。
- `use-target-orb-drag-session.ts`：对象卡片圆形按钮的桌面端拖拽交换交互。
- `use-style-transfer-actions.ts`：导入/导出/提取/重置等 transfer 操作与状态反馈。
- `use-panel-theme-vars.ts`：面板主题变量派生。

## 资源与类型

- `src/i18n/*.json`：国际化文案资源。
- `src/types/index.d.ts`：思源插件运行时相关的全局类型声明。
- `src/index.scss`：插件全局样式入口。

## 测试布局

- 测试与源码并置，使用 `*.test.ts` 命名。
- `src/style-editor-runtime.test.ts`：覆盖运行时初始化、样式注入、提取与清理。
- `src/components/StyleEditorShell/TargetStudio.test.ts`：覆盖对象卡片拖拽交换的组件级交互。
- `src/components/StyleEditorShell/FloatingPalettePanel.test.ts`：覆盖浮层面板预设色卡/清空/应用等组件级交互。
- `src/lib/style-target-catalog.test.ts`：覆盖目标目录完整性与顺序。
- `src/lib/style-editor-shell-actions.test.ts`：覆盖颜色输入、清空动作与反馈文案。
- 其他 `src/lib/*.test.ts`：覆盖纯函数模块，如定位、提取、主题和状态更新。
- `src/app-shell.test.ts`：保留对 `App.vue` 布局约束的静态断言。

## 当前边界

- `src/api.ts`：封装思源内核 HTTP API（`fetchSyncPost`、`openTab` 等），被 `use-style-transfer-actions.ts` 和 `style-preview-document.ts` 使用。
- `src/types/api.d.ts` 已移除，`src/components/SiyuanTheme/` 目录为空。
- 若未来需要接入新的思源内核 API，建议以实际使用场景为单位新增最小封装，而不是恢复整套模板 API。
