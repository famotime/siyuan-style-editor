import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

import type { PaintChannel } from "@/style-editor-runtime";
import type { StyleTarget } from "@/lib/style-profile";

import {
  BACKGROUND_PALETTE,
  exportCurrentStyles,
  extractCurrentStyles,
  FOREGROUND_PALETTE,
  importStyles,
  persistCurrentStyles,
  previewPaletteColor,
  resetAllStyles,
  runtimeState,
  selectChannel,
  selectTarget,
} from "@/style-editor-runtime";
import {
  createDefaultCustomColor,
  normalizeHexColor,
  resolveColorPickerValue,
} from "@/lib/custom-color";
import { resolveFloatingPalettePosition } from "@/lib/floating-palette";
import {
  buildInlineColorFieldBackground,
  hexToHsvColor,
  hsvToHexColor,
} from "@/lib/inline-color-picker";
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
  RESET_ALL_STYLES_MESSAGE,
  resolveExportStylesMessage,
  resolveExtractStylesMessage,
  resolveImportStylesMessage,
} from "@/lib/style-editor-shell-actions";
import { countStyledTargets } from "@/lib/style-transfer";
import {
  buildChannelSwatchStyle,
  buildTargetPreviewStyle,
} from "@/lib/target-preview";
import { STYLE_TARGET_OPTIONS } from "@/lib/style-target-catalog";

