<template>
  <div
    class="style-editor-shell"
    :style="panelThemeVars"
  >
    <section class="style-card style-card--workspace">
      <header class="workspace-hero">
        <div class="workspace-hero__copy">
          <p class="style-editor-shell__eyebrow">
            Live Document Styling
          </p>
          <h1 class="style-editor-shell__title">
            文档样式编辑器
          </h1>
          <p class="workspace-hero__summary">
            以更轻的操作路径调整对象文字色与背景色，提取、清除与即时预览统一在一个编辑台里。
          </p>
          <div class="workspace-hero__actions">
            <button
              type="button"
              class="extract-styles-button"
              @click="handleExtractStyles"
            >
              提取样式
            </button>
            <button
              type="button"
              class="reset-styles-button"
              @click="handleResetAllStyles"
            >
              清除样式
            </button>
          </div>
        </div>
      </header>

      <section class="target-studio">
        <div class="target-studio__header">
          <div>
            <p class="section-heading__kicker">
              Editable Targets
            </p>
            <h2 class="section-heading__title">
              对象工作区
            </h2>
          </div>
          <p class="target-studio__note">
            {{ STYLE_TARGET_OPTIONS.length }} 个对象
          </p>
        </div>

        <div class="target-grid">
          <article
            v-for="target in STYLE_TARGET_OPTIONS"
            :key="target.value"
            class="target-preview-card"
            :class="{ 'target-preview-card--selected': runtimeState.selectedTarget === target.value }"
          >
            <button
              type="button"
              class="target-preview-card__surface"
              :style="getTargetPreviewStyle(target.value)"
              @click="selectPreviewTarget(target.value)"
            >
              <p class="target-preview-card__eyebrow">
                {{ target.shortLabel }}
              </p>
              <p class="target-preview-card__title">
                {{ target.label }}
              </p>
            </button>

            <div class="target-preview-card__actions">
              <button
                type="button"
                class="channel-orb"
                data-tooltip="字色"
                aria-label="字色"
                :class="{ 'channel-orb--active': runtimeState.selectedTarget === target.value && runtimeState.selectedChannel === 'color' && isInlinePaletteOpenForTarget(target.value) }"
                @click="activateTargetChannel(target.value, 'color', $event)"
              >
                <span
                  class="channel-orb__swatch"
                  :class="{ 'channel-orb__swatch--empty': getChannelSwatch(target.value, 'color').isEmpty }"
                  :style="{ '--orb-fill': getChannelSwatch(target.value, 'color').background }"
                />
              </button>

              <button
                type="button"
                class="channel-orb"
                data-tooltip="底色"
                aria-label="底色"
                :class="{ 'channel-orb--active': runtimeState.selectedTarget === target.value && runtimeState.selectedChannel === 'backgroundColor' && isInlinePaletteOpenForTarget(target.value) }"
                @click="activateTargetChannel(target.value, 'backgroundColor', $event)"
              >
                <span
                  class="channel-orb__swatch"
                  :class="{ 'channel-orb__swatch--empty': getChannelSwatch(target.value, 'backgroundColor').isEmpty }"
                  :style="{ '--orb-fill': getChannelSwatch(target.value, 'backgroundColor').background }"
                />
              </button>
            </div>
          </article>
        </div>
      </section>
    </section>

    <teleport to="body">
      <transition name="floating-palette">
        <div
          v-if="isInlinePaletteVisible"
          ref="floatingPaletteRef"
          class="inline-palette-panel inline-palette-panel--floating"
          :style="floatingPaletteStyle"
        >
          <div class="inline-palette-panel__header">
            <div>
              <p class="section-heading__kicker">
                Palette Console
              </p>
              <p class="inline-palette-panel__copy">
                正在编辑 {{ selectedTargetMeta.label }} 的{{ selectedChannelLabel }}
              </p>
            </div>

            <button
              type="button"
              class="inline-palette-panel__close"
              @click="closeInlinePalettePanel"
            >
              收起
            </button>
          </div>

          <div class="custom-color-panel custom-color-panel--inline">
            <div class="custom-color-panel__copy">
              <p class="section-heading__kicker">
                Custom Color
              </p>
              <p class="custom-color-panel__description">
                使用调色板或十六进制颜色，即时写入当前对象。
              </p>
            </div>

            <div class="custom-color-panel__controls">
              <label class="color-well">
                <input
                  type="color"
                  class="color-well__input"
                  :value="colorPickerValue"
                  @input="handleColorPickerInput"
                >
                <span
                  class="color-well__swatch"
                  :style="{ '--well-color': colorPickerValue }"
                />
                <span class="color-well__label">调色板</span>
              </label>

              <input
                v-model="customColorDraft"
                type="text"
                class="custom-color-field"
                :placeholder="customColorPlaceholder"
                spellcheck="false"
                @keydown.enter.prevent="applyCustomColorDraft"
              >

              <button
                type="button"
                class="custom-color-apply"
                :disabled="!isCustomColorDraftValid"
                @click="applyCustomColorDraft"
              >
                应用颜色
              </button>
            </div>
          </div>

          <div class="inline-palette-panel__presets">
            <div class="inline-palette-panel__subhead">
              <div>
                <p class="section-heading__kicker">
                  Presets
                </p>
                <p class="inline-palette-panel__copy">
                  快速应用纯色，未设置时回到默认。
                </p>
              </div>
            </div>

            <div class="swatch-grid swatch-grid--inline">
              <button
                v-for="color in activePalette"
                :key="color.value"
                type="button"
                class="swatch-chip"
                :class="{ 'swatch-chip--active': selectedSwatch === color.value }"
                :style="{ '--swatch-color': color.value }"
                @click="handlePresetColorSelection(color.value)"
              >
                <span class="swatch-chip__dot" />
                <span class="swatch-chip__label">{{ color.label }}</span>
              </button>
              <button
                type="button"
                class="swatch-chip swatch-chip--clear"
                :class="{ 'swatch-chip--active': !selectedSwatch }"
                @click="handleClearSelectedTargetColor"
              >
                <span class="swatch-chip__dot swatch-chip__dot--clear" />
                <span class="swatch-chip__label">默认</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { useStyleEditorShell } from "@/composables/use-style-editor-shell";

