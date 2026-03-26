import {
  runtimeState,
} from "@/style-editor-runtime";
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
    handleExportStyles,
    handleExtractStyles,
    handleImportStylesChange,
    handleResetAllStyles,
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

  return {
    handleExportStyles,
    handleExtractStyles,
    handleImportStylesChange,
    handleResetAllStyles,
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
