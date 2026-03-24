import type {
  IProtyle,
  Plugin,
} from "siyuan";
import type { StyleTarget } from "@/lib/style-profile";

import { reactive } from "vue";
import { showMessage } from "siyuan";

import {
  createDefaultEditorState,
  createTemplateRefFromProtyle,
  normalizeEditorState,
  updateTargetColor,
  type StyleEditorState,
} from "@/lib/style-editor-state";
import {
  buildStyleCss,
  extractStyleProfileFromTemplate,
  normalizeStyleProfile,
} from "@/lib/style-profile";

const STORAGE_KEY = "style-editor.json";
const STYLE_ELEMENT_ID = "siyuan-style-editor-style";

export const STYLE_TARGET_OPTIONS: Array<{
  value: StyleTarget;
  label: string;
  shortLabel: string;
  hint: string;
}> = [
  { value: "heading1", label: "H1 标题", shortLabel: "H1", hint: "用于文章总标题与大章节入口" },
  { value: "heading2", label: "H2 标题", shortLabel: "H2", hint: "用于主章节分隔" },
  { value: "heading3", label: "H3 标题", shortLabel: "H3", hint: "用于二级小节" },
  { value: "heading4", label: "H4 标题", shortLabel: "H4", hint: "用于次级说明" },
  { value: "heading5", label: "H5 标题", shortLabel: "H5", hint: "用于注释性标题" },
  { value: "heading6", label: "H6 标题", shortLabel: "H6", hint: "用于最细层级标题" },
  { value: "strong", label: "加粗文本", shortLabel: "B", hint: "用于段落重点强调" },
];

export const COLOR_PALETTE: Array<{
  label: string;
  value: string;
}> = [
  { label: "墨", value: "var(--b3-theme-on-surface)" },
  { label: "朱", value: "var(--b3-font-color1)" },
  { label: "金", value: "var(--b3-font-color2)" },
  { label: "苔", value: "var(--b3-font-color3)" },
  { label: "藤", value: "var(--b3-font-color4)" },
  { label: "橙", value: "var(--b3-font-color5)" },
  { label: "海", value: "var(--b3-font-color6)" },
  { label: "青", value: "var(--b3-font-color7)" },
  { label: "莓", value: "var(--b3-font-color8)" },
  { label: "珊", value: "var(--b3-font-color9)" },
  { label: "暮", value: "var(--b3-font-color10)" },
  { label: "松", value: "var(--b3-font-color11)" },
  { label: "铜", value: "var(--b3-font-color12)" },
  { label: "棕", value: "var(--b3-font-color13)" },
];

interface RuntimeState extends StyleEditorState {
  ready: boolean;
  selectedTarget: StyleTarget;
  activeDocId: string;
  activePath: string;
  isTemplateActive: boolean;
}

function createRuntimeState(): RuntimeState {
  return {
    ...createDefaultEditorState(),
    ready: false,
    selectedTarget: "heading1",
    activeDocId: "",
    activePath: "",
    isTemplateActive: false,
  };
}

export const runtimeState = reactive<RuntimeState>(createRuntimeState());

let pluginInstance: Plugin | null = null;
let activeProtyle: IProtyle | null = null;
let styleElement: HTMLStyleElement | null = null;

function replaceProfile(nextState: StyleEditorState) {
  runtimeState.template.docId = nextState.template.docId;
  runtimeState.template.path = nextState.template.path;

  const normalizedProfile = normalizeStyleProfile(nextState.profile);
  for (const target of STYLE_TARGET_OPTIONS) {
    runtimeState.profile[target.value] = normalizedProfile[target.value];
  }
}

function snapshotState(): StyleEditorState {
  return {
    template: {
      docId: runtimeState.template.docId,
      path: runtimeState.template.path,
    },
    profile: normalizeStyleProfile(runtimeState.profile),
  };
}

function ensureStyleElement(): HTMLStyleElement {
  if (styleElement?.isConnected) {
    return styleElement;
  }

  styleElement = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = STYLE_ELEMENT_ID;
    document.head.appendChild(styleElement);
  }
  return styleElement;
}

function syncTemplateFlag() {
  runtimeState.isTemplateActive = !!runtimeState.template.docId
    && runtimeState.template.docId === runtimeState.activeDocId;
}

function applyInjectedStyles() {
  const css = buildStyleCss(runtimeState.profile);
  ensureStyleElement().textContent = css;
}

async function persistState() {
  if (!pluginInstance) {
    return;
  }
  await pluginInstance.saveData(STORAGE_KEY, snapshotState());
}

function getTemplateRoot(protyle: IProtyle): ParentNode | null {
  return protyle.element.querySelector(".protyle-wysiwyg")
    ?? protyle.contentElement
    ?? protyle.element;
}

function notify(message: string, type: "info" | "error" = "info", timeout = 3000) {
  showMessage(message, timeout, type);
}

export async function initializeRuntime(plugin: Plugin) {
  pluginInstance = plugin;
  const savedState = await plugin.loadData(STORAGE_KEY);
  replaceProfile(normalizeEditorState(savedState));
  runtimeState.ready = true;
  applyInjectedStyles();
  syncTemplateFlag();
}

export function teardownRuntime() {
  pluginInstance = null;
  activeProtyle = null;
  runtimeState.ready = false;
  runtimeState.selectedTarget = "heading1";
  runtimeState.activeDocId = "";
  runtimeState.activePath = "";
  runtimeState.isTemplateActive = false;
  replaceProfile(createDefaultEditorState());

  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}

export function setActiveProtyle(protyle: IProtyle) {
  activeProtyle = protyle;
  const templateRef = createTemplateRefFromProtyle(protyle);
  runtimeState.activeDocId = templateRef?.docId ?? "";
  runtimeState.activePath = templateRef?.path ?? "";
  syncTemplateFlag();
}

export function selectTarget(target: StyleTarget) {
  runtimeState.selectedTarget = target;
}

export async function applyPaletteColor(color: string) {
  replaceProfile(updateTargetColor(snapshotState(), runtimeState.selectedTarget, color));
  applyInjectedStyles();
  await persistState();
}

export async function clearSelectedTargetColor() {
  await applyPaletteColor("");
}

export async function bindCurrentDocumentAsTemplate() {
  if (!activeProtyle) {
    notify("请先打开一个文档，再绑定样式模板。", "error", 4000);
    return;
  }

  const templateRef = createTemplateRefFromProtyle(activeProtyle);
  if (!templateRef) {
    notify("当前编辑器无法识别所属文档。", "error", 4000);
    return;
  }

  runtimeState.template.docId = templateRef.docId;
  runtimeState.template.path = templateRef.path;
  syncTemplateFlag();
  await persistState();
  notify("已将当前文档设为样式模板。");
  await importStylesFromCurrentTemplate(false);
}

export async function importStylesFromCurrentTemplate(showFeedback = true) {
  if (!activeProtyle) {
    notify("没有可读取的模板文档。", "error", 4000);
    return;
  }

  const currentTemplateRef = createTemplateRefFromProtyle(activeProtyle);
  if (runtimeState.template.docId && currentTemplateRef?.docId !== runtimeState.template.docId) {
    notify("请先切换到已绑定的模板文档，再读取样式。", "error", 4000);
    return;
  }

  const templateRoot = getTemplateRoot(activeProtyle);
  if (!templateRoot) {
    notify("当前模板文档还未渲染完成。", "error", 4000);
    return;
  }

  runtimeState.profile = extractStyleProfileFromTemplate(templateRoot);
  applyInjectedStyles();
  await persistState();

  if (showFeedback) {
    notify("已从模板文档读取样式。");
  }
}
