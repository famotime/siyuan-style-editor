import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

import {
  createPanelThemeVars,
  resolvePanelThemeAppearance,
} from "@/lib/panel-theme";

export function usePanelThemeVars() {
  const themeAppearance = ref(resolvePanelThemeAppearance(undefined, false));

  function syncThemeAppearance() {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    themeAppearance.value = resolvePanelThemeAppearance(root?.getAttribute("data-theme-mode"), prefersDark);
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
  });

  onBeforeUnmount(() => {
    themeObserver?.disconnect();
    themeObserver = null;

    mediaQuery?.removeEventListener?.("change", syncThemeAppearance);
    mediaQuery = null;
  });

  const panelThemeVars = computed(() => {
    return createPanelThemeVars(themeAppearance.value);
  });

  return {
    panelThemeVars,
  };
}
