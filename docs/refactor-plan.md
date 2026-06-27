# 重构计划

## 1. 项目快照

- 生成日期：2026-06-27
- 范围：`siyuan-style-editor` 全仓库
- 目标：
  1. 重构 `use-inline-palette-session.ts` 中的全局按键监听，消除侵入性的 `window.onkeydown` 覆写，并在 Escape 触发时优雅拦截事件。
  2. 拆分超大配置模块 `src/lib/feature-style-definitions.ts`（3454 行）为 3 个按功能分组的子模块文件，消灭单体超大文件以提高可读性并避免日后的合并冲突。
- 文档刷新目标：`docs/project-structure.md`、`README.md`
- 基线测试：23 个文件、160 个测试全部通过（`npm test`，2026-06-27 验证）

## 2. 架构与模块分析

| 模块 | 关键文件 | 当前职责 | 主要痛点 | 测试覆盖情况 |
| --- | --- | --- | --- | --- |
| 内联调色板会话 | `src/composables/use-inline-palette-session.ts` | 管理内联调色板会话的状态与布局交互，包含 Escape 键盘监听 | **使用覆写 `window.onkeydown` 的方式监听 Escape 键**，在 Vue 组件挂载时侵入全局，并且与 `window.addEventListener("keydown")` 重叠，导致 Escape 按下时可能重复触发 `handleEscapeKey`。可能干扰思源笔记及其他插件。 | 已有 `use-style-editor-shell.test.ts` 测试覆盖了 escape 会话关闭的交互逻辑。 |
| 功能样式定义 | `src/lib/feature-style-definitions.ts` | 存放 40 多个功能样式定义的大数组 `FEATURE_DEFINITIONS` | **单文件行数达到 3454 行 (97KB)**，导致日常查找定义困难，合并代码时极易产生 Git 冲突，不利于多人协作与后续新增样式。 | 现有 `style-feature-catalog.test.ts` 有 45 个测试，覆盖了所有的 CSS 构建和归一化校验，拆分后此测试应保持 100% 绿色。 |

## 3. 按优先级排序的重构待办

| ID | 优先级 | 模块/场景 | 涉及文件 | 重构目标 | 风险等级 | 重构前测试清单 | 文档影响 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-401 | P0 | 重构 `use-inline-palette-session.ts` 键盘监听 | `src/composables/use-inline-palette-session.ts` | 1. 彻底移除对 `window.onkeydown` 的覆写；<br>2. 仅保留并优化 `window.addEventListener("keydown")`；<br>3. 在拦截到 Escape 事件时调用 `event.preventDefault()` 和 `event.stopPropagation()`，防止事件穿透对外部产生副作用。 | 低 | - [x] 基线测试全通过（`npm test`）；<br>- [x] 模拟按键 Escape 事件测试通过，能成功关闭面板并撤销预览；<br>- [x] 保证在 `keydownHandler` 触发时只调用一次面板关闭。 | `docs/project-structure.md`：保持状态同步；<br>`README.md`：无影响 | done |
| RF-402 | P0 | 拆分 `feature-style-definitions.ts` | `src/lib/feature-style-definitions.ts`<br>→ 新增子目录 `src/lib/definitions/` 下的 `elements.ts`, `typography.ts`, `theme.ts` | 1. 将 3454 行的大配置表按功能分类拆分成 3 个子配置模块；<br>2. `src/lib/feature-style-definitions.ts` 中仅保留聚合逻辑；<br>3. **所有公开导出 API 及数组结构完全不变**，外部无感知。 | 中 | - [x] 运行测试套件，`style-feature-catalog.test.ts` 全部测试通过；<br>- [x] 确保拆分合并后，`FEATURE_DEFINITIONS` 数组的大小和元素顺序与拆分前完全一致。 | `docs/project-structure.md`：更新该模块描述与文件行数变化；<br>`README.md`：无影响 | done |

## 4. 执行日志

| ID | 开始日期 | 结束日期 | 验证命令 | 结果 | 已刷新文档 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| BASELINE | 2026-06-27 | 2026-06-27 | `npm test` | pass（23 文件，160 测试） | — | 重构前基线 |
| RF-401 | 2026-06-27 | 2026-06-27 | `npx vitest run src/composables/use-style-editor-shell.test.ts` | pass | — | 移除对 `window.onkeydown` 覆盖，并增加了对按键的 propagation/prevent 拦截控制 |
| RF-402 | 2026-06-27 | 2026-06-27 | `npx vitest run src/lib/style-feature-catalog.test.ts` | pass | `docs/project-structure.md`、`README.md` | 将 3454 行配置按功能类别（Elements、Typography、Theme）拆分至子目录，并在主模块中完美聚合与重导出 |

## 5. 决策与确认

- 用户批准的条目：`RF-401`、`RF-402`
- 延后的条目：—
- 阻塞条目及原因：—

## 6. 文档刷新

- `docs/project-structure.md`：已全面更新，加入了 `src/lib/definitions/` 目录下子模块结构说明，修正了 `feature-style-definitions.ts` 的定位与行数缩减描述。
- `README.md`：更新了 `src/lib/style-feature-catalog.ts` 底层架构更新说明。
- 最终同步检查：已通过所有 160 个自动化单元测试，双重保障。

## 7. 下一步

1. 两项重构条目均已圆满完成。
2. 保持思源笔记快捷键友好度，未来如有更多键盘交互均应沿用非侵入式 EventListener。
3. 后续扩展或修改样式功能定义时，可在 `src/lib/definitions/` 下对应板块中做局部的改动，避免再膨胀出单体巨型文件。
