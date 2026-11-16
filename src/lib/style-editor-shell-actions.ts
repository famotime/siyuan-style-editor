import type { StyleTransferSummary } from "@/lib/style-transfer"
import { t } from "@/style-editor-runtime"

export interface ExtractStylesResult {
  extractedTargetCount: number
  matchedTargetCount: number
}

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
