# 重构计划

## 1. 项目快照

- 生成日期：2026-11-16
- 范围：`siyuan-style-editor` 全仓库
- 目标：在保持行为不变的前提下，修复分析中确认的 2 处疑似缺陷、清理死代码、补齐测试覆盖缺口，并对重复代码（组件模板/CSS、composables、panel-theme 字典、runtime 职责）做去重与职责下沉。
- 文档刷新目标：`docs/project-structure.md`、`README.md`
- 基线测试：25 个测试文件、198 个测试全部通过（`npm test`，2026-11-16 验证）
- 上一轮计划（RF-401 Escape 监听、RF-402 definitions 拆分）已于 2026-06-27 完成，本轮为新一轮分析。

## 2. 架构与模块分析

| 模块 | 关键文件 | 当前职责 | 主要痛点 | 测试覆盖情况 |
| --- | --- | --- | --- | --- |
| 样式迁移动作 | `src/composables/use-style-transfer-actions.ts` | 导入/导出/提取/重置样式的编排，手动旗标 `isSystemOperation` 抑制 watch 清空消息 | `handleExtractStyles`（L65-73）与 `handleResetAllStyles`（L75-90）设置旗标后无 try/finally：`extractCurrentStyles()` / `resetAllStyles()` 抛错时旗标永久卡在 `true`，此后用户手动修改样式不再清空状态栏消息；仅 `handleImportStylesChange` 用了 try/finally，同文件模式不统一 | 无直接单测，仅被 `use-style-editor-shell.test.ts` 间接覆盖 |
| 预设配色面板 | `src/components/StyleEditorShell/FloatingPalettePresetSection.vue` | 预设配色区块展示与折叠 | L183 aria-label 硬编码中文 `"折叠预设配色"/"展开预设配色"`，而 `zh_CN.json` L13-14 已有 `presetsToggleCollapse/presetsToggleExpand` 键却未被引用；英文环境下 aria-label 仍显示中文。同文件 L43-56 其他文案均走 `t()`，用法不一致 | `FloatingPalettePanel.test.ts`（1 个测试）覆盖很薄 |
| 死代码 | `src/utils/index.ts`、`src/lib/style-editor-shell-actions.ts`、`src/lib/style-transfer.ts` | — | `getDomByVueComponent` 全仓零引用且 `createApp` 后从不 unmount（隐式 any）；`applyCustomColorSelection`/`clearPaletteSelection`/`RESET_ALL_STYLES_MESSAGE` 仅被自身测试引用（且 L20 在模块加载时调用 `t()`，pluginInstance 未注入，i18n 时序陷阱）；`parseImportedStyleProfile` 仅被自身测试引用 | 删除时同步删除对应测试 |
| 样式注入/持久化 | `src/lib/style-editor-stylesheet.ts`（39 行）、`src/lib/style-editor-persistence.ts`（45 行） | style 元素挂载/卸载；插件数据读写与归一化 | 两个直接操作 DOM 与插件存储的核心模块均无直接单测，仅被 runtime 测试间接覆盖 | 缺口 |
| 调色板会话 composables | `use-inline-palette-color-session.ts`（261 行）、`use-target-orb-drag-session.ts`（196 行）等 5 个 | 内联调色板/拖拽会话状态机 | ① 无直接单测（拖拽 6px 阈值、250ms click 抑制、预览回滚等分支仅间接覆盖）；② window 事件监听 add/remove 样板在 3 处重复；③ `Math.min(1, Math.max(0, ...))` 内联钳位与 `inline-color-picker.ts` 已有的 `clamp01` 重复；④ 浮层尺寸 fallback `320/296` 在 layout-session 两处重复 | 缺口 + 重复 |
| Shell 组件群 | `TargetStudio.vue`（813 行）、`FeatureSection.vue`（630 行）、`FloatingPalettePresetSection.vue`（617 行）、`FloatingPalettePanel.vue`、`FloatingPaletteCustomSection.vue` | 目标样式工作台与功能区块 UI | tooltip CSS（`[data-tooltip]::after/before`）在 TargetStudio 内部重复 3 份（L346-371、L433-477、L702-742）、FeatureSection 又有 2 份变体；`.panel-collapse-btn` 模板+SVG+样式在 TargetStudio（L59-83、L373-401）与 FeatureSection（L12-36、L392-420）逐字相同；`internalCollapsed` 同步模式两处重复；TargetStudio L129-173 两个 channel-orb 按钮块仅 channel 参数不同；`.section-heading__kicker` 样式在 3 个 Floating 组件重复 | `TargetStudio.test.ts`、`FeatureSection.test.ts`、`FloatingPalettePanel.test.ts` 已覆盖交互契约 |
| 面板主题变量 | `src/lib/panel-theme.ts`（313 行） | 生成 dark/light 两套 CSS 变量 | `createStyleEditorThemeVars`（L77-195）与 `createPanelThemeVars`（L223-313）各为 dark/light 两份 ~55 键平铺字面量；键集合必须一致却无机制保证（新增键漏写一半不报错） | `panel-theme.test.ts`（103 行）有基础 |
| 运行时编排 | `src/style-editor-runtime.ts`（436 行） | i18n `t()`、全局状态单例、样式注入、持久化、调色板 CRUD、导入导出 | ① `updateTargetEnabled`（L424-436）内 4 次调用 `snapshotState()`，属纯逻辑应下沉 state 模块；② 自定义调色板 ID 前缀 `custom-palette-`（L382）与 `FloatingPalettePresetSection.vue` L194 靠字符串约定同步，无共享常量；③ `t()` 替换占位符时 key 未做正则转义（L79） | `style-editor-runtime.test.ts`（15 测试）覆盖核心路径 |
| 功能样式定义 | `src/lib/definitions/`（elements 955 / theme 1748 / typography 1500 行） | 54 个功能样式定义 | ~78 个 color 控件、~87 个 number 控件为 6-9 行字面量，label 高频重复（"背景色"×10、"圆角"×10）；同一默认值在 buildCss 与 defaults 双处维护（如 elements.ts L17 与 L50）；`.h1,.h2,...,.h6` 选择器块在 typography.ts 出现 6+ 次 | `style-feature-catalog.test.ts`（1265 行，45 测试）强覆盖全部 buildCss 与归一化 |

