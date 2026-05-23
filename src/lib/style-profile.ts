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
  color: string
  backgroundColor: string
  fontWeight: string
  fontStyle: string
  textDecoration: string
}

export type StyleProfile = Record<StyleTarget, StyleRule>

type PartialStyleProfile = Partial<Record<StyleTarget, Partial<StyleRule>>>

const EMPTY_RULE = Object.freeze<StyleRule>({
  color: "",
  backgroundColor: "",
  fontWeight: "",
  fontStyle: "",
  textDecoration: "",
})

function createEmptyRule(): StyleRule {
  return { ...EMPTY_RULE }
}

function toCssDeclarations(rule: Partial<StyleRule>): string[] {
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
    profile[target] = createEmptyRule()
    return profile
  }, {} as StyleProfile)
}

export function normalizeStyleProfile(input?: PartialStyleProfile | null): StyleProfile {
  const profile = createDefaultStyleProfile()
  if (!input) {
    return profile
  }

  for (const target of STYLE_TARGETS) {
    profile[target] = {
      ...createEmptyRule(),
      ...(input[target] ?? {}),
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
