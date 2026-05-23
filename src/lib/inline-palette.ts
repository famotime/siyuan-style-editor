import type { StyleTarget } from "@/lib/style-profile"
import type { PaintChannel } from "@/style-editor-runtime"

export interface InlinePaletteState {
  target: StyleTarget | null
  channel: PaintChannel | null
}

export function closeInlinePalette(): InlinePaletteState {
  return {
    channel: null,
    target: null,
  }
}

export function toggleInlinePalette(
  currentState: InlinePaletteState,
  target: StyleTarget,
  channel: PaintChannel,
): InlinePaletteState {
  if (currentState.target === target && currentState.channel === channel) {
    return closeInlinePalette()
  }

  return {
    channel,
    target,
  }
}

export function isInlinePaletteOpen(
  currentState: InlinePaletteState,
  target: StyleTarget,
): boolean {
  return currentState.target === target && currentState.channel !== null
}
