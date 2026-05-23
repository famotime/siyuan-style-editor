<template>
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
        :aria-label="presetPaletteToggleLabel"
        :aria-expanded="isPresetPaletteSectionExpanded"
        @click="emit('toggle-preset-palette-section')"
      >
        <span
          class="inline-palette-panel__toggle-icon"
          :class="{ 'inline-palette-panel__toggle-icon--collapsed': !isPresetPaletteSectionExpanded }"
          aria-hidden="true"
        >
          <span class="inline-palette-panel__toggle-bar inline-palette-panel__toggle-bar--top" />
          <span class="inline-palette-panel__toggle-bar inline-palette-panel__toggle-bar--bottom" />
        </span>
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
        <div
          v-for="palette in presetPaletteCollections"
          :key="palette.id"
          class="preset-palette-tab-frame"
          :class="{ 'preset-palette-tab-frame--custom': isCustomPresetPalette(palette) }"
        >
          <button
            type="button"
            class="preset-palette-tab"
            :class="{ 'preset-palette-tab--active': activePresetPaletteId === palette.id }"
            :style="getPresetPaletteTabStyle(palette)"
            role="tab"
            :aria-selected="activePresetPaletteId === palette.id"
            :tabindex="activePresetPaletteId === palette.id ? 0 : -1"
            @click="emit('select-preset-palette-tab', palette.id)"
            @dblclick.stop="emit('apply-preset-palette-sequence', palette.id)"
          >
            <span class="preset-palette-tab__name">{{ palette.label }}</span>
            <span class="preset-palette-tab__count">{{ palette.colors.length }} 色</span>
          </button>

          <div
            v-if="isCustomPresetPalette(palette)"
            class="preset-palette-tab__actions"
          >
            <button
              v-if="pendingDeletePaletteId !== palette.id"
              type="button"
              class="preset-palette-tab__delete"
              :aria-label="`删除色卡 ${palette.label}`"
              title="删除色卡"
              @click.stop="requestDeletePalette(palette.id)"
            >
              <span
                class="preset-palette-tab__delete-icon"
                aria-hidden="true"
              >
                <span class="preset-palette-tab__delete-lid" />
                <span class="preset-palette-tab__delete-body" />
              </span>
            </button>
            <div
              v-else
              class="preset-palette-tab__delete-confirmation"
            >
              <button
                type="button"
                class="preset-palette-tab__delete-confirm"
                @click.stop="confirmDeletePalette(palette.id)"
              >
                确认
              </button>
              <button
                type="button"
                class="preset-palette-tab__delete-cancel"
                @click.stop="cancelDeletePalette"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="swatch-grid swatch-grid--inline">
        <button
          v-for="color in activePresetPalette.colors"
          :key="color.value"
          type="button"
          class="swatch-chip"
          :aria-label="color.label"
          :class="{ 'swatch-chip--active': selectedSwatch === color.value }"
          :style="{
            '--swatch-color': color.value, 'borderWidth': '0',
          }"
          @click="emit('select-preset-color', color.value)"
        >
          <span
            class="swatch-chip__dot"
            :style="{ borderWidth: '1px' }"
          />
        </button>
        <button
          type="button"
          class="swatch-chip swatch-chip--clear"
          aria-label="恢复默认颜色"
          :class="{ 'swatch-chip--active': !selectedSwatch }"
          :style="{ borderWidth: '0' }"
          @click="emit('clear-selected-target-color')"
        >
          <span
            class="swatch-chip__dot swatch-chip__dot--clear"
            :style="{ borderWidth: '1px' }"
          >
            <span class="swatch-chip__dot-clear-surface" />
            <span class="swatch-chip__dot-clear-slash" />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from "vue"

import { buildPresetPaletteCardBackground } from "@/lib/preset-palette-catalog"

interface PaletteColor {
  label: string
  value: string
}

interface PaletteCollection {
  colors: PaletteColor[]
  id: string
  label: string
}

const props = defineProps<{
  activePresetPalette: PaletteCollection
  activePresetPaletteId: string
  isPresetPaletteSectionExpanded: boolean
  presetPaletteCollections: PaletteCollection[]
  selectedSwatch: string
}>()

const emit = defineEmits<{
  "apply-preset-palette-sequence": [paletteId: string]
  "clear-selected-target-color": []
  "delete-preset-palette": [paletteId: string]
  "select-preset-color": [color: string]
  "select-preset-palette-tab": [paletteId: string]
  "toggle-preset-palette-section": []
}>()

const pendingDeletePaletteId = ref("")

const presetPaletteToggleLabel = computed(() => {
  return props.isPresetPaletteSectionExpanded ? "折叠预设配色" : "展开预设配色"
})

function getPresetPaletteTabStyle(palette: PaletteCollection) {
  return {
    "--preset-palette-gradient": buildPresetPaletteCardBackground(palette.colors),
    "borderWidth": "0",
  }
}

function isCustomPresetPalette(palette: PaletteCollection) {
  return palette.id.startsWith("custom-palette-")
}

function requestDeletePalette(paletteId: string) {
  pendingDeletePaletteId.value = paletteId
}

function cancelDeletePalette() {
  pendingDeletePaletteId.value = ""
}

function confirmDeletePalette(paletteId: string) {
  emit("delete-preset-palette", paletteId)
  if (pendingDeletePaletteId.value === paletteId) {
    pendingDeletePaletteId.value = ""
  }
}

watch(
  () => props.presetPaletteCollections.map((palette) => palette.id),
  (paletteIds) => {
    if (!paletteIds.includes(pendingDeletePaletteId.value)) {
      pendingDeletePaletteId.value = ""
    }
  },
)
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

