import { ref } from "vue";

import {
  exportCurrentStyles,
  extractCurrentStyles,
  importStyles,
  resetAllStyles,
  runtimeState,
} from "@/style-editor-runtime";
import {
  RESET_ALL_STYLES_MESSAGE,
  resolveExportStylesMessage,
  resolveExtractStylesMessage,
  resolveImportStylesMessage,
} from "@/lib/style-editor-shell-actions";
import { downloadStyleTransferDocument } from "@/lib/style-transfer-download";
import { countStyledTargets } from "@/lib/style-transfer";

interface UseStyleTransferActionsOptions {
  cancelInlinePalettePanel: () => Promise<void>;
}

export function useStyleTransferActions(options: UseStyleTransferActionsOptions) {
  const importFileInputRef = ref<HTMLInputElement | null>(null);
  const actionMessage = ref("");

  async function handleExtractStyles() {
    await options.cancelInlinePalettePanel();
    const result = await extractCurrentStyles();
    actionMessage.value = resolveExtractStylesMessage(result);
  }

  async function handleResetAllStyles() {
    await options.cancelInlinePalettePanel();
    await resetAllStyles();
    actionMessage.value = RESET_ALL_STYLES_MESSAGE;
  }

  async function handleExportStyles() {
    await options.cancelInlinePalettePanel();

    if (typeof document === "undefined") {
      return;
    }

    const exportedContent = exportCurrentStyles();
    downloadStyleTransferDocument(exportedContent);

    actionMessage.value = resolveExportStylesMessage({
      styledTargetCount: countStyledTargets(runtimeState.profile),
    });
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

  return {
    actionMessage,
    handleExportStyles,
    handleExtractStyles,
    handleImportStylesChange,
    handleResetAllStyles,
    importFileInputRef,
    openImportStylesPicker,
  };
}
