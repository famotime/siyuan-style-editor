# 思源笔记主流主题功能特性抽取与插件合并分析报告

## 1. 背景与需求简述

思源样式编辑器插件（`siyuan-style-editor`）的宗旨是**通过图形化配置界面，允许用户自定义调节各种样式选项（包含正文元素和全局界面外观），实现低门槛、高自由度的个性化外观定制**。

思源笔记集市中涌现了许多深受用户喜爱的高颜值主题（如 `Asri`、`Savor`、`Tsundoku`、`Whisper` 等）。这些主题为了提供极致的视觉体验和工作流效率，开发了许多富有创意的 CSS 排版特效和交互特性。

本报告旨在分析这些主题中**可抽取、高价值、符合插件宗旨**的功能特性，并设计如何将它们**无缝集成、归类并融入本插件的 UI 设计与代码架构中**，以避免用户因为想要某一个排版特性而必须在多个主题、多个 CSS 代码片段中艰难抉择。

---

## 2. 现有插件架构与特性组织

在本插件中，所有的自定义样式特性（Features）被组织在 [src/lib/definitions](file:///d:/MyCodingProjects/siyuan-style-editor/src/lib/definitions) 目录下，并被划分为三大支柱文件：

1. **`elements.ts` (元素级样式)**
   - 关注于正文内部的具体块级/行内元素。
   - 现包含：段落悬停高亮、折叠块提示、引述块、图片增强、表格增强、分割线样式、代码块外观等。
2. **`typography.ts` (排版样式)**
   - 关注于字体、字重、标题修饰、段落行高、间距等。
   - 现包含：标题间距、标题装饰、无序列表圆点颜色、列表层次线、有序列表序号、标记文本样式、行内代码样式、链接强调、下划线/删除线样式等。
3. **`theme.ts` (全局与界面外观)**
   - 关注于思源软件的外壳、侧栏、顶栏、弹出菜单、滚动条等非正文区域。
   - 现包含：编辑区背景色、引用次数徽标、大纲数字标志、块标动画、工具条样式、斜杠菜单、表情面板、搜索面板、页签栏样式、面包屑样式、停靠栏样式等。

每个特性都是一个符合 `FeatureDefinition` 接口的对象，包含 UI 控件配置项（`controls`）、默认值（`defaults`）以及根据用户配置动态生成 CSS 的函数（`buildCss`）。

---

## 3. 候选主题特性识别与分析

我们对 `themes` 目录下的四个核心主题进行了深度剖析，识别出以下具有合并价值的功能特性：

### 3.1 Asri 主题特性分析

*   **特性 A：特定块级元素全宽显示 (`afwd`)**
    *   **描述**：Asri 允许通过文档属性或块属性控制特定的图片、视频、挂件、表格、数据库等块撑满页面宽度（突破正文最大宽度的限制）。
    *   **原理解析**：利用 CSS 属性选择器（如检测具有 `custom-afwd` 属性的节点），将其宽度设为 `100vw`，并利用 `margin-left` 和 `transform` 抵消正文居中容器的边距限制。
    *   **引入价值**：高。思源默认的“最大宽度”是全局的，某些宽表格或大型图片非常需要局部全宽以展示更多信息。
*   **特性 B：顶栏高级融合材质（亚克力/毛玻璃材质）**
    *   **描述**：将顶栏与页签栏一体化，并引入毛玻璃材质（模糊、饱和度提升），营造出更通透、更 premium 的视觉感。
    *   **原理解析**：使用 CSS 的 `backdrop-filter: blur(20px) saturate(180%)`，配合半透明的强调色或背景色，消除顶栏底部的分割线。
    *   **引入价值**：极高。这能极大提升本插件在“操作界面”分类下的颜值表现。

### 3.2 Savor 主题特性分析

*   **特性 C：列表形态变换（列表转看板 / 转思维导图）**
    *   **描述**：通过给无序列表添加特定属性（如 `f: kb` 或 `f: dt`），让本来的纵向列表渲染为横向平铺的看板卡片，或渲染为带有层级指示线、水平横铺的思维导图。
    *   **原理解析**：利用 Flexbox/Grid 改变 `.list > .li` 的排列方向；使用伪元素 `::before`/`::after` 和绝对定位绘制分支连线。
    *   **引入价值**：极高。这是思源社区极受欢迎的“黑魔法”排版特性，无需安装重型插件即可在文档中直接生成简易脑图和看板。
*   **特性 D：行内/侧栏备注美化与动画**
    *   **描述**：将文本行内备注 (`span[data-type~=memo]`) 重排为醒目的行内上浮标志，或者在侧边悬浮，鼠标悬浮时产生连线和缩放动效。
    *   **原理解析**：利用属性选择器定位 `span[data-type~=memo]`，对其背景、圆角及悬停伪类定义过渡动画。
    *   **引入价值**：中高。思源默认备注样式极为隐蔽（仅一条虚线下划线），美化后能极大增加备注的实用价值。

### 3.3 Tsundoku (积书) 主题特性分析

*   **特性 E：智能链接图标区分 (`linkIcons`)**
    *   **描述**：自动识别超链接的目标。如果是思源内部链接（以 `siyuan://` 开头），在链接前显示内部链接图标（如 🔗）；如果是外网链接（以 `http` 开头），则显示外网图标（如 🌐）。
    *   **原理解析**：使用属性选择器 `span[data-type~=a][href^="siyuan://"]::before` 和 `span[data-type~=a][href^="http"]::before` 动态插入 `content` 字符或小图标。
    *   **引入价值**：高。能让阅读者一眼区分是跳转至其他笔记块还是打开浏览器，提升阅读认知效率。
*   **特性 F：主动召回记忆挖空块 (`activeRecallHide`)**
    *   **描述**：用于背诵场景。将特定标记（如 Mark 标记）的文本或特定块“挖空”（变黑或高斯模糊），只有当鼠标悬停在其上时才显示真实文字。
    *   **原理解析**：对目标元素应用 `filter: blur(6px)` 或 `background-color: var(--b3-theme-on-background)` 并将字色设为与背景相同；在 `:hover` 或 `:focus` 时重置。
    *   **引入价值**：高。对备考者或需要背诵核心概念的用户非常实用。
*   **特性 G：标题级别几何指示器**
    *   **描述**：在 H1 - H6 标题后面绘制一组小圆点或小方块。数量与标题级别对应（例如，H1 后有 1 个小点，H3 后有 3 个小点）。
    *   **原理解析**：利用标题选择器的伪元素 `::after` 配以 `box-shadow` 产生多重阴影，生成排练好的几何序列。
    *   **引入价值**：中高。这是一种极具趣味性且优雅的排版辅助，帮助用户在长文中感知当前标题的位置和级别。
*   **特性 H：无序列表层级符号自动循环 (•, ◦, ▪)**
    *   **描述**：随着列表缩进加深，自动在“实心圆”、“空心圆”、“实心方块”间循环，而不是思源默认的单调小圆点。
    *   **原理解析**：使用嵌套的 `ul > li > ul > li` 选择器指定不同的 `content`。
    *   **引入价值**：高。符合人们在 Word/Notion 中习惯的多级大纲视觉逻辑。

---

## 4. 特性合并可行性评估与分类方案

我们将识别出的特性与本插件现有的三个定义大类进行对齐，并评估其集成可行性：

| 识别特性 | 建议合并至分类 | 现有特性对齐与处理建议 | 推荐优先级 |
| :--- | :--- | :--- | :--- |
| **A. 特定块全宽显示** | `elements.ts` | 建议合并入【块级元素】组。定义为新特性 `blockFullWidth`，用户可单独控制图片/视频/表格等是否全宽。 | **High** |
| **B. 顶栏亚克力/毛玻璃融合** | `theme.ts` | 建议直接合并进已有的 `topBarStyle` 特性，在 `styleMode` 下拉菜单中增加 `glass` (毛玻璃) 和 `acrylic` (亚克力) 选项。 | **Critical** (高颜值主打) |
| **C. 列表转看板/脑图** | `elements.ts` | 建议在【列表】组下定义新特性 `listTransform`，通过 CSS 开关支持。 | **High** |
| **D. 备注美化与动画** | `elements.ts` | 建议在【行内元素】下定义新特性 `memoStyle`，控制备注的常显模式与连线动效。 | **Medium** |
| **E. 智能链接图标区分** | `elements.ts` | 建议直接融入已有的 `linkStyle` (超链接强调) 特性，增加 `showSmartIcons` 开关和配置控件。 | **High** |
| **F. 主动召回记忆挖空** | `elements.ts` | 建议在【行内元素】下定义新特性 `activeRecallHide`，控制挖空遮罩效果。 | **Medium** |
| **G. 标题级别几何指示器** | `typography.ts` | 建议直接合并入已有的 `headingDecoration` (标题装饰) 特性，在 `mode` 中添加 `levelDots` (级别几何指示器) 选项。 | **High** |
| **H. 无序列表多级循环符号** | `elements.ts` | 建议直接合并入已有的 `listMarkerStyle` (列表符号样式) 特性，或者作为独立的 `multiLevelBullets` 开关。 | **High** |

---

## 5. 推荐合并方案与 UI 控件设计

以下是为上述推荐合并的特性所设计的接口定义、UI 控件结构以及生成 CSS 的核心逻辑骨架。

### 5.1 顶栏融合高级材质拓展 (`topBarStyle` 升级)

直接升级 `theme.ts` 中的 `topBarStyle` 特性，为用户提供毛玻璃或亚克力的高级质感。

#### UI 控件设计 (Controls)
```typescript
{
  key: "styleMode",
  label: "顶栏风格",
  options: [
    { label: "默认", value: "default" },
    { label: "隐藏顶栏", value: "hidden" },
    { label: "光感玻璃 (Glassmorphism)", value: "glass" },
    { label: "沉浸亚克力 (Acrylic)", value: "acrylic" }
  ],
  type: "select"
}
```

#### CSS 生成核心逻辑
```typescript
if (styleMode === "glass") {
  return `
    #toolbar {
      background-color: var(--b3-theme-background-translucent, rgba(255, 255, 255, 0.65)) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      border-bottom: 1px solid var(--b3-theme-surface-lighter, rgba(0, 0, 0, 0.05)) !important;
    }
    .layout-tab-container {
      background-color: transparent !important;
    }
  `;
}
```

