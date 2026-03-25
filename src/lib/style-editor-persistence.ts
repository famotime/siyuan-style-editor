import type { Plugin } from "siyuan";

import {
  normalizeEditorState,
  type StyleEditorState,
} from "@/lib/style-editor-state";
import { normalizeStyleProfile, type StyleProfile } from "@/lib/style-profile";

export async function loadPersistedEditorState(
  plugin: Plugin,
  storageKey: string,
): Promise<StyleEditorState> {
  const savedState = await plugin.loadData(storageKey);
  return normalizeEditorState(savedState);
}

export async function savePersistedEditorState(
  plugin: Plugin | null,
  storageKey: string,
  profile: StyleProfile,
): Promise<void> {
  if (!plugin) {
    return;
  }

  await plugin.saveData(storageKey, {
    profile: normalizeStyleProfile(profile),
  });
}
