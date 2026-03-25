import {
  createDefaultStyleProfile,
  normalizeStyleProfile,
  type StyleProfile,
  type StyleTarget,
} from "@/lib/style-profile";

export interface StyleEditorState {
  profile: StyleProfile;
}

type PartialState = Partial<{
  profile: Partial<StyleProfile>;
}>;

export function createDefaultEditorState(): StyleEditorState {
  return {
    profile: createDefaultStyleProfile(),
  };
}

export function normalizeEditorState(input?: PartialState | null): StyleEditorState {
  return {
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
