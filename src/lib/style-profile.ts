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
  cssSelector: string;
}

export const STYLE_TARGETS: StyleTarget[] = [
  "heading1",
  "heading2",
  "heading3",
  "heading4",
  "heading5",
  "heading6",
  "strong",
  "blockquote",
  "inlineCode",
  "mark",
  "codeBlock",
  "bulletList",
  "orderedList",
  "taskList",
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
    cssSelector: '[data-type="NodeHeading"].h1',
  },
  heading2: {
    cssSelector: '[data-type="NodeHeading"].h2',
  },
  heading3: {
    cssSelector: '[data-type="NodeHeading"].h3',
  },
  heading4: {
    cssSelector: '[data-type="NodeHeading"].h4',
  },
  heading5: {
    cssSelector: '[data-type="NodeHeading"].h5',
  },
  heading6: {
    cssSelector: '[data-type="NodeHeading"].h6',
  },
  strong: {
    cssSelector: [
      ".b3-typography strong",
      ".b3-typography span[data-type~=strong]",
      ".protyle-wysiwyg strong",
      ".protyle-wysiwyg span[data-type~=strong]",
    ].join(",\n"),
  },
  blockquote: {
    cssSelector: [
      ".b3-typography blockquote",
      ".b3-typography .bq",
      ".protyle-wysiwyg blockquote",
      ".protyle-wysiwyg .bq",
    ].join(",\n"),
  },
  inlineCode: {
    cssSelector: [
      ".b3-typography code",
      ".b3-typography span[data-type~=code]",
      ".protyle-wysiwyg code",
      ".protyle-wysiwyg span[data-type~=code]",
    ].join(",\n"),
  },
  mark: {
    cssSelector: [
      ".b3-typography mark",
      ".b3-typography span[data-type~=mark]",
      ".protyle-wysiwyg mark",
      ".protyle-wysiwyg span[data-type~=mark]",
    ].join(",\n"),
  },
  codeBlock: {
    cssSelector: [
      ".b3-typography pre",
      ".protyle-wysiwyg pre",
      '.protyle-wysiwyg [data-type="NodeCodeBlock"]',
    ].join(",\n"),
  },
  bulletList: {
    cssSelector: [
      ".b3-typography ul",
      ".protyle-wysiwyg ul",
    ].join(",\n"),
  },
  orderedList: {
    cssSelector: [
      ".b3-typography ol",
      ".protyle-wysiwyg ol",
    ].join(",\n"),
  },
  taskList: {
    cssSelector: [
      ".b3-typography .protyle-task",
      ".protyle-wysiwyg .protyle-task",
    ].join(",\n"),
  },
};

export function getStyleTargetSelector(target: StyleTarget): string {
  return TARGET_META[target].cssSelector;
}

function createEmptyRule(): StyleRule {
  return { ...EMPTY_RULE };
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
