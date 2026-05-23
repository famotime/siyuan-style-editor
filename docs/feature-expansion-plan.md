# 思源样式编辑器 — 功能扩展方案设计

> **文档版本**: v1.0 · 2026-05-23  
> **当前插件版本**: 0.3.0  
> **技术栈**: Vue 3 + TypeScript + Vite + SCSS

---

## 一、现状分析

### 1.1 已有能力

| 模块 | 已实现内容 |
|------|-----------|
| 🎨 主题色彩 (TargetStudio) | 22 个 CSS 变量色彩调节（工具栏、主界面、编辑器、列表、字体颜色五组），支持 HSL 色彩空间调色、预设色板、自定义色板保存 |
| ⚙️ 高级定制 (FeatureStudio) | 正文安全类：段落悬停、折叠块、编辑区背景、标题间距/装饰/编号隐藏、列表（无序圆点/有序序号/层次线）、引述块、被引用块角标/徽标、引用搜索菜单、反链固定、图片圆角、表格增强、标记文本、行内代码、引用链接、分割线、超链接、下划线、删除线、任务列表 |
| 🏗️ 全屋改造 (EditorUiStudio) | 文档标题、头图样式、文档标签、文档树彩色分块、大纲数字标志、块标动画、工具条样式、斜杠菜单、表情面板、搜索面板 |
| 🔄 数据管理 | 导入/导出 JSON 配置、下载 CSS 文件、5 个内置主题预设、用户自定义色板 |
| 🌍 国际化 | 简体中文 + 英文 |

**共计 32 个特性定义**（20 个正文安全 + 12 个全屋改造），已经覆盖了大量常见场景。

### 1.2 架构优势

- **声明式特性目录**：新增特性只需在 `feature-style-definitions.ts` 中追加定义，UI 自动渲染
- **双区分类**：`risk: "正文安全" | "全屋改造"` 将特性分为两个 Studio 面板
- **按需 CSS 生成**：仅启用的特性参与 CSS 拼接，无冗余
- **类型安全**：`FeatureStyleId` 联合类型 + 控件元数据保证类型完整

### 1.3 当前不足

1. **特性搜索/筛选**：32 个特性卡片已经较多，缺少快速定位能力
2. **缺少预览反馈**：用户修改参数后无法直观看到效果预览（需要到编辑器中查看）
3. **排版控制空白**：字体、字号、行高、段间距等排版核心参数尚无覆盖
4. **滚动条/光标等细节**：参考文档中高频出现的细节美化未涉及
5. **顶栏定制**：参考文档中最受欢迎的话题之一（透明/毛玻璃/自动隐藏）
6. **代码块外观**：仅有行内代码样式，缺少代码块整体外观
7. **用户自定义预设不足**：仅支持色板预设，不支持特性配置预设（"一键切换风格包"）
8. **FeatureStudio / EditorUiStudio 组件重复**：两个组件代码几乎完全相同，仅标题和数据源不同
9. **hint/preview 字段未展示**：特性定义中有 `hint` 和 `preview` 字段，但 UI 中未使用

---

## 二、新增特性方案

基于参考文档梳理，以下按优先级排列新增特性。所有特性均为**纯 CSS 实现**，符合"侧重 CSS 而非 JS"的原则。

### 2.1 第一优先级 — 高影响力排版与布局

#### F01 · 正文排版 (`typographyBase`)
**分类**: 正文安全  
**来源**: 参考文档中多处提及 `--b3-font-size`、`--b3-font-line-height`、段落缩进  
**控件**:
| 控件 | 类型 | 范围 | 默认 | 说明 |
|------|------|------|------|------|
| fontSize | number | 12–20 px | 16 | 正文字号 |
| lineHeight | number | 1.2–2.4 | 1.625 | 行高 |
| textIndent | number | 0–4 em | 0 | 首行缩进 |
| paragraphSpacing | number | 0–24 px | 8 | 段间距 |
| letterSpacing | number | -0.5–2 px | 0 | 字间距 |

