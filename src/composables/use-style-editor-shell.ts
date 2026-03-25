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
  applyPaletteColor,
  BACKGROUND_PALETTE,
  clearSelectedTargetColor,
  extractCurrentStyles,
  FOREGROUND_PALETTE,
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
  applyCustomColorSelection,
  clearPaletteSelection,
  resolveExtractStylesMessage,
} from "@/lib/style-editor-shell-actions";
import {
  buildChannelSwatchStyle,
  buildTargetPreviewStyle,
} from "@/lib/target-preview";
import { STYLE_TARGET_OPTIONS } from "@/lib/style-target-catalog";

export function useStyleEditorShell() {
  const themeAppearance = ref(resolvePanelThemeAppearance(undefined, false));
  const inlinePaletteState = ref(closeInlinePalette());
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
  const inlineHue = ref(0);
  const inlineSaturation = ref(0);
  const inlineValue = ref(0);

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

  function closeInlinePalettePanel() {
    inlinePaletteState.value = closeInlinePalette();
    resetInlinePaletteLayout();
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

    stopInlineColorFieldTracking();
  });

  watch(
    [() => runtimeState.selectedTarget, () => runtimeState.selectedChannel, selectedSwatch],
    ([, channel, swatch]) => {
      const nextDraft = normalizeHexColor(swatch) || createDefaultCustomColor(channel);
      customColorDraft.value = nextDraft;
      syncInlineColorPicker(nextDraft);
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

  async function applyCustomColorValue(color: string) {
    const appliedColor = await applyCustomColorSelection(color, {
      applyPaletteColor,
      closeInlinePalette: closeInlinePalettePanel,
    });

    if (!appliedColor) {
      return;
    }

    customColorDraft.value = appliedColor;
  }

  function syncInlineColorPicker(color: string) {
    const hsvColor = hexToHsvColor(color);
    inlineHue.value = hsvColor.h;
    inlineSaturation.value = hsvColor.s;
    inlineValue.value = hsvColor.v;
  }

  let pendingInlineColor = "";
  let isApplyingInlineColor = false;
  let stopInlineColorFieldTrackingListener: (() => void) | null = null;

  function queueInlineColorApply(color: string) {
    pendingInlineColor = normalizeHexColor(color);
    if (!pendingInlineColor || isApplyingInlineColor) {
      return;
    }

    isApplyingInlineColor = true;
    void (async () => {
      while (pendingInlineColor) {
        const nextColor = pendingInlineColor;
        pendingInlineColor = "";
        await applyPaletteColor(nextColor);
      }

      isApplyingInlineColor = false;
      if (pendingInlineColor) {
        queueInlineColorApply(pendingInlineColor);
      }
    })();
  }

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
    queueInlineColorApply(nextColor);
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
    queueInlineColorApply(nextColor);
  }

  async function applyCustomColorDraft() {
    await applyCustomColorValue(customColorDraft.value);
  }

  async function handleExtractStyles() {
    closeInlinePalettePanel();
    const result = await extractCurrentStyles();
    actionMessage.value = resolveExtractStylesMessage(result);
  }

  async function handleResetAllStyles() {
    closeInlinePalettePanel();
    await resetAllStyles();
    actionMessage.value = RESET_ALL_STYLES_MESSAGE;
  }

  function activateTargetChannel(target: StyleTarget, channel: PaintChannel, event: MouseEvent) {
    stopInlineColorFieldTracking();
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

  async function handlePresetColorSelection(color: string) {
    await applyPaletteColor(color);
    closeInlinePalettePanel();
  }

  async function handleClearSelectedTargetColor() {
    await clearPaletteSelection({
      clearSelectedTargetColor,
      closeInlinePalette: closeInlinePalettePanel,
    });
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
    closeInlinePalettePanel,
    colorPickerValue,
    customColorDraft,
    customColorPlaceholder,
    floatingPaletteRef,
    floatingPaletteStyle,
    getChannelSwatch,
    getTargetPreviewStyle,
    handleClearSelectedTargetColor,
    handleExtractStyles,
    handleInlineColorFieldPointerDown,
    handleInlineHueInput,
    handlePresetColorSelection,
    handleResetAllStyles,
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
    statusCopy,
    STYLE_TARGET_OPTIONS,
  };
}
