
import type {
  ComputedRef,
  Ref,
} from "vue"
import {

  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,

  watch,
} from "vue"

import { resolveFloatingPalettePosition } from "@/lib/floating-palette"
import { bindWindowListeners } from "@/composables/use-window-listener"

const FALLBACK_PALETTE_HEIGHT = 320
const FALLBACK_PALETTE_WIDTH = 296

interface UseInlinePaletteLayoutSessionOptions {
  cancelInlinePalettePanel: () => Promise<void>
  floatingPaletteRef: Ref<HTMLElement | null>
  floatingPaletteStyle: Ref<Record<string, string>>
  isInlinePaletteVisible: ComputedRef<boolean>
}

export function useInlinePaletteLayoutSession(options: UseInlinePaletteLayoutSessionOptions) {
  const inlinePaletteAnchorRect = ref<{
    height: number
    left: number
    top: number
    width: number
  } | null>(null)

  function resetInlinePaletteLayout() {
    inlinePaletteAnchorRect.value = null
    options.floatingPaletteStyle.value = {}
  }

  function updateFloatingPalettePosition() {
    if (
      !options.isInlinePaletteVisible.value
      || !inlinePaletteAnchorRect.value
      || !options.floatingPaletteRef.value
      || typeof window === "undefined"
    ) {
      return
    }

    const rect = options.floatingPaletteRef.value.getBoundingClientRect()
    const position = resolveFloatingPalettePosition(
      inlinePaletteAnchorRect.value,
      {
        height: rect.height || FALLBACK_PALETTE_HEIGHT,
        width: rect.width || FALLBACK_PALETTE_WIDTH,
      },
      {
        height: window.innerHeight,
        width: window.innerWidth,
      },
    )

    options.floatingPaletteStyle.value = {
      left: `${position.left}px`,
      top: `${position.top}px`,
      transformOrigin: position.transformOrigin,
    }
  }

  async function syncFloatingPalettePosition() {
    await nextTick()
    updateFloatingPalettePosition()
  }

  function setInlinePaletteAnchor(anchorElement: HTMLElement | null) {
    if (!anchorElement) {
      return
    }

    const {
      height,
      left,
      top,
      width,
    } = anchorElement.getBoundingClientRect()
    inlinePaletteAnchorRect.value = {
      height,
      left,
      top,
      width,
    }
    if (typeof window !== "undefined") {
      const initialPosition = resolveFloatingPalettePosition(
        inlinePaletteAnchorRect.value,
        {
          height: FALLBACK_PALETTE_HEIGHT,
          width: FALLBACK_PALETTE_WIDTH,
        },
        {
          height: window.innerHeight,
          width: window.innerWidth,
        },
      )

      options.floatingPaletteStyle.value = {
        left: `${initialPosition.left}px`,
        top: `${initialPosition.top}px`,
        transformOrigin: initialPosition.transformOrigin,
      }
    }
  }

  function handleViewportResize() {
    if (!options.isInlinePaletteVisible.value) {
      return
    }

    void syncFloatingPalettePosition()
  }

  function handleViewportScroll(event: Event) {
    if (!options.isInlinePaletteVisible.value) {
      return
    }

    const eventTarget = event.target
    if (eventTarget instanceof Node && options.floatingPaletteRef.value?.contains(eventTarget)) {
      return
    }

    void options.cancelInlinePalettePanel()
  }

  let stopViewportListeners: (() => void) | null = null

  onMounted(() => {
    stopViewportListeners = bindWindowListeners([
      { handler: handleViewportResize, type: "resize" },
      { capture: true, handler: handleViewportScroll, type: "scroll" },
    ])
  })

  onBeforeUnmount(() => {
    stopViewportListeners?.()
    stopViewportListeners = null
  })

  watch(
    options.isInlinePaletteVisible,
    (isVisible) => {
      if (!isVisible) {
        resetInlinePaletteLayout()
        return
      }

      void syncFloatingPalettePosition()
    },
  )

  return {
    resetInlinePaletteLayout,
    setInlinePaletteAnchor,
    syncFloatingPalettePosition,
  }
}
