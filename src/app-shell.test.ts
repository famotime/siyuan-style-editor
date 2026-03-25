import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("app shell layout", () => {
  it("renders the shell as a unified workspace card instead of split hero and preview cards", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("class=\"style-card style-card--workspace\"");
    expect(appSource).not.toContain("class=\"style-card style-card--hero\"");
    expect(appSource).not.toContain("<section class=\"style-card\">");
  });

  it("keeps the top controls in the left intro block without a separate status side panel", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).not.toContain("class=\"workspace-intro__aside\"");
    expect(appSource).not.toContain("Sync Status");
    expect(appSource).toContain("class=\"workspace-intro__actions\"");
  });

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
