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
    handleDeletePresetPalette,
    handleExportStyles,
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

  async function handleSavePresetPalette(name: string) {
    const savedPalette = await persistCustomPresetPalette(name);
    if (savedPalette) {
      inlinePaletteSession.selectPresetPaletteTab(savedPalette.id);
    }
  }

  return {
    handleDeletePresetPalette,
    handleExtractStyles,
    handleImportStylesChange,
    handlePresetPaletteBatchApply: inlinePaletteSession.handlePresetPaletteBatchApply,
    handleResetAllStyles,
    handleSavePresetPalette,
    handleSwapTargetChannelValues: inlinePaletteSession.handleSwapTargetChannelValues,
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
