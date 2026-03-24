export type StyleTarget =
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "strong";

export interface StyleRule {
  color: string;
  backgroundColor: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
}

export type StyleProfile = Record<StyleTarget, StyleRule>;

type PartialStyleProfile = Partial<Record<StyleTarget, Partial<StyleRule>>>;

interface TargetMeta {
  selector: string;
  sampleText: string;
  cssSelector: string;
}

const STYLE_TARGETS: StyleTarget[] = [
  "heading1",
  "heading2",
  "heading3",
  "heading4",
  "heading5",
  "heading6",
  "strong",
];

const EMPTY_RULE = Object.freeze<StyleRule>({
  color: "",
  backgroundColor: "",
  fontWeight: "",
  fontStyle: "",
  textDecoration: "",
});

const TARGET_META: Record<StyleTarget, TargetMeta> = {
  heading1: {
    selector: '[data-type="NodeHeading"].h1',
    sampleText: "H1 标题",
    cssSelector: '[data-type="NodeHeading"].h1',
  },
  heading2: {
    selector: '[data-type="NodeHeading"].h2',
    sampleText: "H2 标题",
    cssSelector: '[data-type="NodeHeading"].h2',
  },
  heading3: {
    selector: '[data-type="NodeHeading"].h3',
    sampleText: "H3 标题",
    cssSelector: '[data-type="NodeHeading"].h3',
  },
  heading4: {
    selector: '[data-type="NodeHeading"].h4',
    sampleText: "H4 标题",
    cssSelector: '[data-type="NodeHeading"].h4',
  },
  heading5: {
    selector: '[data-type="NodeHeading"].h5',
    sampleText: "H5 标题",
    cssSelector: '[data-type="NodeHeading"].h5',
  },
  heading6: {
    selector: '[data-type="NodeHeading"].h6',
    sampleText: "H6 标题",
    cssSelector: '[data-type="NodeHeading"].h6',
  },
  strong: {
    selector: 'strong, span[data-type~="strong"]',
    sampleText: "加粗文本",
    cssSelector: [
      ".b3-typography strong",
      ".b3-typography span[data-type~=strong]",
      ".protyle-wysiwyg strong",
      ".protyle-wysiwyg span[data-type~=strong]",
    ].join(",\n"),
  },
};

function createEmptyRule(): StyleRule {
  return { ...EMPTY_RULE };
}

function findSampleElement(root: ParentNode, target: StyleTarget): HTMLElement | null {
  const { selector, sampleText } = TARGET_META[target];
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(selector));
  return (
    candidates.find(candidate => candidate.textContent?.trim() === sampleText)
    ?? candidates.find(candidate => candidate.textContent?.includes(sampleText))
    ?? candidates[0]
    ?? null
  );
}

function normalizeTextDecoration(value: string): string {
  return value === "none" ? "" : value;
}

function normalizeBackgroundColor(value: string): string {
  if (value === "transparent" || value === "rgba(0, 0, 0, 0)") {
    return "";
  }
  return value;
}

function normalizeFontWeight(value: string): string {
  if (value === "normal" || value === "400") {
    return "";
  }
  return value;
}

function normalizePropValue(prop: keyof StyleRule, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (prop === "backgroundColor") {
    return normalizeBackgroundColor(trimmed);
  }
  if (prop === "fontWeight") {
    return normalizeFontWeight(trimmed);
  }
  if (prop === "textDecoration") {
    return normalizeTextDecoration(trimmed);
  }
  return trimmed;
}

function extractRuleFromElement(element: HTMLElement): StyleRule {
  const computedStyle = window.getComputedStyle(element);
  return {
    color: normalizePropValue("color", computedStyle.color),
    backgroundColor: normalizePropValue("backgroundColor", computedStyle.backgroundColor),
    fontWeight: normalizePropValue("fontWeight", computedStyle.fontWeight),
    fontStyle: normalizePropValue("fontStyle", computedStyle.fontStyle),
    textDecoration: normalizePropValue("textDecoration", computedStyle.textDecorationLine),
  };
}

function toCssDeclarations(rule: Partial<StyleRule>): string[] {
  const declarations: string[] = [];
  if (rule.color) {
    declarations.push(`color: ${rule.color} !important;`);
  }
  if (rule.backgroundColor) {
    declarations.push(`background-color: ${rule.backgroundColor} !important;`);
  }
  if (rule.fontWeight) {
    declarations.push(`font-weight: ${rule.fontWeight} !important;`);
  }
  if (rule.fontStyle) {
    declarations.push(`font-style: ${rule.fontStyle} !important;`);
  }
  if (rule.textDecoration) {
    declarations.push(`text-decoration: ${rule.textDecoration} !important;`);
  }
  return declarations;
}

export function createDefaultStyleProfile(): StyleProfile {
  return STYLE_TARGETS.reduce((profile, target) => {
    profile[target] = createEmptyRule();
    return profile;
  }, {} as StyleProfile);
}

export function normalizeStyleProfile(input?: PartialStyleProfile | null): StyleProfile {
  const profile = createDefaultStyleProfile();
  if (!input) {
    return profile;
  }

  for (const target of STYLE_TARGETS) {
    profile[target] = {
      ...createEmptyRule(),
      ...(input[target] ?? {}),
    };
  }
  return profile;
}

export function buildStyleCss(input?: PartialStyleProfile | null): string {
  const profile = normalizeStyleProfile(input);

  return STYLE_TARGETS.flatMap((target) => {
    const declarations = toCssDeclarations(profile[target]);
    if (declarations.length === 0) {
      return [];
    }
    return `${TARGET_META[target].cssSelector} {\n  ${declarations.join("\n  ")}\n}`;
  }).join("\n\n");
}

export function extractStyleProfileFromTemplate(root: ParentNode): StyleProfile {
  const profile = createDefaultStyleProfile();

  for (const target of STYLE_TARGETS) {
    const element = findSampleElement(root, target);
    if (!element) {
      continue;
    }
    profile[target] = extractRuleFromElement(element);
  }

  return profile;
}
