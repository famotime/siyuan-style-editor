import type { PaintChannel } from "@/style-editor-runtime"

const HEX_COLOR_PATTERN = /^#?([\da-f]{3}|[\da-f]{6})$/i
const CSS_VARIABLE_PATTERN = /^var\(\s*(--[^),\s]+)\s*\)$/i
type ColorResolutionScope = HTMLElement | null | undefined

export function normalizeHexColor(value: string): string {
  const trimmedValue = value.trim()
  const matchedValue = trimmedValue.match(HEX_COLOR_PATTERN)
  if (!matchedValue) {
    return ""
  }

  const [, hex] = matchedValue
  if (hex.length === 3) {
    return `#${hex.split("").map((char) => `${char}${char}`).join("").toLowerCase()}`
  }

  return `#${hex.toLowerCase()}`
}

function normalizeRgbColor(value: string): string {
  const trimmedValue = value.trim()
  if (!trimmedValue.toLowerCase().startsWith("rgb")) {
    return ""
  }

  const channels = trimmedValue.match(/[\d.]+/g)
  if (!channels || channels.length < 3) {
    return ""
  }

  const [r, g, b] = channels.slice(0, 3).map((channel) => Math.round(Number(channel)))
  if ([r, g, b].some((channel) => !Number.isInteger(channel) || channel < 0 || channel > 255)) {
    return ""
  }

  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
}

function resolveCssVariableColor(value: string, channel: PaintChannel, scope?: ColorResolutionScope): string {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return ""
  }

  const matchedVariable = value.trim().match(CSS_VARIABLE_PATTERN)
  if (!matchedVariable) {
    return ""
  }

  const [, variableName] = matchedVariable
  const scopeElements = [scope, document.documentElement, document.body].filter(
    (element): element is HTMLElement => Boolean(element),
  )

  for (const element of scopeElements) {
    const resolvedValue = window.getComputedStyle(element).getPropertyValue(variableName).trim()
    if (!resolvedValue) {
      continue
    }

    return resolveDisplayColorCode(resolvedValue, channel, scope)
  }

  return ""
}

function resolveComputedColor(value: string, channel: PaintChannel, scope?: ColorResolutionScope): string {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return ""
  }

  const probe = document.createElement("span")
  probe.style.position = "absolute"
  probe.style.opacity = "0"
  probe.style.pointerEvents = "none"

  if (channel === "backgroundColor") {
    probe.style.backgroundColor = value.trim()
    if (!probe.style.backgroundColor) {
      return ""
    }
  }
  else {
    probe.style.color = value.trim()
    if (!probe.style.color) {
      return ""
    }
  }

  const mountTarget = scope ?? document.body ?? document.documentElement
  mountTarget.append(probe)
  const computedStyle = window.getComputedStyle(probe)
  const resolvedValue = channel === "backgroundColor"
    ? computedStyle.backgroundColor
    : computedStyle.color
  probe.remove()

  return normalizeRgbColor(resolvedValue) || normalizeHexColor(resolvedValue)
}

function resolveDisplayColorCode(value: string, channel: PaintChannel, scope?: ColorResolutionScope): string {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return ""
  }

  return normalizeHexColor(trimmedValue)
    || normalizeRgbColor(trimmedValue)
    || resolveCssVariableColor(trimmedValue, channel, scope)
    || resolveComputedColor(trimmedValue, channel, scope)
}

export function createDefaultCustomColor(channel: PaintChannel): string {
  return channel === "backgroundColor" ? "#f6d365" : "#5b8def"
}

export function resolveColorPickerValue(value: string, channel: PaintChannel, scope?: ColorResolutionScope): string {
  return resolveDisplayColorCode(value, channel, scope) || createDefaultCustomColor(channel)
}
