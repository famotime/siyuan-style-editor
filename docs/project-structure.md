# 项目结构

## 顶层概览

- `src/index.ts`：思源插件入口，负责注册 Dock 与生命周期衔接。
- `src/main.ts`：Vue 应用挂载层，连接插件生命周期与运行时初始化/销毁。
- `src/App.vue`：面板 UI 壳层，保留模板和样式，通过 `v-model:collapsed` 组合各区块组件。
- `src/composables/use-style-editor-shell.ts`：面板交互编排，组合 shell、transfer 与 inline palette 子能力。
- `src/style-editor-runtime.ts`：运行时公开接口，负责状态驱动、颜色应用、样式提取与对外 API，并导出 i18n 翻译函数 `t()`（占位符替换对键做正则转义）与共享常量 `CUSTOM_PALETTE_ID_PREFIX`。

## `src/components/StyleEditorShell`

- `CollapseHeader.vue`：共享折叠头（标题 + data-tooltip + 折叠按钮），为受控展示组件，消除 TargetStudio/FeatureSection 中原先逐字重复的按钮模板与样式；tooltip 换行差异经 `wrapTooltip` prop 保留。
- `TargetStudio.vue`：基础粉刷工作台（对象预览卡片、频道圆点拖拽交换、保存预设配色表单）。
- `FeatureSection.vue`：高级定制/全屋改造的功能区块（搜索、分组、五类控件渲染）。
- `FloatingPalettePanel.vue` / `FloatingPalettePresetSection.vue` / `FloatingPaletteCustomSection.vue`：浮层调色板及其预设/自定义子区块。
- `WorkspaceHero.vue`、`ConfigSearchBar.vue`、`ConfigSearchEmpty.vue`、`HighlightText.vue`：顶部操作区、搜索栏、空态与高亮文本。

## `src/lib`

### 样式目标与样式规则

- `style-target-catalog.ts`：样式目标单一目录，集中维护 target 顺序、selector、标签和提示文案。
- `style-profile.ts`：样式领域模型，负责默认 profile、归一化和 CSS 生成。
- `style-extractor.ts`：从当前文档 DOM 提取显式颜色样式。

### 功能样式目录（拆分自原 `style-feature-catalog.ts`）

- `feature-style-types.ts`（~166 行）：功能样式类型定义（`FeatureStyleId`、`FeatureStyleConfig`、`FeatureStyleControl` 等）与辅助函数（`px`、`em`、`stringValue`、`lineStyleValue` 等）。
- `feature-style-definitions.ts`（~80 行）：聚合子配置文件的总配置项数组 `FEATURE_DEFINITIONS` 并导出，维持原始数组排序以防外部索引不兼容。
- `definitions/controls.ts`（~51 行）：控件工厂（`colorControl`、`numberControl`、`selectControl`、`textControl`），统一生成 210 个控件定义，消除三份定义文件中逐字重复的字面量。
- `definitions/elements.ts`（~620 行）：块级元素与表格、代码块等结构性样式的具体配置定义。
- `definitions/typography.ts`（~1003 行）：排版样式、列表样式、行内元素样式的具体配置定义，含 `headingSelectorList()` 选择器辅助函数。
- `definitions/theme.ts`（~1136 行）：文档外观、全局背景色、大纲面板、工具条及系统元素等界面主题样式的具体配置定义。
- `style-feature-catalog.ts`（~130 行）：归一化、导出 API（`createDefaultFeatureProfile`、`normalizeFeatureProfile`、`buildFeatureStyleCss`、`FEATURE_STYLE_OPTIONS` 等），对外保持原有导入路径不变。
- 黄金快照测试 `style-feature-definitions-golden.test.ts`：锁定全部 54 个定义在默认值/空值配置下的 CSS 输出与控件结构，任何 definitions 改动均逐字节比对。

### 编辑器状态与运行时辅助

- `style-editor-state.ts`：纯状态更新函数，处理颜色更新、启用开关（`updateTargetEnabled`）、重置与 channel 交换。
- `style-editor-persistence.ts`：运行时持久化读写封装。
- `style-editor-stylesheet.ts`：运行时注入 `<style>` 节点的创建、更新与清理。
- `style-editor-shell-actions.ts`：UI 反馈文案解析（提取/导出/导入消息）。
- `style-transfer.ts`：样式导入/导出序列化与元数据。
- `style-transfer-download.ts`：导出文件的下载触发。
- `style-preview-document.ts`：生成预览文档的逻辑。

