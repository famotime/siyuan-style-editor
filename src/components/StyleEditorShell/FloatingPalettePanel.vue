<template>
  <teleport to="body">
    <transition name="floating-palette">
      <div
        v-if="visible"
        class="inline-palette-backdrop"
        :style="inlinePaletteBackdropStyle"
        @pointerdown="emit('cancel')"
      >
        <div
          :ref="setFloatingPaletteRef"
          class="inline-palette-panel inline-palette-panel--floating"
          :style="inlinePalettePanelStyle"
          @pointerdown.stop
        >
          <div class="inline-palette-panel__header">
            <div>
              <p class="section-heading__kicker">
                Palette Console
              </p>
              <p class="inline-palette-panel__copy">
                正在编辑 {{ selectedTargetLabel }} 的{{ selectedChannelLabel }}
              </p>
            </div>

            <button
              type="button"
              class="inline-palette-panel__close"
              @click="emit('cancel')"
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
                使用调色板或十六进制颜色，即时预览，点击应用颜色后保存。
              </p>
            </div>

            <div class="inline-color-picker">
              <div
                :ref="setInlineColorFieldRef"
                class="inline-color-picker__field"
                :style="inlineColorFieldStyle"
                @pointerdown="emit('inline-color-field-pointerdown', $event)"
              >
                <span
                  class="inline-color-picker__thumb"
                  :style="inlineColorThumbStyle"
                />
              </div>

              <label class="inline-color-picker__hue">
                <span
                  class="inline-color-picker__preview"
                  :style="{ '--inline-picker-preview': colorPickerValue }"
                />
                <input
                  type="range"
                  class="inline-color-picker__hue-slider"
                  min="0"
                  max="360"
                  step="1"
                  :value="inlineHue"
                  @input="emit('hue-input', $event)"
                >
              </label>
            </div>

            <div class="custom-color-panel__controls">
              <input
                v-model="customColorDraftModel"
                type="text"
                class="custom-color-field"
                :placeholder="customColorPlaceholder"
                spellcheck="false"
                @keydown.enter.prevent="emit('apply-custom-color')"
              >

              <button
                type="button"
                class="custom-color-apply"
                :disabled="!isCustomColorDraftValid"
                @click="emit('apply-custom-color')"
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
                  从 10 组高区隔配色里切换主题，点击色卡即可即时预览。
                </p>
              </div>
              <button
                type="button"
                class="inline-palette-panel__toggle"
                :aria-expanded="isPresetPaletteSectionExpanded"
                @click="emit('toggle-preset-palette-section')"
              >
                {{ isPresetPaletteSectionExpanded ? "折叠" : "展开" }}
              </button>
            </div>

            <div
              v-if="isPresetPaletteSectionExpanded"
              class="inline-palette-panel__presets-body"
            >
              <div
                class="preset-palette-tabs"
                role="tablist"
                aria-label="预设配色方案"
              >
                <button
                  v-for="palette in presetPaletteCollections"
                  :key="palette.id"
                  type="button"
                  class="preset-palette-tab"
                  :class="{ 'preset-palette-tab--active': activePresetPaletteId === palette.id }"
                  :style="getPresetPaletteTabStyle(palette)"
                  role="tab"
                  :aria-selected="activePresetPaletteId === palette.id"
                  :tabindex="activePresetPaletteId === palette.id ? 0 : -1"
                  @click="emit('select-preset-palette-tab', palette.id)"
                >
                  <span class="preset-palette-tab__name">{{ palette.label }}</span>
                  <span class="preset-palette-tab__count">{{ palette.colors.length }} 色</span>
                </button>
              </div>

              <div class="swatch-grid swatch-grid--inline">
                <button
                  v-for="color in activePresetPalette.colors"
                  :key="color.value"
                  type="button"
                  class="swatch-chip"
                  :aria-label="color.label"
                  :class="{ 'swatch-chip--active': selectedSwatch === color.value }"
                  :style="{ '--swatch-color': color.value }"
                  @click="emit('select-preset-color', color.value)"
                >
                  <span class="swatch-chip__dot" />
                </button>
                <button
                  type="button"
                  class="swatch-chip swatch-chip--clear"
                  aria-label="恢复默认颜色"
                  :class="{ 'swatch-chip--active': !selectedSwatch }"
                  @click="emit('clear-selected-target-color')"
                >
                  <span class="swatch-chip__dot swatch-chip__dot--clear">
                    <span class="swatch-chip__dot-clear-surface" />
                    <span class="swatch-chip__dot-clear-slash" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { buildPresetPaletteCardBackground } from "@/lib/preset-palette-catalog";

const INLINE_PALETTE_BACKDROP_Z_INDEX = "10";
const INLINE_PALETTE_PANEL_Z_INDEX = "11";

interface PaletteColor {
  label: string;
  value: string;
}

interface PaletteCollection {
  colors: PaletteColor[];
  id: string;
  label: string;
}

