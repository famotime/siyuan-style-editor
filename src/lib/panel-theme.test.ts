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
    expect(vars["--panel-dot-border"]).toBe("rgba(255, 255, 255, 0.12)");
  });

  it("returns warm light theme tokens for the panel", () => {
    const vars = createPanelThemeVars("light");

    expect(vars["--panel-shell-backdrop"]).toBe("color-mix(in srgb, var(--b3-theme-background) 82%, #efe4d2 18%)");
    expect(vars["--panel-toolbar-bg"]).toBe("rgba(255, 255, 255, 0.66)");
    expect(vars["--panel-preview-bg"]).toBe("linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(248, 240, 229, 0.9))");
    expect(vars["--panel-divider"]).toBe("rgba(118, 89, 54, 0.12)");
  });
});
