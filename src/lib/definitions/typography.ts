import type { FeatureDefinition } from "../feature-style-types"
import {
  createDefaultConfig,
  em,
  LINE_STYLE_OPTIONS,
  lineStyleValue,
  LINK_LINE_STYLE_OPTIONS,
  numberValue,
  optionValue,
  px,
  stringValue,
} from "../feature-style-types"

export const TYPOGRAPHY_DEFINITIONS: FeatureDefinition[] = [
  {
    buildCss: (config) => `
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
    group: "排版",
    preview: "H1",
    risk: "正文安全",
    value: "headingSpacing",
  },
  {
    buildCss: (config) => {
      const mode = stringValue(config.values.mode, "leftBar")
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
}`.trim()
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
}`.trim()
    },
    controls: [
      {
        key: "mode",
        label: "装饰风格",
        options: [
          {
            label: "左竖线",
            value: "leftBar",
          },
          {
            label: "下划线",
            value: "underline",
          },
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
    group: "排版",
    preview: "H1",
    risk: "正文安全",
    value: "headingDecoration",
  },
  {
    buildCss: (_config) => `
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
    group: "排版",
    preview: "H·",
    risk: "全屋改造",
    value: "headingNumbering",
  },
  {
    buildCss: (config) => `
.protyle-wysiwyg [data-node-id].li[data-subtype="u"] > .protyle-action {
  color: ${stringValue(config.values.markerColor, "var(--style-editor-list-marker)")};
}`.trim(),
    controls: [
      {
        key: "markerColor",
        label: "圆点颜色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      markerColor: "var(--style-editor-list-marker)",
    }),
    hint: "调整无序列表圆点的颜色，保持层级结构不变。",
    label: "无序列表圆点颜色",
    group: "列表",
    preview: "•",
    risk: "正文安全",
    value: "unorderedListMarkerColor",
  },
  {
    buildCss: (config) => `
.protyle-wysiwyg [data-node-id].li:has(.block-focus) > .list:has(.block-focus) > .li::after {
  content: "";
  display: block;
  box-sizing: border-box;
  border-left: ${px(config.values.lineWidth, 2)} solid ${stringValue(config.values.lineColor, "var(--style-editor-list-line)")};
  border-bottom: ${px(config.values.lineWidth, 2)} solid ${stringValue(config.values.lineColor, "var(--style-editor-list-line)")};
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
      lineColor: "var(--style-editor-list-line)",
      lineWidth: 2,
      radius: 8,
    }),
    hint: "为聚焦列表项显示层级连接线（需配合 JS 激活 block-focus）。",
    label: "列表层次线",
    group: "列表",
    preview: "├─",
    risk: "全屋改造",
    value: "listBulletLine",
  },
  {
    buildCss: (config) => `
.protyle-wysiwyg div[data-subtype="o"].list {
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
.protyle-wysiwyg .list[data-subtype="o"] {
  counter-reset: o1 0 o2 0 o3 0 o4 0 o5 0 o6 0;
}
.protyle-wysiwyg .list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action {
  color: transparent !important;
}
.protyle-wysiwyg .list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o2;
  content: var(--o2-style);
  position: absolute;
}
.protyle-wysiwyg .list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o3;
  content: var(--o3-style);
  position: absolute;
}
.protyle-wysiwyg .list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o4;
  content: var(--o4-style);
  position: absolute;
}
.protyle-wysiwyg .list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o5;
  content: var(--o5-style);
  position: absolute;
}
.protyle-wysiwyg .list[data-subtype="o"] > .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o6;
  content: var(--o6-style);
  position: absolute;
}
.protyle-wysiwyg .li[data-subtype="o"] .li[data-subtype="o"] .protyle-action::after {
  mix-blend-mode: unset !important;
  color: var(--b3-theme-on-surface) !important;
}
.protyle-wysiwyg .li[data-subtype="o"] > .protyle-action::after {
  padding: ${px(config.values.paddingX, 2)} ${px(config.values.paddingY, 3)};
  width: ${px(config.values.width, 24)};
  display: flex;
  justify-content: center;
}
.protyle-wysiwyg [data-node-id].li[fold="1"]:not([data-subtype="o"].en_item_bullet_actived) > .protyle-action::after,
.protyle-wysiwyg [data-node-id].li > .protyle-action:hover::after {
  background-color: ${stringValue(config.values.showBackground, "no") === "yes" ? stringValue(config.values.hoverBgColor, "oklch(55% 0.05 250 / 0.3)") : "transparent"} !important;
}`.trim(),
    controls: [
      {
        key: "showBackground",
        label: "悬停背景",
        options: [
          {
            label: "显示",
            value: "yes",
          },
          {
            label: "隐藏",
            value: "no",
          },
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
    group: "列表",
    preview: "1.",
    risk: "正文安全",
    value: "orderedListStyle",
  },
  {
    buildCss: (config) => {
      const lineStyle = lineStyleValue(config.values.lineStyle, "solid")
      return `
