import { extractStyleProfileFromDocument } from "@/lib/style-extractor"

describe("style extractor", () => {
  it("extracts explicit colors from matching document nodes", () => {
    document.body.innerHTML = `
      <div class="protyle-wysiwyg" style="color: rgb(34, 34, 34);">
        <div data-type="NodeHeading" class="h1" style="color: rgb(200, 40, 40);">Heading 1</div>
        <div data-type="NodeHeading" class="h2">Heading 2</div>
        <span data-type="strong" style="color: rgb(20, 120, 80);">Strong</span>
        <mark style="background-color: rgb(255, 240, 180);">Mark</mark>
      </div>
    `

    const result = extractStyleProfileFromDocument(document)

    expect(result.matchedTargetCount).toBeGreaterThanOrEqual(3)
    expect(result.extractedTargetCount).toBe(3)
    expect(result.profile.heading1.color).toBe("rgb(200, 40, 40)")
    expect(result.profile.heading2.color).toBe("")
    expect(result.profile.strong.color).toBe("rgb(20, 120, 80)")
    expect(result.profile.mark.backgroundColor).toBe("rgb(255, 240, 180)")
  })

  it("returns an empty extraction when the document has no matching targets", () => {
    document.body.innerHTML = `<div class="unrelated">empty</div>`

    const result = extractStyleProfileFromDocument(document)

    expect(result.matchedTargetCount).toBe(0)
    expect(result.extractedTargetCount).toBe(0)
    expect(result.profile.heading1.color).toBe("")
    expect(result.profile.mark.backgroundColor).toBe("")
  })

  it("extracts list colors from SiYuan NodeList containers", () => {
    document.body.innerHTML = `
      <div class="protyle-wysiwyg" style="color: rgb(34, 34, 34);">
        <div data-type="NodeList" data-subtype="u" style="color: rgb(51, 51, 51);">
          <div data-type="NodeListItem" data-subtype="u">
            <div data-type="NodeParagraph">Bullet</div>
          </div>
        </div>
        <div data-type="NodeList" data-subtype="o" style="color: rgb(68, 68, 68);">
          <div data-type="NodeListItem" data-subtype="o">
            <div data-type="NodeParagraph">Ordered</div>
          </div>
        </div>
        <div data-type="NodeList" data-subtype="t" style="color: rgb(85, 85, 85);">
          <div data-type="NodeListItem" data-subtype="t">
            <div class="protyle-task"></div>
            <div data-type="NodeParagraph">Task</div>
          </div>
        </div>
      </div>
    `

    const result = extractStyleProfileFromDocument(document)

    expect(result.profile.bulletList.color).toBe("rgb(51, 51, 51)")
    expect(result.profile.orderedList.color).toBe("rgb(68, 68, 68)")
    expect(result.profile.taskList.color).toBe("rgb(85, 85, 85)")
    expect(result.extractedTargetCount).toBeGreaterThanOrEqual(3)
    expect(result.matchedTargetCount).toBeGreaterThanOrEqual(3)
  })
})
