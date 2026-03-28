const mockCreateDocWithMd = vi.hoisted(() => vi.fn());
const mockGetBlockByID = vi.hoisted(() => vi.fn());
const mockGetNotebookConf = vi.hoisted(() => vi.fn());
const mockLsNotebooks = vi.hoisted(() => vi.fn());
const mockRenderSprig = vi.hoisted(() => vi.fn());

vi.mock("@/api", () => ({
  createDocWithMd: mockCreateDocWithMd,
  getBlockByID: mockGetBlockByID,
  getNotebookConf: mockGetNotebookConf,
  lsNotebooks: mockLsNotebooks,
  renderSprig: mockRenderSprig,
}));

import {
  buildStylePreviewDocumentPath,
  createStylePreviewDocument,
  formatStylePreviewDocumentTitle,
} from "@/lib/style-preview-document";

describe("style preview document", () => {
  afterEach(() => {
    mockCreateDocWithMd.mockReset();
    mockGetBlockByID.mockReset();
    mockGetNotebookConf.mockReset();
    mockLsNotebooks.mockReset();
    mockRenderSprig.mockReset();
    window.siyuan = undefined as never;
  });

  it("formats the preview document title with the current date", () => {
    const now = new Date("2026-03-28T08:00:00.000Z");

    expect(formatStylePreviewDocumentTitle(now)).toBe("2026-03-28 样式效果预览");
  });

  it("builds the preview document path beside the rendered daily note path", () => {
    const now = new Date("2026-03-28T08:00:00.000Z");

    expect(buildStylePreviewDocumentPath("/日记/2026/03/2026-03-28", now)).toBe(
      "/日记/2026/03/2026-03-28 样式效果预览",
    );
  });

  it("creates the preview document in the current notebook daily note directory", async () => {
    const now = new Date("2026-03-28T08:00:00.000Z");
    window.siyuan = {
      getActiveEditor: () => ({
        protyle: {
          block: {
            rootID: "20260328112233-abcdefg",
          },
        },
      }),
    } as never;
    mockGetBlockByID.mockResolvedValue({
      box: "box-current",
    });
    mockGetNotebookConf.mockResolvedValue({
      conf: {
        dailyNoteSavePath: "/日记/{{now | date \"2006/03\"}}/{{now | date \"2006-01-02\"}}",
      },
    });
    mockRenderSprig.mockResolvedValue("/日记/2026/03/2026-03-28");
    mockCreateDocWithMd.mockResolvedValue("20260328123456-preview");

    const result = await createStylePreviewDocument(now);

    expect(mockGetBlockByID).toHaveBeenCalledWith("20260328112233-abcdefg");
    expect(mockGetNotebookConf).toHaveBeenCalledWith("box-current");
    expect(mockRenderSprig).toHaveBeenCalledWith("/日记/{{now | date \"2006/03\"}}/{{now | date \"2006-01-02\"}}");
    expect(mockCreateDocWithMd).toHaveBeenCalledWith(
      "box-current",
      "/日记/2026/03/2026-03-28 样式效果预览",
      expect.stringContaining("# 样式效果预览文档"),
    );
    expect(result).toEqual({
      documentId: "20260328123456-preview",
      notebookId: "box-current",
      path: "/日记/2026/03/2026-03-28 样式效果预览",
      title: "2026-03-28 样式效果预览",
    });
  });
});
