import {
  parseImportedStyleTransfer,
  parseImportedStyleProfile,
  serializeStyleProfileTransfer,
} from "@/lib/style-transfer";

describe("style transfer", () => {
  it("serializes the current profile as a portable transfer document", () => {
    const serialized = serializeStyleProfileTransfer({
      mark: {
        backgroundColor: "#fff2a8",
      },
    }, {
      author: "无名",
      styleName: "无名样式",
    }, "2026-03-26T00:00:00.000Z");

    expect(JSON.parse(serialized)).toEqual({
      author: "无名",
      exportedAt: "2026-03-26T00:00:00.000Z",
      profile: expect.objectContaining({
        mark: expect.objectContaining({
          backgroundColor: "#fff2a8",
        }),
      }),
      styleName: "无名样式",
      type: "siyuan-style-editor-profile",
      version: 1,
    });
  });

  it("imports either a transfer document or a persisted config payload", () => {
    expect(parseImportedStyleProfile(JSON.stringify({
      type: "siyuan-style-editor-profile",
      version: 1,
      exportedAt: "2026-03-26T00:00:00.000Z",
      profile: {
        heading1: {
          color: "#224488",
        },
      },
    })).heading1.color).toBe("#224488");

    expect(parseImportedStyleProfile(JSON.stringify({
      profile: {
        mark: {
          backgroundColor: "#fff2a8",
        },
      },
    })).mark.backgroundColor).toBe("#fff2a8");
  });

  it("rejects invalid local config payloads", () => {
    expect(() => parseImportedStyleProfile("{")).toThrow("样式配置文件不是有效的 JSON。");
    expect(() => parseImportedStyleProfile(JSON.stringify({}))).toThrow("样式配置文件缺少可导入的 profile 字段。");
    expect(() => parseImportedStyleProfile(JSON.stringify({
      type: "unknown",
    }))).toThrow("样式配置文件格式不受支持。");
  });

  it("parses imported transfer metadata and falls back to default names", () => {
    expect(parseImportedStyleTransfer(JSON.stringify({
      author: "Alice",
      profile: {
        heading1: {
          color: "#224488",
        },
      },
      styleName: "Paper Glow",
    }))).toEqual(expect.objectContaining({
      metadata: {
        author: "Alice",
        styleName: "Paper Glow",
      },
      profile: expect.objectContaining({
        heading1: expect.objectContaining({
          color: "#224488",
        }),
      }),
    }));

    expect(parseImportedStyleTransfer(JSON.stringify({
      profile: {
        mark: {
          backgroundColor: "#fff2a8",
        },
      },
    })).metadata).toEqual({
      author: "无名",
      styleName: "无名样式",
    });
  });
});
