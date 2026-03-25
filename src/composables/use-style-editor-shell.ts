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

  function handleColorPickerInput(event: Event) {
    const nextColor = (event.target as HTMLInputElement).value;
    void applyCustomColorValue(nextColor);
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
    colorPickerValue,
    customColorDraft,
    customColorPlaceholder,
    floatingPaletteRef,
    floatingPaletteStyle,
    getChannelSwatch,
    getTargetPreviewStyle,
    handleClearSelectedTargetColor,
    handleColorPickerInput,
    handleExtractStyles,
    handlePresetColorSelection,
    handleResetAllStyles,
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
