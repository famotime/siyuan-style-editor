import type { Plugin } from "siyuan";
import type { StyleTarget } from "@/lib/style-profile";

import { reactive } from "vue";

import {
  createDefaultEditorState,
  normalizeEditorState,
  resetEditorStyles,
  updateTargetBackgroundColor,
  updateTargetColor,
  type StyleEditorState,
} from "@/lib/style-editor-state";
import {
  buildStyleCss,
  normalizeStyleProfile,
} from "@/lib/style-profile";

const STORAGE_KEY = "style-editor.json";
const STYLE_ELEMENT_ID = "siyuan-style-editor-style";

export type PaintChannel = "color" | "backgroundColor";

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
  { value: "blockquote", label: "引述块", shortLabel: "❝", hint: "用于引用、摘录与提示块" },
  { value: "inlineCode", label: "行内代码", shortLabel: "</>", hint: "用于命令、变量与代码片段" },
  { value: "mark", label: "高亮文本", shortLabel: "HL", hint: "用于显式标记重点内容" },
  { value: "codeBlock", label: "代码块", shortLabel: "{ }", hint: "用于多行代码与配置片段" },
  { value: "bulletList", label: "无序列表", shortLabel: "•", hint: "用于普通项目列表" },
  { value: "orderedList", label: "有序列表", shortLabel: "1.", hint: "用于步骤与顺序描述" },
  { value: "taskList", label: "任务列表", shortLabel: "☑", hint: "用于待办与完成状态列表" },
];

export const FOREGROUND_PALETTE: Array<{
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

export const BACKGROUND_PALETTE: Array<{
  label: string;
  value: string;
}> = [
  { label: "纸", value: "var(--b3-theme-surface)" },
  { label: "杏", value: "var(--b3-font-background1)" },
  { label: "麦", value: "var(--b3-font-background2)" },
  { label: "柠", value: "var(--b3-font-background3)" },
  { label: "桃", value: "var(--b3-font-background4)" },
  { label: "苔", value: "var(--b3-font-background5)" },
  { label: "荷", value: "var(--b3-font-background6)" },
  { label: "湖", value: "var(--b3-font-background7)" },
  { label: "雾", value: "var(--b3-font-background8)" },
  { label: "霞", value: "var(--b3-font-background9)" },
  { label: "砂", value: "var(--b3-font-background10)" },
  { label: "栗", value: "var(--b3-font-background11)" },
  { label: "烟", value: "var(--b3-font-background12)" },
  { label: "墨", value: "var(--b3-font-background13)" },
];

interface RuntimeState extends StyleEditorState {
  ready: boolean;
  selectedTarget: StyleTarget;
  selectedChannel: PaintChannel;
}

function createRuntimeState(): RuntimeState {
  return {
    ...createDefaultEditorState(),
    ready: false,
    selectedTarget: "heading1",
    selectedChannel: "color",
  };
}

export const runtimeState = reactive<RuntimeState>(createRuntimeState());

let pluginInstance: Plugin | null = null;
let styleElement: HTMLStyleElement | null = null;

function replaceProfile(nextState: StyleEditorState) {
  const normalizedProfile = normalizeStyleProfile(nextState.profile);
  for (const target of STYLE_TARGET_OPTIONS) {
    runtimeState.profile[target.value] = normalizedProfile[target.value];
  }
}

function snapshotState(): StyleEditorState {
  return {
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

export async function initializeRuntime(plugin: Plugin) {
  pluginInstance = plugin;
  const savedState = await plugin.loadData(STORAGE_KEY);
  replaceProfile(normalizeEditorState(savedState));
  runtimeState.ready = true;
  applyInjectedStyles();
}

export function teardownRuntime() {
  pluginInstance = null;
  runtimeState.ready = false;
  runtimeState.selectedTarget = "heading1";
  runtimeState.selectedChannel = "color";
  replaceProfile(createDefaultEditorState());

  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}

export function selectTarget(target: StyleTarget) {
  runtimeState.selectedTarget = target;
}

export function selectChannel(channel: PaintChannel) {
  runtimeState.selectedChannel = channel;
}

export async function applyPaletteColor(color: string) {
  const nextState = runtimeState.selectedChannel === "backgroundColor"
    ? updateTargetBackgroundColor(snapshotState(), runtimeState.selectedTarget, color)
    : updateTargetColor(snapshotState(), runtimeState.selectedTarget, color);
  replaceProfile(nextState);
  applyInjectedStyles();
  await persistState();
}

export async function clearSelectedTargetColor() {
  await applyPaletteColor("");
}

export async function resetAllStyles() {
  const nextState = resetEditorStyles(snapshotState());
  replaceProfile(nextState);
  applyInjectedStyles();
  await persistState();
}
