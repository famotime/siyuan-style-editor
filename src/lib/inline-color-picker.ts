import { normalizeHexColor } from "@/lib/custom-color"

export interface InlineColorHsv {
  h: number
  s: number
  v: number
}

interface RgbColor {
  b: number
  g: number
  r: number
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function normalizeHue(value: number): number {
  const normalized = value % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function hexToRgbColor(value: string): RgbColor {
  const normalized = normalizeHexColor(value) || "#000000"
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

function rgbChannelToHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0")
}

export function hexToHsvColor(value: string): InlineColorHsv {
  const {
    b,
    g,
    r,
  } = hexToRgbColor(value)
  const normalizedRed = r / 255
  const normalizedGreen = g / 255
  const normalizedBlue = b / 255
  const maxChannel = Math.max(normalizedRed, normalizedGreen, normalizedBlue)
  const minChannel = Math.min(normalizedRed, normalizedGreen, normalizedBlue)
  const delta = maxChannel - minChannel

  let hue = 0
  if (delta !== 0) {
    if (maxChannel === normalizedRed) {
      hue = 60 * (((normalizedGreen - normalizedBlue) / delta) % 6)
    }
    else if (maxChannel === normalizedGreen) {
      hue = 60 * (((normalizedBlue - normalizedRed) / delta) + 2)
    }
    else {
      hue = 60 * (((normalizedRed - normalizedGreen) / delta) + 4)
    }
  }

  return {
    h: normalizeHue(hue),
    s: maxChannel === 0 ? 0 : delta / maxChannel,
    v: maxChannel,
  }
}

export function hsvToHexColor(color: InlineColorHsv): string {
  const hue = normalizeHue(color.h)
  const saturation = clamp01(color.s)
  const value = clamp01(color.v)
  const chroma = value * saturation
  const hueSlice = hue / 60
  const secondary = chroma * (1 - Math.abs((hueSlice % 2) - 1))
  const match = value - chroma

  let red = 0
  let green = 0
  let blue = 0

  if (hueSlice >= 0 && hueSlice < 1) {
    red = chroma
    green = secondary
  }
  else if (hueSlice < 2) {
    red = secondary
    green = chroma
  }
  else if (hueSlice < 3) {
    green = chroma
    blue = secondary
  }
  else if (hueSlice < 4) {
    green = secondary
    blue = chroma
  }
  else if (hueSlice < 5) {
    red = secondary
    blue = chroma
  }
  else {
    red = chroma
    blue = secondary
  }

  const rgbColor = {
    r: (red + match) * 255,
    g: (green + match) * 255,
    b: (blue + match) * 255,
  }

  return `#${rgbChannelToHex(rgbColor.r)}${rgbChannelToHex(rgbColor.g)}${rgbChannelToHex(rgbColor.b)}`
}

export function buildInlineColorFieldBackground(hue: number): string {
  const normalizedHue = Math.round(normalizeHue(hue))
  return `linear-gradient(180deg, transparent 0%, #000 100%), linear-gradient(90deg, #fff 0%, hsl(${normalizedHue} 100% 50%) 100%)`
}
