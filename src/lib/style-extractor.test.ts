import { extractStyleProfileFromDocument } from "@/lib/style-extractor";

describe("style extractor", () => {
  it("extracts explicit colors from matching document nodes", () => {
    document.body.innerHTML = `
      <div class="protyle-wysiwyg" style="color: rgb(34, 34, 34);">
        <div data-type="NodeHeading" class="h1" style="color: rgb(200, 40, 40);">Heading 1</div>
        <div data-type="NodeHeading" class="h2">Heading 2</div>
        <span data-type="strong" style="color: rgb(20, 120, 80);">Strong</span>
        <mark style="background-color: rgb(255, 240, 180);">Mark</mark>
      </div>
    `;

    const result = extractStyleProfileFromDocument(document);

    expect(result.matchedTargetCount).toBeGreaterThanOrEqual(3);
    expect(result.extractedTargetCount).toBe(3);
    expect(result.profile.heading1.color).toBe("rgb(200, 40, 40)");
    expect(result.profile.heading2.color).toBe("");
    expect(result.profile.strong.color).toBe("rgb(20, 120, 80)");
    expect(result.profile.mark.backgroundColor).toBe("rgb(255, 240, 180)");
  });

  it("returns an empty extraction when the document has no matching targets", () => {
    document.body.innerHTML = `<div class="unrelated">empty</div>`;

    const result = extractStyleProfileFromDocument(document);

    expect(result.matchedTargetCount).toBe(0);
    expect(result.extractedTargetCount).toBe(0);
    expect(result.profile.heading1.color).toBe("");
    expect(result.profile.mark.backgroundColor).toBe("");
  });
});
