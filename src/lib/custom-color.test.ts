import {
  createDefaultCustomColor,
  normalizeHexColor,
  resolveColorPickerValue,
} from "@/lib/custom-color"

describe("custom color helpers", () => {
  it("normalizes short and long hex colors", () => {
    expect(normalizeHexColor("#abc")).toBe("#aabbcc")
    expect(normalizeHexColor("A1B2C3")).toBe("#a1b2c3")
  })

  it("rejects invalid color values", () => {
    expect(normalizeHexColor("var(--b3-font-color1)")).toBe("")
    expect(normalizeHexColor("#12")).toBe("")
    expect(normalizeHexColor("")).toBe("")
  })

  it("uses the active value when it is a valid hex color", () => {
    expect(resolveColorPickerValue("#336699", "color")).toBe("#336699")
    expect(resolveColorPickerValue("#abc", "backgroundColor")).toBe("#aabbcc")
  })

  it("falls back to a channel default when the active value is not a hex color", () => {
    expect(resolveColorPickerValue("var(--b3-font-color6)", "color")).toBe(createDefaultCustomColor("color"))
    expect(resolveColorPickerValue("", "backgroundColor")).toBe(createDefaultCustomColor("backgroundColor"))
  })

  it("resolves palette variables into standard hex codes for display", () => {
    document.documentElement.style.setProperty("--b3-font-color8", "rgb(90, 180, 214)")
    document.documentElement.style.setProperty("--b3-font-background9", "#ffb347")

    expect(resolveColorPickerValue("var(--b3-font-color8)", "color")).toBe("#5ab4d6")
    expect(resolveColorPickerValue("var(--b3-font-background9)", "backgroundColor")).toBe("#ffb347")
  })

  it("resolves inherited palette variables from the document body for display", () => {
    document.body.style.setProperty("--b3-theme-on-surface", "rgb(248, 249, 250)")

    expect(resolveColorPickerValue("var(--b3-theme-on-surface)", "color")).toBe("#f8f9fa")
  })

  it("resolves palette variables from the active panel scope", () => {
    const scope = document.createElement("div")
    scope.style.setProperty("--b3-theme-on-surface", "rgb(242, 243, 245)")
    document.body.append(scope)

    expect(resolveColorPickerValue("var(--b3-theme-on-surface)", "color", scope)).toBe("#f2f3f5")
  })
})
