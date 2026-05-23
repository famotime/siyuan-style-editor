import type { StyleProfile } from "@/lib/style-profile"
import {
  createDefaultStyleProfile,
  STYLE_TARGETS,

} from "@/lib/style-profile"
import { getStyleTargetExtractSelector } from "@/lib/style-target-catalog"

const TRANSPARENT_VALUES = new Set(["rgba(0, 0, 0, 0)", "transparent"])

export interface ExtractedStyleProfileResult {
  extractedTargetCount: number
  matchedTargetCount: number
  profile: StyleProfile
}

function normalizeComputedValue(value: string): string {
  return value.trim().replace(/\s+/g, " ")
}

function extractForegroundColor(element: Element, currentColor: string, view: Window): string {
  const normalizedColor = normalizeComputedValue(currentColor)
  const parentElement = element.parentElement
  if (!parentElement) {
    return normalizedColor
  }

  const parentColor = normalizeComputedValue(view.getComputedStyle(parentElement).color)
  return normalizedColor === parentColor ? "" : normalizedColor
}

function extractBackgroundColor(backgroundColor: string): string {
  const normalizedColor = normalizeComputedValue(backgroundColor)
  return TRANSPARENT_VALUES.has(normalizedColor) ? "" : normalizedColor
}

export function extractStyleProfileFromDocument(documentRef: Document): ExtractedStyleProfileResult {
  const profile = createDefaultStyleProfile()
  const view = documentRef.defaultView
  if (!view) {
    return {
      extractedTargetCount: 0,
      matchedTargetCount: 0,
      profile,
    }
  }

  let matchedTargetCount = 0
  let extractedTargetCount = 0

  for (const target of STYLE_TARGETS) {
    const element = documentRef.querySelector(getStyleTargetExtractSelector(target))
    if (!element) {
      continue
    }

    matchedTargetCount += 1
    const computedStyle = view.getComputedStyle(element)
    const color = extractForegroundColor(element, computedStyle.color, view)
    const backgroundColor = extractBackgroundColor(computedStyle.backgroundColor)

    profile[target] = {
      ...profile[target],
      backgroundColor,
      color,
    }

    if (color || backgroundColor) {
      extractedTargetCount += 1
    }
  }

  return {
    extractedTargetCount,
    matchedTargetCount,
    profile,
  }
}
