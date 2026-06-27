import {
  applyPaletteColor,
  applyPaletteSequenceToTargets,
  deleteCustomPresetPalette,
  exportCurrentStyles,
  extractCurrentStyles,
  getFeatureConfig,
  importStyles,
  initializeRuntime,
  persistCurrentStyles,
  previewPaletteColor,
  resetAllStyles,
  resetFeatureStyles,
  runtimeState,
  saveCurrentProfileAsPresetPalette,
  selectChannel,
  selectTarget,
  swapTargetChannelValues,
  teardownRuntime,
  updateFeatureStyle,
} from "@/style-editor-runtime"

function createPluginStub(savedState?: unknown) {
  return {
    loadData: vi.fn().mockResolvedValue(savedState),
    saveData: vi.fn().mockResolvedValue(undefined),
  }
}

describe("style editor runtime", () => {
  afterEach(() => {
    teardownRuntime()
    document.head.innerHTML = ""
    document.body.innerHTML = ""
  })

  it("initializes from persisted state and injects the stylesheet", async () => {
    const plugin = createPluginStub({
      profile: {
        heading1: { color: "rgb(200, 40, 40)" },
      },
    })

    await initializeRuntime(plugin as never)

    expect(plugin.loadData).toHaveBeenCalledWith("style-editor.json")
    expect(runtimeState.ready).toBe(true)
    expect(runtimeState.profile.heading1.color).toBe("rgb(200, 40, 40)")

    const styleElement = document.getElementById("siyuan-style-editor-style")
    expect(styleElement?.textContent).toContain('[data-type="NodeHeading"].h1')
    expect(styleElement?.textContent).toContain("color: rgb(200, 40, 40) !important;")
  })

  it("applies palette colors, persists them, and resets back to defaults", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#f6d365")

    expect(runtimeState.profile.mark.backgroundColor).toBe("#f6d365")
    expect(plugin.saveData).toHaveBeenLastCalledWith("style-editor.json", expect.objectContaining({
      customPresetPalettes: [],
      featureProfile: expect.any(Object),
      profile: expect.objectContaining({
        mark: expect.objectContaining({
          backgroundColor: "#f6d365",
        }),
      }),
    }))

    const styleElement = document.getElementById("siyuan-style-editor-style")
    expect(styleElement?.textContent).toContain("background-color: #f6d365 !important;")

    await resetAllStyles()

    expect(runtimeState.profile.mark.backgroundColor).toBe("rgba(240, 218, 168, 0.65)")
    expect(plugin.saveData).toHaveBeenCalledTimes(2)
    expect(styleElement?.textContent).toBe("")
  })

  it("previews palette colors without persisting until they are explicitly applied", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("mark")
    selectChannel("backgroundColor")
    await previewPaletteColor("#f6d365")

    expect(runtimeState.profile.mark.backgroundColor).toBe("#f6d365")
    expect(plugin.saveData).not.toHaveBeenCalled()

    const styleElement = document.getElementById("siyuan-style-editor-style")
    expect(styleElement?.textContent).toContain("background-color: #f6d365 !important;")

    await persistCurrentStyles()

    expect(plugin.saveData).toHaveBeenCalledOnce()
    expect(plugin.saveData).toHaveBeenLastCalledWith("style-editor.json", expect.objectContaining({
      customPresetPalettes: [],
      featureProfile: expect.any(Object),
      profile: expect.objectContaining({
        mark: expect.objectContaining({
          backgroundColor: "#f6d365",
        }),
      }),
    }))
  })

  it("applies a palette sequence to targets in order and persists once", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    await applyPaletteSequenceToTargets(
      ["heading1", "heading2", "heading3", "heading4"],
      "color",
      ["#224488", "#5b8def", "#f6d365"],
    )

    expect(runtimeState.profile.heading1.color).toBe("#224488")
    expect(runtimeState.profile.heading2.color).toBe("#5b8def")
    expect(runtimeState.profile.heading3.color).toBe("#f6d365")
    expect(runtimeState.profile.heading4.color).toBe("#6a3d6a")
    expect(plugin.saveData).toHaveBeenCalledOnce()
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", expect.objectContaining({
      customPresetPalettes: [],
      featureProfile: expect.any(Object),
      profile: expect.objectContaining({
        heading1: expect.objectContaining({
          color: "#224488",
        }),
        heading2: expect.objectContaining({
          color: "#5b8def",
        }),
        heading3: expect.objectContaining({
          color: "#f6d365",
        }),
        heading4: expect.objectContaining({
          color: "#6a3d6a",
        }),
      }),
    }))

    const styleElement = document.getElementById("siyuan-style-editor-style")
    expect(styleElement?.textContent).toContain("color: #224488 !important;")
    expect(styleElement?.textContent).toContain("color: #f6d365 !important;")
  })

  it("swaps colors across any two target channels and persists once", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("heading2")
    selectChannel("color")
    await applyPaletteColor("#224488")
    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#fff2a8")
    vi.clearAllMocks()

    await swapTargetChannelValues(
      {
        channel: "color",
        target: "heading2",
      },
      {
        channel: "backgroundColor",
        target: "mark",
      },
    )

    expect(runtimeState.profile.heading2.color).toBe("#fff2a8")
    expect(runtimeState.profile.mark.backgroundColor).toBe("#224488")
    expect(plugin.saveData).toHaveBeenCalledOnce()
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", expect.objectContaining({
      customPresetPalettes: [],
      featureProfile: expect.any(Object),
      profile: expect.objectContaining({
        heading2: expect.objectContaining({
          color: "#fff2a8",
        }),
        mark: expect.objectContaining({
          backgroundColor: "#224488",
        }),
      }),
    }))

    const styleElement = document.getElementById("siyuan-style-editor-style")
    expect(styleElement?.textContent).toContain("color: #fff2a8 !important;")
    expect(styleElement?.textContent).toContain("background-color: #224488 !important;")
  })

  it("updates feature styles, injects their css, persists them, and resets them", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    await updateFeatureStyle("imageRadius", {
      enabled: true,
      values: {
        radius: 14,
      },
    })

    expect(runtimeState.featureProfile.imageRadius.enabled).toBe(true)
    expect(runtimeState.featureProfile.imageRadius.values.radius).toBe(14)
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", expect.objectContaining({
      customPresetPalettes: [],
      featureProfile: expect.objectContaining({
        imageRadius: expect.objectContaining({
          enabled: true,
          values: expect.objectContaining({
            radius: 14,
          }),
        }),
      }),
      profile: expect.any(Object),
    }))

    const styleElement = document.getElementById("siyuan-style-editor-style")
    expect(styleElement?.textContent).toContain(".protyle-wysiwyg img {")
    expect(styleElement?.textContent).toContain("border-radius: 14px !important;")

    await resetAllStyles()

    expect(runtimeState.featureProfile.imageRadius.enabled).toBe(false)
    expect(styleElement?.textContent).toBe("")
  })

  it("returns normalized feature config snapshots and resets feature styles without clearing target styles", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#fff2a8")
    await updateFeatureStyle("blockquoteFrame", {
      enabled: true,
      values: {
        backgroundColor: "#FFFAFA",
        color: "#4D4D4D",
        lineColor: "#3D9140",
        padding: 4,
      },
    })
    vi.clearAllMocks()

    const config = getFeatureConfig("blockquoteFrame")
    expect(config).toEqual(expect.objectContaining({
      enabled: true,
      values: expect.objectContaining({
        backgroundColor: "#FFFAFA",
        color: "#4D4D4D",
        lineColor: "#3D9140",
        padding: 4,
      }),
    }))
    config.values.backgroundColor = "#000000"
    expect(runtimeState.featureProfile.blockquoteFrame.values.backgroundColor).toBe("#FFFAFA")

    await resetFeatureStyles()

    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")
    expect(runtimeState.featureProfile.blockquoteFrame.enabled).toBe(false)
    expect(runtimeState.featureProfile.blockquoteFrame.values.backgroundColor).toBe("#FFFAFA")
    expect(plugin.saveData).toHaveBeenCalledOnce()
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", expect.objectContaining({
      featureProfile: expect.objectContaining({
        blockquoteFrame: expect.objectContaining({
          enabled: false,
        }),
      }),
      profile: expect.objectContaining({
        mark: expect.objectContaining({
          backgroundColor: "#fff2a8",
        }),
      }),
    }))

    const styleElement = document.getElementById("siyuan-style-editor-style")
    expect(styleElement?.textContent).toContain("background-color: #fff2a8 !important;")
    expect(styleElement?.textContent).not.toContain("border-left: 0.25em solid #3D9140")
  })

  it("can roll previewed palette colors back to the last committed value without persisting", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#fff2a8")
    vi.clearAllMocks()

    await previewPaletteColor("#f6d365")
    await previewPaletteColor("#fff2a8")

    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")
    expect(plugin.saveData).not.toHaveBeenCalled()

    const styleElement = document.getElementById("siyuan-style-editor-style")
    expect(styleElement?.textContent).toContain("background-color: #fff2a8 !important;")
  })

  it("extracts styles from the current document and persists the extracted profile", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    document.body.innerHTML = `
      <div class="protyle-wysiwyg" style="color: rgb(34, 34, 34);">
        <div data-type="NodeHeading" class="h1" style="color: rgb(200, 40, 40);">Heading 1</div>
        <mark style="background-color: rgb(255, 240, 180);">Mark</mark>
      </div>
    `

    const result = await extractCurrentStyles()

    expect(result).toEqual({
      extractedTargetCount: 2,
      matchedTargetCount: 2,
    })
    expect(runtimeState.profile.heading1.color).toBe("rgb(200, 40, 40)")
    expect(runtimeState.profile.mark.backgroundColor).toBe("rgb(255, 240, 180)")
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", expect.objectContaining({
      customPresetPalettes: [],
      featureProfile: expect.any(Object),
      profile: expect.objectContaining({
        heading1: expect.objectContaining({
          color: "rgb(200, 40, 40)",
        }),
        mark: expect.objectContaining({
          backgroundColor: "rgb(255, 240, 180)",
        }),
      }),
    }))
  })

  it("exports the current profile as a portable style document", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#f6d365")

    const exported = exportCurrentStyles({
      author: "Alice",
      styleName: "Paper Glow",
    })
    const payload = JSON.parse(exported)

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
    })
    expect(typeof payload.exportedAt).toBe("string")
  })

  it("imports a local style document, returns its metadata, and persists it", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

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
    }))

    expect(result).toEqual({
      metadata: {
        author: "Alice",
        styleName: "Paper Glow",
      },
      styledTargetCount: 14,
    })
    expect(runtimeState.profile.heading2.color).toBe("#3355aa")
    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")
    expect(plugin.saveData).toHaveBeenLastCalledWith("style-editor.json", expect.objectContaining({
      featureProfile: expect.any(Object),
      profile: expect.objectContaining({
        heading2: expect.objectContaining({
          color: "#3355aa",
        }),
        mark: expect.objectContaining({
          backgroundColor: "#fff2a8",
        }),
      }),
      customPresetPalettes: [],
    }))
  })

  it("saves the current selected colors as a custom preset palette and persists it to the front of the list", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("heading1")
    selectChannel("color")
    await applyPaletteColor("#3355aa")
    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#fff2a8")
    vi.clearAllMocks()

    const result = await saveCurrentProfileAsPresetPalette("My Favorite")

    expect(result).toEqual(expect.objectContaining({
      colorCount: 4,
      label: "My Favorite",
      palette: expect.objectContaining({
        id: expect.stringMatching(/^custom-palette-/),
        label: "My Favorite",
      }),
    }))
    expect(runtimeState.customPresetPalettes[0]).toEqual({
      colors: [
        {
          label: "#3355aa",
          value: "#3355aa",
        },
        {
          label: "rgba(111, 142, 207, 0.15)",
          value: "rgba(111, 142, 207, 0.15)",
        },
        {
          label: "#2d3748",
          value: "#2d3748",
        },
        {
          label: "#fff2a8",
          value: "#fff2a8",
        },
      ],
      id: expect.stringMatching(/^custom-palette-/),
      label: "My Favorite",
    })
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", expect.objectContaining({
      featureProfile: expect.any(Object),
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
    }))
  })

  it("deletes a saved custom preset palette and persists the remaining palette list", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("heading1")
    selectChannel("color")
    await applyPaletteColor("#3355aa")

    const savedPalette = await saveCurrentProfileAsPresetPalette("My Favorite")
    vi.clearAllMocks()

    const result = await deleteCustomPresetPalette(savedPalette.palette.id)

    expect(result).toEqual({
      id: savedPalette.palette.id,
      label: "My Favorite",
    })
    expect(runtimeState.customPresetPalettes).toEqual([])
    expect(plugin.saveData).toHaveBeenCalledWith("style-editor.json", expect.objectContaining({
      featureProfile: expect.any(Object),
      profile: expect.objectContaining({
        heading1: expect.objectContaining({
          color: "#3355aa",
        }),
      }),
      customPresetPalettes: [],
    }))
  })

  it("tears down the runtime state and removes the stylesheet", async () => {
    const plugin = createPluginStub({
      profile: {
        heading1: { color: "rgb(200, 40, 40)" },
      },
    })

    await initializeRuntime(plugin as never)
    teardownRuntime()

    expect(runtimeState.ready).toBe(false)
    expect(runtimeState.selectedTarget).toBe("heading1")
    expect(runtimeState.selectedChannel).toBe("color")
    expect(runtimeState.profile.heading1.color).toBe("#2b3a4a")
    expect(document.getElementById("siyuan-style-editor-style")).toBeNull()
  })
})
