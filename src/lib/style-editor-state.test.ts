import {
  createDefaultEditorState,
  normalizeEditorState,
  resetEditorStyles,
  updateTargetBackgroundColor,
  updateTargetColor,
} from "@/lib/style-editor-state";

describe("style editor state", () => {
  it("creates the expected default state", () => {
    const state = createDefaultEditorState();

    expect(state.profile.heading1.color).toBe("");
    expect(state.profile.strong.color).toBe("");
    expect(state.profile.mark.backgroundColor).toBe("");
    expect(state.profile.codeBlock.backgroundColor).toBe("");
  });

  it("normalizes persisted state onto the full schema", () => {
    const state = normalizeEditorState({
      profile: { strong: { color: "rgb(1, 2, 3)" } },
    });

    expect(state.profile.strong.color).toBe("rgb(1, 2, 3)");
    expect(state.profile.heading3.color).toBe("");
    expect(state.profile.inlineCode.backgroundColor).toBe("");
    expect(state.profile.taskList.color).toBe("");
  });

  it("updates only the chosen target color", () => {
    const nextState = updateTargetColor(createDefaultEditorState(), "heading2", "var(--b3-font-color4)");

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

    expect(resetState.profile.heading2.color).toBe("");
    expect(resetState.profile.mark.backgroundColor).toBe("");
    expect(resetState.profile.heading1.color).toBe("");
    expect(resetState.profile.codeBlock.backgroundColor).toBe("");
  });
});
