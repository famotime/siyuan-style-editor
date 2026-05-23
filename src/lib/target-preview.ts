import type {
  StyleRule,
  StyleTarget,
} from "@/lib/style-profile"

export function buildTargetPreviewStyle(
  target: StyleTarget,
  rule: StyleRule,
  fallbackTextColor: string,
) {
  return {
    backgroundColor: rule.backgroundColor || undefined,
    color: rule.color || fallbackTextColor,
    fontStyle: rule.fontStyle || undefined,
    fontWeight: rule.fontWeight || (target === "strong" ? "700" : undefined),
    textDecoration: rule.textDecoration || undefined,
  }
}

export function buildChannelSwatchStyle(value: string, fallbackColor: string) {
  return {
    background: value || fallbackColor,
    isEmpty: !value,
  }
}
