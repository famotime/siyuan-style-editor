# 重构计划

## 1. 项目快照

- 生成日期：2026-03-25
- 范围：`D:\MyCodingProjects\siyuan-style-editor`
- 目标：在不改变插件行为的前提下，降低 UI 壳层与运行时的耦合，补齐高风险区域测试，并清理模板遗留代码
- 文档刷新目标：`docs/project-structure.md`、`README.md`
- 当前基线：
  - `npm test`：pass（9 个测试文件，30 个测试全部通过）
  - 现有测试组织：测试与源码并置在 `src/`，暂无独立 `tests/` 目录

## 2. 架构与模块分析

| 模块 | 关键文件 | 当前职责 | 主要痛点 | 测试覆盖情况 |
| --- | --- | --- | --- | --- |
| 插件入口与挂载 | `src/index.ts`、`src/main.ts` | 插件生命周期、Dock 注册、Vue 应用挂载/卸载 | 生命周期逻辑简单，但依赖运行时全局单例；缺少入口级行为测试 | 无直接测试 |
| 运行时与持久化 | `src/style-editor-runtime.ts` | 持久化读写、注入 `<style>`、全局响应式状态、颜色应用与提取动作 | 运行时状态、UI 元数据、DOM 注入和存储逻辑混在一个文件；当前无专门运行时测试 | 无直接测试 |
| UI 壳层 | `src/App.vue` | 面板布局、交互事件、浮层定位、主题同步、消息文案 | 文件约 966 行，模板/交互/样式/生命周期集中，职责过重，回归风险最高 | 仅有 `src/app-shell.test.ts` 做静态源码断言 |
| 样式领域模型 | `src/lib/style-profile.ts`、`src/lib/style-editor-state.ts` | 样式目标定义、默认值、CSS 生成、状态更新 | `StyleTarget` 元数据分散在多个文件，未来新增目标时容易漏改 | 覆盖较好 |
| DOM 提取与预览辅助 | `src/lib/style-extractor.ts`、`src/lib/target-preview.ts`、`src/lib/custom-color.ts`、`src/lib/floating-palette.ts`、`src/lib/inline-palette.ts`、`src/lib/panel-theme.ts` | 解析文档样式、预览卡片样式、颜色输入、浮层定位、主题 token | 模块都较小，但部分能力与 `App.vue`/runtime 的边界仍偏模糊 | 覆盖较好 |
| 类型与模板遗留 | `src/api.ts`、`src/types/api.d.ts`、`src/components/SiyuanTheme/*` | SiYuan 模板 API 封装、旧主题组件 | 当前主流程未引用，维护成本高，容易误导后续开发者；若删除需确认没有隐式依赖 | 无测试 |
| 文档 | `README.md`、`docs/` | 用户说明、示例样式与预览文档 | 缺少 `docs/project-structure.md`，README 未反映当前测试与模块结构 | 无 |

## 3. 按优先级排序的重构待办

| ID | 优先级 | 模块/场景 | 涉及文件 | 重构目标 | 风险等级 | 重构前测试清单 | 文档影响 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-001 | P0 | 拆分 `App.vue` 的 UI 壳层与交互编排 | `src/App.vue`、`src/composables/use-style-editor-shell.ts`、`src/lib/style-editor-shell-actions.ts` | 将浮层状态、主题同步、颜色应用交互、展示组件分层，降低单文件复杂度并保持现有 UI/行为不变 | 高 | - [x] 复用 `src/lib/inline-palette.test.ts` 覆盖内联调色板打开/关闭与目标切换；- [x] 新增 `src/lib/style-editor-shell-actions.test.ts` 覆盖自定义颜色输入与清空动作；- [x] 新增 `src/lib/style-editor-shell-actions.test.ts` 覆盖“提取样式 / 清除样式”反馈文案；- [x] 保留 `src/app-shell.test.ts` 布局断言 | `docs/project-structure.md` 需新增 UI/组合逻辑分层；`README.md` 需更新架构说明 | done |
| RF-002 | P1 | 拆分运行时状态、存储与样式注入 | `src/style-editor-runtime.ts`、`src/lib/style-editor-persistence.ts`、`src/lib/style-editor-stylesheet.ts` | 将 UI 选项常量、持久化、DOM style 注入、状态快照等职责拆分，减少全局模块副作用 | 中 | - [x] 新增 `src/style-editor-runtime.test.ts`，为 `initializeRuntime` / `teardownRuntime` 增加基于 DOM 与插件 stub 的测试；- [x] 新增 `src/style-editor-runtime.test.ts`，为 `applyPaletteColor`、`resetAllStyles`、`extractCurrentStyles` 增加行为测试；- [x] 验证样式节点创建与清理 | `docs/project-structure.md` 需更新 runtime 模块图；`README.md` 需更新开发说明 | done |
| RF-003 | P1 | 消除样式目标元数据的重复定义 | `src/style-editor-runtime.ts`、`src/lib/style-profile.ts`、`src/lib/style-target-catalog.ts` | 收敛 `StyleTarget`、选择器、标签、提示文案等定义为单一来源，降低新增/修改目标时的漏改风险 | 中 | - [x] 新增 `src/lib/style-target-catalog.test.ts`，验证目标目录完整性；- [x] 保留并通过现有 CSS 生成与状态测试；- [x] 通过 `src/lib/style-target-catalog.test.ts` 验证目标顺序未变化 | `docs/project-structure.md` 需说明共享目录模块；`README.md` 需补充支持的样式目标来源 | done |
| RF-004 | P2 | 清理未接入主流程的模板遗留代码 | `src/api.ts`、`src/types/api.d.ts`、`src/components/SiyuanTheme/*` | 在确认无隐式依赖后删除或迁移到明确的 legacy 区域，减少维护噪音 | 中 | - [x] 通过 `rg` 复核引用关系；- [x] 运行 `npm test`；- [x] 运行 `npm run build` 验证删改后产物仍可构建 | `docs/project-structure.md` 已标注 legacy 已移除；`README.md` 已更新当前项目边界 | done |

