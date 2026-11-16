import {
  ref,
  watch,
} from "vue"

interface UseCollapsedModelOptions {
  collapsed: () => boolean
  onUpdateCollapsed: (value: boolean) => void
}

export function useCollapsedModel(options: UseCollapsedModelOptions) {
  const internalCollapsed = ref(options.collapsed())

  watch(options.collapsed, (value) => {
    internalCollapsed.value = value
  })

  function toggleCollapse() {
    internalCollapsed.value = !internalCollapsed.value
    options.onUpdateCollapsed(internalCollapsed.value)
  }

  return {
    internalCollapsed,
    toggleCollapse,
  }
}