**CSS 目标**: `:root` 变量覆盖 + `.protyle-wysiwyg [data-type="NodeParagraph"]` 样式

#### F02 · 编辑器宽度 (`editorWidth`)
**分类**: 全屋改造  
**来源**: 参考文档 `--b3-protyle-width`  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| maxWidth | number (600–2000 px) | 最大宽度 |
| fullWidth | select (是/否) | 全宽模式 |
| contentPadding | number (0–60 px) | 内容区内边距 |

**CSS 目标**: `.protyle-wysiwyg--attr` max-width + `.protyle-content` padding

#### F03 · 正文字体 (`fontFamily`)
**分类**: 正文安全  
**来源**: 多个参考文档讨论中英文字体设置  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| mainFont | select | 正文字体选择（思源黑体/苹方/微软雅黑/霞鹜文楷/自定义） |
| codeFont | select | 代码字体选择（JetBrains Mono/Fira Code/Cascadia Code/自定义） |
| customMainFont | color(实为text) | 自定义字体名称输入 |

> **设计说明**: select 下拉列表提供常用字体预设，用户也可输入自定义字体名称。考虑到字体控件需要文本输入，建议扩展控件类型。

### 2.2 第二优先级 — 界面外壳美化

#### F04 · 顶栏样式 (`topBarStyle`)
**分类**: 全屋改造  
**来源**: `分享几个关于顶栏的代码片段.md` — 社区最热门话题之一  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| mode | select | 风格：默认/透明/毛玻璃 |
| blurRadius | number (0–20 px) | 毛玻璃模糊半径 |
| backgroundColor | color | 自定义背景色 |
| height | number (32–48 px) | 顶栏高度 |
| borderBottom | select | 底边线：显示/隐藏 |

**CSS 目标**: `#toolbar`, `.toolbar`, `.toolbar__drag`

#### F05 · 滚动条样式 (`scrollbarStyle`)
**分类**: 全屋改造  
**来源**: 参考文档中多处提及滚动条美化  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| width | number (4–16 px) | 滚动条宽度 |
| trackColor | color | 轨道颜色 |
| thumbColor | color | 滑块颜色 |
| thumbRadius | number (0–8 px) | 滑块圆角 |
| hideMode | select | 隐藏模式：始终显示/悬停显示/完全隐藏 |

