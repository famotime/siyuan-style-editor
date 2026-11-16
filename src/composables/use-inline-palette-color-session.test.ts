import {
  computed,
  createApp,
  defineComponent,
  h,
  ref,
} from "vue"

import { useInlinePaletteColorSession } from "@/composables/use-inline-palette-color-session"
import {
  applyPaletteColor,
  runtimeState,
  selectChannel,
  selectTarget,
  teardownRuntime,
} from "@/style-editor-runtime"

function mountColorSession() {
  const inlineColorFieldRef = ref<HTMLElement | null>(null)
  const isInlinePaletteVisible = ref(true)
  const selectedSwatch = ref("")
  const scopeElement = document.createElement("div")
  document.body.append(scopeElement)

  let session!: ReturnType<typeof useInlinePaletteColorSession>
  const Harness = defineComponent({
    setup() {
      session = useInlinePaletteColorSession({
        colorResolutionScope: computed(() => scopeElement),
        inlineColorFieldRef,
        isInlinePaletteVisible: computed(() => isInlinePaletteVisible.value),
        selectedSwatch: computed(() => selectedSwatch.value),
      })
      return () => h("div")
    },
  })

  const container = document.createElement("div")
  document.body.append(container)
  const app = createApp(Harness)
  app.mount(container)

  return {
    app,
    isInlinePaletteVisible,
    scopeElement,
    selectedSwatch,
    session,
  }
}

describe("useInlinePaletteColorSession", () => {
  afterEach(() => {
    teardownRuntime()
    document.head.innerHTML = ""
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("starts a session with the committed color, previews drafts, and rolls back on cancel", async () => {
    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#224488")

    const { session } = mountColorSession()

    session.startInlinePaletteColorSession("mark", "backgroundColor")
    expect(session.colorPickerValue.value).toBe("#224488")

    await session.handlePresetColorSelection("#fff2a8")
    expect(session.customColorDraft.value).toBe("#fff2a8")
    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")

    await session.cancelPreviewIfNeeded()
    expect(runtimeState.profile.mark.backgroundColor).toBe("#224488")
  })

  it("applies a valid custom color draft by persisting it and closing the palette", async () => {
    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#224488")

    const { session } = mountColorSession()
    session.startInlinePaletteColorSession("mark", "backgroundColor")

    const closeInlinePalettePanel = vi.fn()
    session.customColorDraft.value = "#abc"
    await session.applyCustomColorDraft(closeInlinePalettePanel)

    expect(closeInlinePalettePanel).toHaveBeenCalledOnce()
    expect(runtimeState.profile.mark.backgroundColor).toBe("#aabbcc")
  })

  it("closes the palette without persisting when the invalid draft matches the committed color", async () => {
    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#224488")

    const { session } = mountColorSession()
    session.startInlinePaletteColorSession("mark", "backgroundColor")
    session.customColorDraft.value = "not-a-color"

    const closeInlinePalettePanel = vi.fn()
    await session.applyCustomColorDraft(closeInlinePalettePanel)

    expect(closeInlinePalettePanel).toHaveBeenCalledOnce()
    expect(runtimeState.profile.mark.backgroundColor).toBe("#224488")
  })

  it("keeps the custom color draft invalid while the palette is hidden", async () => {
    const { isInlinePaletteVisible, session } = mountColorSession()

    isInlinePaletteVisible.value = false
    session.customColorDraft.value = "#abc"
    expect(session.isCustomColorDraftValid.value).toBe(false)

    isInlinePaletteVisible.value = true
    expect(session.isCustomColorDraftValid.value).toBe(true)
  })

  it("clears the selected target color as a preview", async () => {
    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#224488")

    const { session } = mountColorSession()
    session.startInlinePaletteColorSession("mark", "backgroundColor")

    await session.handleClearSelectedTargetColor()

    expect(session.customColorDraft.value).toBe("")
    expect(runtimeState.profile.mark.backgroundColor).toBe("")
  })

  it("resets the draft state on close so later cancels no longer roll back", async () => {
    selectTarget("mark")
    selectChannel("backgroundColor")
    await applyPaletteColor("#224488")

    const { session } = mountColorSession()
    session.startInlinePaletteColorSession("mark", "backgroundColor")
    await session.handlePresetColorSelection("#fff2a8")
    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")

    // 生产时序：cancelInlinePalettePanel 先调用 cancelPreviewIfNeeded 回滚，再 close 重置草稿。
    // 关闭后 committed 与 draft 均为 ""，cancelPreviewIfNeeded 不再产生副作用。
    session.closeInlinePaletteColorSession()

    await session.cancelPreviewIfNeeded()
    expect(runtimeState.profile.mark.backgroundColor).toBe("#fff2a8")
  })
})
