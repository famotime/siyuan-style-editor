import { FEATURE_DEFINITIONS } from "@/lib/feature-style-definitions"
import { createDefaultConfig } from "@/lib/feature-style-types"

describe("feature style definitions golden snapshot", () => {
  it("keeps definition ids unique and complete", () => {
    const ids = FEATURE_DEFINITIONS.map((definition) => definition.value)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThan(50)
  })

  it("keeps every definition's default-config css byte-identical", () => {
    for (const definition of FEATURE_DEFINITIONS) {
      const css = definition.buildCss(createDefaultConfig(definition.defaults.values))
      expect(css).toMatchSnapshot(`${definition.value} / default`)
    }
  })

  it("keeps every definition's fallback css byte-identical for empty values", () => {
    for (const definition of FEATURE_DEFINITIONS) {
      const emptyValues = Object.fromEntries(
        Object.keys(definition.defaults.values).map((key) => [key, ""]),
      )
      const css = definition.buildCss({ enabled: true, values: emptyValues })
      expect(css).toMatchSnapshot(`${definition.value} / empty`)
    }
  })

  it("keeps every definition's controls and defaults structurally identical", () => {
    for (const definition of FEATURE_DEFINITIONS) {
      expect(definition.controls).toMatchSnapshot(`${definition.value} / controls`)
      expect(definition.defaults).toMatchSnapshot(`${definition.value} / defaults`)
    }
  })
})
