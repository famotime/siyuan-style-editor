# 重构计划

## 1. 项目快照

- 生成日期：2026-05-23
- 范围：`siyuan-style-editor` 全仓库
- 目标：拆分超大文件 `style-feature-catalog.ts`（2155 行）以降低维护成本、提升可测试性；清理文档与代码的不一致
- 文档刷新目标：`docs/project-structure.md`、`README.md`
- 基线测试：24 个文件、141 个测试全部通过（`npm test`，2026-05-23 验证）

## 2. 架构与模块分析

| 模块 | 关键文件 | 当前职责 | 主要痛点 | 测试覆盖情况 |
| --- | --- | --- | --- | --- |
| 功能样式目录 | `src/lib/style-feature-catalog.ts`（2155 行） | 类型定义、辅助函数、34 个功能定义（含内联 `buildCss` 模板）、归一化与导出 | **单一文件承载全部功能定义和工具函数**，新增功能需在同一大文件中插入；内联 CSS 模板难以单独测试；类型、辅助函数、数据定义三个关注点混杂 | 31 个测试覆盖导出 API，但无法针对单个功能的 CSS 生成进行隔离测试 |
| 运行时编排 | `src/style-editor-runtime.ts`（384 行） | 全局响应式状态、持久化、样式注入、所有公开操作 API | 前次重构后已收敛；结构合理 | 14 个测试覆盖核心路径，充分 |
| 插件入口 | `src/index.ts`、`src/main.ts` | 插件生命周期、Vue 挂载/卸载 | 小而稳定，无需重构 | 4 个测试覆盖，充分 |
| API 封装 | `src/api.ts`（80 行） | 封装思源内核 HTTP API | **`project-structure.md` 误称已移除，实际仍被使用**；代码本身健康 | 无直接测试（依赖思源运行时） |
| 样式 Profile | `src/lib/style-profile.ts`（90 行） | 样式规则模型、归一化、CSS 生成 | 保留了对 `style-target-catalog.ts` 的 re-export（`StyleTarget`、`STYLE_TARGETS`、`getStyleTargetSelector`），被 15+ 文件使用 | 4 个测试，充分 |
| Shell 编排 | `src/composables/use-style-editor-shell.ts`（77 行） | 组合各子 composable 并暴露给 App.vue | 前次重构后已收敛 | 14 个测试覆盖 |
| Vue 组件 | `TargetStudio.vue`（19.2 KB）、`FloatingPalettePanel.vue`（7 KB）等 | 各面板 UI | 前次重构后已拆分 drag session、preset section、custom section | 间接覆盖，充分 |

## 3. 按优先级排序的重构待办

| ID | 优先级 | 模块/场景 | 涉及文件 | 重构目标 | 风险等级 | 重构前测试清单 | 文档影响 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-301 | P0 | 拆分 `style-feature-catalog.ts` 为多个模块 | `src/lib/style-feature-catalog.ts` → 新建 `src/lib/feature-style-types.ts`、`src/lib/feature-style-definitions.ts` | 将 2155 行的单体文件拆分为：(1) 类型与接口定义模块、(2) 功能定义（含 `buildCss`）模块、(3) 主目录模块（归一化与导出）；**所有公开导出 API 保持不变**，外部零感知 | 中 | - [x] `createDefaultFeatureProfile()` 返回完整 34 项；- [x] `normalizeFeatureProfile()` 对异常输入容错正确；- [x] `buildFeatureStyleCss()` 对所有 34 个功能生成有效 CSS；- [x] `FEATURE_STYLE_OPTIONS` 等数组长度与内容一致；- [x] `getFeatureStyleOption()` 按 ID 返回正确选项 | `docs/project-structure.md`：新增文件说明；`README.md`：无影响 | done |
| RF-302 | P1 | 修复文档与代码不一致 | `docs/project-structure.md` | 修正 "已移除 `src/api.ts`" 的错误描述；反映实际模块边界 | 低 | - [x] `src/api.ts` 确认仍被 `use-style-transfer-actions.ts` 和 `style-preview-document.ts` 使用 | `docs/project-structure.md`：修正 api.ts 描述；`README.md`：无影响 | done |
| RF-303 | P1 | 刷新项目文档反映最新架构 | `docs/project-structure.md`、`README.md` | 更新模块文件清单与行数统计；确保 composable 和 lib 目录描述准确 | 低 | - [x] 文档中的文件路径全部在仓库中存在；- [x] 无遗漏已知模块 | `docs/project-structure.md`：全面刷新；`README.md`：检查并同步 | done |

优先级说明：
- `P0`：价值高（最大维护瓶颈），风险中等（纯结构性拆分，导出不变）
- `P1`：价值中等，风险低

## 4. 执行日志

| ID | 开始日期 | 结束日期 | 验证命令 | 结果 | 已刷新文档 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| BASELINE | 2026-05-23 | 2026-05-23 | `npm test` | pass（24 文件，141 测试） | — | 重构前基线 |
| RF-301 | 2026-05-23 | 2026-05-23 | `npx vitest run src/lib/style-feature-catalog.test.ts`（31 通过）；`npm test`（24 文件，141 通过） | pass | `docs/project-structure.md`：新增拆分文件说明 | 原 2155 行拆为 `feature-style-types.ts`（132 行）+ `feature-style-definitions.ts`（1923 行）+ `style-feature-catalog.ts`（134 行），所有公开导出路径不变 |
| RF-302 | 2026-05-23 | 2026-05-23 | — | pass | `docs/project-structure.md`：修正 api.ts 描述 | 修正"已移除"为实际仍在使用的描述 |
| RF-303 | 2026-05-23 | 2026-05-23 | — | pass | `docs/project-structure.md`：全面刷新 lib 目录；`README.md`：修正过时描述 | 更新模块文件清单、行数统计、功能数量 |

## 5. 决策与确认

- 用户批准的条目：`RF-301`、`RF-302`、`RF-303`（2026-05-23）
- 延后的条目：—
- 阻塞条目及原因：—

## 6. 文档刷新

- `docs/project-structure.md`：RF-302 修正 api.ts 描述 + RF-303 全面刷新 lib 目录（含拆分文件说明）
- `README.md`：RF-303 修正过时描述、新增功能样式目录说明
- 最终同步检查：已完成，同步更新 `AGENTS.md` 和 `CLAUDE.md`

## 7. 下一步

1. 所有重构条目已完成。
2. 后续新增功能样式时，编辑 `src/lib/feature-style-definitions.ts` 即可，无需触碰类型或导出层。
3. 保持 `docs/project-structure.md` 与 `CLAUDE.md` 在新增模块时同步更新。
