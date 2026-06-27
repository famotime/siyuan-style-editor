import type {
  Plugin,
  App as SiYuanApp,
} from "siyuan"
import type { PresetPaletteCollection } from "@/lib/preset-palette-catalog"

import type {
  StyleEditorState,
  StyleTargetChannelRef,
} from "@/lib/style-editor-state"

import type {
  FeatureStyleConfig,
  FeatureStyleId,
} from "@/lib/style-feature-catalog"
import type { StyleTarget } from "@/lib/style-profile"
import type { StyleTransferMetadata } from "@/lib/style-transfer"
import { reactive } from "vue"
import {
  createPresetPaletteColors,

} from "@/lib/preset-palette-catalog"
import {
  loadPersistedEditorState,
  savePersistedEditorState,
} from "@/lib/style-editor-persistence"
import {
  createDefaultEditorState,
  resetEditorStyles,


  swapTargetChannelValues as swapTargetChannelValuesInState,
  updateFeatureConfig,
  updateTargetBackgroundColor,
  updateTargetColor,
} from "@/lib/style-editor-state"
import { createStyleEditorStylesheetController } from "@/lib/style-editor-stylesheet"
import { extractStyleProfileFromDocument } from "@/lib/style-extractor"
import {
  buildFeatureStyleCss,
  createDefaultFeatureProfile,


  normalizeFeatureProfile,
} from "@/lib/style-feature-catalog"
import {
  buildStyleCss,
  normalizeStyleProfile,
} from "@/lib/style-profile"
import {
  STYLE_TARGETS,
} from "@/lib/style-target-catalog"
import {
  countStyledTargets,
  parseImportedStyleTransfer,
  serializeStyleProfileTransfer,

} from "@/lib/style-transfer"

const STORAGE_KEY = "style-editor.json"
const STYLE_ELEMENT_ID = "siyuan-style-editor-style"

export type PaintChannel = "color" | "backgroundColor"

interface RuntimeState extends StyleEditorState {
  ready: boolean
  selectedTarget: StyleTarget
  selectedChannel: PaintChannel
}

function createRuntimeState(): RuntimeState {
  return {
    ...createDefaultEditorState(),
    ready: false,
    selectedTarget: "heading1",
    selectedChannel: "color",
  }
}

export const runtimeState = reactive<RuntimeState>(createRuntimeState())

let pluginInstance: Plugin | null = null
const stylesheet = createStyleEditorStylesheetController(STYLE_ELEMENT_ID)

export function getPluginApp(): SiYuanApp | null {
  return pluginInstance?.app ?? null
}

function replaceProfile(nextState: StyleEditorState) {
  const normalizedProfile = normalizeStyleProfile(nextState.profile)
  for (const target of STYLE_TARGETS) {
    runtimeState.profile[target] = normalizedProfile[target]
  }
}

function replaceFeatureProfile(nextState: StyleEditorState) {
  const normalizedFeatureProfile = normalizeFeatureProfile(nextState.featureProfile)
  for (const featureId of Object.keys(normalizedFeatureProfile) as FeatureStyleId[]) {
    runtimeState.featureProfile[featureId] = normalizedFeatureProfile[featureId]
  }
}

function replaceCustomPresetPalettes(nextState: StyleEditorState) {
  runtimeState.customPresetPalettes = [...nextState.customPresetPalettes]
}

function snapshotState(): StyleEditorState {
  return {
    customPresetPalettes: [...runtimeState.customPresetPalettes],
    featureProfile: normalizeFeatureProfile(runtimeState.featureProfile),
    profile: normalizeStyleProfile(runtimeState.profile),
  }
}

function commitState(
  nextState: StyleEditorState,
  options: {
    persist?: boolean
    replaceCustomPresetPalettes?: boolean
  } = {},
) {
  replaceProfile(nextState)
  replaceFeatureProfile(nextState)

  if (options.replaceCustomPresetPalettes ?? false) {
    replaceCustomPresetPalettes(nextState)
  }

  applyInjectedStyles()

  if (options.persist ?? true) {
    return persistState()
  }

  return Promise.resolve()
}

function applyInjectedStyles() {
  const css = [
    buildStyleCss(runtimeState.profile),
    buildFeatureStyleCss(runtimeState.featureProfile),
  ].filter(Boolean).join("\n\n")
  stylesheet.apply(css)
}

async function persistState() {
  const state = snapshotState()
  await savePersistedEditorState(
    pluginInstance,
    STORAGE_KEY,
    state.profile,
    state.featureProfile,
    state.customPresetPalettes,
  )
}

function collectActiveProfileColors(): string[] {
  const colors: string[] = []

  for (const target of STYLE_TARGETS) {
    const rule = runtimeState.profile[target]
    if (rule.enabled === false) {
      continue
    }
    if (rule.color) {
      colors.push(rule.color)
    }
    if (rule.backgroundColor) {
      colors.push(rule.backgroundColor)
    }
  }

  return [...new Set(colors)]
}

async function updateSelectedPaletteColor(
  color: string,
  options: {
    persist?: boolean
  } = {},
) {
  const nextState = runtimeState.selectedChannel === "backgroundColor"
    ? updateTargetBackgroundColor(snapshotState(), runtimeState.selectedTarget, color)
    : updateTargetColor(snapshotState(), runtimeState.selectedTarget, color)
  await commitState(nextState, {
    persist: options.persist,
  })
}

export async function initializeRuntime(plugin: Plugin) {
  pluginInstance = plugin
  const savedState = await loadPersistedEditorState(plugin, STORAGE_KEY)
  replaceProfile(savedState)
  replaceFeatureProfile(savedState)
  replaceCustomPresetPalettes(savedState)
  runtimeState.ready = true
  applyInjectedStyles()
}