**CSS 目标**: `::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, `::-webkit-scrollbar-track`

#### F06 · 页签栏样式 (`tabBarStyle`)
**分类**: 全屋改造  
**来源**: 参考文档中页签相关代码片段  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| height | number (28–44 px) | 页签高度 |
| fontSize | number (11–16 px) | 页签字号 |
| activeIndicator | select | 活动指示器：底线/背景/无 |
| indicatorColor | color | 指示器颜色 |
| backgroundColor | color | 页签栏背景 |

**CSS 目标**: `.layout-tab-bar`, `.layout-tab-bar .item--focus`

#### F07 · 代码块外观 (`codeBlockStyle`)
**分类**: 正文安全  
**来源**: 参考文档 `js_代码块功能增强` 中的 CSS 部分  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| borderRadius | number (0–16 px) | 代码块圆角 |
| backgroundColor | color | 背景色 |
| headerBgColor | color | 信息栏（语言标签）背景色 |
| maxHeight | select | 最大高度（不限/300px/500px/70vh） |
| lineNumberColor | color | 行号颜色 |

**CSS 目标**: `.protyle-wysiwyg [data-type="NodeCodeBlock"]`, `.hljs`, `.protyle-linenumber`

#### F08 · 面包屑样式 (`breadcrumbStyle`)
**分类**: 全屋改造  
**来源**: 参考文档中面包屑相关代码  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| textColor | color | 文字颜色 |
| backgroundColor | color | 背景色 |
| separatorColor | color | 分隔符颜色 |
| fontSize | number (11–14 px) | 字号 |

**CSS 目标**: `.protyle-breadcrumb`, `.protyle-breadcrumb__item`

### 2.3 第三优先级 — 进阶美化

#### F09 · 加粗文本样式 (`boldTextStyle`)
**分类**: 正文安全  
**来源**: `加粗文本样式.css` — 直接提供了完整 CSS  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| color | color | 加粗文本颜色 |
| backgroundColor | color | 加粗文本背景色 |
| borderRadius | number (0–8 px) | 背景圆角 |
| fontWeight | number (600–900) | 字重 |

**CSS 目标**: `strong`, `b`, `span[data-type~="strong"]`

#### F10 · 图片增强 (`imageEnhance`)
**分类**: 正文安全  
**来源**: 参考文档中图片阴影、悬停缩放  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| shadow | select | 阴影：无/轻微/中等/强 |
| hoverZoom | select | 悬停效果：无/轻微放大/明显放大 |
| maxWidth | select | 最大宽度：自动/80%/100% |
| borderColor | color | 边框颜色（transparent 则无边框） |
| borderWidth | number (0–4 px) | 边框粗细 |

**CSS 目标**: `.protyle-wysiwyg img`

> **说明**: 与已有的 `imageRadius`（仅控制圆角）互补，不冲突。

#### F11 · 停靠栏样式 (`dockStyle`)
**分类**: 全屋改造  
**来源**: 参考文档中 dock 面板相关  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| iconSize | number (16–28 px) | 图标大小 |
| backgroundColor | color | 停靠栏背景色 |
| hoverColor | color | 悬停颜色 |
| width | number (36–56 px) | 停靠栏宽度 |

**CSS 目标**: `.dock`, `.dock__item`

#### F12 · 搜索高亮色 (`searchHighlight`)
**分类**: 全屋改造  
**来源**: 参考文档中搜索高亮相关  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| matchColor | color | 匹配项高亮色 |
| currentMatchColor | color | 当前匹配项高亮色 |
| matchBorderRadius | number (0–4 px) | 高亮圆角 |

**CSS 目标**: `.protyle-wysiwyg mark[data-type="search-mark"]` 等

#### F13 · 对话框/弹窗样式 (`dialogStyle`)
**分类**: 全屋改造  
**来源**: 参考文档中 `.b3-dialog` 相关  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| borderRadius | number (0–24 px) | 弹窗圆角 |
| backdropBlur | number (0–20 px) | 背景模糊 |
| backdropOpacity | number (0–1) | 遮罩透明度 |
| shadowIntensity | select | 阴影：无/轻/重 |

**CSS 目标**: `.b3-dialog`, `.b3-dialog__container`, `.b3-dialog__scrim`

#### F14 · 列表标记样式 (`listMarkerStyle`)
**分类**: 正文安全  
**来源**: 参考文档中自定义列表标记  
**控件**:
| 控件 | 类型 | 说明 |
|------|------|------|
| unorderedStyle | select | 无序标记：默认/实心圆/空心圆/方块 |
| orderedStyle | select | 有序编号：默认/罗马数字/中文数字 |
| itemSpacing | number (0–12 px) | 列表项间距 |
| indentation | number (16–40 px) | 嵌套缩进 |

**CSS 目标**: `.protyle-wysiwyg .li`, `.protyle-action`

> **说明**: 与已有的 `unorderedListMarkerColor`、`orderedListStyle` 互补，聚焦于标记*样式*而非颜色。需评估是否可合并至已有特性中作为新控件。

---

## 三、交互界面改进方案

### 3.1 组件去重与抽象

**问题**: `FeatureStudio.vue` 和 `EditorUiStudio.vue` 代码 99% 重复，仅标题和数据源不同。

**方案**: 创建通用 `FeatureSection.vue` 组件，通过 props 控制标题、副标题（kicker）、数据源。

```vue
<!-- FeatureSection.vue -->
<FeatureSection
  kicker="Advanced Config"
  title="高级定制"
  :feature-style-options="bodySafeFeatureOptions"
  :feature-profile="runtimeState.featureProfile"
  @update-feature-style="handleUpdateFeatureStyle"
