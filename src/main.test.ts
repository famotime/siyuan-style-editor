const vueMocks = vi.hoisted(() => {
  const instances: Array<{
    mount: ReturnType<typeof vi.fn>;
    unmount: ReturnType<typeof vi.fn>;
  }> = [];

  const createApp = vi.fn(() => {
    let mountedElement: HTMLElement | null = null;
    const instance = {
      mount: vi.fn((element: HTMLElement) => {
        mountedElement = element;
        element.innerHTML = "<div data-test-app=\"mounted\"></div>";
      }),
      unmount: vi.fn(() => {
        mountedElement?.replaceChildren();
      }),
    };

    instances.push(instance);
    return instance;
  });

  return {
    createApp,
    instances,
  };
});

const runtimeMocks = vi.hoisted(() => ({
  initializeRuntime: vi.fn().mockResolvedValue(undefined),
  teardownRuntime: vi.fn(),
}));

vi.mock("vue", () => ({
  createApp: vueMocks.createApp,
}));

vi.mock("@/style-editor-runtime", () => ({
  initializeRuntime: runtimeMocks.initializeRuntime,
  teardownRuntime: runtimeMocks.teardownRuntime,
}));

vi.mock("@/App.vue", () => ({
  default: { name: "AppStub" },
}));

import {
  destroy,
  init,
  mountDock,
} from "@/main";

describe("main lifecycle", () => {
  afterEach(() => {
    destroy();
    document.body.innerHTML = "";
    vi.clearAllMocks();
    vueMocks.instances.length = 0;
  });

  it("initializes the runtime with the provided plugin instance", async () => {
    const plugin = { name: "plugin-stub" };

    await init(plugin as never);

    expect(runtimeMocks.initializeRuntime).toHaveBeenCalledOnce();
    expect(runtimeMocks.initializeRuntime).toHaveBeenCalledWith(plugin);
  });

  it("does not remount when the same dock element is requested twice", () => {
    const element = document.createElement("div");

    mountDock(element);
    mountDock(element);

    expect(vueMocks.createApp).toHaveBeenCalledOnce();
    expect(vueMocks.instances[0]?.mount).toHaveBeenCalledOnce();
    expect(element.classList.contains("siyuan-style-editor-dock")).toBe(true);
    expect(element.querySelector("[data-test-app=\"mounted\"]")).not.toBeNull();
  });

  it("unmounts the previous app before remounting into a different dock element", () => {
    const firstElement = document.createElement("div");
    const secondElement = document.createElement("div");

    mountDock(firstElement);
    mountDock(secondElement);

    expect(vueMocks.createApp).toHaveBeenCalledTimes(2);
    expect(vueMocks.instances[0]?.unmount).toHaveBeenCalledOnce();
    expect(firstElement.innerHTML).toBe("");
    expect(firstElement.classList.contains("siyuan-style-editor-dock")).toBe(false);
    expect(secondElement.classList.contains("siyuan-style-editor-dock")).toBe(true);
    expect(secondElement.querySelector("[data-test-app=\"mounted\"]")).not.toBeNull();
  });

  it("destroys the mounted app, clears the container, and tears down runtime state", () => {
    const element = document.createElement("div");

    mountDock(element);
    destroy();

    expect(vueMocks.instances[0]?.unmount).toHaveBeenCalledOnce();
    expect(element.innerHTML).toBe("");
    expect(element.classList.contains("siyuan-style-editor-dock")).toBe(false);
    expect(runtimeMocks.teardownRuntime).toHaveBeenCalledOnce();
  });
});
