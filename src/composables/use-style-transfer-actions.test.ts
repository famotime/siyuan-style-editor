import {
  createApp,
  defineComponent,
  h,
  nextTick,
} from "vue"

import { useStyleTransferActions } from "@/composables/use-style-transfer-actions"
import {
  applyPaletteColor,
  extractCurrentStyles,
  resetAllStyles,
  teardownRuntime,
} from "@/style-editor-runtime"

const mockPushErrMsg = vi.hoisted(() => vi.fn())
const mockPushMsg = vi.hoisted(() => vi.fn())
const mockShowConfirm = vi.hoisted(() => vi.fn().mockResolvedValue(true))

vi.mock("@/api", () => {
  return {
    pushErrMsg: mockPushErrMsg,
    pushMsg: mockPushMsg,
    showConfirm: mockShowConfirm,
  }
})

vi.mock("@/style-editor-runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/style-editor-runtime")>()
  return {
    ...actual,
    extractCurrentStyles: vi.fn(),
    resetAllStyles: vi.fn(),
  }
})

function mountTransferActions() {
  let actions!: ReturnType<typeof useStyleTransferActions>
  const container = document.createElement("div")
  document.body.append(container)

  const Harness = defineComponent({
    setup() {
      actions = useStyleTransferActions({
        cancelInlinePalettePanel: async () => {},
      })
      return () => h("div")
    },
  })

  const app = createApp(Harness)
  app.mount(container)

  return {
    actions,
    unmount() {
      app.unmount()
      container.remove()
    },
  }
}

describe("useStyleTransferActions", () => {
  afterEach(() => {
    teardownRuntime()
    document.head.innerHTML = ""
    document.body.innerHTML = ""
    vi.mocked(extractCurrentStyles).mockReset()
    vi.mocked(resetAllStyles).mockReset()
    mockPushErrMsg.mockReset()
    mockPushMsg.mockReset()
    mockShowConfirm.mockReset()
    mockShowConfirm.mockResolvedValue(true)
  })

  it("extract 抛错后旗标复位，后续用户操作仍清空 actionMessage", async () => {
    vi.mocked(extractCurrentStyles).mockRejectedValueOnce(new Error("extract failed"))
    const { actions, unmount } = mountTransferActions()

    actions.actionMessage.value = "旧消息"
    await expect(actions.handleExtractStyles()).rejects.toThrow("extract failed")

    await applyPaletteColor("#123456")
    await nextTick()

    expect(actions.actionMessage.value).toBe("")
    unmount()
  })

  it("reset 抛错后旗标复位，后续用户操作仍清空 actionMessage", async () => {
    vi.mocked(resetAllStyles).mockRejectedValueOnce(new Error("reset failed"))
    const { actions, unmount } = mountTransferActions()

    actions.actionMessage.value = "旧消息"
    await expect(actions.handleResetAllStyles()).rejects.toThrow("reset failed")

    await applyPaletteColor("#654321")
    await nextTick()

    expect(actions.actionMessage.value).toBe("")
    unmount()
  })

  it("extract 成功路径行为不变：写入消息且旗标复位", async () => {
    vi.mocked(extractCurrentStyles).mockResolvedValueOnce({
      extractedTargetCount: 2,
      matchedTargetCount: 2,
    })
    const { actions, unmount } = mountTransferActions()

    await actions.handleExtractStyles()
    expect(actions.actionMessage.value).not.toBe("")

    await applyPaletteColor("#123456")
    await nextTick()
    expect(actions.actionMessage.value).toBe("")
    unmount()
  })
})
