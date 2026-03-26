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
    const secondPaletteId = shell.presetPaletteCollections[1].id;
    const importedProfile = JSON.stringify({
      profile: {
        mark: {
          backgroundColor: "#fff2a8",
        },
      },
    });

    expect(shell.activePresetPaletteId.value).toBe(shell.presetPaletteCollections[0].id);
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
