import { createStyleEditorStylesheetController } from "@/lib/style-editor-stylesheet"

describe("styleEditorStylesheet", () => {
  afterEach(() => {
    document.head.innerHTML = ""
  })

  it("applies css by creating a style element with the given id", () => {
    const stylesheet = createStyleEditorStylesheetController("style-editor-test")

    stylesheet.apply("body { color: red; }")

    const styleElement = document.getElementById("style-editor-test")
    expect(styleElement).not.toBeNull()
    expect(styleElement?.tagName).toBe("STYLE")
    expect(styleElement?.textContent).toBe("body { color: red; }")
  })

  it("reuses the same style element on repeated apply", () => {
    const stylesheet = createStyleEditorStylesheetController("style-editor-test")

    stylesheet.apply("body { color: red; }")
    stylesheet.apply("body { color: blue; }")

    const styleElements = document.querySelectorAll("#style-editor-test")
    expect(styleElements.length).toBe(1)
    expect(styleElements[0]?.textContent).toBe("body { color: blue; }")
  })

  it("adopts an existing style element with the same id", () => {
    const preexisting = document.createElement("style")
    preexisting.id = "style-editor-test"
    document.head.append(preexisting)

    const stylesheet = createStyleEditorStylesheetController("style-editor-test")
    stylesheet.apply("body { color: green; }")

    expect(document.querySelectorAll("#style-editor-test").length).toBe(1)
    expect(preexisting.textContent).toBe("body { color: green; }")
  })

  it("removes the style element and recreates it on the next apply", () => {
    const stylesheet = createStyleEditorStylesheetController("style-editor-test")

    stylesheet.apply("body { color: red; }")
    stylesheet.remove()

    expect(document.getElementById("style-editor-test")).toBeNull()

    stylesheet.apply("body { color: blue; }")
    expect(document.getElementById("style-editor-test")?.textContent).toBe("body { color: blue; }")
  })

  it("ignores remove when nothing was applied", () => {
    const stylesheet = createStyleEditorStylesheetController("style-editor-test")

    expect(() => stylesheet.remove()).not.toThrow()
    expect(document.getElementById("style-editor-test")).toBeNull()
  })
})
