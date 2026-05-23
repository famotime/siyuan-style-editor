import {
  applyCustomColorSelection,
  clearPaletteSelection,
  RESET_ALL_STYLES_MESSAGE,
  resolveExportStylesMessage,
  resolveExtractStylesMessage,
  resolveImportStylesMessage,
} from "@/lib/style-editor-shell-actions"

describe("style editor shell actions", () => {
  it("applies a valid custom color and closes the inline palette", async () => {
    const applyPaletteColor = vi.fn().mockResolvedValue(undefined)
    const closeInlinePalette = vi.fn()

    const appliedColor = await applyCustomColorSelection("#ABC", {
      applyPaletteColor,
      closeInlinePalette,
    })

    expect(appliedColor).toBe("#aabbcc")
    expect(applyPaletteColor).toHaveBeenCalledOnce()
    expect(applyPaletteColor).toHaveBeenCalledWith("#aabbcc")
    expect(closeInlinePalette).toHaveBeenCalledOnce()
  })

  it("ignores an invalid custom color draft", async () => {
    const applyPaletteColor = vi.fn().mockResolvedValue(undefined)
    const closeInlinePalette = vi.fn()

    const appliedColor = await applyCustomColorSelection("not-a-color", {
      applyPaletteColor,
      closeInlinePalette,
    })

    expect(appliedColor).toBe("")
    expect(applyPaletteColor).not.toHaveBeenCalled()
    expect(closeInlinePalette).not.toHaveBeenCalled()
  })

  it("clears the selected target color and closes the inline palette", async () => {
    const clearSelectedTargetColor = vi.fn().mockResolvedValue(undefined)
    const closeInlinePalette = vi.fn()

    await clearPaletteSelection({
      clearSelectedTargetColor,
      closeInlinePalette,
    })

    expect(clearSelectedTargetColor).toHaveBeenCalledOnce()
    expect(closeInlinePalette).toHaveBeenCalledOnce()
  })

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

  it("exposes the reset-all feedback copy as a constant", () => {
    expect(RESET_ALL_STYLES_MESSAGE).toBe("已清除全部样式，恢复到初始状态。")
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
