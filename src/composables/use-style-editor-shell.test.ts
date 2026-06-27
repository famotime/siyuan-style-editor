import {
  createApp,
  defineComponent,
  h,
  nextTick,
} from "vue"

import { useStyleEditorShell } from "@/composables/use-style-editor-shell"
import {
  BODY_SAFE_FEATURE_OPTIONS,
  EDITOR_UI_FEATURE_OPTIONS,
} from "@/lib/style-feature-catalog"
import { STYLE_TARGET_OPTIONS } from "@/lib/style-target-catalog"
import {
  applyPaletteColor,
  initializeRuntime,
  runtimeState,
  selectChannel,
  selectTarget,
  teardownRuntime,
} from "@/style-editor-runtime"

const mockCreateStylePreviewDocument = vi.hoisted(() => vi.fn())
const mockPushErrMsg = vi.hoisted(() => vi.fn())
const mockPushMsg = vi.hoisted(() => vi.fn())
const mockShowConfirm = vi.hoisted(() => vi.fn().mockResolvedValue(true))

vi.mock("@/lib/style-preview-document", () => ({
  createStylePreviewDocument: mockCreateStylePreviewDocument,
}))

vi.mock("@/api", () => {
  return {
    pushErrMsg: mockPushErrMsg,
    pushMsg: mockPushMsg,
    showConfirm: mockShowConfirm,
  }
})

function createPluginStub(savedState?: unknown) {
  return {
    loadData: vi.fn().mockResolvedValue(savedState),
    saveData: vi.fn().mockResolvedValue(undefined),
  }
}

async function mountShell() {
  let shell!: ReturnType<typeof useStyleEditorShell>
  const container = document.createElement("div")
  document.body.append(container)

  const Harness = defineComponent({
    setup() {
      shell = useStyleEditorShell()
      return () => h("div")
    },
  })

  const app = createApp(Harness)
  app.mount(container)
  await nextTick()

  return {
    shell,
    unmount() {
      app.unmount()
      container.remove()
    },
  }
}

async function flushShellUpdates() {
  await Promise.resolve()
  await nextTick()
}

function createAnchorElement() {
  const anchor = document.createElement("button")
  document.body.append(anchor)
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
  })
  return anchor
}

