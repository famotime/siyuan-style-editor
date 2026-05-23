interface StyleEditorStylesheetController {
  apply: (css: string) => void
  remove: () => void
}

export function createStyleEditorStylesheetController(
  styleElementId: string,
): StyleEditorStylesheetController {
  let styleElement: HTMLStyleElement | null = null

  function ensureStyleElement(): HTMLStyleElement {
    if (styleElement?.isConnected) {
      return styleElement
    }

    styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null
    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = styleElementId
      document.head.appendChild(styleElement)
    }

    return styleElement
  }

  return {
    apply(css: string) {
      ensureStyleElement().textContent = css
    },
    remove() {
      if (!styleElement) {
        return
      }

      styleElement.remove()
      styleElement = null
    },
  }
}
