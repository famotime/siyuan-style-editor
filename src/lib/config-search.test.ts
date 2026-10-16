import { describe, expect, it } from "vitest"
import {
  highlightParts,
  matchFeatureOption,
  matchTargetOption,
} from "./config-search"
import type { FeatureStyleOption } from "./style-feature-catalog"
import type { StyleTargetMeta } from "./style-target-catalog"

describe("config-search", () => {
  describe("highlightParts", () => {
    it("当 query 为空时返回单个未匹配片段", () => {
      expect(highlightParts("标题颜色", "")).toEqual([
        { text: "标题颜色", isMatch: false },
      ])
      expect(highlightParts("标题颜色", "   ")).toEqual([
        { text: "标题颜色", isMatch: false },
      ])
    })

    it("当 text 为空时返回空数组", () => {
      expect(highlightParts("", "test")).toEqual([])
    })

    it("正确拆分首尾及中间匹配的片段（不区分大小写）", () => {
      const parts = highlightParts("H1 标题 h1 效果", "h1")
      expect(parts).toEqual([
        { text: "H1", isMatch: true },
        { text: " 标题 ", isMatch: false },
        { text: "h1", isMatch: true },
        { text: " 效果", isMatch: false },
      ])
    })

    it("没有匹配时返回原始文本", () => {
      expect(highlightParts("标题颜色", "表格")).toEqual([
        { text: "标题颜色", isMatch: false },
      ])
    })
  })

  describe("matchTargetOption", () => {
    const mockTarget: StyleTargetMeta = {
      cssSelector: ".h1",
      extractSelector: ".h1",
      hint: "用于文章总标题",
      label: "H1 标题",
      shortLabel: "H1",
      value: "heading1",
    }
    const mockT = (key: string) => {
      if (key === "heading1") return "H1 标题"
      if (key === "colorLabel") return "文字颜色"
      if (key === "bgColorLabel") return "背景色"
      return key
    }

    it("空搜索词时总是匹配", () => {
      expect(matchTargetOption(mockTarget, "", mockT)).toBe(true)
      expect(matchTargetOption(mockTarget, "   ", mockT)).toBe(true)
    })

    it("匹配 shortLabel、label、value、hint", () => {
      expect(matchTargetOption(mockTarget, "h1", mockT)).toBe(true)
      expect(matchTargetOption(mockTarget, "H1", mockT)).toBe(true)
      expect(matchTargetOption(mockTarget, "标题", mockT)).toBe(true)
      expect(matchTargetOption(mockTarget, "heading1", mockT)).toBe(true)
      expect(matchTargetOption(mockTarget, "文章总标题", mockT)).toBe(true)
    })

    it("匹配通道关键词（如文字颜色、背景色）", () => {
      expect(matchTargetOption(mockTarget, "文字颜色", mockT)).toBe(true)
      expect(matchTargetOption(mockTarget, "背景色", mockT)).toBe(true)
    })

    it("不匹配无关关键词", () => {
      expect(matchTargetOption(mockTarget, "无边框表格", mockT)).toBe(false)
    })
  })

  describe("matchFeatureOption", () => {
    const mockFeature: FeatureStyleOption = {
      controls: [
        {
          key: "style",
          label: "线条样式",
          options: [
            { label: "虚线", value: "dashed" },
            { label: "实线", value: "solid" },
          ],
          type: "select",
        },
      ],
      group: "排版与文本",
      hint: "自定义段落视觉间距",
      label: "段落呼吸感",
      preview: "段落预览",
      risk: "正文安全",
      value: "paragraphSpacing",
    }
    const mockT = (key: string) => key

    it("空搜索词时总是匹配", () => {
      expect(matchFeatureOption(mockFeature, "", mockT)).toBe(true)
    })

    it("匹配 label、hint、preview、group、value", () => {
      expect(matchFeatureOption(mockFeature, "呼吸感", mockT)).toBe(true)
      expect(matchFeatureOption(mockFeature, "段落", mockT)).toBe(true)
      expect(matchFeatureOption(mockFeature, "间距", mockT)).toBe(true)
      expect(matchFeatureOption(mockFeature, "排版", mockT)).toBe(true)
      expect(matchFeatureOption(mockFeature, "paragraphSpacing", mockT)).toBe(true)
    })

    it("匹配内部控件和选项名称（如虚线、实线）", () => {
      expect(matchFeatureOption(mockFeature, "线条样式", mockT)).toBe(true)
      expect(matchFeatureOption(mockFeature, "虚线", mockT)).toBe(true)
      expect(matchFeatureOption(mockFeature, "dashed", mockT)).toBe(true)
    })

    it("不匹配无关关键词", () => {
      expect(matchFeatureOption(mockFeature, "全屏编辑器", mockT)).toBe(false)
    })
  })
})
