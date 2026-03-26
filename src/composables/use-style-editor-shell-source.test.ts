import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("style editor shell composable source", () => {
  it("drives an inline color board instead of delegating to a native picker popup", () => {
    const composableSource = readFileSync(resolve(process.cwd(), "src/composables/use-style-editor-shell.ts"), "utf8");

    expect(composableSource).toContain("const inlineColorFieldRef = ref<HTMLElement | null>(null);");
    expect(composableSource).toContain("const inlineHue = ref(0);");
    expect(composableSource).toContain("function handleInlineColorFieldPointerDown(event: PointerEvent)");
    expect(composableSource).toContain("function handleInlineHueInput(event: Event)");
    expect(composableSource).toContain("previewPaletteColor");
    expect(composableSource).toContain("persistCurrentStyles");
    expect(composableSource).toContain("function cancelInlinePalettePanel()");
  });

  it("wires export and local import handlers through a hidden file input", () => {
    const composableSource = readFileSync(resolve(process.cwd(), "src/composables/use-style-editor-shell.ts"), "utf8");

    expect(composableSource).toContain("const importFileInputRef = ref<HTMLInputElement | null>(null);");
    expect(composableSource).toContain("async function handleExportStyles()");
    expect(composableSource).toContain("function openImportStylesPicker()");
    expect(composableSource).toContain("async function handleImportStylesChange(event: Event)");
  });

  it("maps preset palette selections into standard color codes for the input field", () => {
    const composableSource = readFileSync(resolve(process.cwd(), "src/composables/use-style-editor-shell.ts"), "utf8");

    expect(composableSource).toContain("function handlePresetColorSelection(color: string)");
    expect(composableSource).toContain("const colorResolutionScope = computed(() => {");
    expect(composableSource).toContain("customColorDraft.value = resolveColorPickerValue(color, runtimeState.selectedChannel, colorResolutionScope.value);");
  });

  it("tracks the active coolors preset collection instead of channel-specific palette constants", () => {
    const composableSource = readFileSync(resolve(process.cwd(), "src/composables/use-style-editor-shell.ts"), "utf8");

    expect(composableSource).toContain("PRESET_PALETTE_COLLECTIONS");
    expect(composableSource).toContain("const activePresetPaletteId = ref(PRESET_PALETTE_COLLECTIONS[0]?.id ?? \"\");");
    expect(composableSource).toContain("const activePresetPalette = computed(() => {");
    expect(composableSource).toContain("function selectPresetPaletteTab(paletteId: string)");
    expect(composableSource).not.toContain("FOREGROUND_PALETTE");
    expect(composableSource).not.toContain("BACKGROUND_PALETTE");
  });

  it("owns a local collapse toggle for the preset palette section", () => {
    const composableSource = readFileSync(resolve(process.cwd(), "src/composables/use-style-editor-shell.ts"), "utf8");

    expect(composableSource).toContain("const isPresetPaletteSectionExpanded = ref(true);");
    expect(composableSource).toContain("function togglePresetPaletteSection()");
    expect(composableSource).toContain("isPresetPaletteSectionExpanded.value = !isPresetPaletteSectionExpanded.value;");
  });

  it("does not close the floating palette when scroll events originate from inside the palette", () => {
    const composableSource = readFileSync(resolve(process.cwd(), "src/composables/use-style-editor-shell.ts"), "utf8");

    expect(composableSource).toContain("function handleViewportScroll(event: Event)");
    expect(composableSource).toContain("const eventTarget = event.target;");
    expect(composableSource).toContain("floatingPaletteRef.value?.contains(eventTarget)");
    expect(composableSource).toContain("window.addEventListener(\"scroll\", handleViewportScroll, true);");
  });
});
