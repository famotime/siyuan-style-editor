import type { PresetPaletteCollection } from "@/lib/preset-palette-catalog"
import type {
  FeatureStyleConfig,
  FeatureStyleId,
  FeatureStyleProfile,
} from "@/lib/style-feature-catalog"
import type {
  StyleProfile,
  StyleTarget,
} from "@/lib/style-profile"
import {
  normalizePresetPaletteCollections,

} from "@/lib/preset-palette-catalog"
import {
  createDefaultFeatureProfile,



  normalizeFeatureProfile,
} from "@/lib/style-feature-catalog"
import {
  createDefaultStyleProfile,
  normalizeStyleProfile,


} from "@/lib/style-profile"

export interface StyleEditorState {
  customPresetPalettes: PresetPaletteCollection[]
  featureProfile: FeatureStyleProfile
  profile: StyleProfile
}

export interface StyleTargetChannelRef {
  channel: "backgroundColor" | "color"
  target: StyleTarget
}

type PartialState = Partial<{
  customPresetPalettes: unknown
  featureProfile: Partial<FeatureStyleProfile>
  profile: Partial<StyleProfile>
}>

export function createDefaultEditorState(): StyleEditorState {
  return {
    customPresetPalettes: [],
    featureProfile: createDefaultFeatureProfile(),
    profile: createDefaultStyleProfile(),
  }
}

export function normalizeEditorState(input?: PartialState | null): StyleEditorState {
  return {
    customPresetPalettes: normalizePresetPaletteCollections(input?.customPresetPalettes),
    featureProfile: normalizeFeatureProfile(input?.featureProfile),
    profile: normalizeStyleProfile(input?.profile),
  }
}

export function updateFeatureConfig(
  state: StyleEditorState,
  featureId: FeatureStyleId,
  config: Partial<FeatureStyleConfig>,
): StyleEditorState {
  const normalizedFeatureProfile = normalizeFeatureProfile({
    ...state.featureProfile,
    [featureId]: {
      ...state.featureProfile[featureId],
      ...config,
      values: {
        ...state.featureProfile[featureId].values,
        ...(config.values ?? {}),
      },
    },
  })

  return {
    ...state,
    featureProfile: normalizedFeatureProfile,
  }
}

export function updateTargetColor(
  state: StyleEditorState,
  target: StyleTarget,
  color: string,
): StyleEditorState {
  return {
    ...state,
    profile: {
      ...state.profile,
      [target]: {
        ...state.profile[target],
        color,
        enabled: true,
      },
    },
  }
}

export function updateTargetBackgroundColor(
  state: StyleEditorState,
  target: StyleTarget,
  backgroundColor: string,
): StyleEditorState {
  return {
    ...state,
    profile: {
      ...state.profile,
      [target]: {
        ...state.profile[target],
        backgroundColor,
        enabled: true,
      },
    },
  }
}

export function swapTargetChannelValues(
  state: StyleEditorState,
  source: StyleTargetChannelRef,
  target: StyleTargetChannelRef,
): StyleEditorState {
  if (source.target === target.target && source.channel === target.channel) {
    return state
  }

  const sourceValue = state.profile[source.target][source.channel]
  const targetValue = state.profile[target.target][target.channel]

  return {
    ...state,
    profile: {
      ...state.profile,
      [source.target]: {
        ...state.profile[source.target],
        [source.channel]: targetValue,
        enabled: true,
      },
      [target.target]: {
        ...state.profile[target.target],
        [target.channel]: sourceValue,
        enabled: true,
      },
    },
  }
}

export function resetEditorStyles(state: StyleEditorState): StyleEditorState {
  return {
    ...state,
    featureProfile: createDefaultFeatureProfile(),
    profile: createDefaultStyleProfile(),
  }
}
