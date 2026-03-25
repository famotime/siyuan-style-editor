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
      <div class="style-editor-shell__status">
        <span class="style-editor-shell__status-copy">
          {{ statusCopy }}
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
              :class="{ 'channel-orb--active': runtimeState.selectedTarget === target.value && runtimeState.selectedChannel === 'color' && isInlinePaletteOpenForTarget(target.value) }"
              @click="activateTargetChannel(target.value, 'color', $event)"
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
              @click="activateTargetChannel(target.value, 'backgroundColor', $event)"
            >
              <span
                class="channel-orb__swatch"
                :class="{ 'channel-orb__swatch--empty': getChannelSwatch(target.value, 'backgroundColor').isEmpty }"
                :style="{ '--orb-fill': getChannelSwatch(target.value, 'backgroundColor').background }"
              />
              <span class="channel-orb__label">底</span>
            </button>
          </div>

        </article>
      </div>
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
                Floating Palette
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
                使用调色板或十六进制颜色，修改会立即反映到当前对象。
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
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

import {
  applyPaletteColor,
  BACKGROUND_PALETTE,
  clearSelectedTargetColor,
  extractCurrentStyles,
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
import { resolveFloatingPalettePosition } from "@/lib/floating-palette";
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
const floatingPaletteRef = ref<HTMLElement | null>(null);
const floatingPaletteStyle = ref<Record<string, string>>({});
const inlinePaletteAnchorRect = ref<{
  height: number;
  left: number;
  top: number;
  width: number;
} | null>(null);
const actionMessage = ref("");

const selectedTargetMeta = computed(() => {
  return STYLE_TARGET_OPTIONS.find(target => target.value === runtimeState.selectedTarget) ?? STYLE_TARGET_OPTIONS[0];
});

const statusCopy = computed(() => {
  return actionMessage.value || selectedTargetMeta.value.hint;
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

const isInlinePaletteVisible = computed(() => {
  return inlinePaletteState.value.target !== null && inlinePaletteState.value.channel !== null;
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

function resetInlinePaletteLayout() {
  inlinePaletteAnchorRect.value = null;
  floatingPaletteStyle.value = {};
}

function updateFloatingPalettePosition() {
  if (
    !isInlinePaletteVisible.value
    || !inlinePaletteAnchorRect.value
    || !floatingPaletteRef.value
    || typeof window === "undefined"
  ) {
    return;
  }

  const rect = floatingPaletteRef.value.getBoundingClientRect();
  const position = resolveFloatingPalettePosition(
    inlinePaletteAnchorRect.value,
    {
      height: rect.height || 320,
      width: rect.width || 296,
    },
    {
      height: window.innerHeight,
      width: window.innerWidth,
    },
  );

  floatingPaletteStyle.value = {
    left: `${position.left}px`,
    top: `${position.top}px`,
    transformOrigin: position.transformOrigin,
  };
}

async function syncFloatingPalettePosition() {
  await nextTick();
  updateFloatingPalettePosition();
}

function handleViewportResize() {
  if (!isInlinePaletteVisible.value) {
    return;
  }

  void syncFloatingPalettePosition();
}

function handleViewportScroll() {
  if (!isInlinePaletteVisible.value) {
    return;
  }

  closeInlinePalettePanel();
}

function handleEscapeKey(event: KeyboardEvent) {
  if (event.key !== "Escape" || !isInlinePaletteVisible.value) {
    return;
  }

  closeInlinePalettePanel();
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

  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleViewportResize);
    window.addEventListener("scroll", handleViewportScroll, true);
    window.addEventListener("keydown", handleEscapeKey);
  }
});

onBeforeUnmount(() => {
  themeObserver?.disconnect();
  themeObserver = null;

  mediaQuery?.removeEventListener?.("change", syncThemeAppearance);
  mediaQuery = null;

  if (typeof window !== "undefined") {
    window.removeEventListener("resize", handleViewportResize);
    window.removeEventListener("scroll", handleViewportScroll, true);
    window.removeEventListener("keydown", handleEscapeKey);
  }
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

watch(
  () => [inlinePaletteState.value.target, inlinePaletteState.value.channel] as const,
  ([target, channel]) => {
    if (!target || !channel) {
      resetInlinePaletteLayout();
      return;
    }

    void syncFloatingPalettePosition();
  },
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
  closeInlinePalettePanel();
}

async function applyCustomColorDraft() {
  await applyCustomColorValue(customColorDraft.value);
}

async function handleExtractStyles() {
  closeInlinePalettePanel();
  const result = await extractCurrentStyles();

  if (result.matchedTargetCount === 0) {
    actionMessage.value = "未找到可提取的文档对象，请先打开包含标题或文本内容的文档。";
    return;
  }

  if (result.extractedTargetCount === 0) {
    actionMessage.value = `已扫描 ${result.matchedTargetCount} 类对象，但没有检测到可回填的显式颜色。`;
    return;
  }

  actionMessage.value = `已提取 ${result.extractedTargetCount} 类对象的当前颜色，并同步到面板预览。`;
}

async function handleResetAllStyles() {
  closeInlinePalettePanel();
  await resetAllStyles();
  actionMessage.value = "已清除全部样式，恢复到初始状态。";
}

function activateTargetChannel(target: StyleTarget, channel: PaintChannel, event: MouseEvent) {
  selectTarget(target);
  selectChannel(channel);
  const nextInlinePaletteState = toggleInlinePalette(inlinePaletteState.value, target, channel);
  inlinePaletteState.value = nextInlinePaletteState;

  if (!nextInlinePaletteState.target || !nextInlinePaletteState.channel) {
    resetInlinePaletteLayout();
    return;
  }

  const anchorElement = event.currentTarget as HTMLElement | null;
  if (!anchorElement) {
    return;
  }

  const { height, left, top, width } = anchorElement.getBoundingClientRect();
  inlinePaletteAnchorRect.value = { height, left, top, width };
  if (typeof window !== "undefined") {
    const initialPosition = resolveFloatingPalettePosition(
      inlinePaletteAnchorRect.value,
      {
        height: 320,
        width: 296,
      },
      {
        height: window.innerHeight,
        width: window.innerWidth,
      },
    );

    floatingPaletteStyle.value = {
      left: `${initialPosition.left}px`,
      top: `${initialPosition.top}px`,
      transformOrigin: initialPosition.transformOrigin,
    };
  }
  void syncFloatingPalettePosition();
}

function selectPreviewTarget(target: StyleTarget) {
  selectTarget(target);
  closeInlinePalettePanel();
}

function closeInlinePalettePanel() {
  inlinePaletteState.value = closeInlinePalette();
  resetInlinePaletteLayout();
}

async function handlePresetColorSelection(color: string) {
  await applyPaletteColor(color);
  closeInlinePalettePanel();
}

async function handleClearSelectedTargetColor() {
  await clearSelectedTargetColor();
  closeInlinePalettePanel();
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
.section-heading__kicker {
  margin: 0;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-size: 11px;
  color: var(--panel-text-subtle);
}

.target-preview-card__eyebrow {
  margin: 0;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-size: 9px;
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

.status-pill {
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

.extract-styles-button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--panel-accent-outline);
  border-radius: 999px;
  background: var(--panel-chip-active-bg);
  color: var(--panel-accent);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.extract-styles-button:hover {
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
  gap: 4px;
  padding: 6px;
  border-radius: 16px;
  background: var(--panel-chip-bg);
  border: 1px solid transparent;
}

.target-preview-card--selected {
  border-color: var(--panel-accent-outline);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-accent) 24%, transparent 76%);
}

.target-preview-card__surface {
  display: grid;
  gap: 3px;
  min-height: 68px;
  padding: 8px;
  border-radius: 16px;
  text-align: left;
  background: var(--panel-preview-bg);
  border: 1px solid var(--panel-card-inner-stroke);
  align-content: center;
}

.target-preview-card__title {
  margin: 0;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  font-size: 17px;
  line-height: 1.25;
}

.target-preview-card__actions {
  display: flex;
  gap: 4px;
}

.inline-palette-panel {
  display: grid;
  gap: 12px;
}

.inline-palette-panel--floating {
  position: fixed;
  z-index: 999;
  width: min(296px, calc(100vw - 24px));
  padding: 14px;
  border-radius: 20px;
  border: 1px solid var(--panel-card-stroke);
  background:
    linear-gradient(135deg, var(--panel-glass), transparent 45%),
    var(--panel-card-bg);
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.22), var(--panel-shadow);
  backdrop-filter: blur(18px);
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
  min-height: 38px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
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
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 1px solid var(--panel-dot-border);
  background: var(--orb-fill);
}

.channel-orb__swatch--empty {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-text-subtle) 26%, transparent 74%);
}

.channel-orb__label {
  font-size: 10px;
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

.floating-palette-enter-active,
.floating-palette-leave-active {
  transition:
    opacity 160ms ease,
    transform 180ms ease;
}

.floating-palette-enter-from,
.floating-palette-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.94);
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
