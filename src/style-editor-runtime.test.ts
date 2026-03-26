import {
  applyPaletteColor,
  exportCurrentStyles,
  extractCurrentStyles,
  importStyles,
  initializeRuntime,
  PRESET_PALETTE_COLLECTIONS,
  persistCurrentStyles,
  previewPaletteColor,
  resetAllStyles,
  runtimeState,
  selectChannel,
  selectTarget,
  teardownRuntime,
} from "@/style-editor-runtime";

function createPluginStub(savedState?: unknown) {
  return {
    loadData: vi.fn().mockResolvedValue(savedState),
    saveData: vi.fn().mockResolvedValue(undefined),
  };
}

describe("style editor runtime", () => {
  afterEach(() => {
    teardownRuntime();
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("exposes ten coolors preset palette collections with concrete hex swatches", () => {
    expect(PRESET_PALETTE_COLLECTIONS).toHaveLength(10);
    expect(PRESET_PALETTE_COLLECTIONS.map(palette => palette.label)).toEqual([
      "Fiery Ocean",
      "Olive Garden Feast",
      "Sunny Beach Day",
      "Dark Sunset",
      "Summer Dream",
      "Vibrant Color Fiesta",
      "Summer Ocean Breeze",
      "Refreshing Summer Fun",
      "Fiery Palette",
      "Watermelon Sorbet",
    ]);

    for (const palette of PRESET_PALETTE_COLLECTIONS) {
      expect(palette.colors.length).toBeGreaterThanOrEqual(5);
      expect(new Set(palette.colors.map(color => color.value)).size).toBe(palette.colors.length);
      for (const color of palette.colors) {
        expect(color.value).toMatch(/^#[0-9A-F]{6}$/);
      }
    }

    expect(PRESET_PALETTE_COLLECTIONS[0].colors.map(color => color.value)).toEqual([
      "#780000",
      "#C1121F",
      "#FDF0D5",
      "#003049",
      "#669BBC",
    ]);
  });

  it("initializes from persisted state and injects the stylesheet", async () => {
    const plugin = createPluginStub({
      profile: {
        heading1: { color: "rgb(200, 40, 40)" },
      },
    });

    await initializeRuntime(plugin as never);

    expect(plugin.loadData).toHaveBeenCalledWith("style-editor.json");
    expect(runtimeState.ready).toBe(true);
    expect(runtimeState.profile.heading1.color).toBe("rgb(200, 40, 40)");

    const styleElement = document.getElementById("siyuan-style-editor-style");
    expect(styleElement?.textContent).toContain('[data-type="NodeHeading"].h1');
    expect(styleElement?.textContent).toContain("color: rgb(200, 40, 40) !important;");
  });

  it("applies palette colors, persists them, and resets back to defaults", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    selectTarget("mark");
    selectChannel("backgroundColor");
    await applyPaletteColor("#f6d365");

    expect(runtimeState.profile.mark.backgroundColor).toBe("#f6d365");
    expect(plugin.saveData).toHaveBeenLastCalledWith("style-editor.json", {
      profile: expect.objectContaining({
        mark: expect.objectContaining({
          backgroundColor: "#f6d365",
        }),
      }),
    });

    const styleElement = document.getElementById("siyuan-style-editor-style");
    expect(styleElement?.textContent).toContain("background-color: #f6d365 !important;");

    await resetAllStyles();

    expect(runtimeState.profile.mark.backgroundColor).toBe("");
    expect(plugin.saveData).toHaveBeenCalledTimes(2);
    expect(styleElement?.textContent).toBe("");
  });

  it("previews palette colors without persisting until they are explicitly applied", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    selectTarget("mark");
    selectChannel("backgroundColor");
    await previewPaletteColor("#f6d365");

    expect(runtimeState.profile.mark.backgroundColor).toBe("#f6d365");
    expect(plugin.saveData).not.toHaveBeenCalled();

    const styleElement = document.getElementById("siyuan-style-editor-style");
    expect(styleElement?.textContent).toContain("background-color: #f6d365 !important;");

    await persistCurrentStyles();

    expect(plugin.saveData).toHaveBeenCalledOnce();
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", {
      profile: expect.objectContaining({
        mark: expect.objectContaining({
          backgroundColor: "#f6d365",
        }),
      }),
    });
  });

  it("can roll previewed palette colors back to the last committed value without persisting", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    selectTarget("mark");
    selectChannel("backgroundColor");
    await applyPaletteColor("#fff2a8");
    vi.clearAllMocks();

    await previewPaletteColor("#f6d365");
    await previewPaletteColor("#fff2a8");

    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8");
    expect(plugin.saveData).not.toHaveBeenCalled();

    const styleElement = document.getElementById("siyuan-style-editor-style");
    expect(styleElement?.textContent).toContain("background-color: #fff2a8 !important;");
  });

  it("extracts styles from the current document and persists the extracted profile", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    document.body.innerHTML = `
      <div class="protyle-wysiwyg" style="color: rgb(34, 34, 34);">
        <div data-type="NodeHeading" class="h1" style="color: rgb(200, 40, 40);">Heading 1</div>
        <mark style="background-color: rgb(255, 240, 180);">Mark</mark>
      </div>
    `;

    const result = await extractCurrentStyles();

    expect(result).toEqual({
      extractedTargetCount: 2,
      matchedTargetCount: 2,
    });
    expect(runtimeState.profile.heading1.color).toBe("rgb(200, 40, 40)");
    expect(runtimeState.profile.mark.backgroundColor).toBe("rgb(255, 240, 180)");
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", {
      profile: expect.objectContaining({
        heading1: expect.objectContaining({
          color: "rgb(200, 40, 40)",
        }),
        mark: expect.objectContaining({
          backgroundColor: "rgb(255, 240, 180)",
        }),
      }),
    });
  });

  it("exports the current profile as a portable style document", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    selectTarget("mark");
    selectChannel("backgroundColor");
    await applyPaletteColor("#f6d365");

    const exported = exportCurrentStyles();
    const payload = JSON.parse(exported);

    expect(payload).toMatchObject({
      type: "siyuan-style-editor-profile",
      version: 1,
      profile: expect.objectContaining({
        mark: expect.objectContaining({
          backgroundColor: "#f6d365",
        }),
      }),
    });
    expect(typeof payload.exportedAt).toBe("string");
  });

  it("imports a local style document, updates runtime state, and persists it", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    const result = await importStyles(JSON.stringify({
      type: "siyuan-style-editor-profile",
      version: 1,
      exportedAt: "2026-03-26T00:00:00.000Z",
      profile: {
        heading2: {
          color: "#3355aa",
        },
        mark: {
          backgroundColor: "#fff2a8",
        },
      },
    }));

    expect(result).toEqual({
      styledTargetCount: 2,
    });
    expect(runtimeState.profile.heading2.color).toBe("#3355aa");
    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8");
    expect(plugin.saveData).toHaveBeenLastCalledWith("style-editor.json", {
      profile: expect.objectContaining({
        heading2: expect.objectContaining({
          color: "#3355aa",
        }),
        mark: expect.objectContaining({
          backgroundColor: "#fff2a8",
        }),
      }),
    });
  });

  it("tears down the runtime state and removes the stylesheet", async () => {
    const plugin = createPluginStub({
      profile: {
        heading1: { color: "rgb(200, 40, 40)" },
      },
    });

    await initializeRuntime(plugin as never);
    teardownRuntime();

    expect(runtimeState.ready).toBe(false);
    expect(runtimeState.selectedTarget).toBe("heading1");
    expect(runtimeState.selectedChannel).toBe("color");
    expect(runtimeState.profile.heading1.color).toBe("");
    expect(document.getElementById("siyuan-style-editor-style")).toBeNull();
  });
});
