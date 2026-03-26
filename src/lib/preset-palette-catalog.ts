export interface PresetPaletteColor {
  label: string;
  value: string;
}

export interface PresetPaletteCollection {
  colors: PresetPaletteColor[];
  id: string;
  label: string;
}

function createPresetColors(colors: string[]): PresetPaletteColor[] {
  return colors.map(color => ({
    label: color,
    value: color,
  }));
}

export const PRESET_PALETTE_COLLECTIONS: PresetPaletteCollection[] = [
  {
    id: "fiery-ocean",
    label: "Fiery Ocean",
    colors: createPresetColors(["#780000", "#C1121F", "#FDF0D5", "#003049", "#669BBC"]),
  },
  {
    id: "olive-garden-feast",
    label: "Olive Garden Feast",
    colors: createPresetColors(["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"]),
  },
  {
    id: "sunny-beach-day",
    label: "Sunny Beach Day",
    colors: createPresetColors(["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"]),
  },
  {
    id: "dark-sunset",
    label: "Dark Sunset",
    colors: createPresetColors(["#335C67", "#FFF3B0", "#E09F3E", "#9E2A2B", "#540B0E"]),
  },
  {
    id: "summer-dream",
    label: "Summer Dream",
    colors: createPresetColors(["#0081A7", "#00AFB9", "#FDFCDC", "#FED9B7", "#F07167"]),
  },
  {
    id: "vibrant-color-fiesta",
    label: "Vibrant Color Fiesta",
    colors: createPresetColors(["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"]),
  },
  {
    id: "summer-ocean-breeze",
    label: "Summer Ocean Breeze",
    colors: createPresetColors(["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"]),
  },
  {
    id: "refreshing-summer-fun",
    label: "Refreshing Summer Fun",
    colors: createPresetColors(["#8ECAE6", "#219EBC", "#023047", "#FFB703", "#FB8500"]),
  },
  {
    id: "fiery-palette",
    label: "Fiery Palette",
    colors: createPresetColors(["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C"]),
  },
  {
    id: "watermelon-sorbet",
    label: "Watermelon Sorbet",
    colors: createPresetColors(["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"]),
  },
];
