import { ref } from "vue";

import {
  pushErrMsg,
  pushMsg,
} from "@/api";
import {
  deleteCustomPresetPalette,
  exportCurrentStyles,
  extractCurrentStyles,
  importStyles,
  resetAllStyles,
  runtimeState,
  saveCurrentProfileAsPresetPalette,
} from "@/style-editor-runtime";
import {
  RESET_ALL_STYLES_MESSAGE,
  resolveExportStylesMessage,
  resolveExtractStylesMessage,
  resolveImportStylesMessage,
} from "@/lib/style-editor-shell-actions";
import { downloadStyleTransferDocument } from "@/lib/style-transfer-download";
import {
  countStyledTargets,
  DEFAULT_STYLE_TRANSFER_AUTHOR,
  DEFAULT_STYLE_TRANSFER_NAME,
  type StyleTransferMetadata,
} from "@/lib/style-transfer";
import { createStylePreviewDocument } from "@/lib/style-preview-document";

interface UseStyleTransferActionsOptions {
  cancelInlinePalettePanel: () => Promise<void>;
}

export function useStyleTransferActions(options: UseStyleTransferActionsOptions) {
  const importFileInputRef = ref<HTMLInputElement | null>(null);
  const actionMessage = ref("");
  const importedStyleSignature = ref("");

  function resolveExportMetadata(authorValue?: string, styleNameValue?: string): StyleTransferMetadata {
    const author = authorValue?.trim() || DEFAULT_STYLE_TRANSFER_AUTHOR;
    const styleName = styleNameValue?.trim() || DEFAULT_STYLE_TRANSFER_NAME;

    return {
      author,
      styleName,
    };
  }

  async function handleExtractStyles() {
    await options.cancelInlinePalettePanel();
    const result = await extractCurrentStyles();
    importedStyleSignature.value = "";
    actionMessage.value = resolveExtractStylesMessage(result);
  }

  async function handleResetAllStyles() {
    await options.cancelInlinePalettePanel();
    await resetAllStyles();
    importedStyleSignature.value = "";
    actionMessage.value = RESET_ALL_STYLES_MESSAGE;
  }

  async function handleExportStyles(authorValue?: string, styleNameValue?: string) {
    await options.cancelInlinePalettePanel();

    if (typeof document === "undefined") {
      return;
    }

    const exportMetadata = resolveExportMetadata(authorValue, styleNameValue);
    const exportedContent = exportCurrentStyles(exportMetadata);
    downloadStyleTransferDocument(exportedContent, exportMetadata);

    actionMessage.value = resolveExportStylesMessage({
      styledTargetCount: countStyledTargets(runtimeState.profile),
    });
  }

  async function handleCreateStylePreviewDocument() {
    await options.cancelInlinePalettePanel();

    try {
      const result = await createStylePreviewDocument();
      const message = `已生成预览文档「${result.title}」，请到 Daily Notes 目录打开查看样式效果。`;
      actionMessage.value = message;
      await pushMsg(message, 5000);
      return result;
    }
    catch (error) {
      const message = error instanceof Error
        ? error.message
        : "生成样式效果预览文档失败，请稍后重试。";
      actionMessage.value = message;
      await pushErrMsg(message, 5000);
      return null;
    }
  }

  async function handleSavePresetPalette(name: string) {
    await options.cancelInlinePalettePanel();

    try {
      const result = await saveCurrentProfileAsPresetPalette(name);
      actionMessage.value = `当前颜色配置已经保存为色卡「${result.label}」，供后续选色使用。`;
      return result.palette;
    }
    catch (error) {
      actionMessage.value = error instanceof Error
        ? error.message
        : "保存预置色卡失败，请稍后重试。";
      return null;
    }
  }

  function openImportStylesPicker() {
    importFileInputRef.value?.click();
  }

  async function handleImportStylesChange(event: Event) {
    await options.cancelInlinePalettePanel();

    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    try {
      const importedContent = await file.text();
      const result = await importStyles(importedContent);
      importedStyleSignature.value = `${result.metadata.styleName} from ${result.metadata.author}`;
      actionMessage.value = resolveImportStylesMessage(result);
    }
    catch (error) {
      actionMessage.value = error instanceof Error
        ? error.message
        : "导入样式失败，请检查本地配置文件。";
    }
    finally {
      if (input) {
        input.value = "";
      }
    }
  }

  async function handleDeletePresetPalette(paletteId: string) {
    try {
      const result = await deleteCustomPresetPalette(paletteId);
      actionMessage.value = `已删除色卡「${result.label}」。`;
      return result;
    }
    catch (error) {
      actionMessage.value = error instanceof Error
        ? error.message
        : "删除色卡失败，请稍后重试。";
      return null;
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
  };
}