.inline-palette-panel__presets {
  display: grid;
  gap: 10px;
}

.inline-palette-panel__presets-body {
  display: grid;
  gap: 10px;
}

.inline-palette-panel__subhead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.inline-palette-panel__toggle,
.swatch-chip {
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.inline-palette-panel__toggle {
  position: relative;
  width: 38px;
  min-width: 38px;
  min-height: 38px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1.5px solid color-mix(in srgb, var(--panel-card-stroke) 76%, var(--panel-text-subtle) 24%);
  background: var(--panel-pill-bg);
  color: var(--panel-text-muted);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-card-bg) 20%, transparent 80%);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.inline-palette-panel__toggle:hover,
.inline-palette-panel__toggle:focus-visible,
.swatch-chip:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.inline-palette-panel__toggle-icon {
  position: relative;
  width: 14px;
  height: 14px;
  display: inline-block;
}

.inline-palette-panel__toggle-bar {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 1.75px;
  border-radius: 999px;
  background: currentColor;
  transform-origin: center;
  transition: transform 160ms ease;
}

.inline-palette-panel__toggle-bar--top {
  top: 4px;
  transform: translateX(-50%) rotate(35deg);
}

.inline-palette-panel__toggle-bar--bottom {
  top: 8px;
  transform: translateX(-50%) rotate(-35deg);
}

.inline-palette-panel__toggle-icon--collapsed .inline-palette-panel__toggle-bar--top {
  transform: translateX(-50%) rotate(-35deg);
}

.inline-palette-panel__toggle-icon--collapsed .inline-palette-panel__toggle-bar--bottom {
  transform: translateX(-50%) rotate(35deg);
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

.preset-palette-tab-frame {
  position: relative;
}

.preset-palette-tab {
  appearance: none;
  width: 100%;
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border: 0;
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
  color: white;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 0 0 1px color-mix(in srgb, var(--panel-accent-outline) 58%, transparent 42%),
    0 16px 28px rgba(15, 23, 42, 0.22);
}

.preset-palette-tab-frame--custom .preset-palette-tab {
  padding-right: 56px;
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

.preset-palette-tab__actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
}

.preset-palette-tab__delete,
.preset-palette-tab__delete-confirm,
.preset-palette-tab__delete-cancel {
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(9, 12, 18, 0.28);
  color: rgba(255, 255, 255, 0.92);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 140ms ease,
    background-color 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease;
  backdrop-filter: blur(8px);
}

.preset-palette-tab__delete {
  width: 24px;
  padding: 0;
  justify-content: center;
}

.preset-palette-tab__delete-icon {
  position: relative;
  display: inline-block;
  width: 12px;
  height: 13px;
}

.preset-palette-tab__delete-lid,
.preset-palette-tab__delete-body {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.preset-palette-tab__delete-lid {
  top: 1px;
  width: 10px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.preset-palette-tab__delete-lid::before {
  content: "";
  position: absolute;
  top: -2px;
  left: 50%;
  width: 5px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  transform: translateX(-50%);
}

.preset-palette-tab__delete-body {
  top: 4px;
  width: 9px;
  height: 8px;
  border: 1.5px solid currentColor;
  border-top-width: 2px;
  border-radius: 0 0 3px 3px;
  box-sizing: border-box;
}

.preset-palette-tab__delete-body::before,
.preset-palette-tab__delete-body::after {
  content: "";
  position: absolute;
  top: 1px;
  bottom: 1px;
  width: 1px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.9;
}

.preset-palette-tab__delete-body::before {
  left: 2px;
}

.preset-palette-tab__delete-body::after {
  right: 2px;
}

.preset-palette-tab__delete-confirmation {
  display: flex;
  align-items: center;
  gap: 6px;
}

.preset-palette-tab__delete:hover,
.preset-palette-tab__delete-confirm:hover,
.preset-palette-tab__delete-cancel:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
}

.swatch-grid {
  display: grid;
}

.swatch-grid--inline {
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

.swatch-chip {
  appearance: none;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--panel-text-muted);
  cursor: pointer;
  aspect-ratio: 1;
}

.swatch-chip--active {
  background: color-mix(in srgb, var(--panel-chip-active-bg) 58%, transparent 42%);
}

.swatch-chip__dot {
  flex: none;
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid var(--panel-dot-border);
  background: var(--swatch-color);
  overflow: hidden;
  box-sizing: border-box;
  box-shadow:
    0 0 0 1px var(--panel-swatch-dot-ring),
    0 0 0 2px color-mix(in srgb, var(--panel-card-bg) 72%, transparent 28%),
    var(--panel-swatch-dot-shadow),
    0 0 0 1px color-mix(in srgb, var(--panel-card-bg) 24%, transparent 76%);
}

.swatch-chip__dot--clear {
  border-color: var(--panel-dot-border);
  background: transparent;
  box-shadow:
    0 0 0 1px var(--panel-swatch-dot-ring),
    0 0 0 2px color-mix(in srgb, var(--panel-card-bg) 72%, transparent 28%),
    var(--panel-swatch-dot-shadow),
    0 0 0 1px color-mix(in srgb, var(--panel-card-bg) 30%, transparent 70%),
    0 1px 2px rgba(15, 23, 42, 0.12);
}

.swatch-chip--clear {
  background: transparent;
}

.swatch-chip--clear.swatch-chip--active {
  background: color-mix(in srgb, var(--panel-chip-active-bg) 72%, transparent 28%);
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

@media (max-width: 520px) {
  .inline-palette-panel__subhead {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
