import {
  createDocWithMd,
  getBlockByID,
  getNotebookConf,
  lsNotebooks,
  openDocByTab,
  renderSprig,
} from "@/api"
import { getPluginApp, t } from "@/style-editor-runtime"

import stylePreviewDocumentMarkdown from "../../docs/样式效果预览文档.md?raw"

const STYLE_PREVIEW_SUFFIX = "样式效果预览"

interface ActiveDocumentTarget {
  id: string
  title: string
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isTabLike(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== "object") {
    return false
  }

  return value.instance === "Tab" || "model" in value || "headElement" in value || "title" in value
}

function getLayoutChildren(node: unknown): Record<string, any>[] {
  if (!node || typeof node !== "object" || !Array.isArray((node as Record<string, any>).children)) {
    return []
  }

  return (node as Record<string, any>).children
}

function getTabEditorModel(tab: Record<string, any>) {
  if (tab.model && typeof tab.model === "object") {
    return tab.model
  }

  if (tab.children && !Array.isArray(tab.children) && typeof tab.children === "object") {
    return tab.children
  }

  return null
}

function collectTabsFromLayout(node: unknown, tabs: Record<string, any>[]) {
  if (!node || typeof node !== "object") {
    return
  }

  if (isTabLike(node)) {
    tabs.push(node)
  }

  for (const child of getLayoutChildren(node)) {
    collectTabsFromLayout(child, tabs)
  }
}

function resolveTargetFromTab(tab: Record<string, any>): ActiveDocumentTarget | null {
  const editor = getTabEditorModel(tab)
  const id = String(editor?.rootId || editor?.rootID || editor?.root_id || "").trim()
  if (!id) {
    return null
  }

  const title = String(tab.title || id).trim() || id
  return {
    id,
    title,
  }
}

function collectLayoutTabs(input: { siyuan?: any } | Window) {
  const tabs: Record<string, any>[] = []
  const siyuan = input?.siyuan
  collectTabsFromLayout(siyuan?.layout?.centerLayout, tabs)
  collectTabsFromLayout(siyuan?.config?.uiLayout?.layout, tabs)
  return tabs
}

function getActiveDocumentTargetFromLayout(input: { siyuan?: any } | Window): ActiveDocumentTarget | null {
  const tabs = collectLayoutTabs(input)
  if (!tabs.length) {
    return null
  }

  const activeTab = tabs.find((tab) => tab.active) || tabs
    .slice()
    .sort((a, b) => Number(b.activeTime || 0) - Number(a.activeTime || 0))[0]

  return activeTab ? resolveTargetFromTab(activeTab) : null
}

function getActiveDocumentTarget(input: { siyuan?: { getActiveEditor?: () => any } } | Window): ActiveDocumentTarget | null {
  const activeEditor = input?.siyuan?.getActiveEditor?.()
  const protyle = activeEditor?.protyle
  const block = protyle?.block
  const id = String(
    block?.rootID
    || block?.rootId
    || block?.root_id
    || activeEditor?.rootID
    || activeEditor?.rootId
    || activeEditor?.root_id
    || block?.id
    || "",
  ).trim()
  if (!id) {
    return getActiveDocumentTargetFromLayout(input)
  }

  const title = String(
    activeEditor?.title
    || activeEditor?.model?.title
    || activeEditor?.tab?.title
    || id,
  ).trim() || id
  return {
    id,
    title,
  }
}

function pickPreviewNotebookId(notebooks: Notebook[]) {
  return notebooks.find((notebook) => !notebook.closed)?.id || notebooks[0]?.id || ""
}

async function resolveNotebookId() {
  if (typeof window !== "undefined") {
    const activeDocument = getActiveDocumentTarget(window)
    if (activeDocument?.id) {
      const currentBlock = await getBlockByID(activeDocument.id)
      const currentNotebookId = String(currentBlock?.box || "").trim()
      if (currentNotebookId) {
        return currentNotebookId
      }
    }
  }

  const notebookResult = await lsNotebooks()
  return pickPreviewNotebookId(notebookResult?.notebooks || [])
}

export function formatStylePreviewDocumentTitle(now = new Date()) {
  return `${STYLE_PREVIEW_SUFFIX} ${formatDate(now)}`
}

export function buildStylePreviewDocumentPath(dailyNoteSavePath: string | undefined, now = new Date()) {
  const expanded = String(dailyNoteSavePath || "").trim().replace(/\\/g, "/").replace(/\/+/g, "/")

  const segments = expanded.split("/").filter(Boolean)
  if (!segments.length) {
    return `/${formatStylePreviewDocumentTitle(now)}`
  }

  if (segments.length === 1) {
    return `/${segments[0]}/${formatStylePreviewDocumentTitle(now)}`
  }

  const parent = segments.slice(0, -1).join("/")
  const leaf = segments.at(-1) || formatDate(now)
  return `/${parent}/${STYLE_PREVIEW_SUFFIX} ${leaf}`
}

export async function createStylePreviewDocument(now = new Date()) {
  const notebookId = await resolveNotebookId()
  if (!notebookId) {
    throw new Error(t("emptyNotebookErr"))
  }

  const notebookConf = await getNotebookConf(notebookId)
  const dailyNotePathTemplate = notebookConf?.conf?.dailyNoteSavePath
  const resolvedDailyNotePath = dailyNotePathTemplate
    ? await renderSprig(dailyNotePathTemplate)
    : undefined
  const title = formatStylePreviewDocumentTitle(now)
  const path = buildStylePreviewDocumentPath(resolvedDailyNotePath, now)
  const documentId = await createDocWithMd(notebookId, path, stylePreviewDocumentMarkdown)

  const app = getPluginApp()
  if (app) {
    await openDocByTab(app, documentId)
  }

  return {
    documentId,
    notebookId,
    path,
    title,
  }
}
