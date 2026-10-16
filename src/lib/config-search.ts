import type { FeatureStyleOption } from "@/lib/style-feature-catalog"
import type { StyleTargetMeta } from "@/lib/style-target-catalog"

export interface HighlightPart {
  text: string
  isMatch: boolean
}

/**
 * 将文本根据关键词拆分成普通文本和高亮文本片段（不区分大小写）
 */
export function highlightParts(text: string, query: string): HighlightPart[] {
  if (!text) {
    return []
  }

  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return [{ text, isMatch: false }]
  }

  const parts: HighlightPart[] = []
  const lowerText = text.toLowerCase()
  const lowerQuery = trimmedQuery.toLowerCase()
  let startIndex = 0

  while (startIndex < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, startIndex)
    if (matchIndex === -1) {
      parts.push({
        text: text.slice(startIndex),
        isMatch: false,
      })
      break
    }

    if (matchIndex > startIndex) {
      parts.push({
        text: text.slice(startIndex, matchIndex),
        isMatch: false,
      })
    }

    parts.push({
      text: text.slice(matchIndex, matchIndex + trimmedQuery.length),
      isMatch: true,
    })

    startIndex = matchIndex + trimmedQuery.length
  }

  return parts
}

type TranslateFn = (key: string, args?: Record<string, string>) => string

/**
 * 匹配基础粉刷（TargetStudio）配置项
 */
export function matchTargetOption(
  target: StyleTargetMeta,
  query: string,
  t: TranslateFn,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) {
    return true
  }

  const candidates: Array<string | undefined> = [
    target.shortLabel,
    target.value,
    target.label,
    t(target.value),
    target.hint,
    t("colorLabel"),
    t("bgColorLabel"),
    t("textPaint"),
    t("bgPaint"),
  ]

  return candidates.some((cand) => cand && cand.toLowerCase().includes(q))
}

/**
 * 匹配高级定制与全屋改造（FeatureSection）配置项
 */
export function matchFeatureOption(
  feature: FeatureStyleOption,
  query: string,
  t: TranslateFn,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) {
    return true
  }

  const candidates: Array<string | undefined> = [
    feature.value,
    feature.label,
    t(feature.label),
    feature.hint,
    feature.hint ? t(feature.hint) : undefined,
    feature.preview,
    feature.preview ? t(feature.preview) : undefined,
    feature.group,
    feature.group ? t(feature.group) : undefined,
  ]

  if (feature.controls) {
    for (const ctrl of feature.controls) {
      candidates.push(ctrl.label)
      candidates.push(t(ctrl.label))
      if (ctrl.options) {
        for (const opt of ctrl.options) {
          candidates.push(opt.label)
          candidates.push(t(opt.label))
          if (typeof opt.value === "string") {
            candidates.push(opt.value)
          }
        }
      }
    }
  }

  return candidates.some((cand) => cand && cand.toLowerCase().includes(q))
}
