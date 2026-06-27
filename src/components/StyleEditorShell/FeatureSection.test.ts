import type {
  FeatureStyleOption,
  FeatureStyleProfile,
} from "@/lib/style-feature-catalog"

import {
  createApp,
  h,
  nextTick,
  reactive,
  ref,
} from "vue"
import FeatureSection from "@/components/StyleEditorShell/FeatureSection.vue"
import {
  createDefaultFeatureProfile,
  FEATURE_STYLE_OPTIONS,
} from "@/lib/style-feature-catalog"

function createTestOptions(): FeatureStyleOption[] {
  return [
    {
      controls: [
        {
          key: "color",
          label: "颜色",
          type: "color",
        },
      ],
      hint: "测试提示信息",
      label: "测试特性A",
      preview: "段落",
      risk: "正文安全",
      value: "paragraphHover",
    },
    {
      controls: [
        {
          key: "size",
          label: "大小",
          max: 100,
          min: 0,
          slider: true,
          step: 1,
          type: "number",
        },
      ],
      hint: "另一个测试提示",
      label: "测试特性B",
      preview: "标题",
      risk: "正文安全",
      value: "imageRadius",
    },
    {
      controls: [
        {
          key: "text",
          label: "文本",
          placeholder: "请输入文本",
          type: "text",
        },
      ],
      hint: "",
      label: "测试特性C",
      preview: "",
      risk: "全屋改造",
      value: "inlineCodeStyle",
    },
  ]
}

async function mountFeatureSection(
  options?: {
    featureStyleOptions?: FeatureStyleOption[]
    featureProfile?: FeatureStyleProfile
    themeAppearance?: ReturnType<typeof ref<"light" | "dark">>
  },
) {
  const onUpdateFeatureStyle = vi.fn()
  const container = document.createElement("div")
  document.body.append(container)

  const featureStyleOptions = options?.featureStyleOptions ?? FEATURE_STYLE_OPTIONS
  const featureProfile = options?.featureProfile ?? createDefaultFeatureProfile()

  const app = createApp({
    render() {
      return h(FeatureSection, {
        featureProfile,
        featureStyleOptions,
        kicker: "Test Kicker",
        onUpdateFeatureStyle,
        themeAppearance: options?.themeAppearance?.value,
        title: "测试标题",
      })
    },
  })

  app.mount(container)
  await nextTick()

  return {
    container,
    onUpdateFeatureStyle,
    unmount() {
      app.unmount()
      container.remove()
    },
  }
}