/>
```

**影响范围**:
- 新建 `src/components/StyleEditorShell/FeatureSection.vue`（整合通用逻辑）
- 删除 `FeatureStudio.vue` 和 `EditorUiStudio.vue`
- 修改 `App.vue` 使用新组件
- 更新对应测试文件

### 3.2 特性卡片增强

#### 3.2.1 展示 hint 描述

当前 feature 定义中的 `hint` 字段未在 UI 中展示。建议在卡片标题下方增加灰色小字说明。

```html
<h3 class="feature-card__title">{{ feature.label }}</h3>
<p class="feature-card__hint">{{ feature.hint }}</p>
```

#### 3.2.2 展示 preview 标签

`preview` 字段可作为视觉标签展示在卡片左侧或右上角，帮助用户快速识别特性类型。

```html
<span class="feature-card__preview-tag">{{ feature.preview }}</span>
```

#### 3.2.3 增加搜索/筛选

随着特性增加，在各 Studio 面板顶部增加搜索框：

```html
<input
  type="search"
  class="feature-search"
  placeholder="搜索特性..."
  v-model="searchQuery"
/>
```

筛选逻辑基于 `label`、`hint` 字段匹配。

#### 3.2.4 启用状态统计

在 Studio 面板标题旁显示已启用数量：

```
高级定制  3/20 已启用
```

### 3.3 控件类型扩展

当前仅支持三种控件类型：`color`、`number`、`select`。需新增：

#### 3.3.1 `text` 控件
用于字体名称等自由文本输入场景。

```typescript
interface FeatureStyleControl {
  // ...existing
  type: "color" | "number" | "select" | "text";
  placeholder?: string;  // 文本控件占位提示
}
```

#### 3.3.2 `range` 滑块控件（可选）
对于数值类控件，可选择以 range slider 形式渲染，提供更直观的调节体验。
可通过在 number 类型控件上增加 `slider: true` 属性来指示 UI 渲染滑块。

```typescript
interface FeatureStyleControl {
  // ...existing
  slider?: boolean;  // 为 number 类型启用滑块展示
}
```

### 3.4 特性分组细化

当前仅按 `risk` 二分。随着特性增多到 40+，建议在 risk 之外增加**子分组标签**：

```typescript
interface FeatureStyleOption {
  // ...existing
  group?: string;  // 子分组标签，如 "排版"、"行内元素"、"UI组件"
}
```

**正文安全区域的建议子分组**:
| 分组 | 包含特性 |
|------|---------|
| 📝 排版 | 正文排版、正文字体、标题间距、标题装饰、标题编号隐藏 |
| ✏️ 行内元素 | 标记文本、行内代码、加粗文本、超链接、引用链接、下划线、删除线 |
| 📦 块级元素 | 段落悬停、折叠块、引述块、代码块、表格增强、分割线、图片（圆角+增强） |
| 📋 列表 | 任务列表、有序列表序号、无序列表圆点、列表层次线、列表标记样式 |
| 🔗 引用与链接 | 被引用块角标、引用次数徽标、引用搜索菜单、反链固定 |

**全屋改造区域的建议子分组**:
| 分组 | 包含特性 |
|------|---------|
| 🖼️ 文档外观 | 文档标题、头图样式、文档标签、编辑区背景、编辑器宽度 |
| 🧭 导航与面板 | 文档树彩色分块、大纲数字标志、面包屑样式、停靠栏样式、搜索面板 |
| 🎛️ 操作界面 | 顶栏样式、页签栏样式、块标动画、工具条样式、斜杠菜单、表情面板 |
| 🔧 系统元素 | 滚动条样式、搜索高亮色、对话框样式 |

**UI 呈现**: 在 FeatureSection 内部按 `group` 分组渲染，每组一个折叠区域。

### 3.5 特性配置预设系统

**需求**: 用户可以保存、导入、分享一套完整的特性配置（包括主题色 + 特性开关/参数），类似"风格包"。

**方案**:
1. 在 WorkspaceHero 区域增加"保存为预设"按钮
2. 预设包含完整的 `profile` + `featureProfile` 快照
3. 使用思源 `/api/file/putFile` 存储到 `data/storage/petal/siyuan-style-editor/presets/` 目录
4. 在 WorkspaceHero 中提供预设选择下拉列表
5. 支持删除用户自定义预设

**数据结构**:
```typescript
interface StylePreset {
  id: string;
  name: string;
  createdAt: string;
  profile: StyleProfile;
  featureProfile: FeatureStyleProfile;
}
```

### 3.6 CSS 预览面板（远期）

在设置面板底部增加一个可折叠的"CSS 预览"区域，实时显示当前生成的完整 CSS 代码。

- 使用 `<pre><code>` 展示，带语法高亮（可用简单的关键词着色）
- 提供"复制 CSS"按钮
- 帮助高级用户理解和学习 CSS

---

## 四、现有代码优化

### 4.1 颜色控件改进

当前 `getColorControlValue()` 对非 `#` 开头的颜色值回退为 `#888888`，导致使用 `rgba()`、`oklch()`、`var()` 等格式的默认值无法在颜色选择器中正确显示。

