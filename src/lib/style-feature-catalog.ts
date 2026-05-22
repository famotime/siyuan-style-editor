export type FeatureStyleId =
  | "blockquoteFrame"
  | "imageRadius"
  | "linkStyle"
  | "paragraphHover"
  | "strikethroughStyle"
  | "tableStyle"
  | "taskListStyle"
  | "underlineStyle";

type FeatureValueType = "color" | "number" | "select";

export interface FeatureStyleControlOption {
  label: string;
  value: string;
}

export interface FeatureStyleControl {
  key: string;
  label: string;
  max?: number;
  min?: number;
  options?: FeatureStyleControlOption[];
  step?: number;
  type: FeatureValueType;
  unit?: string;
}

export interface FeatureStyleOption {
  controls: FeatureStyleControl[];
  hint: string;
  label: string;
  preview: string;
  risk: "正文安全" | "编辑器 UI";
  value: FeatureStyleId;
}

export interface FeatureStyleConfig {
  enabled: boolean;
  values: Record<string, string | number | boolean>;
}

export type FeatureStyleProfile = Record<FeatureStyleId, FeatureStyleConfig>;

interface FeatureDefinition extends FeatureStyleOption {
  buildCss: (config: FeatureStyleConfig) => string;
  defaults: FeatureStyleConfig;
}

const LINE_STYLE_OPTIONS: FeatureStyleControlOption[] = [
  {
    label: "实线",
    value: "solid",
  },
  {
    label: "虚线",
    value: "dashed",
  },
  {
    label: "波浪",
    value: "wavy",
  },
  {
    label: "无",
    value: "none",
  },
];

const LINK_LINE_STYLE_OPTIONS = LINE_STYLE_OPTIONS.filter(option => option.value !== "wavy");

function px(value: unknown, fallback: number): string {
  return `${typeof value === "number" ? value : fallback}px`;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function lineStyleValue(value: unknown, fallback: string): string {
  const normalized = stringValue(value, fallback);
  return LINE_STYLE_OPTIONS.some(option => option.value === normalized) ? normalized : fallback;
}

function optionValue(
  value: unknown,
  fallback: string,
  options: FeatureStyleControlOption[],
): string {
  const normalized = stringValue(value, fallback);
  return options.some(option => option.value === normalized) ? normalized : fallback;
}

function createDefaultConfig(values: Record<string, string | number | boolean>): FeatureStyleConfig {
  return {
    enabled: false,
    values,
  };
}

const FEATURE_DEFINITIONS: FeatureDefinition[] = [
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
.protyle-wysiwyg .bq {
  background-color: transparent !important;
  border-radius: ${px(config.values.radius, 5)};
  padding: 8px 12px 8px 20px;
  color: inherit;
  position: relative;
}

.protyle-wysiwyg .bq::before {
  content: "";
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 6px;
  width: 4px;
  background-color: ${stringValue(config.values.lineColor, "rgb(180, 180, 180)")};
  border-radius: 2px;
}

.protyle-wysiwyg .bq:not(.bq .bq) {
  box-shadow: 0 0 0 2px ${stringValue(config.values.borderColor, "rgb(235, 235, 235)")} inset !important;
}

.protyle-wysiwyg .bq .bq {
  box-shadow: none !important;
}`.trim(),
    controls: [
      {
        key: "borderColor",
        label: "边框色",
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
    ],
    defaults: createDefaultConfig({
      borderColor: "rgb(235, 235, 235)",
      lineColor: "rgb(180, 180, 180)",
      radius: 5,
    }),
    hint: "为引述块保留竖线并增加外框层次。",
    label: "引述块边框竖线",
    preview: "引述",
    risk: "正文安全",
    value: "blockquoteFrame",
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
];

const FEATURE_DEFINITION_MAP = FEATURE_DEFINITIONS.reduce((map, definition) => {
  map[definition.value] = definition;
  return map;
}, {} as Record<FeatureStyleId, FeatureDefinition>);

export const FEATURE_STYLE_IDS = FEATURE_DEFINITIONS.map(definition => definition.value);

export const FEATURE_STYLE_OPTIONS: FeatureStyleOption[] = FEATURE_DEFINITIONS.map(({
  buildCss,
  defaults,
  ...option
}) => option);

function cloneConfig(config: FeatureStyleConfig): FeatureStyleConfig {
  return {
    enabled: config.enabled,
    values: {
      ...config.values,
    },
  };
}

function normalizeControlValue(
  control: FeatureStyleControl,
  inputValue: unknown,
  fallbackValue: string | number | boolean,
): string | number | boolean {
  if (control.type === "number") {
    if (typeof inputValue !== "number" || !Number.isFinite(inputValue)) {
      return fallbackValue;
    }

    const min = control.min ?? Number.NEGATIVE_INFINITY;
    const max = control.max ?? Number.POSITIVE_INFINITY;
    return Math.min(max, Math.max(min, inputValue));
  }

  if (control.type === "select") {
    if (typeof inputValue !== "string") {
      return fallbackValue;
    }

    return control.options?.some(option => option.value === inputValue) ? inputValue : fallbackValue;
  }

  return typeof inputValue === "string" ? inputValue : fallbackValue;
}

export function createDefaultFeatureProfile(): FeatureStyleProfile {
  return FEATURE_DEFINITIONS.reduce((profile, definition) => {
    profile[definition.value] = cloneConfig(definition.defaults);
    return profile;
  }, {} as FeatureStyleProfile);
}

export function normalizeFeatureProfile(input?: Partial<FeatureStyleProfile> | null): FeatureStyleProfile {
  const profile = createDefaultFeatureProfile();
  if (!input || typeof input !== "object") {
    return profile;
  }

  for (const definition of FEATURE_DEFINITIONS) {
    const rawConfig = input[definition.value];
    if (!rawConfig || typeof rawConfig !== "object") {
      continue;
    }

    const rawValues = rawConfig.values && typeof rawConfig.values === "object" ? rawConfig.values : {};
    const values = {
      ...definition.defaults.values,
    };

    for (const control of definition.controls) {
      values[control.key] = normalizeControlValue(
        control,
        (rawValues as Record<string, unknown>)[control.key],
        definition.defaults.values[control.key],
      );
    }

    profile[definition.value] = {
      enabled: rawConfig.enabled === true,
      values,
    };
  }

  return profile;
}

export function getFeatureStyleOption(featureId: FeatureStyleId): FeatureStyleOption {
  const {
    buildCss,
    defaults,
    ...option
  } = FEATURE_DEFINITION_MAP[featureId];
  return option;
}

export function buildFeatureStyleCss(input?: Partial<FeatureStyleProfile> | null): string {
  const profile = normalizeFeatureProfile(input);

  return FEATURE_DEFINITIONS.flatMap((definition) => {
    const config = profile[definition.value];
    if (!config.enabled) {
      return [];
    }

    return definition.buildCss(config);
  }).join("\n\n");
}
