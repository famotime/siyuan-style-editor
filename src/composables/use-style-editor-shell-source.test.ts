import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("style editor shell composable source", () => {
  it("drives an inline color board instead of delegating to a native picker popup", () => {
    const composableSource = readFileSync(resolve(process.cwd(), "src/composables/use-style-editor-shell.ts"), "utf8");

    expect(composableSource).toContain("const inlineColorFieldRef = ref<HTMLElement | null>(null);");
    expect(composableSource).toContain("const inlineHue = ref(0);");
    expect(composableSource).toContain("function handleInlineColorFieldPointerDown(event: PointerEvent)");
    expect(composableSource).toContain("function handleInlineHueInput(event: Event)");
    expect(composableSource).toContain("queueInlineColorApply");
  });

  it("wires export and local import handlers through a hidden file input", () => {
    const composableSource = readFileSync(resolve(process.cwd(), "src/composables/use-style-editor-shell.ts"), "utf8");

    expect(composableSource).toContain("const importFileInputRef = ref<HTMLInputElement | null>(null);");
    expect(composableSource).toContain("async function handleExportStyles()");
    expect(composableSource).toContain("function openImportStylesPicker()");
    expect(composableSource).toContain("async function handleImportStylesChange(event: Event)");
  });
});