describe("useStyleEditorShell", () => {
  afterEach(() => {
    teardownRuntime()
    document.head.innerHTML = ""
    document.body.innerHTML = ""
    mockCreateStylePreviewDocument.mockReset()
    mockPushErrMsg.mockReset()
    mockPushMsg.mockReset()
    vi.restoreAllMocks()
  })

  it("rolls previewed colors back on cancel and only persists on explicit apply", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#fff2a8")
    vi.clearAllMocks()

    const {
      shell,
      unmount,
    } = await mountShell()
    const anchor = createAnchorElement()

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent)
    await shell.handlePresetColorSelection("#f6d365")

    expect(runtimeState.profile.mark.backgroundColor).toBe("#f6d365")
    expect(plugin.saveData).not.toHaveBeenCalled()

    await shell.cancelInlinePalettePanel()

    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")
    expect(shell.isInlinePaletteVisible.value).toBe(false)
    expect(plugin.saveData).not.toHaveBeenCalled()

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent)
    await shell.handlePresetColorSelection("#d97706")
    await shell.applyCustomColorDraft()

    expect(runtimeState.profile.mark.backgroundColor).toBe("#d97706")
    expect(shell.isInlinePaletteVisible.value).toBe(false)
    expect(plugin.saveData).toHaveBeenCalledOnce()

    unmount()
    anchor.remove()
  })

  it("keeps the palette open for internal scroll events but closes on escape and outside scroll", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    const originalAddEventListener = window.addEventListener.bind(window)
    let keydownHandler: ((event: KeyboardEvent) => void) | undefined
    let scrollHandler: ((event: Event) => void) | undefined
    vi.spyOn(window, "addEventListener").mockImplementation(((type, listener, options) => {
      if (type === "keydown") {
        keydownHandler = listener as (event: KeyboardEvent) => void
      }
      if (type === "scroll") {
        scrollHandler = listener as (event: Event) => void
      }
      originalAddEventListener(type, listener, options)
    }) as typeof window.addEventListener)

    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#fff2a8")
    vi.clearAllMocks()

    const {
      shell,
      unmount,
    } = await mountShell()
    const anchor = createAnchorElement()
    const floatingPalette = document.createElement("div")
    const floatingPaletteChild = document.createElement("div")
    floatingPalette.append(floatingPaletteChild)
    document.body.append(floatingPalette)
    shell.floatingPaletteRef.value = floatingPalette
    expect(scrollHandler).toBeTypeOf("function")

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent)
    await shell.handlePresetColorSelection("#f6d365")

    scrollHandler!({ target: floatingPaletteChild } as Event)
    await flushShellUpdates()

    expect(shell.isInlinePaletteVisible.value).toBe(true)
    expect(runtimeState.profile.mark.backgroundColor).toBe("#f6d365")

    expect(keydownHandler).toBeTypeOf("function")
    await shell.cancelInlinePalettePanel()
    await flushShellUpdates()

    expect(shell.isInlinePaletteVisible.value).toBe(false)
    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")
    expect(plugin.saveData).not.toHaveBeenCalled()

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent)
    await shell.handlePresetColorSelection("#c2410c")

    scrollHandler!({ target: document.body } as Event)
    await flushShellUpdates()
    await flushShellUpdates()

    expect(shell.isInlinePaletteVisible.value).toBe(false)
    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")
    expect(plugin.saveData).not.toHaveBeenCalled()

    unmount()
    floatingPalette.remove()
    anchor.remove()
  })

  it("resets the import input and maintains preset palette UI state", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    const {
      shell,
      unmount,
    } = await mountShell()
    const secondPaletteId = shell.presetPaletteCollections.value[1].id
    const importedProfile = JSON.stringify({
      author: "Alice",
      profile: {
        mark: {
          backgroundColor: "#fff2a8",
        },
      },
      styleName: "Paper Glow",
    })

    expect(shell.activePresetPaletteId.value).toBe(shell.presetPaletteCollections.value[0].id)
    expect(shell.isPresetPaletteSectionExpanded.value).toBe(true)

    shell.selectPresetPaletteTab(secondPaletteId)
    expect(shell.activePresetPaletteId.value).toBe(secondPaletteId)

    shell.selectPresetPaletteTab("missing-palette")
    expect(shell.activePresetPaletteId.value).toBe(secondPaletteId)

    shell.togglePresetPaletteSection()
    expect(shell.isPresetPaletteSectionExpanded.value).toBe(false)

    const input = {
      files: [
        {
          text: vi.fn().mockResolvedValue(importedProfile),
        },
      ],
      value: "selected.json",
    } as unknown as HTMLInputElement

    await shell.handleImportStylesChange({ target: input } as Event)

    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")
    expect(plugin.saveData).toHaveBeenCalledOnce()
    expect(input.value).toBe("")
    expect(shell.importedStyleSignature.value).toBe("Paper Glow from Alice")
    expect(shell.statusCopy.value).toContain("已导入本地配置")

    unmount()
  })

  it("exposes feature option groups using the names consumed by App", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    const {
      shell,
      unmount,
    } = await mountShell()

    expect(shell.bodySafeFeatureOptions).toBe(BODY_SAFE_FEATURE_OPTIONS)
    expect(shell.editorUiFeatureOptions).toBe(EDITOR_UI_FEATURE_OPTIONS)
    expect(shell.bodySafeFeatureOptions.length).toBeGreaterThan(0)
    expect(shell.editorUiFeatureOptions.length).toBeGreaterThan(0)

    unmount()
  })

  it("exports styles with the provided author and style name", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#fff2a8")

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn().mockReturnValue("blob:style-export"),
    })
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => { })

    const {
      shell,
      unmount,
    } = await mountShell()

    await shell.handleExportStyles("Alice", "Paper Glow")

    expect(clickSpy).toHaveBeenCalledOnce()

    unmount()
  })

  it("creates a style preview document and surfaces the generated location", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)
    mockCreateStylePreviewDocument.mockResolvedValue({
      documentId: "20260328123456-preview",
      notebookId: "box-current",
      path: "/日记/2026/03/样式效果预览 2026-03-28",
      title: "样式效果预览 2026-03-28",
    })

    const {
      shell,
      unmount,
    } = await mountShell()

    await shell.handleCreateStylePreviewDocument()

    expect(mockCreateStylePreviewDocument).toHaveBeenCalledOnce()
    expect(mockPushMsg).toHaveBeenCalledWith("已生成预览文档「样式效果预览 2026-03-28」，保存于 /日记/2026/03/样式效果预览 2026-03-28。", 5000)
    expect(shell.statusCopy.value).toBe("已生成预览文档「样式效果预览 2026-03-28」，保存于 /日记/2026/03/样式效果预览 2026-03-28。")

    unmount()
  })

  it("pushes an error notification when preview document creation fails", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)
    mockCreateStylePreviewDocument.mockRejectedValue(new Error("Daily Notes 目录未配置。"))

    const {
      shell,
      unmount,
    } = await mountShell()

    await shell.handleCreateStylePreviewDocument()

    expect(mockPushErrMsg).toHaveBeenCalledWith("Daily Notes 目录未配置。", 5000)
    expect(shell.statusCopy.value).toBe("Daily Notes 目录未配置。")

    unmount()
  })

  it("applies preset palette colors to targets in catalog order on batch apply", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectChannel("color")

    const {
      shell,
      unmount,
    } = await mountShell()
    const paletteId = shell.presetPaletteCollections.value[0]?.id
    const paletteColors = shell.presetPaletteCollections.value[0]?.colors ?? []

    await shell.handlePresetPaletteBatchApply(paletteId!)

    paletteColors.forEach((color, index) => {
      const target = STYLE_TARGET_OPTIONS[index]?.value
      expect(runtimeState.profile[target].color).toBe(color.value)
    })

    const nextTarget = STYLE_TARGET_OPTIONS[paletteColors.length]?.value
    if (nextTarget) {
      expect(runtimeState.profile[nextTarget].color).toBe("")
    }
    expect(plugin.saveData).toHaveBeenCalledOnce()

    unmount()
  })

  it("keeps batch-applied colors after cancelling the palette session", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("heading1")
    selectChannel("color")

    const {
      shell,
      unmount,
    } = await mountShell()
    const anchor = createAnchorElement()

    await shell.activateTargetChannel("heading1", "color", { currentTarget: anchor } as MouseEvent)
    await shell.handlePresetPaletteBatchApply("fiery-ocean")
    await shell.cancelInlinePalettePanel()

    expect(runtimeState.profile.heading1.color).toBe("#780000")
    expect(shell.isInlinePaletteVisible.value).toBe(false)
    expect(plugin.saveData).toHaveBeenCalledOnce()

    unmount()
    anchor.remove()
  })

  it("rolls back preview state before swapping channels and persists only the swap result", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("heading1")
    selectChannel("color")
    await applyPaletteColor("#224488")
    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#fff2a8")
    vi.clearAllMocks()

    const {
      shell,
      unmount,
    } = await mountShell()
    const anchor = createAnchorElement()

    await shell.activateTargetChannel("heading1", "color", { currentTarget: anchor } as MouseEvent)
    await shell.handlePresetColorSelection("#f6d365")
    await shell.handleSwapTargetChannelValues(
      {
        channel: "color",
        target: "heading1",
      },
      {
        channel: "backgroundColor",
        target: "mark",
      },
    )

    expect(runtimeState.profile.heading1.color).toBe("#fff2a8")
    expect(runtimeState.profile.mark.backgroundColor).toBe("#224488")
    expect(shell.isInlinePaletteVisible.value).toBe(false)
    expect(plugin.saveData).toHaveBeenCalledOnce()

    unmount()
    anchor.remove()
  })

  it("saves the current colors as a custom preset palette at the front of the list when given a name", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("heading1")
    selectChannel("color")
    await applyPaletteColor("#3355aa")
    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#fff2a8")
    vi.clearAllMocks()

    const {
      shell,
      unmount,
    } = await mountShell()

    await shell.handleSavePresetPalette("My Favorite")

    expect(shell.presetPaletteCollections.value[0]).toEqual(expect.objectContaining({
      id: expect.stringMatching(/^custom-palette-/),
      label: "My Favorite",
    }))
    expect(shell.presetPaletteCollections.value[0]?.colors).toEqual([
      {
        label: "#3355aa",
        value: "#3355aa",
      },
      {
        label: "#fff2a8",
        value: "#fff2a8",
      },
    ])
    expect(shell.activePresetPaletteId.value).toBe(shell.presetPaletteCollections.value[0]?.id)
    expect(shell.statusCopy.value).toBe("当前颜色配置已经保存为色卡「My Favorite」，供后续选色使用。")
    expect(plugin.saveData).toHaveBeenCalledOnce()

    unmount()
  })

  it("keeps the floating palette top position stable when collapsing preset palettes", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    const {
      shell,
      unmount,
    } = await mountShell()
    const anchor = document.createElement("button")
    let floatingPaletteHeight = 320

    document.body.append(anchor)
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
    })

    const floatingPalette = document.createElement("div")
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
    })
    document.body.append(floatingPalette)
    shell.floatingPaletteRef.value = floatingPalette

    await shell.activateTargetChannel("mark", "backgroundColor", { currentTarget: anchor } as MouseEvent)
    await flushShellUpdates()

    expect(shell.floatingPaletteStyle.value.top).toBe("172px")

    floatingPaletteHeight = 120
    shell.togglePresetPaletteSection()
    await flushShellUpdates()

    expect(shell.isPresetPaletteSectionExpanded.value).toBe(false)
    expect(shell.floatingPaletteStyle.value.top).toBe("172px")

    unmount()
    floatingPalette.remove()
    anchor.remove()
  })

  it("deletes a custom preset palette, updates the status copy, and falls back to the first remaining palette", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("heading1")
    selectChannel("color")
    await applyPaletteColor("#3355aa")

    const {
      shell,
      unmount,
    } = await mountShell()

    await shell.handleSavePresetPalette("My Favorite")
    const savedPaletteId = shell.presetPaletteCollections.value[0]?.id

    expect(savedPaletteId).toMatch(/^custom-palette-/)
    expect(shell.activePresetPaletteId.value).toBe(savedPaletteId)

    await shell.handleDeletePresetPalette(savedPaletteId!)

    expect(shell.presetPaletteCollections.value.some((palette) => palette.id === savedPaletteId)).toBe(false)
    expect(shell.activePresetPaletteId.value).toBe("fiery-ocean")
    expect(shell.statusCopy.value).toBe("已删除色卡「My Favorite」。")
    expect(plugin.saveData).toHaveBeenCalledTimes(3)

    unmount()
  })

  it("surfaces import parsing errors without losing the original message", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    const {
      shell,
      unmount,
    } = await mountShell()
    const input = {
      files: [
        {
          text: vi.fn().mockResolvedValue("{"),
        },
      ],
      value: "invalid.json",
    } as unknown as HTMLInputElement

    await shell.handleImportStylesChange({ target: input } as Event)

    expect(shell.statusCopy.value).toBe("样式配置文件不是有效的 JSON。")
    expect(input.value).toBe("")
    expect(plugin.saveData).not.toHaveBeenCalled()

    unmount()
  })

  it("resets styles if showConfirm is confirmed", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("heading1")
    selectChannel("color")
    await applyPaletteColor("#aabbcc")
    expect(runtimeState.profile.heading1.color).toBe("#aabbcc")

    const {
      shell,
      unmount,
    } = await mountShell()

    mockShowConfirm.mockResolvedValueOnce(true)

    await shell.handleResetAllStyles()

    expect(mockShowConfirm).toHaveBeenCalledWith("清除样式", "确定要关闭所有样式开关且恢复各设置项的默认配置吗？")
    expect(runtimeState.profile.heading1.color).toBe("")
    expect(shell.statusCopy.value).toBe("已清除全部样式，恢复到初始状态。")

    unmount()
  })

  it("does not reset styles if showConfirm is rejected", async () => {
    const plugin = createPluginStub()
    await initializeRuntime(plugin as never)

    selectTarget("heading1")
    selectChannel("color")
    await applyPaletteColor("#aabbcc")
    expect(runtimeState.profile.heading1.color).toBe("#aabbcc")

    const {
      shell,
      unmount,
    } = await mountShell()

    mockShowConfirm.mockResolvedValueOnce(false)

    await shell.handleResetAllStyles()

    expect(mockShowConfirm).toHaveBeenCalledWith("清除样式", "确定要关闭所有样式开关且恢复各设置项的默认配置吗？")
    expect(runtimeState.profile.heading1.color).toBe("#aabbcc")
    expect(shell.statusCopy.value).not.toBe("已清除所有自定义样式，回到思源默认外观。")

    unmount()
  })
})

