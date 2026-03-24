import type { IProtyle } from "siyuan";

import {
  createDefaultStyleProfile,
  normalizeStyleProfile,
  type StyleProfile,
  type StyleTarget,
} from "@/lib/style-profile";

export interface TemplateRef {
  docId: string;
  path: string;
}

export interface StyleEditorState {
  template: TemplateRef;
  profile: StyleProfile;
}

type PartialState = Partial<{
  template: Partial<TemplateRef>;
  profile: Partial<StyleProfile>;
}>;

export function createDefaultEditorState(): StyleEditorState {
  return {
    template: {
      docId: "",
      path: "",
    },
    profile: createDefaultStyleProfile(),
  };
}

export function normalizeEditorState(input?: PartialState | null): StyleEditorState {
  const defaultState = createDefaultEditorState();
  return {
    template: {
      ...defaultState.template,
      ...(input?.template ?? {}),
    },
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

export function createTemplateRefFromProtyle(
  protyle: Pick<IProtyle, "block" | "path">,
): TemplateRef | null {
  const docId = protyle.block.rootID || protyle.block.id;
  if (!docId) {
    return null;
  }

  return {
    docId,
    path: protyle.path || "",
  };
}