**改进方案**:
1. 将 color 控件拆为"颜色选择器 + 文本输入"组合控件
2. 颜色选择器用于快速拾色（自动转换为 hex），文本输入显示实际值（支持任意 CSS 颜色格式）
3. 用户可以在文本框中直接输入 `rgba()`、`oklch()`、`var()` 等高级颜色值

### 4.2 i18n 扩展

当前特性定义中的 `label`、`hint` 直接使用中文硬编码。为了更好地支持国际化：

**方案 A（推荐，渐进式）**: 保持现状的硬编码中文，但在定义中增加 `labelKey` 和 `hintKey` 可选字段指向 i18n key。当 `labelKey` 存在时，UI 优先使用 i18n 翻译。

**方案 B（完整改造）**: 将所有 `label`/`hint` 改为 i18n key，在定义中不再包含中文文字。

当前建议采用**方案 A**，因为这不影响现有代码，可以增量添加翻译。

### 4.3 number 控件增加滑块

当前 number 类型使用 `<input type="number">`，交互不够直观。建议改为 range + number 组合：

```html
<div class="feature-control__number-group">
  <input type="range" :min="control.min" :max="control.max" :step="control.step" />
  <input type="number" :min="control.min" :max="control.max" :step="control.step" />
</div>
```

滑块提供快速调节，数字框提供精确输入。

---

## 五、开发计划

### 阶段一：组件重构与 UI 增强 (预计 1–2 天)

| 任务 | 优先级 | 预计工作量 |
|------|--------|-----------|
| 1. 抽取通用 `FeatureSection.vue`，消除组件重复 | P0 | 0.5 天 |
| 2. 在特性卡片中展示 `hint` 描述和 `preview` 标签 | P0 | 0.25 天 |
| 3. 增加特性搜索/筛选功能 | P1 | 0.25 天 |
| 4. 增加启用状态统计 | P2 | 0.1 天 |
| 5. number 控件增加 range slider | P1 | 0.25 天 |
| 6. 颜色控件改进（增加文本输入） | P1 | 0.25 天 |

### 阶段二：新增特性 — 排版与布局 (预计 1–2 天)

| 任务 | 特性 ID | 分类 |
|------|---------|------|
| 1. 正文排版 | `typographyBase` | 正文安全 |
| 2. 编辑器宽度 | `editorWidth` | 全屋改造 |
| 3. 顶栏样式 | `topBarStyle` | 全屋改造 |
| 4. 滚动条样式 | `scrollbarStyle` | 全屋改造 |
| 5. 代码块外观 | `codeBlockStyle` | 正文安全 |

