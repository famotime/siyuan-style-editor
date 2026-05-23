<template>
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
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  colorPickerValue: string
  customColorDraft: string
  customColorPlaceholder: string
  inlineColorFieldStyle: Record<string, string>
  inlineColorThumbStyle: Record<string, string>
  inlineHue: number
  isCustomColorDraftValid: boolean
  setInlineColorFieldRef: (element: Element | null) => void
}>()

const emit = defineEmits<{
  "apply-custom-color": []
  "inline-color-field-pointerdown": [event: PointerEvent]
  "update:customColorDraft": [value: string]
  "hue-input": [event: Event]
}>()

const customColorDraftModel = computed({
  get: () => props.customColorDraft,
  set: (value: string) => {
    emit("update:customColorDraft", value)
  },
})
</script>

<style scoped lang="scss">
.section-heading__kicker {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--panel-text-subtle);
}

.custom-color-panel__description {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--panel-text-subtle);
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
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.custom-color-apply:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    var(--panel-primary-button-shadow-hover),
    var(--panel-hover-shadow);
}

.custom-color-apply:disabled {
  opacity: 0.58;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 520px) {
  .custom-color-panel__controls {
    grid-template-columns: 1fr;
  }
}
</style>
