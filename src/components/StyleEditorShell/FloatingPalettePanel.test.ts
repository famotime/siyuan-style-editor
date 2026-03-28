import {
  createApp,
  h,
  nextTick,
  ref,
} from "vue";

import FloatingPalettePanel from "@/components/StyleEditorShell/FloatingPalettePanel.vue";

function createProps() {
  return {
    activePresetPalette: {
      colors: [
        { label: "#224488", value: "#224488" },
        { label: "#5B8DEF", value: "#5B8DEF" },
      ],
      id: "custom-palette-1",
      label: "My Favorite",
    },
    activePresetPaletteId: "custom-palette-1",
    colorPickerValue: "#224488",
    customColorDraft: "#224488",
    customColorPlaceholder: "#224488",
    floatingPaletteStyle: {
      left: "12px",
      top: "24px",
      transformOrigin: "top left",
    },
    inlineColorFieldStyle: {
      background: "linear-gradient(180deg, #fff, #000)",
    },
    inlineColorThumbStyle: {
      background: "#224488",
      left: "50%",
      top: "40%",
    },
    inlineHue: 218,
    isCustomColorDraftValid: true,
    isPresetPaletteSectionExpanded: true,
    panelThemeVars: {
      "--panel-accent-outline": "#7c92a4",
      "--panel-dot-border": "#000000",
    },
    presetPaletteCollections: [
      {
        colors: [
          { label: "#224488", value: "#224488" },
          { label: "#5B8DEF", value: "#5B8DEF" },
        ],
        id: "custom-palette-1",
        label: "My Favorite",
      },
      {
        colors: [
          { label: "#F6D365", value: "#F6D365" },
          { label: "#F2A65A", value: "#F2A65A" },
        ],
        id: "warm-sand",
        label: "Warm Sand",
      },
    ],
    selectedChannelLabel: "文字颜色",
    selectedSwatch: "#224488",
    selectedTargetLabel: "H1 标题",
    setFloatingPaletteRef: () => {},
    setInlineColorFieldRef: () => {},
    visible: true,
  } as const;
}

async function mountFloatingPalettePanel() {
  const onApplyCustomColor = vi.fn();
  const onApplyPresetPaletteSequence = vi.fn();
  const onClearSelectedTargetColor = vi.fn();
  const onDeletePresetPalette = vi.fn();
  const onSelectPresetColor = vi.fn();
  const onSelectPresetPaletteTab = vi.fn();
  const onTogglePresetPaletteSection = vi.fn();
  const onUpdateCustomColorDraft = vi.fn();
  const onHueInput = vi.fn();
  const onCancel = vi.fn();
  const customColorDraft = ref("#224488");
  const container = document.createElement("div");
  document.body.append(container);

  const app = createApp({
    render() {
      return h(FloatingPalettePanel, {
        ...createProps(),
        customColorDraft: customColorDraft.value,
        "onUpdate:customColorDraft": (value: string) => {
          customColorDraft.value = value;
          onUpdateCustomColorDraft(value);
        },
        onApplyCustomColor,
        onApplyPresetPaletteSequence,
        onClearSelectedTargetColor,
        onDeletePresetPalette,
        onSelectPresetColor,
        onSelectPresetPaletteTab,
        onTogglePresetPaletteSection,
        onHueInput,
        onCancel,
      });
    },
  });

  app.mount(container);
  await nextTick();

  return {
    container,
    customColorDraft,
    onApplyCustomColor,
    onApplyPresetPaletteSequence,
    onClearSelectedTargetColor,
    onDeletePresetPalette,
    onSelectPresetColor,
    onSelectPresetPaletteTab,
    onTogglePresetPaletteSection,
    onUpdateCustomColorDraft,
    onHueInput,
    onCancel,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

describe("FloatingPalettePanel", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("emits preset, delete, clear, and apply interactions from the rendered sections", async () => {
    const { onApplyCustomColor, onApplyPresetPaletteSequence, onClearSelectedTargetColor, onDeletePresetPalette, onSelectPresetColor, unmount } = await mountFloatingPalettePanel();

    const panel = document.body.querySelector(".inline-palette-panel");
    expect(panel).not.toBeNull();
    expect(panel?.textContent).toContain("My Favorite");

    const presetTabs = [...document.body.querySelectorAll(".preset-palette-tab")];
    presetTabs[0]?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(onApplyPresetPaletteSequence).toHaveBeenCalledWith("custom-palette-1");

    const deleteButton = document.body.querySelector(".preset-palette-tab__delete");
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    document.body.querySelector(".preset-palette-tab__delete-confirm")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onDeletePresetPalette).toHaveBeenCalledWith("custom-palette-1");

    const swatchButtons = [...document.body.querySelectorAll(".swatch-chip")];
    swatchButtons[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onSelectPresetColor).toHaveBeenCalledWith("#224488");

    swatchButtons.at(-1)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClearSelectedTargetColor).toHaveBeenCalledOnce();

    document.body.querySelector(".custom-color-apply")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onApplyCustomColor).toHaveBeenCalledOnce();

    unmount();
  });
});
