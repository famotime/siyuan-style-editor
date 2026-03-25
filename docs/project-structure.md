# 项目结构

## 顶层概览

- `src/index.ts`：思源插件入口，负责注册 Dock 与生命周期衔接。
- `src/main.ts`：Vue 应用挂载层，连接插件生命周期与运行时初始化/销毁。
- `src/App.vue`：面板 UI 壳层，保留模板和样式。
- `src/composables/use-style-editor-shell.ts`：面板交互编排，处理浮层、主题同步、颜色输入与反馈文案。
- `src/style-editor-runtime.ts`：运行时公开接口，负责状态驱动、颜色应用、样式提取与对外 API。

## `src/lib`

- `style-target-catalog.ts`：样式目标单一目录，集中维护 target 顺序、selector、标签和提示文案。
- `style-profile.ts`：样式领域模型，负责默认 profile、归一化和 CSS 生成。
- `style-editor-state.ts`：纯状态更新函数，处理颜色更新与重置。
- `style-editor-persistence.ts`：运行时持久化读写封装。
- `style-editor-stylesheet.ts`：运行时注入 `<style>` 节点的创建、更新与清理。
- `style-editor-shell-actions.ts`：UI 交互规则辅助函数，处理自定义颜色、清空操作和反馈文案。
- `style-extractor.ts`：从当前文档 DOM 提取显式颜色样式。
- `target-preview.ts`：预览卡片和颜色圆点的展示样式辅助。
- `custom-color.ts`：十六进制颜色归一化与颜色选择器默认值逻辑。
- `inline-palette.ts`：内联调色板开关状态机。
- `floating-palette.ts`：浮层定位计算。
- `panel-theme.ts`：面板 light/dark 主题 token 生成。

## 资源与类型

- `src/i18n/*.json`：国际化文案资源。
- `src/types/index.d.ts`：思源插件运行时相关的全局类型声明。
- `src/index.scss`：插件全局样式入口。

## 测试布局

- 测试与源码并置，使用 `*.test.ts` 命名。
- `src/style-editor-runtime.test.ts`：覆盖运行时初始化、样式注入、提取与清理。
- `src/lib/style-target-catalog.test.ts`：覆盖目标目录完整性与顺序。
- `src/lib/style-editor-shell-actions.test.ts`：覆盖颜色输入、清空动作与反馈文案。
- 其他 `src/lib/*.test.ts`：覆盖纯函数模块，如定位、提取、主题和状态更新。
- `src/app-shell.test.ts`：保留对 `App.vue` 布局约束的静态断言。

## 当前边界

- 当前仓库已移除模板遗留的 `src/api.ts`、`src/types/api.d.ts` 与 `src/components/SiyuanTheme/*`。
- 若未来需要接入新的思源内核 API，建议以实际使用场景为单位新增最小封装，而不是恢复整套模板 API。