## 3. 按优先级排序的重构待办

| ID | 优先级 | 模块/场景 | 涉及文件 | 重构目标与行为不变式 | 风险等级 | 重构前测试清单 | 文档影响 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-501 | P0 | 修复 `isSystemOperation` 旗标泄漏 | `src/composables/use-style-transfer-actions.ts` | 目标：`handleExtractStyles`、`handleResetAllStyles` 改用与 `handleImportStylesChange` 一致的 try/finally 模式，异常路径也复位旗标。不变式：成功路径行为与消息完全不变；异常后用户手动修改样式仍能清空 `actionMessage`；导入路径行为不变 | 中 | - [x] 新增回归测试：extract 抛错后再触发 profile 变更，`actionMessage` 仍被清空（重构前红，修复后绿）<br>- [x] 新增回归测试：reset 抛错路径旗标正常复位<br>- [x] 成功路径不变式用例通过<br>- [x] `npm test` 全绿（26 文件 201 测试） | `docs/project-structure.md`：无结构变化，无需更新；`README.md`：无影响 | done |
| RF-502 | P0 | 预设面板 aria-label 接入 i18n | `src/components/StyleEditorShell/FloatingPalettePresetSection.vue` | 目标：L183 改用 `t("presetsToggleCollapse")` / `t("presetsToggleExpand")`，删除硬编码中文。不变式：中文环境 aria-label 文案不变（zh 键值与硬编码一致）；组件其余渲染与交互不变。en_US 现为占位键值，补英文翻译属超出范围，不在本项处理 | 低 | - [x] 新增测试：注入 plugin i18n 自定义文案，断言 aria-label 随键解析（重构前红，修复后绿）<br>- [x] `npx vitest run src/components/StyleEditorShell/FloatingPalettePanel.test.ts` 通过（2/2）<br>- [x] `npm test` 全绿（26 文件 202 测试） | `docs/project-structure.md`：无需更新；`README.md`：无影响 | done |
| RF-503 | P0 | 死代码清理 | `src/utils/index.ts`（整删）<br>`src/lib/style-editor-shell-actions.ts`<br>`src/lib/style-transfer.ts`<br>对应 `*.test.ts` | 目标：删除零引用的 `getDomByVueComponent`（整文件）、`applyCustomColorSelection`、`clearPaletteSelection`、`RESET_ALL_STYLES_MESSAGE`（连带消除模块加载期 `t()` 时序陷阱）、`parseImportedStyleProfile`，同步删除仅测死代码的测试用例。不变式：保留导出（`resolveExportStylesMessage` 等）行为不变；无生产引用断裂 | 低 | - [x] 执行前 `grep` 复核各符号零生产引用<br>- [x] 删除后 `npm test` 全绿（26 文件 198 测试，净移除 4 个死代码用例）<br>- [x] `npm run build` 通过（产物校验通过） | `docs/project-structure.md`：移除 `src/utils/` 描述（随最终刷新执行）；`README.md`：未提及相关符号，无影响 | done |
| RF-504 | P1 | 补齐核心模块测试覆盖 | 新增 `src/lib/style-editor-stylesheet.test.ts`、`src/lib/style-editor-persistence.test.ts`、`src/composables/use-inline-palette-color-session.test.ts`、`src/composables/use-target-orb-drag-session.test.ts` | 目标：为 4 个无直接测试的模块补单测（stylesheet：apply/remove/重复 apply；persistence：plugin 为 null 跳过、归一化透传；color-session：草稿/提交色状态机、钳位；orb-drag：6px 阈值、250ms click 抑制、预览回滚）。不变式：只新增测试不改实现；若测试暴露实现缺陷，单独记录不在本项修复 | 低 | - [x] 4 个新测试文件全部通过（20 个新用例，对现状行为断言）<br>- [x] `npm test` 全绿（30 文件 218 测试，从 198 增加） | `docs/project-structure.md`：测试覆盖描述更新（随最终刷新执行）；`README.md`：无影响 | done |
| RF-505 | P1 | Shell 组件模板/CSS 去重 | `src/components/StyleEditorShell/TargetStudio.vue`、`FeatureSection.vue`<br>新增 `CollapseHeader.vue`、`src/composables/use-collapsed-model.ts`、`CollapseHeader.test.ts` | 目标：① 抽取折叠头（折叠按钮+标题+tooltip）为受控组件 `CollapseHeader.vue`；② 折叠状态桥接收敛为 `use-collapsed-model`；③ TargetStudio 两个 channel-orb 按钮块 `v-for` 化。范围调整：`.section-heading__kicker` 三处重复样式**未收敛**——共享 scoped 样式需引入全局 CSS，存在泄漏进思源宿主页面的风险，收益仅 ~21 行，故记录为后续事项。不变式：`.section-heading__title`、`.panel-collapse-btn`、`.channel-orb` 等类名、`data-tooltip`、`aria-label`、事件契约保持兼容；tooltip 换行差异经 `wrapTooltip` prop 保留 | 中 | - [x] RF-504 已完成（安全网）<br>- [x] 新增 `CollapseHeader.test.ts`（4 用例：标题/tooltip 渲染、toggle 事件、折叠态文案切换、actions 插槽顺序）<br>- [x] TargetStudio/FeatureSection/app-shell 定向测试通过（21/21）<br>- [x] `npm test` 全绿（31 文件 222 测试）<br>- [x] `npm run build` 通过<br>- [x] 测试断言的选择器（`.section-heading__title`、`.panel-collapse-btn`、`.channel-orb`、`.feature-section__body`）全部保留 | `docs/project-structure.md`：新增 `CollapseHeader.vue` 与 `use-collapsed-model.ts` 描述（随最终刷新执行）；`README.md`：无影响 | done |
| RF-506 | P1 | panel-theme dark/light 键同步保障 | `src/lib/panel-theme.ts` | 目标：新增元测试断言 dark/light 变量键集合完全相等；将两对字面量重排为模块级常量，dark 字典以 `Record<keyof typeof LIGHT, string>` 交叉标注，实现编译期键同步（双向：light 加键后 dark 漏键报 TS2741，dark 多键报 TS2353）。不变式：两个工厂函数输出逐键值不变（快照逐字节比对通过）、返回类型签名不变 | 低 | - [x] 新增键集合相等元测试 ×2<br>- [x] 新增 4 份黄金快照（在重构前代码上生成）<br>- [x] 重构后快照逐字节一致，`npx vitest run src/lib/panel-theme.test.ts` 11/11 通过<br>- [x] 临时副本变异实验证实双向漏键均被编译器捕获<br>- [x] `npm test` 全绿（31 文件 226 测试）；`npm run build` 通过 | `docs/project-structure.md`：该模块描述微调（随最终刷新执行）；`README.md`：无影响 | done |
| RF-507 | P2 | composables 重复模式抽取 | `src/composables/use-inline-palette-color-session.ts`、`use-inline-palette-layout-session.ts`、`use-target-orb-drag-session.ts`、`src/lib/inline-color-picker.ts`<br>新增 `src/composables/use-window-listener.ts`、`use-inline-palette-layout-session.test.ts` | 目标：① 抽 `bindWindowListeners(bindings)` 替换 3 处 add/remove 样板（scroll 的 `capture: true`、pointerup/pointercancel 的 `once: true` 语义保持一致）；② color-session 内联钳位改用导出的 `clamp01`；③ 浮层尺寸 fallback `320/296` 提为 `FALLBACK_PALETTE_HEIGHT/WIDTH` 常量。不变式：监听器注册/卸载时序与行为不变；会话状态机行为不变 | 中 | - [x] 先为 layout-session 补 4 个直接单测锁定现状（锚点定位、resize 重算、scroll 内外分流、隐藏重置）<br>- [x] `npx vitest run src/composables` 通过（6 文件 40 测试）<br>- [x] `npm test` 全绿（32 文件 230 测试）<br>- [x] `npm run build` 通过 | `docs/project-structure.md`：新增 `use-window-listener.ts` 描述（随最终刷新执行）；`README.md`：无影响 | done |
| RF-508 | P2 | runtime 轻量整改 | `src/style-editor-runtime.ts`、`src/lib/style-editor-state.ts`、`src/components/StyleEditorShell/FloatingPalettePresetSection.vue` | 目标：① `updateTargetEnabled` 下沉为 `style-editor-state.ts` 纯函数并补单测（runtime 内 4 次 `snapshotState()` 收敛为 1 次）；② 新增 `CUSTOM_PALETTE_ID_PREFIX` 共享常量替换 `custom-palette-` 魔法字符串（runtime 与 PresetSection 共用）；③ `t()` 占位符替换对 key 做正则转义（`escapeRegExp`）。不变式：`style-editor-runtime` 全部导出签名不变（新增导出除外）；生成的调色板 ID 格式不变（既有 `/^custom-palette-/` 断言持续锁定） | 中 | - [x] 新增 `updateTargetEnabled` 纯函数单测（先红后绿）<br>- [x] 新增 `t()` 占位符含正则元字符用例（先红后绿，`( / [0] / $` 三类）<br>- [x] `npx vitest run src/lib/style-editor-state.test.ts src/style-editor-runtime.test.ts src/components/StyleEditorShell/FloatingPalettePanel.test.ts` 26/26 通过<br>- [x] `npm test` 全绿（32 文件 232 测试）；`npm run build` 通过 | `docs/project-structure.md`：runtime/state 职责描述更新（随最终刷新执行）；`README.md`：无影响 | done |
| RF-509 | P2 | definitions 控件工厂化（渐进） | `src/lib/definitions/elements.ts`、`theme.ts`、`typography.ts`<br>新增 `src/lib/definitions/controls.ts`、`src/lib/style-feature-definitions-golden.test.ts` | 目标：① 新增控件工厂 `colorControl`/`numberControl`/`selectControl`/`textControl`（controls.ts），用 TS AST codemod 将 210 个控件字面量（7-9 行）转为工厂调用；② typography.ts 抽 `headingSelectorList(prefix, suffix?)` 替换 7 个重复的 h1-h6 选择器块。范围调整：④ 默认值单点维护**延后**——需重构全部 54 个 buildCss 闭包引用各定义 defaults（约 4200 行机械改动），收益/风险比不佳，列为后续事项。不变式：54 个定义的 `buildCss` 输出逐字节不变（黄金快照验证）；控件与 defaults 结构与 git HEAD 逐项等价（AST 对比脚本验证） | 高 | - [x] 重构前生成 108 份黄金快照（54 定义 × 默认值/空值 CSS）<br>- [x] 新增 controls/defaults 结构快照（54 × 2）<br>- [x] codemod 后 CSS 快照零漂移；AST 对比证实 210 个控件结构完全等价（51+66+93）<br>- [x] 选择器重构后黄金快照零漂移<br>- [x] `npx vitest run src/lib/style-feature-catalog.test.ts` 57/57 通过<br>- [x] `npm test` 全绿（33 文件 236 测试）；`npm run build` 通过<br>- [x] 行数：elements 955→620、typography 1500→1003、theme 1748→1136，合计 -1393 行（-33%） | `docs/project-structure.md`：definitions 工厂模式描述（随最终刷新执行）；`README.md`：无影响 | done |

