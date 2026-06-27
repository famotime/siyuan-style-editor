import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue"

import {
  createPanelThemeVars,
  detectSiyuanThemeAppearance,
  SIYUAN_THEME_SIGNAL_ATTRIBUTES,
} from "@/lib/panel-theme"

export function usePanelThemeVars() {
  const themeAppearance = ref(detectSiyuanThemeAppearance(false))

  function syncThemeAppearance() {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return
    }

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
    themeAppearance.value = detectSiyuanThemeAppearance(prefersDark)
    document.documentElement.dataset.styleEditorThemeMode = themeAppearance.value
  }

  let themeObserver: MutationObserver | null = null
  let mediaQuery: MediaQueryList | null = null
  let themePoller: number | null = null

  onMounted(() => {
    syncThemeAppearance()

    if (typeof document !== "undefined") {
      themeObserver = new MutationObserver(syncThemeAppearance)
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: SIYUAN_THEME_SIGNAL_ATTRIBUTES,
      })
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: SIYUAN_THEME_SIGNAL_ATTRIBUTES,
      })
    }

    if (typeof window !== "undefined" && window.matchMedia) {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener?.("change", syncThemeAppearance)
    }

    if (typeof window !== "undefined") {
      themePoller = window.setInterval(syncThemeAppearance, 800)
    }
  })

  onBeforeUnmount(() => {
    themeObserver?.disconnect()
    themeObserver = null

    mediaQuery?.removeEventListener?.("change", syncThemeAppearance)
    mediaQuery = null

    if (themePoller !== null && typeof window !== "undefined") {
      window.clearInterval(themePoller)
      themePoller = null
    }

    if (typeof document !== "undefined") {
      delete document.documentElement.dataset.styleEditorThemeMode
    }
  })

  const panelThemeVars = computed(() => {
    return createPanelThemeVars(themeAppearance.value)
  })

  return {
    panelThemeVars,
    themeAppearance,
  }
}
