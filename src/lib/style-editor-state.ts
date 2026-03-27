import {
  normalizePresetPaletteCollections,
  type PresetPaletteCollection,
} from "@/lib/preset-palette-catalog";
import {
  createDefaultStyleProfile,
  normalizeStyleProfile,
  type StyleProfile,
  type StyleTarget,
} from "@/lib/style-profile";

export interface StyleEditorState {
  customPresetPalettes: PresetPaletteCollection[];
  profile: StyleProfile;
}

type PartialState = Partial<{
  customPresetPalettes: unknown;
  profile: Partial<StyleProfile>;
}>;

export function createDefaultEditorState(): StyleEditorState {
  return {
    customPresetPalettes: [],
    profile: createDefaultStyleProfile(),
  };
}

export function normalizeEditorState(input?: PartialState | null): StyleEditorState {
  return {
    customPresetPalettes: normalizePresetPaletteCollections(input?.customPresetPalettes),
    profile: normalizeStyleProfile(input?.profile),
  };
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
      },
    },
  };
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
      },
    },
  };
}

export function resetEditorStyles(state: StyleEditorState): StyleEditorState {
  return {
    ...state,
    profile: createDefaultStyleProfile(),
  };
}
