import type { StyleTransferSummary } from "@/lib/style-transfer"
import { normalizeHexColor } from "@/lib/custom-color"

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

export const RESET_ALL_STYLES_MESSAGE = "已清除全部样式，恢复到初始状态。"

export function resolveExtractStylesMessage(result: ExtractStylesResult): string {
  if (result.matchedTargetCount === 0) {
    return "未找到可提取的文档对象，请先打开包含标题或文本内容的文档。"
  }

  if (result.extractedTargetCount === 0) {
    return `已扫描 ${result.matchedTargetCount} 类对象，但没有检测到可回填的显式颜色。`
  }

  return `已提取 ${result.extractedTargetCount} 类对象的当前颜色，并同步到面板预览。`
}

export function resolveExportStylesMessage(result: StyleTransferSummary): string {
  return `已导出当前配置，包含 ${result.styledTargetCount} 类对象的显式样式。`
}

export function resolveImportStylesMessage(result: StyleTransferSummary): string {
  return `已导入本地配置，当前 ${result.styledTargetCount} 类对象带有显式样式。`
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
