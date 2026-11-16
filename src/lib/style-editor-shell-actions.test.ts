import {
  resolveExportStylesMessage,
  resolveExtractStylesMessage,
  resolveImportStylesMessage,
} from "@/lib/style-editor-shell-actions"

describe("style editor shell actions", () => {
  it("returns the empty-document feedback when no targets are matched", () => {
    expect(resolveExtractStylesMessage({
      extractedTargetCount: 0,
      matchedTargetCount: 0,
    })).toBe("未找到可提取的文档对象，请先打开包含标题或文本内容的文档。")
  })

  it("returns the no-explicit-color feedback when matched targets have no styles", () => {
    expect(resolveExtractStylesMessage({
      extractedTargetCount: 0,
      matchedTargetCount: 5,
    })).toBe("已扫描 5 类对象，但没有检测到可回填的显式颜色。")
  })

  it("returns the extraction success feedback when styles are found", () => {
    expect(resolveExtractStylesMessage({
      extractedTargetCount: 3,
      matchedTargetCount: 5,
    })).toBe("已提取 3 类对象的当前颜色，并同步到面板预览。")
  })

  it("returns the export success feedback with the styled target count", () => {
    expect(resolveExportStylesMessage({
      styledTargetCount: 4,
    })).toBe("已导出当前配置，包含 4 类对象的显式样式。")
  })

  it("returns the import success feedback with the styled target count", () => {
    expect(resolveImportStylesMessage({
      styledTargetCount: 2,
    })).toBe("已导入本地配置，当前 2 类对象带有显式样式。")
  })
})
