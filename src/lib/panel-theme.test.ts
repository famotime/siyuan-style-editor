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

  it("returns high-contrast dark theme tokens for the panel", () => {
    const vars = createPanelThemeVars("dark");

    expect(vars["--panel-text"]).toBe("var(--b3-theme-on-background)");
    expect(vars["--panel-chip-bg"]).toBe("color-mix(in srgb, var(--b3-theme-surface) 88%, #1a2330 12%)");
    expect(vars["--panel-preview-bg"]).toBe("color-mix(in srgb, var(--b3-theme-surface) 84%, #1f2937 16%)");
    expect(vars["--panel-dot-border"]).toBe("rgba(255, 255, 255, 0.16)");
  });
});
