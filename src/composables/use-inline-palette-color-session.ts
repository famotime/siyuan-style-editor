import type { PaintChannel } from "@/style-editor-runtime";
import type { StyleTarget } from "@/lib/style-profile";

import {
  computed,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

import {
  persistCurrentStyles,
  previewPaletteColor,
  runtimeState,
} from "@/style-editor-runtime";
import {
  createDefaultCustomColor,
  normalizeHexColor,
  resolveColorPickerValue,
} from "@/lib/custom-color";
import {
  buildInlineColorFieldBackground,
  hexToHsvColor,
  hsvToHexColor,
} from "@/lib/inline-color-picker";

interface UseInlinePaletteColorSessionOptions {
  colorResolutionScope: ComputedRef<HTMLElement | null>;
  inlineColorFieldRef: Ref<HTMLElement | null>;
  isInlinePaletteVisible: ComputedRef<boolean>;
  selectedSwatch: ComputedRef<string>;
}

export function useInlinePaletteColorSession(options: UseInlinePaletteColorSessionOptions) {
  const customColorDraft = ref(createDefaultCustomColor(runtimeState.selectedChannel));
  const inlinePaletteCommittedColor = ref("");
  const inlinePaletteDraftColor = ref("");
  const inlineHue = ref(0);
  const inlineSaturation = ref(0);
  const inlineValue = ref(0);

  let stopInlineColorFieldTrackingListener: (() => void) | null = null;

  const colorPickerValue = computed(() => {
    return resolveColorPickerValue(customColorDraft.value, runtimeState.selectedChannel, options.colorResolutionScope.value);
  });

  const customColorPlaceholder = computed(() => {
    return createDefaultCustomColor(runtimeState.selectedChannel);
  });

  const isCustomColorDraftValid = computed(() => {
    if (!options.isInlinePaletteVisible.value) {
      return false;
    }

    return Boolean(normalizeHexColor(customColorDraft.value))
      || inlinePaletteDraftColor.value !== inlinePaletteCommittedColor.value;
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

  function resetInlinePaletteDraftState() {
    inlinePaletteCommittedColor.value = "";
    inlinePaletteDraftColor.value = "";
  }

  function stopInlineColorFieldTracking() {
    stopInlineColorFieldTrackingListener?.();
    stopInlineColorFieldTrackingListener = null;
  }

  function closeInlinePaletteColorSession() {
    stopInlineColorFieldTracking();
    resetInlinePaletteDraftState();
  }

  async function cancelPreviewIfNeeded() {
    if (
      options.isInlinePaletteVisible.value
      && inlinePaletteDraftColor.value !== inlinePaletteCommittedColor.value
    ) {
      await previewPaletteColor(inlinePaletteCommittedColor.value);
    }
  }

  function syncInlineColorPicker(color: string) {
    const hsvColor = hexToHsvColor(color);
    inlineHue.value = hsvColor.h;
    inlineSaturation.value = hsvColor.s;
    inlineValue.value = hsvColor.v;
  }

  function syncCustomColorDraft(color: string, channel: PaintChannel) {
    const resolvedColor = resolveColorPickerValue(color, channel, options.colorResolutionScope.value);
    customColorDraft.value = resolvedColor;
    syncInlineColorPicker(resolvedColor);
  }

  function startInlinePaletteColorSession(target: StyleTarget, channel: PaintChannel) {
    const committedColor = runtimeState.profile[target][channel];
    inlinePaletteCommittedColor.value = committedColor;
    inlinePaletteDraftColor.value = committedColor;
    syncCustomColorDraft(committedColor, channel);
  }

  function syncCurrentRuntimeColor() {
    const currentColor = runtimeState.profile[runtimeState.selectedTarget][runtimeState.selectedChannel];
    inlinePaletteCommittedColor.value = currentColor;
    inlinePaletteDraftColor.value = currentColor;
    syncCustomColorDraft(currentColor, runtimeState.selectedChannel);
  }

  async function previewInlinePaletteColor(color: string) {
    if (!options.isInlinePaletteVisible.value) {
      return;
    }

    inlinePaletteDraftColor.value = color;
    await previewPaletteColor(color);
  }

  function updateInlineColorFromPoint(clientX: number, clientY: number) {
    if (!options.inlineColorFieldRef.value) {
      return;
    }

    const rect = options.inlineColorFieldRef.value.getBoundingClientRect();
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

  async function applyCustomColorDraft(closeInlinePalettePanel: () => void) {
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

  async function handlePresetColorSelection(color: string) {
    customColorDraft.value = resolveColorPickerValue(color, runtimeState.selectedChannel, options.colorResolutionScope.value);
    await previewInlinePaletteColor(color);
  }

  async function handleClearSelectedTargetColor() {
    customColorDraft.value = "";
    await previewInlinePaletteColor("");
  }

  watch(
    [() => runtimeState.selectedTarget, () => runtimeState.selectedChannel, options.selectedSwatch],
    ([, channel, swatch]) => {
      syncCustomColorDraft(swatch, channel);
    },
    { immediate: true },
  );

  return {
    closeInlinePaletteColorSession,
    colorPickerValue,
    customColorDraft,
    customColorPlaceholder,
    handleClearSelectedTargetColor,
    handleInlineColorFieldPointerDown,
    handleInlineHueInput,
    handlePresetColorSelection,
    inlineColorFieldRef: options.inlineColorFieldRef,
    inlineColorFieldStyle,
    inlineColorThumbStyle,
    inlineHue,
    isCustomColorDraftValid,
    cancelPreviewIfNeeded,
    applyCustomColorDraft,
    startInlinePaletteColorSession,
    syncCurrentRuntimeColor,
  };
}
