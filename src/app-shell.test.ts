import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("app shell layout", () => {
  it("does not show the selected target badge in the section header", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).not.toContain("class=\"target-badge\"");
  });

  it("uses a compact height for target preview cards", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain(".target-preview-card {");
    expect(appSource).toContain("gap: 4px;");
    expect(appSource).toContain("padding: 6px;");
    expect(appSource).toContain(".target-preview-card__surface {");
    expect(appSource).toContain("gap: 3px;");
    expect(appSource).toContain("min-height: 68px;");
    expect(appSource).toContain("padding: 8px;");
  });
});