describe("featureSection", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.clearAllMocks()
  })

  it("渲染 title 并将 kicker 存入 tooltip", async () => {
    const {
      container,
      unmount,
    } = await mountFeatureSection()

    expect(container.textContent).toContain("测试标题")

    const heading = container.querySelector(".section-heading__title") as HTMLElement
    expect(heading).not.toBeNull()
    expect(heading.dataset.tooltip).toContain("Test Kicker")

    unmount()
  })

  it("渲染特性卡片", async () => {
    const {
      container,
      unmount,
    } = await mountFeatureSection()

    expect(container.querySelector(".feature-section")).not.toBeNull()
    expect(container.querySelectorAll(".feature-card")).toHaveLength(FEATURE_STYLE_OPTIONS.length)
    expect(container.textContent).toContain("段落悬停高亮")
    expect(container.querySelector('input[type="checkbox"]')).not.toBeNull()
    expect(container.querySelector('input[type="color"]')).not.toBeNull()
    expect(container.querySelector('input[type="number"]')).not.toBeNull()
    expect(container.querySelector("select")).not.toBeNull()

    unmount()
  })

  it("将 hint 和 preview 存入特性卡片 tooltip", async () => {
    const testOptions = createTestOptions()
    const {
      container,
      unmount,
    } = await mountFeatureSection({ featureStyleOptions: testOptions })

    const titles = container.querySelectorAll(".feature-card__title")
    expect(titles[0].getAttribute("data-tooltip")).toBe("段落 — 测试提示信息")
    expect(titles[1].getAttribute("data-tooltip")).toBe("标题 — 另一个测试提示")
    expect(titles[2].getAttribute("data-tooltip")).toBeNull()

    unmount()
  })

  it("搜索筛选特性", async () => {
    const testOptions = createTestOptions()
    const {
      container,
      unmount,
    } = await mountFeatureSection({ featureStyleOptions: testOptions })

    const searchInput = container.querySelector(".feature-search__input") as HTMLInputElement
    expect(searchInput).not.toBeNull()

    expect(container.querySelectorAll(".feature-card")).toHaveLength(3)

    searchInput.value = "测试特性A"
    searchInput.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()

    const cards = container.querySelectorAll(".feature-card")
    expect(cards).toHaveLength(1)
    expect(cards[0].textContent).toContain("测试特性A")

    unmount()
  })

  it("显示启用状态统计为 tooltip", async () => {
    const testOptions = createTestOptions()
    const profile = createDefaultFeatureProfile()
    profile.paragraphHover.enabled = true

    const {
      container,
      unmount,
    } = await mountFeatureSection({
      featureProfile: profile,
      featureStyleOptions: testOptions,
    })

    const heading = container.querySelector(".section-heading__title") as HTMLElement
    expect(heading).not.toBeNull()
    expect(heading.dataset.tooltip).toContain("1/3 已启用")

    unmount()
  })

  it("渲染 text 类型控件", async () => {
    const testOptions = createTestOptions()
    const {
      container,
      unmount,
    } = await mountFeatureSection({ featureStyleOptions: testOptions })

    container.querySelectorAll('input[type="text"]')
    const controlTextInputs = container.querySelectorAll(".feature-control__text")
    expect(controlTextInputs.length).toBeGreaterThanOrEqual(1)

    const textInput = controlTextInputs[0] as HTMLInputElement
    expect(textInput.placeholder).toBe("请输入文本")

    unmount()
  })

  it("渲染 range 滑块", async () => {
    const testOptions = createTestOptions()
    const {
      container,
      unmount,
    } = await mountFeatureSection({ featureStyleOptions: testOptions })

    const rangeInputs = container.querySelectorAll('input[type="range"]')
    expect(rangeInputs.length).toBeGreaterThanOrEqual(1)

    const numberGroups = container.querySelectorAll(".feature-control__number-group")
    expect(numberGroups.length).toBeGreaterThanOrEqual(1)

    unmount()
  })

  it("颜色控件支持文本输入", async () => {
    const testOptions = createTestOptions()
    const {
      container,
      unmount,
    } = await mountFeatureSection({ featureStyleOptions: testOptions })

    const colorGroups = container.querySelectorAll(".feature-control__color-group")
    expect(colorGroups.length).toBeGreaterThanOrEqual(1)

    const colorGroup = colorGroups[0]
    expect(colorGroup.querySelector('input[type="color"]')).not.toBeNull()
    expect(colorGroup.querySelector(".feature-control__color-text")).not.toBeNull()

    unmount()
  })

  it("颜色控件从面板作用域解析主题变量", async () => {
    const testOptions = createTestOptions()
    const featureProfile = reactive(createDefaultFeatureProfile())
    featureProfile.paragraphHover.values.color = "var(--style-editor-link-color)"
    const themeAppearance = ref<"light" | "dark">("light")

    const {
      container,
      unmount,
    } = await mountFeatureSection({
      featureProfile,
      featureStyleOptions: testOptions,
      themeAppearance,
    })

    const host = container.querySelector(".feature-section") as HTMLElement
    host.style.setProperty("--style-editor-link-color", "#386fa8")
    themeAppearance.value = "dark"
    await nextTick()

    const colorInput = container.querySelector(".feature-control__color") as HTMLInputElement
    const colorTextInput = container.querySelector(".feature-control__color-text") as HTMLInputElement

    expect(colorInput.value).toBe("#386fa8")
    expect(colorTextInput.value).toBe("#386fa8")

    host.style.setProperty("--style-editor-link-color", "#8bb7e8")
    themeAppearance.value = "light"
    await nextTick()

    expect(colorInput.value).toBe("#8bb7e8")
    expect(colorTextInput.value).toBe("#8bb7e8")

    unmount()
  })

  it("折叠/展开面板", async () => {
    const {
      container,
      unmount,
    } = await mountFeatureSection()

    const body = container.querySelector(".feature-section__body") as HTMLElement
    expect(body).not.toBeNull()
    expect(body.style.display).toBe("none")

    const collapseBtn = container.querySelector(".panel-collapse-btn") as HTMLButtonElement
    expect(collapseBtn).not.toBeNull()

    collapseBtn.click()
    await nextTick()

    expect(body.style.display).toBe("")

    collapseBtn.click()
    await nextTick()

    expect(body.style.display).toBe("none")

    unmount()
  })
})