.b3-typography mark,
.b3-typography span[data-type~=mark],
.protyle-wysiwyg mark,
.protyle-wysiwyg span[data-type~=mark] {
  color: ${stringValue(config.values.color, "var(--b3-theme-on-background)")} !important;
  background-color: ${stringValue(config.values.backgroundColor, "var(--style-editor-mark-bg)")} !important;
  border-bottom: ${numberValue(config.values.emphasisThickness, 2)}px ${lineStyle} ${stringValue(config.values.emphasisColor, "var(--style-editor-mark-line)")} !important;
}`.trim()
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
        options: LINE_STYLE_OPTIONS.filter((option) => option.value !== "none"),
        type: "select",
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "var(--style-editor-mark-bg)",
      color: "var(--b3-theme-on-background)",
      emphasisColor: "var(--style-editor-mark-line)",
      emphasisThickness: 2,
      lineStyle: "solid",
    }),
    hint: "调整标记文本的背景色、底线强调和字色。",
    label: "标记文本样式",
    group: "行内元素",
    preview: "标记",
    risk: "正文安全",
    value: "markStyle",
  },
  {
    buildCss: (config) => `
.fn__code,
.b3-typography code:not(.hljs),
.b3-typography span[data-type~=code],
.protyle-wysiwyg code:not(.hljs),
.protyle-wysiwyg span[data-type~=code] {
  color: ${stringValue(config.values.color, "var(--style-editor-inline-code-color)")} !important;
  background-color: ${stringValue(config.values.backgroundColor, "var(--style-editor-inline-code-bg)")} !important;
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
      backgroundColor: "var(--style-editor-inline-code-bg)",
      color: "var(--style-editor-inline-code-color)",
      paddingX: 4,
      paddingY: 2,
      radius: 4,
    }),
    hint: "调整行内代码的字色、背景色、圆角和内边距。",
    label: "行内代码样式",
    group: "行内元素",
    preview: "<code/>",
    risk: "正文安全",
    value: "inlineCodeStyle",
  },
  {
    buildCss: (config) => `
.protyle-wysiwyg [data-node-id] span[data-type~="block-ref"]:not(.av__celltext),
.protyle-wysiwyg [data-node-id] span[data-type~="file-annotation-ref"]:not(.av__celltext) {
  color: ${stringValue(config.values.color, "var(--style-editor-link-color)")} !important;
  background-color: ${stringValue(config.values.backgroundColor, "var(--style-editor-link-bg)")} !important;
  border-bottom: ${numberValue(config.values.lineThickness, 1)}px ${lineStyleValue(config.values.lineStyle, "dashed")} ${stringValue(config.values.lineColor, "var(--style-editor-link-line)")} !important;
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
        options: LINE_STYLE_OPTIONS.filter((option) => option.value !== "wavy"),
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
      backgroundColor: "var(--style-editor-link-bg)",
      color: "var(--style-editor-link-color)",
      fontWeight: 600,
      lineColor: "var(--style-editor-link-line)",
      lineStyle: "dashed",
      lineThickness: 1,
      offset: 2,
    }),
    hint: "调整块引用链接和文件标注的字色、背景和底线样式。",
    label: "引用链接样式",
    group: "行内元素",
    preview: "引用",
    risk: "正文安全",
    value: "blockRefStyle",
  },
  {
    buildCss: (config) => {
      const lineStyle = optionValue(config.values.lineStyle, "dashed", LINK_LINE_STYLE_OPTIONS)
      const textDecoration = lineStyle === "none" ? "none" : "none"
      const border = lineStyle === "none" ? "none" : `1px ${lineStyle} currentColor`
      return `
.protyle-wysiwyg [data-node-id] span[data-type~=a] {
  color: ${stringValue(config.values.color, "var(--style-editor-link-color)")} !important;
  text-decoration: ${textDecoration} !important;
  border-bottom: ${border} !important;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.protyle-wysiwyg [data-node-id] span[data-type~=a]:hover {
  color: ${stringValue(config.values.hoverColor, "var(--style-editor-link-hover)")} !important;
  border-bottom-color: ${stringValue(config.values.hoverColor, "var(--style-editor-link-hover)")} !important;
}`.trim()
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
      color: "var(--style-editor-link-color)",
      hoverColor: "var(--style-editor-link-hover)",
      lineStyle: "dashed",
    }),
    hint: "统一块内超链接的颜色和悬停反馈。",
    label: "超链接强调",
    group: "行内元素",
    preview: "链接",
    risk: "正文安全",
    value: "linkStyle",
  },
  {
    buildCss: (config) => {
      const lineStyle = lineStyleValue(config.values.lineStyle, "solid")
      return lineStyle === "wavy"
        ? `
.b3-typography u,
.b3-typography span[data-type~=u],
.protyle-wysiwyg u,
.protyle-wysiwyg span[data-type~=u] {
  text-decoration-line: underline !important;
  text-decoration-style: wavy !important;
  text-decoration-thickness: ${px(config.values.thickness, 2)} !important;
  text-decoration-color: ${stringValue(config.values.color, "#cfa87f")} !important;
  text-underline-offset: ${px(config.values.offset, 3)} !important;
}`.trim()
        : `
.b3-typography u,
.b3-typography span[data-type~=u],
.protyle-wysiwyg u,
.protyle-wysiwyg span[data-type~=u] {
  border-bottom: ${numberValue(config.values.thickness, 1.5)}px ${lineStyleValue(config.values.lineStyle, "solid")} ${stringValue(config.values.color, "#cfa87f")} !important;
  text-decoration: none !important;
  padding-bottom: ${px(config.values.offset, 1)};
}`.trim()
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
        options: LINE_STYLE_OPTIONS.filter((option) => option.value !== "none"),
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
      color: "#cfa87f",
      lineStyle: "solid",
      offset: 1,
      thickness: 1.5,
    }),
    hint: "调整下划线的颜色、粗细和线型。",
    label: "下划线样式",
    group: "行内元素",
    preview: "下划线",
    risk: "正文安全",
    value: "underlineStyle",
  },
  {
    buildCss: (config) => `
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
        options: LINE_STYLE_OPTIONS.filter((option) => option.value !== "none"),
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
    group: "行内元素",
    preview: "删除线",
    risk: "正文安全",
    value: "strikethroughStyle",
  },
  {
    buildCss: (config) => {
      const doneCol = stringValue(config.values.doneColor, "var(--b3-theme-on-surface)")
      const hoverBorder = stringValue(config.values.hoverBorderColor, "var(--style-editor-link-hover)")
      const opacity = numberValue(config.values.doneOpacity, 0.62)

      return `
.protyle-wysiwyg .protyle-task--done {
  opacity: ${opacity} !important;
}
.protyle-wysiwyg .protyle-task--done > [contenteditable="true"],
.protyle-wysiwyg .protyle-task--done > .p,
.protyle-wysiwyg .protyle-task--done > div {
  color: ${doneCol} !important;
}
.protyle-wysiwyg .protyle-task:hover > .protyle-action--task svg {
  color: ${hoverBorder} !important;
}
`.trim()
    },
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
      hoverBorderColor: "var(--style-editor-link-hover)",
    }),
    hint: "增强任务列表完成态和悬停反馈。",
    label: "任务列表状态",
    group: "列表",
    preview: "待办",
    risk: "正文安全",
    value: "taskListStyle",
  },
  {
    value: "typographyBase",
    label: "正文排版",
    hint: "调整正文字号、行高、缩进、段间距和字间距",
    group: "排版",
    preview: "📝",
    risk: "正文安全",
    controls: [
      {
        key: "fontSize",
        label: "字号",
        type: "number",
        min: 12,
        max: 20,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "lineHeight",
        label: "行高",
        type: "number",
        min: 1.2,
        max: 2.4,
        step: 0.05,
        slider: true,
      },
      {
        key: "textIndent",
        label: "首行缩进",
        type: "number",
        min: 0,
        max: 4,
        step: 0.5,
        unit: "em",
      },
      {
        key: "paragraphSpacing",
        label: "段间距",
        type: "number",
        min: 0,
        max: 24,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "letterSpacing",
        label: "字间距",
        type: "number",
        min: -0.5,
        max: 2,
        step: 0.1,
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      fontSize: 16,
      lineHeight: 1.625,
      textIndent: 0,
      paragraphSpacing: 8,
      letterSpacing: 0,
    }),
    buildCss: (config) => {
      const fontSize = px(config.values.fontSize, 16)
      const lineHeight = numberValue(config.values.lineHeight, 1.625)
      const textIndent = em(config.values.textIndent, 0)
      const paragraphSpacing = px(config.values.paragraphSpacing, 8)
      const letterSpacing = px(config.values.letterSpacing, 0)

      return `:root {
  --b3-font-size: ${fontSize} !important;
  --b3-font-line-height: ${lineHeight} !important;
  letter-spacing: ${letterSpacing} !important;
}

.protyle-wysiwyg [data-type="NodeParagraph"] {
  text-indent: ${textIndent} !important;
  margin-bottom: ${paragraphSpacing} !important;
}`
    },
  },
  {
    value: "fontFamily",
    label: "正文字体",
    hint: "设置正文和代码块的字体族",
    group: "排版",
    preview: "A",
    risk: "正文安全",
    controls: [
      {
        key: "mainFont",
        label: "正文字体",
        type: "select",
        options: [
          {
            label: "默认",
            value: "default",
          },
          {
            label: "思源黑体",
            value: "sourceHanSans",
          },
          {
            label: "苹方",
            value: "pingfang",
          },
          {
            label: "微软雅黑",
            value: "yahei",
          },
          {
            label: "霞鹜文楷",
            value: "lxgw",
          },
          {
            label: "自定义",
            value: "custom",
          },
        ],
      },
      {
        key: "codeFont",
        label: "代码字体",
        type: "select",
        options: [
          {
            label: "默认",
            value: "default",
          },
          {
            label: "JetBrains Mono",
            value: "jetbrains",
          },
          {
            label: "Fira Code",
            value: "firaCode",
          },
          {
            label: "Cascadia Code",
            value: "cascadia",
          },
          {
            label: "自定义",
            value: "custom",
          },
        ],
      },
      {
        key: "customMainFont",
        label: "自定义正文字体",
        type: "text",
        placeholder: "字体名称",
      },
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
      }
      const CODE_FONT_MAP: Record<string, string> = {
        default: "",
        jetbrains: '"JetBrains Mono", monospace',
        firaCode: '"Fira Code", monospace',
        cascadia: '"Cascadia Code", monospace',
      }

      const mainFontKey = stringValue(config.values.mainFont, "default")
      const codeFontKey = stringValue(config.values.codeFont, "default")
      const customFont = stringValue(config.values.customMainFont, "")

      const mainFont = mainFontKey === "custom" && customFont
        ? `"${customFont}", sans-serif`
        : MAIN_FONT_MAP[mainFontKey] || ""
      const codeFont = CODE_FONT_MAP[codeFontKey] || ""

      const rules: string[] = []
      if (mainFont) {
        rules.push(`:root {\n  --b3-font-family-protyle: ${mainFont} !important;\n}`)
      }
      if (codeFont) {
        rules.push(`:root {\n  --b3-font-family-code: ${codeFont} !important;\n}`)
      }
      return rules.join("\n\n")
    },
  },
  {
    value: "listMarkerStyle",
    label: "列表标记样式",
    hint: "自定义列表标记形状和列表项间距",
    preview: "📋",
    risk: "正文安全",
    group: "列表",
    controls: [
      {
        key: "unorderedStyle",
        label: "无序标记",
        type: "select",
        options: [
          {
            label: "默认",
            value: "default",
          },
          {
            label: "实心圆",
            value: "disc",
          },
          {
            label: "空心圆",
            value: "circle",
          },
          {
            label: "方块",
            value: "square",
          },
        ],
      },
      {
        key: "orderedStyle",
        label: "有序编号",
        type: "select",
        options: [
          {
            label: "默认",
            value: "default",
          },
          {
            label: "罗马数字",
            value: "upper-roman",
          },
          {
            label: "中文数字",
            value: "cjk",
          },
        ],
      },
      {
        key: "itemSpacing",
        label: "列表项间距",
        type: "number",
        min: 0,
        max: 12,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "indentation",
        label: "嵌套缩进",
        type: "number",
        min: 16,
        max: 40,
        step: 2,
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      unorderedStyle: "default",
      orderedStyle: "default",
      itemSpacing: 4,
      indentation: 24,
    }),
    buildCss: (config) => {
      const unordered = stringValue(config.values.unorderedStyle, "default")
      const ordered = stringValue(config.values.orderedStyle, "default")
      const spacing = px(config.values.itemSpacing, 4)
      const indent = px(config.values.indentation, 24)

      const rules: string[] = []

      // 1. 无序列表标记处理 (disc / circle / square)
      if (unordered !== "default") {
        const charMap: Record<string, string> = {
          disc: "●",
          circle: "○",
          square: "■",
        }
        const bulletChar = charMap[unordered] || "●"
        rules.push(`.protyle-wysiwyg .li[data-subtype="u"] > .protyle-action::before { content: "${bulletChar}" !important; }`)
      }

      // 2. 有序列表标记处理 (upper-roman / cjk)
      if (ordered !== "default") {
        const counterStyle = ordered === "cjk" ? "cjk-ideographic" : "upper-roman"
        const suffix = ordered === "cjk" ? "、" : "."
        rules.push(`
.protyle-wysiwyg .list[data-subtype="o"] {
  counter-reset: o1 0;
}
.protyle-wysiwyg .list[data-subtype="o"] > .li[data-subtype="o"] > .protyle-action {
  color: transparent !important;
}
.protyle-wysiwyg .list[data-subtype="o"] > .li[data-subtype="o"] > .protyle-action::after {
  counter-increment: o1;
  content: counter(o1, ${counterStyle})"${suffix}";
  position: absolute;
  color: var(--b3-theme-on-surface) !important;
  padding: 3px 2px;
  width: 24px;
  display: flex;
  justify-content: center;
  mix-blend-mode: unset !important;
  margin: -12px 0 0 -12px !important;
  line-height: 20px;
}
        `.trim())
      }

      // 3. 间距与缩进
      rules.push(`.protyle-wysiwyg .li { margin-bottom: ${spacing} !important; }`)
      rules.push(`.protyle-wysiwyg [data-node-id].li > [data-node-id] { margin-left: ${indent} !important; }`)

      return rules.join("\n")
    },
  },
  {
    value: "inlineTagStyle",
    label: "行内标签外观",
    hint: "自定义正文内所有标签的形状、底色、字色、隐藏'#'和布局模式等。",
    group: "行内元素",
    preview: "#标签",
    risk: "正文安全",
    controls: [
      {
        key: "backgroundColor",
        label: "标签底色",
        type: "color",
      },
      {
        key: "color",
        label: "标签字色",
        type: "color",
      },
      {
        key: "radius",
        label: "圆角半径",
        type: "number",
        min: 0,
        max: 20,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "fontSize",
        label: "字号比例",
        type: "number",
        min: 70,
        max: 100,
        step: 5,
        unit: "%",
        slider: true,
      },
      {
        key: "showHash",
        label: "显示 '#' 符号",
        type: "select",
        options: [
          { label: "显示", value: "yes" },
          { label: "隐藏", value: "no" },
        ],
      },
      {
        key: "position",
        label: "布局对齐",
        type: "select",
        options: [
          { label: "常规行内", value: "inline" },
          { label: "靠右悬浮", value: "floatEnd" },
        ],
      },
    ],
    defaults: createDefaultConfig({
      backgroundColor: "var(--b3-theme-primary-light)",
      color: "var(--b3-theme-primary)",
      radius: 4,
      fontSize: 90,
      showHash: "yes",
      position: "inline",
    }),
    buildCss: (config) => {
      const bgColor = stringValue(config.values.backgroundColor, "var(--b3-theme-primary-light)")
      const color = stringValue(config.values.color, "var(--b3-theme-primary)")
      const radius = px(config.values.radius, 4)
      const fontSize = numberValue(config.values.fontSize, 90)
      const showHash = stringValue(config.values.showHash, "yes")
      const position = stringValue(config.values.position, "inline")

      const rules: string[] = []

      // 基础样式
      rules.push(`
.protyle-wysiwyg span[data-type~="tag"] {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: ${radius} !important;
  padding: 1px 8px !important;
  margin: 0 3px !important;
  border: none !important;
  font-size: ${fontSize}% !important;
  font-weight: 500 !important;
  line-height: 1.4 !important;
  vertical-align: middle !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
  background-color: ${bgColor} !important;
  color: ${color} !important;
}
      `.trim())

      // HASH 隐藏
      if (showHash === "no") {
        rules.push(`
.protyle-wysiwyg span[data-type~="tag"]::before {
  content: "" !important;
  display: none !important;
}
        `.trim())
      } else {
        // 部分主题可能默认隐藏了 #，强制补充
        rules.push(`
.protyle-wysiwyg span[data-type~="tag"]::before {
  content: "#" !important;
  margin-right: 2px !important;
  opacity: 0.8 !important;
  display: inline-block !important;
}
        `.trim())
      }

      // 悬浮靠右对齐
      if (position === "floatEnd") {
        rules.push(`
.protyle-wysiwyg span[data-type~="tag"] {
  float: right !important;
  margin-left: 8px !important;
}
.protyle-wysiwyg [data-node-id]:has(span[data-type~="tag"])::after {
  content: "" !important;
  display: table !important;
  clear: both !important;
}
        `.trim())
      }

      return rules.join("\n")
    },
  },
]
