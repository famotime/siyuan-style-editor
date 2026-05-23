<template>
  <section class="target-studio">
    <div class="target-studio__header">
      <div>
        <h2 class="section-heading__title" data-tooltip="Custom Colors — 为标题、加粗、引用等元素定制颜色与样式">
          基础粉刷
        </h2>
      </div>
      <div class="target-studio__header-actions">
        <div class="target-studio__save-wrap">
          <button
            v-if="!isSaveFormVisible"
            type="button"
            class="target-studio__save"
            aria-label="保存当前配色为色卡"
            data-tooltip="保存当前配色"
            title="保存当前配色为色卡"
            @click="openSaveForm"
          >
            <span
              class="target-studio__save-icon"
              aria-hidden="true"
            >
              <span class="target-studio__save-icon-body" />
              <span class="target-studio__save-icon-notch" />
              <span class="target-studio__save-icon-label" />
            </span>
          </button>
          <form
            v-else
            class="target-studio__save-form"
            @submit.prevent="submitSaveForm"
          >
            <input
              ref="saveInputRef"
              v-model="savePaletteName"
              type="text"
              class="target-studio__save-input"
              maxlength="40"
              placeholder="输入色卡名称"
              @keydown.esc.prevent="closeSaveForm"
            >
            <button
              type="submit"
              class="target-studio__save-confirm"
              :disabled="!savePaletteName.trim()"
            >
              确认
            </button>
            <button
              type="button"
              class="target-studio__save-cancel"
              @click="closeSaveForm"
            >
              取消
            </button>
          </form>
        </div>
        <button
          type="button"
          class="panel-collapse-btn"
          :aria-label="collapsed ? '展开面板' : '折叠面板'"
          :title="collapsed ? '展开面板' : '折叠面板'"
          @click="collapsed = !collapsed"
        >
          <svg
            class="panel-collapse-btn__icon"
            :class="{ 'panel-collapse-btn__icon--collapsed': collapsed }"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-show="!collapsed"
      class="target-grid"
    >
      <article
        v-for="target in styleTargetOptions"
        :key="target.value"
        class="target-preview-card"
        :class="{ 'target-preview-card--selected': selectedTarget === target.value }"
      >
        <button
          type="button"
          class="target-preview-card__surface"
          :style="getTargetPreviewStyle(target.value)"
          @click="emit('select-target', target.value)"
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
            :class="{
              'channel-orb--active': selectedTarget === target.value && selectedChannel === 'color' && isInlinePaletteOpenForTarget(target.value),
              'channel-orb--drag-source': isDragSourceOrb(target.value, 'color'),
              'channel-orb--drop-target': isDropTargetOrb(target.value, 'color'),
            }"
            @mousedown="handleOrbMouseDown(target.value, 'color', $event)"
            @mouseenter="handleOrbMouseEnter(target.value, 'color')"
            @mouseleave="handleOrbMouseLeave(target.value, 'color')"
            @click="handleOrbClick(target.value, 'color', $event)"
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
            :class="{
              'channel-orb--active': selectedTarget === target.value && selectedChannel === 'backgroundColor' && isInlinePaletteOpenForTarget(target.value),
              'channel-orb--drag-source': isDragSourceOrb(target.value, 'backgroundColor'),
              'channel-orb--drop-target': isDropTargetOrb(target.value, 'backgroundColor'),
            }"
            @mousedown="handleOrbMouseDown(target.value, 'backgroundColor', $event)"
            @mouseenter="handleOrbMouseEnter(target.value, 'backgroundColor')"
            @mouseleave="handleOrbMouseLeave(target.value, 'backgroundColor')"
            @click="handleOrbClick(target.value, 'backgroundColor', $event)"
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

    <div
      v-if="!collapsed && floatingOrbPreview"
      class="target-studio__drag-preview"
      :style="{
        left: `${floatingOrbPreview.x}px`,
        top: `${floatingOrbPreview.y}px`,
      }"
    >
      <span
        class="target-studio__drag-preview-swatch"
        :class="{ 'target-studio__drag-preview-swatch--empty': floatingOrbPreview.isEmpty }"
        :style="{ '--drag-orb-fill': floatingOrbPreview.background }"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StyleTarget } from "@/lib/style-profile"
import type { PaintChannel } from "@/style-editor-runtime"

import {
  nextTick,
  ref,
} from "vue"

import { useTargetOrbDragSession } from "@/composables/use-target-orb-drag-session"

