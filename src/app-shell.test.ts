import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function getStyleBlock(source: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...source.matchAll(new RegExp(`${escapedSelector}\\s*\\{[^}]*\\}`, "gm"))];
  expect(matches.length).toBeGreaterThan(0);
  return matches.at(-1)![0];
}

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
    expect(appSource).toContain("导出样式");
    expect(appSource).toContain("导入样式");
    expect(appSource).toContain("@click=\"handleExtractStyles\"");
    expect(appSource).toContain("@click=\"handleResetAllStyles\"");
    expect(appSource).toContain("@click=\"handleExportStyles\"");
    expect(appSource).toContain("@click=\"openImportStylesPicker\"");
    expect(appSource).toContain("class=\"workspace-hero__actions\"");
    expect(appSource).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(appSource.indexOf("清除样式")).toBeLessThan(appSource.indexOf("导出样式"));
    expect(appSource.indexOf("导出样式")).toBeLessThan(appSource.indexOf("导入样式"));
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
    expect(appSource).toContain("即时预览，点击应用颜色后保存");
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

  it("uses a smaller target card title size for object labels like H1 标题", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");
    const titleBlock = getStyleBlock(appSource, ".target-preview-card__title");

    expect(titleBlock).toContain("font-size: 16px;");
    expect(titleBlock).not.toContain("font-size: 18px;");
  });

  it("lets target card labels inherit the selected preview text color", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");
    const titleBlock = getStyleBlock(appSource, ".target-preview-card__title");
    const eyebrowBlock = getStyleBlock(appSource, ".target-preview-card__eyebrow");

    expect(titleBlock).toContain("color: inherit;");
    expect(eyebrowBlock).toContain("color: inherit;");
  });

  it("uses standard-height hero action buttons instead of oversized pills", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain(".extract-styles-button,");
    expect(appSource).toContain(".export-styles-button,");
    expect(appSource).toContain(".import-styles-button,");
    expect(appSource).toContain(".reset-styles-button {");
    expect(appSource).toContain("min-height: 32px;");
    expect(appSource).toContain("padding: 0 12px;");
  });

  it("includes a hidden local json picker for batch style imports", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("ref=\"importFileInputRef\"");
    expect(appSource).toContain("type=\"file\"");
    expect(appSource).toContain("accept=\".json,application/json\"");
    expect(appSource).toContain("@change=\"handleImportStylesChange\"");
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

  it("centers the two color channel buttons within each target card", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");
    const actionsBlock = getStyleBlock(appSource, ".target-preview-card__actions");

    expect(actionsBlock).toContain("justify-content: center;");
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

  it("dismisses the floating palette through a backdrop and routes close actions through cancel semantics", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("class=\"inline-palette-backdrop\"");
    expect(appSource).toContain("@pointerdown=\"cancelInlinePalettePanel\"");
    expect(appSource).toContain("@click=\"cancelInlinePalettePanel\"");
  });

  it("emphasizes the apply button as the primary action inside the custom color panel", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");
    const applyButtonBlock = getStyleBlock(appSource, ".custom-color-apply");

    expect(appSource).toContain(".custom-color-field,");
    expect(appSource).toContain("min-height: 42px;");
    expect(applyButtonBlock).toContain("min-height: 44px;");
    expect(applyButtonBlock).toContain("border-width: 2px;");
    expect(applyButtonBlock).toContain("border-color: var(--panel-primary-button-border);");
    expect(applyButtonBlock).toContain("background: var(--panel-primary-button-bg);");
    expect(applyButtonBlock).toContain("color: var(--panel-primary-button-text);");
    expect(applyButtonBlock).toContain("font-size: 13px;");
    expect(applyButtonBlock).toContain("letter-spacing: 0.04em;");
    expect(applyButtonBlock).toContain("box-shadow: var(--panel-primary-button-shadow);");
  });

  it("gives the custom color input its own filled surface and visible border", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");
    const inputBlock = getStyleBlock(appSource, ".custom-color-field");

    expect(inputBlock).toContain("min-width: 0;");
    expect(inputBlock).toContain("box-sizing: border-box;");
    expect(inputBlock).toContain("background: var(--panel-control-bg);");
    expect(inputBlock).toContain("border-width: 1.5px;");
    expect(inputBlock).toContain("border-color: var(--panel-control-border);");
    expect(inputBlock).toContain("box-shadow:");
  });

  it("keeps the floating palette below host menus instead of pinning it to the topmost layer", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain(".inline-palette-panel--floating {");
    expect(appSource).toContain("position: fixed;");
    expect(appSource).toContain("z-index: 0;");
    expect(appSource).toContain("inset 0 0 0 1px var(--panel-floating-outline)");
    expect(appSource).not.toContain("z-index: 999;");
  });
});
