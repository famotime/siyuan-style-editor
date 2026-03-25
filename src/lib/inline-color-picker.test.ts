import {
  buildInlineColorFieldBackground,
  hexToHsvColor,
  hsvToHexColor,
} from "@/lib/inline-color-picker";

describe("inline color picker helpers", () => {
  it("converts a hex color into stable hsv channels", () => {
    expect(hexToHsvColor("#ff0000")).toEqual({
      h: 0,
      s: 1,
      v: 1,
    });

    expect(hexToHsvColor("#808080")).toEqual({
      h: 0,
      s: 0,
      v: 0.5019607843137255,
    });
  });

  it("converts hsv channels back into a normalized hex color", () => {
    expect(hsvToHexColor({
      h: 120,
      s: 1,
      v: 1,
    })).toBe("#00ff00");

    expect(hsvToHexColor({
      h: 210,
      s: 0.6666666666666666,
      v: 0.6,
    })).toBe("#336699");
  });

  it("builds the inline palette field background from the active hue", () => {
    expect(buildInlineColorFieldBackground(210)).toBe(
      "linear-gradient(180deg, transparent 0%, #000 100%), linear-gradient(90deg, #fff 0%, hsl(210 100% 50%) 100%)",
    );
  });
});
