import type { PaintChannel } from "@/style-editor-runtime";

const HEX_COLOR_PATTERN = /^#?([\da-f]{3}|[\da-f]{6})$/i;

export function normalizeHexColor(value: string): string {
  const trimmedValue = value.trim();
  const matchedValue = trimmedValue.match(HEX_COLOR_PATTERN);
  if (!matchedValue) {
    return "";
  }

  const [, hex] = matchedValue;
  if (hex.length === 3) {
    return `#${hex.split("").map(char => `${char}${char}`).join("").toLowerCase()}`;
  }

  return `#${hex.toLowerCase()}`;
}

export function createDefaultCustomColor(channel: PaintChannel): string {
  return channel === "backgroundColor" ? "#f6d365" : "#5b8def";
}

export function resolveColorPickerValue(value: string, channel: PaintChannel): string {
  return normalizeHexColor(value) || createDefaultCustomColor(channel);
}
