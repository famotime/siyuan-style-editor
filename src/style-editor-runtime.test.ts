import {
  applyPaletteColor,
  extractCurrentStyles,
  initializeRuntime,
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