const props = defineProps<{
  getChannelSwatch: (target: StyleTarget, channel: PaintChannel) => ChannelSwatch
  getTargetPreviewStyle: (target: StyleTarget) => Record<string, string>
  isInlinePaletteOpenForTarget: (target: StyleTarget) => boolean
  selectedChannel: PaintChannel
  selectedTarget: StyleTarget
  styleTargetOptions: StyleTargetOption[]
}>()

const emit = defineEmits<{
  "activate-channel": [payload: { channel: PaintChannel, event: MouseEvent, target: StyleTarget }]
  "save-preset-palette": [name: string]
  "select-target": [target: StyleTarget]
  "swap-channel-value": [
    source: { channel: PaintChannel, target: StyleTarget },
    target: { channel: PaintChannel, target: StyleTarget },
  ]
}>()

const collapsed = ref(false)

interface StyleTargetOption {
  hint: string
  label: string
  shortLabel: string
  value: StyleTarget
}

interface ChannelSwatch {
  background: string
  isEmpty: boolean
}

const isSaveFormVisible = ref(false)
const saveInputRef = ref<HTMLInputElement | null>(null)
const savePaletteName = ref("")
const {
  floatingOrbPreview,
  handleOrbClick,
  handleOrbMouseDown,
  handleOrbMouseEnter,
  handleOrbMouseLeave,
  isDragSourceOrb,
  isDropTargetOrb,
} = useTargetOrbDragSession({
  getChannelSwatch: props.getChannelSwatch,
  onActivateChannel: (payload) => emit("activate-channel", payload),
  onSwapChannelValue: (source, target) => emit("swap-channel-value", source, target),
})

async function openSaveForm() {
  isSaveFormVisible.value = true
  await nextTick()
  saveInputRef.value?.focus()
}

function closeSaveForm() {
  isSaveFormVisible.value = false
  savePaletteName.value = ""
}

function submitSaveForm() {
  const trimmedName = savePaletteName.value.trim()
  if (!trimmedName) {
    return
  }

  emit("save-preset-palette", trimmedName)
  closeSaveForm()
}
</script>

<style scoped lang="scss">
.target-studio {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid var(--panel-divider);
  background: var(--panel-toolbar-bg);
  box-shadow: var(--panel-toolbar-shadow);
}

.target-studio__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  margin: -14px -14px 0;
  border-radius: 20px 20px 0 0;
  background: color-mix(in srgb, var(--panel-chip-active-bg) 40%, transparent 60%);
}

.target-studio__header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.target-studio__save-wrap {
  display: flex;
  align-items: center;
}

.section-heading__title {
  position: relative;
  margin: 0;
  font-size: 20px;
  line-height: 1.1;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  color: var(--panel-text);
  cursor: help;
}

.section-heading__title[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-2px);
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--panel-text);
  color: var(--panel-card-bg);
  font-size: 11px;
  font-weight: 500;
  font-family: system-ui, sans-serif;
  line-height: 1.4;
  white-space: normal;
  max-width: 260px;
  z-index: 100;
  transition: opacity 140ms ease, transform 140ms ease;
}

.section-heading__title[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateY(0);
}

.panel-collapse-btn {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 8px;
  background: color-mix(in srgb, var(--panel-pill-bg) 74%, transparent 26%);
  color: var(--panel-text-muted);
  cursor: pointer;
  transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.panel-collapse-btn:hover {
  color: var(--panel-text);
  background: var(--panel-chip-active-bg);
  transform: translateY(-1px);
}

.panel-collapse-btn__icon {
  transition: transform 200ms ease;
}

.panel-collapse-btn__icon--collapsed {
  transform: rotate(-90deg);
}

.target-studio__note {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--panel-text-subtle);
}

