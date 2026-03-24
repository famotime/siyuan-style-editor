import type { IProtyle } from "siyuan";

import {
  getAllEditor,
  Plugin,
} from "siyuan";

import "@/index.scss";
import PluginInfoString from "@/../plugin.json";
import {
  destroy,
  init,
  mountDock,
} from "@/main";
import { setActiveProtyle } from "@/style-editor-runtime";

let pluginInfo = {
  version: "",
};

try {
  pluginInfo = PluginInfoString;
}
catch (error) {
  console.error("Plugin info parse error", error);
}

export default class SiyuanStyleEditorPlugin extends Plugin {
  public readonly version = pluginInfo.version;

  private readonly handleStaticProtyleLoaded = (event: CustomEvent<{ protyle: IProtyle }>) => {
    setActiveProtyle(event.detail.protyle);
  };

  private readonly handleProtyleSwitched = (event: CustomEvent<{ protyle: IProtyle }>) => {
    setActiveProtyle(event.detail.protyle);
  };

  async onload() {
    await init(this);

    this.addDock({
      config: {
        position: "RightTop",
        size: {
          width: 360,
          height: 0,
        },
        icon: "iconTheme",
        title: "文档样式编辑器",
        show: true,
      },
      data: {},
      type: "style-editor-workshop",
      init(dock) {
        mountDock(dock.element);
      },
    });

    this.eventBus.on("loaded-protyle-static", this.handleStaticProtyleLoaded);
    this.eventBus.on("switch-protyle", this.handleProtyleSwitched);
  }

  onLayoutReady() {
    const latestEditor = getAllEditor().at(-1);
    if (latestEditor) {
      setActiveProtyle(latestEditor.protyle);
    }
  }

  onunload() {
    this.eventBus.off("loaded-protyle-static", this.handleStaticProtyleLoaded);
    this.eventBus.off("switch-protyle", this.handleProtyleSwitched);
    destroy();
  }
}
