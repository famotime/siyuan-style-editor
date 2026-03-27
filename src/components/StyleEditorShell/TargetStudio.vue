<template>
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
      <div class="target-studio__header-actions">
        <p class="target-studio__note">
          {{ styleTargetOptions.length }} 个对象
        </p>
        <button
          type="button"
          class="target-studio__save"
          @click="emit('save-preset-palette')"
        >
          保存
        </button>
      </div>
    </div>

    <div class="target-grid">
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
            :class="{ 'channel-orb--active': selectedTarget === target.value && selectedChannel === 'color' && isInlinePaletteOpenForTarget(target.value) }"
            @click="emit('activate-channel', { channel: 'color', event: $event, target: target.value })"
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
            :class="{ 'channel-orb--active': selectedTarget === target.value && selectedChannel === 'backgroundColor' && isInlinePaletteOpenForTarget(target.value) }"
            @click="emit('activate-channel', { channel: 'backgroundColor', event: $event, target: target.value })"
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
</template>

<script setup lang="ts">
import type { PaintChannel } from "@/style-editor-runtime";
import type { StyleTarget } from "@/lib/style-profile";

interface StyleTargetOption {
  hint: string;
  label: string;
  shortLabel: string;
  value: StyleTarget;
}

interface ChannelSwatch {
  background: string;
  isEmpty: boolean;
}

defineProps<{
  getChannelSwatch: (target: StyleTarget, channel: PaintChannel) => ChannelSwatch;
  getTargetPreviewStyle: (target: StyleTarget) => Record<string, string>;
  isInlinePaletteOpenForTarget: (target: StyleTarget) => boolean;
  selectedChannel: PaintChannel;
  selectedTarget: StyleTarget;
  styleTargetOptions: StyleTargetOption[];
}>();

const emit = defineEmits<{
  "activate-channel": [payload: { channel: PaintChannel; event: MouseEvent; target: StyleTarget }];
  "save-preset-palette": [];
  "select-target": [target: StyleTarget];
}>();
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
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.target-studio__header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-heading__kicker {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--panel-text-subtle);
}

.section-heading__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.1;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  color: var(--panel-text);
}

.target-studio__note {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--panel-text-subtle);
}

.target-studio__save {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--panel-card-stroke);
  border-radius: 999px;
  background: var(--panel-pill-bg);
  color: var(--panel-text);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.target-studio__save:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
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
}
</style>