---

### 5.2 标题装饰 - 级别几何指示器 (`headingDecoration` 升级)

升级 `typography.ts` 中的 `headingDecoration`，提供积书主题（Tsundoku）的标题层级小点指示。

#### UI 控件设计 (Controls)
```typescript
{
  key: "mode",
  label: "装饰风格",
  options: [
    { label: "左竖线", value: "leftBar" },
    { label: "下划线", value: "underline" },
    { label: "层级几何指示点", value: "levelDots" }
  ],
  type: "select"
}
```

#### CSS 生成核心逻辑
```typescript
if (mode === "levelDots") {
  return `
    .protyle-wysiwyg .h1>[spellcheck]:not(:empty)::after {
      content: ""; position: absolute; margin-left: 6px; height: 8px; width: 4px; bottom: 40%;
      background-color: var(--b3-theme-primary); opacity: 0.6; border-radius: 2px;
    }
    .protyle-wysiwyg .h2>[spellcheck]:not(:empty)::after {
      content: ""; position: absolute; margin-left: 6px; height: 6px; width: 6px; bottom: 40%;
      background-color: var(--b3-theme-primary); opacity: 0.6; border-radius: 50%;
      box-shadow: 10px 0 0 var(--b3-theme-primary);
    }
    /* H3 及以下依此类推，利用 box-shadow 绘制多个排列好的圆点 */
  `;
}
```

