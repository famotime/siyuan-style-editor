<template>
  <div
    class="style-editor-shell"
    :style="panelThemeVars"
  >
    <section class="style-card style-card--hero">
      <p class="style-editor-shell__eyebrow">
        Live Document Styling
      </p>
      <h1 class="style-editor-shell__title">
        文档样式编辑器
      </h1>
      <p class="style-editor-shell__lead">
        直接在面板里选择目标和颜色。每一次点击都会立刻更新当前思源界面的文档显示，不再依赖模板文档读取。
      </p>
      <div class="style-editor-shell__status">
        <span class="status-pill status-pill--live">实时生效</span>
        <span class="style-editor-shell__status-copy">
          {{ selectedTargetMeta.hint }}
        </span>
      </div>
    </section>

    <section class="style-card">
      <div class="section-heading">
        <div>
          <p class="section-heading__kicker">
            Palette
          </p>
          <h2 class="section-heading__title">
            颜色板
          </h2>
        </div>
        <div class="target-badge">
          {{ selectedTargetMeta.label }}
        </div>
      </div>

      <div class="channel-row">
        <button
          type="button"
          class="channel-chip"
          :class="{ 'channel-chip--active': runtimeState.selectedChannel === 'color' }"
          @click="selectChannel('color')"
        >
          前景色
        </button>
        <button
          type="button"
          class="channel-chip"
          :class="{ 'channel-chip--active': runtimeState.selectedChannel === 'backgroundColor' }"
          @click="selectChannel('backgroundColor')"
        >
          背景色
        </button>
      </div>

      <div class="target-grid">
        <button
          v-for="target in STYLE_TARGET_OPTIONS"
          :key="target.value"
          type="button"
          class="target-chip"
          :class="{ 'target-chip--active': runtimeState.selectedTarget === target.value }"
          @click="selectTarget(target.value)"
        >
          <span class="target-chip__short">{{ target.shortLabel }}</span>
          <span class="target-chip__label">{{ target.label }}</span>
        </button>
      </div>

      <div class="custom-color-panel">
        <div class="custom-color-panel__copy">
          <p class="section-heading__kicker">
            Custom Color
          </p>
          <p class="custom-color-panel__description">
            通过调色板自由选择{{ selectedChannelLabel }}，也可以输入十六进制颜色值。
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
            应用自定义色
          </button>
        </div>
      </div>

      <div class="preset-section-heading">
        <div>
          <p class="section-heading__kicker">
            Presets
          </p>
          <p class="preset-section-heading__copy">
            当前候选色保留为预置色卡，后续可以继续扩充。
          </p>
        </div>
      </div>

      <div class="palette-grid">
        <button
          v-for="color in activePalette"
          :key="color.value"
          type="button"
          class="palette-chip"
          :class="{ 'palette-chip--active': selectedSwatch === color.value }"
          :style="{ '--swatch-color': color.value }"
          @click="applyPaletteColor(color.value)"
        >
          <span class="palette-chip__dot" />
          <span>{{ color.label }}</span>
        </button>
        <button
          type="button"
          class="palette-chip palette-chip--clear"
          @click="clearSelectedTargetColor"
        >
          清除颜色
        </button>
      </div>
    </section>

    <section class="style-card style-card--preview">
      <div class="section-heading">
        <div>
          <p class="section-heading__kicker">
            Preview
          </p>
          <h2 class="section-heading__title">
            已应用样式
          </h2>
        </div>
        <span class="preview-note">
          面板修改后会立即同步到所有已打开的文档界面
        </span>
      </div>

      <div class="preview-list">
        <article
          v-for="target in STYLE_TARGET_OPTIONS"
          :key="target.value"
          class="preview-item"
          :style="getPreviewStyle(target.value)"
        >
          <p class="preview-item__eyebrow">
            {{ target.shortLabel }}
          </p>
          <p class="preview-item__content">
            {{ target.label }}
          </p>
          <code class="preview-item__value">{{ getPreviewValue(target.value, "color") }}</code>
          <code class="preview-item__value">{{ getPreviewValue(target.value, "backgroundColor") }}</code>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

import {
  applyPaletteColor,
  BACKGROUND_PALETTE,
  clearSelectedTargetColor,
  FOREGROUND_PALETTE,
  runtimeState,
  selectChannel,
  selectTarget,
  STYLE_TARGET_OPTIONS,
} from "@/style-editor-runtime";
import {
  createDefaultCustomColor,
  normalizeHexColor,
  resolveColorPickerValue,
} from "@/lib/custom-color";
import {
  createPanelThemeVars,
  resolvePanelThemeAppearance,
} from "@/lib/panel-theme";
import type { StyleTarget } from "@/lib/style-profile";
import type { PaintChannel } from "@/style-editor-runtime";

