import {
  createDefaultEditorState,
  normalizeEditorState,
  resetEditorStyles,
  swapTargetChannelValues,
  updateTargetBackgroundColor,
  updateTargetColor,
} from "@/lib/style-editor-state";

describe("style editor state", () => {
  it("creates the expected default state", () => {
    const state = createDefaultEditorState();

    expect(state.customPresetPalettes).toEqual([]);
    expect(state.profile.heading1.color).toBe("");
    expect(state.profile.strong.color).toBe("");
    expect(state.profile.mark.backgroundColor).toBe("");
    expect(state.profile.codeBlock.backgroundColor).toBe("");
  });

  it("normalizes persisted state onto the full schema", () => {
    const state = normalizeEditorState({
      customPresetPalettes: [
        {
          colors: [{ label: "#3355aa", value: "#3355aa" }],
          id: "custom-palette-1",
          label: "Saved",
        },
      ],
      profile: { strong: { color: "rgb(1, 2, 3)" } },
    });

    expect(state.customPresetPalettes).toEqual([
      {
        colors: [{ label: "#3355aa", value: "#3355aa" }],
        id: "custom-palette-1",
        label: "Saved",
      },
    ]);
    expect(state.profile.strong.color).toBe("rgb(1, 2, 3)");
    expect(state.profile.heading3.color).toBe("");
    expect(state.profile.inlineCode.backgroundColor).toBe("");
    expect(state.profile.taskList.color).toBe("");
  });

  it("updates only the chosen target color", () => {
    const nextState = updateTargetColor({
      ...createDefaultEditorState(),
      customPresetPalettes: [{
        colors: [{ label: "#3355aa", value: "#3355aa" }],
        id: "custom-palette-1",
        label: "Saved",
      }],
    }, "heading2", "var(--b3-font-color4)");

    expect(nextState.customPresetPalettes).toEqual([{
      colors: [{ label: "#3355aa", value: "#3355aa" }],
      id: "custom-palette-1",
      label: "Saved",
    }]);
    expect(nextState.profile.heading2.color).toBe("var(--b3-font-color4)");
    expect(nextState.profile.heading1.color).toBe("");
    expect(nextState.profile.strong.color).toBe("");
  });

  it("updates only the chosen target background color", () => {
    const nextState = updateTargetBackgroundColor(createDefaultEditorState(), "mark", "var(--b3-font-background8)");

    expect(nextState.profile.mark.backgroundColor).toBe("var(--b3-font-background8)");
    expect(nextState.profile.heading2.backgroundColor).toBe("");
    expect(nextState.profile.blockquote.backgroundColor).toBe("");
  });

  it("resets all configured styles back to the default state", () => {
    const stateWithStyles = updateTargetBackgroundColor(
      updateTargetColor(createDefaultEditorState(), "heading2", "var(--b3-font-color4)"),
      "mark",
      "var(--b3-font-background8)",
    );

    const resetState = resetEditorStyles(stateWithStyles);

    expect(resetState.customPresetPalettes).toEqual([]);
    expect(resetState.profile.heading2.color).toBe("");
    expect(resetState.profile.mark.backgroundColor).toBe("");
    expect(resetState.profile.heading1.color).toBe("");
    expect(resetState.profile.codeBlock.backgroundColor).toBe("");
  });

  it("swaps colors between any two target channels", () => {
    const state = updateTargetBackgroundColor(
      updateTargetColor(createDefaultEditorState(), "heading2", "#224488"),
      "mark",
      "#fff2a8",
    );

    const swappedState = swapTargetChannelValues(
      state,
      { channel: "color", target: "heading2" },
      { channel: "backgroundColor", target: "mark" },
    );

    expect(swappedState.profile.heading2.color).toBe("#fff2a8");
    expect(swappedState.profile.mark.backgroundColor).toBe("#224488");
  });
});
