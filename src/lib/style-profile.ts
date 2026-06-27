import type { StyleTarget } from "@/lib/style-target-catalog"
import {
  getStyleTargetSelector,
  STYLE_TARGETS,
} from "@/lib/style-target-catalog"

export {
  getStyleTargetSelector,
  STYLE_TARGETS,
  type StyleTarget,
} from "@/lib/style-target-catalog"

export interface StyleRule {
  enabled: boolean
  color: string
  backgroundColor: string
  fontWeight: string
  fontStyle: string
  textDecoration: string
}

export type StyleProfile = Record<StyleTarget, StyleRule>

type PartialStyleProfile = Partial<Record<StyleTarget, Partial<StyleRule>>>

const DEFAULT_TARGET_COLORS: Record<string, { color: string; backgroundColor: string }> = {
  heading1: { color: "var(--style-editor-heading1-color)", backgroundColor: "var(--style-editor-heading-bg)" },
  heading2: { color: "var(--style-editor-heading2-color)", backgroundColor: "var(--style-editor-heading-bg)" },
  heading3: { color: "var(--style-editor-heading3-color)", backgroundColor: "var(--style-editor-heading-bg)" },
  heading4: { color: "var(--style-editor-heading4-color)", backgroundColor: "" },
  heading5: { color: "var(--style-editor-heading5-color)", backgroundColor: "" },
  heading6: { color: "var(--style-editor-heading6-color)", backgroundColor: "" },
  strong: { color: "var(--style-editor-strong-color)", backgroundColor: "var(--style-editor-strong-bg)" },
  blockquote: { color: "var(--style-editor-blockquote-color)", backgroundColor: "var(--style-editor-blockquote-bg)" },
  inlineCode: { color: "var(--style-editor-inline-code-color)", backgroundColor: "var(--style-editor-inline-code-bg)" },
  mark: { color: "var(--style-editor-mark-color)", backgroundColor: "var(--style-editor-mark-bg)" },
  codeBlock: { color: "var(--style-editor-code-block-color)", backgroundColor: "var(--style-editor-code-block-bg)" },
  bulletList: { color: "var(--style-editor-list-color)", backgroundColor: "" },
  orderedList: { color: "var(--style-editor-list-color)", backgroundColor: "" },
  taskList: { color: "var(--style-editor-list-color)", backgroundColor: "" },
}

export function createDefaultRuleForTarget(target: StyleTarget): StyleRule {
  const defaults = DEFAULT_TARGET_COLORS[target] ?? { color: "", backgroundColor: "" }
  return {
    enabled: false,
    color: defaults.color,
    backgroundColor: defaults.backgroundColor,
    fontWeight: "",
    fontStyle: "",
    textDecoration: "",
  }
}

function toCssDeclarations(rule: Partial<StyleRule>): string[] {
  if (rule.enabled === false) {
    return []
  }
  const declarations: string[] = []
  if (rule.color) {
    declarations.push(`color: ${rule.color} !important;`)
  }
  if (rule.backgroundColor) {
    declarations.push(`background-color: ${rule.backgroundColor} !important;`)
  }
  if (rule.fontWeight) {
    declarations.push(`font-weight: ${rule.fontWeight} !important;`)
  }
  if (rule.fontStyle) {
    declarations.push(`font-style: ${rule.fontStyle} !important;`)
  }
  if (rule.textDecoration) {
    declarations.push(`text-decoration: ${rule.textDecoration} !important;`)
  }
  return declarations
}

export function createDefaultStyleProfile(): StyleProfile {
  return STYLE_TARGETS.reduce((profile, target) => {
    profile[target] = createDefaultRuleForTarget(target)
    return profile
  }, {} as StyleProfile)
}

export function normalizeStyleProfile(input?: PartialStyleProfile | null): StyleProfile {
  const profile = createDefaultStyleProfile()
  if (!input) {
    return profile
  }

  for (const target of STYLE_TARGETS) {
    const inputRule = input[target] ?? {}
    const hasCustomStyles = Boolean(
      inputRule.color ||
      inputRule.backgroundColor ||
      inputRule.fontWeight ||
      inputRule.fontStyle ||
      inputRule.textDecoration
    )
    const enabled = typeof inputRule.enabled === "boolean"
      ? inputRule.enabled
      : hasCustomStyles

    profile[target] = {
      ...createDefaultRuleForTarget(target),
      ...inputRule,
      enabled,
    }
  }
  return profile
}

export function buildStyleCss(input?: PartialStyleProfile | null): string {
  const profile = normalizeStyleProfile(input)

  return STYLE_TARGETS.flatMap((target) => {
    const declarations = toCssDeclarations(profile[target])
    if (declarations.length === 0) {
      return []
    }
    return `${getStyleTargetSelector(target)} {\n  ${declarations.join("\n  ")}\n}`
  }).join("\n\n")
}
