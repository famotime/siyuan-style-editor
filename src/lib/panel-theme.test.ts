import {
  createPanelThemeVars,
  resolvePanelThemeAppearance,
} from "@/lib/panel-theme";

describe("panel theme", () => {
  it("prefers the explicit root dark mode", () => {
    expect(resolvePanelThemeAppearance("dark", false)).toBe("dark");
  });

  it("falls back to the system preference when the root mode is unavailable", () => {
    expect(resolvePanelThemeAppearance(null, true)).toBe("dark");
    expect(resolvePanelThemeAppearance(undefined, false)).toBe("light");
  });

  it("returns refined dark theme tokens for the panel", () => {
    const vars = createPanelThemeVars("dark");

    expect(vars["--panel-shell-backdrop"]).toBe("color-mix(in srgb, var(--b3-theme-background) 90%, #0a1016 10%)");
    expect(vars["--panel-chip-bg"]).toBe("color-mix(in srgb, var(--b3-theme-surface) 82%, #18212c 18%)");
    expect(vars["--panel-preview-bg"]).toBe("linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))");
    expect(vars["--panel-dot-border"]).toBe("#ffffff");
    expect(vars["--panel-clear-icon"]).toBe("#ffffff");
    expect(vars["--panel-clear-surface"]).toBe("rgba(6, 10, 16, 0.88)");
    expect(vars["--panel-primary-button-bg"]).toBe("linear-gradient(135deg, #6eb7ea 0%, #2f7fb8 100%)");
    expect(vars["--panel-primary-button-text"]).toBe("#f7fbff");
    expect(vars["--panel-control-bg"]).toBe("linear-gradient(180deg, rgba(18, 27, 38, 0.96), rgba(13, 20, 30, 0.92))");
    expect(vars["--panel-control-border"]).toBe("rgba(132, 170, 204, 0.34)");
    expect(vars["--panel-floating-outline"]).toBe("rgba(176, 206, 231, 0.18)");
  });

  it("returns warm light theme tokens for the panel", () => {
    const vars = createPanelThemeVars("light");

    expect(vars["--panel-shell-backdrop"]).toBe("color-mix(in srgb, var(--b3-theme-background) 82%, #efe4d2 18%)");
    expect(vars["--panel-toolbar-bg"]).toBe("rgba(255, 255, 255, 0.66)");
    expect(vars["--panel-preview-bg"]).toBe("linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(248, 240, 229, 0.9))");
    expect(vars["--panel-dot-border"]).toBe("#000000");
    expect(vars["--panel-clear-icon"]).toBe("#000000");
    expect(vars["--panel-clear-surface"]).toBe("rgba(255, 250, 242, 0.96)");
    expect(vars["--panel-divider"]).toBe("rgba(118, 89, 54, 0.12)");
    expect(vars["--panel-primary-button-bg"]).toBe("linear-gradient(135deg, #2c6b98 0%, #163f61 100%)");
    expect(vars["--panel-primary-button-text"]).toBe("#fdfaf4");
    expect(vars["--panel-control-bg"]).toBe("linear-gradient(180deg, rgba(255, 252, 247, 0.98), rgba(246, 238, 227, 0.94))");
    expect(vars["--panel-control-border"]).toBe("rgba(106, 80, 48, 0.22)");
    expect(vars["--panel-floating-outline"]).toBe("rgba(120, 93, 61, 0.12)");
  });
});
