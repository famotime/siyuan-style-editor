import type { StyleTarget } from "@/lib/style-profile"
import type { PaintChannel } from "@/style-editor-runtime"

import {
  computed,
  ref,
  watch,
} from "vue"

import {
  PRESET_PALETTE_COLLECTIONS,
} from "@/lib/preset-palette-catalog"
import { STYLE_TARGET_OPTIONS } from "@/lib/style-target-catalog"
import { runtimeState } from "@/style-editor-runtime"

interface UsePresetPaletteSessionOptions {
  onBatchApply: (input: {
    channel: PaintChannel
    colors: string[]
    paletteId: string
    targets: StyleTarget[]
  }) => Promise<void>
}

export function usePresetPaletteSession(options: UsePresetPaletteSessionOptions) {
  const activePresetPaletteId = ref(PRESET_PALETTE_COLLECTIONS[0]?.id ?? "")
  const isPresetPaletteSectionExpanded = ref(true)

  const presetPaletteCollections = computed(() => {
    return [
      ...runtimeState.customPresetPalettes,
      ...PRESET_PALETTE_COLLECTIONS,
    ]
  })

  const activePresetPalette = computed(() => {
    return presetPaletteCollections.value.find((palette) => palette.id === activePresetPaletteId.value) ?? presetPaletteCollections.value[0]
  })

  async function handlePresetPaletteBatchApply(paletteId: string, channel: PaintChannel) {
    const palette = presetPaletteCollections.value.find((item) => item.id === paletteId)
    if (!palette) {
      return
    }

    activePresetPaletteId.value = paletteId

    await options.onBatchApply({
      channel,
      colors: palette.colors.map((color) => color.value),
      paletteId,
      targets: STYLE_TARGET_OPTIONS.map((target) => target.value),
    })
  }

  function selectPresetPaletteTab(paletteId: string) {
    if (!presetPaletteCollections.value.some((palette) => palette.id === paletteId)) {
      return
    }

    activePresetPaletteId.value = paletteId
  }

  function togglePresetPaletteSection() {
    isPresetPaletteSectionExpanded.value = !isPresetPaletteSectionExpanded.value
  }

  watch(
    () => presetPaletteCollections.value.map((palette) => palette.id),
    (paletteIds) => {
      if (paletteIds.length === 0) {
        activePresetPaletteId.value = ""
        return
      }

      if (!paletteIds.includes(activePresetPaletteId.value)) {
        activePresetPaletteId.value = paletteIds[0]
      }
    },
    { immediate: true },
  )

  return {
    activePresetPalette,
    activePresetPaletteId,
    handlePresetPaletteBatchApply,
    isPresetPaletteSectionExpanded,
    presetPaletteCollections,
    selectPresetPaletteTab,
    togglePresetPaletteSection,
  }
}
