import type { FeatureDefinition } from "../feature-style-types"
import {
  createDefaultConfig,
  numberValue,
  px,
  stringValue,
} from "../feature-style-types"

function hexToRgb(hex: string): string {
  const h = hex.replace(/^#/, "")
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16)
    const g = parseInt(h[1] + h[1], 16)
    const b = parseInt(h[2] + h[2], 16)
    return `${r}, ${g}, ${b}`
  }
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

export const THEME_DEFINITIONS: FeatureDefinition[] = [
  {
    buildCss: (config) => `
:root {
  --b3-theme-background: ${stringValue(config.values.backgroundColor, "var(--style-editor-editor-bg)")};
}`.trim(),
    controls: [
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "var(--style-editor-editor-bg)",
    }),
    hint: "覆盖编辑区背景变量，影响整个阅读和编辑外壳。",
    label: "编辑区背景色",
    group: "文档外观",
    preview: "背景",
    risk: "全屋改造",
    value: "editorBackground",
  },
  {
    buildCss: (config) => `
.protyle-wysiwyg [data-node-id][refcount] {
  position: relative;
  outline: none;
}

.protyle-wysiwyg [data-node-id][refcount]::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: ${px(config.values.cornerLength, 12)};
  height: ${px(config.values.cornerLength, 12)};
  border-top: ${px(config.values.strokeWidth, 2)} solid ${stringValue(config.values.color, "rgba(255, 165, 0, 0.7)")};
  border-left: ${px(config.values.strokeWidth, 2)} solid ${stringValue(config.values.color, "rgba(255, 165, 0, 0.7)")};
  pointer-events: none;
  box-sizing: border-box;
}

.protyle-wysiwyg [data-node-id][refcount]::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  width: ${px(config.values.cornerLength, 12)};
  height: ${px(config.values.cornerLength, 12)};
  border-right: ${px(config.values.strokeWidth, 2)} solid ${stringValue(config.values.color, "rgba(255, 165, 0, 0.7)")};
  border-bottom: ${px(config.values.strokeWidth, 2)} solid ${stringValue(config.values.color, "rgba(255, 165, 0, 0.7)")};
  pointer-events: none;
  box-sizing: border-box;
}

[data-type="NodeBlockQueryEmbed"] [data-node-id][refcount]::before,
[data-type="NodeBlockQueryEmbed"] [data-node-id][refcount]::after {
  display: none;
}`.trim(),
    controls: [
      {
        key: "color",
        label: "角标颜色",
        type: "color",
      },
      {
        key: "cornerLength",
        label: "角标长度",
        max: 32,
        min: 4,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "strokeWidth",
        label: "线条粗细",
        max: 6,
        min: 1,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      color: "rgba(255, 165, 0, 0.7)",
      cornerLength: 12,
      strokeWidth: 2,
    }),
    hint: "为有引用计数的正文块增加两角短实线提示。",
    label: "被引用块角标",
    group: "引用与链接",
    preview: "被引用",
    risk: "正文安全",
    value: "referencedBlockCorners",
  },
  {
    buildCss: (config) => `
.protyle-attr--refcount {
  height: ${px(config.values.size, 16)};
  width: ${px(config.values.size, 16)};
  padding: 0;
  line-height: ${px(config.values.size, 16)};
  text-align: center;
  background-color: ${stringValue(config.values.backgroundColor, "oklch(50% 0.02 250 / 0.3)")};
  color: ${stringValue(config.values.color, "oklch(75% 0 0)")};
  border-radius: ${px(config.values.radius, 3)};
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
}

.protyle-attr--refcount:hover {
  background-color: ${stringValue(config.values.hoverBackgroundColor, "oklch(60% 0.15 250 / 0.95)")};
  color: ${stringValue(config.values.hoverColor, "white")};
  transform: scale(${numberValue(config.values.hoverScale, 1.15)});
  box-shadow: 0 0 ${px(config.values.glowSize, 10)} ${stringValue(config.values.glowColor, "oklch(70% 0.25 250 / 1)")};
}`.trim(),
    controls: [
      {
        key: "backgroundColor",
        label: "徽标底色",
        type: "color",
      },
      {
        key: "color",
        label: "徽标字色",
        type: "color",
      },
      {
        key: "hoverBackgroundColor",
        label: "悬停底色",
        type: "color",
      },
      {
        key: "glowColor",
        label: "发光颜色",
        type: "color",
      },
      {
        key: "size",
        label: "徽标尺寸",
        max: 28,
        min: 12,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "radius",
        label: "圆角",
        max: 12,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "hoverScale",
        label: "悬停放大",
        max: 1.8,
        min: 1,
        step: 0.05,
        type: "number",
      },
      {
        key: "glowSize",
        label: "发光强度",
        max: 24,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "oklch(50% 0.02 250 / 0.3)",
      color: "oklch(75% 0 0)",
      glowColor: "oklch(70% 0.25 250 / 1)",
      glowSize: 10,
      hoverBackgroundColor: "oklch(60% 0.15 250 / 0.95)",
      hoverColor: "white",
      hoverScale: 1.15,
      radius: 3,
      size: 16,
    }),
    hint: "调整块右上角引用次数徽标的颜色、尺寸和悬停反馈。",
    label: "引用次数徽标",
    group: "引用与链接",
    preview: "3",
    risk: "正文安全",
    value: "refcountBadge",
  },
  {
    buildCss: (config) => `
.protyle-hint {
  padding: ${px(config.values.paddingY, 2)} ${px(config.values.paddingX, 5)};
  border-radius: ${px(config.values.radius, 6)};
  max-height: ${stringValue(config.values.maxHeight, "50vh")};
  overflow-y: auto;
}
.protyle-hint .b3-list-item {
  margin: ${px(config.values.itemMarginY, 5)} 0;
  min-height: ${px(config.values.itemMinHeight, 45)};
  border-radius: ${px(config.values.itemRadius, 6)};
}
.b3-list--background .b3-list-item:hover:not(.b3-list-item--focus):not(.dragover),
.b3-list--background .b3-list-item--focus:not(.dragover) {
  background-color: ${stringValue(config.values.hoverBgColor, "var(--style-editor-card-bg-soft)")};
}`.trim(),
    controls: [
      {
        key: "hoverBgColor",
        label: "悬停背景",
        type: "color",
      },
      {
        key: "radius",
        label: "容器圆角",
        max: 12,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "itemMinHeight",
        label: "选项最小高度",
        max: 72,
        min: 28,
        step: 4,
        type: "number",
        unit: "px",
      },
      {
        key: "maxHeight",
        label: "最大高度",
        options: [
          {
            label: "40vh",
            value: "40vh",
          },
          {
            label: "50vh",
            value: "50vh",
          },
          {
            label: "60vh",
            value: "60vh",
          },
          {
            label: "70vh",
            value: "70vh",
          },
        ],
        type: "select",
      },
    ],
    defaults: createDefaultConfig({
      hoverBgColor: "var(--style-editor-card-bg-soft)",
      itemMinHeight: 45,
      itemMarginY: 5,
      itemRadius: 6,
      maxHeight: "50vh",
      paddingX: 5,
      paddingY: 2,
      radius: 6,
    }),
    hint: "调整引用搜索菜单的候选项高度、圆角和悬停背景。",
    label: "引用搜索菜单",
    group: "引用与链接",
    preview: "搜索",
    risk: "全屋改造",
    value: "refSearchMenu",
  },
  {
    buildCss: (config) => `
.backlinkMList .b3-list-item,
.backlinkList .b3-list-item {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: ${stringValue(config.values.backgroundColor, "var(--b3-list-hover, #363636)")};
}`.trim(),
    controls: [
      {
        key: "backgroundColor",
        label: "固定背景",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "var(--b3-list-hover, #363636)",
    }),
    hint: "在反链和提及面板中固定文档名称不随滚动消失。",
    label: "反链固定标题",
    group: "引用与链接",
    preview: "反链",
    risk: "全屋改造",
    value: "backlinkSticky",
  },
  {
    buildCss: (config) => `
.protyle-title__input {
  font-size: ${px(config.values.fontSize, 40)};
}
.protyle-title__input:empty:after {
  color: ${stringValue(config.values.placeholderColor, "oklch(32.89% 0.0107 91.66 / 0.5)")};
}`.trim(),
    controls: [
      {
        key: "fontSize",
        label: "标题字号",
        max: 64,
        min: 20,
        step: 2,
        type: "number",
        unit: "px",
      },
      {
        key: "placeholderColor",
        label: "占位提示色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      fontSize: 40,
      placeholderColor: "oklch(32.89% 0.0107 91.66 / 0.5)",
    }),
    hint: "调整文档标题字号和空标题占位提示颜色。",
    label: "文档标题",
    group: "文档外观",
    preview: "标题",
    risk: "全屋改造",
    value: "documentTitle",
  },
  {
    buildCss: (config) => `
.protyle-background .protyle-background__img img {
  margin: 0 ${px(config.values.marginX, 5)};
  border-radius: ${px(config.values.radius, 6)};
  width: calc(100% - ${px(config.values.marginX * 2, 10)});
}`.trim(),
    controls: [
      {
        key: "radius",
        label: "图片圆角",
        max: 24,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "marginX",
        label: "左右边距",
        max: 24,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      marginX: 5,
      radius: 6,
    }),
    hint: "调整头图圆角和左右边距。",
    label: "头图样式",
    group: "文档外观",
    preview: "头图",
    risk: "全屋改造",
    value: "headImage",
  },
  {
    buildCss: (config) => `
.b3-chips__doctag .b3-chip {
  border-radius: ${px(config.values.radius, 6)};
  padding: 0 0 1px ${px(config.values.paddingX, 8)};
  font-size: ${numberValue(config.values.fontSize, 90)}%;
  font-weight: ${numberValue(config.values.fontWeight, 600)};
}
.b3-chips__doctag .b3-chip::before {
  content: "#";
}
.b3-chips__doctag .b3-chip.b3-chip--secondary {
  background-color: ${stringValue(config.values.secondaryBg, "var(--style-editor-tag-bg)")};
  color: ${stringValue(config.values.secondaryColor, "var(--style-editor-tag-color)")};
}`.trim(),
    controls: [
      {
        key: "secondaryBg",
        label: "标签底色",
        type: "color",
      },
      {
        key: "secondaryColor",
        label: "标签字色",
        type: "color",
      },
      {
        key: "radius",
        label: "标签圆角",
        max: 16,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      fontSize: 90,
      fontWeight: 600,
      paddingX: 8,
      radius: 6,
      secondaryBg: "var(--style-editor-tag-bg)",
      secondaryColor: "var(--style-editor-tag-color)",
    }),
    hint: "调整头图下方文档标签的圆角、颜色和字号。",
    label: "文档标签",
    group: "文档外观",
    preview: "标签",
    risk: "全屋改造",
    value: "docTag",
  },
  {
    buildCss: (config) => `
.sy__file .b3-list--background:nth-child(5n-4) {
  background-color: ${stringValue(config.values.color1, "var(--style-editor-tree-block-1)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color1, "var(--style-editor-tree-block-1)")} inset;
  border-radius: ${px(config.values.radius, 6)};
}
.sy__file .b3-list--background:nth-child(5n-3) {
  background-color: ${stringValue(config.values.color2, "var(--style-editor-tree-block-2)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color2, "var(--style-editor-tree-block-2)")} inset;
  border-radius: ${px(config.values.radius, 6)};
}
.sy__file .b3-list--background:nth-child(5n-2) {
  background-color: ${stringValue(config.values.color3, "var(--style-editor-tree-block-3)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color3, "var(--style-editor-tree-block-3)")} inset;
  border-radius: ${px(config.values.radius, 6)};
}
.sy__file .b3-list--background:nth-child(5n-1) {
  background-color: ${stringValue(config.values.color4, "var(--style-editor-tree-block-4)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color4, "var(--style-editor-tree-block-4)")} inset;
  border-radius: ${px(config.values.radius, 6)};
}
.sy__file .b3-list--background:nth-child(5n) {
  background-color: ${stringValue(config.values.color5, "var(--style-editor-tree-block-5)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color5, "var(--style-editor-tree-block-5)")} inset;
  border-radius: ${px(config.values.radius, 6)};
}
.sy__file .b3-list--background:nth-child(5n-4),
.sy__file .b3-list--background:nth-child(5n-3),
.sy__file .b3-list--background:nth-child(5n-2),
.sy__file .b3-list--background:nth-child(5n-1),
.sy__file .b3-list--background:nth-child(5n) {
  margin: ${px(config.values.gapY, 4)} 0;
}`.trim(),
    controls: [
      {
        key: "color1",
        label: "分组色 1",
        type: "color",
      },
      {
        key: "color2",
        label: "分组色 2",
        type: "color",
      },
      {
        key: "color3",
        label: "分组色 3",
        type: "color",
      },
      {
        key: "radius",
        label: "圆角",
        max: 12,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      color1: "var(--style-editor-tree-block-1)",
      color2: "var(--style-editor-tree-block-2)",
      color3: "var(--style-editor-tree-block-3)",
      color4: "var(--style-editor-tree-block-4)",
      color5: "var(--style-editor-tree-block-5)",
      gapY: 4,
      radius: 6,
    }),
    hint: "为文档树条目按五色循环设置彩色分块背景。",
    label: "文档树彩色分块",
    group: "导航与面板",
    preview: "树",
    risk: "全屋改造",
    value: "docTreeColorBlocks",
  },
  {
    buildCss: (config) => `
.sy__outline ul.b3-list.b3-list--background [data-subtype*="h"] > span:first-child::after {
  visibility: visible !important;
  position: relative;
  left: 8px;
  border-radius: 4px;
  opacity: 1;
  font-size: ${px(config.values.fontSize, 10)};
  pointer-events: none;
}
.sy__outline ul.b3-list.b3-list--background [data-subtype="h1"] > span:first-child::after { content: "❶"; color: ${stringValue(config.values.h1Color, "var(--style-editor-outline-h1)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h2"] > span:first-child::after { content: "❷"; color: ${stringValue(config.values.h2Color, "var(--style-editor-outline-h2)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h3"] > span:first-child::after { content: "❸"; color: ${stringValue(config.values.h3Color, "var(--style-editor-outline-h3)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h4"] > span:first-child::after { content: "❹"; color: ${stringValue(config.values.h4Color, "var(--style-editor-outline-h4)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h5"] > span:first-child::after { content: "❺"; color: ${stringValue(config.values.h5Color, "var(--style-editor-outline-h5)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h6"] > span:first-child::after { content: "❻"; color: ${stringValue(config.values.h6Color, "var(--style-editor-outline-h6)")}; }`.trim(),
    controls: [
      {
        key: "h1Color",
        label: "H1 颜色",
        type: "color",
      },
      {
        key: "h2Color",
        label: "H2 颜色",
        type: "color",
      },
      {
        key: "h3Color",
        label: "H3 颜色",
        type: "color",
      },
      {
        key: "fontSize",
        label: "字号",
        max: 16,
        min: 8,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      fontSize: 10,
      h1Color: "var(--style-editor-outline-h1)",
      h2Color: "var(--style-editor-outline-h2)",
      h3Color: "var(--style-editor-outline-h3)",
      h4Color: "var(--style-editor-outline-h4)",
      h5Color: "var(--style-editor-outline-h5)",
      h6Color: "var(--style-editor-outline-h6)",
    }),
    hint: "在大纲标题前显示彩色数字标志。",
    label: "大纲数字标志",
    group: "导航与面板",
    preview: "❶",
    risk: "全屋改造",
    value: "outlineNumber",
  },
  {
    buildCss: (config) => `
.protyle-gutters {
  transition: top ${numberValue(config.values.transitionMs, 150)}ms ease-out;
}
.protyle-gutters button svg {
  color: ${stringValue(config.values.iconColor, "var(--style-editor-list-marker)")};
  border-radius: ${px(config.values.iconRadius, 4)};
}
.protyle-gutters button:hover svg {
  background-color: ${stringValue(config.values.hoverBg, "var(--style-editor-toolbar-hover-bg)")};
}`.trim(),
    controls: [
      {
        key: "iconColor",
        label: "图标颜色",
        type: "color",
      },
      {
        key: "hoverBg",
        label: "悬停背景",
        type: "color",
      },
      {
        key: "transitionMs",
        label: "过渡时间",
        max: 400,
        min: 0,
        step: 50,
        type: "number",
        unit: "ms",
      },
    ],
    defaults: createDefaultConfig({
      hoverBg: "var(--style-editor-toolbar-hover-bg)",
      iconColor: "var(--style-editor-list-marker)",
      iconRadius: 4,
      transitionMs: 150,
    }),
    hint: "调整块标图标颜色、悬停背景和移动过渡速度。",
    label: "块标动画",
    group: "操作界面",
    preview: "⋮⋮",
    risk: "全屋改造",
    value: "blockGutterAnim",
  },
  {
    buildCss: (config) => `
.protyle-toolbar {
  padding: ${px(config.values.padding, 2)};
}
.protyle-toolbar .protyle-toolbar__item {
  height: ${px(config.values.buttonSize, 28)};
  width: ${px(config.values.buttonSize, 28)};
  border-radius: ${px(config.values.buttonRadius, 4)};
}
.protyle-toolbar .protyle-toolbar__item:hover {
  background-color: ${stringValue(config.values.hoverBg, "var(--style-editor-toolbar-hover-bg)")};
}
.protyle-toolbar .protyle-toolbar__item--current {
  color: ${stringValue(config.values.currentColor, "var(--style-editor-toolbar-current)")};
}`.trim(),
    controls: [
      {
        key: "hoverBg",
        label: "悬停背景",
        type: "color",
      },
      {
        key: "currentColor",
        label: "选中项颜色",
        type: "color",
      },
      {
        key: "buttonSize",
        label: "按钮尺寸",
        max: 40,
        min: 20,
        step: 2,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      buttonRadius: 4,
      buttonSize: 28,
      currentColor: "var(--style-editor-toolbar-current)",
      hoverBg: "var(--style-editor-toolbar-hover-bg)",
      padding: 2,
    }),
    hint: "调整文字工具条的按钮尺寸、悬停背景和选中项颜色。",
    label: "工具条样式",
    group: "操作界面",
    preview: "工具",
    risk: "全屋改造",
    value: "toolbarStyle",
  },
  {
    buildCss: (config) => `
.hint--menu {
  border-radius: ${px(config.values.radius, 6)};
  padding: ${px(config.values.padding, 5)};
}
.hint--menu > div {
  min-width: ${stringValue(config.values.minWidth, "50vw")};
  column-width: ${px(config.values.columnWidth, 180)};
}
.hint--menu .b3-list-item__text {
  color: ${stringValue(config.values.textColor, "rgb(240, 240, 240)")};
}`.trim(),
    controls: [
      {
        key: "radius",
        label: "菜单圆角",
        max: 16,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "columnWidth",
        label: "列宽度",
        max: 280,
        min: 120,
        step: 20,
        type: "number",
        unit: "px",
      },
      {
        key: "textColor",
        label: "文字颜色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      columnWidth: 180,
      minWidth: "50vw",
      padding: 5,
      radius: 6,
      textColor: "rgb(240, 240, 240)",
    }),
    hint: "调整斜杠菜单的列宽、圆角和文字颜色。",
    label: "斜杠菜单",
    group: "操作界面",
    preview: "/",
    risk: "全屋改造",
    value: "slashMenu",
  },
  {
    buildCss: (config) => `
.emojis {
  width: ${px(config.values.panelWidth, 366)} !important;
}
.emojis__item {
  height: ${px(config.values.itemSize, 32)};
  width: ${px(config.values.itemSize, 32)};
  font-size: ${px(config.values.emojiFontSize, 22)};
}`.trim(),
    controls: [
      {
        key: "panelWidth",
        label: "面板宽度",
        max: 480,
        min: 280,
        step: 10,
        type: "number",
        unit: "px",
      },
      {
        key: "itemSize",
        label: "表情尺寸",
        max: 48,
        min: 24,
        step: 2,
        type: "number",
        unit: "px",
      },
      {
        key: "emojiFontSize",
        label: "字号",
        max: 36,
        min: 14,
        step: 2,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      emojiFontSize: 22,
      itemSize: 32,
      panelWidth: 366,
    }),
    hint: "调整表情面板宽度和表情项尺寸。",
    label: "表情面板",
    group: "操作界面",
    preview: "😊",
    risk: "全屋改造",
    value: "emojiPanel",
  },
  {
    buildCss: (config) => `
.fn__flex-column #searchList > .b3-list-item[data-type='search-item'] {
  padding-bottom: ${px(config.values.itemPaddingBottom, 20)};
  margin: ${px(config.values.itemMargin, 6)};
}
.fn__flex-column #searchList .b3-list-item[data-type='search-item'] > .b3-list-item__text {
  line-height: ${numberValue(config.values.lineHeight, 1.3)};
}
.fn__flex-column #searchList > .b3-list-item:not([data-type='search-item']):not([data-type="search-new"]) {
  border-radius: ${px(config.values.groupRadius, 4)} ${px(config.values.groupRadius, 4)} 0 0;
  margin: ${px(config.values.itemMargin, 6)} ${px(config.values.itemMargin, 6)} 0 ${px(config.values.itemMargin, 6)};
}`.trim(),
    controls: [
      {
        key: "itemMargin",
        label: "条目间距",
        max: 16,
        min: 0,
        step: 2,
        type: "number",
        unit: "px",
      },
      {
        key: "lineHeight",
        label: "行高",
        max: 2,
        min: 1,
        step: 0.1,
        type: "number",
      },
      {
        key: "groupRadius",
        label: "分组圆角",
        max: 12,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      groupRadius: 4,
      itemMargin: 6,
      itemPaddingBottom: 20,
      lineHeight: 1.3,
    }),
    hint: "调整多行搜索结果的间距、行高和分组圆角。",
    label: "搜索面板",
    group: "导航与面板",
    preview: "搜索",
    risk: "全屋改造",
    value: "searchPanel",
  },
  {
    value: "editorWidth",
    label: "编辑器宽度",
    hint: "自定义编辑区最大宽度和内容内边距",
    group: "文档外观",
    preview: "↔️",
    risk: "全屋改造",
    controls: [
      {
        key: "maxWidth",
        label: "最大宽度",
        type: "number",
        min: 600,
        max: 2000,
        step: 10,
        unit: "px",
        slider: true,
      },
      {
        key: "fullWidth",
        label: "全宽模式",
        type: "select",
        options: [{
          label: "否",
          value: "no",
        }, {
          label: "是",
          value: "yes",
        }],
      },
      {
        key: "contentPadding",
        label: "内容边距",
        type: "number",
        min: 0,
        max: 60,
        step: 2,
        unit: "px",
        slider: true,
      },
    ],
    defaults: createDefaultConfig({
      maxWidth: 900,
      fullWidth: "no",
      contentPadding: 16,
    }),
    buildCss: (config) => {
      const maxWidth = px(config.values.maxWidth, 900)
      const fullWidth = stringValue(config.values.fullWidth, "no")
      const contentPadding = px(config.values.contentPadding, 16)

      const widthRule = fullWidth === "yes"
        ? ".protyle-content { max-width: 100% !important; }"
        : `.protyle-content { max-width: ${maxWidth} !important; }`

      return `${widthRule}

.protyle-content {
  padding-left: ${contentPadding} !important;
  padding-right: ${contentPadding} !important;
}`
    },
  },
  {
    value: "topBarStyle",
    label: "顶栏样式",
    hint: "自定义顶栏背景、高度和边框（透明/毛玻璃/自定义色）",
    group: "操作界面",
    preview: "🔧",
    risk: "全屋改造",
    controls: [
      {
        key: "mode",
        label: "风格",
        type: "select",
        options: [
          {
            label: "默认",
            value: "default",
          },
          {
            label: "透明",
            value: "transparent",
          },
          {
            label: "毛玻璃",
            value: "glass",
          },
          {
            label: "沉浸亚克力",
            value: "acrylic",
          },
        ],
      },
      {
        key: "blurRadius",
        label: "模糊半径",
        type: "number",
        min: 0,
        max: 20,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
      {
        key: "height",
        label: "高度",
        type: "number",
        min: 32,
        max: 48,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "borderBottom",
        label: "底边线",
        type: "select",
        options: [{
          label: "显示",
          value: "show",
        }, {
          label: "隐藏",
          value: "hide",
        }],
      },
    ],
    defaults: createDefaultConfig({
      mode: "default",
      blurRadius: 12,
      backgroundColor: "#ffffff",
      height: 36,
      borderBottom: "show",
    }),
    buildCss: (config) => {
      const mode = stringValue(config.values.mode, "default")
      const blurRadius = px(config.values.blurRadius, 12)
      const backgroundColor = stringValue(config.values.backgroundColor, "#ffffff")
      const height = px(config.values.height, 36)
      const borderBottom = stringValue(config.values.borderBottom, "show")

      const rules: string[] = [`#toolbar { height: ${height} !important; }`]

      if (mode === "transparent") {
        rules.push("#toolbar { background: transparent !important; }")
      } else if (mode === "glass") {
        rules.push(`#toolbar { background: ${backgroundColor}cc !important; backdrop-filter: blur(${blurRadius}) !important; -webkit-backdrop-filter: blur(${blurRadius}) !important; }`)
      } else if (mode === "acrylic") {
        rules.push(`#toolbar { background: ${backgroundColor}a0 !important; backdrop-filter: blur(24px) saturate(200%) !important; -webkit-backdrop-filter: blur(24px) saturate(200%) !important; }`)
      } else {
        rules.push(`#toolbar { background: ${backgroundColor} !important; }`)
      }

      if (borderBottom === "hide") {
        rules.push("#toolbar { border-bottom: none !important; box-shadow: none !important; }")
      }

      return rules.join("\n")
    },
  },
  {
    value: "scrollbarStyle",
    label: "滚动条样式",
    hint: "自定义滚动条宽度、颜色和显示模式",
    group: "系统元素",
    preview: "📏",
    risk: "全屋改造",
    controls: [
      {
        key: "width",
        label: "宽度",
        type: "number",
        min: 4,
        max: 16,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "trackColor",
        label: "轨道颜色",
        type: "color",
      },
      {
        key: "thumbColor",
        label: "滑块颜色",
        type: "color",
      },
      {
        key: "thumbRadius",
        label: "滑块圆角",
        type: "number",
        min: 0,
        max: 8,
        step: 1,
        unit: "px",
      },
      {
        key: "hideMode",
        label: "显示模式",
        type: "select",
        options: [
          {
            label: "始终显示",
            value: "always",
          },
          {
            label: "悬停显示",
            value: "hover",
          },
          {
            label: "完全隐藏",
            value: "hidden",
          },
        ],
      },
    ],
    defaults: createDefaultConfig({
      width: 6,
      trackColor: "transparent",
      thumbColor: "var(--style-editor-scrollbar-thumb)",
      thumbRadius: 4,
      hideMode: "always",
    }),
    buildCss: (config) => {
      const width = px(config.values.width, 6)
      const trackColor = stringValue(config.values.trackColor, "transparent")
      const thumbColor = stringValue(config.values.thumbColor, "var(--style-editor-scrollbar-thumb)")
      const thumbRadius = px(config.values.thumbRadius, 4)
      const hideMode = stringValue(config.values.hideMode, "always")

      if (hideMode === "hidden") {
        return "::-webkit-scrollbar { display: none !important; }\n* { scrollbar-width: none !important; }"
      }

      const hover = hideMode === "hover"
        ? `::-webkit-scrollbar { width: ${width} !important; opacity: 0; transition: opacity 200ms ease; }\n::-webkit-scrollbar:hover { opacity: 1; }`
        : `::-webkit-scrollbar { width: ${width} !important; }`

      return `${hover}

::-webkit-scrollbar-track {
  background: ${trackColor} !important;
}

::-webkit-scrollbar-thumb {
  background: ${thumbColor} !important;
  border-radius: ${thumbRadius} !important;
}`
    },
  },
  {
    value: "boldTextStyle",
    label: "加粗文本样式",
    hint: "自定义加粗文本的颜色、背景色和字重",
    group: "行内元素",
    preview: "B",
    risk: "正文安全",
    controls: [
      {
        key: "color",
        label: "文字颜色",
        type: "color",
      },
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
      {
        key: "borderRadius",
        label: "背景圆角",
        type: "number",
        min: 0,
        max: 8,
        step: 1,
        unit: "px",
      },
      {
        key: "fontWeight",
        label: "字重",
        type: "number",
        min: 600,
        max: 900,
        step: 100,
      },
    ],
    defaults: createDefaultConfig({
      color: "var(--style-editor-mark-color)",
      backgroundColor: "var(--style-editor-mark-bg)",
      borderRadius: 3,
      fontWeight: 700,
    }),
    buildCss: (config) => {
      const color = stringValue(config.values.color, "var(--style-editor-mark-color)")
      const bg = stringValue(config.values.backgroundColor, "var(--style-editor-mark-bg)")
      const radius = px(config.values.borderRadius, 3)
      const weight = numberValue(config.values.fontWeight, 700)

      return `strong, b, span[data-type~="strong"] {
  color: ${color} !important;
  background-color: ${bg} !important;
  border-radius: ${radius} !important;
  font-weight: ${weight} !important;
  padding: 0 2px !important;
}`
    },
  },
  {
    value: "tabBarStyle",
    label: "页签栏样式",
    hint: "自定义页签高度、字号和活动指示器",
    group: "操作界面",
    preview: "📑",
    risk: "全屋改造",
    controls: [
      {
        key: "height",
        label: "页签高度",
        type: "number",
        min: 28,
        max: 44,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "fontSize",
        label: "字号",
        type: "number",
        min: 11,
        max: 16,
        step: 1,
        unit: "px",
      },
      {
        key: "activeIndicator",
        label: "活动指示器",
        type: "select",
        options: [
          {
            label: "底线",
            value: "border",
          },
          {
            label: "背景",
            value: "background",
          },
          {
            label: "无",
            value: "none",
          },
        ],
      },
      {
        key: "indicatorColor",
        label: "指示器颜色",
        type: "color",
      },
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      height: 32,
      fontSize: 13,
      activeIndicator: "border",
      indicatorColor: "var(--style-editor-link-color)",
      backgroundColor: "transparent",
    }),
    buildCss: (config) => {
      const height = px(config.values.height, 32)
      const fontSize = px(config.values.fontSize, 13)
      const indicator = stringValue(config.values.activeIndicator, "border")
      const indicatorColor = stringValue(config.values.indicatorColor, "var(--style-editor-link-color)")
      const bgColor = stringValue(config.values.backgroundColor, "transparent")

      let indicatorCss = ""
      if (indicator === "border") {
        indicatorCss = `.layout-tab-bar .item--focus { border-bottom: 2px solid ${indicatorColor} !important; }`
      } else if (indicator === "background") {
        indicatorCss = `.layout-tab-bar .item--focus { background: ${indicatorColor}22 !important; }`
      }

      return `.layout-tab-bar {
  height: ${height} !important;
  background: ${bgColor} !important;
}

.layout-tab-bar .item {
  font-size: ${fontSize} !important;
}

${indicatorCss}`
    },
  },
  {
    value: "breadcrumbStyle",
    label: "面包屑样式",
    hint: "自定义面包屑文字颜色、背景和字号",
    group: "导航与面板",
    preview: "🧭",
    risk: "全屋改造",
    controls: [
      {
        key: "textColor",
        label: "文字颜色",
        type: "color",
      },
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
      {
        key: "separatorColor",
        label: "分隔符颜色",
        type: "color",
      },
      {
        key: "fontSize",
        label: "字号",
        type: "number",
        min: 11,
        max: 14,
        step: 1,
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      textColor: "var(--style-editor-list-color)",
      backgroundColor: "transparent",
      separatorColor: "var(--style-editor-list-marker)",
      fontSize: 12,
    }),
    buildCss: (config) => {
      const textColor = stringValue(config.values.textColor, "var(--style-editor-list-color)")
      const bgColor = stringValue(config.values.backgroundColor, "transparent")
      const sepColor = stringValue(config.values.separatorColor, "var(--style-editor-list-marker)")
      const fontSize = px(config.values.fontSize, 12)

      return `.protyle-breadcrumb {
  color: ${textColor} !important;
  background-color: ${bgColor} !important;
  font-size: ${fontSize} !important;
}

.protyle-breadcrumb__separator {
  color: ${sepColor} !important;
}`
    },
  },
  {
    value: "dockStyle",
    label: "停靠栏样式",
    hint: "自定义停靠栏图标大小、背景色和宽度",
    group: "导航与面板",
    preview: "📌",
    risk: "全屋改造",
    controls: [
      {
        key: "iconSize",
        label: "图标大小",
        type: "number",
        min: 16,
        max: 28,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
      {
        key: "hoverColor",
        label: "悬停颜色",
        type: "color",
      },
      {
        key: "width",
        label: "宽度",
        type: "number",
        min: 36,
        max: 56,
        step: 2,
        unit: "px",
        slider: true,
      },
    ],
    defaults: createDefaultConfig({
      iconSize: 20,
      backgroundColor: "transparent",
      hoverColor: "var(--style-editor-card-bg-soft)",
      width: 40,
    }),
    buildCss: (config) => {
      const iconSize = px(config.values.iconSize, 20)
      const bgColor = stringValue(config.values.backgroundColor, "transparent")
      const hoverColor = stringValue(config.values.hoverColor, "var(--style-editor-card-bg-soft)")
      const width = px(config.values.width, 40)

      return `.dock {
  background: ${bgColor} !important;
  width: ${width} !important;
}

.dock__item {
  width: ${iconSize} !important;
  height: ${iconSize} !important;
}

.dock__item:hover {
  background: ${hoverColor} !important;
}`
    },
  },
  {
    value: "searchHighlight",
    label: "搜索高亮色",
    hint: "自定义搜索匹配项和当前匹配项的高亮颜色",
    preview: "🔍",
    risk: "全屋改造",
    group: "系统元素",
    controls: [
      {
        key: "matchColor",
        label: "匹配项颜色",
        type: "color",
      },
      {
        key: "currentMatchColor",
        label: "当前匹配颜色",
        type: "color",
      },
      {
        key: "matchBorderRadius",
        label: "高亮圆角",
        type: "number",
        min: 0,
        max: 4,
        step: 1,
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      matchColor: "var(--style-editor-search-match-bg)",
      currentMatchColor: "var(--style-editor-search-current-bg)",
      matchBorderRadius: 2,
    }),
    buildCss: (config) => {
      const matchColor = stringValue(config.values.matchColor, "var(--style-editor-search-match-bg)")
      const currentColor = stringValue(config.values.currentMatchColor, "var(--style-editor-search-current-bg)")
      const radius = px(config.values.matchBorderRadius, 2)

      return `.protyle-wysiwyg mark[data-type="search-mark"] {
  background-color: ${matchColor} !important;
  border-radius: ${radius} !important;
}

.protyle-wysiwyg mark[data-type="search-mark"].search-mark--current {
  background-color: ${currentColor} !important;
}`
    },
  },
  {
    value: "dialogStyle",
    label: "对话框样式",
    hint: "自定义弹窗圆角、背景模糊和阴影",
    preview: "💬",
    risk: "全屋改造",
    group: "系统元素",
    controls: [
      {
        key: "borderRadius",
        label: "圆角",
        type: "number",
        min: 0,
        max: 24,
        step: 2,
        unit: "px",
        slider: true,
      },
      {
        key: "backdropBlur",
        label: "背景模糊",
        type: "number",
        min: 0,
        max: 20,
        step: 1,
        unit: "px",
      },
      {
        key: "backdropOpacity",
        label: "遮罩透明度",
        type: "number",
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        key: "shadowIntensity",
        label: "阴影",
        type: "select",
        options: [
          {
            label: "无",
            value: "none",
          },
          {
            label: "轻",
            value: "light",
          },
          {
            label: "重",
            value: "heavy",
          },
        ],
      },
    ],
    defaults: createDefaultConfig({
      borderRadius: 12,
      backdropBlur: 8,
      backdropOpacity: 0.5,
      shadowIntensity: "light",
    }),
    buildCss: (config) => {
      const radius = px(config.values.borderRadius, 12)
      const blur = px(config.values.backdropBlur, 8)
      const opacity = numberValue(config.values.backdropOpacity, 0.5)
      const shadow = stringValue(config.values.shadowIntensity, "light")

      const SHADOW_MAP: Record<string, string> = {
        none: "none",
        light: "0 8px 32px rgba(0,0,0,0.12)",
        heavy: "0 16px 64px rgba(0,0,0,0.24)",
      }

      return `.b3-dialog__container {
  border-radius: ${radius} !important;
  box-shadow: ${SHADOW_MAP[shadow]} !important;
}

.b3-dialog__scrim {
  backdrop-filter: blur(${blur}) !important;
  -webkit-backdrop-filter: blur(${blur}) !important;
  background-color: rgba(0, 0, 0, ${opacity}) !important;
}`
    },
  },
  {
    value: "customThemePrimary",
    label: "全局自定义主色",
    hint: "直接重写思源内置的主题主色变量，全局改变交互和焦点配色。",
    preview: "🎨",
    risk: "全屋改造",
    group: "文档外观",
    controls: [
      {
        key: "primaryColor",
        label: "主题主色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      primaryColor: "#0969da",
    }),
    buildCss: (config) => {
      const primaryColor = stringValue(config.values.primaryColor, "")
      if (!primaryColor) return ""
      
      const primaryColorRgb = hexToRgb(primaryColor)
      return `
:root {
  --b3-theme-primary: ${primaryColor} !important;
  --b3-theme-primary-rgb: ${primaryColorRgb} !important;
}
      `.trim()
    },
  },
  {
    value: "layoutCompactMode",
    label: "界面紧凑模式",
    hint: "微调侧边栏、文件树、编辑区、页签栏和控制项的间距与字体大小以提高信息密度。",
    preview: "🗜️",
    risk: "全屋改造",
    group: "文档外观",
    controls: [
      {
        key: "density",
        label: "紧凑密度",
        type: "select",
        options: [
          { label: "无", value: "none" },
          { label: "温和", value: "moderate" },
          { label: "紧凑", value: "compact" },
          { label: "极致", value: "extreme" },
        ],
      },
      {
        key: "fontScale",
        label: "字号缩放",
        type: "select",
        options: [
          { label: "100%", value: "100" },
          { label: "98%", value: "98" },
          { label: "96%", value: "96" },
          { label: "94%", value: "94" },
          { label: "92%", value: "92" },
          { label: "90%", value: "90" },
        ],
      },
      {
        key: "sidebar",
        label: "侧边栏应用",
        type: "select",
        options: [
          { label: "开启", value: "yes" },
          { label: "关闭", value: "no" },
        ],
      },
      {
        key: "editor",
        label: "编辑区应用",
        type: "select",
        options: [
          { label: "开启", value: "yes" },
          { label: "关闭", value: "no" },
        ],
      },
      {
        key: "tabs",
        label: "页签栏应用",
        type: "select",
        options: [
          { label: "开启", value: "yes" },
          { label: "关闭", value: "no" },
        ],
      },
      {
        key: "dialogs",
        label: "对话框应用",
        type: "select",
        options: [
          { label: "开启", value: "yes" },
          { label: "关闭", value: "no" },
        ],
      },
      {
        key: "controls",
        label: "控制项应用",
        type: "select",
        options: [
          { label: "开启", value: "yes" },
          { label: "关闭", value: "no" },
        ],
      },
    ],
    defaults: createDefaultConfig({
      density: "compact",
      fontScale: "96",
      sidebar: "yes",
      editor: "yes",
      tabs: "yes",
      dialogs: "yes",
      controls: "yes",
    }),
    buildCss: (config) => {
      const density = stringValue(config.values.density, "none")
      const fontScaleStr = stringValue(config.values.fontScale, "100")
      
      if (density === "none" && fontScaleStr === "100") {
        return ""
      }
      
      const scale = density === "none" ? 1.0 : density === "moderate" ? 0.8 : density === "compact" ? 0.6 : 0.4
      const f = parseInt(fontScaleStr, 10) / 100.0

      const enableSidebar = stringValue(config.values.sidebar, "yes") === "yes"
      const enableEditor = stringValue(config.values.editor, "yes") === "yes"
      const enableTabs = stringValue(config.values.tabs, "yes") === "yes"
      const enableDialogs = stringValue(config.values.dialogs, "yes") === "yes"
      const enableControls = stringValue(config.values.controls, "yes") === "yes"

      const rules: string[] = []

      // 1. 侧边栏与文件树
      if (enableSidebar) {
        rules.push(`
          /* 侧边栏图标间距 */
          .dock__item { padding: ${6 * scale}px !important; }
          /* 文件树列表项 */
          .b3-list-item {
            padding: ${4 * scale}px ${8 * scale}px !important;
            min-height: ${18 * scale + 6}px !important;
            line-height: ${18 * scale + 6}px !important;
          }
          .b3-list-item--hide-action { line-height: ${18 * scale + 6}px !important; }
          .b3-list-item__text { line-height: ${16 * scale + 6}px !important; }
          /* 文件树字体缩放 */
          .file-tree { font-size: ${12 * f}px !important; }
          .sidebar { font-size: ${13 * f}px !important; }
        `)
      }

      // 2. 编辑区与正文排版
      if (enableEditor) {
        rules.push(`
          /* 工具栏间距 */
          .toolbar {
            gap: ${4 * scale}px !important;
            padding: ${4 * scale}px ${8 * scale}px !important;
          }
          /* 编辑区容器 Padding */
          .protyle-content { padding: ${8 * scale}px !important; }
          /* 正文元素紧凑排版 */
          .protyle-wysiwyg .bq, .protyle-wysiwyg .li, .protyle-wysiwyg .p {
            line-height: 1.4 !important;
          }
          /* 标题 margin 紧凑化 */
          .protyle-wysiwyg h1, .protyle-wysiwyg h2, .protyle-wysiwyg h3,
          .protyle-wysiwyg h4, .protyle-wysiwyg h5, .protyle-wysiwyg h6 {
            margin: ${4 * scale}px 0 !important;
            padding: ${4 * scale}px 0 !important;
          }
          /* 代码块 Padding 缩放 */
          .protyle-wysiwyg .code-block .hljs { padding: ${6 * scale}px !important; }
        `)
      }

      // 3. 页签栏
      if (enableTabs) {
        rules.push(`
          /* 页签项 Padding 与行高 */
          .layout-tab-bar .item {
            padding: ${4 * scale}px ${12 * scale}px !important;
            line-height: ${16 * scale + 8}px !important;
            font-size: ${12 * f}px !important;
          }
          .tab {
            padding: ${6 * scale}px ${12 * scale}px !important;
            font-size: ${12 * f}px !important;
          }
        `)
      }

      // 4. 对话框
      if (enableDialogs) {
        rules.push(`
          /* 对话框容器及内部 Padding */
          .b3-dialog { padding: ${12 * scale}px !important; }
          .b3-dialog__header {
            padding: ${8 * scale}px ${12 * scale}px !important;
            font-size: ${14 * f}px !important;
          }
          .b3-dialog__body {
            padding: ${8 * scale}px !important;
            font-size: ${13 * f}px !important;
          }
        `)
      }

      // 5. 控制项与菜单按钮
      if (enableControls) {
        rules.push(`
          /* 按钮紧凑 Padding */
          .b3-button {
            padding: ${6 * scale}px ${12 * scale}px !important;
            font-size: ${12 * f}px !important;
          }
          /* 输入框和下拉框 */
          .b3-text-field, .b3-input, .b3-select {
            padding: ${6 * scale}px ${8 * scale}px !important;
            font-size: ${12 * f}px !important;
          }
          /* 菜单列表项 */
          .b3-menu__item {
            padding: ${6 * scale}px ${12 * scale}px !important;
            min-height: ${18 * scale + 6}px !important;
            line-height: ${16 * scale + 4}px !important;
            font-size: ${12 * f}px !important;
          }
          .b3-menu { padding: ${4 * scale}px 0 !important; }
        `)
      }

      return rules.join("\n")
    },
  },
]
