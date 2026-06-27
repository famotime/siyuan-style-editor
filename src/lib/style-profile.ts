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
  heading1: { color: "#2b3a4a", backgroundColor: "rgba(111, 142, 207, 0.15)" },
  heading2: { color: "#8c6239", backgroundColor: "rgba(222, 184, 135, 0.1)" },
  heading3: { color: "#2f5233", backgroundColor: "rgba(167, 184, 168, 0.12)" },
  heading4: { color: "#6a3d6a", backgroundColor: "" },
  heading5: { color: "#8c3a3a", backgroundColor: "" },
  heading6: { color: "#4a5d6c", backgroundColor: "" },
  strong: { color: "#b27a53", backgroundColor: "rgba(222, 184, 135, 0.12)" },
  blockquote: { color: "#2b3a4a", backgroundColor: "rgba(111, 142, 207, 0.06)" },
  inlineCode: { color: "#d19a66", backgroundColor: "rgba(209, 154, 102, 0.09)" },
  mark: { color: "#2d3748", backgroundColor: "rgba(240, 218, 168, 0.65)" },
  codeBlock: { color: "#a6b2c9", backgroundColor: "#202430" },
  bulletList: { color: "#4a5f7c", backgroundColor: "" },
  orderedList: { color: "#4a5f7c", backgroundColor: "" },
  taskList: { color: "#4a5f7c", backgroundColor: "" },
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
