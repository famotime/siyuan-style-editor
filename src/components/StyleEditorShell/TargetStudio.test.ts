import {
  createApp,
  h,
  nextTick,
} from "vue"

import TargetStudio from "@/components/StyleEditorShell/TargetStudio.vue"

function createProps() {
  return {
    getChannelSwatch: (target: string, channel: string) => ({
      background: channel === "color"
        ? target === "heading1" ? "#224488" : "#3355aa"
        : target === "heading1" ? "#fff2a8" : "#f6d365",
      isEmpty: false,
    }),
    getTargetPreviewStyle: () => ({
      color: "var(--panel-text)",
    }),
    isInlinePaletteOpenForTarget: () => false,
    selectedChannel: "color",
    selectedTarget: "heading1",
    styleTargetOptions: [
      {
        hint: "用于文章总标题与大章节入口",
        label: "H1 标题",
        shortLabel: "H1",
        value: "heading1",
      },
      {
        hint: "用于显式标记重点内容",
        label: "高亮文本",
        shortLabel: "HL",
        value: "mark",
      },
    ],
  } as const
}

async function mountTargetStudio() {
  const onActivateChannel = vi.fn()
  const onSavePresetPalette = vi.fn()
  const onSelectTarget = vi.fn()
  const onSwapChannelValue = vi.fn()
  const container = document.createElement("div")
  document.body.append(container)

  const app = createApp({
    render() {
      return h(TargetStudio, {
        ...createProps(),
        onActivateChannel,
        onSavePresetPalette,
        onSelectTarget,
        onSwapChannelValue,
      })
    },
  })

  app.mount(container)
  await nextTick()

  return {
    container,
    onActivateChannel,
    onSavePresetPalette,
    onSelectTarget,
    onSwapChannelValue,
    unmount() {
      app.unmount()
      container.remove()
    },
  }
}

describe("targetStudio", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.clearAllMocks()
  })

  it("shows drag preview and drop-target state while dragging an orb", async () => {
    const {
      container,
      unmount,
    } = await mountTargetStudio()

    const cards = [...container.querySelectorAll(".target-preview-card")]
    const sourceOrb = cards[0]?.querySelectorAll(".channel-orb")[0] as HTMLElement | null
    const targetOrb = cards[1]?.querySelectorAll(".channel-orb")[1] as HTMLElement | null

    sourceOrb!.dispatchEvent(new MouseEvent("mousedown", {
      bubbles: true,
      clientX: 16,
      clientY: 16,
    }))
    window.dispatchEvent(new MouseEvent("mousemove", {
      bubbles: true,
      clientX: 40,
      clientY: 40,
    }))
    targetOrb!.dispatchEvent(new MouseEvent("mouseenter", {
      bubbles: true,
      clientX: 40,
      clientY: 40,
    }))
    await nextTick()

    expect(container.querySelector(".target-studio__drag-preview")).not.toBeNull()
    expect(sourceOrb?.classList.contains("channel-orb--drag-source")).toBe(true)
    expect(targetOrb?.classList.contains("channel-orb--drop-target")).toBe(true)

    unmount()
  })
})
