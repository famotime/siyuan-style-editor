import {
  createApp,
  defineComponent,
  h,
  nextTick,
} from "vue"

import CollapseHeader from "@/components/StyleEditorShell/CollapseHeader.vue"

async function mountCollapseHeader(overrides?: Record<string, unknown>) {
  const onToggle = vi.fn()
  const container = document.createElement("div")
  document.body.append(container)

  const app = createApp({
    render() {
      return h(CollapseHeader, {
        collapsed: false,
        title: "基础配置",
        titleTooltip: "提示文案",
        onToggle,
        ...overrides,
      }, {
        actions: overrides?.actionsSlot
          ? () => h("span", { class: "header-actions-slot" }, "slot")
          : undefined,
      })
    },
  })

  app.mount(container)
  await nextTick()

  return {
    container,
    onToggle,
    unmount() {
      app.unmount()
      container.remove()
    },
  }
}

describe("collapseHeader", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.clearAllMocks()
  })

  it("renders the title with its tooltip and the collapse button", async () => {
    const { container, unmount } = await mountCollapseHeader()

    const heading = container.querySelector(".section-heading__title") as HTMLElement
    expect(heading?.textContent).toContain("基础配置")
    expect(heading?.getAttribute("data-tooltip")).toBe("提示文案")

    const collapseBtn = container.querySelector(".panel-collapse-btn") as HTMLButtonElement
    expect(collapseBtn).not.toBeNull()
    expect(collapseBtn.getAttribute("aria-label")).toBe("折叠面板")

    unmount()
  })

  it("emits toggle on collapse button click and reflects the collapsed state", async () => {
    const { container, onToggle, unmount } = await mountCollapseHeader()

    const collapseBtn = container.querySelector(".panel-collapse-btn") as HTMLButtonElement
    collapseBtn.click()
    expect(onToggle).toHaveBeenCalledOnce()

    unmount()
  })

  it("switches the collapse button copy when collapsed", async () => {
    const { container, unmount } = await mountCollapseHeader({ collapsed: true })

    const collapseBtn = container.querySelector(".panel-collapse-btn") as HTMLButtonElement
    expect(collapseBtn.getAttribute("aria-label")).toBe("展开面板")

    const icon = container.querySelector(".panel-collapse-btn__icon") as SVGElement
    expect(icon.classList.contains("panel-collapse-btn__icon--collapsed")).toBe(true)

    unmount()
  })

  it("renders the actions slot between the title and the collapse button", async () => {
    const { container, unmount } = await mountCollapseHeader({ actionsSlot: true })

    const children = [...container.children].map((node) => node.className || node.tagName)
    expect(children.indexOf("section-heading__title"))
      .toBeLessThan(children.indexOf("header-actions-slot"))
    expect(children.indexOf("header-actions-slot"))
      .toBeLessThan(children.indexOf("panel-collapse-btn"))

    unmount()
  })
})