---

### 5.3 新增特性：智能超链接图标 (`linkIcons`)

将超链接区分处理，增强文章的指引性。

#### UI 控件设计 (Controls)
```typescript
export const LINK_ICONS_DEFINITION: FeatureDefinition = {
  value: "linkIcons",
  label: "智能链接图标",
  hint: "自动为块引用与外部超链接添加不同的区分图标。",
  group: "行内元素",
  preview: "🔗 🌐",
  risk: "正文安全",
  controls: [
    {
      key: "internalIcon",
      label: "内链图标",
      type: "text",
      placeholder: "如 🔗"
    },
    {
      key: "externalIcon",
      label: "外链图标",
      type: "text",
      placeholder: "如 🌐"
    }
  ],
  defaults: createDefaultConfig({
    internalIcon: "🔗",
    externalIcon: "🌐"
  }),
  buildCss: (config) => {
    const intIcon = stringValue(config.values.internalIcon, "🔗");
    const extIcon = stringValue(config.values.externalIcon, "🌐");
    return `
      .protyle-wysiwyg span[data-type~="block-ref"]::before {
        content: "${intIcon} ";
        font-size: 0.85em;
        margin-right: 2px;
      }
      .protyle-wysiwyg span[data-type~="a"]:not([href^="siyuan://"])::before {
        content: "${extIcon} ";
        font-size: 0.85em;
        margin-right: 2px;
      }
    `;
  }
}
```

