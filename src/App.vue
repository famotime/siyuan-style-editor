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
            Direct Styling
          </p>
          <h2 class="section-heading__title">
            对象即预览
          </h2>
        </div>
        <div class="section-heading__actions">
          <div class="target-badge">
            {{ selectedTargetMeta.label }}
          </div>
          <button
            type="button"
            class="reset-styles-button"
            @click="handleResetAllStyles"
          >
            清除样式
          </button>
        </div>
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
            <p class="target-preview-card__hint">
              {{ target.hint }}
            </p>
          </button>

          <div class="target-preview-card__actions">
            <button
              type="button"
              class="channel-orb"
              :class="{ 'channel-orb--active': runtimeState.selectedTarget === target.value && runtimeState.selectedChannel === 'color' && isInlinePaletteOpenForTarget(target.value) }"
              @click="activateTargetChannel(target.value, 'color')"
            >
              <span
                class="channel-orb__swatch"
                :class="{ 'channel-orb__swatch--empty': getChannelSwatch(target.value, 'color').isEmpty }"
                :style="{ '--orb-fill': getChannelSwatch(target.value, 'color').background }"
              />
              <span class="channel-orb__label">字</span>
            </button>

            <button
              type="button"
              class="channel-orb"
              :class="{ 'channel-orb--active': runtimeState.selectedTarget === target.value && runtimeState.selectedChannel === 'backgroundColor' && isInlinePaletteOpenForTarget(target.value) }"
              @click="activateTargetChannel(target.value, 'backgroundColor')"
            >
              <span
                class="channel-orb__swatch"
                :class="{ 'channel-orb__swatch--empty': getChannelSwatch(target.value, 'backgroundColor').isEmpty }"
                :style="{ '--orb-fill': getChannelSwatch(target.value, 'backgroundColor').background }"
              />
              <span class="channel-orb__label">底</span>
            </button>
          </div>

          <div
            v-if="isInlinePaletteOpenForTarget(target.value)"
            class="inline-palette-panel"
          >
            <div class="inline-palette-panel__header">
              <div>
                <p class="section-heading__kicker">
                  Inline Palette
                </p>
                <p class="inline-palette-panel__copy">
                  正在编辑 {{ target.label }} 的{{ selectedChannelLabel }}
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
                  使用调色板或十六进制颜色，修改会立即反映在当前对象卡片上。
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

            <div class="inline-palette-panel__presets">
              <div class="inline-palette-panel__subhead">
                <div>
                  <p class="section-heading__kicker">
                    Presets
                  </p>
                  <p class="inline-palette-panel__copy">
                    纯色预置直接应用到当前对象。
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
                  @click="applyPaletteColor(color.value)"
                >
                  <span class="swatch-chip__dot" />
                  <span class="swatch-chip__label">{{ color.label }}</span>
                </button>
                <button
                  type="button"
                  class="swatch-chip swatch-chip--clear"
                  :class="{ 'swatch-chip--active': !selectedSwatch }"
                  @click="clearSelectedTargetColor"
                >
                  <span class="swatch-chip__dot swatch-chip__dot--clear" />
                  <span class="swatch-chip__label">默认</span>
                </button>
              </div>
            </div>
          </div>
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
  resetAllStyles,
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
  closeInlinePalette,
  isInlinePaletteOpen,
  toggleInlinePalette,
} from "@/lib/inline-palette";
import {
  createPanelThemeVars,
  resolvePanelThemeAppearance,
} from "@/lib/panel-theme";
import {
  buildChannelSwatchStyle,
  buildTargetPreviewStyle,
} from "@/lib/target-preview";
import type { PaintChannel } from "@/style-editor-runtime";
import type { StyleTarget } from "@/lib/style-profile";

