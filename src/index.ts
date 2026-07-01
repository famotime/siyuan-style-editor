import { Plugin, showMessage } from "siyuan"

import PluginInfoString from "@/../plugin.json"
import {
  destroy,
  init,
  mountDock,
} from "@/main"
import "@/index.scss"

let pluginInfo = {
  version: "",
}

try {
  pluginInfo = PluginInfoString
}
catch (error) {
  console.error("Plugin info parse error", error)
}

export default class SiyuanStyleEditorPlugin extends Plugin {
  public readonly version = pluginInfo.version

  async onload() {
    await init(this)

    this.addDock({
      config: {
        position: "RightTop",
        size: {
          width: 360,
          height: 0,
        },
        icon: "iconTheme",
        title: "粉刷匠",
        show: true,
      },
      data: {},
      type: "style-editor-workshop",
      init(dock) {
        mountDock(dock.element)
      },
    })
  }

  onunload() {
    destroy()
  }

  async uninstall() {
    try {
      await this.removeData("style-editor.json")
    }
    catch (e) {
      showMessage(this.t("uninstallDataRemoveFailed", { error: String(e) }))
    }
  }
}
