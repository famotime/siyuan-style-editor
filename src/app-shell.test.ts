import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("app shell layout", () => {
  it("renders a compact hero header and target studio", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("class=\"workspace-hero\"");
    expect(appSource).toContain("class=\"workspace-hero__copy\"");
    expect(appSource).toContain("class=\"target-studio\"");
    expect(appSource).not.toContain("class=\"workspace-toolbar\"");
  });

  it("keeps the primary actions inside the hero copy in a two-column action row", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("提取样式");
    expect(appSource).toContain("清除样式");
    expect(appSource).toContain("@click=\"handleExtractStyles\"");
    expect(appSource).toContain("@click=\"handleResetAllStyles\"");
    expect(appSource).toContain("class=\"workspace-hero__actions\"");
    expect(appSource).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(appSource).not.toContain("当前通道");
  });

  it("reduces the hero framing by removing the inner tinted card treatment", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain(".workspace-hero {");
    expect(appSource).toContain("padding: 2px 2px 0;");
    expect(appSource).not.toContain("linear-gradient(180deg, var(--panel-preview-bg), transparent 140%)");
  });

  it("removes the extra shell inset outline from the panel container", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain(".style-card {");
    expect(appSource).not.toContain(".style-card::after {");
  });

  it("packs the shell content toward the top and leaves slack space below", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain(".style-editor-shell {");
    expect(appSource).toContain("align-content: start;");
    expect(appSource).toContain(".style-card {");
    expect(appSource).toContain("padding: 12px 16px 22px;");
  });

  it("keeps the palette editor focused with a concise floating heading", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("Palette Console");
    expect(appSource).toContain("即时写入当前对象");
  });

  it("removes the selected badge and relies on subtler preview card typography", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).not.toContain("class=\"target-preview-card__badge\"");
    expect(appSource).toContain(".target-preview-card__surface {");
    expect(appSource).toContain("gap: 6px;");
    expect(appSource).toContain("min-height: 92px;");
    expect(appSource).toContain("padding: 14px;");
    expect(appSource).toContain(".target-preview-card__title {");
    expect(appSource).toContain("font-size: 18px;");
  });

  it("uses standard-height hero action buttons instead of oversized pills", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain(".extract-styles-button,");
    expect(appSource).toContain(".reset-styles-button {");
    expect(appSource).toContain("min-height: 32px;");
    expect(appSource).toContain("padding: 0 12px;");
  });

  it("uses tooltip-only color channel controls without visible labels or borders", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("data-tooltip=\"字色\"");
    expect(appSource).toContain("data-tooltip=\"底色\"");
    expect(appSource).not.toContain("<span class=\"channel-orb__label\">字色</span>");
    expect(appSource).not.toContain("<span class=\"channel-orb__label\">底色</span>");
    expect(appSource).toContain(".channel-orb {");
    expect(appSource).toContain("border: 0;");
    expect(appSource).toContain(".channel-orb::after {");
  });

  it("renders preset swatches as dense dot-only chips without visible text", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).not.toContain("class=\"swatch-chip__label\"");
    expect(appSource).toContain(":aria-label=\"color.label\"");
    expect(appSource).toContain("aria-label=\"恢复默认颜色\"");
    expect(appSource).toContain(".swatch-grid--inline {");
    expect(appSource).toContain("grid-template-columns: repeat(6, minmax(0, 1fr));");
    expect(appSource).toContain("gap: 6px;");
    expect(appSource).toContain(".swatch-chip {");
    expect(appSource).toContain("min-height: 40px;");
    expect(appSource).toContain("padding: 0;");
    expect(appSource).toContain("justify-content: center;");
  });

  it("renders an inline color board above the preset swatches inside the same floating palette", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("class=\"inline-color-picker\"");
    expect(appSource).toContain("class=\"inline-color-picker__field\"");
    expect(appSource).toContain("class=\"inline-color-picker__hue\"");
    expect(appSource).toContain("class=\"inline-color-picker__thumb\"");
    expect(appSource).toContain("@pointerdown=\"handleInlineColorFieldPointerDown\"");
    expect(appSource).toContain("@input=\"handleInlineHueInput\"");
    expect(appSource).toContain(".inline-color-picker {");
    expect(appSource).toContain(".inline-color-picker__field {");
    expect(appSource).toContain(".inline-color-picker__hue {");
    expect(appSource.indexOf("class=\"inline-color-picker\"")).toBeLessThan(appSource.indexOf("class=\"inline-palette-panel__presets\""));
    expect(appSource).not.toContain("type=\"color\"");
  });
});
