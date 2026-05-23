import type {
  App,
  IWebSocketData,
} from "siyuan"

import {
  fetchSyncPost,
  openTab,
} from "siyuan"


interface NotebookListResult {
  notebooks?: Notebook[]
}

interface NotebookConfResult {
  conf?: Partial<NotebookConf> | null
}

async function request<T>(url: string, data: unknown): Promise<T> {
  const response: IWebSocketData = await fetchSyncPost(url, data)
  return (response.code === 0 ? response.data : null) as T
}

export async function lsNotebooks(): Promise<NotebookListResult> {
  return request<NotebookListResult>("/api/notebook/lsNotebooks", "")
}

export async function getNotebookConf(notebook: NotebookId): Promise<NotebookConfResult> {
  return request<NotebookConfResult>("/api/notebook/getNotebookConf", { notebook })
}

export async function createDocWithMd(
  notebook: NotebookId,
  path: string,
  markdown: string,
): Promise<DocumentId> {
  return request<DocumentId>("/api/filetree/createDocWithMd", {
    markdown,
    notebook,
    path,
  })
}

export async function renderSprig(template: string): Promise<string> {
  return request<string>("/api/template/renderSprig", { template })
}

export async function sql(statement: string): Promise<Block[]> {
  return request<Block[]>("/api/query/sql", {
    stmt: statement,
  })
}

export async function getBlockByID(blockId: string): Promise<Block | null> {
  const blocks = await sql(`select * from blocks where id ='${blockId}'`)
  return blocks[0] || null
}

export async function pushMsg(msg: string, timeout = 7000) {
  return request<string>("/api/notification/pushMsg", {
    msg,
    timeout,
  })
}

export async function pushErrMsg(msg: string, timeout = 7000) {
  return request<string>("/api/notification/pushErrMsg", {
    msg,
    timeout,
  })
}

export async function openDocByTab(app: App, docId: DocumentId) {
  return openTab({
    app,
    doc: {
      id: docId,
      action: ["cb-get-focus"],
    },
  })
}