export function teardownRuntime() {
  pluginInstance = null
  runtimeState.ready = false
  runtimeState.selectedTarget = "heading1"
  runtimeState.selectedChannel = "color"
  replaceProfile(createDefaultEditorState())
  replaceFeatureProfile(createDefaultEditorState())
  replaceCustomPresetPalettes(createDefaultEditorState())
  stylesheet.remove()
}

export function selectTarget(target: StyleTarget) {
  runtimeState.selectedTarget = target
}

export function selectChannel(channel: PaintChannel) {
  runtimeState.selectedChannel = channel
}

export async function applyPaletteColor(color: string) {
  await updateSelectedPaletteColor(color)
}

export async function swapTargetChannelValues(
  source: StyleTargetChannelRef,
  target: StyleTargetChannelRef,
) {
  const nextState = swapTargetChannelValuesInState(snapshotState(), source, target)
  await commitState(nextState)
}

export async function applyPaletteSequenceToTargets(
  targets: StyleTarget[],
  channel: PaintChannel,
  colors: string[],
) {
  const appliedTargetCount = Math.min(targets.length, colors.length)
  let nextState = snapshotState()

  for (let index = 0; index < appliedTargetCount; index += 1) {
    const target = targets[index]
    const color = colors[index]
    nextState = channel === "backgroundColor"
      ? updateTargetBackgroundColor(nextState, target, color)
      : updateTargetColor(nextState, target, color)
  }

  await commitState(nextState)

  return {
    appliedTargetCount,
  }
}

export async function previewPaletteColor(color: string) {
  await updateSelectedPaletteColor(color, {
    persist: false,
  })
}

export async function persistCurrentStyles() {
  await persistState()
}

export async function clearSelectedTargetColor() {
  await applyPaletteColor("")
}

export async function updateFeatureStyle(
  featureId: FeatureStyleId,
  config: Partial<FeatureStyleConfig>,
) {
  const nextState = updateFeatureConfig(snapshotState(), featureId, config)
  await commitState(nextState)
}

export function getFeatureConfig(featureId: FeatureStyleId): FeatureStyleConfig {
  const normalizedProfile = normalizeFeatureProfile(runtimeState.featureProfile)
  return {
    enabled: normalizedProfile[featureId].enabled,
    values: {
      ...normalizedProfile[featureId].values,
    },
  }
}

export async function resetFeatureStyles() {
  await commitState({
    ...snapshotState(),
    featureProfile: createDefaultFeatureProfile(),
  })
}

export async function resetAllStyles() {
  const nextState = resetEditorStyles(snapshotState())
  await commitState(nextState)
}

export async function extractCurrentStyles() {
  if (typeof document === "undefined") {
    return {
      extractedTargetCount: 0,
      matchedTargetCount: 0,
    }
  }

  const result = extractStyleProfileFromDocument(document)
  if (result.matchedTargetCount === 0) {
    return {
      extractedTargetCount: 0,
      matchedTargetCount: 0,
    }
  }

  await commitState({
    ...snapshotState(),
    profile: result.profile,
  })

  return {
    extractedTargetCount: result.extractedTargetCount,
    matchedTargetCount: result.matchedTargetCount,
  }
}

export function exportCurrentStyles(metadata: StyleTransferMetadata): string {
  const state = snapshotState()
  return serializeStyleProfileTransfer(state.profile, metadata, new Date().toISOString(), state.featureProfile)
}

export async function importStyles(raw: string) {
  const importedTransfer = parseImportedStyleTransfer(raw)
  const importedProfile = importedTransfer.profile

  await commitState({
    ...snapshotState(),
    featureProfile: importedTransfer.featureProfile,
    profile: importedProfile,
  })

  return {
    metadata: importedTransfer.metadata,
    styledTargetCount: countStyledTargets(importedProfile),
  }
}

export async function saveCurrentProfileAsPresetPalette(name: string) {
  const trimmedName = name.trim()
  if (!trimmedName) {
    throw new Error("预置色卡名称不能为空。")
  }

  const colors = createPresetPaletteColors(collectActiveProfileColors())
  if (colors.length === 0) {
    throw new Error("当前还没有可保存的颜色。")
  }

  const nextPalette: PresetPaletteCollection = {
    colors,
    id: `custom-palette-${Date.now().toString(36)}`,
    label: trimmedName,
  }

  await commitState({
    ...snapshotState(),
    customPresetPalettes: [
      nextPalette,
      ...runtimeState.customPresetPalettes,
    ],
  }, {
    replaceCustomPresetPalettes: true,
  })

  return {
    colorCount: colors.length,
    label: nextPalette.label,
    palette: nextPalette,
  }
}

export async function deleteCustomPresetPalette(paletteId: string) {
  const paletteToDelete = runtimeState.customPresetPalettes.find((palette) => palette.id === paletteId)
  if (!paletteToDelete) {
    throw new Error("未找到要删除的自定义色卡。")
  }

  await commitState({
    ...snapshotState(),
    customPresetPalettes: runtimeState.customPresetPalettes.filter(
      (palette) => palette.id !== paletteId,
    ),
  }, {
    replaceCustomPresetPalettes: true,
  })

  return {
    id: paletteToDelete.id,
    label: paletteToDelete.label,
  }
}

export async function updateTargetEnabled(target: StyleTarget, enabled: boolean) {
  const nextState = {
    ...snapshotState(),
    profile: {
      ...snapshotState().profile,
      [target]: {
        ...snapshotState().profile[target],
        enabled,
      },
    },
  }
  await commitState(nextState)
}