const {
  activePalette,
  activateTargetChannel,
  applyCustomColorDraft,
  closeInlinePalettePanel,
  colorPickerValue,
  customColorDraft,
  customColorPlaceholder,
  floatingPaletteRef,
  floatingPaletteStyle,
  getChannelSwatch,
  getTargetPreviewStyle,
  handleClearSelectedTargetColor,
  handleColorPickerInput,
  handleExtractStyles,
  handlePresetColorSelection,
  handleResetAllStyles,
  isCustomColorDraftValid,
  isInlinePaletteOpenForTarget,
  isInlinePaletteVisible,
  panelThemeVars,
  runtimeState,
  selectedChannelLabel,
  selectedSwatch,
  selectedTargetMeta,
  selectPreviewTarget,
  STYLE_TARGET_OPTIONS,
} = useStyleEditorShell();
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

.workspace-hero {
  position: relative;
  display: grid;
  gap: 8px;
  padding: 2px 2px 0;
}

.workspace-hero__copy {
  display: grid;
  align-content: start;
  gap: 6px;
  max-width: 540px;
}

.workspace-hero__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 4px;
}

.workspace-hero__summary,
.inline-palette-panel__copy,
.custom-color-panel__description,
.target-studio__note {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--panel-text-subtle);
}

.style-editor-shell__eyebrow,
.section-heading__kicker,
.target-preview-card__eyebrow {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--panel-text-subtle);
}

.style-editor-shell__title,
.section-heading__title,
.target-preview-card__title {
  margin: 0;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  color: var(--panel-text);
}

.style-editor-shell__title {
  font-size: 28px;
  line-height: 1.02;
  letter-spacing: 0.03em;
}

.section-heading__title {
  font-size: 18px;
  line-height: 1.1;
}

.target-studio {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid var(--panel-divider);
  background: var(--panel-toolbar-bg);
  box-shadow: var(--panel-toolbar-shadow);
}

.target-preview-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.extract-styles-button,
.reset-styles-button,
.inline-palette-panel__close,
.custom-color-apply,
.channel-orb,
.swatch-chip,
.target-preview-card__surface {
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.extract-styles-button,
.reset-styles-button {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.inline-palette-panel__close {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.extract-styles-button {
  border: 1px solid var(--panel-accent-outline);
  background: var(--panel-chip-active-bg);
  color: var(--panel-accent);
}

.reset-styles-button {
  border: 1px solid color-mix(in srgb, var(--b3-card-error-color) 38%, var(--panel-card-stroke) 62%);
  background: color-mix(in srgb, var(--b3-card-error-background) 30%, var(--panel-pill-bg) 70%);
  color: color-mix(in srgb, var(--b3-card-error-color) 78%, var(--panel-text) 22%);
}

.extract-styles-button:hover,
.reset-styles-button:hover,
.inline-palette-panel__close:hover,
.custom-color-apply:hover:not(:disabled),
.channel-orb:hover,
.swatch-chip:hover,
.target-preview-card__surface:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.target-studio__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.target-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.target-preview-card {
  display: grid;
  gap: 10px;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid var(--panel-divider);
  background: var(--panel-card-strong);
}

.target-preview-card--selected {
  border-color: var(--panel-accent-outline);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--panel-accent) 18%, transparent 82%),
    0 16px 28px color-mix(in srgb, var(--panel-accent-soft) 28%, transparent 72%);
}

.target-preview-card__surface {
  display: grid;
  gap: 6px;
  min-height: 92px;
  padding: 14px;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 18px;
  text-align: left;
  cursor: pointer;
  background: var(--panel-preview-bg);
}

.target-preview-card__title {
  font-size: 18px;
  line-height: 1.18;
}

.channel-orb {
  position: relative;
  width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel-pill-bg) 72%, transparent 28%);
  color: var(--panel-text-muted);
  cursor: pointer;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-card-inner-stroke) 64%, transparent 36%);
}