优先级说明：
- `P0`：疑似缺陷修复与零风险清理，优先执行
- `P1`：中等价值/中等风险，放在 `P0` 之后（RF-504 是 RF-505/507 的安全网前置）
- `P2`：清理与一致性优化，最后执行

状态说明：`pending` / `in_progress` / `done` / `blocked`

## 4. 执行日志

| ID | 开始日期 | 结束日期 | 验证命令 | 结果 | 已刷新文档 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| BASELINE | 2026-11-16 | 2026-11-16 | `npm test` | pass（25 文件，198 测试） | — | 重构前基线 |
| RF-501 | 2026-11-16 | 2026-11-16 | `npx vitest run src/composables/use-style-transfer-actions.test.ts`；`npm test` | pass（定向 3/3；全套 26 文件 201 测试） | — | 新增测试文件 `use-style-transfer-actions.test.ts`，先红后绿；`cancelInlinePalettePanel` 移入 try 块保持旗标语义一致 |
| RF-502 | 2026-11-16 | 2026-11-16 | `npx vitest run src/components/StyleEditorShell/FloatingPalettePanel.test.ts`；`npm test` | pass（定向 2/2；全套 26 文件 202 测试） | — | `FloatingPalettePanel.test.ts` 新增 i18n aria-label 用例，先红后绿 |
| RF-503 | 2026-11-16 | 2026-11-16 | `npx vitest run src/lib/style-editor-shell-actions.test.ts src/lib/style-transfer.test.ts`；`npm test`；`npm run build` | pass（定向 10/10；全套 26 文件 198 测试；构建+zip 校验通过） | — | 删除 `src/utils/` 整目录与 4 个死导出；style-transfer 测试的错误路径断言改用 `parseImportedStyleTransfer`，覆盖不丢失 |
| RF-504 | 2026-11-16 | 2026-11-16 | `npx vitest run`（4 个新文件）；`npm test` | pass（新增 20 用例；全套 30 文件 218 测试） | — | 新增 4 个测试文件；color-session 的关闭语义用例经核实生产时序（先回滚后关闭）后按真实契约断言；orb-drag 锁定 6px 阈值、250ms click 抑制、hover 清除、非左键忽略 |
| RF-505 | 2026-11-16 | 2026-11-16 | `npx vitest run`（组件 4 文件）；`npm test`；`npm run build` | pass（定向 21/21；全套 31 文件 222 测试；构建通过） | — | TargetStudio 813→700 行、FeatureSection 630→543 行；CollapseHeader 为受控组件（状态桥接留在父级以保留独立挂载的折叠行为与 body 兄弟节点布局）；kicker 三处样式收敛因全局 CSS 泄漏风险而延后 |
| RF-506 | 2026-11-17 | 2026-11-17 | `npx vitest run src/lib/panel-theme.test.ts`；`npm test`；`npm run build`；临时副本 tsc 变异实验 | pass（定向 11/11；全套 226 测试；构建通过；双向漏键实验均报错） | — | 两对字面量重排为模块级常量 + `Record<keyof typeof light>` 交叉标注；期间误用 `git checkout --` 回滚过一次实验文件，已即时发现并重写恢复，最终内容经快照逐字节校验 |
| RF-507 | 2026-11-17 | 2026-11-17 | `npx vitest run src/composables`；`npm test`；`npm run build` | pass（定向 40/40；全套 230 测试；构建通过） | — | `bindWindowListeners` 返回卸载函数统一三处样板；`clamp01` 从 inline-color-picker 导出复用；layout-session 先补 4 个行为锁定测试再动手 |
| RF-508 | 2026-11-17 | 2026-11-17 | `npx vitest run`（state/runtime/palette 3 文件）；`npm test`；`npm run build` | pass（定向 26/26；全套 232 测试；构建通过） | — | `updateTargetEnabled` 下沉 state 模块；`CUSTOM_PALETTE_ID_PREFIX` 双端共用；`t()` key 转义防注入式误替换 |
| RF-509 | 2026-11-17 | 2026-11-17 | 黄金快照 + AST 结构对比脚本；`npx vitest run`（golden/catalog）；`npm test`；`npm run build` | pass（CSS 快照零漂移；210 控件结构等价；全套 236 测试；构建通过） | — | codemod 与验证脚本均在系统临时目录执行后删除；默认值单点维护延后（见决策与下一步） |

