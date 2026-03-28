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

          <FloatingPaletteCustomSection
            v-model:custom-color-draft="customColorDraftModel"
            :color-picker-value="colorPickerValue"
            :custom-color-placeholder="customColorPlaceholder"
            :set-inline-color-field-ref="setInlineColorFieldRef"
            :inline-color-field-style="inlineColorFieldStyle"
            :inline-color-thumb-style="inlineColorThumbStyle"
            :inline-hue="inlineHue"
            :is-custom-color-draft-valid="isCustomColorDraftValid"
            @inline-color-field-pointerdown="emit('inline-color-field-pointerdown', $event)"
            @hue-input="emit('hue-input', $event)"
            @apply-custom-color="emit('apply-custom-color')"
          />

          <FloatingPalettePresetSection
            :active-preset-palette="activePresetPalette"
            :active-preset-palette-id="activePresetPaletteId"
            :is-preset-palette-section-expanded="isPresetPaletteSectionExpanded"
            :preset-palette-collections="presetPaletteCollections"
            :selected-swatch="selectedSwatch"
            @toggle-preset-palette-section="emit('toggle-preset-palette-section')"
            @select-preset-palette-tab="emit('select-preset-palette-tab', $event)"
            @apply-preset-palette-sequence="emit('apply-preset-palette-sequence', $event)"
            @delete-preset-palette="emit('delete-preset-palette', $event)"
            @select-preset-color="emit('select-preset-color', $event)"
            @clear-selected-target-color="emit('clear-selected-target-color')"
          />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import {
  computed,
} from "vue";

import FloatingPaletteCustomSection from "@/components/StyleEditorShell/FloatingPaletteCustomSection.vue";
import FloatingPalettePresetSection from "@/components/StyleEditorShell/FloatingPalettePresetSection.vue";

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
  panelThemeVars: Record<string, string>;
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
  "apply-preset-palette-sequence": [paletteId: string];
  "clear-selected-target-color": [];
  "delete-preset-palette": [paletteId: string];
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
  ...props.panelThemeVars,
  ...props.floatingPaletteStyle,
  borderColor: "var(--panel-accent-outline)",
  borderStyle: "solid",
  borderWidth: "1px",
  zIndex: INLINE_PALETTE_PANEL_Z_INDEX,
}));
</script>

<style scoped lang="scss">
.section-heading__kicker {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--panel-text-subtle);
}

.inline-palette-panel__copy {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--panel-text-subtle);
}

.inline-palette-panel {
  display: grid;
  gap: 14px;
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
  background:
    linear-gradient(135deg, var(--panel-glass), transparent 50%),
    linear-gradient(180deg, var(--panel-card-highlight), transparent 34%),
    var(--panel-card-bg);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--panel-accent) 18%, transparent 82%),
    0 24px 48px rgba(15, 23, 42, 0.24),
    var(--panel-shadow);
  backdrop-filter: blur(18px);
}

.inline-palette-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.inline-palette-panel__close {
  position: relative;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--panel-card-stroke);
  background: var(--panel-pill-bg);
  color: var(--panel-text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.inline-palette-panel__close:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
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

  .inline-palette-panel__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
