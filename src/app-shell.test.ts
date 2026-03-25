import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("app shell layout", () => {
  it("renders the shell with a command deck header and a compact target studio", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("class=\"workspace-hero\"");
    expect(appSource).toContain("class=\"workspace-hero__metrics\"");
    expect(appSource).toContain("class=\"workspace-toolbar\"");
    expect(appSource).toContain("class=\"target-studio\"");
  });

  it("surfaces selection context and sync feedback in the header instead of a detached side panel", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("当前对象");
    expect(appSource).toContain("当前通道");
    expect(appSource).toContain("状态");
    expect(appSource).toContain("{{ statusCopy }}");
  });

  it("keeps the palette editor focused with a concise floating heading", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain("Palette Console");
    expect(appSource).toContain("即时写入当前对象");
  });

  it("uses denser preview cards with stronger selection affordances", () => {
    const appSource = readFileSync(resolve(process.cwd(), "src/App.vue"), "utf8");

    expect(appSource).toContain(".target-preview-card {");
    expect(appSource).toContain("gap: 10px;");
    expect(appSource).toContain("padding: 10px;");
    expect(appSource).toContain(".target-preview-card__surface {");
    expect(appSource).toContain("gap: 6px;");
    expect(appSource).toContain("min-height: 92px;");
    expect(appSource).toContain("padding: 14px;");
  });
});
