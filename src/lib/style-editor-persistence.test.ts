import { loadPersistedEditorState, savePersistedEditorState } from "@/lib/style-editor-persistence"

function createPluginStub(savedState?: unknown) {
  return {
    loadData: vi.fn().mockResolvedValue(savedState),
    saveData: vi.fn().mockResolvedValue(undefined),
  }
}

describe("styleEditorPersistence", () => {
  const STORAGE_KEY = "style-editor.json"

  it("loads persisted state and normalizes missing fields to defaults", async () => {
    const plugin = createPluginStub(undefined)

    const state = await loadPersistedEditorState(plugin as never, STORAGE_KEY)

    expect(plugin.loadData).toHaveBeenCalledWith(STORAGE_KEY)
    expect(state.customPresetPalettes).toEqual([])
    expect(state.profile.heading1).toBeDefined()
    expect(state.featureProfile.imageRadius).toBeDefined()
  })

  it("normalizes a partial persisted profile and keeps known values", async () => {
    const plugin = createPluginStub({
      profile: {
        heading1: {
          color: "#224488",
        },
      },
    })

    const state = await loadPersistedEditorState(plugin as never, STORAGE_KEY)

    expect(state.profile.heading1.color).toBe("#224488")
    expect(state.customPresetPalettes).toEqual([])
    expect(state.featureProfile.imageRadius.enabled).toBe(false)
  })

  it("skips saving when the plugin instance is unavailable", async () => {
    await expect(
      savePersistedEditorState(null, STORAGE_KEY, {} as never, {} as never, []),
    ).resolves.toBeUndefined()
  })

  it("saves normalized editor state through the plugin", async () => {
    const plugin = createPluginStub()

    await savePersistedEditorState(plugin as never, STORAGE_KEY, {
      heading1: {
        color: "#224488",
      },
    } as never, {} as never, [])

    expect(plugin.saveData).toHaveBeenCalledOnce()
    const [key, payload] = vi.mocked(plugin.saveData).mock.calls[0]
    expect(key).toBe(STORAGE_KEY)
    expect(payload).toEqual(expect.objectContaining({
      customPresetPalettes: [],
      featureProfile: expect.any(Object),
      profile: expect.any(Object),
    }))
    expect((payload as Record<string, unknown>).profile).toMatchObject({
      heading1: expect.objectContaining({ color: "#224488" }),
    })
  })
})