### 面板 UI 辅助

- `target-preview.ts`：预览卡片和颜色圆点的展示样式辅助。
- `custom-color.ts`：十六进制颜色归一化与颜色选择器默认值逻辑。
- `inline-palette.ts`：内联调色板开关状态机。
- `inline-color-picker.ts`：内联颜色选择器逻辑（含导出的 `clamp01` 钳位辅助）。
- `floating-palette.ts`：浮层定位计算。
- `panel-theme.ts`：面板 light/dark 主题 token 生成；dark/light 两套字典以 `Record<keyof typeof light, string>` 交叉标注，键集合由类型系统保证一致（漏键/多键均编译报错）。
- `preset-palette-catalog.ts`：预设色卡集合定义与归一化。

## `src/composables`

- `use-inline-palette-session.ts`：内联调色板总编排，衔接 runtime 选择切换与 UI 会话。
- `use-inline-palette-color-session.ts`：颜色草稿、HSV 选择器、预览/提交/回滚逻辑。
- `use-inline-palette-layout-session.ts`：浮层定位、视口响应与布局同步（浮层尺寸 fallback 常量在此维护）。
- `use-preset-palette-session.ts`：预设色卡集合、活动 tab、折叠状态与批量应用入口。
- `use-target-orb-drag-session.ts`：对象卡片圆形按钮的桌面端拖拽交换交互。
- `use-style-transfer-actions.ts`：导入/导出/提取/重置等 transfer 操作与状态反馈（系统操作旗标经 try/finally 保证复位）。
- `use-collapsed-model.ts`：折叠状态桥接（`internalCollapsed` + `toggleCollapse`），供 TargetStudio/FeatureSection 复用。
- `use-window-listener.ts`：`bindWindowListeners` 统一 window 事件监听的注册与卸载，供三处会话 composable 复用。
- `use-panel-theme-vars.ts`：面板主题变量派生。

## 资源与类型

- `src/i18n/*.json`：国际化文案资源。
- `src/types/index.d.ts`：思源插件运行时相关的全局类型声明。
- `src/index.scss`：插件全局样式入口。

## 测试布局

- 测试与源码并置，使用 `*.test.ts` 命名，Vitest 运行（`npm test`）。
- `src/style-editor-runtime.test.ts`：覆盖运行时初始化、样式注入、提取与清理、i18n 替换转义。
- `src/lib/style-feature-definitions-golden.test.ts`：全部定义的 CSS 输出与控件/默认值结构黄金快照。
- `src/components/StyleEditorShell/TargetStudio.test.ts`：覆盖对象卡片拖拽交换的组件级交互。
- `src/components/StyleEditorShell/CollapseHeader.test.ts`：覆盖共享折叠头的渲染、toggle 事件与插槽顺序。
- `src/components/StyleEditorShell/FloatingPalettePanel.test.ts`：覆盖浮层面板预设色卡/清空/应用等组件级交互与 i18n aria-label。
- `src/lib/style-target-catalog.test.ts`：覆盖目标目录完整性与顺序。
- `src/lib/style-editor-shell-actions.test.ts`：覆盖提取/导出/导入反馈文案。
- `src/lib/style-editor-stylesheet.test.ts`、`src/lib/style-editor-persistence.test.ts`：覆盖样式注入控制器与持久化读写。
- `src/composables/use-inline-palette-color-session.test.ts`、`use-inline-palette-layout-session.test.ts`、`use-target-orb-drag-session.test.ts`：覆盖调色板会话状态机、布局同步与拖拽阈值交互。
- 其他 `src/lib/*.test.ts`：覆盖纯函数模块，如定位、提取、主题和状态更新。
- `src/app-shell.test.ts`：保留对 `App.vue` 布局约束的静态断言。

## 当前边界

- `src/api.ts`：封装思源内核 HTTP API（`fetchSyncPost`、`openTab` 等），被 `use-style-transfer-actions.ts` 和 `style-preview-document.ts` 使用。
- `src/utils/` 目录已移除（原 `getDomByVueComponent` 为零引用死代码）。
- `src/types/api.d.ts` 已移除，`src/components/SiyuanTheme/` 目录为空。
- 若未来需要接入新的思源内核 API，建议以实际使用场景为单位新增最小封装，而不是恢复整套模板 API。
