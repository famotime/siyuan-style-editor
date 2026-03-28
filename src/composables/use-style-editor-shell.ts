import {
  runtimeState,
} from "@/style-editor-runtime";
import type { PaintChannel } from "@/style-editor-runtime";
import type { StyleTarget } from "@/lib/style-profile";
import { computed } from "vue";

import { useInlinePaletteSession } from "@/composables/use-inline-palette-session";
import { usePanelThemeVars } from "@/composables/use-panel-theme-vars";
import { useStyleTransferActions } from "@/composables/use-style-transfer-actions";
import { STYLE_TARGET_OPTIONS } from "@/lib/style-target-catalog";

export function useStyleEditorShell() {
  const { panelThemeVars } = usePanelThemeVars();
  const inlinePaletteSession = useInlinePaletteSession();
  const {
    actionMessage,
    handleDeletePresetPalette: removeCustomPresetPalette,
    handleExportStyles: persistExportStyles,
    handleExtractStyles,
    handleImportStylesChange,
    handleResetAllStyles,
    handleSavePresetPalette: persistCustomPresetPalette,
    importedStyleSignature,
    importFileInputRef,
    openImportStylesPicker,
  } = useStyleTransferActions({
    cancelInlinePalettePanel: inlinePaletteSession.cancelInlinePalettePanel,
  });

  const selectedTargetMeta = computed(() => {
    return STYLE_TARGET_OPTIONS.find(target => target.value === runtimeState.selectedTarget) ?? STYLE_TARGET_OPTIONS[0];
  });

  const statusCopy = computed(() => {
    return actionMessage.value || selectedTargetMeta.value.hint;
  });

  async function handleExportStyles(author: string, styleName: string) {
    await persistExportStyles(author, styleName);
  }

  async function handlePresetPaletteBatchApply(paletteId: string) {
    await inlinePaletteSession.handlePresetPaletteBatchApply(paletteId);
  }

  async function handleSwapTargetChannelValues(
    source: { channel: PaintChannel; target: StyleTarget },
    target: { channel: PaintChannel; target: StyleTarget },
  ) {
    await inlinePaletteSession.handleSwapTargetChannelValues(source, target);
  }

  async function handleSavePresetPalette(name: string) {
    const savedPalette = await persistCustomPresetPalette(name);
    if (savedPalette) {
      inlinePaletteSession.selectPresetPaletteTab(savedPalette.id);
    }
  }

  async function handleDeletePresetPalette(paletteId: string) {
    await removeCustomPresetPalette(paletteId);
  }

  return {
    handleDeletePresetPalette,
    handleExtractStyles,
    handleImportStylesChange,
    handlePresetPaletteBatchApply,
    handleResetAllStyles,
    handleSavePresetPalette,
    handleSwapTargetChannelValues,
    handleExportStyles,
    importedStyleSignature,
    importFileInputRef,
    panelThemeVars,
    runtimeState,
    selectedTargetMeta,
    openImportStylesPicker,
    statusCopy,
    STYLE_TARGET_OPTIONS,
    ...inlinePaletteSession,
  };
}
