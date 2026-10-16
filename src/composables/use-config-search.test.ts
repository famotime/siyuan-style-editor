import { describe, expect, it } from "vitest"
import { nextTick } from "vue"
import { useConfigSearch } from "./use-config-search"
import type { FeatureStyleOption } from "@/lib/style-feature-catalog"
import type { StyleTargetMeta } from "@/lib/style-target-catalog"

describe("useConfigSearch", () => {
  const mockTargets: StyleTargetMeta[] = [
    {
      cssSelector: ".h1",
      extractSelector: ".h1",
      hint: "H1 标题提示",
      label: "H1 标题",
      shortLabel: "H1",
      value: "heading1",
    },
    {
      cssSelector: ".blockquote",
      extractSelector: ".blockquote",
      hint: "引述块提示",
      label: "引述块",
      shortLabel: "”",
      value: "blockquote",
    },
  ]

  const mockBodySafeFeatures: FeatureStyleOption[] = [
    {
      controls: [],
      group: "排版",
      hint: "段落呼吸感",
      label: "段落呼吸感",
      preview: "",
      risk: "正文安全",
      value: "paragraphSpacing",
    },
  ]

  const mockEditorUiFeatures: FeatureStyleOption[] = [
    {
      controls: [],
      group: "界面",
      hint: "侧边栏宽度控制",
      label: "侧边栏定制",
      preview: "",
      risk: "全屋改造",
      value: "sidebarCustomization" as any,
    },
  ]

  it("无搜索词时返回全量列表并维持初始折叠状态", () => {
    const search = useConfigSearch({
      bodySafeFeatureOptions: mockBodySafeFeatures,
      editorUiFeatureOptions: mockEditorUiFeatures,
      styleTargetOptions: mockTargets,
    })

    expect(search.isSearchActive.value).toBe(false)
    expect(search.filteredStyleTargetOptions.value).toHaveLength(2)
    expect(search.filteredBodySafeFeatureOptions.value).toHaveLength(1)
    expect(search.filteredEditorUiFeatureOptions.value).toHaveLength(1)
    expect(search.hasAnyMatches.value).toBe(true)
    expect(search.basicCollapsed.value).toBe(false)
    expect(search.advancedCollapsed.value).toBe(true)
    expect(search.editorUiCollapsed.value).toBe(true)
  })

  it("搜索时正确过滤并自动展开有结果的分类", async () => {
    const search = useConfigSearch({
      bodySafeFeatureOptions: mockBodySafeFeatures,
      editorUiFeatureOptions: mockEditorUiFeatures,
      styleTargetOptions: mockTargets,
    })

    search.searchQuery.value = "侧边栏"
    await nextTick()

    expect(search.isSearchActive.value).toBe(true)
    expect(search.filteredStyleTargetOptions.value).toHaveLength(0)
    expect(search.filteredBodySafeFeatureOptions.value).toHaveLength(0)
    expect(search.filteredEditorUiFeatureOptions.value).toHaveLength(1)
    expect(search.hasBasicMatches.value).toBe(false)
    expect(search.hasAdvancedMatches.value).toBe(false)
    expect(search.hasEditorUiMatches.value).toBe(true)
    expect(search.hasAnyMatches.value).toBe(true)

    // 全屋改造原本折叠，搜到后自动展开
    expect(search.editorUiCollapsed.value).toBe(false)
  })

  it("搜索无结果时 hasAnyMatches 为 false", async () => {
    const search = useConfigSearch({
      bodySafeFeatureOptions: mockBodySafeFeatures,
      editorUiFeatureOptions: mockEditorUiFeatures,
      styleTargetOptions: mockTargets,
    })

    search.searchQuery.value = "不存在的关键词xyz"
    await nextTick()

    expect(search.hasBasicMatches.value).toBe(false)
    expect(search.hasAdvancedMatches.value).toBe(false)
    expect(search.hasEditorUiMatches.value).toBe(false)
    expect(search.hasAnyMatches.value).toBe(false)
  })

  it("清空搜索时恢复用户搜索前的折叠状态", async () => {
    const search = useConfigSearch({
      bodySafeFeatureOptions: mockBodySafeFeatures,
      editorUiFeatureOptions: mockEditorUiFeatures,
      styleTargetOptions: mockTargets,
    })

    // 用户手动把基础粉刷折叠，高级定制展开
    search.basicCollapsed.value = true
    search.advancedCollapsed.value = false
    search.editorUiCollapsed.value = true

    // 触发搜索
    search.searchQuery.value = "段落"
    await nextTick()

    // 搜索时，如果搜到段落，高级定制会自动展开
    expect(search.advancedCollapsed.value).toBe(false)

    // 清空搜索
    search.clearSearch()
    await nextTick()

    expect(search.searchQuery.value).toBe("")
    expect(search.basicCollapsed.value).toBe(true)
    expect(search.advancedCollapsed.value).toBe(false)
    expect(search.editorUiCollapsed.value).toBe(true)
  })
})