const themeAppearance = ref(resolvePanelThemeAppearance(undefined, false));

const selectedTargetMeta = computed(() => {
  return STYLE_TARGET_OPTIONS.find(target => target.value === runtimeState.selectedTarget) ?? STYLE_TARGET_OPTIONS[0];
});

const activePalette = computed(() => {
  return runtimeState.selectedChannel === "backgroundColor"
    ? BACKGROUND_PALETTE
    : FOREGROUND_PALETTE;
});

const selectedSwatch = computed(() => {
  return runtimeState.profile[runtimeState.selectedTarget][runtimeState.selectedChannel];
});

const selectedChannelLabel = computed(() => {
  return runtimeState.selectedChannel === "backgroundColor" ? "背景色" : "文字颜色";
});

const customColorDraft = ref(createDefaultCustomColor(runtimeState.selectedChannel));

const colorPickerValue = computed(() => {
  return resolveColorPickerValue(customColorDraft.value, runtimeState.selectedChannel);
});

const customColorPlaceholder = computed(() => {
  return createDefaultCustomColor(runtimeState.selectedChannel);
});

const isCustomColorDraftValid = computed(() => {
  return Boolean(normalizeHexColor(customColorDraft.value));
});

const panelThemeVars = computed(() => {
  return createPanelThemeVars(themeAppearance.value);
});

function syncThemeAppearance() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const root = document.documentElement;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  themeAppearance.value = resolvePanelThemeAppearance(root?.getAttribute("data-theme-mode"), prefersDark);
}

let themeObserver: MutationObserver | null = null;
let mediaQuery: MediaQueryList | null = null;

onMounted(() => {
  syncThemeAppearance();

  if (typeof document !== "undefined") {
    themeObserver = new MutationObserver(syncThemeAppearance);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme-mode"],
    });
  }

  if (typeof window !== "undefined" && window.matchMedia) {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener?.("change", syncThemeAppearance);
  }
});

onBeforeUnmount(() => {
  themeObserver?.disconnect();
  themeObserver = null;

  mediaQuery?.removeEventListener?.("change", syncThemeAppearance);
  mediaQuery = null;
});

watch(
  [() => runtimeState.selectedChannel, selectedSwatch],
  ([channel, swatch], previousValue) => {
    const normalizedSelectedColor = normalizeHexColor(swatch);
    if (normalizedSelectedColor) {
      customColorDraft.value = normalizedSelectedColor;
      return;
    }

    const previousChannel = previousValue?.[0];
    if (!swatch || channel !== previousChannel) {
      customColorDraft.value = createDefaultCustomColor(channel);
    }
  },
  { immediate: true },
);

function handleColorPickerInput(event: Event) {
  const nextColor = (event.target as HTMLInputElement).value;
  void applyCustomColorValue(nextColor);
}

async function applyCustomColorValue(color: string) {
  const normalizedColor = normalizeHexColor(color);
  if (!normalizedColor) {
    return;
  }

  customColorDraft.value = normalizedColor;
  await applyPaletteColor(normalizedColor);
}

async function applyCustomColorDraft() {
  await applyCustomColorValue(customColorDraft.value);
}

function getPreviewStyle(target: StyleTarget) {
  const rule = runtimeState.profile[target];
  return {
    color: rule.color || undefined,
    backgroundColor: rule.backgroundColor || undefined,
    fontWeight: rule.fontWeight || (target === "strong" ? "700" : undefined),
    fontStyle: rule.fontStyle || undefined,
    textDecoration: rule.textDecoration || undefined,
  };
}

function getPreviewValue(target: StyleTarget, channel: PaintChannel) {
  const label = channel === "backgroundColor" ? "底色" : "字色";
  const value = runtimeState.profile[target][channel] || "未设置";
  return `${label}: ${value}`;
}
</script>

<style scoped lang="scss">
.style-editor-shell {
  min-height: 100%;
  padding: 18px;
  display: grid;
  gap: 14px;
  background:
    radial-gradient(circle at top left, var(--panel-glow-a), transparent 30%),
    radial-gradient(circle at bottom right, var(--panel-glow-b), transparent 26%),
    linear-gradient(180deg, var(--panel-sheen), transparent 28%),
    var(--panel-background);
  color: var(--panel-text-muted);
  box-sizing: border-box;
  font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.style-card {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--panel-card-stroke);
  border-radius: 20px;
  background:
    linear-gradient(135deg, var(--panel-glass), transparent 45%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 23px,
      var(--panel-rule-line) 23px,
      var(--panel-rule-line) 24px
    ),
    var(--panel-card-bg);
  box-shadow: var(--panel-shadow);
}

