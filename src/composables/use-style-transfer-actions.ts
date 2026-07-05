import type { StyleTransferMetadata } from "@/lib/style-transfer"

import { ref, watch, nextTick } from "vue"
import {
  pushErrMsg,
  pushMsg,
  showConfirm,
} from "@/api"
import {
  resolveExportStylesMessage,
  resolveExtractStylesMessage,
  resolveImportStylesMessage,
} from "@/lib/style-editor-shell-actions"
import { t } from "@/style-editor-runtime"
import { createStylePreviewDocument } from "@/lib/style-preview-document"
import {
  countStyledTargets,
  DEFAULT_STYLE_TRANSFER_AUTHOR,
  DEFAULT_STYLE_TRANSFER_NAME,

} from "@/lib/style-transfer"
import { downloadStyleTransferDocument } from "@/lib/style-transfer-download"
import {
  deleteCustomPresetPalette,
  exportCurrentStyles,
  extractCurrentStyles,
  importStyles,
  resetAllStyles,
  runtimeState,
  saveCurrentProfileAsPresetPalette,
} from "@/style-editor-runtime"

interface UseStyleTransferActionsOptions {
  cancelInlinePalettePanel: () => Promise<void>
}

export function useStyleTransferActions(options: UseStyleTransferActionsOptions) {
  const importFileInputRef = ref<HTMLInputElement | null>(null)
  const actionMessage = ref("")
  const importedStyleSignature = ref("")

  let isSystemOperation = false

  watch(
    () => [runtimeState.profile, runtimeState.featureProfile],
    () => {
      if (isSystemOperation) {
        return
      }
      actionMessage.value = ""
    },
    { deep: true },
  )

  function resolveExportMetadata(authorValue?: string, styleNameValue?: string): StyleTransferMetadata {
    const author = authorValue?.trim() || DEFAULT_STYLE_TRANSFER_AUTHOR
    const styleName = styleNameValue?.trim() || DEFAULT_STYLE_TRANSFER_NAME

    return {
      author,
      styleName,
    }
  }

  async function handleExtractStyles() {
    isSystemOperation = true
    await options.cancelInlinePalettePanel()
    const result = await extractCurrentStyles()
    importedStyleSignature.value = ""
    actionMessage.value = resolveExtractStylesMessage(result)
    await nextTick()
    isSystemOperation = false
  }

  async function handleResetAllStyles() {
    await options.cancelInlinePalettePanel()
    const confirmed = await showConfirm(
      t("confirmClearStylesTitle"),
      t("confirmClearStylesMsg")
    )
    if (!confirmed) {
      return
    }
    isSystemOperation = true
    await resetAllStyles()
    importedStyleSignature.value = ""
    actionMessage.value = t("resetStylesSuccess")
    await nextTick()
    isSystemOperation = false
  }

  async function handleExportStyles(authorValue?: string, styleNameValue?: string) {
    await options.cancelInlinePalettePanel()

    if (typeof document === "undefined") {
      return
    }

    const exportMetadata = resolveExportMetadata(authorValue, styleNameValue)
    const exportedContent = exportCurrentStyles(exportMetadata)
    downloadStyleTransferDocument(exportedContent, exportMetadata)

    actionMessage.value = resolveExportStylesMessage({
      styledTargetCount: countStyledTargets(runtimeState.profile),
    })
  }

  async function handleCreateStylePreviewDocument() {
    await options.cancelInlinePalettePanel()

    try {
      const result = await createStylePreviewDocument()
      const message = t("previewDocSuccess", { title: result.title, path: result.path })
      actionMessage.value = message
      await pushMsg(message, 5000)
      return result
    }
    catch (error) {
      const message = error instanceof Error
        ? error.message
        : t("previewDocFailed")
      actionMessage.value = message
      await pushErrMsg(message, 5000)
      return null
    }
  }

  async function handleSavePresetPalette(name: string) {
    await options.cancelInlinePalettePanel()

    try {
      const result = await saveCurrentProfileAsPresetPalette(name)
      actionMessage.value = t("savePaletteSuccess", { label: result.label })
      return result.palette
    }
    catch (error) {
      actionMessage.value = error instanceof Error
        ? error.message
        : t("savePaletteFailed")
      return null
    }
  }

  function openImportStylesPicker() {
    importFileInputRef.value?.click()
  }

  async function handleImportStylesChange(event: Event) {
    await options.cancelInlinePalettePanel()

    const input = event.target as HTMLInputElement | null
    const file = input?.files?.[0]
    if (!file) {
      return
    }

    try {
      const importedContent = await file.text()
      isSystemOperation = true
      const result = await importStyles(importedContent)
      importedStyleSignature.value = `${result.metadata.styleName} from ${result.metadata.author}`
      actionMessage.value = resolveImportStylesMessage(result)
    }
    catch (error) {
      actionMessage.value = error instanceof Error
        ? error.message
        : t("importFailed")
    }
    finally {
      if (input) {
        input.value = ""
      }
      await nextTick()
      isSystemOperation = false
    }
  }

  async function handleDeletePresetPalette(paletteId: string) {
    try {
      const result = await deleteCustomPresetPalette(paletteId)
      actionMessage.value = t("deletePaletteSuccess", { label: result.label })
      return result
    }
    catch (error) {
      actionMessage.value = error instanceof Error
        ? error.message
        : t("deletePaletteFailed")
      return null
    }
  }

  return {
    actionMessage,
    handleCreateStylePreviewDocument,
    handleDeletePresetPalette,
    handleExportStyles,
    handleExtractStyles,
    handleImportStylesChange,
    handleResetAllStyles,
    handleSavePresetPalette,
    importedStyleSignature,
    importFileInputRef,
    openImportStylesPicker,
  }
}
