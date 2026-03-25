import {
  resolveFloatingPalettePosition,
} from "@/lib/floating-palette";

describe("floating palette position", () => {
  it("places the palette below the anchor when there is enough space", () => {
    expect(resolveFloatingPalettePosition(
      { height: 40, left: 120, top: 80, width: 44 },
      { height: 220, width: 280 },
      { height: 720, width: 480 },
    )).toEqual({
      left: 12,
      top: 128,
      transformOrigin: "top center",
    });
  });

  it("clamps the palette within the viewport margins", () => {
    expect(resolveFloatingPalettePosition(
      { height: 40, left: 330, top: 80, width: 44 },
      { height: 220, width: 280 },
      { height: 720, width: 480 },
    )).toEqual({
      left: 188,
      top: 128,
      transformOrigin: "top center",
    });
  });

  it("flips the palette above the anchor when there is not enough room below", () => {
    expect(resolveFloatingPalettePosition(
      { height: 40, left: 180, top: 620, width: 44 },
      { height: 220, width: 280 },
      { height: 720, width: 480 },
    )).toEqual({
      left: 62,
      top: 392,
      transformOrigin: "bottom center",
    });
  });
});
