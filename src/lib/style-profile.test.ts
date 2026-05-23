import {
  buildStyleCss,
  createDefaultStyleProfile,
  normalizeStyleProfile,
} from "@/lib/style-profile"

describe("style profile utilities", () => {
  it("creates a complete default profile for supported targets", () => {
    const profile = createDefaultStyleProfile()

    expect(profile.heading1.color).toBe("")
    expect(profile.heading6.color).toBe("")
    expect(profile.strong.color).toBe("")
    expect(profile.blockquote.color).toBe("")
    expect(profile.inlineCode.backgroundColor).toBe("")
    expect(profile.mark.backgroundColor).toBe("")
    expect(profile.codeBlock.backgroundColor).toBe("")
    expect(profile.bulletList.color).toBe("")
    expect(profile.orderedList.color).toBe("")
    expect(profile.taskList.color).toBe("")
  })

  it("normalizes partial data onto the default profile", () => {
    const profile = normalizeStyleProfile({
      heading1: { color: "rgb(255, 0, 0)" },
    })

    expect(profile.heading1.color).toBe("rgb(255, 0, 0)")
    expect(profile.heading2.color).toBe("")
    expect(profile.strong.fontWeight).toBe("")
    expect(profile.blockquote.backgroundColor).toBe("")
    expect(profile.codeBlock.backgroundColor).toBe("")
  })

  it("builds css rules only for targets with defined styles", () => {
    const css = buildStyleCss({
      heading1: {
        color: "rgb(235, 131, 131)",
        fontWeight: "700",
      },
      strong: { color: "rgb(106, 176, 76)" },
      blockquote: { backgroundColor: "rgb(255, 250, 250)" },
      inlineCode: { color: "rgb(44, 62, 80)" },
      mark: { backgroundColor: "rgb(255, 245, 157)" },
      codeBlock: { backgroundColor: "rgb(30, 30, 30)" },
      bulletList: { color: "rgb(51, 51, 51)" },
      orderedList: { color: "rgb(68, 68, 68)" },
      taskList: { color: "rgb(85, 85, 85)" },
    })

    expect(css).toContain('[data-type="NodeHeading"].h1')
    expect(css).toContain("color: rgb(235, 131, 131) !important;")
    expect(css).toContain("font-weight: 700 !important;")
    expect(css).toContain("span[data-type~=strong]")
    expect(css).toContain(".b3-typography blockquote")
    expect(css).toContain("background-color: rgb(255, 250, 250) !important;")
    expect(css).toContain("span[data-type~=code]")
    expect(css).toContain("mark")
    expect(css).toContain(".b3-typography pre")
    expect(css).toContain('[data-type="NodeList"][data-subtype="u"]')
    expect(css).toContain('[data-type="NodeList"][data-subtype="o"]')
    expect(css).toContain('[data-type="NodeList"][data-subtype="t"]')
    expect(css).not.toContain('[data-type="NodeHeading"].h2')
  })

  it("builds list css against SiYuan NodeList DOM selectors", () => {
    const css = buildStyleCss({
      bulletList: { color: "#223344" },
      orderedList: { color: "#334455" },
      taskList: { color: "#445566" },
    })

    expect(css).toContain('.protyle-wysiwyg [data-type="NodeList"][data-subtype="u"]')
    expect(css).toContain('.protyle-wysiwyg [data-type="NodeList"][data-subtype="o"]')
    expect(css).toContain('.protyle-wysiwyg [data-type="NodeList"][data-subtype="t"]')
    expect(css).toContain("color: #223344 !important;")
    expect(css).toContain("color: #334455 !important;")
    expect(css).toContain("color: #445566 !important;")
  })

})
