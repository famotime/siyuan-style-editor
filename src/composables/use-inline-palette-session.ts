import type { StyleTarget } from "@/lib/style-profile"

import type { PaintChannel } from "@/style-editor-runtime"
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue"

import { useInlinePaletteColorSession } from "@/composables/use-inline-palette-color-session"
import { useInlinePaletteLayoutSession } from "@/composables/use-inline-palette-layout-session"
import { usePresetPaletteSession } from "@/composables/use-preset-palette-session"
import {
  closeInlinePalette,
  isInlinePaletteOpen,
  toggleInlinePalette,
} from "@/lib/inline-palette"
import {
  buildChannelSwatchStyle,
  buildTargetPreviewStyle,
} from "@/lib/target-preview"
import {
  applyPaletteSequenceToTargets,
  runtimeState,
  selectChannel,
  selectTarget,
  swapTargetChannelValues,
  t,
} from "@/style-editor-runtime"

export function useInlinePaletteSession() {
  const inlinePaletteState = ref(closeInlinePalette())
  const inlineColorFieldRef = ref<HTMLElement | null>(null)
  const floatingPaletteRef = ref<HTMLElement | null>(null)
  const floatingPaletteStyle = ref<Record<string, string>>({})

  const selectedSwatch = computed(() => {
    return runtimeState.profile[runtimeState.selectedTarget][runtimeState.selectedChannel]
  })

  const selectedChannelLabel = computed(() => {
    return runtimeState.selectedChannel === "backgroundColor" ? t("bgColorLabel") : t("colorLabel")
  })

  const isInlinePaletteVisible = computed(() => {
    return inlinePaletteState.value.target !== null && inlinePaletteState.value.channel !== null
  })

  const colorResolutionScope = computed(() => {
    return floatingPaletteRef.value ?? inlineColorFieldRef.value
  })

  const inlinePaletteColorSession = useInlinePaletteColorSession({
    colorResolutionScope,
    inlineColorFieldRef,
    isInlinePaletteVisible,
    selectedSwatch,
  })

  function closeInlinePalettePanel() {
    inlinePaletteColorSession.closeInlinePaletteColorSession()
    inlinePaletteState.value = closeInlinePalette()
    // eslint-disable-next-line ts/no-use-before-define -- circular closure; initialized before any call
    inlinePaletteLayoutSession.resetInlinePaletteLayout()
  }

  async function cancelInlinePalettePanel() {
    await inlinePaletteColorSession.cancelPreviewIfNeeded()
    closeInlinePalettePanel()
  }

  const inlinePaletteLayoutSession = useInlinePaletteLayoutSession({
    cancelInlinePalettePanel,
    floatingPaletteRef,
    floatingPaletteStyle,
    isInlinePaletteVisible,
  })

  const presetPaletteSession = usePresetPaletteSession({
    onBatchApply: async ({
      channel,
      colors,
      targets,
    }) => {
      await applyPaletteSequenceToTargets(targets, channel, colors)
      inlinePaletteColorSession.syncCurrentRuntimeColor()
    },
  })

  async function applyCustomColorDraft() {
    await inlinePaletteColorSession.applyCustomColorDraft(closeInlinePalettePanel)
  }

  async function activateTargetChannel(target: StyleTarget, channel: PaintChannel, event: MouseEvent) {
    if (isInlinePaletteVisible.value) {
      const isSameTarget = inlinePaletteState.value.target === target
      const isSameChannel = inlinePaletteState.value.channel === channel

      await cancelInlinePalettePanel()
      if (isSameTarget && isSameChannel) {
        return
      }
    }

    selectTarget(target)
    selectChannel(channel)
    const nextInlinePaletteState = toggleInlinePalette(inlinePaletteState.value, target, channel)
    inlinePaletteState.value = nextInlinePaletteState

    if (!nextInlinePaletteState.target || !nextInlinePaletteState.channel) {
      inlinePaletteLayoutSession.resetInlinePaletteLayout()
      return
    }

    inlinePaletteColorSession.startInlinePaletteColorSession(target, channel)

    const anchorElement = event.currentTarget as HTMLElement | null
    inlinePaletteLayoutSession.setInlinePaletteAnchor(anchorElement)
    void inlinePaletteLayoutSession.syncFloatingPalettePosition()
  }

  async function selectPreviewTarget(target: StyleTarget) {
    await cancelInlinePalettePanel()
    selectTarget(target)
  }

  async function handlePresetPaletteBatchApply(paletteId: string) {
    await presetPaletteSession.handlePresetPaletteBatchApply(paletteId, runtimeState.selectedChannel)
  }

  async function handleSwapTargetChannelValues(
    source: { channel: PaintChannel, target: StyleTarget },
    target: { channel: PaintChannel, target: StyleTarget },
  ) {
    await cancelInlinePalettePanel()
    await swapTargetChannelValues(source, target)
  }

  function handleEscapeKey(event: KeyboardEvent) {
    if (event.key !== "Escape" || !isInlinePaletteVisible.value) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    void cancelInlinePalettePanel()
  }

  onMounted(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleEscapeKey, true)
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleEscapeKey, true)
    }
  })

  function isInlinePaletteOpenForTarget(target: StyleTarget) {
    return isInlinePaletteOpen(inlinePaletteState.value, target)
  }

  function getTargetPreviewStyle(target: StyleTarget) {
    return buildTargetPreviewStyle(target, runtimeState.profile[target], "var(--panel-text)")
  }

  function getChannelSwatch(target: StyleTarget, channel: PaintChannel) {
    const value = runtimeState.profile[target][channel]
    const fallbackColor = channel === "color"
      ? "var(--panel-text)"
      : "linear-gradient(135deg, var(--panel-preview-bg), var(--panel-card-bg))"

    return buildChannelSwatchStyle(value, fallbackColor)
  }

  return {
    activePresetPalette: presetPaletteSession.activePresetPalette,
    activePresetPaletteId: presetPaletteSession.activePresetPaletteId,
    activateTargetChannel,
    applyCustomColorDraft,
    cancelInlinePalettePanel,
    closeInlinePalettePanel,
    colorPickerValue: inlinePaletteColorSession.colorPickerValue,
    customColorDraft: inlinePaletteColorSession.customColorDraft,
    customColorPlaceholder: inlinePaletteColorSession.customColorPlaceholder,
    floatingPaletteRef,
    floatingPaletteStyle,
    getChannelSwatch,
    getTargetPreviewStyle,
    handleClearSelectedTargetColor: inlinePaletteColorSession.handleClearSelectedTargetColor,
    handleInlineColorFieldPointerDown: inlinePaletteColorSession.handleInlineColorFieldPointerDown,
    handleInlineHueInput: inlinePaletteColorSession.handleInlineHueInput,
    handlePresetPaletteBatchApply,
    handlePresetColorSelection: inlinePaletteColorSession.handlePresetColorSelection,
    handleSwapTargetChannelValues,
    inlineColorFieldRef: inlinePaletteColorSession.inlineColorFieldRef,
    inlineColorFieldStyle: inlinePaletteColorSession.inlineColorFieldStyle,
    inlineColorThumbStyle: inlinePaletteColorSession.inlineColorThumbStyle,
    inlineHue: inlinePaletteColorSession.inlineHue,
    isCustomColorDraftValid: inlinePaletteColorSession.isCustomColorDraftValid,
    isInlinePaletteOpenForTarget,
    isInlinePaletteVisible,
    isPresetPaletteSectionExpanded: presetPaletteSession.isPresetPaletteSectionExpanded,
    presetPaletteCollections: presetPaletteSession.presetPaletteCollections,
    selectedChannelLabel,
    selectedSwatch,
    selectPresetPaletteTab: presetPaletteSession.selectPresetPaletteTab,
    selectPreviewTarget,
    togglePresetPaletteSection: presetPaletteSession.togglePresetPaletteSection,
  }
}
