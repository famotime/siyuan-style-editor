import {
  createApp,
  h,
  nextTick,
} from "vue";

import FeatureStudio from "@/components/StyleEditorShell/FeatureStudio.vue";
import {
  createDefaultFeatureProfile,
  FEATURE_STYLE_OPTIONS,
} from "@/lib/style-feature-catalog";

async function mountFeatureStudio() {
  const onUpdateFeatureStyle = vi.fn();
  const container = document.createElement("div");
  document.body.append(container);

  const app = createApp({
    render() {
      return h(FeatureStudio, {
        featureProfile: createDefaultFeatureProfile(),
        featureStyleOptions: FEATURE_STYLE_OPTIONS,
        onUpdateFeatureStyle,
      });
    },
  });

  app.mount(container);
  await nextTick();

  return {
    container,
    onUpdateFeatureStyle,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

describe("FeatureStudio", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders configurable feature cards with controls", () => {
    const app = createApp({
      render() {
        return h(FeatureStudio, {
          featureProfile: createDefaultFeatureProfile(),
          featureStyleOptions: FEATURE_STYLE_OPTIONS,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    const container = document.createElement("div");
    document.body.append(container);
    app.mount(container);

    expect(container.querySelector(".feature-studio")).not.toBeNull();
    expect(container.querySelectorAll(".feature-card")).toHaveLength(FEATURE_STYLE_OPTIONS.length);
    expect(container.textContent).toContain("段落悬停高亮");
    expect(container.textContent).toContain("正文安全");
    expect(container.querySelector('input[type="checkbox"]')).not.toBeNull();
    expect(container.querySelector('input[type="color"]')).not.toBeNull();
    expect(container.querySelector('input[type="number"]')).not.toBeNull();
    expect(container.querySelector("select")).not.toBeNull();

    app.unmount();
  });

  it("emits feature updates when users toggle and edit controls", async () => {
    const { container, onUpdateFeatureStyle, unmount } = await mountFeatureStudio();

    const imageRadiusCard = container.querySelector('[data-feature-id="imageRadius"]') as HTMLElement;
    const checkbox = imageRadiusCard.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    const numberInput = imageRadiusCard.querySelector('input[type="number"]') as HTMLInputElement;
    numberInput.value = "18";
    numberInput.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();

    expect(onUpdateFeatureStyle).toHaveBeenNthCalledWith(1,
      "imageRadius",
      {
        enabled: true,
      },
    );
    expect(onUpdateFeatureStyle).toHaveBeenNthCalledWith(2,
      "imageRadius",
      {
        values: {
          radius: 18,
        },
      },
    );

    unmount();
  });
});
