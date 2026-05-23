import {
  DEFAULT_STYLE_TRANSFER_AUTHOR,
  DEFAULT_STYLE_TRANSFER_NAME,
} from "@/lib/style-transfer"

interface StyleTransferFilenameOptions {
  author: string
  now?: Date
  styleName: string
}

function sanitizeFilenamePart(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    || "untitled"
}

export function createStyleTransferFilename(options: StyleTransferFilenameOptions) {
  const author = sanitizeFilenamePart(options.author || DEFAULT_STYLE_TRANSFER_AUTHOR)
  const styleName = sanitizeFilenamePart(options.styleName || DEFAULT_STYLE_TRANSFER_NAME)
  const now = options.now ?? new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[:T]/g, "-")

  return `${styleName}_from_${author}作者_${timestamp}.json`
}

export function downloadStyleTransferDocument(content: string, options: StyleTransferFilenameOptions) {
  if (typeof document === "undefined") {
    return
  }

  const exportUrl = URL.createObjectURL(new Blob([content], {
    type: "application/json;charset=utf-8",
  }))
  const downloadLink = document.createElement("a")
  downloadLink.href = exportUrl
  downloadLink.download = createStyleTransferFilename(options)
  document.body.append(downloadLink)
  downloadLink.click()
  downloadLink.remove()
  URL.revokeObjectURL(exportUrl)
}
