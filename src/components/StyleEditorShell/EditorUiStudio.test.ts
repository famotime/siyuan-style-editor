import {
  createApp,
  h,
  nextTick,
} from "vue";

import EditorUiStudio from "@/components/StyleEditorShell/EditorUiStudio.vue";
import {
  createDefaultFeatureProfile,
  EDITOR_UI_FEATURE_OPTIONS,
} from "@/lib/style-feature-catalog";

describe("EditorUiStudio", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders only editor UI feature cards", () => {
    const onUpdateFeatureStyle = vi.fn();
    const container = document.createElement("div");
    document.body.append(container);

    const app = createApp({
      render() {
        return h(EditorUiStudio, {
          featureProfile: createDefaultFeatureProfile(),
          featureStyleOptions: EDITOR_UI_FEATURE_OPTIONS,
          onUpdateFeatureStyle,
        });
      },
    });

    app.mount(container);

    expect(container.querySelector(".editor-ui-studio")).not.toBeNull();
    expect(container.querySelectorAll(".feature-card")).toHaveLength(EDITOR_UI_FEATURE_OPTIONS.length);
    expect(container.textContent).toContain("全屋改造");
    expect(container.querySelector('input[type="checkbox"]')).not.toBeNull();

    app.unmount();
  });

  it("emits feature updates when users toggle and edit controls", async () => {
    const onUpdateFeatureStyle = vi.fn();
    const container = document.createElement("div");
    document.body.append(container);

    const app = createApp({
      render() {
        return h(EditorUiStudio, {
          featureProfile: createDefaultFeatureProfile(),
          featureStyleOptions: EDITOR_UI_FEATURE_OPTIONS,
          onUpdateFeatureStyle,
        });
      },
    });

    app.mount(container);
    await nextTick();

    const firstCard = container.querySelector(".feature-card") as HTMLElement;
    const checkbox = firstCard.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(onUpdateFeatureStyle).toHaveBeenCalledWith(
      EDITOR_UI_FEATURE_OPTIONS[0].value,
      { enabled: true },
    );

    app.unmount();
  });
});
