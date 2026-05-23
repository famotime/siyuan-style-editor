import {
  parseImportedStyleProfile,
  parseImportedStyleTransfer,
  serializeStyleProfileTransfer,
} from "@/lib/style-transfer"

describe("style transfer", () => {
  it("serializes the current profile as a portable transfer document", () => {
    const serialized = serializeStyleProfileTransfer({
      mark: {
        backgroundColor: "#fff2a8",
      },
    }, {
      author: "无名",
      styleName: "无名样式",
    }, "2026-03-26T00:00:00.000Z", {
      imageRadius: {
        enabled: true,
        values: {
          radius: 12,
        },
      },
    })

    expect(JSON.parse(serialized)).toEqual({
      author: "无名",
      exportedAt: "2026-03-26T00:00:00.000Z",
      featureProfile: expect.objectContaining({
        imageRadius: expect.objectContaining({
          enabled: true,
          values: expect.objectContaining({
            radius: 12,
          }),
        }),
      }),
      profile: expect.objectContaining({
        mark: expect.objectContaining({
          backgroundColor: "#fff2a8",
        }),
      }),
      styleName: "无名样式",
      type: "siyuan-style-editor-profile",
      version: 1,
    })
  })

  it("imports either a transfer document or a persisted config payload", () => {
    expect(parseImportedStyleTransfer(JSON.stringify({
      type: "siyuan-style-editor-profile",
      version: 1,
      exportedAt: "2026-03-26T00:00:00.000Z",
      featureProfile: {
        paragraphHover: {
          enabled: true,
          values: {
            backgroundColor: "#eeeeee",
          },
        },
      },
      profile: {
        heading1: {
          color: "#224488",
        },
      },
    }))).toEqual(expect.objectContaining({
      featureProfile: expect.objectContaining({
        paragraphHover: expect.objectContaining({
          enabled: true,
          values: expect.objectContaining({
            backgroundColor: "#eeeeee",
          }),
        }),
      }),
      profile: expect.objectContaining({
        heading1: expect.objectContaining({
          color: "#224488",
        }),
      }),
    }))

    expect(parseImportedStyleProfile(JSON.stringify({
      profile: {
        mark: {
          backgroundColor: "#fff2a8",
        },
      },
    })).mark.backgroundColor).toBe("#fff2a8")
  })

  it("keeps legacy imports without featureProfile backwards compatible", () => {
    const parsed = parseImportedStyleTransfer(JSON.stringify({
      profile: {
        heading1: {
          color: "#224488",
        },
      },
    }))

    expect(parsed.profile.heading1.color).toBe("#224488")
    expect(parsed.featureProfile.imageRadius.enabled).toBe(false)
    expect(parsed.featureProfile.imageRadius.values.radius).toBe(6)
  })

  it("rejects invalid local config payloads", () => {
    expect(() => parseImportedStyleProfile("{")).toThrow("样式配置文件不是有效的 JSON。")
    expect(() => parseImportedStyleProfile(JSON.stringify({}))).toThrow("样式配置文件缺少可导入的 profile 字段。")
    expect(() => parseImportedStyleProfile(JSON.stringify({
      type: "unknown",
    }))).toThrow("样式配置文件格式不受支持。")
  })

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
    }))

    expect(parseImportedStyleTransfer(JSON.stringify({
      profile: {
        mark: {
          backgroundColor: "#fff2a8",
        },
      },
    })).metadata).toEqual({
      author: "无名",
      styleName: "无名样式",
    })
  })
})
