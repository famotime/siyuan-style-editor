import {
  applyPaletteColor,
  deleteCustomPresetPalette,
  exportCurrentStyles,
  extractCurrentStyles,
  importStyles,
  initializeRuntime,
  persistCurrentStyles,
  previewPaletteColor,
  resetAllStyles,
  runtimeState,
  saveCurrentProfileAsPresetPalette,
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
      customPresetPalettes: [],
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
      customPresetPalettes: [],
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
      customPresetPalettes: [],
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

    const exported = exportCurrentStyles({
      author: "Alice",
      styleName: "Paper Glow",
    });
    const payload = JSON.parse(exported);

    expect(payload).toMatchObject({
      author: "Alice",
      styleName: "Paper Glow",
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

  it("imports a local style document, returns its metadata, and persists it", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    const result = await importStyles(JSON.stringify({
      author: "Alice",
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
      styleName: "Paper Glow",
    }));

    expect(result).toEqual({
      metadata: {
        author: "Alice",
        styleName: "Paper Glow",
      },
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
      customPresetPalettes: [],
    });
  });

  it("saves the current selected colors as a custom preset palette and persists it to the front of the list", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    selectTarget("heading1");
    selectChannel("color");
    await applyPaletteColor("#3355aa");
    selectTarget("mark");
    selectChannel("backgroundColor");
    await applyPaletteColor("#fff2a8");
    vi.clearAllMocks();

    const result = await saveCurrentProfileAsPresetPalette("My Favorite");

    expect(result).toEqual(expect.objectContaining({
      colorCount: 2,
      label: "My Favorite",
      palette: expect.objectContaining({
        id: expect.stringMatching(/^custom-palette-/),
        label: "My Favorite",
      }),
    }));
    expect(runtimeState.customPresetPalettes[0]).toEqual({
      colors: [
        { label: "#3355aa", value: "#3355aa" },
        { label: "#fff2a8", value: "#fff2a8" },
      ],
      id: expect.stringMatching(/^custom-palette-/),
      label: "My Favorite",
    });
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", {
      profile: expect.objectContaining({
        heading1: expect.objectContaining({
          color: "#3355aa",
        }),
        mark: expect.objectContaining({
          backgroundColor: "#fff2a8",
        }),
      }),
      customPresetPalettes: [
        expect.objectContaining({
          id: expect.stringMatching(/^custom-palette-/),
          label: "My Favorite",
        }),
      ],
    });
  });

  it("deletes a saved custom preset palette and persists the remaining palette list", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    selectTarget("heading1");
    selectChannel("color");
    await applyPaletteColor("#3355aa");

    const savedPalette = await saveCurrentProfileAsPresetPalette("My Favorite");
    vi.clearAllMocks();

    const result = await deleteCustomPresetPalette(savedPalette.palette.id);

    expect(result).toEqual({
      id: savedPalette.palette.id,
      label: "My Favorite",
    });
    expect(runtimeState.customPresetPalettes).toEqual([]);
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", {
      profile: expect.objectContaining({
        heading1: expect.objectContaining({
          color: "#3355aa",
        }),
      }),
      customPresetPalettes: [],
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
