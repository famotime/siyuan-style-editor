import {
  createApp,
  nextTick,
  reactive,
  ref,
} from "vue";

const mockUseStyleEditorShell = vi.hoisted(() => vi.fn());

vi.mock("@/composables/use-style-editor-shell", () => ({
  useStyleEditorShell: () => mockUseStyleEditorShell(),
}));

import App from "@/App.vue";

function createShellState(options: {
  isInlinePaletteVisible?: boolean;
  isPresetPaletteSectionExpanded?: boolean;
} = {}) {
  const runtimeState = reactive({
    profile: {
      heading1: {
        backgroundColor: "",
        color: "#224488",
      },
      mark: {
        backgroundColor: "#fff2a8",
        color: "",
      },
    },
    selectedChannel: "color",
    selectedTarget: "heading1",
  });

  return {
    STYLE_TARGET_OPTIONS: [
      {
        hint: "用于文章总标题与大章节入口",
        label: "H1 标题",
        shortLabel: "H1",
        value: "heading1",
      },
      {
        hint: "用于显式标记重点内容",
        label: "高亮文本",
        shortLabel: "HL",
        value: "mark",
      },
    ],
    activePresetPalette: ref({
      colors: [
        { label: "#5B8DEF", value: "#5B8DEF" },
        { label: "#F6D365", value: "#F6D365" },
      ],
      id: "cool-blue",
      label: "Cool Blue",
    }),
    activePresetPaletteId: ref("cool-blue"),
    activateTargetChannel: vi.fn(),
    applyCustomColorDraft: vi.fn(),
    cancelInlinePalettePanel: vi.fn(),
    colorPickerValue: ref("#5b8def"),
    customColorDraft: ref("#5b8def"),
    customColorPlaceholder: ref("#5b8def"),
    floatingPaletteRef: ref<HTMLElement | null>(null),
    floatingPaletteStyle: ref({
      left: "12px",
      top: "24px",
      transformOrigin: "top left",
    }),
    getChannelSwatch: vi.fn((target: string, channel: string) => ({
      background: channel === "color"
        ? runtimeState.profile[target as "heading1" | "mark"].color || "var(--panel-text)"
        : runtimeState.profile[target as "heading1" | "mark"].backgroundColor || "linear-gradient(135deg, #fff, #eee)",
      isEmpty: false,
    })),
    getTargetPreviewStyle: vi.fn((target: string) => ({
      color: runtimeState.profile[target as "heading1" | "mark"].color || "var(--panel-text)",
    })),
    handleClearSelectedTargetColor: vi.fn(),
    handleExportStyles: vi.fn(),
    handleExtractStyles: vi.fn(),
    handleImportStylesChange: vi.fn(),
    handleInlineColorFieldPointerDown: vi.fn(),
    handleInlineHueInput: vi.fn(),
    handlePresetColorSelection: vi.fn(),
    handleResetAllStyles: vi.fn(),
    importFileInputRef: ref<HTMLInputElement | null>(null),
    inlineColorFieldRef: ref<HTMLElement | null>(null),
    inlineColorFieldStyle: ref({
      background: "linear-gradient(180deg, #fff, #000)",
    }),
    inlineColorThumbStyle: ref({
      background: "#5b8def",
      left: "50%",
      top: "40%",
    }),
    inlineHue: ref(218),
    isCustomColorDraftValid: ref(true),
    isInlinePaletteOpenForTarget: vi.fn((target: string) => target === "heading1"),
    isInlinePaletteVisible: ref(options.isInlinePaletteVisible ?? false),
    isPresetPaletteSectionExpanded: ref(options.isPresetPaletteSectionExpanded ?? true),
    openImportStylesPicker: vi.fn(),
    panelThemeVars: ref({
      "--panel-text": "#111111",
    }),
    presetPaletteCollections: [
      {
        colors: [
          { label: "#5B8DEF", value: "#5B8DEF" },
          { label: "#91C8FF", value: "#91C8FF" },
          { label: "#F6D365", value: "#F6D365" },
        ],
        id: "cool-blue",
        label: "Cool Blue",
      },
      {
        colors: [
          { label: "#F6D365", value: "#F6D365" },
          { label: "#F2A65A", value: "#F2A65A" },
          { label: "#D97B2D", value: "#D97B2D" },
        ],
        id: "warm-sand",
        label: "Warm Sand",
      },
    ],
    runtimeState,
    selectPresetPaletteTab: vi.fn(),
    selectedChannelLabel: ref("文字颜色"),
    selectedSwatch: ref("#5B8DEF"),
    selectedTargetMeta: ref({
      hint: "用于文章总标题与大章节入口",
      label: "H1 标题",
      shortLabel: "H1",
      value: "heading1",
    }),
    selectPreviewTarget: vi.fn(),
    statusCopy: ref("当前正在编辑标题颜色"),
    togglePresetPaletteSection: vi.fn(),
  };
}

