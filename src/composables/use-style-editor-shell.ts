import {
  runtimeState,
} from "@/style-editor-runtime";
import type { PaintChannel } from "@/style-editor-runtime";
import type { StyleTarget } from "@/lib/style-profile";
import { computed } from "vue";

import { useInlinePaletteSession } from "@/composables/use-inline-palette-session";
import { usePanelThemeVars } from "@/composables/use-panel-theme-vars";
import { useStyleTransferActions } from "@/composables/use-style-transfer-actions";
import { FEATURE_STYLE_OPTIONS } from "@/lib/style-feature-catalog";
import { STYLE_TARGET_OPTIONS } from "@/lib/style-target-catalog";
import {
  updateFeatureStyle,
} from "@/style-editor-runtime";

export function useStyleEditorShell() {
  const { panelThemeVars } = usePanelThemeVars();
  const inlinePaletteSession = useInlinePaletteSession();
  const {
    actionMessage,
    handleCreateStylePreviewDocument,
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
    handleCreateStylePreviewDocument,
    handleDeletePresetPalette,
    handleExtractStyles,
    handleImportStylesChange,
    handlePresetPaletteBatchApply: inlinePaletteSession.handlePresetPaletteBatchApply,
    handleResetAllStyles,
    handleSavePresetPalette,
    handleSwapTargetChannelValues: inlinePaletteSession.handleSwapTargetChannelValues,
    handleUpdateFeatureStyle: updateFeatureStyle,
    handleExportStyles,
    importedStyleSignature,
    importFileInputRef,
    panelThemeVars,
    runtimeState,
    selectedTargetMeta,
    openImportStylesPicker,
    statusCopy,
    FEATURE_STYLE_OPTIONS,
    STYLE_TARGET_OPTIONS,
    ...inlinePaletteSession,
  };
}
