import {
  createDefaultEditorState,
  normalizeEditorState,
  resetEditorStyles,
  swapTargetChannelValues,
  updateFeatureConfig,
  updateTargetBackgroundColor,
  updateTargetColor,
} from "@/lib/style-editor-state"

describe("style editor state", () => {
  it("creates the expected default state", () => {
    const state = createDefaultEditorState()

    expect(state.customPresetPalettes).toEqual([])
    expect(state.profile.heading1.color).toBe("var(--style-editor-heading1-color)")
    expect(state.profile.strong.color).toBe("var(--style-editor-strong-color)")
    expect(state.profile.mark.backgroundColor).toBe("var(--style-editor-mark-bg)")
    expect(state.profile.codeBlock.backgroundColor).toBe("var(--style-editor-code-block-bg)")
    expect(state.featureProfile.paragraphHover.enabled).toBe(false)
    expect(state.featureProfile.imageRadius.values.radius).toBe(6)
  })

  it("normalizes persisted state onto the full schema", () => {
    const state = normalizeEditorState({
      customPresetPalettes: [
        {
          colors: [{
            label: "#3355aa",
            value: "#3355aa",
          }],
          id: "custom-palette-1",
          label: "Saved",
        },
      ],
      featureProfile: {
        imageRadius: {
          enabled: true,
          values: {
            radius: 14,
          },
        },
      },
      profile: { strong: { color: "rgb(1, 2, 3)" } },
    })

    expect(state.customPresetPalettes).toEqual([
      {
        colors: [{
          label: "#3355aa",
          value: "#3355aa",
        }],
        id: "custom-palette-1",
        label: "Saved",
      },
    ])
    expect(state.profile.strong.color).toBe("rgb(1, 2, 3)")
    expect(state.profile.heading3.color).toBe("var(--style-editor-heading3-color)")
    expect(state.profile.inlineCode.backgroundColor).toBe("var(--style-editor-inline-code-bg)")
    expect(state.profile.taskList.color).toBe("var(--style-editor-list-color)")
    expect(state.featureProfile.imageRadius.enabled).toBe(true)
    expect(state.featureProfile.imageRadius.values.radius).toBe(14)
    expect(state.featureProfile.linkStyle.enabled).toBe(false)
  })

  it("updates one feature config without changing target styles", () => {
    const nextState = updateFeatureConfig(createDefaultEditorState(), "paragraphHover", {
      enabled: true,
      values: {
        backgroundColor: "#eeeeee",
      },
    })

    expect(nextState.featureProfile.paragraphHover.enabled).toBe(true)
    expect(nextState.featureProfile.paragraphHover.values.backgroundColor).toBe("#eeeeee")
    expect(nextState.featureProfile.paragraphHover.values.transitionMs).toBe(350)
    expect(nextState.featureProfile.imageRadius.enabled).toBe(false)
    expect(nextState.profile.heading1.color).toBe("var(--style-editor-heading1-color)")
  })

  it("updates only the chosen target color", () => {
    const nextState = updateTargetColor({
      ...createDefaultEditorState(),
      customPresetPalettes: [{
        colors: [{
          label: "#3355aa",
          value: "#3355aa",
        }],
        id: "custom-palette-1",
        label: "Saved",
      }],
    }, "heading2", "var(--b3-font-color4)")

    expect(nextState.customPresetPalettes).toEqual([{
      colors: [{
        label: "#3355aa",
        value: "#3355aa",
      }],
      id: "custom-palette-1",
      label: "Saved",
    }])
    expect(nextState.profile.heading2.color).toBe("var(--b3-font-color4)")
    expect(nextState.profile.heading1.color).toBe("var(--style-editor-heading1-color)")
    expect(nextState.profile.strong.color).toBe("var(--style-editor-strong-color)")
  })

  it("updates only the chosen target background color", () => {
    const nextState = updateTargetBackgroundColor(createDefaultEditorState(), "mark", "var(--b3-font-background8)")

    expect(nextState.profile.mark.backgroundColor).toBe("var(--b3-font-background8)")
    expect(nextState.profile.heading2.backgroundColor).toBe("var(--style-editor-heading-bg)")
    expect(nextState.profile.blockquote.backgroundColor).toBe("var(--style-editor-blockquote-bg)")
  })

  it("resets all configured styles back to the default state", () => {
    const stateWithStyles = updateTargetBackgroundColor(
      updateFeatureConfig(
        updateTargetColor(createDefaultEditorState(), "heading2", "var(--b3-font-color4)"),
        "imageRadius",
        {
          enabled: true,
          values: {
            radius: 18,
          },
        },
      ),
      "mark",
      "var(--b3-font-background8)",
    )

    const resetState = resetEditorStyles(stateWithStyles)

    expect(resetState.customPresetPalettes).toEqual([])
    expect(resetState.profile.heading2.color).toBe("var(--style-editor-heading2-color)")
    expect(resetState.profile.mark.backgroundColor).toBe("var(--style-editor-mark-bg)")
    expect(resetState.profile.heading1.color).toBe("var(--style-editor-heading1-color)")
    expect(resetState.profile.codeBlock.backgroundColor).toBe("var(--style-editor-code-block-bg)")
    expect(resetState.featureProfile.imageRadius.enabled).toBe(false)
    expect(resetState.featureProfile.imageRadius.values.radius).toBe(6)
  })

  it("swaps colors between any two target channels", () => {
    const state = updateTargetBackgroundColor(
      updateTargetColor(createDefaultEditorState(), "heading2", "#224488"),
      "mark",
      "#fff2a8",
    )

    const swappedState = swapTargetChannelValues(
      state,
      {
        channel: "color",
        target: "heading2",
      },
      {
        channel: "backgroundColor",
        target: "mark",
      },
    )

    expect(swappedState.profile.heading2.color).toBe("#fff2a8")
    expect(swappedState.profile.mark.backgroundColor).toBe("#224488")
  })
})