优先级说明：
- `P0`：价值和风险都最高，优先执行
- `P1`：价值或风险中等，放在 `P0` 之后
- `P2`：低风险清理项，最后执行

状态说明：
- `pending`
- `in_progress`
- `done`
- `blocked`

## 4. 执行日志

| ID | 开始日期 | 结束日期 | 验证命令 | 结果 | 已刷新文档 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| BASELINE | 2026-03-25 | 2026-03-25 | `npm test` | pass | 未开始 | 9 个测试文件、30 个测试通过，适合作为后续重构基线 |
| RF-001 | 2026-03-25 | 2026-03-25 | `npx vitest run src/lib/style-editor-shell-actions.test.ts src/lib/inline-palette.test.ts src/app-shell.test.ts`；`npm test`；`npm run build` | pass | 待最终刷新 | `App.vue` 交互编排迁移到 `src/composables/use-style-editor-shell.ts`，新增 `src/lib/style-editor-shell-actions.ts`，`App.vue` 从 966 行降至 694 行 |
| RF-002 | 2026-03-25 | 2026-03-25 | `npx vitest run src/style-editor-runtime.test.ts src/lib/style-editor-state.test.ts src/lib/style-extractor.test.ts`；`npm test`；`npm run build` | pass | 待最终刷新 | 运行时持久化拆到 `src/lib/style-editor-persistence.ts`，样式节点管理拆到 `src/lib/style-editor-stylesheet.ts`，新增 `src/style-editor-runtime.test.ts` |
| RF-003 | 2026-03-25 | 2026-03-25 | `npx vitest run src/lib/style-target-catalog.test.ts src/lib/style-profile.test.ts src/style-editor-runtime.test.ts`；`npm test`；`npm run build` | pass | `docs/project-structure.md`、`README.md` | 新增 `src/lib/style-target-catalog.ts` 作为 selector 与 UI 元数据单一来源，`src/lib/style-profile.ts` 降至 77 行 |
| RF-004 | 2026-03-25 | 2026-03-25 | `rg -n '@/api|\"@/api|fetchSyncPost|IWebSocketData|IReslsNotebooks|SiyuanTheme|SyButton|SyCheckbox|SyIcon|SyInput|SySelect|SyTextarea' src`；`npm test`；`npm run build` | pass | `docs/project-structure.md`、`README.md` | 删除 `src/api.ts`、`src/types/api.d.ts` 与 `src/components/SiyuanTheme/*`，引用扫描为空 |

## 5. 决策与确认

- 用户批准的条目：`RF-001`、`RF-002`、`RF-003`、`RF-004`（2026-03-25）
- 延后的条目：
- 阻塞条目及原因：
- 建议执行顺序：`RF-001` -> `RF-002` -> `RF-003` -> `RF-004`

## 6. 文档刷新

- `docs/project-structure.md`：已新建，反映当前模块结构、测试布局与已移除的 legacy 边界
- `README.md`：已补充项目结构、测试维护方式与当前仓库边界
- 最终同步检查：已完成，文档内容与当前仓库结构一致

## 7. 下一步

1. 后续若新增样式目标，只需在 `src/lib/style-target-catalog.ts` 中维护单一目录。
2. 若扩展运行时能力，优先在 `src/style-editor-runtime.test.ts` 中补充行为测试。
3. 保持 `docs/project-structure.md` 与 `README.md` 随结构变化同步更新。
