import {
  createDefaultEditorState,
  createTemplateRefFromProtyle,
  normalizeEditorState,
  updateTargetColor,
} from "@/lib/style-editor-state";

describe("style editor state", () => {
  it("creates the expected default state", () => {
    const state = createDefaultEditorState();

    expect(state.template.docId).toBe("");
    expect(state.template.path).toBe("");
    expect(state.profile.heading1.color).toBe("");
    expect(state.profile.strong.color).toBe("");
  });

  it("normalizes persisted state onto the full schema", () => {
    const state = normalizeEditorState({
      template: { docId: "doc-1" },
      profile: { strong: { color: "rgb(1, 2, 3)" } },
    });

    expect(state.template.docId).toBe("doc-1");
    expect(state.template.path).toBe("");
    expect(state.profile.strong.color).toBe("rgb(1, 2, 3)");
    expect(state.profile.heading3.color).toBe("");
  });

  it("updates only the chosen target color", () => {
    const nextState = updateTargetColor(createDefaultEditorState(), "heading2", "var(--b3-font-color4)");

    expect(nextState.profile.heading2.color).toBe("var(--b3-font-color4)");
    expect(nextState.profile.heading1.color).toBe("");
    expect(nextState.profile.strong.color).toBe("");
  });

  it("creates a template reference from an active protyle snapshot", () => {
    const template = createTemplateRefFromProtyle({
      block: { rootID: "20260324-doc" },
      path: "/Templates/StyleDoc",
    });

    expect(template).toEqual({
      docId: "20260324-doc",
      path: "/Templates/StyleDoc",
    });
  });

  it("returns null when the active protyle has no document id", () => {
    const template = createTemplateRefFromProtyle({
      block: {},
      path: "/Templates/StyleDoc",
    });

    expect(template).toBeNull();
  });
});
