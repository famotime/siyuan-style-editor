import {
  closeInlinePalette,
  isInlinePaletteOpen,
  toggleInlinePalette,
} from "@/lib/inline-palette";

describe("inline palette state", () => {
  it("opens the clicked target and channel", () => {
    expect(toggleInlinePalette(
      { channel: null, target: null },
      "heading1",
      "color",
    )).toEqual({
      channel: "color",
      target: "heading1",
    });
  });

  it("closes when clicking the same orb again", () => {
    expect(toggleInlinePalette(
      { channel: "backgroundColor", target: "mark" },
      "mark",
      "backgroundColor",
    )).toEqual({
      channel: null,
      target: null,
    });
  });

  it("switches to a different target or channel", () => {
    expect(toggleInlinePalette(
      { channel: "color", target: "heading1" },
      "heading2",
      "backgroundColor",
    )).toEqual({
      channel: "backgroundColor",
      target: "heading2",
    });
  });

  it("reports visibility only for the active target", () => {
    const state = { channel: "color", target: "strong" } as const;

    expect(isInlinePaletteOpen(state, "strong")).toBe(true);
    expect(isInlinePaletteOpen(state, "heading1")).toBe(false);
    expect(isInlinePaletteOpen(closeInlinePalette(), "strong")).toBe(false);
  });
});
