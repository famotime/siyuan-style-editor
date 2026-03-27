export type StyleTarget =
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "strong"
  | "blockquote"
  | "inlineCode"
  | "mark"
  | "codeBlock"
  | "bulletList"
  | "orderedList"
  | "taskList";

export interface StyleTargetMeta {
  value: StyleTarget;
  cssSelector: string;
  extractSelector: string;
  label: string;
  shortLabel: string;
  hint: string;
}

function createListSelectors(subtype: "o" | "t" | "u", typographySelector: string) {
  const listSelector = `[data-type="NodeList"][data-subtype="${subtype}"]`;
  const listItemSelector = `[data-type="NodeListItem"][data-subtype="${subtype}"]`;

  return {
    cssSelector: [
      `.b3-typography ${typographySelector}`,
      `.protyle-wysiwyg ${listSelector}`,
      `.protyle-wysiwyg ${listSelector} > ${listItemSelector} > :not([data-type="NodeList"])`,
    ].join(",\n"),
    extractSelector: `.protyle-wysiwyg ${listSelector}`,
  };
}

const STYLE_TARGET_CATALOG: StyleTargetMeta[] = [
  {
    value: "heading1",
    cssSelector: '[data-type="NodeHeading"].h1',
    extractSelector: '[data-type="NodeHeading"].h1',
    label: "H1 标题",
    shortLabel: "H1",
    hint: "用于文章总标题与大章节入口",
  },
  {
    value: "heading2",
    cssSelector: '[data-type="NodeHeading"].h2',
    extractSelector: '[data-type="NodeHeading"].h2',
    label: "H2 标题",
    shortLabel: "H2",
    hint: "用于主章节分隔",
  },
  {
    value: "heading3",
    cssSelector: '[data-type="NodeHeading"].h3',
    extractSelector: '[data-type="NodeHeading"].h3',
    label: "H3 标题",
    shortLabel: "H3",
    hint: "用于二级小节",
  },
  {
    value: "heading4",
    cssSelector: '[data-type="NodeHeading"].h4',
    extractSelector: '[data-type="NodeHeading"].h4',
    label: "H4 标题",
    shortLabel: "H4",
    hint: "用于次级说明",
  },
  {
    value: "heading5",
    cssSelector: '[data-type="NodeHeading"].h5',
    extractSelector: '[data-type="NodeHeading"].h5',
    label: "H5 标题",
    shortLabel: "H5",
    hint: "用于注释性标题",
  },
  {
    value: "heading6",
    cssSelector: '[data-type="NodeHeading"].h6',
    extractSelector: '[data-type="NodeHeading"].h6',
    label: "H6 标题",
    shortLabel: "H6",
    hint: "用于最细层级标题",
  },
  {
    value: "strong",
    cssSelector: [
      ".b3-typography strong",
      ".b3-typography span[data-type~=strong]",
      ".protyle-wysiwyg strong",
      ".protyle-wysiwyg span[data-type~=strong]",
    ].join(",\n"),
    extractSelector: [
      ".b3-typography strong",
      ".b3-typography span[data-type~=strong]",
      ".protyle-wysiwyg strong",
      ".protyle-wysiwyg span[data-type~=strong]",
    ].join(",\n"),
    label: "加粗文本",
    shortLabel: "B",
    hint: "用于段落重点强调",
  },
  {
    value: "blockquote",
    cssSelector: [
      ".b3-typography blockquote",
      ".b3-typography .bq",
      ".protyle-wysiwyg blockquote",
      ".protyle-wysiwyg .bq",
    ].join(",\n"),
    extractSelector: [
      ".b3-typography blockquote",
      ".b3-typography .bq",
      ".protyle-wysiwyg blockquote",
      ".protyle-wysiwyg .bq",
    ].join(",\n"),
    label: "引述块",
    shortLabel: "❝",
    hint: "用于引用、摘录与提示块",
  },
  {
    value: "inlineCode",
    cssSelector: [
      ".b3-typography code",
      ".b3-typography span[data-type~=code]",
      ".protyle-wysiwyg code",
      ".protyle-wysiwyg span[data-type~=code]",
    ].join(",\n"),
    extractSelector: [
      ".b3-typography code",
      ".b3-typography span[data-type~=code]",
      ".protyle-wysiwyg code",
      ".protyle-wysiwyg span[data-type~=code]",
    ].join(",\n"),
    label: "行内代码",
    shortLabel: "</>",
    hint: "用于命令、变量与代码片段",
  },
  {
    value: "mark",
    cssSelector: [
      ".b3-typography mark",
      ".b3-typography span[data-type~=mark]",
      ".protyle-wysiwyg mark",
      ".protyle-wysiwyg span[data-type~=mark]",
    ].join(",\n"),
    extractSelector: [
      ".b3-typography mark",
      ".b3-typography span[data-type~=mark]",
      ".protyle-wysiwyg mark",
      ".protyle-wysiwyg span[data-type~=mark]",
    ].join(",\n"),
    label: "高亮文本",
    shortLabel: "HL",
    hint: "用于显式标记重点内容",
  },
  {
    value: "codeBlock",
    cssSelector: [
      ".b3-typography pre",
      ".protyle-wysiwyg pre",
      '.protyle-wysiwyg [data-type="NodeCodeBlock"]',
    ].join(",\n"),
    extractSelector: [
      ".b3-typography pre",
      ".protyle-wysiwyg pre",
      '.protyle-wysiwyg [data-type="NodeCodeBlock"]',
    ].join(",\n"),
    label: "代码块",
    shortLabel: "{ }",
    hint: "用于多行代码与配置片段",
  },
  {
    value: "bulletList",
    ...createListSelectors("u", "ul"),
    label: "无序列表",
    shortLabel: "•",
    hint: "用于普通项目列表",
  },
  {
    value: "orderedList",
    ...createListSelectors("o", "ol"),
    label: "有序列表",
    shortLabel: "1.",
    hint: "用于步骤与顺序描述",
  },
  {
    value: "taskList",
    ...createListSelectors("t", ".protyle-task"),
    label: "任务列表",
    shortLabel: "☑",
    hint: "用于待办与完成状态列表",
  },
];

const STYLE_TARGET_META_MAP = STYLE_TARGET_CATALOG.reduce((metaMap, item) => {
  metaMap[item.value] = item;
  return metaMap;
}, {} as Record<StyleTarget, StyleTargetMeta>);

export const STYLE_TARGETS: StyleTarget[] = STYLE_TARGET_CATALOG.map(item => item.value);

export const STYLE_TARGET_OPTIONS = STYLE_TARGET_CATALOG.map(({
  value,
  label,
  shortLabel,
  hint,
}) => ({
  hint,
  label,
  shortLabel,
  value,
}));

export function getStyleTargetMeta(target: StyleTarget): StyleTargetMeta {
  return STYLE_TARGET_META_MAP[target];
}

export function getStyleTargetSelector(target: StyleTarget): string {
  return getStyleTargetMeta(target).cssSelector;
}

export function getStyleTargetExtractSelector(target: StyleTarget): string {
  return getStyleTargetMeta(target).extractSelector;
}