const props = defineProps<{
  activePresetPalette: PaletteCollection;
  activePresetPaletteId: string;
  colorPickerValue: string;
  customColorDraft: string;
  customColorPlaceholder: string;
  floatingPaletteStyle: Record<string, string>;
  inlineColorFieldStyle: Record<string, string>;
  inlineColorThumbStyle: Record<string, string>;
  inlineHue: number;
  isCustomColorDraftValid: boolean;
  isPresetPaletteSectionExpanded: boolean;
  presetPaletteCollections: PaletteCollection[];
  selectedChannelLabel: string;
  selectedSwatch: string;
  selectedTargetLabel: string;
  setFloatingPaletteRef: (element: Element | null) => void;
  setInlineColorFieldRef: (element: Element | null) => void;
  visible: boolean;
}>();

const emit = defineEmits<{
  "apply-custom-color": [];
  "clear-selected-target-color": [];
  "inline-color-field-pointerdown": [event: PointerEvent];
  "select-preset-color": [color: string];
  "select-preset-palette-tab": [paletteId: string];
  "toggle-preset-palette-section": [];
  "update:customColorDraft": [value: string];
  "hue-input": [event: Event];
  cancel: [];
}>();

const customColorDraftModel = computed({
  get: () => props.customColorDraft,
  set: (value: string) => {
    emit("update:customColorDraft", value);
  },
});

const inlinePaletteBackdropStyle = computed(() => ({
  zIndex: INLINE_PALETTE_BACKDROP_Z_INDEX,
}));

const inlinePalettePanelStyle = computed(() => ({
  ...props.floatingPaletteStyle,
  zIndex: INLINE_PALETTE_PANEL_Z_INDEX,
}));

function getPresetPaletteTabStyle(palette: PaletteCollection) {
  return {
    "--preset-palette-gradient": buildPresetPaletteCardBackground(palette.colors),
  };
}
</script>

<style scoped lang="scss">
.section-heading__kicker {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--panel-text-subtle);
}

.inline-palette-panel__copy,
.custom-color-panel__description {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--panel-text-subtle);
}

.inline-palette-panel {
  display: grid;
  gap: 14px;
}

.inline-palette-panel__presets {
  display: grid;
  gap: 10px;
}

.inline-palette-panel__presets-body {
  display: grid;
  gap: 10px;
}

.inline-palette-backdrop {
  position: fixed;
  inset: 0;
}

.inline-palette-panel--floating {
  position: fixed;
  width: min(320px, calc(100vw - 24px));
  padding: 16px;
  border-radius: 24px;
  border: 1px solid var(--panel-card-stroke);
  background:
    linear-gradient(135deg, var(--panel-glass), transparent 50%),
    linear-gradient(180deg, var(--panel-card-highlight), transparent 34%),
    var(--panel-card-bg);
  box-shadow:
    inset 0 0 0 1px var(--panel-floating-outline),
    0 24px 48px rgba(15, 23, 42, 0.24),
    var(--panel-shadow);
  backdrop-filter: blur(18px);
}

.inline-palette-panel__header,
.inline-palette-panel__subhead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.inline-palette-panel__close,
.inline-palette-panel__toggle,
.custom-color-apply,
.swatch-chip {
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.inline-palette-panel__close,
.inline-palette-panel__toggle {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.inline-palette-panel__close {
  border: 1px solid var(--panel-card-stroke);
  background: var(--panel-pill-bg);
  color: var(--panel-text-muted);
}

.inline-palette-panel__toggle {
  border: 1px solid var(--panel-card-stroke);
  background: var(--panel-pill-bg);
  color: var(--panel-text-muted);
}

.inline-palette-panel__close:hover,
.custom-color-apply:hover:not(:disabled),
.swatch-chip:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.preset-palette-tabs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 184px;
  overscroll-behavior: contain;
  padding-right: 4px;
  scrollbar-width: thin;
}

.preset-palette-tab {
  width: 100%;
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, white 22%, var(--panel-card-stroke) 78%);
  border-radius: 16px;
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(8, 12, 18, 0.18)),
    var(--preset-palette-gradient);
  color: rgba(255, 255, 255, 0.94);
  text-align: left;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 10px 18px rgba(15, 23, 42, 0.16);
  transition:
    border-color 140ms ease,
    background 140ms ease,
    color 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;
}

.preset-palette-tab:hover {
  transform: translateY(-1px);
  color: white;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 14px 24px rgba(15, 23, 42, 0.2);
}

.preset-palette-tab--active {
  border-color: color-mix(in srgb, white 36%, var(--panel-accent-outline) 64%);
  color: white;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 0 0 1px color-mix(in srgb, var(--panel-accent-outline) 58%, transparent 42%),
    0 16px 28px rgba(15, 23, 42, 0.22);
}

.preset-palette-tab__name {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.28);
}

