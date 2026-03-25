import {
  createDefaultCustomColor,
  normalizeHexColor,
  resolveColorPickerValue,
} from "@/lib/custom-color";

describe("custom color helpers", () => {
  it("normalizes short and long hex colors", () => {
    expect(normalizeHexColor("#abc")).toBe("#aabbcc");
    expect(normalizeHexColor("A1B2C3")).toBe("#a1b2c3");
  });

  it("rejects invalid color values", () => {
    expect(normalizeHexColor("var(--b3-font-color1)")).toBe("");
    expect(normalizeHexColor("#12")).toBe("");
    expect(normalizeHexColor("")).toBe("");
  });

  it("uses the active value when it is a valid hex color", () => {
    expect(resolveColorPickerValue("#336699", "color")).toBe("#336699");
    expect(resolveColorPickerValue("#abc", "backgroundColor")).toBe("#aabbcc");
  });

  it("falls back to a channel default when the active value is not a hex color", () => {
    expect(resolveColorPickerValue("var(--b3-font-color6)", "color")).toBe(createDefaultCustomColor("color"));
    expect(resolveColorPickerValue("", "backgroundColor")).toBe(createDefaultCustomColor("backgroundColor"));
  });
});
