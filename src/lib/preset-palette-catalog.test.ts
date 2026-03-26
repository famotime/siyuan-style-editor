import { PRESET_PALETTE_COLLECTIONS } from "@/lib/preset-palette-catalog";

describe("preset palette catalog", () => {
  it("keeps the preset palette collections in the expected order with stable ids and labels", () => {
    expect(PRESET_PALETTE_COLLECTIONS).toHaveLength(10);
    expect(PRESET_PALETTE_COLLECTIONS.map(palette => ({
      id: palette.id,
      label: palette.label,
    }))).toEqual([
      { id: "fiery-ocean", label: "Fiery Ocean" },
      { id: "olive-garden-feast", label: "Olive Garden Feast" },
      { id: "sunny-beach-day", label: "Sunny Beach Day" },
      { id: "dark-sunset", label: "Dark Sunset" },
      { id: "summer-dream", label: "Summer Dream" },
      { id: "vibrant-color-fiesta", label: "Vibrant Color Fiesta" },
      { id: "summer-ocean-breeze", label: "Summer Ocean Breeze" },
      { id: "refreshing-summer-fun", label: "Refreshing Summer Fun" },
      { id: "fiery-palette", label: "Fiery Palette" },
      { id: "watermelon-sorbet", label: "Watermelon Sorbet" },
    ]);
  });

  it("keeps every preset palette as distinct six-digit hex swatches", () => {
    for (const palette of PRESET_PALETTE_COLLECTIONS) {
      expect(palette.colors.length).toBeGreaterThanOrEqual(5);
      expect(new Set(palette.colors.map(color => color.value)).size).toBe(palette.colors.length);

      for (const color of palette.colors) {
        expect(color.value).toMatch(/^#[0-9A-F]{6}$/);
      }
    }

    expect(PRESET_PALETTE_COLLECTIONS[0].colors.map(color => color.value)).toEqual([
      "#780000",
      "#C1121F",
      "#FDF0D5",
      "#003049",
      "#669BBC",
    ]);
  });
});