.target-studio__save {
  position: relative;
  width: auto;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--panel-text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.target-studio__save::before,
.target-studio__save::after {
  position: absolute;
  left: 50%;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.target-studio__save::before {
  content: "";
  bottom: calc(100% + 2px);
  transform: translateX(-50%) translateY(4px);
  border-width: 5px 5px 0;
  border-style: solid;
  border-color: var(--panel-text) transparent transparent;
}

.target-studio__save::after {
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

.target-studio__save:hover {
  color: var(--panel-text);
}

.target-studio__save:hover::before,
.target-studio__save:hover::after,
.target-studio__save:focus-visible::before,
.target-studio__save:focus-visible::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.target-studio__save-icon {
  position: relative;
  width: 18px;
  height: 18px;
  display: inline-block;
}

.target-studio__save-icon-body,
.target-studio__save-icon-notch,
.target-studio__save-icon-label {
  position: absolute;
  box-sizing: border-box;
}

.target-studio__save-icon-body {
  inset: 1px;
  border: 1.5px solid currentColor;
  border-radius: 3px;
  background: color-mix(in srgb, currentColor 10%, transparent 90%);
}

.target-studio__save-icon-notch {
  top: 3px;
  right: 3px;
  width: 4px;
  height: 4px;
  border-radius: 1px;
  background: currentColor;
}

.target-studio__save-icon-label {
  left: 50%;
  bottom: 3px;
  width: 8px;
  height: 4px;
  transform: translateX(-50%);
  border-radius: 1px;
  border: 1.5px solid currentColor;
  background: transparent;
}

.target-studio__save-form {
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-studio__save-input {
  width: 140px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--panel-card-stroke);
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel-card-bg) 82%, white 18%);
  color: var(--panel-text);
  font: inherit;
}

.target-studio__save-input::placeholder {
  color: var(--panel-text-subtle);
}

.target-studio__save-confirm,
.target-studio__save-cancel {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    opacity 160ms ease;
}

.target-studio__save-confirm {
  border: 1px solid var(--panel-accent-outline);
  background: var(--panel-chip-active-bg);
  color: var(--panel-accent);
}

.target-studio__save-cancel {
  border: 1px solid var(--panel-card-stroke);
  background: color-mix(in srgb, var(--panel-pill-bg) 76%, transparent 24%);
  color: var(--panel-text);
}

.target-studio__save-confirm:hover,
.target-studio__save-cancel:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.target-studio__save-confirm:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
  box-shadow: none;
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
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.target-preview-card__surface:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.target-preview-card__title {
  margin: 0;
  color: inherit;
  font-size: 16px;
  line-height: 1.18;
}

.target-preview-card__eyebrow {
  margin: 0;
  color: inherit;
  opacity: 0.72;
}

.target-preview-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
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
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.channel-orb:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.channel-orb--drag-source {
  opacity: 0.32;
  transform: scale(0.94);
}

.channel-orb--active {
  background: var(--panel-chip-active-bg);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--panel-accent) 34%, transparent 66%),
    0 8px 18px color-mix(in srgb, var(--panel-accent-soft) 42%, transparent 58%);
}

.channel-orb--drop-target {
  background: color-mix(in srgb, var(--panel-chip-active-bg) 82%, white 18%);
  box-shadow:
    inset 0 0 0 2px color-mix(in srgb, var(--panel-accent) 56%, transparent 44%),
    0 0 0 4px color-mix(in srgb, var(--panel-accent-soft) 26%, transparent 74%),
    0 12px 24px color-mix(in srgb, var(--panel-accent-soft) 32%, transparent 68%);
  transform: scale(1.08);
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

.channel-orb__swatch {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid var(--panel-dot-border);
  background: var(--orb-fill);
}

.channel-orb__swatch--empty {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-text-subtle) 22%, transparent 78%);
}

.target-studio__drag-preview {
  position: fixed;
  z-index: 30;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.target-studio__drag-preview-swatch {
  width: 24px;
  height: 24px;
  display: inline-block;
  border-radius: 999px;
  border: 1px solid var(--panel-dot-border);
  background: var(--drag-orb-fill);
  box-shadow:
    0 10px 24px color-mix(in srgb, var(--panel-accent-soft) 24%, transparent 76%),
    0 0 0 6px color-mix(in srgb, white 22%, transparent 78%);
}

.target-studio__drag-preview-swatch--empty {
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--panel-text-subtle) 22%, transparent 78%),
    0 10px 24px color-mix(in srgb, var(--panel-accent-soft) 24%, transparent 76%),
    0 0 0 6px color-mix(in srgb, white 22%, transparent 78%);
}

@media (max-width: 720px) {
  .target-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .target-studio {
    padding: 14px;
  }

  .target-studio__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .target-studio__header-actions,
  .target-studio__save-form {
    width: 100%;
  }

  .target-studio__save-input,
  .target-studio__save-confirm,
  .target-studio__save-cancel {
    width: 100%;
  }

  .target-studio__save-form {
    flex-wrap: wrap;
  }
}
</style>
