import {
  computed,
  createApp,
  defineComponent,
  h,
  nextTick,
  ref,
} from "vue"

import { useInlinePaletteLayoutSession } from "@/composables/use-inline-palette-layout-session"

function mountLayoutSession() {
  const cancelInlinePalettePanel = vi.fn().mockResolvedValue(undefined)
  const floatingPaletteRef = ref<HTMLElement | null>(null)
  const floatingPaletteStyle = ref<Record<string, string>>({})
  const isVisible = ref(false)

  let session!: ReturnType<typeof useInlinePaletteLayoutSession>
  const Harness = defineComponent({
    setup() {
      session = useInlinePaletteLayoutSession({
        cancelInlinePalettePanel,
        floatingPaletteRef,
        floatingPaletteStyle,
        isInlinePaletteVisible: computed(() => isVisible.value),
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
    cancelInlinePalettePanel,
    floatingPaletteRef,
    floatingPaletteStyle,
    isVisible,
    session,
  }
}

describe("useInlinePaletteLayoutSession", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("positions the floating palette from an anchor with fallback dimensions", async () => {
    const { session, floatingPaletteStyle } = mountLayoutSession()

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

    session.setInlinePaletteAnchor(anchor)
    await nextTick()

    expect(floatingPaletteStyle.value.left).toContain("px")
    expect(floatingPaletteStyle.value.top).toContain("px")
    expect(floatingPaletteStyle.value.transformOrigin).toBeTruthy()
  })

  it("recomputes the position when the viewport resizes", async () => {
    const { session, floatingPaletteStyle, isVisible } = mountLayoutSession()

    const anchor = document.createElement("button")
    document.body.append(anchor)
    session.setInlinePaletteAnchor(anchor)
    isVisible.value = true
    await nextTick()

    const before = { ...floatingPaletteStyle.value }
    window.dispatchEvent(new Event("resize"))
    await nextTick()

    expect(Object.keys(before).length).toBeGreaterThan(0)
    expect(floatingPaletteStyle.value.left).toContain("px")
  })

  it("cancels the panel on outside scroll but ignores scrolls inside the palette", async () => {
    const { cancelInlinePalettePanel, floatingPaletteRef, isVisible } = mountLayoutSession()

    const palette = document.createElement("div")
    document.body.append(palette)
    floatingPaletteRef.value = palette
    isVisible.value = true
    await nextTick()

    const insideScroller = document.createElement("div")
    palette.append(insideScroller)
    insideScroller.dispatchEvent(new Event("scroll", { bubbles: true }))
    expect(cancelInlinePalettePanel).not.toHaveBeenCalled()

    document.body.dispatchEvent(new Event("scroll"))
    expect(cancelInlinePalettePanel).toHaveBeenCalledOnce()
  })

  it("resets the layout when the palette becomes invisible", async () => {
    const { floatingPaletteStyle, isVisible, session } = mountLayoutSession()

    const anchor = document.createElement("button")
    document.body.append(anchor)
    session.setInlinePaletteAnchor(anchor)
    isVisible.value = true
    await nextTick()
    expect(Object.keys(floatingPaletteStyle.value).length).toBeGreaterThan(0)

    isVisible.value = false
    await nextTick()
    expect(floatingPaletteStyle.value).toEqual({})
  })
})
