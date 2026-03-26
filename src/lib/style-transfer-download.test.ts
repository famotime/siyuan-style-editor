import {
  createStyleTransferFilename,
  downloadStyleTransferDocument,
} from "@/lib/style-transfer-download";

describe("style transfer download", () => {
  it("formats exported filenames with the portable json pattern", () => {
    expect(createStyleTransferFilename(new Date("2026-03-27T01:23:45.000Z"))).toBe(
      "siyuan-style-editor-styles-2026-03-27-01-23-45.json",
    );
  });

  it("creates, clicks, and cleans up a temporary download link", () => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn().mockReturnValue("blob:style-export"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });

    const createObjectURL = vi.mocked(URL.createObjectURL);
    const revokeObjectURL = vi.mocked(URL.revokeObjectURL);
    const appendSpy = vi.spyOn(document.body, "append");
    const removeSpy = vi.spyOn(HTMLAnchorElement.prototype, "remove");
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadStyleTransferDocument("{\"profile\":{}}", new Date("2026-03-27T01:23:45.000Z"));

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(appendSpy).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(removeSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:style-export");
  });
});
