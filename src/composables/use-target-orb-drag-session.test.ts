import {
  createApp,
  defineComponent,
  h,
} from "vue"

import { useTargetOrbDragSession } from "@/composables/use-target-orb-drag-session"

function createMouseOptions(x: number, y: number, button = 0) {
  return {
    button,
    clientX: x,
    clientY: y,
  }
}

function mountOrbDragSession(overrides?: Partial<Parameters<typeof useTargetOrbDragSession>[0]>) {
  let session!: ReturnType<typeof useTargetOrbDragSession>
  const Harness = defineComponent({
    setup() {
      session = useTargetOrbDragSession({
        getChannelSwatch: () => ({
          background: "#224488",
          isEmpty: false,
        }),
        onActivateChannel: vi.fn(),
        onSwapChannelValue: vi.fn(),
        ...overrides,
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
    session,
  }
}

describe("useTargetOrbDragSession", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("does not create a floating preview below the drag threshold and follows the pointer beyond it", () => {
    const { session } = mountOrbDragSession()

    session.handleOrbMouseDown("mark", "color", new MouseEvent("mousedown", createMouseOptions(100, 100)))

    window.dispatchEvent(new MouseEvent("mousemove", createMouseOptions(103, 103)))
    expect(session.floatingOrbPreview.value).toBeNull()

    window.dispatchEvent(new MouseEvent("mousemove", createMouseOptions(110, 110)))
    expect(session.floatingOrbPreview.value).toEqual({
      background: "#224488",
      isEmpty: false,
      x: 110,
      y: 110,
    })

    window.dispatchEvent(new MouseEvent("mousemove", createMouseOptions(120, 115)))
    expect(session.floatingOrbPreview.value).toMatchObject({
      x: 120,
      y: 115,
    })
  })

  it("swaps channels on drop over another orb and suppresses the trailing click", () => {
    const onActivateChannel = vi.fn()
    const onSwapChannelValue = vi.fn()
    const { session } = mountOrbDragSession({
      onActivateChannel,
      onSwapChannelValue,
    })

    let now = 1_000_000
    vi.spyOn(Date, "now").mockImplementation(() => now)

    session.handleOrbMouseDown("mark", "color", new MouseEvent("mousedown", createMouseOptions(0, 0)))
    window.dispatchEvent(new MouseEvent("mousemove", createMouseOptions(50, 0)))
    session.handleOrbMouseEnter("heading1", "backgroundColor")
    window.dispatchEvent(new MouseEvent("mouseup"))

    expect(onSwapChannelValue).toHaveBeenCalledOnce()
    expect(onSwapChannelValue).toHaveBeenCalledWith(
      { channel: "color", target: "mark" },
      { channel: "backgroundColor", target: "heading1" },
    )
    expect(session.floatingOrbPreview.value).toBeNull()

    now += 100
    session.handleOrbClick("mark", "color", new MouseEvent("click", createMouseOptions(0, 0)))
    expect(onActivateChannel).not.toHaveBeenCalled()

    now += 300
    session.handleOrbClick("mark", "color", new MouseEvent("click", createMouseOptions(0, 0)))
    expect(onActivateChannel).toHaveBeenCalledOnce()
    expect(onActivateChannel).toHaveBeenCalledWith(expect.objectContaining({
      channel: "color",
      target: "mark",
    }))
  })

  it("does not swap when released in place and lets the click activate the channel", () => {
    const onActivateChannel = vi.fn()
    const onSwapChannelValue = vi.fn()
    const { session } = mountOrbDragSession({
      onActivateChannel,
      onSwapChannelValue,
    })

    session.handleOrbMouseDown("mark", "color", new MouseEvent("mousedown", createMouseOptions(0, 0)))
    window.dispatchEvent(new MouseEvent("mouseup"))

    expect(onSwapChannelValue).not.toHaveBeenCalled()
    expect(session.floatingOrbPreview.value).toBeNull()

    session.handleOrbClick("mark", "color", new MouseEvent("click", createMouseOptions(0, 0)))
    expect(onActivateChannel).toHaveBeenCalledOnce()
  })

  it("clears the drop target on mouse leave and skips swapping onto the source orb", () => {
    const onSwapChannelValue = vi.fn()
    const { session } = mountOrbDragSession({ onSwapChannelValue })

    session.handleOrbMouseDown("mark", "color", new MouseEvent("mousedown", createMouseOptions(0, 0)))
    window.dispatchEvent(new MouseEvent("mousemove", createMouseOptions(50, 0)))
    session.handleOrbMouseEnter("heading1", "backgroundColor")
    session.handleOrbMouseLeave("heading1", "backgroundColor")
    window.dispatchEvent(new MouseEvent("mouseup"))
    expect(onSwapChannelValue).not.toHaveBeenCalled()

    session.handleOrbMouseDown("mark", "color", new MouseEvent("mousedown", createMouseOptions(0, 0)))
    window.dispatchEvent(new MouseEvent("mousemove", createMouseOptions(50, 0)))
    session.handleOrbMouseEnter("mark", "color")
    window.dispatchEvent(new MouseEvent("mouseup"))
    expect(onSwapChannelValue).not.toHaveBeenCalled()
  })

  it("ignores non-primary button presses", () => {
    const { session } = mountOrbDragSession()

    session.handleOrbMouseDown("mark", "color", new MouseEvent("mousedown", createMouseOptions(0, 0, 2)))

    window.dispatchEvent(new MouseEvent("mousemove", createMouseOptions(200, 200)))
    expect(session.floatingOrbPreview.value).toBeNull()
  })
})
