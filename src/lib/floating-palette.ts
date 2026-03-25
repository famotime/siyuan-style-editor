export interface FloatingPaletteAnchorRect {
  height: number;
  left: number;
  top: number;
  width: number;
}

export interface FloatingPaletteSize {
  height: number;
  width: number;
}

export interface FloatingPaletteViewport {
  height: number;
  width: number;
}

export interface FloatingPalettePosition {
  left: number;
  top: number;
  transformOrigin: string;
}

const VIEWPORT_MARGIN = 12;
const PALETTE_GAP = 8;

export function resolveFloatingPalettePosition(
  anchorRect: FloatingPaletteAnchorRect,
  paletteSize: FloatingPaletteSize,
  viewport: FloatingPaletteViewport,
): FloatingPalettePosition {
  const centeredLeft = anchorRect.left + (anchorRect.width / 2) - (paletteSize.width / 2);
  const maxLeft = Math.max(VIEWPORT_MARGIN, viewport.width - paletteSize.width - VIEWPORT_MARGIN);
  const left = Math.min(Math.max(centeredLeft, VIEWPORT_MARGIN), maxLeft);

  const belowTop = anchorRect.top + anchorRect.height + PALETTE_GAP;
  const fitsBelow = belowTop + paletteSize.height <= viewport.height - VIEWPORT_MARGIN;

  if (fitsBelow) {
    return {
      left,
      top: belowTop,
      transformOrigin: "top center",
    };
  }

  const aboveTop = Math.max(VIEWPORT_MARGIN, anchorRect.top - paletteSize.height - PALETTE_GAP);
  return {
    left,
    top: aboveTop,
    transformOrigin: "bottom center",
  };
}