export function useStyleEditorShell() {
  const themeAppearance = ref(resolvePanelThemeAppearance(undefined, false));
  const inlinePaletteState = ref(closeInlinePalette());
  const importFileInputRef = ref<HTMLInputElement | null>(null);
  const inlineColorFieldRef = ref<HTMLElement | null>(null);
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
  const inlinePaletteCommittedColor = ref("");
  const inlinePaletteDraftColor = ref("");
  const inlineHue = ref(0);
  const inlineSaturation = ref(0);
  const inlineValue = ref(0);
  const colorResolutionScope = computed(() => {
    return floatingPaletteRef.value ?? inlineColorFieldRef.value;
  });

  const colorPickerValue = computed(() => {
    return resolveColorPickerValue(customColorDraft.value, runtimeState.selectedChannel, colorResolutionScope.value);
  });

  const customColorPlaceholder = computed(() => {
    return createDefaultCustomColor(runtimeState.selectedChannel);
  });

  const isCustomColorDraftValid = computed(() => {
    if (!isInlinePaletteVisible.value) {
      return false;
    }

    return Boolean(normalizeHexColor(customColorDraft.value))
      || inlinePaletteDraftColor.value !== inlinePaletteCommittedColor.value;
  });

  const panelThemeVars = computed(() => {
    return createPanelThemeVars(themeAppearance.value);
  });

  const inlineColorFieldStyle = computed(() => {
    return {
      background: buildInlineColorFieldBackground(inlineHue.value),
    };
  });

  const inlineColorThumbStyle = computed(() => {
    return {
      background: colorPickerValue.value,
      left: `${inlineSaturation.value * 100}%`,
      top: `${(1 - inlineValue.value) * 100}%`,
    };
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

  function resetInlinePaletteDraftState() {
    inlinePaletteCommittedColor.value = "";
    inlinePaletteDraftColor.value = "";
  }

  function closeInlinePalettePanel() {
    stopInlineColorFieldTracking();
    inlinePaletteState.value = closeInlinePalette();
    resetInlinePaletteDraftState();
    resetInlinePaletteLayout();
  }

  async function cancelInlinePalettePanel() {
    if (
      isInlinePaletteVisible.value
      && inlinePaletteDraftColor.value !== inlinePaletteCommittedColor.value
    ) {
      await previewPaletteColor(inlinePaletteCommittedColor.value);
    }

    closeInlinePalettePanel();
  }

  function syncCustomColorDraft(color: string, channel: PaintChannel) {
    const resolvedColor = resolveColorPickerValue(color, channel, colorResolutionScope.value);
    customColorDraft.value = resolvedColor;
    syncInlineColorPicker(resolvedColor);
  }

  function startInlinePaletteSession(target: StyleTarget, channel: PaintChannel) {
    const committedColor = runtimeState.profile[target][channel];
    inlinePaletteCommittedColor.value = committedColor;
    inlinePaletteDraftColor.value = committedColor;
    syncCustomColorDraft(committedColor, channel);
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

    void cancelInlinePalettePanel();
  }

  function handleEscapeKey(event: KeyboardEvent) {
    if (event.key !== "Escape" || !isInlinePaletteVisible.value) {
      return;
    }

    void cancelInlinePalettePanel();
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

    stopInlineColorFieldTracking();
  });

  watch(
    [() => runtimeState.selectedTarget, () => runtimeState.selectedChannel, selectedSwatch],
    ([, channel, swatch]) => {
      syncCustomColorDraft(swatch, channel);
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

  async function previewInlinePaletteColor(color: string) {
    if (!isInlinePaletteVisible.value) {
      return;
    }

    inlinePaletteDraftColor.value = color;
    await previewPaletteColor(color);
  }

  function syncInlineColorPicker(color: string) {
    const hsvColor = hexToHsvColor(color);
    inlineHue.value = hsvColor.h;
    inlineSaturation.value = hsvColor.s;
    inlineValue.value = hsvColor.v;
  }

  let stopInlineColorFieldTrackingListener: (() => void) | null = null;

  function updateInlineColorFromPoint(clientX: number, clientY: number) {
    if (!inlineColorFieldRef.value) {
      return;
    }

    const rect = inlineColorFieldRef.value.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const saturation = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const value = 1 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const nextColor = hsvToHexColor({
      h: inlineHue.value,
      s: saturation,
      v: value,
    });

    inlineSaturation.value = saturation;
    inlineValue.value = value;
    customColorDraft.value = nextColor;
    void previewInlinePaletteColor(nextColor);
  }

  function stopInlineColorFieldTracking() {
    stopInlineColorFieldTrackingListener?.();
    stopInlineColorFieldTrackingListener = null;
  }

  function handleInlineColorFieldPointerDown(event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    updateInlineColorFromPoint(event.clientX, event.clientY);
    stopInlineColorFieldTracking();

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      updateInlineColorFromPoint(pointerEvent.clientX, pointerEvent.clientY);
    };

    const handlePointerUp = () => {
      stopInlineColorFieldTracking();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp, { once: true });
      window.addEventListener("pointercancel", handlePointerUp, { once: true });
      stopInlineColorFieldTrackingListener = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };
    }
  }

  function handleInlineHueInput(event: Event) {
    const nextHue = Number((event.target as HTMLInputElement).value);
    const nextColor = hsvToHexColor({
      h: nextHue,
      s: inlineSaturation.value,
      v: inlineValue.value,
    });

    inlineHue.value = nextHue;
    customColorDraft.value = nextColor;
    void previewInlinePaletteColor(nextColor);
  }

  async function applyCustomColorDraft() {
    const normalizedCustomColor = normalizeHexColor(customColorDraft.value);
    const nextColor = normalizedCustomColor || inlinePaletteDraftColor.value;

    if (!normalizedCustomColor && nextColor === inlinePaletteCommittedColor.value) {
      closeInlinePalettePanel();
      return;
    }

    if (nextColor !== inlinePaletteDraftColor.value) {
      await previewInlinePaletteColor(nextColor);
    }

    await persistCurrentStyles();
    inlinePaletteCommittedColor.value = nextColor;
    closeInlinePalettePanel();
  }

  async function handleExtractStyles() {
    await cancelInlinePalettePanel();
    const result = await extractCurrentStyles();
    actionMessage.value = resolveExtractStylesMessage(result);
  }

  async function handleResetAllStyles() {
    await cancelInlinePalettePanel();
    await resetAllStyles();
    actionMessage.value = RESET_ALL_STYLES_MESSAGE;
  }

  async function handleExportStyles() {
    await cancelInlinePalettePanel();

    if (typeof document === "undefined") {
      return;
    }

    const exportedContent = exportCurrentStyles();
    const exportUrl = URL.createObjectURL(new Blob([exportedContent], {
      type: "application/json;charset=utf-8",
    }));
    const downloadLink = document.createElement("a");
    downloadLink.href = exportUrl;
    downloadLink.download = `siyuan-style-editor-styles-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(exportUrl);

    actionMessage.value = resolveExportStylesMessage({
      styledTargetCount: countStyledTargets(runtimeState.profile),
    });
  }

  function openImportStylesPicker() {
    importFileInputRef.value?.click();
  }

  async function handleImportStylesChange(event: Event) {
    await cancelInlinePalettePanel();

    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    try {
      const importedContent = await file.text();
      const result = await importStyles(importedContent);
      actionMessage.value = resolveImportStylesMessage(result);
    }
    catch (error) {
      actionMessage.value = error instanceof Error
        ? error.message
        : "导入样式失败，请检查本地配置文件。";
    }
    finally {
      if (input) {
        input.value = "";
      }
    }
  }

  async function activateTargetChannel(target: StyleTarget, channel: PaintChannel, event: MouseEvent) {
    if (isInlinePaletteVisible.value) {
      const isSameTarget = inlinePaletteState.value.target === target;
      const isSameChannel = inlinePaletteState.value.channel === channel;

      await cancelInlinePalettePanel();
      if (isSameTarget && isSameChannel) {
        return;
      }
    }

    selectTarget(target);
    selectChannel(channel);
    const nextInlinePaletteState = toggleInlinePalette(inlinePaletteState.value, target, channel);
    inlinePaletteState.value = nextInlinePaletteState;

    if (!nextInlinePaletteState.target || !nextInlinePaletteState.channel) {
      resetInlinePaletteLayout();
      return;
    }

    startInlinePaletteSession(target, channel);

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

  async function selectPreviewTarget(target: StyleTarget) {
    await cancelInlinePalettePanel();
    selectTarget(target);
  }

  async function handlePresetColorSelection(color: string) {
    customColorDraft.value = resolveColorPickerValue(color, runtimeState.selectedChannel, colorResolutionScope.value);
    await previewInlinePaletteColor(color);
  }

  async function handleClearSelectedTargetColor() {
    customColorDraft.value = "";
    await previewInlinePaletteColor("");
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

  return {
    activePalette,
    activateTargetChannel,
    applyCustomColorDraft,
    cancelInlinePalettePanel,
    closeInlinePalettePanel,
    colorPickerValue,
    customColorDraft,
    customColorPlaceholder,
    floatingPaletteRef,
    floatingPaletteStyle,
    getChannelSwatch,
    getTargetPreviewStyle,
    handleClearSelectedTargetColor,
    handleExportStyles,
    handleExtractStyles,
    handleImportStylesChange,
    handleInlineColorFieldPointerDown,
    handleInlineHueInput,
    handlePresetColorSelection,
    handleResetAllStyles,
    importFileInputRef,
    inlineColorFieldRef,
    inlineColorFieldStyle,
    inlineColorThumbStyle,
    inlineHue,
    isCustomColorDraftValid,
    isInlinePaletteOpenForTarget,
    isInlinePaletteVisible,
    panelThemeVars,
    runtimeState,
    selectedChannelLabel,
    selectedSwatch,
    selectedTargetMeta,
    selectPreviewTarget,
    openImportStylesPicker,
    statusCopy,
    STYLE_TARGET_OPTIONS,
  };
}