.style-card::after {
  content: "";
  position: absolute;
  inset: 10px;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 14px;
  pointer-events: none;
}

.style-card--hero {
  gap: 12px;
}

.style-card--preview {
  gap: 16px;
}

.style-editor-shell__eyebrow,
.section-heading__kicker,
.preview-item__eyebrow {
  margin: 0;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-size: 11px;
  color: var(--panel-text-subtle);
}

.style-editor-shell__title,
.section-heading__title {
  margin: 0;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--panel-text);
}

.style-editor-shell__title {
  font-size: 28px;
  line-height: 1.1;
}

.style-editor-shell__lead,
.style-editor-shell__status-copy,
.preview-note {
  margin: 0;
  line-height: 1.65;
  font-size: 13px;
}

.style-editor-shell__status {
  display: grid;
  gap: 8px;
}

.status-pill,
.target-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--panel-card-stroke);
  background: var(--panel-pill-bg);
  color: var(--panel-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.status-pill--live {
  background: var(--panel-accent-soft);
  color: var(--panel-accent);
  border-color: var(--panel-accent-outline);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.channel-row,
.custom-color-panel,
.target-grid,
.palette-grid,
.preview-list {
  display: grid;
  gap: 10px;
}

.channel-chip,
.target-chip,
.palette-chip {
  border: 0;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.channel-chip:hover,
.target-chip:hover,
.palette-chip:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.channel-row {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.custom-color-panel {
  padding: 14px;
  border-radius: 18px;
  background:
    linear-gradient(135deg, var(--panel-glass), transparent 60%),
    var(--panel-preview-bg);
  border: 1px solid var(--panel-card-stroke);
}

.custom-color-panel__copy,
.preset-section-heading__copy {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--panel-text-subtle);
}

.custom-color-panel__controls {
  display: grid;
  grid-template-columns: minmax(0, 120px) minmax(0, 1fr) auto;
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
  background: var(--panel-chip-bg);
  color: var(--panel-text-muted);
  border: 1px solid var(--panel-card-stroke);
  cursor: pointer;
}

.color-well__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.color-well__swatch {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid var(--panel-dot-border);
  background: var(--well-color);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
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
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    opacity 120ms ease;
}

.custom-color-apply:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.custom-color-apply:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.preset-section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.channel-chip {
  min-height: 38px;
  border-radius: 999px;
  background: var(--panel-chip-bg);
  color: var(--panel-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.channel-chip--active {
  background: var(--panel-chip-active-bg);
  outline: 1px solid var(--panel-accent-outline);
}

.target-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.target-chip {
  min-height: 58px;
  display: grid;
  align-content: center;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 16px;
  background: var(--panel-chip-bg);
  color: var(--panel-text-muted);
  text-align: left;
}

.target-chip--active {
  background: var(--panel-chip-active-bg);
  outline: 1px solid var(--panel-accent-outline);
}

.target-chip__short {
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  font-size: 16px;
  font-weight: 700;
}

.target-chip__label {
  font-size: 12px;
}

.palette-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.palette-chip {
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--panel-chip-bg);
  color: var(--panel-text-muted);
}

.palette-chip--active {
  outline: 1px solid var(--panel-accent-outline);
}

.palette-chip__dot {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  flex: none;
  border: 1px solid var(--panel-dot-border);
  background: var(--swatch-color);
}

.palette-chip--clear {
  justify-content: center;
  background: var(--panel-clear-bg);
}

.preview-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.preview-item {
  display: grid;
  gap: 6px;
  min-height: 96px;
  padding: 12px;
  border-radius: 16px;
  background: var(--panel-preview-bg);
}

.preview-item__content {
  margin: 0;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  font-size: 19px;
  line-height: 1.25;
}

.preview-item__value {
  font-size: 11px;
  word-break: break-all;
  color: var(--panel-text-subtle);
}

@media (max-width: 420px) {
  .style-editor-shell {
    padding: 12px;
  }

  .target-grid,
  .palette-grid,
  .preview-list {
    grid-template-columns: 1fr;
  }

  .custom-color-panel__controls {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
