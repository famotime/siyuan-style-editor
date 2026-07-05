import type { StyleTransferSummary } from "@/lib/style-transfer"
import { normalizeHexColor } from "@/lib/custom-color"
import { t } from "@/style-editor-runtime"

export interface ExtractStylesResult {
  extractedTargetCount: number
  matchedTargetCount: number
}

interface ApplyCustomColorSelectionDeps {
  applyPaletteColor: (color: string) => Promise<void>
  closeInlinePalette: () => void
}

interface ClearPaletteSelectionDeps {
  clearSelectedTargetColor: () => Promise<void>
  closeInlinePalette: () => void
}

export const RESET_ALL_STYLES_MESSAGE = t("resetStylesSuccess")

export function resolveExtractStylesMessage(result: ExtractStylesResult): string {
  if (result.matchedTargetCount === 0) {
    return t("noDocFoundErr")
  }

  if (result.extractedTargetCount === 0) {
    return t("noColorExtractedErr", { count: String(result.matchedTargetCount) })
  }

  return t("extractSuccess", { count: String(result.extractedTargetCount) })
}

export function resolveExportStylesMessage(result: StyleTransferSummary): string {
  return t("exportSuccess", { count: String(result.styledTargetCount) })
}

export function resolveImportStylesMessage(result: StyleTransferSummary): string {
  return t("importSuccess", { count: String(result.styledTargetCount) })
}

export async function applyCustomColorSelection(
  value: string,
  deps: ApplyCustomColorSelectionDeps,
): Promise<string> {
  const normalizedColor = normalizeHexColor(value)
  if (!normalizedColor) {
    return ""
  }

  await deps.applyPaletteColor(normalizedColor)
  deps.closeInlinePalette()
  return normalizedColor
}

export async function clearPaletteSelection(deps: ClearPaletteSelectionDeps): Promise<void> {
  await deps.clearSelectedTargetColor()
  deps.closeInlinePalette()
}