---

### 5.4 新增特性：记忆卡片挖空块 (`activeRecallHide`)

支持复习与背诵，提供鼠标悬停才显现的秘密文字样式。

#### UI 控件设计 (Controls)
```typescript
export const ACTIVE_RECALL_DEFINITION: FeatureDefinition = {
  value: "activeRecallHide",
  label: "记忆卡片挖空",
  hint: "使文档中带有特定标记（如高亮 Mark）的文字呈遮罩挖空状态，悬浮显现，助力背诵。",
  group: "行内元素",
  preview: "■■■■",
  risk: "正文安全",
  controls: [
    {
      key: "maskMode",
      label: "遮罩模式",
      options: [
        { label: "黑块覆盖 (Redaction)", value: "blackout" },
        { label: "高斯模糊 (Blur)", value: "blur" }
      ],
      type: "select"
    },
    {
      key: "blurRadius",
      label: "模糊半径",
      max: 12,
      min: 2,
      step: 1,
      type: "number",
      unit: "px"
    }
  ],
  defaults: createDefaultConfig({
    maskMode: "blur",
    blurRadius: 6
  }),
  buildCss: (config) => {
    const mode = stringValue(config.values.maskMode, "blur");
    const radius = px(config.values.blurRadius, 6);
    
    if (mode === "blur") {
      return `
        .protyle-wysiwyg mark[data-recall="true"],
        .protyle-wysiwyg span[data-type~="mark"][data-recall="true"] {
          filter: blur(${radius}) !important;
          transition: filter 0.2s ease-in-out !important;
          cursor: pointer;
        }
        .protyle-wysiwyg mark[data-recall="true"]:hover,
        .protyle-wysiwyg span[data-type~="mark"][data-recall="true"]:hover {
          filter: none !important;
        }
      `;
    } else {
      return `
        .protyle-wysiwyg mark[data-recall="true"],
        .protyle-wysiwyg span[data-type~="mark"][data-recall="true"] {
          background-color: var(--b3-theme-on-background) !important;
          color: var(--b3-theme-on-background) !important;
          border-radius: 2px !important;
          transition: background-color 0.2s ease, color 0.2s ease !important;
          cursor: pointer;
        }
        .protyle-wysiwyg mark[data-recall="true"]:hover,
        .protyle-wysiwyg span[data-type~="mark"][data-recall="true"]:hover {
          background-color: var(--b3-theme-background) !important;
          color: var(--b3-theme-on-background) !important;
        }
      `;
    }
  }
}
```

---

## 6. 注意事项与潜在限制

1.  **CSS 优先级竞争**：
    *   抽取的样式多使用 `!important`，这在与用户当前正在使用的主题样式竞争时可以确保本插件的配置生效。然而，如果某些高阶主题本身在 JavaScript 中动态计算并绑定了内联样式，或者主题样式表的选择器权重极高，仍可能产生极少数冲突。
2.  **自定义属性的依赖度**：
    *   例如 `列表形态变换（看板/脑图）` 和 `记忆卡片挖空`，需要在思源的块上加上自定义属性（如 `data-recall="true"`，或者是特定的属性）。虽然 CSS 能够实现完美的视觉转换，但用户可能需要手动为块添加块属性。
    *   **应对建议**：在插件的 Hint 提示中明确写明如何添加块属性，或在后期为插件添加少量的 JS 辅助（例如在块标右键菜单中增加快捷添加属性项），使整个体验更流畅。
3.  **渲染性能考虑**：
    *   毛玻璃特效（`backdrop-filter`）在拥有数万字、包含大量复杂块的巨型文档中，可能对部分低配置设备或核显设备的滚动性能造成轻微负担。
    *   **应对建议**：在本插件 UI 的“毛玻璃顶栏”选项卡中贴心加入性能小提示，提示其被归为“全屋改造”且存在一定渲染成本。

---

**报告撰写日期**：2026年7月2日
**分析人员**：Antigravity (AI Coding Assistant)
