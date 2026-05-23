
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
        height: rect.height || 320,
        width: rect.width || 296,
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
          height: 320,
          width: 296,
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

  onMounted(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleViewportResize)
      window.addEventListener("scroll", handleViewportScroll, true)
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleViewportResize)
      window.removeEventListener("scroll", handleViewportScroll, true)
    }
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
