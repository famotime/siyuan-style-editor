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
      "--panel-shell-backdrop": "color-mix(in srgb, var(--b3-theme-background) 90%, #0a1016 10%)",
      "--panel-shell-overlay": "rgba(255, 255, 255, 0.03)",
      "--panel-card-bg": "color-mix(in srgb, var(--b3-theme-surface) 90%, #101720 10%)",
      "--panel-card-strong": "color-mix(in srgb, var(--b3-theme-surface) 84%, #17202a 16%)",
      "--panel-card-highlight": "rgba(255, 255, 255, 0.03)",
      "--panel-card-stroke": "color-mix(in srgb, var(--b3-border-color) 70%, #56687c 30%)",
      "--panel-card-inner-stroke": "rgba(195, 208, 222, 0.11)",
      "--panel-divider": "rgba(184, 197, 212, 0.11)",
      "--panel-text": "color-mix(in srgb, var(--b3-theme-on-background) 92%, #e8ddd1 8%)",
      "--panel-text-muted": "color-mix(in srgb, var(--b3-theme-on-surface) 82%, #d7cfbf 18%)",
      "--panel-text-subtle": "color-mix(in srgb, var(--b3-theme-on-surface) 58%, #a49a89 42%)",
      "--panel-accent": "color-mix(in srgb, var(--b3-font-color6) 68%, #8dbfe8 32%)",
      "--panel-accent-soft": "color-mix(in srgb, var(--b3-font-color6) 18%, #122130 82%)",
      "--panel-accent-outline": "color-mix(in srgb, var(--b3-font-color6) 40%, #6f8195 60%)",
      "--panel-primary-button-bg": "linear-gradient(135deg, #6eb7ea 0%, #2f7fb8 100%)",
      "--panel-primary-button-border": "rgba(126, 191, 236, 0.68)",
      "--panel-primary-button-text": "#f7fbff",
      "--panel-primary-button-shadow": "0 18px 34px rgba(31, 103, 154, 0.36)",
      "--panel-primary-button-shadow-hover": "0 24px 42px rgba(35, 115, 171, 0.44)",
      "--panel-control-bg": "linear-gradient(180deg, rgba(18, 27, 38, 0.96), rgba(13, 20, 30, 0.92))",
      "--panel-control-border": "rgba(132, 170, 204, 0.34)",
      "--panel-control-shadow": "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 8px 18px rgba(0, 0, 0, 0.16)",
      "--panel-floating-outline": "rgba(176, 206, 231, 0.18)",
      "--panel-toolbar-bg": "rgba(12, 18, 26, 0.62)",
      "--panel-toolbar-shadow": "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      "--panel-pill-bg": "color-mix(in srgb, var(--b3-theme-surface) 86%, #18212b 14%)",
      "--panel-chip-bg": "color-mix(in srgb, var(--b3-theme-surface) 82%, #18212c 18%)",
      "--panel-chip-active-bg": "color-mix(in srgb, var(--b3-font-color6) 16%, #18212b 84%)",
      "--panel-clear-bg": "color-mix(in srgb, var(--b3-theme-surface) 78%, #24313f 22%)",
      "--panel-preview-bg": "linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))",
      "--panel-glass": "rgba(255, 255, 255, 0.04)",
      "--panel-glow-a": "rgba(83, 139, 184, 0.2)",
      "--panel-glow-b": "rgba(193, 151, 96, 0.12)",
      "--panel-shadow": "0 22px 42px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      "--panel-hover-shadow": "0 16px 28px rgba(0, 0, 0, 0.24)",
      "--panel-dot-border": "#ffffff",
      "--panel-swatch-chip-border": "rgba(212, 228, 244, 0.18)",
      "--panel-swatch-dot-ring": "rgba(212, 228, 244, 0.72)",
      "--panel-swatch-dot-shadow": "0 0 0 1px rgba(7, 12, 18, 0.42)",
      "--panel-clear-icon": "#ffffff",
      "--panel-clear-surface": "rgba(6, 10, 16, 0.88)",
    };
  }

  return {
    "--panel-shell-backdrop": "color-mix(in srgb, var(--b3-theme-background) 82%, #efe4d2 18%)",
    "--panel-shell-overlay": "rgba(255, 255, 255, 0.26)",
    "--panel-card-bg": "color-mix(in srgb, var(--b3-theme-surface) 88%, #f3e8d7 12%)",
    "--panel-card-strong": "color-mix(in srgb, var(--b3-theme-surface) 84%, #f5ecde 16%)",
    "--panel-card-highlight": "rgba(255, 255, 255, 0.32)",
    "--panel-card-stroke": "color-mix(in srgb, var(--b3-border-color) 72%, #9b7b55 28%)",
    "--panel-card-inner-stroke": "rgba(126, 94, 55, 0.1)",
    "--panel-divider": "rgba(118, 89, 54, 0.12)",
    "--panel-text": "color-mix(in srgb, var(--b3-theme-on-surface) 88%, #392716 12%)",
    "--panel-text-muted": "color-mix(in srgb, var(--b3-theme-on-surface) 78%, #5f4c33 22%)",
    "--panel-text-subtle": "color-mix(in srgb, var(--b3-theme-on-surface) 58%, #9a7f58 42%)",
    "--panel-accent": "color-mix(in srgb, var(--b3-font-color6) 60%, #204d63 40%)",
    "--panel-accent-soft": "color-mix(in srgb, var(--b3-font-color6) 14%, #fffaf2 86%)",
    "--panel-accent-outline": "color-mix(in srgb, var(--b3-font-color6) 40%, #d1c1aa 60%)",
    "--panel-primary-button-bg": "linear-gradient(135deg, #2c6b98 0%, #163f61 100%)",
    "--panel-primary-button-border": "rgba(28, 77, 112, 0.72)",
    "--panel-primary-button-text": "#fdfaf4",
    "--panel-primary-button-shadow": "0 18px 34px rgba(22, 63, 97, 0.24)",
    "--panel-primary-button-shadow-hover": "0 24px 42px rgba(22, 63, 97, 0.32)",
    "--panel-control-bg": "linear-gradient(180deg, rgba(255, 252, 247, 0.98), rgba(246, 238, 227, 0.94))",
    "--panel-control-border": "rgba(106, 80, 48, 0.22)",
    "--panel-control-shadow": "inset 0 1px 0 rgba(255, 255, 255, 0.72), 0 8px 18px rgba(78, 54, 26, 0.08)",
    "--panel-floating-outline": "rgba(120, 93, 61, 0.12)",
    "--panel-toolbar-bg": "rgba(255, 255, 255, 0.66)",
    "--panel-toolbar-shadow": "0 10px 20px rgba(82, 56, 27, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.42)",
    "--panel-pill-bg": "rgba(255, 255, 255, 0.58)",
    "--panel-chip-bg": "rgba(255, 255, 255, 0.54)",
    "--panel-chip-active-bg": "color-mix(in srgb, var(--b3-font-color6) 14%, white 86%)",
    "--panel-clear-bg": "color-mix(in srgb, var(--b3-theme-surface) 82%, #f2eadf 18%)",
    "--panel-preview-bg": "linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(248, 240, 229, 0.9))",
    "--panel-glass": "rgba(255, 255, 255, 0.14)",
    "--panel-glow-a": "rgba(195, 151, 89, 0.18)",
    "--panel-glow-b": "rgba(57, 96, 119, 0.16)",
    "--panel-shadow": "0 20px 38px rgba(58, 40, 18, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.34)",
    "--panel-hover-shadow": "0 14px 24px rgba(57, 40, 19, 0.1)",
    "--panel-dot-border": "#000000",
    "--panel-swatch-chip-border": "rgba(111, 82, 48, 0.18)",
    "--panel-swatch-dot-ring": "rgba(111, 82, 48, 0.44)",
    "--panel-swatch-dot-shadow": "0 0 0 1px rgba(255, 250, 242, 0.9)",
    "--panel-clear-icon": "#000000",
    "--panel-clear-surface": "rgba(255, 250, 242, 0.96)",
  };
}