.preset-palette-tab__count {
  justify-self: start;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(9, 12, 18, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(6px);
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
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: stretch;
}

.inline-color-picker {
  display: grid;
  gap: 8px;
}

.inline-color-picker__field {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  border: 1px solid var(--panel-card-stroke);
  overflow: hidden;
  cursor: crosshair;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, white 10%, transparent 90%);
}

.inline-color-picker__thumb {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.92);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.22),
    0 4px 12px rgba(15, 23, 42, 0.2);
  transform: translate(-50%, -50%);
}

.inline-color-picker__hue {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.inline-color-picker__preview {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid var(--panel-card-stroke);
  background: var(--inline-picker-preview);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, white 14%, transparent 86%);
}

.inline-color-picker__hue-slider {
  appearance: none;
  width: 100%;
  height: 14px;
  border-radius: 999px;
  border: 1px solid var(--panel-card-stroke);
  background: linear-gradient(
    90deg,
    #ff0000 0%,
    #ffff00 17%,
    #00ff00 33%,
    #00ffff 50%,
    #0000ff 67%,
    #ff00ff 83%,
    #ff0000 100%
  );
}

.inline-color-picker__hue-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.92);
  background: var(--panel-card-bg);
  box-shadow: 0 1px 6px rgba(15, 23, 42, 0.2);
  cursor: ew-resize;
}

.inline-color-picker__hue-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.92);
  background: var(--panel-card-bg);
  box-shadow: 0 1px 6px rgba(15, 23, 42, 0.2);
  cursor: ew-resize;
}

.inline-color-picker__hue-slider::-moz-range-track {
  height: 14px;
  border-radius: 999px;
  border: 0;
  background: transparent;
}

.custom-color-field,
.custom-color-apply {
  min-height: 42px;
  border-radius: 14px;
  border: 1px solid var(--panel-card-stroke);
}

.custom-color-field {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  appearance: none;
  padding: 0 12px;
  border-width: 1.5px;
  border-style: solid;
  border-color: var(--panel-control-border);
  background: var(--panel-control-bg);
  color: var(--panel-text);
  font-size: 13px;
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--panel-control-border) 64%, transparent 36%),
    var(--panel-control-shadow);
}

.custom-color-field::placeholder {
  color: var(--panel-text-subtle);
}

.custom-color-field:focus,
.custom-color-apply:focus,
.inline-color-picker__hue-slider:focus-visible {
  outline: 1px solid var(--panel-accent-outline);
  outline-offset: 2px;
}

.custom-color-apply {
  min-height: 44px;
  padding: 0 14px;
  white-space: nowrap;
  border-width: 2px;
  border-style: solid;
  border-color: var(--panel-primary-button-border);
  background: var(--panel-primary-button-bg);
  color: var(--panel-primary-button-text);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.18);
  box-shadow: var(--panel-primary-button-shadow);
}

.custom-color-apply:hover:not(:disabled) {
  box-shadow:
    var(--panel-primary-button-shadow-hover),
    var(--panel-hover-shadow);
}

.custom-color-apply:disabled {
  opacity: 0.58;
  cursor: not-allowed;
  box-shadow: none;
}

.swatch-grid {
  display: grid;
}

.swatch-grid--inline {
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

.swatch-chip {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--panel-chip-bg);
  color: var(--panel-text-muted);
  cursor: pointer;
  aspect-ratio: 1;
}

.swatch-chip--active {
  border-color: var(--panel-accent-outline);
  background: var(--panel-chip-active-bg);
}

.swatch-chip__dot {
  flex: none;
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 2px solid var(--panel-dot-border);
  background: var(--swatch-color);
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--panel-card-bg) 24%, transparent 76%);
}

.swatch-chip__dot--clear {
  border-color: var(--panel-dot-border);
  background: transparent;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--panel-card-bg) 30%, transparent 70%),
    0 1px 2px rgba(15, 23, 42, 0.12);
}

.swatch-chip--clear {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.swatch-chip--clear.swatch-chip--active {
  border-color: transparent;
  background: transparent;
}

.swatch-chip--clear.swatch-chip--active .swatch-chip__dot--clear {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--panel-card-bg) 30%, transparent 70%),
    0 0 0 2px var(--panel-accent-outline);
}

.swatch-chip__dot-clear-surface,
.swatch-chip__dot-clear-slash {
  position: absolute;
  inset: 0;
}

.swatch-chip__dot-clear-surface {
  inset: 2px;
  border-radius: 999px;
  background: var(--panel-clear-surface);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-card-bg) 18%, transparent 82%);
}

.swatch-chip__dot-clear-slash {
  inset: 0;
}

.swatch-chip__dot-clear-slash::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 16px;
  border-radius: 999px;
  background: var(--panel-clear-icon);
  transform: translate(-50%, -50%) rotate(45deg);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--panel-card-bg) 12%, transparent 88%);
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

@media (max-width: 520px) {
  .inline-palette-panel--floating {
    padding: 14px;
  }

  .custom-color-panel__controls {
    grid-template-columns: 1fr;
  }

  .inline-palette-panel__header,
  .inline-palette-panel__subhead {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