### 阶段三：新增特性 — 界面美化 (预计 1–2 天)

| 任务 | 特性 ID | 分类 |
|------|---------|------|
| 1. 加粗文本样式 | `boldTextStyle` | 正文安全 |
| 2. 图片增强 | `imageEnhance` | 正文安全 |
| 3. 页签栏样式 | `tabBarStyle` | 全屋改造 |
| 4. 面包屑样式 | `breadcrumbStyle` | 全屋改造 |
| 5. 停靠栏样式 | `dockStyle` | 全屋改造 |

### 阶段四：特性分组与预设系统 (预计 1–2 天)

| 任务 | 优先级 |
|------|--------|
| 1. 增加 `group` 字段，实现特性子分组 | P1 |
| 2. 为所有已有和新增特性标注分组 | P1 |
| 3. UI 中按分组折叠展示 | P1 |
| 4. 实现用户自定义预设（保存/加载/删除） | P2 |

### 阶段五：锦上添花 (预计 1 天)

| 任务 | 优先级 |
|------|--------|
| 1. 搜索高亮色 | P2 |
| 2. 对话框样式 | P2 |
| 3. 列表标记样式 | P2 |
| 4. CSS 预览面板 | P3 |
| 5. text 控件类型（用于字体自定义输入） | P2 |

### 阶段六：测试与文档 (贯穿各阶段)

| 任务 | 说明 |
|------|------|
| 1. 为每个新特性编写单元测试 | CSS 输出断言 |
| 2. 为组件重构编写/更新组件测试 | FeatureSection 渲染断言 |
| 3. 更新 i18n 翻译文件 | 新特性标签翻译 |
| 4. 更新 `docs/project-structure.md` | 反映新文件结构 |
| 5. 运行全量测试 `npm test` | 确保无回归 |

---

## 六、技术注意事项

### 6.1 向后兼容性

- 所有新特性默认 `enabled: false`，不影响已有用户配置
- `normalizeFeatureProfile()` 已有机制自动为缺失的特性填充默认值
- 新增特性 ID 需同步添加到 `FeatureStyleId` 联合类型

### 6.2 性能考量

- CSS 按需生成，仅启用特性参与拼接，特性数量增加不影响运行时性能
- 特性定义文件体积增长需关注，考虑是否按需加载（当前单文件 1923 行已较大）
- 可考虑将定义文件按分组拆分为多个文件（`content-features.ts`、`ui-features.ts` 等）

### 6.3 CSS 选择器安全

- 所有新特性需在思源笔记多个版本中测试选择器稳定性
- 优先使用 `data-type`、`data-subtype` 等属性选择器，避免依赖不稳定的 class name
- 对于全屋改造类特性，添加 `!important` 确保覆盖主题样式

### 6.4 特性合并决策

以下新特性需要评估是否可以合并到已有特性中：
| 新特性 | 可合并至 | 决策建议 |
|--------|---------|---------|
| `imageEnhance` | 已有 `imageRadius` | ✅ 建议合并，将圆角作为增强特性的一个控件 |
| `listMarkerStyle` | 已有 `orderedListStyle` + `unorderedListMarkerColor` | ⚠️ 需评估，控件数量会较多 |

---

## 七、总结

本方案设计聚焦于三个维度的改进：

1. **新增特性** (14 个)：填补排版控制、顶栏/滚动条/代码块等高频需求空白
2. **UI 交互优化** (6 项)：组件去重、搜索筛选、控件增强、分组细化
3. **架构改进** (4 项)：颜色控件、i18n、预设系统、CSS 预览

预计总工作量 **6–9 天**，可分阶段实施，每阶段独立可交付。所有改动遵循现有架构模式（声明式特性定义 + 自动 UI 渲染），保持代码一致性和可维护性。
