import { computed } from "vue"
import { useInlinePaletteSession } from "@/composables/use-inline-palette-session"
import { usePanelThemeVars } from "@/composables/use-panel-theme-vars"
import { useStyleTransferActions } from "@/composables/use-style-transfer-actions"
import {
  BODY_SAFE_FEATURE_OPTIONS,
  EDITOR_UI_FEATURE_OPTIONS,
  FEATURE_STYLE_OPTIONS,
} from "@/lib/style-feature-catalog"
import { STYLE_TARGET_OPTIONS } from "@/lib/style-target-catalog"
import {
  runtimeState,
  updateFeatureStyle,
  updateTargetEnabled,
  t,
} from "@/style-editor-runtime"

export function useStyleEditorShell() {
  const {
    panelThemeVars,
    themeAppearance,
  } = usePanelThemeVars()
  const inlinePaletteSession = useInlinePaletteSession()
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
  })

  const selectedTargetMeta = computed(() => {
    return STYLE_TARGET_OPTIONS.find((target) => target.value === runtimeState.selectedTarget) ?? STYLE_TARGET_OPTIONS[0]
  })

  const activeStatsCopy = computed(() => {
    const activeTargets = Object.values(runtimeState.profile).filter((p) => p.enabled).length
    const activeAdvanced = BODY_SAFE_FEATURE_OPTIONS.filter(
      (option) => runtimeState.featureProfile[option.value]?.enabled,
    ).length
    const activeUi = EDITOR_UI_FEATURE_OPTIONS.filter(
      (option) => runtimeState.featureProfile[option.value]?.enabled,
    ).length

    return t("activeStats", {
      targets: String(activeTargets),
      advanced: String(activeAdvanced),
      ui: String(activeUi),
    })
  })

  const statusCopy = computed(() => {
    return actionMessage.value || activeStatsCopy.value
  })

  async function handleSavePresetPalette(name: string) {
    const savedPalette = await persistCustomPresetPalette(name)
    if (savedPalette) {
      inlinePaletteSession.selectPresetPaletteTab(savedPalette.id)
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
    updateTargetEnabled,
    handleExportStyles,
    importedStyleSignature,
    importFileInputRef,
    panelThemeVars,
    themeAppearance,
    runtimeState,
    selectedTargetMeta,
    openImportStylesPicker,
    statusCopy,
    bodySafeFeatureOptions: BODY_SAFE_FEATURE_OPTIONS,
    editorUiFeatureOptions: EDITOR_UI_FEATURE_OPTIONS,
    FEATURE_STYLE_OPTIONS,
    BODY_SAFE_FEATURE_OPTIONS,
    EDITOR_UI_FEATURE_OPTIONS,
    STYLE_TARGET_OPTIONS,
    ...inlinePaletteSession,
  }
}
