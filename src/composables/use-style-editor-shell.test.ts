import {
  createApp,
  defineComponent,
  h,
  nextTick,
} from "vue";

import {
  applyPaletteColor,
  initializeRuntime,
  runtimeState,
  selectChannel,
  selectTarget,
  teardownRuntime,
} from "@/style-editor-runtime";
import { useStyleEditorShell } from "@/composables/use-style-editor-shell";

function createPluginStub(savedState?: unknown) {
  return {
    loadData: vi.fn().mockResolvedValue(savedState),
    saveData: vi.fn().mockResolvedValue(undefined),
  };
}

async function mountShell() {
  let shell!: ReturnType<typeof useStyleEditorShell>;
  const container = document.createElement("div");
  document.body.append(container);

  const Harness = defineComponent({
    setup() {
      shell = useStyleEditorShell();
      return () => h("div");
    },
  });

  const app = createApp(Harness);
  app.mount(container);
  await nextTick();

  return {
    shell,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

async function flushShellUpdates() {
  await Promise.resolve();
  await nextTick();
}

function createAnchorElement() {
  const anchor = document.createElement("button");
  document.body.append(anchor);
  Object.defineProperty(anchor, "getBoundingClientRect", {
    value: () => ({
      bottom: 54,
      height: 24,
      left: 12,
      right: 56,
      toJSON: () => ({}),
      top: 30,
      width: 44,
      x: 12,
      y: 30,
    }),
  });
  return anchor;
}

describe("useStyleEditorShell", () => {
  afterEach(() => {
    teardownRuntime();
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("rolls previewed colors back on cancel and only persists on explicit apply", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    selectTarget("mark");
    selectChannel("backgroundColor");
    await applyPaletteColor("#fff2a8");
    vi.clearAllMocks();

    const { shell, unmount } = await mountShell();
    const anchor = createAnchorElement();

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent);
    await shell.handlePresetColorSelection("#f6d365");

    expect(runtimeState.profile.mark.backgroundColor).toBe("#f6d365");
    expect(plugin.saveData).not.toHaveBeenCalled();

    await shell.cancelInlinePalettePanel();

    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8");
    expect(shell.isInlinePaletteVisible.value).toBe(false);
    expect(plugin.saveData).not.toHaveBeenCalled();

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent);
    await shell.handlePresetColorSelection("#d97706");
    await shell.applyCustomColorDraft();

    expect(runtimeState.profile.mark.backgroundColor).toBe("#d97706");
    expect(shell.isInlinePaletteVisible.value).toBe(false);
    expect(plugin.saveData).toHaveBeenCalledOnce();

    unmount();
    anchor.remove();
  });

  it("keeps the palette open for internal scroll events but closes on escape and outside scroll", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    const originalAddEventListener = window.addEventListener.bind(window);
    let scrollHandler: ((event: Event) => void) | undefined;
    vi.spyOn(window, "addEventListener").mockImplementation(((type, listener, options) => {
      if (type === "scroll") {
        scrollHandler = listener as (event: Event) => void;
      }
      originalAddEventListener(type, listener, options);
    }) as typeof window.addEventListener);

    selectTarget("mark");
    selectChannel("backgroundColor");
    await applyPaletteColor("#fff2a8");
    vi.clearAllMocks();

    const { shell, unmount } = await mountShell();
    const anchor = createAnchorElement();
    const floatingPalette = document.createElement("div");
    const floatingPaletteChild = document.createElement("div");
    floatingPalette.append(floatingPaletteChild);
    document.body.append(floatingPalette);
    shell.floatingPaletteRef.value = floatingPalette;
    expect(scrollHandler).toBeTypeOf("function");

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent);
    await shell.handlePresetColorSelection("#f6d365");

    scrollHandler!({ target: floatingPaletteChild } as Event);
    await flushShellUpdates();

    expect(shell.isInlinePaletteVisible.value).toBe(true);
    expect(runtimeState.profile.mark.backgroundColor).toBe("#f6d365");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushShellUpdates();

    expect(shell.isInlinePaletteVisible.value).toBe(false);
    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8");
    expect(plugin.saveData).not.toHaveBeenCalled();

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent);
    await shell.handlePresetColorSelection("#c2410c");

    scrollHandler!({ target: document.body } as Event);
    await flushShellUpdates();

    expect(shell.isInlinePaletteVisible.value).toBe(false);
    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8");
    expect(plugin.saveData).not.toHaveBeenCalled();

    unmount();
    floatingPalette.remove();
    anchor.remove();
  });

  it("resets the import input and maintains preset palette UI state", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    const { shell, unmount } = await mountShell();
    const secondPaletteId = shell.presetPaletteCollections.value[1].id;
    const importedProfile = JSON.stringify({
      profile: {
        mark: {
          backgroundColor: "#fff2a8",
        },
      },
    });

    expect(shell.activePresetPaletteId.value).toBe(shell.presetPaletteCollections.value[0].id);
    expect(shell.isPresetPaletteSectionExpanded.value).toBe(true);

    shell.selectPresetPaletteTab(secondPaletteId);
    expect(shell.activePresetPaletteId.value).toBe(secondPaletteId);

    shell.selectPresetPaletteTab("missing-palette");
    expect(shell.activePresetPaletteId.value).toBe(secondPaletteId);

    shell.togglePresetPaletteSection();
    expect(shell.isPresetPaletteSectionExpanded.value).toBe(false);

    const input = {
      files: [
        {
          text: vi.fn().mockResolvedValue(importedProfile),
        },
      ],
      value: "selected.json",
    } as unknown as HTMLInputElement;

    await shell.handleImportStylesChange({ target: input } as Event);

    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8");
    expect(plugin.saveData).toHaveBeenCalledOnce();
    expect(input.value).toBe("");
    expect(shell.statusCopy.value).toContain("已导入本地配置");

    unmount();
  });

  it("saves the current colors as a custom preset palette at the front of the list when given a name", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    selectTarget("heading1");
    selectChannel("color");
    await applyPaletteColor("#3355aa");
    selectTarget("mark");
    selectChannel("backgroundColor");
    await applyPaletteColor("#fff2a8");
    vi.clearAllMocks();

    const { shell, unmount } = await mountShell();

    await shell.handleSavePresetPalette("My Favorite");

    expect(shell.presetPaletteCollections.value[0]).toEqual(expect.objectContaining({
      id: expect.stringMatching(/^custom-palette-/),
      label: "My Favorite",
    }));
    expect(shell.presetPaletteCollections.value[0]?.colors).toEqual([
      { label: "#3355aa", value: "#3355aa" },
      { label: "#fff2a8", value: "#fff2a8" },
    ]);
    expect(shell.activePresetPaletteId.value).toBe(shell.presetPaletteCollections.value[0]?.id);
    expect(shell.statusCopy.value).toBe("当前颜色配置已经保存为色卡「My Favorite」，供后续选色使用。");
    expect(plugin.saveData).toHaveBeenCalledOnce();

    unmount();
  });

  it("keeps the floating palette top position stable when collapsing preset palettes", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    const { shell, unmount } = await mountShell();
    const anchor = document.createElement("button");
    let floatingPaletteHeight = 320;

    document.body.append(anchor);
    Object.defineProperty(anchor, "getBoundingClientRect", {
      value: () => ({
        bottom: 540,
        height: 40,
        left: 180,
        right: 224,
        toJSON: () => ({}),
        top: 500,
        width: 44,
        x: 180,
        y: 500,
      }),
    });

    const floatingPalette = document.createElement("div");
    Object.defineProperty(floatingPalette, "getBoundingClientRect", {
      value: () => ({
        bottom: 100 + floatingPaletteHeight,
        height: floatingPaletteHeight,
        left: 120,
        right: 416,
        toJSON: () => ({}),
        top: 100,
        width: 296,
        x: 120,
        y: 100,
      }),
    });
    document.body.append(floatingPalette);
    shell.floatingPaletteRef.value = floatingPalette;

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent);
    await flushShellUpdates();

    expect(shell.floatingPaletteStyle.value.top).toBe("172px");

    floatingPaletteHeight = 120;
    shell.togglePresetPaletteSection();
    await flushShellUpdates();

    expect(shell.isPresetPaletteSectionExpanded.value).toBe(false);
    expect(shell.floatingPaletteStyle.value.top).toBe("172px");

    unmount();
    floatingPalette.remove();
    anchor.remove();
  });

  it("deletes a custom preset palette, updates the status copy, and falls back to the first remaining palette", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    selectTarget("heading1");
    selectChannel("color");
    await applyPaletteColor("#3355aa");

    const { shell, unmount } = await mountShell();

    await shell.handleSavePresetPalette("My Favorite");
    const savedPaletteId = shell.presetPaletteCollections.value[0]?.id;

    expect(savedPaletteId).toMatch(/^custom-palette-/);
    expect(shell.activePresetPaletteId.value).toBe(savedPaletteId);

    await shell.handleDeletePresetPalette(savedPaletteId!);

    expect(shell.presetPaletteCollections.value.some(palette => palette.id === savedPaletteId)).toBe(false);
    expect(shell.activePresetPaletteId.value).toBe("fiery-ocean");
    expect(shell.statusCopy.value).toBe("已删除色卡「My Favorite」。");
    expect(plugin.saveData).toHaveBeenCalledTimes(3);

    unmount();
  });

  it("surfaces import parsing errors without losing the original message", async () => {
    const plugin = createPluginStub();
    await initializeRuntime(plugin as never);

    const { shell, unmount } = await mountShell();
    const input = {
      files: [
        {
          text: vi.fn().mockResolvedValue("{"),
        },
      ],
      value: "invalid.json",
    } as unknown as HTMLInputElement;

    await shell.handleImportStylesChange({ target: input } as Event);

    expect(shell.statusCopy.value).toBe("样式配置文件不是有效的 JSON。");
    expect(input.value).toBe("");
    expect(plugin.saveData).not.toHaveBeenCalled();

    unmount();
  });
});
