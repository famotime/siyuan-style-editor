export type FeatureStyleId =
  | "backlinkSticky"
  | "blockquoteFrame"
  | "blockGutterAnim"
  | "blockRefStyle"
  | "docTag"
  | "docTreeColorBlocks"
  | "documentTitle"
  | "emojiPanel"
  | "headingDecoration"
  | "headingNumbering"
  | "headImage"
  | "hrStyle"
  | "imageRadius"
  | "inlineCodeStyle"
  | "linkStyle"
  | "listBulletLine"
  | "editorBackground"
  | "markStyle"
  | "orderedListStyle"
  | "outlineNumber"
  | "paragraphHover"
  | "foldedBlockStyle"
  | "headingSpacing"
  | "searchPanel"
  | "slashMenu"
  | "toolbarStyle"
  | "unorderedListMarkerColor"
  | "referencedBlockCorners"
  | "refcountBadge"
  | "refSearchMenu"
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
  risk: "正文安全" | "全屋改造";
  value: FeatureStyleId;
}

export interface FeatureStyleConfig {
  enabled: boolean;
  values: Record<string, string | number | boolean>;
}

export type FeatureStyleProfile = Record<FeatureStyleId, FeatureStyleConfig>;

export interface FeatureDefinition extends FeatureStyleOption {
  buildCss: (config: FeatureStyleConfig) => string;
  defaults: FeatureStyleConfig;
}

export const LINE_STYLE_OPTIONS: FeatureStyleControlOption[] = [
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

export const LINK_LINE_STYLE_OPTIONS = LINE_STYLE_OPTIONS.filter(option => option.value !== "wavy");

export function px(value: unknown, fallback: number): string {
  return `${typeof value === "number" ? value : fallback}px`;
}

export function em(value: unknown, fallback: number): string {
  return `${typeof value === "number" ? value : fallback}em`;
}

export function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function lineStyleValue(value: unknown, fallback: string): string {
  const normalized = stringValue(value, fallback);
  return LINE_STYLE_OPTIONS.some(option => option.value === normalized) ? normalized : fallback;
}

export function optionValue(
  value: unknown,
  fallback: string,
  options: FeatureStyleControlOption[],
): string {
  const normalized = stringValue(value, fallback);
  return options.some(option => option.value === normalized) ? normalized : fallback;
}

export function createDefaultConfig(values: Record<string, string | number | boolean>): FeatureStyleConfig {
  return {
    enabled: false,
    values,
  };
}
