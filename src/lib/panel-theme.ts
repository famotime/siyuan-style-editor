export type PanelThemeAppearance = "light" | "dark";

export function resolvePanelThemeAppearance(
  themeMode: string | null | undefined,
  prefersDark: boolean,
): PanelThemeAppearance {
  if (themeMode === "dark" || themeMode === "light") {
    return themeMode;
  }

  return prefersDark ? "dark" : "light";
}

export function createPanelThemeVars(appearance: PanelThemeAppearance): Record<string, string> {
  if (appearance === "dark") {
    return {
      "--panel-background": "color-mix(in srgb, var(--b3-theme-background) 94%, #0d1117 6%)",
      "--panel-card-bg": "color-mix(in srgb, var(--b3-theme-surface) 92%, #131a22 8%)",
      "--panel-card-stroke": "color-mix(in srgb, var(--b3-border-color) 72%, #5f7387 28%)",
      "--panel-card-inner-stroke": "rgba(151, 168, 186, 0.16)",
      "--panel-rule-line": "rgba(148, 164, 184, 0.08)",
      "--panel-text": "var(--b3-theme-on-background)",
      "--panel-text-muted": "color-mix(in srgb, var(--b3-theme-on-surface) 86%, #d7d0c5 14%)",
      "--panel-text-subtle": "color-mix(in srgb, var(--b3-theme-on-surface) 66%, #a39a8c 34%)",
      "--panel-accent": "color-mix(in srgb, var(--b3-font-color6) 72%, #8cc8ff 28%)",
      "--panel-accent-soft": "color-mix(in srgb, var(--b3-font-color6) 20%, var(--b3-theme-surface) 80%)",
      "--panel-accent-outline": "color-mix(in srgb, var(--b3-font-color6) 42%, #7f95ad 58%)",
      "--panel-pill-bg": "color-mix(in srgb, var(--b3-theme-surface) 90%, #18202a 10%)",
      "--panel-chip-bg": "color-mix(in srgb, var(--b3-theme-surface) 88%, #1a2330 12%)",
      "--panel-chip-active-bg": "color-mix(in srgb, var(--b3-font-color6) 18%, var(--b3-theme-surface) 82%)",
      "--panel-clear-bg": "color-mix(in srgb, var(--b3-theme-surface) 84%, #243140 16%)",
      "--panel-preview-bg": "color-mix(in srgb, var(--b3-theme-surface) 84%, #1f2937 16%)",
      "--panel-glass": "rgba(255, 255, 255, 0.04)",
      "--panel-sheen": "rgba(255, 255, 255, 0.02)",
      "--panel-glow-a": "rgba(79, 145, 195, 0.18)",
      "--panel-glow-b": "rgba(231, 168, 89, 0.12)",
      "--panel-shadow": "0 14px 32px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      "--panel-hover-shadow": "0 12px 24px rgba(0, 0, 0, 0.24)",
      "--panel-dot-border": "rgba(255, 255, 255, 0.16)",
    };
  }

  return {
    "--panel-background": "color-mix(in srgb, var(--b3-theme-background) 88%, #e9decf 12%)",
    "--panel-card-bg": "color-mix(in srgb, var(--b3-theme-surface) 92%, #f3ead9 8%)",
    "--panel-card-stroke": "color-mix(in srgb, var(--b3-border-color) 76%, #8a6f4b 24%)",
    "--panel-card-inner-stroke": "rgba(124, 92, 53, 0.1)",
    "--panel-rule-line": "rgba(128, 100, 67, 0.05)",
    "--panel-text": "color-mix(in srgb, var(--b3-theme-on-surface) 86%, #402c18 14%)",
    "--panel-text-muted": "color-mix(in srgb, var(--b3-theme-on-surface) 82%, #5c4931 18%)",
    "--panel-text-subtle": "color-mix(in srgb, var(--b3-theme-on-surface) 62%, #9a7d55 38%)",
    "--panel-accent": "color-mix(in srgb, var(--b3-font-color6) 62%, #29536b 38%)",
    "--panel-accent-soft": "color-mix(in srgb, var(--b3-font-color6) 14%, white 86%)",
    "--panel-accent-outline": "color-mix(in srgb, var(--b3-font-color6) 46%, #d5c4ab 54%)",
    "--panel-pill-bg": "rgba(255, 255, 255, 0.42)",
    "--panel-chip-bg": "rgba(255, 255, 255, 0.42)",
    "--panel-chip-active-bg": "color-mix(in srgb, var(--b3-font-color6) 14%, white 86%)",
    "--panel-clear-bg": "color-mix(in srgb, var(--b3-theme-surface) 82%, #f1ece2 18%)",
    "--panel-preview-bg": "rgba(255, 255, 255, 0.44)",
    "--panel-glass": "rgba(255, 255, 255, 0.08)",
    "--panel-sheen": "rgba(255, 255, 255, 0.03)",
    "--panel-glow-a": "rgba(201, 156, 92, 0.16)",
    "--panel-glow-b": "rgba(57, 93, 119, 0.18)",
    "--panel-shadow": "0 14px 32px rgba(39, 28, 14, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
    "--panel-hover-shadow": "0 10px 18px rgba(45, 33, 18, 0.08)",
    "--panel-dot-border": "rgba(0, 0, 0, 0.08)",
  };
}
