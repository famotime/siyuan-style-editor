import {
  createStyleTransferFilename,
  downloadStyleTransferDocument,
} from "@/lib/style-transfer-download"

describe("style transfer download", () => {
  it("formats exported filenames with style name, author, and timestamp", () => {
    expect(createStyleTransferFilename({
      author: "无名",
      now: new Date("2026-03-27T01:23:45.000Z"),
      styleName: "无名样式",
    })).toBe(
      "无名样式_from_无名作者_2026-03-27-01-23-45.json",
    )
  })

  it("creates, clicks, and cleans up a temporary download link", () => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn().mockReturnValue("blob:style-export"),
    })
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    })

    const createObjectURL = vi.mocked(URL.createObjectURL)
    const revokeObjectURL = vi.mocked(URL.revokeObjectURL)
    const appendSpy = vi.spyOn(document.body, "append")
    const removeSpy = vi.spyOn(HTMLAnchorElement.prototype, "remove")
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})

    downloadStyleTransferDocument("{\"profile\":{}}", {
      author: "Alice",
      now: new Date("2026-03-27T01:23:45.000Z"),
      styleName: "Paper Glow",
    })

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(appendSpy).toHaveBeenCalledOnce()
    expect(clickSpy).toHaveBeenCalledOnce()
    expect((appendSpy.mock.calls[0]?.[0] as HTMLAnchorElement | undefined)?.download).toBe(
      "Paper Glow_from_Alice作者_2026-03-27-01-23-45.json",
    )
    expect(removeSpy).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:style-export")
  })
})
