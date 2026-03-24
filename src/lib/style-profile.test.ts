import {
  buildStyleCss,
  createDefaultStyleProfile,
  extractStyleProfileFromTemplate,
  normalizeStyleProfile,
} from "@/lib/style-profile";

describe("style profile utilities", () => {
  it("creates a complete default profile for supported targets", () => {
    const profile = createDefaultStyleProfile();

    expect(profile.heading1.color).toBe("");
    expect(profile.heading6.color).toBe("");
    expect(profile.strong.color).toBe("");
  });

  it("normalizes partial data onto the default profile", () => {
    const profile = normalizeStyleProfile({
      heading1: { color: "rgb(255, 0, 0)" },
    });

    expect(profile.heading1.color).toBe("rgb(255, 0, 0)");
    expect(profile.heading2.color).toBe("");
    expect(profile.strong.fontWeight).toBe("");
  });

  it("builds css rules only for targets with defined styles", () => {
    const css = buildStyleCss({
      heading1: { color: "rgb(235, 131, 131)", fontWeight: "700" },
      strong: { color: "rgb(106, 176, 76)" },
    });

    expect(css).toContain('[data-type="NodeHeading"].h1');
    expect(css).toContain("color: rgb(235, 131, 131) !important;");
    expect(css).toContain("font-weight: 700 !important;");
    expect(css).toContain("span[data-type~=strong]");
    expect(css).not.toContain('[data-type="NodeHeading"].h2');
  });

  it("extracts styles from the designated sample nodes inside a template document", () => {
    document.body.innerHTML = `
      <div class="protyle-wysiwyg">
        <div data-type="NodeHeading" class="h1" style="color: rgb(255, 0, 0);">不是样例</div>
        <div data-type="NodeHeading" class="h1" style="color: rgb(1, 2, 3);">H1 标题</div>
        <div data-type="NodeHeading" class="h2" style="color: rgb(4, 5, 6);">H2 标题</div>
        <div data-type="NodeHeading" class="h6" style="color: rgb(7, 8, 9);">H6 标题</div>
        <p><strong style="color: rgb(10, 11, 12); font-weight: 800;">加粗文本</strong></p>
      </div>
    `;

    const profile = extractStyleProfileFromTemplate(document.body);

    expect(profile.heading1.color).toBe("rgb(1, 2, 3)");
    expect(profile.heading2.color).toBe("rgb(4, 5, 6)");
    expect(profile.heading6.color).toBe("rgb(7, 8, 9)");
    expect(profile.strong.color).toBe("rgb(10, 11, 12)");
    expect(profile.strong.fontWeight).toBe("800");
  });
});