const themeAppearance = ref(resolvePanelThemeAppearance(undefined, false));
const inlinePaletteState = ref(closeInlinePalette());

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
  [() => runtimeState.selectedTarget, () => runtimeState.selectedChannel, selectedSwatch],
  ([, channel, swatch], previousValue) => {
    const normalizedSelectedColor = normalizeHexColor(swatch);
    if (normalizedSelectedColor) {
      customColorDraft.value = normalizedSelectedColor;
      return;
    }

    const previousChannel = previousValue?.[1];
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

async function handleResetAllStyles() {
  inlinePaletteState.value = closeInlinePalette();
  await resetAllStyles();
}

function activateTargetChannel(target: StyleTarget, channel: PaintChannel) {
  selectTarget(target);
  selectChannel(channel);
  inlinePaletteState.value = toggleInlinePalette(inlinePaletteState.value, target, channel);
}

function selectPreviewTarget(target: StyleTarget) {
  selectTarget(target);
  inlinePaletteState.value = closeInlinePalette();
}

function closeInlinePalettePanel() {
  inlinePaletteState.value = closeInlinePalette();
}

function isInlinePaletteOpenForTarget(target: StyleTarget) {
  return isInlinePaletteOpen(inlinePaletteState.value, target);
}

function getTargetPreviewStyle(target: StyleTarget) {
  return buildTargetPreviewStyle(target, runtimeState.profile[target], "var(--panel-text)");
}

function getChannelSwatch(target: StyleTarget, channel: PaintChannel) {
  const value = runtimeState.profile[target][channel];
  const fallbackColor = channel === "color"
    ? "var(--panel-text)"
    : "linear-gradient(135deg, var(--panel-preview-bg), var(--panel-card-bg))";

  return buildChannelSwatchStyle(value, fallbackColor);
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

.style-editor-shell__eyebrow,
.section-heading__kicker,
.target-preview-card__eyebrow {
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
.style-editor-shell__status-copy {
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

.reset-styles-button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--b3-card-error-color) 40%, var(--panel-card-stroke) 60%);
  border-radius: 999px;
  background: color-mix(in srgb, var(--b3-card-error-background) 28%, var(--panel-pill-bg) 72%);
  color: color-mix(in srgb, var(--b3-card-error-color) 78%, var(--panel-text) 22%);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.reset-styles-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-heading__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-color-panel,
.target-grid,
.swatch-grid {
  display: grid;
  gap: 10px;
}

.target-preview-card__surface,
.channel-orb,
.swatch-chip {
  border: 0;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.target-preview-card__surface:hover,
.channel-orb:hover,
.swatch-chip:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.custom-color-panel {
  padding: 14px;
  border-radius: 18px;
  background:
    linear-gradient(135deg, var(--panel-glass), transparent 60%),
    var(--panel-preview-bg);
  border: 1px solid var(--panel-card-stroke);
}

.custom-color-panel--inline {
  background:
    linear-gradient(135deg, var(--panel-glass), transparent 72%),
    var(--panel-card-bg);
}

.custom-color-panel__copy {
  display: grid;
  gap: 4px;
}

.custom-color-panel__description,
.inline-palette-panel__copy {
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

.target-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.target-preview-card {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 18px;
  background: var(--panel-chip-bg);
  border: 1px solid transparent;
}

.target-preview-card--selected {
  border-color: var(--panel-accent-outline);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-accent) 24%, transparent 76%);
}

.target-preview-card__surface {
  display: grid;
  gap: 6px;
  min-height: 120px;
  padding: 14px;
  border-radius: 16px;
  text-align: left;
  background: var(--panel-preview-bg);
  border: 1px solid var(--panel-card-inner-stroke);
  align-content: center;
}

.target-preview-card__title {
  margin: 0;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  font-size: 19px;
  line-height: 1.25;
}

.target-preview-card__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: color-mix(in srgb, currentColor 72%, var(--panel-text-subtle) 28%);
}

.target-preview-card__actions {
  display: flex;
  gap: 10px;
}

.inline-palette-panel {
  display: grid;
  gap: 12px;
  padding-top: 2px;
}

.inline-palette-panel__header,
.inline-palette-panel__subhead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.inline-palette-panel__close {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--panel-card-stroke);
  border-radius: 999px;
  background: var(--panel-pill-bg);
  color: var(--panel-text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.inline-palette-panel__close:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.channel-orb {
  min-height: 42px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: var(--panel-pill-bg);
  color: var(--panel-text-muted);
  border: 1px solid var(--panel-card-stroke);
}

.channel-orb--active {
  background: var(--panel-chip-active-bg);
  color: var(--panel-accent);
  border-color: var(--panel-accent-outline);
}

.channel-orb__swatch {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid var(--panel-dot-border);
  background: var(--orb-fill);
}

.channel-orb__swatch--empty {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-text-subtle) 26%, transparent 74%);
}

.channel-orb__label {
  font-size: 12px;
  font-weight: 700;
}

.swatch-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.swatch-grid--inline {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.swatch-chip {
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 16px;
  background: var(--panel-chip-bg);
  color: var(--panel-text-muted);
  text-align: left;
}

.swatch-chip--active {
  background: var(--panel-chip-active-bg);
  outline: 1px solid var(--panel-accent-outline);
}

.swatch-chip__dot {
  width: 18px;
  height: 18px;
  flex: none;
  border-radius: 999px;
  border: 1px solid var(--panel-dot-border);
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

@media (max-width: 420px) {
  .style-editor-shell {
    padding: 12px;
  }

  .target-grid,
  .swatch-grid {
    grid-template-columns: 1fr;
  }

  .custom-color-panel__controls {
    grid-template-columns: 1fr;
  }

  .target-preview-card__actions {
    flex-wrap: wrap;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading__actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
