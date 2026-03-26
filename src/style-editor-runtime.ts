import type { Plugin } from "siyuan";
import type { StyleTarget } from "@/lib/style-profile";

import { reactive } from "vue";

import {
  loadPersistedEditorState,
  savePersistedEditorState,
} from "@/lib/style-editor-persistence";
import {
  createDefaultEditorState,
  resetEditorStyles,
  updateTargetBackgroundColor,
  updateTargetColor,
  type StyleEditorState,
} from "@/lib/style-editor-state";
import { createStyleEditorStylesheetController } from "@/lib/style-editor-stylesheet";
import { extractStyleProfileFromDocument } from "@/lib/style-extractor";
import {
  buildStyleCss,
  normalizeStyleProfile,
} from "@/lib/style-profile";
import {
  countStyledTargets,
  parseImportedStyleProfile,
  serializeStyleProfileTransfer,
} from "@/lib/style-transfer";
import {
  STYLE_TARGETS,
} from "@/lib/style-target-catalog";

const STORAGE_KEY = "style-editor.json";
const STYLE_ELEMENT_ID = "siyuan-style-editor-style";

export type PaintChannel = "color" | "backgroundColor";

export interface PresetPaletteColor {
  label: string;
  value: string;
}

export interface PresetPaletteCollection {
  colors: PresetPaletteColor[];
  id: string;
  label: string;
}

function createPresetColors(colors: string[]): PresetPaletteColor[] {
  return colors.map(color => ({
    label: color,
    value: color,
  }));
}

export const PRESET_PALETTE_COLLECTIONS: PresetPaletteCollection[] = [
  {
    id: "fiery-ocean",
    label: "Fiery Ocean",
    colors: createPresetColors(["#780000", "#C1121F", "#FDF0D5", "#003049", "#669BBC"]),
  },
  {
    id: "olive-garden-feast",
    label: "Olive Garden Feast",
    colors: createPresetColors(["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"]),
  },
  {
    id: "sunny-beach-day",
    label: "Sunny Beach Day",
    colors: createPresetColors(["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"]),
  },
  {
    id: "dark-sunset",
    label: "Dark Sunset",
    colors: createPresetColors(["#335C67", "#FFF3B0", "#E09F3E", "#9E2A2B", "#540B0E"]),
  },
  {
    id: "summer-dream",
    label: "Summer Dream",
    colors: createPresetColors(["#0081A7", "#00AFB9", "#FDFCDC", "#FED9B7", "#F07167"]),
  },
  {
    id: "vibrant-color-fiesta",
    label: "Vibrant Color Fiesta",
    colors: createPresetColors(["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"]),
  },
  {
    id: "summer-ocean-breeze",
    label: "Summer Ocean Breeze",
    colors: createPresetColors(["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"]),
  },
  {
    id: "refreshing-summer-fun",
    label: "Refreshing Summer Fun",
    colors: createPresetColors(["#8ECAE6", "#219EBC", "#023047", "#FFB703", "#FB8500"]),
  },
  {
    id: "fiery-palette",
    label: "Fiery Palette",
    colors: createPresetColors(["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C"]),
  },
  {
    id: "watermelon-sorbet",
    label: "Watermelon Sorbet",
    colors: createPresetColors(["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"]),
  },
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
const stylesheet = createStyleEditorStylesheetController(STYLE_ELEMENT_ID);

function replaceProfile(nextState: StyleEditorState) {
  const normalizedProfile = normalizeStyleProfile(nextState.profile);
  for (const target of STYLE_TARGETS) {
    runtimeState.profile[target] = normalizedProfile[target];
  }
}

function snapshotState(): StyleEditorState {
  return {
    profile: normalizeStyleProfile(runtimeState.profile),
  };
}

function applyInjectedStyles() {
  const css = buildStyleCss(runtimeState.profile);
  stylesheet.apply(css);
}

async function persistState() {
  await savePersistedEditorState(pluginInstance, STORAGE_KEY, snapshotState().profile);
}

async function updateSelectedPaletteColor(
  color: string,
  options: {
    persist?: boolean;
  } = {},
) {
  const nextState = runtimeState.selectedChannel === "backgroundColor"
    ? updateTargetBackgroundColor(snapshotState(), runtimeState.selectedTarget, color)
    : updateTargetColor(snapshotState(), runtimeState.selectedTarget, color);
  replaceProfile(nextState);
  applyInjectedStyles();

  if (options.persist ?? true) {
    await persistState();
  }
}

export async function initializeRuntime(plugin: Plugin) {
  pluginInstance = plugin;
  const savedState = await loadPersistedEditorState(plugin, STORAGE_KEY);
  replaceProfile(savedState);
  runtimeState.ready = true;
  applyInjectedStyles();
}

export function teardownRuntime() {
  pluginInstance = null;
  runtimeState.ready = false;
  runtimeState.selectedTarget = "heading1";
  runtimeState.selectedChannel = "color";
  replaceProfile(createDefaultEditorState());
  stylesheet.remove();
}

export function selectTarget(target: StyleTarget) {
  runtimeState.selectedTarget = target;
}

export function selectChannel(channel: PaintChannel) {
  runtimeState.selectedChannel = channel;
}

export async function applyPaletteColor(color: string) {
  await updateSelectedPaletteColor(color);
}

export async function previewPaletteColor(color: string) {
  await updateSelectedPaletteColor(color, {
    persist: false,
  });
}

export async function persistCurrentStyles() {
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

export async function extractCurrentStyles() {
  if (typeof document === "undefined") {
    return {
      extractedTargetCount: 0,
      matchedTargetCount: 0,
    };
  }

  const result = extractStyleProfileFromDocument(document);
  if (result.matchedTargetCount === 0) {
    return {
      extractedTargetCount: 0,
      matchedTargetCount: 0,
    };
  }

  replaceProfile({
    profile: result.profile,
  });
  applyInjectedStyles();
  await persistState();

  return {
    extractedTargetCount: result.extractedTargetCount,
    matchedTargetCount: result.matchedTargetCount,
  };
}

export function exportCurrentStyles(): string {
  return serializeStyleProfileTransfer(snapshotState().profile);
}

export async function importStyles(raw: string) {
  const importedProfile = parseImportedStyleProfile(raw);

  replaceProfile({
    profile: importedProfile,
  });
  applyInjectedStyles();
  await persistState();

  return {
    styledTargetCount: countStyledTargets(importedProfile),
  };
}
