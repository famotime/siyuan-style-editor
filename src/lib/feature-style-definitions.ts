import type {
  FeatureDefinition,
  FeatureStyleControlOption,
} from "./feature-style-types";

import {
  createDefaultConfig,
  em,
  LINE_STYLE_OPTIONS,
  LINK_LINE_STYLE_OPTIONS,
  lineStyleValue,
  numberValue,
  optionValue,
  px,
  stringValue,
} from "./feature-style-types";

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    buildCss: config => `
.protyle-wysiwyg [data-type]:hover:not(.protyle-wysiwyg [data-type="NodeList"]):not(.protyle-wysiwyg [data-type="NodeListItem"]):not(.protyle-wysiwyg [data-type="img"]) {
  background-color: ${stringValue(config.values.backgroundColor, "hsla(0, 0%, 77%, 0.035)")} !important;
  box-shadow: 0 0 ${px(config.values.shadowSize, 3)} 0 hsla(0, 0%, 77%, ${numberValue(config.values.shadowStrength, 0.05)}) !important;
}

.protyle-wysiwyg [data-type]:not(.protyle-wysiwyg [data-type="img"]) {
  transition: all ${numberValue(config.values.transitionMs, 350)}ms ease-out 0ms;
}`.trim(),
    controls: [
      {
        key: "backgroundColor",
        label: "悬停底色",
        type: "color",
      },
      {
        key: "shadowSize",
        label: "阴影范围",
        max: 12,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "transitionMs",
        label: "过渡时间",
        max: 800,
        min: 0,
        step: 50,
        type: "number",
        unit: "ms",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "hsla(0, 0%, 77%, 0.035)",
      shadowSize: 3,
      shadowStrength: 0.05,
      transitionMs: 350,
    }),
    hint: "鼠标经过正文块时提供轻微底色和阴影反馈。",
    label: "段落悬停高亮",
    preview: "段落块",
    risk: "正文安全",
    value: "paragraphHover",
  },
  {
    buildCss: config => `
.protyle-wysiwyg div[fold="1"]:not(div[data-type="NodeListItem"]),
.protyle-wysiwyg [data-node-id][fold="1"]:not(.li):not([data-type="NodeHeading"]) {
  background-image: repeating-linear-gradient(
    -45deg,
    rgb(45, 45, 45),
    rgb(45, 45, 45) 6px,
    rgb(60, 60, 60) 0,
    rgb(60, 60, 60) 12px
  );
  border-radius: ${px(config.values.radius, 5)};
  border: ${px(config.values.borderWidth, 1)} solid ${stringValue(config.values.borderColor, "rgba(90, 90, 90, 0.6)")};
  opacity: ${numberValue(config.values.opacity, 0.85)};
}

.protyle-wysiwyg [fold="1"]:hover {
  opacity: ${numberValue(config.values.hoverOpacity, 1)};
  box-shadow: 0 0 ${px(config.values.shadowSize, 6)} ${stringValue(config.values.shadowColor, "rgba(0, 0, 0, 0.2)")};
}`.trim(),
    controls: [
      {
        key: "borderColor",
        label: "边框色",
        type: "color",
      },
      {
        key: "borderWidth",
        label: "边框粗细",
        max: 4,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "opacity",
        label: "透明度",
        max: 1,
        min: 0.2,
        step: 0.05,
        type: "number",
      },
      {
        key: "hoverOpacity",
        label: "悬停透明度",
        max: 1,
        min: 0.2,
        step: 0.05,
        type: "number",
      },
      {
        key: "shadowColor",
        label: "阴影色",
        type: "color",
      },
      {
        key: "shadowSize",
        label: "阴影范围",
        max: 16,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "radius",
        label: "圆角",
        max: 18,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      borderColor: "rgba(90, 90, 90, 0.6)",
      borderWidth: 1,
      hoverOpacity: 1,
      opacity: 0.85,
      radius: 5,
      shadowColor: "rgba(0, 0, 0, 0.2)",
      shadowSize: 6,
    }),
    hint: "为折叠块增加条纹背景和悬停反馈。",
    label: "折叠块提示",
    preview: "折叠",
    risk: "正文安全",
    value: "foldedBlockStyle",
  },
  {
    buildCss: config => `
:root {
  --b3-theme-background: ${stringValue(config.values.backgroundColor, "#222222")};
}`.trim(),
    controls: [
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "#222222",
    }),
    hint: "覆盖编辑区背景变量，影响整个阅读和编辑外壳。",
    label: "编辑区背景色",
    preview: "背景",
    risk: "全屋改造",
    value: "editorBackground",
  },
  {
    buildCss: config => `
.protyle-wysiwyg > .h1,
.protyle-wysiwyg > .h2,
.protyle-wysiwyg > .h3,
.protyle-wysiwyg > .h4,
.protyle-wysiwyg > .h5,
.protyle-wysiwyg > .h6 {
  font-weight: 700;
  margin-top: ${em(config.values.headingTopMargin, 0.5)};
  margin-bottom: ${em(config.values.headingBottomMargin, 0.1)};
}

.protyle-wysiwyg .protyle-wysiwyg__embed > .h1,
.protyle-wysiwyg .protyle-wysiwyg__embed > .h2,
.protyle-wysiwyg .protyle-wysiwyg__embed > .h3,
.protyle-wysiwyg .protyle-wysiwyg__embed > .h4,
.protyle-wysiwyg .protyle-wysiwyg__embed > .h5,
.protyle-wysiwyg .protyle-wysiwyg__embed > .h6 {
  margin: ${px(config.values.embedVerticalMargin, 2)}px 0;
}

.bq > .h1,
.bq > .h2,
.bq > .h3,
.bq > .h4,
.bq > .h5,
.bq > .h6 {
  margin-top: 0 !important;
  margin-bottom: ${em(config.values.blockquoteBottomMargin, 0.1)} !important;
}`.trim(),
    controls: [
      {
        key: "headingTopMargin",
        label: "标题上间距",
        max: 2,
        min: 0,
        step: 0.1,
        type: "number",
      },
      {
        key: "headingBottomMargin",
        label: "标题下间距",
        max: 2,
        min: 0,
        step: 0.1,
        type: "number",
      },
      {
        key: "embedVerticalMargin",
        label: "嵌入块间距",
        max: 12,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "blockquoteBottomMargin",
        label: "引述块标题下距",
        max: 2,
        min: 0,
        step: 0.1,
        type: "number",
      },
    ],
    defaults: createDefaultConfig({
      blockquoteBottomMargin: 0.1,
      embedVerticalMargin: 2,
      headingBottomMargin: 0.1,
      headingTopMargin: 0.5,
    }),
    hint: "统一调整标题在正文、嵌入块和引述块中的上下间距。",
    label: "标题间距",
    preview: "H1",
    risk: "正文安全",
    value: "headingSpacing",
  },
  {
    buildCss: config => {
      const mode = stringValue(config.values.mode, "leftBar");
      if (mode === "leftBar") {
        return `
.protyle-wysiwyg [data-node-id].h1,
.protyle-wysiwyg [data-node-id].h2,
.protyle-wysiwyg [data-node-id].h3,
.protyle-wysiwyg [data-node-id].h4,
.protyle-wysiwyg [data-node-id].h5,
.protyle-wysiwyg [data-node-id].h6 {
  position: relative;
  padding-left: ${px(config.values.barOffset, 12)};
  font-weight: ${numberValue(config.values.fontWeight, 600)};
}
.protyle-wysiwyg [data-node-id].h1 > [spellcheck]:not(:empty)::before,
.protyle-wysiwyg [data-node-id].h2 > [spellcheck]:not(:empty)::before,
.protyle-wysiwyg [data-node-id].h3 > [spellcheck]:not(:empty)::before,
.protyle-wysiwyg [data-node-id].h4 > [spellcheck]:not(:empty)::before,
.protyle-wysiwyg [data-node-id].h5 > [spellcheck]:not(:empty)::before,
.protyle-wysiwyg [data-node-id].h6 > [spellcheck]:not(:empty)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: ${px(config.values.barWidth, 3)};
  height: 1.2em;
  border-radius: ${px(config.values.barRadius, 2)};
  background-color: ${stringValue(config.values.barColor, "var(--b3-theme-primary)")};
}`.trim();
      }
      return `
.protyle-wysiwyg [data-node-id].h1,
.protyle-wysiwyg [data-node-id].h2,
.protyle-wysiwyg [data-node-id].h3,
.protyle-wysiwyg [data-node-id].h4,
.protyle-wysiwyg [data-node-id].h5,
.protyle-wysiwyg [data-node-id].h6 {
  font-weight: ${numberValue(config.values.fontWeight, 600)};
  position: relative;
  padding-bottom: 4px;
}
.protyle-wysiwyg [data-node-id].h1 > [spellcheck]:not(:empty)::after,
.protyle-wysiwyg [data-node-id].h2 > [spellcheck]:not(:empty)::after,
.protyle-wysiwyg [data-node-id].h3 > [spellcheck]:not(:empty)::after,
.protyle-wysiwyg [data-node-id].h4 > [spellcheck]:not(:empty)::after,
.protyle-wysiwyg [data-node-id].h5 > [spellcheck]:not(:empty)::after,
.protyle-wysiwyg [data-node-id].h6 > [spellcheck]:not(:empty)::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: ${px(config.values.barWidth, 2)};
  background: linear-gradient(to right, transparent, ${stringValue(config.values.barColor, "rgba(44, 62, 80, 0.5)")});
}`.trim();
    },
    controls: [
      {
        key: "mode",
        label: "装饰风格",
        options: [
          { label: "左竖线", value: "leftBar" },
          { label: "下划线", value: "underline" },
        ],
        type: "select",
      },
      {
        key: "barColor",
        label: "装饰颜色",
        type: "color",
      },
      {
        key: "barWidth",
        label: "线条粗细",
        max: 8,
        min: 1,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "fontWeight",
        label: "字重",
        max: 900,
        min: 400,
        step: 100,
        type: "number",
      },
    ],
    defaults: createDefaultConfig({
      barColor: "var(--b3-theme-primary)",
      barOffset: 12,
      barRadius: 2,
      barWidth: 3,
      fontWeight: 600,
      mode: "leftBar",
    }),
    hint: "为标题增加左竖线或下划线装饰。",
    label: "标题装饰",
    preview: "H1",
    risk: "正文安全",
    value: "headingDecoration",
  },
  {
    buildCss: config => `
.protyle-wysiwyg > [data-node-id].h1::before,
.protyle-wysiwyg > [data-node-id].h2::before,
.protyle-wysiwyg > [data-node-id].h3::before,
.protyle-wysiwyg > [data-node-id].h4::before,
.protyle-wysiwyg > [data-node-id].h5::before,
.protyle-wysiwyg > [data-node-id].h6::before,
.b3-typography > h1::before,
.b3-typography > h2::before,
.b3-typography > h3::before,
.b3-typography > h4::before,
.b3-typography > h5::before,
.b3-typography > h6::before {
  content: none !important;
  display: none !important;
}`.trim(),
    controls: [],
    defaults: {
      enabled: false,
      values: {},
    },
    hint: "隐藏 H1-H6 标题前的自动编号。",
    label: "标题编号隐藏",
    preview: "H·",
    risk: "全屋改造",
    value: "headingNumbering",
  },
  {
    buildCss: config => `
.protyle-wysiwyg [data-node-id].li[data-subtype="u"] > .protyle-action {
  color: ${stringValue(config.values.markerColor, "oklch(75% 0 0)")};
}`.trim(),
    controls: [
      {
        key: "markerColor",
        label: "圆点颜色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      markerColor: "oklch(75% 0 0)",
    }),
    hint: "调整无序列表圆点的颜色，保持层级结构不变。",
    label: "无序列表圆点颜色",
    preview: "•",
    risk: "正文安全",
    value: "unorderedListMarkerColor",
  },
  {
    buildCss: config => `
.protyle-wysiwyg [data-node-id].li:has(.block-focus) > .list:has(.block-focus) > .li::after {
  content: "";
  display: block;
  box-sizing: border-box;
  border-left: ${px(config.values.lineWidth, 2)} solid ${stringValue(config.values.lineColor, "rgb(70, 110, 220)")};
  border-bottom: ${px(config.values.lineWidth, 2)} solid ${stringValue(config.values.lineColor, "rgb(70, 110, 220)")};
  border-bottom-left-radius: ${px(config.values.radius, 8)};
  position: absolute;
  left: ${px(config.values.leftOffset, -18)};
  pointer-events: none;
}`.trim(),
    controls: [
      {
        key: "lineColor",
        label: "线条颜色",
        type: "color",
      },
      {
        key: "lineWidth",
        label: "线条粗细",
        max: 4,
        min: 1,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "radius",
        label: "圆角",
        max: 16,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      leftOffset: -18,
      lineColor: "rgb(70, 110, 220)",
      lineWidth: 2,
      radius: 8,
    }),
    hint: "为聚焦列表项显示层级连接线（需配合 JS 激活 block-focus）。",
    label: "列表层次线",
    preview: "├─",
    risk: "全屋改造",
    value: "listBulletLine",
  },
  {
    buildCss: config => `
div[data-subtype="o"].list {
  --o1-style: counter(o1, decimal)".";
  --o2-style: counter(o2, lower-latin)".";
  --o3-style: counter(o3, lower-roman)".";
  --o4-style: counter(o4, upper-latin)".";
  --o5-style: counter(o5, upper-roman)".";
  --o6-style: counter(o6, lower-greek)".";
}
.protyle-wysiwyg [data-subtype="o"].li > .protyle-action:after {
  margin: -12px 0 0 -12px !important;
  line-height: 20px;
}
.list[data-subtype="o"] {
  counter-reset: o1 0 o2 0 o3 0 o4 0 o5 0 o6 0;
}
.list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o2;
  content: var(--o2-style);
  position: absolute;
}
.list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o3;
  content: var(--o3-style);
  position: absolute;
}
.list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o4;
  content: var(--o4-style);
  position: absolute;
}
.list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o5;
  content: var(--o5-style);
  position: absolute;
}
.list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o6;
  content: var(--o6-style);
  position: absolute;
}
.li[data-subtype="o"] > .protyle-action::after {
  padding: ${px(config.values.paddingY, 3)} ${px(config.values.paddingX, 2)};
  width: ${px(config.values.width, 24)};
  display: flex;
  justify-content: center;
}
${stringValue(config.values.showBackground, "no") === "yes" ? `
.protyle-wysiwyg [data-node-id].li[fold="1"]:not([data-subtype="o"].en_item_bullet_actived) > .protyle-action:after,
.protyle-wysiwyg [data-node-id].li > .protyle-action:hover:after {
  background-color: ${stringValue(config.values.hoverBgColor, "oklch(55% 0.05 250 / 0.3)")} !important;
}` : ""}`.trim(),
    controls: [
      {
        key: "showBackground",
        label: "悬停背景",
        options: [
          { label: "显示", value: "yes" },
          { label: "隐藏", value: "no" },
        ],
        type: "select",
      },
      {
        key: "hoverBgColor",
        label: "悬停底色",
        type: "color",
      },
      {
        key: "width",
        label: "序号宽度",
        max: 40,
        min: 16,
        step: 2,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      hoverBgColor: "oklch(55% 0.05 250 / 0.3)",
      paddingX: 2,
      paddingY: 3,
      showBackground: "no",
      width: 24,
    }),
    hint: "为有序列表启用多级序号样式（小写字母、罗马数字等）。",
    label: "有序列表序号",
    preview: "1.",
    risk: "正文安全",
    value: "orderedListStyle",
  },
  {
    buildCss: config => `
.b3-typography blockquote,
.b3-typography .bq,
.protyle-wysiwyg blockquote,
.protyle-wysiwyg .bq {
  padding: ${px(config.values.padding, 4)};
  color: ${stringValue(config.values.color, "#4D4D4D")} !important;
  border-left: 0.25em solid ${stringValue(config.values.lineColor, "#3D9140")} !important;
  background-color: ${stringValue(config.values.backgroundColor, "#FFFAFA")} !important;
  margin: ${px(config.values.marginY, 4)} 0;
  border-radius: ${px(config.values.radius, 0)};
}

.protyle-wysiwyg .bq:not(.bq .bq) {
  box-shadow: 0 0 0 1px ${stringValue(config.values.borderColor, "transparent")} inset !important;
}`.trim(),
    controls: [
      {
        key: "backgroundColor",
        label: "底色",
        type: "color",
      },
      {
        key: "color",
        label: "字色",
        type: "color",
      },
      {
        key: "borderColor",
        label: "外框色",
        type: "color",
      },
      {
        key: "lineColor",
        label: "竖线色",
        type: "color",
      },
      {
        key: "radius",
        label: "圆角",
        max: 18,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "padding",
        label: "内边距",
        max: 24,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "marginY",
        label: "上下间距",
        max: 24,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "#FFFAFA",
      borderColor: "transparent",
      color: "#4D4D4D",
      lineColor: "#3D9140",
      marginY: 4,
      padding: 4,
      radius: 0,
    }),
    hint: "按参考样式配置引述块的竖线、颜色和间距。",
    label: "引述块边框竖线",
    preview: "引述",
    risk: "正文安全",
    value: "blockquoteFrame",
  },
  {
    buildCss: config => `
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
    preview: "被引用",
    risk: "正文安全",
    value: "referencedBlockCorners",
  },
  {
    buildCss: config => `
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
    preview: "3",
    risk: "正文安全",
    value: "refcountBadge",
  },
  {
    buildCss: config => `
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
  background-color: ${stringValue(config.values.hoverBgColor, "rgba(100, 200, 255, 0.15)")};
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
          { label: "40vh", value: "40vh" },
          { label: "50vh", value: "50vh" },
          { label: "60vh", value: "60vh" },
          { label: "70vh", value: "70vh" },
        ],
        type: "select",
      },
    ],
    defaults: createDefaultConfig({
      hoverBgColor: "rgba(100, 200, 255, 0.15)",
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
    preview: "搜索",
    risk: "全屋改造",
    value: "refSearchMenu",
  },
  {
    buildCss: config => `
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
    preview: "反链",
    risk: "全屋改造",
    value: "backlinkSticky",
  },
  {
    buildCss: config => `
.protyle-wysiwyg img:not(.av__gallery-img) {
  border-radius: ${px(config.values.radius, 6)} !important;
}`.trim(),
    controls: [
      {
        key: "radius",
        label: "图片圆角",
        max: 32,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      radius: 6,
    }),
    hint: "为编辑区图片增加统一圆角。",
    label: "圆角图片",
    preview: "图片",
    risk: "正文安全",
    value: "imageRadius",
  },
  {
    buildCss: config => `
.b3-typography table,
.protyle-wysiwyg table {
  font-weight: 500;
  border-collapse: collapse;
}

.b3-typography table thead,
.protyle-wysiwyg table thead {
  background-color: ${stringValue(config.values.headerBackgroundColor, "#2c2c2c")} !important;
  color: ${stringValue(config.values.headerColor, "#e0e0e0")} !important;
}

.b3-typography table td,
.b3-typography table th,
.protyle-wysiwyg table td,
.protyle-wysiwyg table th {
  border: ${numberValue(config.values.borderWidth, 1.5)}px solid ${stringValue(config.values.borderColor, "var(--b3-border-color, #444)")} !important;
  padding: ${px(config.values.cellPaddingY, 6)} ${px(config.values.cellPaddingX, 10)};
}`.trim(),
    controls: [
      {
        key: "headerBackgroundColor",
        label: "表头底色",
        type: "color",
      },
      {
        key: "headerColor",
        label: "表头字色",
        type: "color",
      },
      {
        key: "borderColor",
        label: "边框色",
        type: "color",
      },
      {
        key: "borderWidth",
        label: "边框粗细",
        max: 4,
        min: 0,
        step: 0.5,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      borderColor: "var(--b3-border-color, #444)",
      borderWidth: 1.5,
      cellPaddingX: 10,
      cellPaddingY: 6,
      headerBackgroundColor: "#2c2c2c",
      headerColor: "#e0e0e0",
    }),
    hint: "增强表头、边框和单元格阅读密度。",
    label: "表格增强",
    preview: "表格",
    risk: "正文安全",
    value: "tableStyle",
  },
  {
    buildCss: config => {
      const lineStyle = lineStyleValue(config.values.lineStyle, "solid");
      return `
.b3-typography mark,
.b3-typography span[data-type~=mark],
.protyle-wysiwyg mark,
.protyle-wysiwyg span[data-type~=mark] {
  color: ${stringValue(config.values.color, "var(--b3-theme-on-background)")} !important;
  background-color: ${stringValue(config.values.backgroundColor, "rgba(255, 212, 0, 0.14)")} !important;
  border-bottom: ${numberValue(config.values.emphasisThickness, 2)}px ${lineStyle} ${stringValue(config.values.emphasisColor, "rgba(255, 212, 0, 0.8)")} !important;
}`.trim();
    },
    controls: [
      {
        key: "color",
        label: "字色",
        type: "color",
      },
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
      {
        key: "emphasisColor",
        label: "底线颜色",
        type: "color",
      },
      {
        key: "emphasisThickness",
        label: "底线粗细",
        max: 5,
        min: 0,
        step: 0.5,
        type: "number",
        unit: "px",
      },
      {
        key: "lineStyle",
        label: "底线线型",
        options: LINE_STYLE_OPTIONS.filter(option => option.value !== "none"),
        type: "select",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "rgba(255, 212, 0, 0.14)",
      color: "var(--b3-theme-on-background)",
      emphasisColor: "rgba(255, 212, 0, 0.8)",
      emphasisThickness: 2,
      lineStyle: "solid",
    }),
    hint: "调整标记文本的背景色、底线强调和字色。",
    label: "标记文本样式",
    preview: "标记",
    risk: "正文安全",
    value: "markStyle",
  },
  {
    buildCss: config => `
.fn__code,
.b3-typography code:not(.hljs),
.b3-typography span[data-type~=code],
.protyle-wysiwyg code:not(.hljs),
.protyle-wysiwyg span[data-type~=code] {
  color: ${stringValue(config.values.color, "#ffa657")} !important;
  background-color: ${stringValue(config.values.backgroundColor, "rgba(120, 120, 120, 0.15)")} !important;
  padding: ${px(config.values.paddingY, 2)} ${px(config.values.paddingX, 4)};
  border-radius: ${px(config.values.radius, 4)};
}`.trim(),
    controls: [
      {
        key: "color",
        label: "字色",
        type: "color",
      },
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
      {
        key: "radius",
        label: "圆角",
        max: 16,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "paddingX",
        label: "水平内边距",
        max: 16,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
      {
        key: "paddingY",
        label: "垂直内边距",
        max: 12,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "rgba(120, 120, 120, 0.15)",
      color: "#ffa657",
      paddingX: 4,
      paddingY: 2,
      radius: 4,
    }),
    hint: "调整行内代码的字色、背景色、圆角和内边距。",
    label: "行内代码样式",
    preview: "<code/>",
    risk: "正文安全",
    value: "inlineCodeStyle",
  },
  {
    buildCss: config => `
.protyle-wysiwyg [data-node-id] span[data-type~="block-ref"]:not(.av__celltext),
.protyle-wysiwyg [data-node-id] span[data-type~="file-annotation-ref"]:not(.av__celltext) {
  color: ${stringValue(config.values.color, "rgb(170, 210, 255)")} !important;
  background-color: ${stringValue(config.values.backgroundColor, "rgba(200, 200, 200, 0.1)")} !important;
  border-bottom: ${numberValue(config.values.lineThickness, 1)}px ${lineStyleValue(config.values.lineStyle, "dashed")} ${stringValue(config.values.lineColor, "rgba(210, 210, 210, 0.8)")} !important;
  padding: 1px 4px;
  padding-bottom: ${px(config.values.offset, 2)};
  font-weight: ${numberValue(config.values.fontWeight, 600)};
  border-radius: 0;
}`.trim(),
    controls: [
      {
        key: "color",
        label: "链接字色",
        type: "color",
      },
      {
        key: "backgroundColor",
        label: "背景色",
        type: "color",
      },
      {
        key: "lineColor",
        label: "底线颜色",
        type: "color",
      },
      {
        key: "lineStyle",
        label: "底线线型",
        options: LINE_STYLE_OPTIONS.filter(option => option.value !== "wavy"),
        type: "select",
      },
      {
        key: "fontWeight",
        label: "字重",
        max: 900,
        min: 400,
        step: 100,
        type: "number",
      },
      {
        key: "lineThickness",
        label: "底线粗细",
        max: 4,
        min: 0,
        step: 0.5,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "rgba(200, 200, 200, 0.1)",
      color: "rgb(170, 210, 255)",
      fontWeight: 600,
      lineColor: "rgba(210, 210, 210, 0.8)",
      lineStyle: "dashed",
      lineThickness: 1,
      offset: 2,
    }),
    hint: "调整块引用链接和文件标注的字色、背景和底线样式。",
    label: "引用链接样式",
    preview: "引用",
    risk: "正文安全",
    value: "blockRefStyle",
  },
  {
    buildCss: config => `
.protyle-wysiwyg [data-node-id].hr > div:after {
  height: ${numberValue(config.values.height, 2)}px;
  ${stringValue(config.values.mode, "gradient") === "gradient"
        ? `background: linear-gradient(to right, ${stringValue(config.values.colorLeft, "rgba(255, 110, 196, 0.5)")}, ${stringValue(config.values.colorRight, "rgba(120, 115, 245, 0.5)")});`
        : `border-top: ${numberValue(config.values.height, 2)}px ${lineStyleValue(config.values.lineStyle, "dashed")} ${stringValue(config.values.colorLeft, "#aaa")};`
      }
}`.trim(),
    controls: [
      {
        key: "mode",
        label: "风格",
        options: [
          { label: "渐变", value: "gradient" },
          { label: "线条", value: "line" },
        ],
        type: "select",
      },
      {
        key: "colorLeft",
        label: "左色/线色",
        type: "color",
      },
      {
        key: "colorRight",
        label: "右色",
        type: "color",
      },
      {
        key: "lineStyle",
        label: "线型",
        options: LINE_STYLE_OPTIONS.filter(option => option.value !== "none" && option.value !== "wavy"),
        type: "select",
      },
      {
        key: "height",
        label: "粗细",
        max: 6,
        min: 1,
        step: 1,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      colorLeft: "rgba(255, 110, 196, 0.5)",
      colorRight: "rgba(120, 115, 245, 0.5)",
      height: 2,
      lineStyle: "dashed",
      mode: "gradient",
    }),
    hint: "调整分割线的样式、颜色和粗细。",
    label: "分割线样式",
    preview: "——",
    risk: "正文安全",
    value: "hrStyle",
  },
  {
    buildCss: config => {
      const lineStyle = optionValue(config.values.lineStyle, "dashed", LINK_LINE_STYLE_OPTIONS);
      const textDecoration = lineStyle === "none" ? "none" : "none";
      const border = lineStyle === "none" ? "none" : `1px ${lineStyle} currentColor`;
      return `
.protyle-wysiwyg [data-node-id] span[data-type~=a] {
  color: ${stringValue(config.values.color, "#4fc3f7")} !important;
  text-decoration: ${textDecoration} !important;
  border-bottom: ${border} !important;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.protyle-wysiwyg [data-node-id] span[data-type~=a]:hover {
  color: ${stringValue(config.values.hoverColor, "#1de9b6")} !important;
  border-bottom-color: ${stringValue(config.values.hoverColor, "#1de9b6")} !important;
}`.trim();
    },
    controls: [
      {
        key: "color",
        label: "链接字色",
        type: "color",
      },
      {
        key: "hoverColor",
        label: "悬停字色",
        type: "color",
      },
      {
        key: "lineStyle",
        label: "下划线",
        options: LINK_LINE_STYLE_OPTIONS,
        type: "select",
      },
    ],
    defaults: createDefaultConfig({
      color: "#4fc3f7",
      hoverColor: "#1de9b6",
      lineStyle: "dashed",
    }),
    hint: "统一块内超链接的颜色和悬停反馈。",
    label: "超链接强调",
    preview: "链接",
    risk: "正文安全",
    value: "linkStyle",
  },
  {
    buildCss: config => {
      const lineStyle = lineStyleValue(config.values.lineStyle, "solid");
      return lineStyle === "wavy"
        ? `
.b3-typography u,
.b3-typography span[data-type~=u],
.protyle-wysiwyg u,
.protyle-wysiwyg span[data-type~=u] {
  text-decoration-line: underline !important;
  text-decoration-style: wavy !important;
  text-decoration-thickness: ${px(config.values.thickness, 2)} !important;
  text-decoration-color: ${stringValue(config.values.color, "rgb(200, 200, 200)")} !important;
  text-underline-offset: ${px(config.values.offset, 3)} !important;
}`.trim()
        : `
.b3-typography u,
.b3-typography span[data-type~=u],
.protyle-wysiwyg u,
.protyle-wysiwyg span[data-type~=u] {
  border-bottom: ${numberValue(config.values.thickness, 1.5)}px ${lineStyleValue(config.values.lineStyle, "solid")} ${stringValue(config.values.color, "rgb(200, 200, 200)")} !important;
  text-decoration: none !important;
  padding-bottom: ${px(config.values.offset, 1)};
}`.trim();
    },
    controls: [
      {
        key: "color",
        label: "线条颜色",
        type: "color",
      },
      {
        key: "lineStyle",
        label: "线型",
        options: LINE_STYLE_OPTIONS.filter(option => option.value !== "none"),
        type: "select",
      },
      {
        key: "thickness",
        label: "粗细",
        max: 5,
        min: 0.5,
        step: 0.5,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      color: "rgb(200, 200, 200)",
      lineStyle: "solid",
      offset: 1,
      thickness: 1.5,
    }),
    hint: "调整下划线的颜色、粗细和线型。",
    label: "下划线样式",
    preview: "下划线",
    risk: "正文安全",
    value: "underlineStyle",
  },
  {
    buildCss: config => `
.b3-typography s,
.b3-typography span[data-type~="s"],
.protyle-wysiwyg s,
.protyle-wysiwyg span[data-type~="s"] {
  text-decoration-line: line-through !important;
  text-decoration-thickness: ${px(config.values.thickness, 1)} !important;
  text-decoration-style: ${lineStyleValue(config.values.lineStyle, "solid")} !important;
  text-decoration-color: ${stringValue(config.values.color, "red")} !important;
}`.trim(),
    controls: [
      {
        key: "color",
        label: "删除线色",
        type: "color",
      },
      {
        key: "lineStyle",
        label: "线型",
        options: LINE_STYLE_OPTIONS.filter(option => option.value !== "none"),
        type: "select",
      },
      {
        key: "thickness",
        label: "粗细",
        max: 5,
        min: 0.5,
        step: 0.5,
        type: "number",
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      color: "red",
      lineStyle: "solid",
      thickness: 1,
    }),
    hint: "调整删除线的颜色、粗细和线型。",
    label: "删除线样式",
    preview: "删除线",
    risk: "正文安全",
    value: "strikethroughStyle",
  },
  {
    buildCss: config => `
.protyle-wysiwyg [data-type="NodeList"][data-subtype="t"] .protyle-task--done {
  opacity: ${numberValue(config.values.doneOpacity, 0.62)} !important;
}

.protyle-wysiwyg .protyle-task:hover {
  border-color: ${stringValue(config.values.hoverBorderColor, "#1de9b6")} !important;
}

.protyle-wysiwyg .protyle-task--done {
  color: ${stringValue(config.values.doneColor, "var(--b3-theme-on-surface)")} !important;
}`.trim(),
    controls: [
      {
        key: "doneColor",
        label: "完成字色",
        type: "color",
      },
      {
        key: "hoverBorderColor",
        label: "悬停框色",
        type: "color",
      },
      {
        key: "doneOpacity",
        label: "完成透明度",
        max: 1,
        min: 0.2,
        step: 0.05,
        type: "number",
      },
    ],
    defaults: createDefaultConfig({
      doneColor: "var(--b3-theme-on-surface)",
      doneOpacity: 0.62,
      hoverBorderColor: "#1de9b6",
    }),
    hint: "增强任务列表完成态和悬停反馈。",
    label: "任务列表状态",
    preview: "待办",
    risk: "正文安全",
    value: "taskListStyle",
  },
  {
    buildCss: config => `
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
    preview: "标题",
    risk: "全屋改造",
    value: "documentTitle",
  },
  {
    buildCss: config => `
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
    preview: "头图",
    risk: "全屋改造",
    value: "headImage",
  },
  {
    buildCss: config => `
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
  background-color: ${stringValue(config.values.secondaryBg, "rgb(85, 85, 85)")};
  color: ${stringValue(config.values.secondaryColor, "rgb(235, 235, 235)")};
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
      secondaryBg: "rgb(85, 85, 85)",
      secondaryColor: "rgb(235, 235, 235)",
    }),
    hint: "调整头图下方文档标签的圆角、颜色和字号。",
    label: "文档标签",
    preview: "标签",
    risk: "全屋改造",
    value: "docTag",
  },
  {
    buildCss: config => `
.sy__file .b3-list--background:nth-child(5n-4) {
  background-color: ${stringValue(config.values.color1, "rgba(120, 90, 69, 0.85)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color1, "rgba(120, 90, 69, 0.85)")} inset;
  border-radius: ${px(config.values.radius, 6)};
}
.sy__file .b3-list--background:nth-child(5n-3) {
  background-color: ${stringValue(config.values.color2, "rgba(139, 117, 72, 0.85)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color2, "rgba(139, 117, 72, 0.85)")} inset;
  border-radius: ${px(config.values.radius, 6)};
}
.sy__file .b3-list--background:nth-child(5n-2) {
  background-color: ${stringValue(config.values.color3, "rgba(88, 105, 90, 0.85)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color3, "rgba(88, 105, 90, 0.85)")} inset;
  border-radius: ${px(config.values.radius, 6)};
}
.sy__file .b3-list--background:nth-child(5n-1) {
  background-color: ${stringValue(config.values.color4, "rgba(75, 88, 96, 0.85)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color4, "rgba(75, 88, 96, 0.85)")} inset;
  border-radius: ${px(config.values.radius, 6)};
}
.sy__file .b3-list--background:nth-child(5n) {
  background-color: ${stringValue(config.values.color5, "rgba(71, 63, 85, 0.85)")} !important;
  box-shadow: 0 0 0 1px ${stringValue(config.values.color5, "rgba(71, 63, 85, 0.85)")} inset;
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
      color1: "rgba(120, 90, 69, 0.85)",
      color2: "rgba(139, 117, 72, 0.85)",
      color3: "rgba(88, 105, 90, 0.85)",
      color4: "rgba(75, 88, 96, 0.85)",
      color5: "rgba(71, 63, 85, 0.85)",
      gapY: 4,
      radius: 6,
    }),
    hint: "为文档树条目按五色循环设置彩色分块背景。",
    label: "文档树彩色分块",
    preview: "树",
    risk: "全屋改造",
    value: "docTreeColorBlocks",
  },
  {
    buildCss: config => `
.sy__outline ul.b3-list.b3-list--background [data-subtype*="h"] > span:first-child::after {
  visibility: visible !important;
  position: relative;
  left: 8px;
  border-radius: 4px;
  opacity: 1;
  font-size: ${px(config.values.fontSize, 10)};
  pointer-events: none;
}
.sy__outline ul.b3-list.b3-list--background [data-subtype="h1"] > span:first-child::after { content: "❶"; color: ${stringValue(config.values.h1Color, "rgba(221, 136, 134, 1)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h2"] > span:first-child::after { content: "❷"; color: ${stringValue(config.values.h2Color, "rgba(171, 155, 199, 1)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h3"] > span:first-child::after { content: "❸"; color: ${stringValue(config.values.h3Color, "rgba(137, 180, 202, 1)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h4"] > span:first-child::after { content: "❹"; color: ${stringValue(config.values.h4Color, "rgba(125, 165, 151, 1)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h5"] > span:first-child::after { content: "❺"; color: ${stringValue(config.values.h5Color, "rgba(215, 192, 111, 1)")}; }
.sy__outline ul.b3-list.b3-list--background [data-subtype="h6"] > span:first-child::after { content: "❻"; color: ${stringValue(config.values.h6Color, "rgba(212, 165, 155, 1)")}; }`.trim(),
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
      h1Color: "rgba(221, 136, 134, 1)",
      h2Color: "rgba(171, 155, 199, 1)",
      h3Color: "rgba(137, 180, 202, 1)",
      h4Color: "rgba(125, 165, 151, 1)",
      h5Color: "rgba(215, 192, 111, 1)",
      h6Color: "rgba(212, 165, 155, 1)",
    }),
    hint: "在大纲标题前显示彩色数字标志。",
    label: "大纲数字标志",
    preview: "❶",
    risk: "全屋改造",
    value: "outlineNumber",
  },
  {
    buildCss: config => `
.protyle-gutters {
  transition: top ${numberValue(config.values.transitionMs, 150)}ms ease-out;
}
.protyle-gutters button svg {
  color: ${stringValue(config.values.iconColor, "rgb(211, 209, 203)")};
  border-radius: ${px(config.values.iconRadius, 4)};
}
.protyle-gutters button:hover svg {
  background-color: ${stringValue(config.values.hoverBg, "oklch(60% 0.02 270 / 0.2)")};
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
      hoverBg: "oklch(60% 0.02 270 / 0.2)",
      iconColor: "rgb(211, 209, 203)",
      iconRadius: 4,
      transitionMs: 150,
    }),
    hint: "调整块标图标颜色、悬停背景和移动过渡速度。",
    label: "块标动画",
    preview: "⋮⋮",
    risk: "全屋改造",
    value: "blockGutterAnim",
  },
  {
    buildCss: config => `
.protyle-toolbar {
  padding: ${px(config.values.padding, 2)};
}
.protyle-toolbar .protyle-toolbar__item {
  height: ${px(config.values.buttonSize, 28)};
  width: ${px(config.values.buttonSize, 28)};
  border-radius: ${px(config.values.buttonRadius, 4)};
}
.protyle-toolbar .protyle-toolbar__item:hover {
  background-color: ${stringValue(config.values.hoverBg, "oklch(65% 0.12 250 / 0.2)")};
}
.protyle-toolbar .protyle-toolbar__item--current {
  color: ${stringValue(config.values.currentColor, "oklch(90% 0.18 90)")};
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
      currentColor: "oklch(90% 0.18 90)",
      hoverBg: "oklch(65% 0.12 250 / 0.2)",
      padding: 2,
    }),
    hint: "调整文字工具条的按钮尺寸、悬停背景和选中项颜色。",
    label: "工具条样式",
    preview: "工具",
    risk: "全屋改造",
    value: "toolbarStyle",
  },
  {
    buildCss: config => `
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
    preview: "/",
    risk: "全屋改造",
    value: "slashMenu",
  },
  {
    buildCss: config => `
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
    preview: "😊",
    risk: "全屋改造",
    value: "emojiPanel",
  },
  {
    buildCss: config => `
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
    preview: "搜索",
    risk: "全屋改造",
    value: "searchPanel",
  },
  {
    value: "typographyBase",
    label: "正文排版",
    hint: "调整正文字号、行高、缩进、段间距和字间距",
    preview: "📝",
    risk: "正文安全",
    controls: [
      { key: "fontSize", label: "字号", type: "number", min: 12, max: 20, step: 1, unit: "px", slider: true },
      { key: "lineHeight", label: "行高", type: "number", min: 1.2, max: 2.4, step: 0.05, slider: true },
      { key: "textIndent", label: "首行缩进", type: "number", min: 0, max: 4, step: 0.5, unit: "em" },
      { key: "paragraphSpacing", label: "段间距", type: "number", min: 0, max: 24, step: 1, unit: "px", slider: true },
      { key: "letterSpacing", label: "字间距", type: "number", min: -0.5, max: 2, step: 0.1, unit: "px" },
    ],
    defaults: createDefaultConfig({
      fontSize: 16,
      lineHeight: 1.625,
      textIndent: 0,
      paragraphSpacing: 8,
      letterSpacing: 0,
    }),
    buildCss: (config) => {
      const fontSize = px(config.values.fontSize, 16);
      const lineHeight = numberValue(config.values.lineHeight, 1.625);
      const textIndent = em(config.values.textIndent, 0);
      const paragraphSpacing = px(config.values.paragraphSpacing, 8);
      const letterSpacing = px(config.values.letterSpacing, 0);

      return `:root {
  --b3-font-size: ${fontSize} !important;
  --b3-font-line-height: ${lineHeight} !important;
  letter-spacing: ${letterSpacing} !important;
}

.protyle-wysiwyg [data-type="NodeParagraph"] {
  text-indent: ${textIndent} !important;
  margin-bottom: ${paragraphSpacing} !important;
}`;
    },
  },
  {
    value: "editorWidth",
    label: "编辑器宽度",
    hint: "自定义编辑区最大宽度和内容内边距",
    preview: "↔️",
    risk: "全屋改造",
    controls: [
      { key: "maxWidth", label: "最大宽度", type: "number", min: 600, max: 2000, step: 10, unit: "px", slider: true },
      { key: "fullWidth", label: "全宽模式", type: "select", options: [{ label: "否", value: "no" }, { label: "是", value: "yes" }] },
      { key: "contentPadding", label: "内容边距", type: "number", min: 0, max: 60, step: 2, unit: "px", slider: true },
    ],
    defaults: createDefaultConfig({
      maxWidth: 900,
      fullWidth: "no",
      contentPadding: 16,
    }),
    buildCss: (config) => {
      const maxWidth = px(config.values.maxWidth, 900);
      const fullWidth = stringValue(config.values.fullWidth, "no");
      const contentPadding = px(config.values.contentPadding, 16);

      const widthRule = fullWidth === "yes"
        ? ".protyle-content { max-width: 100% !important; }"
        : `.protyle-content { max-width: ${maxWidth} !important; }`;

      return `${widthRule}

.protyle-content {
  padding-left: ${contentPadding} !important;
  padding-right: ${contentPadding} !important;
}`;
    },
  },
  {
    value: "fontFamily",
    label: "正文字体",
    hint: "设置正文和代码块的字体族",
    preview: "A",
    risk: "正文安全",
    controls: [
      {
        key: "mainFont",
        label: "正文字体",
        type: "select",
        options: [
          { label: "默认", value: "default" },
          { label: "思源黑体", value: "sourceHanSans" },
          { label: "苹方", value: "pingfang" },
          { label: "微软雅黑", value: "yahei" },
          { label: "霞鹜文楷", value: "lxgw" },
          { label: "自定义", value: "custom" },
        ],
      },
      {
        key: "codeFont",
        label: "代码字体",
        type: "select",
        options: [
          { label: "默认", value: "default" },
          { label: "JetBrains Mono", value: "jetbrains" },
          { label: "Fira Code", value: "firaCode" },
          { label: "Cascadia Code", value: "cascadia" },
          { label: "自定义", value: "custom" },
        ],
      },
      { key: "customMainFont", label: "自定义正文字体", type: "text", placeholder: "字体名称" },
    ],
    defaults: createDefaultConfig({
      mainFont: "default",
      codeFont: "default",
      customMainFont: "",
    }),
    buildCss: (config) => {
      const MAIN_FONT_MAP: Record<string, string> = {
        default: "",
        sourceHanSans: '"Source Han Sans SC", "Noto Sans SC", sans-serif',
        pingfang: '"PingFang SC", "Hiragino Sans GB", sans-serif',
        yahei: '"Microsoft YaHei", sans-serif',
        lxgw: '"LXGW WenKai", "霞鹜文楷", serif',
      };
      const CODE_FONT_MAP: Record<string, string> = {
        default: "",
        jetbrains: '"JetBrains Mono", monospace',
        firaCode: '"Fira Code", monospace',
        cascadia: '"Cascadia Code", monospace',
      };

      const mainFontKey = stringValue(config.values.mainFont, "default");
      const codeFontKey = stringValue(config.values.codeFont, "default");
      const customFont = stringValue(config.values.customMainFont, "");

      const mainFont = mainFontKey === "custom" && customFont
        ? `"${customFont}", sans-serif`
        : MAIN_FONT_MAP[mainFontKey] || "";
      const codeFont = CODE_FONT_MAP[codeFontKey] || "";

      const rules: string[] = [];
      if (mainFont) {
        rules.push(`:root {\n  --b3-font-family-protyle: ${mainFont} !important;\n}`);
      }
      if (codeFont) {
        rules.push(`:root {\n  --b3-font-family-code: ${codeFont} !important;\n}`);
      }
      return rules.join("\n\n");
    },
  },
  {
    value: "topBarStyle",
    label: "顶栏样式",
    hint: "自定义顶栏背景、高度和边框（透明/毛玻璃/自定义色）",
    preview: "🔧",
    risk: "全屋改造",
    controls: [
      {
        key: "mode", label: "风格", type: "select",
        options: [
          { label: "默认", value: "default" },
          { label: "透明", value: "transparent" },
          { label: "毛玻璃", value: "glass" },
        ],
      },
      { key: "blurRadius", label: "模糊半径", type: "number", min: 0, max: 20, step: 1, unit: "px", slider: true },
      { key: "backgroundColor", label: "背景色", type: "color" },
      { key: "height", label: "高度", type: "number", min: 32, max: 48, step: 1, unit: "px", slider: true },
      {
        key: "borderBottom", label: "底边线", type: "select",
        options: [{ label: "显示", value: "show" }, { label: "隐藏", value: "hide" }],
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
      const mode = stringValue(config.values.mode, "default");
      const blurRadius = px(config.values.blurRadius, 12);
      const backgroundColor = stringValue(config.values.backgroundColor, "#ffffff");
      const height = px(config.values.height, 36);
      const borderBottom = stringValue(config.values.borderBottom, "show");

      const rules: string[] = [`#toolbar { height: ${height} !important; }`];

      if (mode === "transparent") {
        rules.push("#toolbar { background: transparent !important; }");
      } else if (mode === "glass") {
        rules.push(`#toolbar { background: ${backgroundColor}cc !important; backdrop-filter: blur(${blurRadius}) !important; -webkit-backdrop-filter: blur(${blurRadius}) !important; }`);
      } else {
        rules.push(`#toolbar { background: ${backgroundColor} !important; }`);
      }

      if (borderBottom === "hide") {
        rules.push("#toolbar { border-bottom: none !important; box-shadow: none !important; }");
      }

      return rules.join("\n");
    },
  },
  {
    value: "scrollbarStyle",
    label: "滚动条样式",
    hint: "自定义滚动条宽度、颜色和显示模式",
    preview: "📏",
    risk: "全屋改造",
    controls: [
      { key: "width", label: "宽度", type: "number", min: 4, max: 16, step: 1, unit: "px", slider: true },
      { key: "trackColor", label: "轨道颜色", type: "color" },
      { key: "thumbColor", label: "滑块颜色", type: "color" },
      { key: "thumbRadius", label: "滑块圆角", type: "number", min: 0, max: 8, step: 1, unit: "px" },
      {
        key: "hideMode", label: "显示模式", type: "select",
        options: [
          { label: "始终显示", value: "always" },
          { label: "悬停显示", value: "hover" },
          { label: "完全隐藏", value: "hidden" },
        ],
      },
    ],
    defaults: createDefaultConfig({
      width: 6,
      trackColor: "#f0f0f0",
      thumbColor: "#c0c0c0",
      thumbRadius: 4,
      hideMode: "always",
    }),
    buildCss: (config) => {
      const width = px(config.values.width, 6);
      const trackColor = stringValue(config.values.trackColor, "#f0f0f0");
      const thumbColor = stringValue(config.values.thumbColor, "#c0c0c0");
      const thumbRadius = px(config.values.thumbRadius, 4);
      const hideMode = stringValue(config.values.hideMode, "always");

      if (hideMode === "hidden") {
        return "::-webkit-scrollbar { display: none !important; }\n* { scrollbar-width: none !important; }";
      }

      const hover = hideMode === "hover"
        ? `::-webkit-scrollbar { width: ${width} !important; opacity: 0; transition: opacity 200ms ease; }\n::-webkit-scrollbar:hover { opacity: 1; }`
        : `::-webkit-scrollbar { width: ${width} !important; }`;

      return `${hover}

::-webkit-scrollbar-track {
  background: ${trackColor} !important;
}

::-webkit-scrollbar-thumb {
  background: ${thumbColor} !important;
  border-radius: ${thumbRadius} !important;
}`;
    },
  },
  {
    value: "codeBlockStyle",
    label: "代码块外观",
    hint: "自定义代码块圆角、背景色、信息栏背景和最大高度",
    preview: "{ }",
    risk: "正文安全",
    controls: [
      { key: "borderRadius", label: "圆角", type: "number", min: 0, max: 16, step: 1, unit: "px", slider: true },
      { key: "backgroundColor", label: "背景色", type: "color" },
      { key: "headerBgColor", label: "信息栏背景", type: "color" },
      {
        key: "maxHeight", label: "最大高度", type: "select",
        options: [
          { label: "不限", value: "none" },
          { label: "300px", value: "300px" },
          { label: "500px", value: "500px" },
          { label: "70vh", value: "70vh" },
        ],
      },
      { key: "lineNumberColor", label: "行号颜色", type: "color" },
    ],
    defaults: createDefaultConfig({
      borderRadius: 6,
      backgroundColor: "#1e1e1e",
      headerBgColor: "#2d2d2d",
      maxHeight: "none",
      lineNumberColor: "#858585",
    }),
    buildCss: (config) => {
      const borderRadius = px(config.values.borderRadius, 6);
      const backgroundColor = stringValue(config.values.backgroundColor, "#1e1e1e");
      const headerBgColor = stringValue(config.values.headerBgColor, "#2d2d2d");
      const maxHeight = stringValue(config.values.maxHeight, "none");
      const lineNumberColor = stringValue(config.values.lineNumberColor, "#858585");

      const maxH = maxHeight === "none" ? "" : `max-height: ${maxHeight} !important;`;

      return `.protyle-wysiwyg .code-block {
  border-radius: ${borderRadius} !important;
  background: ${backgroundColor} !important;
}

.protyle-wysiwyg .code-block .protyle-action {
  background: ${headerBgColor} !important;
  border-radius: ${borderRadius} ${borderRadius} 0 0 !important;
}

.protyle-wysiwyg .code-block .hljs {
  ${maxH}
  overflow: auto !important;
}

.protyle-wysiwyg .protyle-linenumber {
  color: ${lineNumberColor} !important;
}`;
    },
  },
];