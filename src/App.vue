<template>
  <div
    class="style-editor-shell"
    :style="panelThemeVars"
  >
    <section class="style-card style-card--workspace">
      <WorkspaceHero
        :imported-style-signature="importedStyleSignature"
        :status-copy="statusCopy"
        :set-import-file-input-ref="setImportFileInputRef"
        @create-preview-document="handleCreateStylePreviewDocument"
        @extract="handleExtractStyles"
        @reset="handleResetAllStyles"
        @export="handleExportStyles"
        @open-import="openImportStylesPicker"
        @import-change="handleImportStylesChange"
      />

      <TargetStudio
        :style-target-options="STYLE_TARGET_OPTIONS"
        :selected-target="runtimeState.selectedTarget"
        :selected-channel="runtimeState.selectedChannel"
        :get-target-preview-style="getTargetPreviewStyle"
        :get-channel-swatch="getChannelSwatch"
        :is-inline-palette-open-for-target="isInlinePaletteOpenForTarget"
        @save-preset-palette="handleSavePresetPalette"
        @select-target="selectPreviewTarget"
        @swap-channel-value="handleSwapTargetChannelValues"
        @activate-channel="handleTargetChannelActivation"
      />

      <FeatureSection
        kicker="Advanced Config"
        title="高级定制"
        :feature-style-options="bodySafeFeatureOptions"
        :feature-profile="runtimeState.featureProfile"
        @update-feature-style="handleUpdateFeatureStyle"
      />

      <FeatureSection
        kicker="Editor UI"
        title="全屋改造"
        :feature-style-options="editorUiFeatureOptions"
        :feature-profile="runtimeState.featureProfile"
        @update-feature-style="handleUpdateFeatureStyle"
      />
    </section>

    <FloatingPalettePanel
      v-model:custom-color-draft="customColorDraft"
      :visible="isInlinePaletteVisible"
      :selected-target-label="selectedTargetMeta.label"
      :selected-channel-label="selectedChannelLabel"
      :panel-theme-vars="panelThemeVars"
      :set-floating-palette-ref="setFloatingPaletteRef"
      :floating-palette-style="floatingPaletteStyle"
      :set-inline-color-field-ref="setInlineColorFieldRef"
      :inline-color-field-style="inlineColorFieldStyle"
      :inline-color-thumb-style="inlineColorThumbStyle"
      :color-picker-value="colorPickerValue"
      :inline-hue="inlineHue"
      :custom-color-placeholder="customColorPlaceholder"
      :is-custom-color-draft-valid="isCustomColorDraftValid"
      :is-preset-palette-section-expanded="isPresetPaletteSectionExpanded"
      :preset-palette-collections="presetPaletteCollections"
      :active-preset-palette-id="activePresetPaletteId"
      :active-preset-palette="activePresetPalette"
      :selected-swatch="selectedSwatch"
      @cancel="cancelInlinePalettePanel"
      @inline-color-field-pointerdown="handleInlineColorFieldPointerDown"
      @hue-input="handleInlineHueInput"
      @apply-custom-color="applyCustomColorDraft"
      @delete-preset-palette="handleDeletePresetPalette"
      @toggle-preset-palette-section="togglePresetPaletteSection"
      @apply-preset-palette-sequence="handlePresetPaletteBatchApply"
      @select-preset-palette-tab="selectPresetPaletteTab"
      @select-preset-color="handlePresetColorSelection"
      @clear-selected-target-color="handleClearSelectedTargetColor"
    />
  </div>
</template>

<script setup lang="ts">
import type { PaintChannel } from "@/style-editor-runtime";
import type { StyleTarget } from "@/lib/style-profile";

import FloatingPalettePanel from "@/components/StyleEditorShell/FloatingPalettePanel.vue";
import FeatureSection from "@/components/StyleEditorShell/FeatureSection.vue";
import TargetStudio from "@/components/StyleEditorShell/TargetStudio.vue";
import WorkspaceHero from "@/components/StyleEditorShell/WorkspaceHero.vue";
import { useStyleEditorShell } from "@/composables/use-style-editor-shell";

const {
  activePresetPalette,
  activePresetPaletteId,
  activateTargetChannel,
  applyCustomColorDraft,
  cancelInlinePalettePanel,
  colorPickerValue,
  customColorDraft,
  customColorPlaceholder,
  floatingPaletteRef,
  floatingPaletteStyle,
  getChannelSwatch,
  getTargetPreviewStyle,
  handleClearSelectedTargetColor,
  handleCreateStylePreviewDocument,
  handleDeletePresetPalette,
  handleExportStyles,
  handleExtractStyles,
  handleImportStylesChange,
  handleInlineColorFieldPointerDown,
  handleInlineHueInput,
  handlePresetPaletteBatchApply,
  handlePresetColorSelection,
  handleResetAllStyles,
  handleSavePresetPalette,
  handleSwapTargetChannelValues,
  handleUpdateFeatureStyle,
  importedStyleSignature,
  importFileInputRef,
  inlineColorFieldRef,
  inlineColorFieldStyle,
  inlineColorThumbStyle,
  inlineHue,
  isCustomColorDraftValid,
  isInlinePaletteOpenForTarget,
  isInlinePaletteVisible,
  isPresetPaletteSectionExpanded,
  panelThemeVars,
  presetPaletteCollections,
  runtimeState,
  selectPresetPaletteTab,
  togglePresetPaletteSection,
  selectedChannelLabel,
  selectedSwatch,
  selectedTargetMeta,
  selectPreviewTarget,
  openImportStylesPicker,
  statusCopy,
  bodySafeFeatureOptions,
  editorUiFeatureOptions,
  STYLE_TARGET_OPTIONS,
} = useStyleEditorShell();

function setImportFileInputRef(element: Element | null) {
  importFileInputRef.value = element as HTMLInputElement | null;
}

function setFloatingPaletteRef(element: Element | null) {
  floatingPaletteRef.value = element as HTMLElement | null;
}

function setInlineColorFieldRef(element: Element | null) {
  inlineColorFieldRef.value = element as HTMLElement | null;
}

function handleTargetChannelActivation(payload: {
  channel: PaintChannel;
  event: MouseEvent;
  target: StyleTarget;
}) {
  void activateTargetChannel(payload.target, payload.channel, payload.event);
}
</script>

<style scoped lang="scss">
.style-editor-shell {
  min-height: 100%;
  padding: 16px;
  display: grid;
  align-content: start;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top left, var(--panel-glow-a), transparent 34%),
    radial-gradient(circle at bottom right, var(--panel-glow-b), transparent 30%),
    linear-gradient(180deg, var(--panel-shell-overlay), transparent 38%),
    var(--panel-shell-backdrop);
  color: var(--panel-text-muted);
  font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.style-card {
  position: relative;
  overflow: hidden;
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 12px 16px 22px;
  border: 1px solid var(--panel-card-stroke);
  border-radius: 26px;
  background:
    linear-gradient(135deg, var(--panel-glass), transparent 48%),
    linear-gradient(180deg, var(--panel-card-highlight), transparent 34%),
    var(--panel-card-bg);
  box-shadow: var(--panel-shadow);
}

.style-card--workspace {
  gap: 10px;
}

@media (max-width: 520px) {
  .style-editor-shell {
    padding: 12px;
  }

  .style-card {
    padding: 14px;
  }
}
</style>