## 5. 决策与确认

- 用户批准的条目：RF-501 ~ RF-509 全部九项（2026-11-16 批准）
- 延后的条目：
  - RF-505 中的 `.section-heading__kicker` 三处重复样式收敛：共享 scoped 样式需引入全局 CSS，存在泄漏进思源宿主页面的风险，收益仅 ~21 行，延后。
  - RF-509 中的「默认值单点维护」（buildCss fallback 以 defaults 为准）：需重构全部 54 个 buildCss 闭包引用各定义 defaults，约 4200 行机械改动，收益/风险比不佳，列为后续事项。
- 阻塞条目及原因：—
- 执行中的偏差记录：RF-506 期间误用 `git checkout --` 回滚实验文件导致该文件被整体回滚一次，已即时发现并重写恢复，最终以黄金快照逐字节校验为准。

## 6. 文档刷新

- `docs/project-structure.md`：已全面更新——新增 `src/components/StyleEditorShell` 组件清单（含 CollapseHeader）、`definitions/controls.ts` 控件工厂与黄金快照测试描述、definitions 行数（-33%）、`use-collapsed-model`/`use-window-listener` composable、panel-theme 键同步机制、`src/utils/` 移除记录，并修正 shell-actions 职责描述。
- `README.md`：经核对无需修改——本插件为面向用户的纯功能文档，本轮九项重构均保持行为不变（两个缺陷修复对用户为不可见的健壮性提升），配置项数量与用户可见能力均未变化。
- 最终同步检查：`npm test` 33 文件 236 测试全部通过，`npm run build` 与产物校验通过。

## 7. 下一步

1. 全部九项获批条目均已完成，可按仓库惯例提交（建议前缀 `refactor:`，或按项拆分提交）。
2. 后续可选：RF-509 延后的「默认值单点维护」，以黄金快照为安全网按 elements → typography → theme 渐进执行。
3. 后续可选：Floating 面板 `.section-heading__kicker`/`.inline-palette-panel__copy` 样式收敛（需先设计宿主页面安全的共享样式机制）。
4. 后续可选：为 use-preset-palette-session、use-panel-theme-vars、WorkspaceHero 等剩余无直接单测的模块补测试。
