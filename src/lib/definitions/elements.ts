import type { FeatureDefinition } from "../feature-style-types"
import {
  createDefaultConfig,
  LINE_STYLE_OPTIONS,
  lineStyleValue,
  numberValue,
  px,
  stringValue,
} from "../feature-style-types"

export const ELEMENTS_DEFINITIONS: FeatureDefinition[] = [
  {
    buildCss: (config) => `
.protyle-wysiwyg [data-type]:hover:not(.protyle-wysiwyg [data-type="NodeList"]):not(.protyle-wysiwyg [data-type="NodeListItem"]):not(.protyle-wysiwyg [data-type="img"]) {
  background-color: ${stringValue(config.values.backgroundColor, "var(--style-editor-card-bg-soft)")} !important;
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
      backgroundColor: "var(--style-editor-card-bg-soft)",
      shadowSize: 3,
      shadowStrength: 0.05,
      transitionMs: 350,
    }),
    hint: "鼠标经过正文块时提供轻微底色和阴影反馈。",
    label: "段落悬停高亮",
    group: "块级元素",
    preview: "段落块",
    risk: "正文安全",
    value: "paragraphHover",
  },
  {
    buildCss: (config) => `
.protyle-wysiwyg div[fold="1"]:not(div[data-type="NodeListItem"]),
.protyle-wysiwyg [data-node-id][fold="1"]:not(.li):not([data-type="NodeHeading"]) {
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(111, 142, 207, 0.04),
    rgba(111, 142, 207, 0.04) 6px,
    rgba(111, 142, 207, 0.08) 0,
    rgba(111, 142, 207, 0.08) 12px
  );
  border-radius: ${px(config.values.radius, 5)};
  border: ${px(config.values.borderWidth, 1)} solid ${stringValue(config.values.borderColor, "var(--style-editor-card-border)")};
  opacity: ${numberValue(config.values.opacity, 0.85)};
}

.protyle-wysiwyg [fold="1"]:hover {
  opacity: ${numberValue(config.values.hoverOpacity, 1)};
  box-shadow: 0 0 ${px(config.values.shadowSize, 6)} ${stringValue(config.values.shadowColor, "var(--style-editor-card-shadow)")};
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
      borderColor: "var(--style-editor-card-border)",
      borderWidth: 1,
      hoverOpacity: 1,
      opacity: 0.85,
      radius: 5,
      shadowColor: "var(--style-editor-card-shadow)",
      shadowSize: 6,
    }),
    hint: "为折叠块增加条纹背景和悬停反馈。",
    label: "折叠块提示",
    group: "块级元素",
    preview: "折叠",
    risk: "正文安全",
    value: "foldedBlockStyle",
  },
  {
    buildCss: (config) => {
      const styleMode = stringValue(config.values.styleMode, "default")
      const padding = px(config.values.padding, 4)
      const color = stringValue(config.values.color, "var(--style-editor-blockquote-color)")
      const lineColor = stringValue(config.values.lineColor, "var(--style-editor-blockquote-line)")
      const backgroundColor = stringValue(config.values.backgroundColor, "var(--style-editor-blockquote-bg)")
      const marginY = px(config.values.marginY, 4)
      const radius = px(config.values.radius, 0)
      const borderColor = stringValue(config.values.borderColor, "transparent")

      if (styleMode && styleMode.startsWith("sticky-")) {
        let paperBg = "#fcf4df"
        let tapeColor = "#e4c411"
        let textColor = "#525252"
        if (styleMode === "sticky-red") {
          paperBg = "#f2dede"
          tapeColor = "#b94a48"
          textColor = "#a94442"
        } else if (styleMode === "sticky-blue") {
          paperBg = "#d9edf7"
          tapeColor = "#3a87ad"
          textColor = "#31708f"
        } else if (styleMode === "sticky-green") {
          paperBg = "#dff0d8"
          tapeColor = "#468847"
          textColor = "#3c763d"
        }
        return `
.b3-typography blockquote,
.b3-typography .bq,
.protyle-wysiwyg blockquote,
.protyle-wysiwyg .bq {
  border-left: none !important;
  border-top: 3px solid ${tapeColor} !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08) !important;
  background-color: ${paperBg} !important;
  background-image: linear-gradient(rgba(131, 111, 86, 0.08) 1px, transparent 0),
                    linear-gradient(90deg, rgba(131, 111, 86, 0.08) 1px, transparent 0) !important;
  background-size: 16px 16px !important;
  border-radius: 6px !important;
  padding: 16px 12px !important;
  color: ${textColor} !important;
  margin: ${marginY} 0;
}
        `.trim()
      }

      return `
.b3-typography blockquote,
.b3-typography .bq,
.protyle-wysiwyg blockquote,
.protyle-wysiwyg .bq {
  padding: ${padding};
  color: ${color} !important;
  border-left: 0.25em solid ${lineColor} !important;
  background-color: ${backgroundColor} !important;
  margin: ${marginY} 0;
  border-radius: ${radius};
}

.protyle-wysiwyg .bq:not(.bq .bq) {
  box-shadow: 0 0 0 1px ${borderColor} inset !important;
}`.trim()
    },
    controls: [
      {
        key: "styleMode",
        label: "块风格",
        options: [
          { label: "默认竖线", value: "default" },
          { label: "便利贴(黄)", value: "sticky-yellow" },
          { label: "便利贴(红)", value: "sticky-red" },
          { label: "便利贴(蓝)", value: "sticky-blue" },
          { label: "便利贴(绿)", value: "sticky-green" },
        ],
        type: "select",
      },
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
      styleMode: "default",
      backgroundColor: "var(--style-editor-blockquote-bg)",
      borderColor: "transparent",
      color: "var(--style-editor-blockquote-color)",
      lineColor: "var(--style-editor-blockquote-line)",
      marginY: 4,
      padding: 4,
      radius: 0,
    }),
    hint: "按参考样式配置引述块的竖线、颜色和间距。",
    label: "引述块",
    group: "块级元素",
    preview: "引述",
    risk: "正文安全",
    value: "blockquoteFrame",
  },
  {
    value: "imageRadius",
    label: "图片增强",
    hint: "自定义图片圆角、阴影、悬停缩放、最大宽度和边框",
    group: "块级元素",
    preview: "🖼️",
    risk: "正文安全",
    controls: [
      {
        key: "radius",
        label: "圆角",
        type: "number",
        min: 0,
        max: 24,
        step: 1,
        unit: "px",
        slider: true,
      },
      {
        key: "shadow",
        label: "阴影",
        type: "select",
        options: [
          {
            label: "无",
            value: "none",
          },
          {
            label: "轻微",
            value: "light",
          },
          {
            label: "中等",
            value: "medium",
          },
          {
            label: "强",
            value: "strong",
          },
        ],
      },
      {
        key: "hoverZoom",
        label: "悬停效果",
        type: "select",
        options: [
          {
            label: "无",
            value: "none",
          },
          {
            label: "轻微放大",
            value: "slight",
          },
          {
            label: "明显放大",
            value: "obvious",
          },
        ],
      },
      {
        key: "maxWidth",
        label: "最大宽度",
        type: "select",
        options: [
          {
            label: "自动",
            value: "auto",
          },
          {
            label: "80%",
            value: "80%",
          },
          {
            label: "100%",
            value: "100%",
          },
        ],
      },
      {
        key: "borderColor",
        label: "边框颜色",
        type: "color",
      },
      {
        key: "borderWidth",
        label: "边框粗细",
        type: "number",
        min: 0,
        max: 4,
        step: 1,
        unit: "px",
      },
    ],
    defaults: createDefaultConfig({
      radius: 6,
      shadow: "none",
      hoverZoom: "none",
      maxWidth: "auto",
      borderColor: "var(--style-editor-card-border)",
      borderWidth: 0,
    }),
    buildCss: (config) => {
      const radius = px(config.values.radius, 6)
      const shadow = stringValue(config.values.shadow, "none")
      const hoverZoom = stringValue(config.values.hoverZoom, "none")
      const maxWidth = stringValue(config.values.maxWidth, "auto")
      const borderColor = stringValue(config.values.borderColor, "var(--style-editor-card-border)")
      const borderWidth = numberValue(config.values.borderWidth, 0)

      const SHADOW_MAP: Record<string, string> = {
        none: "none",
        light: "0 2px 8px rgba(0,0,0,0.08)",
        medium: "0 4px 16px rgba(0,0,0,0.12)",
        strong: "0 8px 32px rgba(0,0,0,0.18)",
      }
      const ZOOM_MAP: Record<string, string> = {
        none: "",
        slight: "transform: scale(1.02);",
        obvious: "transform: scale(1.08);",
      }

      const maxW = maxWidth === "auto" ? "" : `max-width: ${maxWidth} !important;`
      const border = borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor} !important;` : ""

      let css = `.protyle-wysiwyg img {
  border-radius: ${radius} !important;
  box-shadow: ${SHADOW_MAP[shadow]} !important;
  ${maxW}
  ${border}
  transition: transform 200ms ease, box-shadow 200ms ease !important;
}`

      if (ZOOM_MAP[hoverZoom]) {
        css += `\n\n.protyle-wysiwyg img:hover {
  ${ZOOM_MAP[hoverZoom]}
}`
      }

      return css
    },
  },
  {
    buildCss: (config) => {
      const headerBg = stringValue(config.values.headerBackgroundColor, "var(--style-editor-table-header-bg)")
      const headerFg = stringValue(config.values.headerColor, "var(--style-editor-table-header-color)")
      const borderCol = stringValue(config.values.borderColor, "var(--style-editor-table-border)")
      const borderW = numberValue(config.values.borderWidth, 1.5)
      const padY = px(config.values.cellPaddingY, 6)
      const padX = px(config.values.cellPaddingX, 10)
      const radius = px(config.values.borderRadius, 0)
      const textCol = stringValue(config.values.textColor, "var(--style-editor-table-text)")
      const oddBg = stringValue(config.values.oddRowBackground, "var(--style-editor-table-row-odd)")
      const evenBg = stringValue(config.values.evenRowBackground, "var(--style-editor-table-row-even)")

      let rules = `
.b3-typography table,
.protyle-wysiwyg table {
  font-weight: 500;
  border-collapse: collapse;
  border-radius: ${radius} !important;
  overflow: hidden !important;
}

.b3-typography table thead,
.protyle-wysiwyg table thead {
  background-color: ${headerBg} !important;
  color: ${headerFg} !important;
}

.b3-typography table td,
.b3-typography table th,
.protyle-wysiwyg table td,
.protyle-wysiwyg table th {
  border: ${borderW}px solid ${borderCol} !important;
  padding: ${padY} ${padX};
}`.trim()

      if (textCol) {
        rules += `\n.b3-typography table td, .protyle-wysiwyg table td { color: ${textCol} !important; }`
      }
      if (oddBg) {
        rules += `\n.b3-typography table tr:nth-child(odd), .protyle-wysiwyg table tr:nth-child(odd) { background-color: ${oddBg} !important; }`
      }
      if (evenBg) {
        rules += `\n.b3-typography table tr:nth-child(even), .protyle-wysiwyg table tr:nth-child(even) { background-color: ${evenBg} !important; }`
      }

      return rules
    },
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
        key: "textColor",
        label: "单元格字色",
        type: "color",
      },
      {
        key: "oddRowBackground",
        label: "奇数行底色",
        type: "color",
      },
      {
        key: "evenRowBackground",
        label: "偶数行底色",
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
      {
        key: "borderRadius",
        label: "表格圆角",
        max: 16,
        min: 0,
        step: 1,
        type: "number",
        unit: "px",
        slider: true,
      },
    ],
    defaults: createDefaultConfig({
      borderColor: "var(--style-editor-table-border)",
      borderWidth: 1.5,
      cellPaddingX: 10,
      cellPaddingY: 6,
      headerBackgroundColor: "var(--style-editor-table-header-bg)",
      headerColor: "var(--style-editor-table-header-color)",
      textColor: "var(--style-editor-table-text)",
      oddRowBackground: "var(--style-editor-table-row-odd)",
      evenRowBackground: "var(--style-editor-table-row-even)",
      borderRadius: 0,
    }),
    hint: "增强表头、单元格圆角底色、边框和奇偶行阅读密度。",
    label: "表格增强",
    group: "块级元素",
    preview: "表格",
    risk: "正文安全",
    value: "tableStyle",
  },
  {
    buildCss: (config) => `
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
          {
            label: "渐变",
            value: "gradient",
          },
          {
            label: "线条",
            value: "line",
          },
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
        options: LINE_STYLE_OPTIONS.filter((option) => option.value !== "none" && option.value !== "wavy"),
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
    group: "块级元素",
    preview: "——",
    risk: "正文安全",
    value: "hrStyle",
  },
  {
    value: "codeBlockStyle",
    label: "代码块外观",
    hint: "自定义代码块圆角、背景色、信息栏背景和最大高度",
    group: "块级元素",
    preview: "{ }",
    risk: "正文安全",
    controls: [
      {
        key: "borderRadius",
        label: "圆角",
        type: "number",
        min: 0,
        max: 16,
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
        key: "headerBgColor",
        label: "信息栏背景",
        type: "color",
      },
      {
        key: "macButtons",
        label: "Mac风格按钮",
        type: "select",
        options: [
          { label: "显示", value: "yes" },
          { label: "隐藏", value: "no" },
        ],
      },
      {
        key: "maxHeight",
        label: "最大高度",
        type: "select",
        options: [
          {
            label: "不限",
            value: "none",
          },
          {
            label: "300px",
            value: "300px",
          },
          {
            label: "500px",
            value: "500px",
          },
          {
            label: "70vh",
            value: "70vh",
          },
        ],
      },
      {
        key: "lineNumberColor",
        label: "行号颜色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      borderRadius: 6,
      backgroundColor: "var(--style-editor-code-block-bg)",
      headerBgColor: "var(--style-editor-code-block-header-bg)",
      macButtons: "no",
      maxHeight: "none",
      lineNumberColor: "var(--style-editor-code-block-color)",
    }),
    buildCss: (config) => {
      const borderRadius = px(config.values.borderRadius, 6)
      const backgroundColor = stringValue(config.values.backgroundColor, "var(--style-editor-code-block-bg)")
      const headerBgColor = stringValue(config.values.headerBgColor, "var(--style-editor-code-block-header-bg)")
      const macButtons = stringValue(config.values.macButtons, "no")
      const maxHeight = stringValue(config.values.maxHeight, "none")
      const lineNumberColor = stringValue(config.values.lineNumberColor, "var(--style-editor-code-block-color)")

      const maxH = maxHeight === "none" ? "" : `max-height: ${maxHeight} !important;`

      const rules: string[] = []

      rules.push(`.protyle-wysiwyg .code-block {
  border-radius: ${borderRadius} !important;
  background: ${backgroundColor} !important;
}`)

      if (macButtons === "yes") {
        rules.push(`.protyle-wysiwyg .code-block {
  position: relative !important;
}

.protyle-wysiwyg .code-block .protyle-action {
  background: ${headerBgColor} !important;
  border-radius: ${borderRadius} ${borderRadius} 0 0 !important;
  display: flex !important;
  padding-left: 14px !important;
}

.protyle-wysiwyg .code-block .protyle-action::before {
  content: "" !important;
  display: block !important;
  width: 9px !important;
  height: 9px !important;
  border-radius: 50% !important;
  background-color: #ff5f56 !important;
  box-shadow: 14px 0 0 #ffbd2e, 28px 0 0 #27c93f !important;
  margin-right: 36px !important;
  align-self: center !important;
  flex-shrink: 0 !important;
}`)
      } else {
        rules.push(`.protyle-wysiwyg .code-block .protyle-action {
  background: ${headerBgColor} !important;
  border-radius: ${borderRadius} ${borderRadius} 0 0 !important;
}`)
      }

      rules.push(`.protyle-wysiwyg .code-block .hljs {
  ${maxH}
  overflow: auto !important;
}`)

      rules.push(`.protyle-wysiwyg .protyle-linenumber {
  color: ${lineNumberColor} !important;
}`)

      return rules.join("\n")
    },
  },
  {
    value: "blockFullWidth",
    label: "特定块全宽显示",
    hint: "使特定类型的块（图片、视频挂件、表格、数据库等）全宽显示以展示更多内容。也可以对单个块加属性 'custom-afwd=\"on\"' 单独启用。",
    group: "块级元素",
    preview: "↔️",
    risk: "正文安全",
    controls: [
      {
        key: "fullWidthImg",
        label: "图片全宽",
        type: "select",
        options: [
          { label: "是", value: "yes" },
          { label: "否", value: "no" },
        ],
      },
      {
        key: "fullWidthTable",
        label: "表格全宽",
        type: "select",
        options: [
          { label: "是", value: "yes" },
          { label: "否", value: "no" },
        ],
      },
      {
        key: "fullWidthDb",
        label: "数据库全宽",
        type: "select",
        options: [
          { label: "是", value: "yes" },
          { label: "否", value: "no" },
        ],
      },
    ],
    defaults: createDefaultConfig({
      fullWidthImg: "no",
      fullWidthTable: "no",
      fullWidthDb: "no",
    }),
    buildCss: (config) => {
      const rules: string[] = []
      const imgVal = stringValue(config.values.fullWidthImg, "no")
      const tableVal = stringValue(config.values.fullWidthTable, "no")
      const dbVal = stringValue(config.values.fullWidthDb, "no")

      if (imgVal === "yes") {
        rules.push(`.protyle-wysiwyg [data-type="NodeParagraph"]:has(img) { width: 100vw !important; max-width: 100vw !important; margin-left: calc(50% - 50vw) !important; }`)
      }
      if (tableVal === "yes") {
        rules.push(`.protyle-wysiwyg [data-type="NodeTable"] { width: 100vw !important; max-width: 100vw !important; margin-left: calc(50% - 50vw) !important; }`)
      }
      if (dbVal === "yes") {
        rules.push(`.protyle-wysiwyg [data-type="NodeAttributeView"] { width: 100vw !important; max-width: 100vw !important; margin-left: calc(50% - 50vw) !important; }`)
      }
      rules.push(`.protyle-wysiwyg [data-node-id][custom-afwd="on"] { width: 100vw !important; max-width: 100vw !important; margin-left: calc(50% - 50vw) !important; }`)
      return rules.join("\n")
    },
  },
  {
    value: "memoStyle",
    label: "备注美化与动画",
    hint: "美化行内备注 (Memo) 样式，将原隐蔽的虚线下划线转为精致的高亮药丸背景或卡片气泡。",
    group: "行内元素",
    preview: "💬",
    risk: "正文安全",
    controls: [
      {
        key: "styleMode",
        label: "备注风格",
        type: "select",
        options: [
          { label: "精致卡片", value: "card" },
          { label: "气泡胶囊", value: "bubble" },
        ],
      },
      {
        key: "memoColor",
        label: "备注底色",
        type: "color",
      },
    ],
    defaults: createDefaultConfig({
      styleMode: "card",
      memoColor: "var(--b3-theme-primary-lighter, #ffbd2e)",
    }),
    buildCss: (config) => {
      const mode = stringValue(config.values.styleMode, "card")
      const color = stringValue(config.values.memoColor, "var(--b3-theme-primary-lighter, #ffbd2e)")

      if (mode === "bubble") {
        return `
.protyle-wysiwyg span[data-type~="memo"] {
  background: ${color}22 !important;
  border: 1px solid ${color} !important;
  border-radius: 12px !important;
  padding: 2px 8px !important;
  font-size: 0.95em !important;
  transition: all 200ms ease !important;
}
.protyle-wysiwyg span[data-type~="memo"]:hover {
  background: ${color}44 !important;
  box-shadow: 0 2px 6px ${color}33 !important;
}
        `.trim()
      }

      return `
.protyle-wysiwyg span[data-type~="memo"] {
  background-color: ${color}33 !important;
  border-bottom: 2px solid ${color} !important;
  border-radius: 3px !important;
  padding: 0 4px !important;
  transition: all 200ms ease-in-out !important;
}
.protyle-wysiwyg span[data-type~="memo"]:hover {
  background-color: ${color}66 !important;
  transform: scale(1.02) !important;
}
      `.trim()
    },
  },
  {
    value: "linkIcons",
    label: "智能链接图标",
    hint: "自动为内链（块引用）和外部超链接头部增加区分 Emoji 图标。",
    group: "行内元素",
    preview: "🔗",
    risk: "正文安全",
    controls: [
      {
        key: "internalIcon",
        label: "内链前缀",
        type: "text",
        placeholder: "如 🔗",
      },
      {
        key: "externalIcon",
        label: "外链前缀",
        type: "text",
        placeholder: "如 🌐",
      },
    ],
    defaults: createDefaultConfig({
      internalIcon: "🔗",
      externalIcon: "🌐",
    }),
    buildCss: (config) => {
      const intIcon = stringValue(config.values.internalIcon, "🔗")
      const extIcon = stringValue(config.values.externalIcon, "🌐")

      return `
.protyle-wysiwyg span[data-type~="block-ref"]::before {
  content: "${intIcon} " !important;
  font-size: 0.9em !important;
  margin-right: 2px !important;
}
.protyle-wysiwyg span[data-type~="a"]:not([href^="siyuan://"])::before {
  content: "${extIcon} " !important;
  font-size: 0.9em !important;
  margin-right: 2px !important;
}
      `.trim()
    },
  },
]