.channel-orb--active {
  background: var(--panel-chip-active-bg);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--panel-accent) 34%, transparent 66%),
    0 8px 18px color-mix(in srgb, var(--panel-accent-soft) 42%, transparent 58%);
}

.channel-orb::before,
.channel-orb::after {
  position: absolute;
  left: 50%;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.channel-orb::before {
  content: "";
  bottom: calc(100% + 2px);
  transform: translateX(-50%) translateY(4px);
  border-width: 5px 5px 0;
  border-style: solid;
  border-color: var(--panel-text) transparent transparent;
}

.channel-orb::after {
  content: attr(data-tooltip);
  bottom: calc(100% + 8px);
  transform: translateX(-50%) translateY(4px);
  padding: 6px 8px;
  border-radius: 8px;
  background: var(--panel-text);
  color: var(--panel-card-bg);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.channel-orb:hover::before,
.channel-orb:hover::after,
.channel-orb:focus-visible::before,
.channel-orb:focus-visible::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.channel-orb__swatch,
.color-well__swatch,
.swatch-chip__dot {
  border-radius: 999px;
  border: 1px solid var(--panel-dot-border);
}

.channel-orb__swatch {
  width: 18px;
  height: 18px;
  background: var(--orb-fill);
}

.channel-orb__swatch--empty {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-text-subtle) 22%, transparent 78%);
}

.inline-palette-panel {
  display: grid;
  gap: 14px;
}

.inline-palette-panel--floating {
  position: fixed;
  z-index: 999;
  width: min(320px, calc(100vw - 24px));
  padding: 16px;
  border-radius: 24px;
  border: 1px solid var(--panel-card-stroke);
  background:
    linear-gradient(135deg, var(--panel-glass), transparent 50%),
    linear-gradient(180deg, var(--panel-card-highlight), transparent 34%),
    var(--panel-card-bg);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.24), var(--panel-shadow);
  backdrop-filter: blur(18px);
}

.inline-palette-panel__header,
.inline-palette-panel__subhead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.inline-palette-panel__close {
  border: 1px solid var(--panel-card-stroke);
  background: var(--panel-pill-bg);
  color: var(--panel-text-muted);
}

.custom-color-panel {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid var(--panel-divider);
  background: var(--panel-toolbar-bg);
}

.custom-color-panel__copy {
  display: grid;
  gap: 4px;
}

.custom-color-panel__controls {
  display: grid;
  grid-template-columns: minmax(0, 116px) minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.color-well {
  position: relative;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid var(--panel-card-stroke);
  background: var(--panel-chip-bg);
  color: var(--panel-text-muted);
  cursor: pointer;
}

.color-well__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.color-well__swatch,
.swatch-chip__dot {
  width: 18px;
  height: 18px;
}

.color-well__swatch {
  background: var(--well-color);
}

.color-well__label {
  font-size: 12px;
  font-weight: 700;
}

.custom-color-field,
.custom-color-apply {
  min-height: 46px;
  border-radius: 14px;
  border: 1px solid var(--panel-card-stroke);
}

.custom-color-field {
  width: 100%;
  padding: 0 14px;
  background: var(--panel-chip-bg);
  color: var(--panel-text);
  font-size: 13px;
}

.custom-color-field::placeholder {
  color: var(--panel-text-subtle);
}

.custom-color-field:focus,
.custom-color-apply:focus,
.color-well:focus-within {
  outline: 1px solid var(--panel-accent-outline);
  outline-offset: 2px;
}

.custom-color-apply {
  padding: 0 16px;
  background: var(--panel-chip-active-bg);
  color: var(--panel-accent);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.custom-color-apply:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.swatch-grid {
  display: grid;
  gap: 10px;
}

.swatch-grid--inline {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.swatch-chip {
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: var(--panel-chip-bg);
  color: var(--panel-text-muted);
  text-align: left;
  cursor: pointer;
}

.swatch-chip--active {
  border-color: var(--panel-accent-outline);
  background: var(--panel-chip-active-bg);
}

.swatch-chip__dot {
  flex: none;
  background: var(--swatch-color);
}

.swatch-chip__dot--clear {
  background:
    linear-gradient(135deg, transparent 0 46%, var(--panel-text-subtle) 46% 54%, transparent 54% 100%),
    linear-gradient(135deg, var(--panel-preview-bg), var(--panel-card-bg));
}

.swatch-chip__label {
  font-size: 12px;
  font-weight: 700;
}

.swatch-chip--clear {
  background: var(--panel-clear-bg);
}

.floating-palette-enter-active,
.floating-palette-leave-active {
  transition:
    opacity 180ms ease,
    transform 200ms ease;
}

.floating-palette-enter-from,
.floating-palette-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

@media (max-width: 720px) {
  .workspace-hero__actions,
  .target-grid,
  .swatch-grid--inline {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .style-editor-shell {
    padding: 12px;
  }

  .style-card,
  .target-studio,
  .inline-palette-panel--floating {
    padding: 14px;
  }

  .custom-color-panel__controls {
    grid-template-columns: 1fr;
  }

  .target-studio__header,
  .inline-palette-panel__header,
  .inline-palette-panel__subhead {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
