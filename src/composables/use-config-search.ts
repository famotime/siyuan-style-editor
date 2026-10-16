import { computed, ref, watch } from "vue"
import {
  matchFeatureOption,
  matchTargetOption,
} from "@/lib/config-search"
import type { FeatureStyleOption } from "@/lib/style-feature-catalog"
import type { StyleTargetMeta } from "@/lib/style-target-catalog"
import { t } from "@/style-editor-runtime"

export interface UseConfigSearchOptions {
  bodySafeFeatureOptions: FeatureStyleOption[]
  editorUiFeatureOptions: FeatureStyleOption[]
  styleTargetOptions: StyleTargetMeta[]
}

export function useConfigSearch(options: UseConfigSearchOptions) {
  const searchQuery = ref("")

  const basicCollapsed = ref(false)
  const advancedCollapsed = ref(true)
  const editorUiCollapsed = ref(true)

  let savedCollapsedState = {
    advanced: true,
    basic: false,
    editorUi: true,
  }

  const isSearchActive = computed(() => Boolean(searchQuery.value.trim()))

  const filteredStyleTargetOptions = computed(() => {
    if (!isSearchActive.value) {
      return options.styleTargetOptions
    }
    return options.styleTargetOptions.filter((target) =>
      matchTargetOption(target, searchQuery.value, t),
    )
  })

  const filteredBodySafeFeatureOptions = computed(() => {
    if (!isSearchActive.value) {
      return options.bodySafeFeatureOptions
    }
    return options.bodySafeFeatureOptions.filter((feature) =>
      matchFeatureOption(feature, searchQuery.value, t),
    )
  })

  const filteredEditorUiFeatureOptions = computed(() => {
    if (!isSearchActive.value) {
      return options.editorUiFeatureOptions
    }
    return options.editorUiFeatureOptions.filter((feature) =>
      matchFeatureOption(feature, searchQuery.value, t),
    )
  })

  const hasBasicMatches = computed(() => filteredStyleTargetOptions.value.length > 0)
  const hasAdvancedMatches = computed(() => filteredBodySafeFeatureOptions.value.length > 0)
  const hasEditorUiMatches = computed(() => filteredEditorUiFeatureOptions.value.length > 0)

  const hasAnyMatches = computed(() => {
    if (!isSearchActive.value) {
      return true
    }
    return hasBasicMatches.value || hasAdvancedMatches.value || hasEditorUiMatches.value
  })

  watch(searchQuery, (newVal, oldVal) => {
    const isNewActive = Boolean(newVal.trim())
    const wasOldActive = Boolean(oldVal?.trim())

    if (isNewActive && !wasOldActive) {
      // 刚进入搜索，记录用户原有折叠状态
      savedCollapsedState = {
        advanced: advancedCollapsed.value,
        basic: basicCollapsed.value,
        editorUi: editorUiCollapsed.value,
      }
    }

    if (isNewActive) {
      // 有匹配项的分类自动展开
      if (hasBasicMatches.value) {
        basicCollapsed.value = false
      }
      if (hasAdvancedMatches.value) {
        advancedCollapsed.value = false
      }
      if (hasEditorUiMatches.value) {
        editorUiCollapsed.value = false
      }
    } else if (wasOldActive && !isNewActive) {
      // 清空搜索，还原之前记忆的折叠状态
      basicCollapsed.value = savedCollapsedState.basic
      advancedCollapsed.value = savedCollapsedState.advanced
      editorUiCollapsed.value = savedCollapsedState.editorUi
    }
  })

  function clearSearch() {
    searchQuery.value = ""
  }

  return {
    advancedCollapsed,
    basicCollapsed,
    clearSearch,
    editorUiCollapsed,
    filteredBodySafeFeatureOptions,
    filteredEditorUiFeatureOptions,
    filteredStyleTargetOptions,
    hasAdvancedMatches,
    hasAnyMatches,
    hasBasicMatches,
    hasEditorUiMatches,
    isSearchActive,
    searchQuery,
  }
}
