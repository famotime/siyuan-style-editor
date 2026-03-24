import type { App as VueApp } from "vue";
import type { Plugin } from "siyuan";

import { createApp } from "vue";

import App from "@/App.vue";
import {
  initializeRuntime,
  teardownRuntime,
} from "@/style-editor-runtime";

let app: VueApp<Element> | null = null;
let mountElement: HTMLElement | null = null;

export async function init(plugin: Plugin) {
  await initializeRuntime(plugin);
}

export function mountDock(element: HTMLElement) {
  if (mountElement === element && app) {
    return;
  }

  if (app) {
    app.unmount();
  }

  mountElement = element;
  mountElement.innerHTML = "";
  mountElement.classList.add("siyuan-style-editor-dock");
  app = createApp(App);
  app.mount(mountElement);
}

export function destroy() {
  if (app) {
    app.unmount();
    app = null;
  }
  if (mountElement) {
    mountElement.innerHTML = "";
    mountElement = null;
  }
  teardownRuntime();
}
