export interface PresetPaletteColor {
  label: string
  value: string
}

export interface PresetPaletteCollection {
  colors: PresetPaletteColor[]
  id: string
  label: string
}

export function normalizePresetPaletteCollections(input: unknown): PresetPaletteCollection[] {
  if (!Array.isArray(input)) {
    return []
  }

  return input.flatMap((palette) => {
    if (
      !palette
      || typeof palette !== "object"
      || typeof (palette as { id?: unknown }).id !== "string"
      || typeof (palette as { label?: unknown }).label !== "string"
      || !Array.isArray((palette as { colors?: unknown[] }).colors)
    ) {
      return []
    }

    const colors = (palette as { colors: unknown[] }).colors.flatMap((color) => {
      if (
        !color
        || typeof color !== "object"
        || typeof (color as { label?: unknown }).label !== "string"
        || typeof (color as { value?: unknown }).value !== "string"
      ) {
        return []
      }

      return [{
        label: (color as { label: string }).label,
        value: (color as { value: string }).value,
      }]
    })

    if (colors.length === 0) {
      return []
    }

    return [{
      colors,
      id: (palette as { id: string }).id,
      label: (palette as { label: string }).label,
    }]
  })
}

export function createPresetPaletteColors(colors: string[]): PresetPaletteColor[] {
  const uniqueColors = [...new Set(colors.filter(Boolean))]
  return uniqueColors.map((color) => ({
    label: color,
    value: color,
  }))
}

export function buildPresetPaletteCardBackground(colors: PresetPaletteColor[]): string {
  if (colors.length === 0) {
    return "linear-gradient(135deg, transparent 0%, transparent 100%)"
  }

  if (colors.length === 1) {
    return `linear-gradient(135deg, ${colors[0].value} 0%, ${colors[0].value} 100%)`
  }

  const lastIndex = colors.length - 1
  const stops = colors.map((color, index) => {
    if (index === 0) {
      return `${color.value} 0%`
    }

    if (index === lastIndex) {
      return `${color.value} 100%`
    }

    const baseStop = (index / lastIndex) * 100
    const softenedStop = Math.round(baseStop - (lastIndex - index))
    return `${color.value} ${softenedStop}%`
  })

  return `linear-gradient(135deg, ${stops.join(", ")})`
}

export const PRESET_PALETTE_COLLECTIONS: PresetPaletteCollection[] = [
  {
    id: "fiery-ocean",
    label: "Fiery Ocean",
    colors: createPresetPaletteColors(["#780000", "#C1121F", "#FDF0D5", "#003049", "#669BBC"]),
  },
  {
    id: "olive-garden-feast",
    label: "Olive Garden Feast",
    colors: createPresetPaletteColors(["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"]),
  },
  {
    id: "sunny-beach-day",
    label: "Sunny Beach Day",
    colors: createPresetPaletteColors(["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"]),
  },
  {
    id: "dark-sunset",
    label: "Dark Sunset",
    colors: createPresetPaletteColors(["#335C67", "#FFF3B0", "#E09F3E", "#9E2A2B", "#540B0E"]),
  },
  {
    id: "summer-dream",
    label: "Summer Dream",
    colors: createPresetPaletteColors(["#0081A7", "#00AFB9", "#FDFCDC", "#FED9B7", "#F07167"]),
  },
  {
    id: "vibrant-color-fiesta",
    label: "Vibrant Color Fiesta",
    colors: createPresetPaletteColors(["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"]),
  },
  {
    id: "summer-ocean-breeze",
    label: "Summer Ocean Breeze",
    colors: createPresetPaletteColors(["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"]),
  },
  {
    id: "refreshing-summer-fun",
    label: "Refreshing Summer Fun",
    colors: createPresetPaletteColors(["#8ECAE6", "#219EBC", "#023047", "#FFB703", "#FB8500"]),
  },
  {
    id: "fiery-palette",
    label: "Fiery Palette",
    colors: createPresetPaletteColors(["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C"]),
  },
  {
    id: "watermelon-sorbet",
    label: "Watermelon Sorbet",
    colors: createPresetPaletteColors(["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"]),
  },
]