async function mountApp(shellState: ReturnType<typeof createShellState>) {
  mockUseStyleEditorShell.mockReturnValue(shellState);

  const container = document.createElement("div");
  document.body.append(container);

  const app = createApp(App);
  app.mount(container);
  await nextTick();

  return {
    container,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

function click(element: Element | null) {
  expect(element).not.toBeNull();
  element!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

describe("app shell", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders the hero actions in order and wires the import input", async () => {
    const shellState = createShellState();
    const { container, unmount } = await mountApp(shellState);

    const heroButtons = [...container.querySelectorAll(".workspace-hero__actions button")];
    expect(heroButtons.map(button => button.textContent?.trim())).toEqual([
      "提取样式",
      "清除样式",
      "导出样式",
      "导入样式",
    ]);

    click(heroButtons[0]);
    click(heroButtons[1]);
    click(heroButtons[2]);
    click(heroButtons[3]);

    expect(shellState.handleExtractStyles).toHaveBeenCalledOnce();
    expect(shellState.handleResetAllStyles).toHaveBeenCalledOnce();
    expect(shellState.handleExportStyles).toHaveBeenCalledOnce();
    expect(shellState.openImportStylesPicker).toHaveBeenCalledOnce();

    const input = container.querySelector(".workspace-hero__file-input");
    expect(input?.getAttribute("type")).toBe("file");
    expect(input?.getAttribute("accept")).toBe(".json,application/json");
    expect(shellState.importFileInputRef.value).toBe(input);
    input?.dispatchEvent(new Event("change", { bubbles: true }));
    expect(shellState.handleImportStylesChange).toHaveBeenCalledOnce();

    expect(container.querySelector(".inline-palette-panel")).toBeNull();

    unmount();
  });

  it("renders target cards from the style target catalog and wires card actions", async () => {
    const shellState = createShellState();
    const { container, unmount } = await mountApp(shellState);

    const cards = [...container.querySelectorAll(".target-preview-card")];
    expect(cards).toHaveLength(2);
    expect(cards[0]?.classList.contains("target-preview-card--selected")).toBe(true);
    expect(cards[1]?.classList.contains("target-preview-card--selected")).toBe(false);

    click(cards[1]?.querySelector(".target-preview-card__surface") ?? null);
    expect(shellState.selectPreviewTarget).toHaveBeenCalledWith("mark");

    const secondCardButtons = cards[1]?.querySelectorAll(".channel-orb") ?? [];
    click(secondCardButtons[0] ?? null);
    click(secondCardButtons[1] ?? null);

    expect(shellState.activateTargetChannel).toHaveBeenNthCalledWith(1, "mark", "color", expect.any(MouseEvent));
    expect(shellState.activateTargetChannel).toHaveBeenNthCalledWith(2, "mark", "backgroundColor", expect.any(MouseEvent));

    unmount();
  });

  it("renders the floating palette with the expected controls and interaction wiring", async () => {
    const shellState = createShellState({
      isInlinePaletteVisible: true,
      isPresetPaletteSectionExpanded: true,
    });
    const { container, unmount } = await mountApp(shellState);

    expect(document.body.querySelector(".inline-palette-panel")).not.toBeNull();
    expect(document.body.textContent).toContain("正在编辑 H1 标题 的文字颜色");

    const customColorField = document.body.querySelector(".custom-color-field") as HTMLInputElement | null;
    expect(customColorField?.value).toBe("#5b8def");
    expect(customColorField?.placeholder).toBe("#5b8def");
    expect(shellState.floatingPaletteRef.value).toBe(document.body.querySelector(".inline-palette-panel--floating"));
    expect(shellState.inlineColorFieldRef.value).toBe(document.body.querySelector(".inline-color-picker__field"));

    const presetTabs = [...document.body.querySelectorAll(".preset-palette-tab")];
    expect(presetTabs).toHaveLength(2);
    expect(presetTabs[0]?.getAttribute("style")).toContain("linear-gradient(");
    expect(presetTabs[0]?.getAttribute("style")).toContain("#5B8DEF");
    expect(presetTabs[0]?.getAttribute("style")).toContain("#F6D365");
    click(presetTabs[1] ?? null);
    expect(shellState.selectPresetPaletteTab).toHaveBeenCalledWith("warm-sand");

    click(document.body.querySelector(".inline-palette-panel__toggle"));
    expect(shellState.togglePresetPaletteSection).toHaveBeenCalledOnce();

    click(document.body.querySelector(".custom-color-apply"));
    expect(shellState.applyCustomColorDraft).toHaveBeenCalledOnce();

    const swatchButtons = [...document.body.querySelectorAll(".swatch-chip")];
    expect(swatchButtons).toHaveLength(3);
    click(swatchButtons[0] ?? null);
    expect(shellState.handlePresetColorSelection).toHaveBeenCalledWith("#5B8DEF");

    click(swatchButtons.at(-1) ?? null);
    expect(shellState.handleClearSelectedTargetColor).toHaveBeenCalledOnce();

    click(document.body.querySelector(".inline-palette-panel__close"));
    expect(shellState.cancelInlinePalettePanel).toHaveBeenCalledOnce();

    expect(container.querySelector(".style-editor-shell")).not.toBeNull();

    unmount();
  });

  it("renders the floating palette above the default document layer", async () => {
    const shellState = createShellState({
      isInlinePaletteVisible: true,
    });
    const { unmount } = await mountApp(shellState);

    const backdrop = document.body.querySelector(".inline-palette-backdrop");
    const panel = document.body.querySelector(".inline-palette-panel--floating");

    expect(backdrop).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(getComputedStyle(backdrop as Element).zIndex).toBe("10");
    expect(getComputedStyle(panel as Element).zIndex).toBe("11");

    unmount();
  });

  it("renders the clear swatch as a slashed circular icon without visible text", async () => {
    const shellState = createShellState({
      isInlinePaletteVisible: true,
      isPresetPaletteSectionExpanded: true,
    });
    const { unmount } = await mountApp(shellState);

    const clearChip = document.body.querySelector(".swatch-chip--clear");

    expect(clearChip).not.toBeNull();
    expect(clearChip?.getAttribute("aria-label")).toBe("恢复默认颜色");
    expect(clearChip?.textContent?.trim()).toBe("");
    expect(clearChip?.querySelector(".swatch-chip__dot-clear-surface")).not.toBeNull();
    expect(clearChip?.querySelector(".swatch-chip__dot-clear-slash")).not.toBeNull();

    unmount();
  });
});
