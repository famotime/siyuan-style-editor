# 粉刷匠

一个面向思源笔记的所见即所得样式插件。

## 功能

- 在右侧面板直接调整标题、加粗、引述块、代码块、列表等样式。
- 支持从当前文档提取显式颜色，并回填到编辑面板。
- 点击颜色板后立即将样式注入到思源文档显示中。
- 样式配置持久化保存，重启思源后继续生效。

## 使用方式

1. 在右侧 Dock 打开“粉刷匠”。
2. 选择需要修改的样式目标。
3. 在“前景色 / 背景色”之间切换。
4. 点击颜色板，当前已打开文档会立即显示效果。

## 项目结构

- `src/App.vue`：面板模板与样式。
- `src/composables/use-style-editor-shell.ts`：面板交互编排。
- `src/style-editor-runtime.ts`：运行时公开接口。
- `src/lib/style-target-catalog.ts`：样式目标目录与 selector 单一来源。
- `src/lib/style-feature-catalog.ts`：功能样式目录导出，内部拆分为类型（`feature-style-types.ts`）与定义（`feature-style-definitions.ts`），具体样式配置已细化拆分至 `definitions/` 目录下。
- `docs/project-structure.md`：更完整的模块说明与职责映射。

## 开发命令

```bash
npm install --legacy-peer-deps
npm test
npm run build
```

## 测试与维护

- 测试使用 Vitest，采用“测试与源码并置”的方式组织在 `src/` 下。
- 运行时、样式目录、颜色交互和布局约束都有自动化测试覆盖。
- `src/api.ts` 封装思源内核 HTTP API，供运行时和预览文档功能使用。
