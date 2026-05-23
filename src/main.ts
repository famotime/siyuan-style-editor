import type { Plugin } from "siyuan"
import type { App as VueApp } from "vue"

import { createApp } from "vue"

import App from "@/App.vue"
import {
  initializeRuntime,
  teardownRuntime,
} from "@/style-editor-runtime"

let app: VueApp<Element> | null = null
let mountElement: HTMLElement | null = null

function clearMountElement(element: HTMLElement | null) {
  if (!element) {
    return
  }

  element.innerHTML = ""
  element.classList.remove("siyuan-style-editor-dock")
}

export async function init(plugin: Plugin) {
  await initializeRuntime(plugin)
}

export function mountDock(element: HTMLElement) {
  if (mountElement === element && app) {
    return
  }

  if (app) {
    app.unmount()
    clearMountElement(mountElement)
  }

  mountElement = element
  clearMountElement(mountElement)
  mountElement.classList.add("siyuan-style-editor-dock")
  app = createApp(App)
  app.mount(mountElement)
}

export function destroy() {
  if (app) {
    app.unmount()
    app = null
  }
  clearMountElement(mountElement)
  mountElement = null
  teardownRuntime()
}
