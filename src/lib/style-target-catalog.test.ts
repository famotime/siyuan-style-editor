import {
  getStyleTargetExtractSelector,
  getStyleTargetMeta,
  getStyleTargetSelector,
  STYLE_TARGETS,
} from "@/lib/style-target-catalog"

describe("style target catalog", () => {
  it("keeps the supported targets in the expected order", () => {
    expect(STYLE_TARGETS).toEqual([
      "heading1",
      "heading2",
      "heading3",
      "heading4",
      "heading5",
      "heading6",
      "strong",
      "blockquote",
      "inlineCode",
      "mark",
      "codeBlock",
      "bulletList",
      "orderedList",
      "taskList",
    ])
  })

  it("provides selector and UI metadata for every target", () => {
    for (const target of STYLE_TARGETS) {
      const meta = getStyleTargetMeta(target)

      expect(meta.value).toBe(target)
      expect(meta.label.length).toBeGreaterThan(0)
      expect(meta.shortLabel.length).toBeGreaterThan(0)
      expect(meta.hint.length).toBeGreaterThan(0)
      expect(getStyleTargetSelector(target).length).toBeGreaterThan(0)
      expect(getStyleTargetExtractSelector(target).length).toBeGreaterThan(0)
    }
  })
})
