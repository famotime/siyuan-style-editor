# 思源样式编辑器 — 功能扩展实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 6 个阶段逐步扩展思源样式编辑器，新增 14 个特性、优化 UI 交互、改进架构。

**Architecture:** 声明式特性定义（`feature-style-definitions.ts`）+ 自动 UI 渲染（`FeatureSection.vue`）+ 按需 CSS 生成（`buildFeatureStyleCss`）。所有新特性遵循现有模式：在定义文件追加 `FeatureDefinition` 对象，类型文件更新 `FeatureStyleId` 联合类型，catalog 文件自动导出。

**Tech Stack:** Vue 3 `<script setup lang="ts">` + Vite 6 + SCSS + Vitest (jsdom)

---

## 文件结构总览

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/lib/feature-style-types.ts` | 扩展 `FeatureStyleId` 联合类型、`FeatureValueType`、`FeatureStyleControl` 接口 |
| `src/lib/feature-style-definitions.ts` | 新增 14 个 `FeatureDefinition`、修改 `imageRadius` |
| `src/lib/style-feature-catalog.ts` | 无结构性改动（自动从定义文件导出） |
| `src/App.vue` | 用 `FeatureSection` 替换 `FeatureStudio` + `EditorUiStudio` |
| `src/components/StyleEditorShell/FeatureStudio.test.ts` | 更新为 `FeatureSection` 测试 |
| `src/components/StyleEditorShell/EditorUiStudio.test.ts` | 删除或合并 |
| `src/lib/style-feature-catalog.test.ts` | 新增特性测试用例 |

### 新建文件

| 文件 | 职责 |
|------|------|
| `src/components/StyleEditorShell/FeatureSection.vue` | 通用特性面板组件（替换 FeatureStudio + EditorUiStudio） |
| `src/components/StyleEditorShell/FeatureSection.test.ts` | FeatureSection 组件测试 |

### 删除文件

| 文件 | 原因 |
|------|------|
| `src/components/StyleEditorShell/FeatureStudio.vue` | 被 FeatureSection 替代 |
| `src/components/StyleEditorShell/EditorUiStudio.vue` | 被 FeatureSection 替代 |

---

## 阶段一：组件重构与 UI 增强

### Task 1: 扩展控件类型 — 新增 `text` 和 `slider` 支持

**Files:**
- Modify: `src/lib/feature-style-types.ts`
- Test: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1: 更新类型定义**

在 `src/lib/feature-style-types.ts` 中修改 `FeatureValueType` 和 `FeatureStyleControl`：

```typescript
// feature-style-types.ts line 37
type FeatureValueType = "color" | "number" | "select" | "text";
```

```typescript
// feature-style-types.ts line 44-53
export interface FeatureStyleControl {
  key: string;
  label: string;
  max?: number;
  min?: number;
  options?: FeatureStyleControlOption[];
  placeholder?: string;
  slider?: boolean;
  step?: number;
  type: FeatureValueType;
  unit?: string;
}
```

新增了 `placeholder?: string`（文本控件占位提示）和 `slider?: boolean`（为 number 类型启用滑块展示）。

- [ ] **Step 2: 更新 `normalizeControlValue` 处理 text 类型**

在 `src/lib/style-feature-catalog.ts` 的 `normalizeControlValue` 函数中，`text` 类型与 `color` 走相同逻辑（返回字符串），无需额外分支——当前 color 的 fallback 已覆盖。验证无回归即可。

- [ ] **Step 3: 运行现有测试确保无回归**

Run: `npm test`
Expected: 全部通过

- [ ] **Step 4: 提交**

```bash
git add src/lib/feature-style-types.ts
git commit -m "feat: 扩展控件类型，新增 text 和 slider 支持"
```

---

### Task 2: 创建通用 FeatureSection 组件

**Files:**
- Create: `src/components/StyleEditorShell/FeatureSection.vue`
- Create: `src/components/StyleEditorShell/FeatureSection.test.ts`

- [ ] **Step 1: 编写 FeatureSection 组件测试**

```typescript
// src/components/StyleEditorShell/FeatureSection.test.ts
import { describe, it, expect, afterEach, vi } from "vitest";
import { createApp, h, nextTick } from "vue";
import FeatureSection from "./FeatureSection.vue";
import type { FeatureStyleOption, FeatureStyleProfile } from "@/lib/style-feature-catalog";
import { createDefaultFeatureProfile } from "@/lib/style-feature-catalog";

function createProps() {
  const featureProfile = createDefaultFeatureProfile();
  const featureStyleOptions: FeatureStyleOption[] = [
    {
      controls: [
        { key: "bgColor", label: "背景色", type: "color" },
        { key: "size", label: "大小", type: "number", min: 0, max: 100, step: 1, unit: "px" },
        { key: "mode", label: "模式", type: "select", options: [{ label: "默认", value: "default" }] },
      ],
      hint: "测试提示",
      label: "测试特性",
      preview: "🧪",
      risk: "正文安全",
      value: "paragraphHover",
    },
  ];
  return { featureProfile, featureStyleOptions };
}

describe("FeatureSection", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("渲染 kicker 和 title", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const { featureProfile, featureStyleOptions } = createProps();
    const onUpdateFeatureStyle = vi.fn();

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "Test Kicker",
          title: "测试标题",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle,
        });
      },
    });
    app.mount(container);
    await nextTick();

    expect(container.querySelector(".feature-section__kicker")?.textContent?.trim()).toBe("Test Kicker");
    expect(container.querySelector(".feature-section__title")?.textContent?.trim()).toBe("测试标题");

    app.unmount();
    container.remove();
  });

  it("渲染特性卡片", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const { featureProfile, featureStyleOptions } = createProps();

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "K",
          title: "T",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    app.mount(container);
    await nextTick();

    const cards = container.querySelectorAll(".feature-card");
    expect(cards.length).toBe(1);
    expect(cards[0].getAttribute("data-feature-id")).toBe("paragraphHover");

    app.unmount();
    container.remove();
  });

  it("展示 hint 描述", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const { featureProfile, featureStyleOptions } = createProps();

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "K",
          title: "T",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    app.mount(container);
    await nextTick();

    const hint = container.querySelector(".feature-card__hint");
    expect(hint?.textContent?.trim()).toBe("测试提示");

    app.unmount();
    container.remove();
  });

  it("展示 preview 标签", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const { featureProfile, featureStyleOptions } = createProps();

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "K",
          title: "T",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    app.mount(container);
    await nextTick();

    const tag = container.querySelector(".feature-card__preview-tag");
    expect(tag?.textContent?.trim()).toBe("🧪");

    app.unmount();
    container.remove();
  });

  it("搜索筛选特性", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const featureProfile = createDefaultFeatureProfile();
    const featureStyleOptions: FeatureStyleOption[] = [
      {
        controls: [],
        hint: "提示A",
        label: "段落样式",
        preview: "📝",
        risk: "正文安全",
        value: "paragraphHover",
      },
      {
        controls: [],
        hint: "提示B",
        label: "标题装饰",
        preview: "🎨",
        risk: "正文安全",
        value: "headingDecoration",
      },
    ];

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "K",
          title: "T",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    app.mount(container);
    await nextTick();

    const searchInput = container.querySelector(".feature-search") as HTMLInputElement;
    expect(searchInput).toBeTruthy();

    searchInput.value = "段落";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();

    const visibleCards = container.querySelectorAll(".feature-card:not([style*='display: none'])");
    expect(visibleCards.length).toBe(1);

    app.unmount();
    container.remove();
  });

  it("显示启用状态统计", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const featureProfile = createDefaultFeatureProfile();
    featureProfile.paragraphHover.enabled = true;
    const featureStyleOptions: FeatureStyleOption[] = [
      {
        controls: [],
        hint: "",
        label: "段落样式",
        preview: "📝",
        risk: "正文安全",
        value: "paragraphHover",
      },
      {
        controls: [],
        hint: "",
        label: "标题装饰",
        preview: "🎨",
        risk: "正文安全",
        value: "headingDecoration",
      },
    ];

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "K",
          title: "T",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    app.mount(container);
    await nextTick();

    const stats = container.querySelector(".feature-section__stats");
    expect(stats?.textContent).toContain("1/2");

    app.unmount();
    container.remove();
  });

  it("渲染 text 类型控件", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const featureProfile = createDefaultFeatureProfile();
    const featureStyleOptions: FeatureStyleOption[] = [
      {
        controls: [
          { key: "fontName", label: "字体", type: "text", placeholder: "输入字体名称" },
        ],
        hint: "",
        label: "字体设置",
        preview: "A",
        risk: "正文安全",
        value: "paragraphHover",
      },
    ];

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "K",
          title: "T",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    app.mount(container);
    await nextTick();

    const textInput = container.querySelector(".feature-control__text") as HTMLInputElement;
    expect(textInput).toBeTruthy();
    expect(textInput.type).toBe("text");

    app.unmount();
    container.remove();
  });

  it("渲染 range 滑块（slider 属性）", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const featureProfile = createDefaultFeatureProfile();
    const featureStyleOptions: FeatureStyleOption[] = [
      {
        controls: [
          { key: "size", label: "大小", type: "number", min: 0, max: 100, step: 1, slider: true },
        ],
        hint: "",
        label: "大小设置",
        preview: "📏",
        risk: "正文安全",
        value: "paragraphHover",
      },
    ];

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "K",
          title: "T",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    app.mount(container);
    await nextTick();

    const rangeInput = container.querySelector("input[type='range']");
    expect(rangeInput).toBeTruthy();
    const numberInput = container.querySelector("input[type='number']");
    expect(numberInput).toBeTruthy();

    app.unmount();
    container.remove();
  });

  it("颜色控件支持文本输入", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const featureProfile = createDefaultFeatureProfile();
    const featureStyleOptions: FeatureStyleOption[] = [
      {
        controls: [
          { key: "bgColor", label: "背景色", type: "color" },
        ],
        hint: "",
        label: "颜色测试",
        preview: "🎨",
        risk: "正文安全",
        value: "paragraphHover",
      },
    ];

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "K",
          title: "T",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    app.mount(container);
    await nextTick();

    const colorInput = container.querySelector(".feature-control__color");
    const colorText = container.querySelector(".feature-control__color-text") as HTMLInputElement;
    expect(colorInput).toBeTruthy();
    expect(colorText).toBeTruthy();
    expect(colorText.type).toBe("text");

    app.unmount();
    container.remove();
  });

  it("折叠/展开面板", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const { featureProfile, featureStyleOptions } = createProps();

    const app = createApp({
      render() {
        return h(FeatureSection, {
          kicker: "K",
          title: "T",
          featureStyleOptions,
          featureProfile,
          onUpdateFeatureStyle: vi.fn(),
        });
      },
    });
    app.mount(container);
    await nextTick();

    const collapseBtn = container.querySelector(".panel-collapse-btn") as HTMLButtonElement;
    expect(collapseBtn).toBeTruthy();

    // 默认折叠
    const grid = container.querySelector(".feature-grid") as HTMLElement;
    expect(grid.style.display).toBe("none");

    // 点击展开
    collapseBtn.click();
    await nextTick();
    expect(grid.style.display).not.toBe("none");

    app.unmount();
    container.remove();
  });
});
```

- [ ] **Step 2: 运行测试确认全部失败**

Run: `npm test -- src/components/StyleEditorShell/FeatureSection.test.ts`
Expected: FAIL — 模块不存在

- [ ] **Step 3: 创建 FeatureSection.vue 组件**

```vue
<!-- src/components/StyleEditorShell/FeatureSection.vue -->
<template>
  <section class="feature-section">
    <div class="feature-section__header">
      <div>
        <p class="feature-section__kicker">
          {{ kicker }}
        </p>
        <h2 class="feature-section__title">
          {{ title }}
        </h2>
        <span class="feature-section__stats">
          {{ enabledCount }}/{{ totalCount }} 已启用
        </span>
      </div>
      <button
        type="button"
        class="panel-collapse-btn"
        :aria-label="collapsed ? '展开面板' : '折叠面板'"
        :title="collapsed ? '展开面板' : '折叠面板'"
        @click="collapsed = !collapsed"
      >
        <svg
          class="panel-collapse-btn__icon"
          :class="{ 'panel-collapse-btn__icon--collapsed': collapsed }"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div v-show="!collapsed">
      <input
        v-model="searchQuery"
        type="search"
        class="feature-search"
        placeholder="搜索特性..."
      >

      <div class="feature-grid">
        <article
          v-for="feature in filteredOptions"
          :key="feature.value"
          class="feature-card"
          :class="{ 'feature-card--enabled': featureProfile[feature.value].enabled }"
          :data-feature-id="feature.value"
        >
          <div class="feature-card__top">
            <div class="feature-card__copy">
              <span v-if="feature.preview" class="feature-card__preview-tag">
                {{ feature.preview }}
              </span>
              <h3 class="feature-card__title">
                {{ feature.label }}
              </h3>
              <p v-if="feature.hint" class="feature-card__hint">
                {{ feature.hint }}
              </p>
            </div>
            <label class="feature-switch">
              <input
                type="checkbox"
                :checked="featureProfile[feature.value].enabled"
                @change="handleEnabledChange(feature.value, $event)"
              >
              <span class="feature-switch__track">
                <span class="feature-switch__thumb" />
              </span>
            </label>
          </div>

          <div class="feature-card__controls">
            <label
              v-for="control in feature.controls"
              :key="control.key"
              class="feature-control"
            >
              <span class="feature-control__label">
                {{ control.label }}
              </span>

              <!-- color: 颜色选择器 + 文本输入 -->
              <template v-if="control.type === 'color'">
                <div class="feature-control__color-group">
                  <input
                    type="color"
                    class="feature-control__color"
                    :value="getColorControlValue(feature.value, control.key)"
                    @input="handleControlInput(feature.value, control.key, $event)"
                  >
                  <input
                    type="text"
                    class="feature-control__color-text"
                    :value="featureProfile[feature.value].values[control.key]"
                    @input="handleControlInput(feature.value, control.key, $event)"
                  >
                </div>
              </template>

              <!-- number: 滑块（可选）+ 数字输入 -->
              <template v-else-if="control.type === 'number'">
                <div class="feature-control__number-group">
                  <input
                    v-if="control.slider"
                    type="range"
                    class="feature-control__range"
                    :min="control.min"
                    :max="control.max"
                    :step="control.step"
                    :value="featureProfile[feature.value].values[control.key]"
                    @input="handleControlInput(feature.value, control.key, $event)"
                  >
                  <input
                    type="number"
                    class="feature-control__number"
                    :min="control.min"
                    :max="control.max"
                    :step="control.step"
                    :value="featureProfile[feature.value].values[control.key]"
                    @input="handleControlInput(feature.value, control.key, $event)"
                  >
                </div>
              </template>

              <!-- select: 下拉选择 -->
              <select
                v-else-if="control.type === 'select'"
                class="feature-control__select"
                :value="featureProfile[feature.value].values[control.key]"
                @change="handleControlInput(feature.value, control.key, $event)"
              >
                <option
                  v-for="option in control.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>

              <!-- text: 文本输入 -->
              <input
                v-else
                type="text"
                class="feature-control__text"
                :placeholder="control.placeholder"
                :value="featureProfile[feature.value].values[control.key]"
                @input="handleControlInput(feature.value, control.key, $event)"
              >
            </label>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  FeatureStyleId,
  FeatureStyleOption,
  FeatureStyleProfile,
} from "@/lib/style-feature-catalog";

import { computed, ref } from "vue";

const collapsed = ref(true);
const searchQuery = ref("");

const props = defineProps<{
  featureProfile: FeatureStyleProfile;
  featureStyleOptions: FeatureStyleOption[];
  kicker: string;
  title: string;
}>();

const emit = defineEmits<{
  "update-feature-style": [
    featureId: FeatureStyleId,
    config: {
      enabled?: boolean;
      values?: Record<string, string | number | boolean>;
    },
  ];
}>();

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.featureStyleOptions;
  return props.featureStyleOptions.filter(
    opt => opt.label.toLowerCase().includes(q) || opt.hint.toLowerCase().includes(q),
  );
});

const enabledCount = computed(() =>
  props.featureStyleOptions.filter(opt => props.featureProfile[opt.value].enabled).length,
);

const totalCount = computed(() => props.featureStyleOptions.length);

function handleEnabledChange(featureId: FeatureStyleId, event: Event) {
  const input = event.target as HTMLInputElement;
  emit("update-feature-style", featureId, {
    enabled: input.checked,
  });
}

function parseInputValue(event: Event) {
  const input = event.target as HTMLInputElement | HTMLSelectElement;
  if (input instanceof HTMLInputElement && input.type === "number") {
    return Number(input.value);
  }
  if (input instanceof HTMLInputElement && input.type === "range") {
    return Number(input.value);
  }
  return input.value;
}

function handleControlInput(featureId: FeatureStyleId, key: string, event: Event) {
  emit("update-feature-style", featureId, {
    values: {
      [key]: parseInputValue(event),
    },
  });
}

function getColorControlValue(featureId: FeatureStyleId, key: string) {
  const value = props.featureProfile[featureId].values[key];
  return typeof value === "string" && value.startsWith("#") ? value : "#888888";
}
</script>

<style scoped lang="scss">
.feature-section {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid var(--panel-divider);
  background: var(--panel-toolbar-bg);
  box-shadow: var(--panel-toolbar-shadow);
}

.feature-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  margin: -14px -14px 0;
  border-radius: 20px 20px 0 0;
  background: color-mix(in srgb, var(--panel-chip-active-bg) 40%, transparent 60%);
}

.feature-section__kicker {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--panel-text-subtle);
}

.feature-section__title {
  margin: 0;
  font-size: 20px;
  line-height: 1.1;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  color: var(--panel-text);
}

.feature-section__stats {
  display: inline-block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--panel-text-muted);
}

.panel-collapse-btn {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 8px;
  background: color-mix(in srgb, var(--panel-pill-bg) 74%, transparent 26%);
  color: var(--panel-text-muted);
  cursor: pointer;
  transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.panel-collapse-btn:hover {
  color: var(--panel-text);
  background: var(--panel-chip-active-bg);
  transform: translateY(-1px);
}

.panel-collapse-btn__icon {
  transition: transform 200ms ease;
}

.panel-collapse-btn__icon--collapsed {
  transform: rotate(-90deg);
}

.feature-search {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 10px;
  background: var(--panel-card-bg);
  color: var(--panel-text);
  font: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 160ms ease;
}

.feature-search:focus {
  border-color: var(--panel-accent-outline);
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.feature-card {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid var(--panel-divider);
  background: var(--panel-card-strong);
}

.feature-card--enabled {
  border-color: var(--panel-accent-outline);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--panel-accent) 16%, transparent 84%),
    0 14px 24px color-mix(in srgb, var(--panel-accent-soft) 20%, transparent 80%);
}

.feature-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  margin: -12px -12px 0;
  border-radius: 18px 18px 0 0;
  border-bottom: 1px solid var(--panel-divider);
  background: color-mix(in srgb, var(--panel-chip-active-bg) 30%, transparent 70%);
}

.feature-card__copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.feature-card__preview-tag {
  display: inline-block;
  font-size: 12px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--panel-accent) 12%, transparent 88%);
  color: var(--panel-text-muted);
  width: fit-content;
}

.feature-card__title {
  margin: 0;
  color: var(--panel-text);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
}

.feature-card__hint {
  margin: 0;
  color: var(--panel-text-muted);
  font-size: 12px;
  line-height: 1.4;
}

.feature-switch {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: flex-start;
  cursor: pointer;
}

.feature-switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.feature-switch__track {
  width: 38px;
  height: 22px;
  padding: 2px;
  box-sizing: border-box;
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel-pill-bg) 74%, transparent 26%);
  box-shadow: inset 0 0 0 1px var(--panel-card-inner-stroke);
  transition: background-color 160ms ease;
}

.feature-switch__thumb {
  width: 18px;
  height: 18px;
  display: block;
  border-radius: 999px;
  background: var(--panel-card-bg);
  box-shadow: 0 4px 10px color-mix(in srgb, var(--panel-text) 18%, transparent);
  transition: transform 160ms ease;
}

.feature-switch input:checked + .feature-switch__track {
  background: var(--panel-chip-active-bg);
}

.feature-switch input:checked + .feature-switch__track .feature-switch__thumb {
  transform: translateX(16px);
}

.feature-card__controls {
  display: grid;
  gap: 8px;
}

.feature-control {
  display: grid;
  grid-template-columns: minmax(70px, 1fr) minmax(0, 96px);
  align-items: center;
  gap: 8px;
}

.feature-control__label {
  color: var(--panel-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.feature-control__color-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.feature-control__color-group .feature-control__color {
  width: 32px;
  min-height: 30px;
  flex-shrink: 0;
}

.feature-control__color-group .feature-control__color-text {
  flex: 1;
  min-width: 0;
}

.feature-control__number-group {
  display: flex;
  gap: 6px;
  align-items: center;
}

.feature-control__range {
  flex: 1;
  min-width: 0;
  height: 4px;
  accent-color: var(--panel-accent);
}

.feature-control__number-group .feature-control__number {
  width: 56px;
  flex-shrink: 0;
}

.feature-control__color,
.feature-control__number,
.feature-control__select,
.feature-control__text,
.feature-control__color-text {
  width: 100%;
  min-height: 30px;
  box-sizing: border-box;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 10px;
  background: var(--panel-card-bg);
  color: var(--panel-text);
  font: inherit;
}

.feature-control__color {
  padding: 3px;
}

.feature-control__number,
.feature-control__select,
.feature-control__text,
.feature-control__color-text {
  padding: 0 8px;
  font-size: 13px;
}
</style>
```

- [ ] **Step 4: 运行测试**

Run: `npm test -- src/components/StyleEditorShell/FeatureSection.test.ts`
Expected: 全部通过

- [ ] **Step 5: 提交**

```bash
git add src/components/StyleEditorShell/FeatureSection.vue src/components/StyleEditorShell/FeatureSection.test.ts
git commit -m "feat: 新增通用 FeatureSection 组件，支持搜索筛选、hint/preview 展示、text/range 控件"
```

---

### Task 3: 替换 App.vue 中的 FeatureStudio + EditorUiStudio

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/StyleEditorShell/FeatureStudio.test.ts` → 更新为 FeatureSection 测试
- Delete: `src/components/StyleEditorShell/FeatureStudio.vue`
- Delete: `src/components/StyleEditorShell/EditorUiStudio.vue`
- Delete: `src/components/StyleEditorShell/EditorUiStudio.test.ts`

- [ ] **Step 1: 更新 App.vue**

将 `src/App.vue` 中的 import 和模板替换：

**import 替换**（删除两个旧 import，新增一个）：
```typescript
// 删除:
import FeatureStudio from "@/components/StyleEditorShell/FeatureStudio.vue";
import EditorUiStudio from "@/components/StyleEditorShell/EditorUiStudio.vue";

// 新增:
import FeatureSection from "@/components/StyleEditorShell/FeatureSection.vue";
```

**模板替换**（将两段合并为两段 FeatureSection）：
```vue
<FeatureSection
  kicker="Advanced Config"
  title="高级定制"
  :feature-style-options="bodySafeFeatureOptions"
  :feature-profile="runtimeState.featureProfile"
  @update-feature-style="handleUpdateFeatureStyle"
/>

<FeatureSection
  kicker="Editor UI"
  title="全屋改造"
  :feature-style-options="editorUiFeatureOptions"
  :feature-profile="runtimeState.featureProfile"
  @update-feature-style="handleUpdateFeatureStyle"
/>
```

- [ ] **Step 2: 删除旧文件**

```bash
rm src/components/StyleEditorShell/FeatureStudio.vue
rm src/components/StyleEditorShell/EditorUiStudio.vue
rm src/components/StyleEditorShell/EditorUiStudio.test.ts
```

- [ ] **Step 3: 更新旧测试文件**

将 `FeatureStudio.test.ts` 重写为测试 FeatureSection 的基本集成测试（或直接删除，因为 FeatureSection.test.ts 已覆盖）。

- [ ] **Step 4: 运行全量测试**

Run: `npm test`
Expected: 全部通过

- [ ] **Step 5: 提交**

```bash
git add -A src/components/StyleEditorShell/ src/App.vue
git commit -m "refactor: 用 FeatureSection 统一替换 FeatureStudio 和 EditorUiStudio，消除组件重复"
```

---

## 阶段二：新增排版与布局特性

### Task 4: 新增 `typographyBase` 特性（正文排版）

**Files:**
- Modify: `src/lib/feature-style-types.ts`
- Modify: `src/lib/feature-style-definitions.ts`
- Modify: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1: 更新 FeatureStyleId 类型**

在 `src/lib/feature-style-types.ts` 的 `FeatureStyleId` 联合类型中新增 `"typographyBase"`：

```typescript
export type FeatureStyleId =
  | "backlinkSticky"
  // ... existing entries ...
  | "underlineStyle"
  | "typographyBase";  // 新增
```

- [ ] **Step 2: 编写 CSS 生成测试**

在 `src/lib/style-feature-catalog.test.ts` 中新增：

```typescript
it("typographyBase — 正文排版", () => {
  const profile = normalizeFeatureProfile({
    typographyBase: {
      enabled: true,
      values: { fontSize: 17, lineHeight: 1.8, textIndent: 2, paragraphSpacing: 12, letterSpacing: 0.5 },
    },
  } as Partial<FeatureStyleProfile>);

  const css = buildFeatureStyleCss(profile);
  expect(css).toContain("--b3-font-size: 17px");
  expect(css).toContain("--b3-font-line-height: 1.8");
  expect(css).toContain("text-indent: 2em");
  expect(css).toContain("margin-bottom: 12px");
  expect(css).toContain("letter-spacing: 0.5px");
});
```

- [ ] **Step 3: 运行测试确认失败**

Run: `npm test -- src/lib/style-feature-catalog.test.ts`
Expected: FAIL — typographyBase 不在类型中

- [ ] **Step 4: 添加特性定义**

在 `src/lib/feature-style-definitions.ts` 末尾（`searchPanel` 定义之后）追加：

```typescript
{
  value: "typographyBase",
  label: "正文排版",
  hint: "调整正文字号、行高、缩进、段间距和字间距",
  preview: "📝",
  risk: "正文安全",
  controls: [
    { key: "fontSize", label: "字号", type: "number", min: 12, max: 20, step: 1, unit: "px", slider: true },
    { key: "lineHeight", label: "行高", type: "number", min: 1.2, max: 2.4, step: 0.05, slider: true },
    { key: "textIndent", label: "首行缩进", type: "number", min: 0, max: 4, step: 0.5, unit: "em" },
    { key: "paragraphSpacing", label: "段间距", type: "number", min: 0, max: 24, step: 1, unit: "px", slider: true },
    { key: "letterSpacing", label: "字间距", type: "number", min: -0.5, max: 2, step: 0.1, unit: "px" },
  ],
  defaults: createDefaultConfig({
    fontSize: 16,
    lineHeight: 1.625,
    textIndent: 0,
    paragraphSpacing: 8,
    letterSpacing: 0,
  }),
  buildCss: config => {
    const fontSize = px(config.values.fontSize, 16);
    const lineHeight = numberValue(config.values.lineHeight, 1.625);
    const textIndent = em(config.values.textIndent, 0);
    const paragraphSpacing = px(config.values.paragraphSpacing, 8);
    const letterSpacing = px(config.values.letterSpacing, 0);

    return `:root {
  --b3-font-size: ${fontSize} !important;
  --b3-font-line-height: ${lineHeight} !important;
  letter-spacing: ${letterSpacing} !important;
}

.protyle-wysiwyg [data-type="NodeParagraph"] {
  text-indent: ${textIndent} !important;
  margin-bottom: ${paragraphSpacing} !important;
}`;
  },
},
```

- [ ] **Step 5: 运行测试**

Run: `npm test -- src/lib/style-feature-catalog.test.ts`
Expected: 全部通过

- [ ] **Step 6: 提交**

```bash
git add src/lib/feature-style-types.ts src/lib/feature-style-definitions.ts src/lib/style-feature-catalog.test.ts
git commit -m "feat: 新增 typographyBase 特性，支持正文字号/行高/缩进/段间距/字间距调节"
```

---

### Task 5: 新增 `editorWidth` 特性（编辑器宽度）

**Files:**
- Modify: `src/lib/feature-style-types.ts`
- Modify: `src/lib/feature-style-definitions.ts`
- Modify: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1: 更新 FeatureStyleId**

新增 `"editorWidth"` 到联合类型。

- [ ] **Step 2: 编写测试**

```typescript
it("editorWidth — 编辑器宽度", () => {
  const profile = normalizeFeatureProfile({
    editorWidth: {
      enabled: true,
      values: { maxWidth: 800, fullWidth: "no", contentPadding: 16 },
    },
  } as Partial<FeatureStyleProfile>);

  const css = buildFeatureStyleCss(profile);
  expect(css).toContain("max-width: 800px");
  expect(css).toContain("padding-left: 16px");
  expect(css).toContain("padding-right: 16px");
});
```

- [ ] **Step 3: 添加特性定义**

```typescript
{
  value: "editorWidth",
  label: "编辑器宽度",
  hint: "自定义编辑区最大宽度和内容内边距",
  preview: "↔️",
  risk: "全屋改造",
  controls: [
    { key: "maxWidth", label: "最大宽度", type: "number", min: 600, max: 2000, step: 10, unit: "px", slider: true },
    { key: "fullWidth", label: "全宽模式", type: "select", options: [{ label: "否", value: "no" }, { label: "是", value: "yes" }] },
    { key: "contentPadding", label: "内容边距", type: "number", min: 0, max: 60, step: 2, unit: "px", slider: true },
  ],
  defaults: createDefaultConfig({
    maxWidth: 900,
    fullWidth: "no",
    contentPadding: 16,
  }),
  buildCss: config => {
    const maxWidth = px(config.values.maxWidth, 900);
    const fullWidth = stringValue(config.values.fullWidth, "no");
    const contentPadding = px(config.values.contentPadding, 16);

    const widthRule = fullWidth === "yes"
      ? `.protyle-content { max-width: 100% !important; }`
      : `.protyle-content { max-width: ${maxWidth} !important; }`;

    return `${widthRule}

.protyle-content {
  padding-left: ${contentPadding} !important;
  padding-right: ${contentPadding} !important;
}`;
  },
},
```

- [ ] **Step 4: 运行测试并提交**

Run: `npm test`, then commit.

---

### Task 6: 新增 `fontFamily` 特性（正文字体）

**Files:**
- Modify: `src/lib/feature-style-types.ts`
- Modify: `src/lib/feature-style-definitions.ts`
- Modify: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1: 更新 FeatureStyleId**

新增 `"fontFamily"` 到联合类型。

- [ ] **Step 2: 编写测试**

```typescript
it("fontFamily — 正文字体", () => {
  const profile = normalizeFeatureProfile({
    fontFamily: {
      enabled: true,
      values: { mainFont: "lxgw", codeFont: "jetbrains", customMainFont: "" },
    },
  } as Partial<FeatureStyleProfile>);

  const css = buildFeatureStyleCss(profile);
  expect(css).toContain("--b3-font-family-protyle");
  expect(css).toContain("霞鹜文楷");
  expect(css).toContain("--b3-font-family-code");
  expect(css).toContain("JetBrains Mono");
});
```

- [ ] **Step 3: 添加特性定义**

```typescript
{
  value: "fontFamily",
  label: "正文字体",
  hint: "设置正文和代码块的字体族",
  preview: "A",
  risk: "正文安全",
  controls: [
    {
      key: "mainFont", label: "正文字体", type: "select",
      options: [
        { label: "默认", value: "default" },
        { label: "思源黑体", value: "sourceHanSans" },
        { label: "苹方", value: "pingfang" },
        { label: "微软雅黑", value: "yahei" },
        { label: "霞鹜文楷", value: "lxgw" },
        { label: "自定义", value: "custom" },
      ],
    },
    {
      key: "codeFont", label: "代码字体", type: "select",
      options: [
        { label: "默认", value: "default" },
        { label: "JetBrains Mono", value: "jetbrains" },
        { label: "Fira Code", value: "firaCode" },
        { label: "Cascadia Code", value: "cascadia" },
        { label: "自定义", value: "custom" },
      ],
    },
    { key: "customMainFont", label: "自定义正文字体", type: "text", placeholder: "字体名称" },
  ],
  defaults: createDefaultConfig({
    mainFont: "default",
    codeFont: "default",
    customMainFont: "",
  }),
  buildCss: config => {
    const MAIN_FONT_MAP: Record<string, string> = {
      default: "",
      sourceHanSans: '"Source Han Sans SC", "Noto Sans SC", sans-serif',
      pingfang: '"PingFang SC", "Hiragino Sans GB", sans-serif',
      yahei: '"Microsoft YaHei", sans-serif',
      lxgw: '"LXGW WenKai", "霞鹜文楷", serif',
    };
    const CODE_FONT_MAP: Record<string, string> = {
      default: "",
      jetbrains: '"JetBrains Mono", monospace',
      firaCode: '"Fira Code", monospace',
      cascadia: '"Cascadia Code", monospace',
    };

    const mainFontKey = stringValue(config.values.mainFont, "default");
    const codeFontKey = stringValue(config.values.codeFont, "default");
    const customFont = stringValue(config.values.customMainFont, "");

    const mainFont = mainFontKey === "custom" && customFont
      ? `"${customFont}", sans-serif`
      : MAIN_FONT_MAP[mainFontKey] || "";
    const codeFont = CODE_FONT_MAP[codeFontKey] || "";

    const rules: string[] = [];
    if (mainFont) {
      rules.push(`:root {\n  --b3-font-family-protyle: ${mainFont} !important;\n}`);
    }
    if (codeFont) {
      rules.push(`:root {\n  --b3-font-family-code: ${codeFont} !important;\n}`);
    }
    return rules.join("\n\n");
  },
},
```

- [ ] **Step 4: 运行测试并提交**

---

### Task 7: 新增 `topBarStyle` 特性（顶栏样式）

**Files:**
- Modify: `src/lib/feature-style-types.ts`
- Modify: `src/lib/feature-style-definitions.ts`
- Modify: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1: 更新 FeatureStyleId**

新增 `"topBarStyle"`。

- [ ] **Step 2: 编写测试**

```typescript
it("topBarStyle — 顶栏样式", () => {
  const profile = normalizeFeatureProfile({
    topBarStyle: {
      enabled: true,
      values: { mode: "glass", blurRadius: 12, backgroundColor: "#ffffff", height: 40, borderBottom: "show" },
    },
  } as Partial<FeatureStyleProfile>);

  const css = buildFeatureStyleCss(profile);
  expect(css).toContain("#toolbar");
  expect(css).toContain("backdrop-filter: blur(12px)");
  expect(css).toContain("height: 40px");
});
```

- [ ] **Step 3: 添加特性定义**

```typescript
{
  value: "topBarStyle",
  label: "顶栏样式",
  hint: "自定义顶栏背景、高度和边框（透明/毛玻璃/自定义色）",
  preview: "🔧",
  risk: "全屋改造",
  controls: [
    {
      key: "mode", label: "风格", type: "select",
      options: [
        { label: "默认", value: "default" },
        { label: "透明", value: "transparent" },
        { label: "毛玻璃", value: "glass" },
      ],
    },
    { key: "blurRadius", label: "模糊半径", type: "number", min: 0, max: 20, step: 1, unit: "px", slider: true },
    { key: "backgroundColor", label: "背景色", type: "color" },
    { key: "height", label: "高度", type: "number", min: 32, max: 48, step: 1, unit: "px", slider: true },
    {
      key: "borderBottom", label: "底边线", type: "select",
      options: [{ label: "显示", value: "show" }, { label: "隐藏", value: "hide" }],
    },
  ],
  defaults: createDefaultConfig({
    mode: "default",
    blurRadius: 12,
    backgroundColor: "#ffffff",
    height: 36,
    borderBottom: "show",
  }),
  buildCss: config => {
    const mode = stringValue(config.values.mode, "default");
    const blurRadius = px(config.values.blurRadius, 12);
    const backgroundColor = stringValue(config.values.backgroundColor, "#ffffff");
    const height = px(config.values.height, 36);
    const borderBottom = stringValue(config.values.borderBottom, "show");

    const rules: string[] = [`#toolbar { height: ${height} !important; }`];

    if (mode === "transparent") {
      rules.push(`#toolbar { background: transparent !important; }`);
    } else if (mode === "glass") {
      rules.push(`#toolbar { background: ${backgroundColor}cc !important; backdrop-filter: blur(${blurRadius}) !important; -webkit-backdrop-filter: blur(${blurRadius}) !important; }`);
    } else {
      rules.push(`#toolbar { background: ${backgroundColor} !important; }`);
    }

    if (borderBottom === "hide") {
      rules.push(`#toolbar { border-bottom: none !important; box-shadow: none !important; }`);
    }

    return rules.join("\n");
  },
},
```

- [ ] **Step 4: 运行测试并提交**

---

### Task 8: 新增 `scrollbarStyle` 特性（滚动条样式）

**Files:**
- Modify: `src/lib/feature-style-types.ts`
- Modify: `src/lib/feature-style-definitions.ts`
- Modify: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1: 更新 FeatureStyleId**

新增 `"scrollbarStyle"`。

- [ ] **Step 2: 编写测试**

```typescript
it("scrollbarStyle — 滚动条样式", () => {
  const profile = normalizeFeatureProfile({
    scrollbarStyle: {
      enabled: true,
      values: { width: 6, trackColor: "#f0f0f0", thumbColor: "#c0c0c0", thumbRadius: 4, hideMode: "hover" },
    },
  } as Partial<FeatureStyleProfile>);

  const css = buildFeatureStyleCss(profile);
  expect(css).toContain("::-webkit-scrollbar");
  expect(css).toContain("width: 6px");
  expect(css).toContain("::-webkit-scrollbar-thumb");
  expect(css).toContain("::-webkit-scrollbar-track");
});
```

- [ ] **Step 3: 添加特性定义**

```typescript
{
  value: "scrollbarStyle",
  label: "滚动条样式",
  hint: "自定义滚动条宽度、颜色和显示模式",
  preview: "📏",
  risk: "全屋改造",
  controls: [
    { key: "width", label: "宽度", type: "number", min: 4, max: 16, step: 1, unit: "px", slider: true },
    { key: "trackColor", label: "轨道颜色", type: "color" },
    { key: "thumbColor", label: "滑块颜色", type: "color" },
    { key: "thumbRadius", label: "滑块圆角", type: "number", min: 0, max: 8, step: 1, unit: "px" },
    {
      key: "hideMode", label: "显示模式", type: "select",
      options: [
        { label: "始终显示", value: "always" },
        { label: "悬停显示", value: "hover" },
        { label: "完全隐藏", value: "hidden" },
      ],
    },
  ],
  defaults: createDefaultConfig({
    width: 6,
    trackColor: "#f0f0f0",
    thumbColor: "#c0c0c0",
    thumbRadius: 4,
    hideMode: "always",
  }),
  buildCss: config => {
    const width = px(config.values.width, 6);
    const trackColor = stringValue(config.values.trackColor, "#f0f0f0");
    const thumbColor = stringValue(config.values.thumbColor, "#c0c0c0");
    const thumbRadius = px(config.values.thumbRadius, 4);
    const hideMode = stringValue(config.values.hideMode, "always");

    if (hideMode === "hidden") {
      return `::-webkit-scrollbar { display: none !important; }\n* { scrollbar-width: none !important; }`;
    }

    const hover = hideMode === "hover"
      ? `::-webkit-scrollbar { width: ${width} !important; opacity: 0; transition: opacity 200ms ease; }\n::-webkit-scrollbar:hover { opacity: 1; }`
      : `::-webkit-scrollbar { width: ${width} !important; }`;

    return `${hover}

::-webkit-scrollbar-track {
  background: ${trackColor} !important;
}

::-webkit-scrollbar-thumb {
  background: ${thumbColor} !important;
  border-radius: ${thumbRadius} !important;
}`;
  },
},
```

- [ ] **Step 4: 运行测试并提交**

---

### Task 9: 新增 `codeBlockStyle` 特性（代码块外观）

**Files:**
- Modify: `src/lib/feature-style-types.ts`
- Modify: `src/lib/feature-style-definitions.ts`
- Modify: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1: 更新 FeatureStyleId**

新增 `"codeBlockStyle"`。

- [ ] **Step 2: 编写测试**

```typescript
it("codeBlockStyle — 代码块外观", () => {
  const profile = normalizeFeatureProfile({
    codeBlockStyle: {
      enabled: true,
      values: { borderRadius: 8, backgroundColor: "#1e1e1e", headerBgColor: "#2d2d2d", maxHeight: "300px", lineNumberColor: "#858585" },
    },
  } as Partial<FeatureStyleProfile>);

  const css = buildFeatureStyleCss(profile);
  expect(css).toContain(".code-block");
  expect(css).toContain("border-radius: 8px");
  expect(css).toContain("max-height: 300px");
  expect(css).toContain(".protyle-linenumber");
});
```

- [ ] **Step 3: 添加特性定义**

```typescript
{
  value: "codeBlockStyle",
  label: "代码块外观",
  hint: "自定义代码块圆角、背景色、信息栏背景和最大高度",
  preview: "{ }",
  risk: "正文安全",
  controls: [
    { key: "borderRadius", label: "圆角", type: "number", min: 0, max: 16, step: 1, unit: "px", slider: true },
    { key: "backgroundColor", label: "背景色", type: "color" },
    { key: "headerBgColor", label: "信息栏背景", type: "color" },
    {
      key: "maxHeight", label: "最大高度", type: "select",
      options: [
        { label: "不限", value: "none" },
        { label: "300px", value: "300px" },
        { label: "500px", value: "500px" },
        { label: "70vh", value: "70vh" },
      ],
    },
    { key: "lineNumberColor", label: "行号颜色", type: "color" },
  ],
  defaults: createDefaultConfig({
    borderRadius: 6,
    backgroundColor: "#1e1e1e",
    headerBgColor: "#2d2d2d",
    maxHeight: "none",
    lineNumberColor: "#858585",
  }),
  buildCss: config => {
    const borderRadius = px(config.values.borderRadius, 6);
    const backgroundColor = stringValue(config.values.backgroundColor, "#1e1e1e");
    const headerBgColor = stringValue(config.values.headerBgColor, "#2d2d2d");
    const maxHeight = stringValue(config.values.maxHeight, "none");
    const lineNumberColor = stringValue(config.values.lineNumberColor, "#858585");

    const maxH = maxHeight === "none" ? "" : `max-height: ${maxHeight} !important;`;

    return `.protyle-wysiwyg .code-block {
  border-radius: ${borderRadius} !important;
  background: ${backgroundColor} !important;
}

.protyle-wysiwyg .code-block .protyle-action {
  background: ${headerBgColor} !important;
  border-radius: ${borderRadius} ${borderRadius} 0 0 !important;
}

.protyle-wysiwyg .code-block .hljs {
  ${maxH}
  overflow: auto !important;
}

.protyle-wysiwyg .protyle-linenumber {
  color: ${lineNumberColor} !important;
}`;
  },
},
```

- [ ] **Step 4: 运行测试并提交**

---

## 阶段三：新增界面美化特性

### Task 10: 新增 `boldTextStyle` 特性

**Files:**
- Modify: `src/lib/feature-style-types.ts`
- Modify: `src/lib/feature-style-definitions.ts`
- Modify: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1–4: 同阶段二模式**

`FeatureStyleId` 新增 `"boldTextStyle"`。

特性定义：
```typescript
{
  value: "boldTextStyle",
  label: "加粗文本样式",
  hint: "自定义加粗文本的颜色、背景色和字重",
  preview: "B",
  risk: "正文安全",
  controls: [
    { key: "color", label: "文字颜色", type: "color" },
    { key: "backgroundColor", label: "背景色", type: "color" },
    { key: "borderRadius", label: "背景圆角", type: "number", min: 0, max: 8, step: 1, unit: "px" },
    { key: "fontWeight", label: "字重", type: "number", min: 600, max: 900, step: 100 },
  ],
  defaults: createDefaultConfig({
    color: "#1a1a2e",
    backgroundColor: "#fff3bf",
    borderRadius: 3,
    fontWeight: 700,
  }),
  buildCss: config => {
    const color = stringValue(config.values.color, "#1a1a2e");
    const bg = stringValue(config.values.backgroundColor, "#fff3bf");
    const radius = px(config.values.borderRadius, 3);
    const weight = numberValue(config.values.fontWeight, 700);

    return `strong, b, span[data-type~="strong"] {
  color: ${color} !important;
  background-color: ${bg} !important;
  border-radius: ${radius} !important;
  font-weight: ${weight} !important;
  padding: 0 2px !important;
}`;
  },
},
```

测试：
```typescript
it("boldTextStyle — 加粗文本样式", () => {
  const profile = normalizeFeatureProfile({
    boldTextStyle: {
      enabled: true,
      values: { color: "#ff0000", backgroundColor: "#ffff00", borderRadius: 4, fontWeight: 800 },
    },
  } as Partial<FeatureStyleProfile>);
  const css = buildFeatureStyleCss(profile);
  expect(css).toContain("strong, b");
  expect(css).toContain("color: #ff0000");
  expect(css).toContain("font-weight: 800");
});
```

- [ ] **Step 5: 运行测试并提交**

---

### Task 11: 扩展 `imageRadius` 特性（合并 imageEnhance）

**Files:**
- Modify: `src/lib/feature-style-definitions.ts`
- Modify: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1: 编写扩展测试**

```typescript
it("imageRadius — 扩展：阴影和悬停效果", () => {
  const profile = normalizeFeatureProfile({
    imageRadius: {
      enabled: true,
      values: {
        radius: 8,
        shadow: "medium",
        hoverZoom: "slight",
        maxWidth: "80%",
        borderColor: "#cccccc",
        borderWidth: 1,
      },
    },
  } as Partial<FeatureStyleProfile>);
  const css = buildFeatureStyleCss(profile);
  expect(css).toContain("border-radius: 8px");
  expect(css).toContain("box-shadow");
  expect(css).toContain("transform: scale(1.02)");
  expect(css).toContain("max-width: 80%");
  expect(css).toContain("border: 1px");
});
```

- [ ] **Step 2: 修改 imageRadius 定义**

在 `feature-style-definitions.ts` 中找到 `imageRadius` 定义，扩展其 `controls` 和 `buildCss`：

```typescript
// 替换原有的 imageRadius 定义
{
  value: "imageRadius",
  label: "图片增强",
  hint: "自定义图片圆角、阴影、悬停缩放、最大宽度和边框",
  preview: "🖼️",
  risk: "正文安全",
  controls: [
    { key: "radius", label: "圆角", type: "number", min: 0, max: 24, step: 1, unit: "px", slider: true },
    {
      key: "shadow", label: "阴影", type: "select",
      options: [
        { label: "无", value: "none" },
        { label: "轻微", value: "light" },
        { label: "中等", value: "medium" },
        { label: "强", value: "strong" },
      ],
    },
    {
      key: "hoverZoom", label: "悬停效果", type: "select",
      options: [
        { label: "无", value: "none" },
        { label: "轻微放大", value: "slight" },
        { label: "明显放大", value: "obvious" },
      ],
    },
    {
      key: "maxWidth", label: "最大宽度", type: "select",
      options: [
        { label: "自动", value: "auto" },
        { label: "80%", value: "80%" },
        { label: "100%", value: "100%" },
      ],
    },
    { key: "borderColor", label: "边框颜色", type: "color" },
    { key: "borderWidth", label: "边框粗细", type: "number", min: 0, max: 4, step: 1, unit: "px" },
  ],
  defaults: createDefaultConfig({
    radius: 6,
    shadow: "none",
    hoverZoom: "none",
    maxWidth: "auto",
    borderColor: "#cccccc",
    borderWidth: 0,
  }),
  buildCss: config => {
    const radius = px(config.values.radius, 6);
    const shadow = stringValue(config.values.shadow, "none");
    const hoverZoom = stringValue(config.values.hoverZoom, "none");
    const maxWidth = stringValue(config.values.maxWidth, "auto");
    const borderColor = stringValue(config.values.borderColor, "#cccccc");
    const borderWidth = numberValue(config.values.borderWidth, 0);

    const SHADOW_MAP: Record<string, string> = {
      none: "none",
      light: "0 2px 8px rgba(0,0,0,0.08)",
      medium: "0 4px 16px rgba(0,0,0,0.12)",
      strong: "0 8px 32px rgba(0,0,0,0.18)",
    };
    const ZOOM_MAP: Record<string, string> = {
      none: "",
      slight: "transform: scale(1.02);",
      obvious: "transform: scale(1.08);",
    };

    const maxW = maxWidth === "auto" ? "" : `max-width: ${maxWidth} !important;`;
    const border = borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor} !important;` : "";

    let css = `.protyle-wysiwyg img {
  border-radius: ${radius} !important;
  box-shadow: ${SHADOW_MAP[shadow]} !important;
  ${maxW}
  ${border}
  transition: transform 200ms ease, box-shadow 200ms ease !important;
}`;

    if (ZOOM_MAP[hoverZoom]) {
      css += `\n\n.protyle-wysiwyg img:hover {
  ${ZOOM_MAP[hoverZoom]}
}`;
    }

    return css;
  },
},
```

- [ ] **Step 3: 运行测试并提交**

---

### Task 12: 新增 `tabBarStyle` 特性

**Files:** 同上三文件模式

- [ ] **Step 1–4: 实现 tabBarStyle**

```typescript
{
  value: "tabBarStyle",
  label: "页签栏样式",
  hint: "自定义页签高度、字号和活动指示器",
  preview: "📑",
  risk: "全屋改造",
  controls: [
    { key: "height", label: "页签高度", type: "number", min: 28, max: 44, step: 1, unit: "px", slider: true },
    { key: "fontSize", label: "字号", type: "number", min: 11, max: 16, step: 1, unit: "px" },
    {
      key: "activeIndicator", label: "活动指示器", type: "select",
      options: [
        { label: "底线", value: "border" },
        { label: "背景", value: "background" },
        { label: "无", value: "none" },
      ],
    },
    { key: "indicatorColor", label: "指示器颜色", type: "color" },
    { key: "backgroundColor", label: "背景色", type: "color" },
  ],
  defaults: createDefaultConfig({
    height: 32,
    fontSize: 13,
    activeIndicator: "border",
    indicatorColor: "#4C8BF5",
    backgroundColor: "transparent",
  }),
  buildCss: config => {
    const height = px(config.values.height, 32);
    const fontSize = px(config.values.fontSize, 13);
    const indicator = stringValue(config.values.activeIndicator, "border");
    const indicatorColor = stringValue(config.values.indicatorColor, "#4C8BF5");
    const bgColor = stringValue(config.values.backgroundColor, "transparent");

    let indicatorCss = "";
    if (indicator === "border") {
      indicatorCss = `.layout-tab-bar .item--focus { border-bottom: 2px solid ${indicatorColor} !important; }`;
    } else if (indicator === "background") {
      indicatorCss = `.layout-tab-bar .item--focus { background: ${indicatorColor}22 !important; }`;
    }

    return `.layout-tab-bar {
  height: ${height} !important;
  background: ${bgColor} !important;
}

.layout-tab-bar .item {
  font-size: ${fontSize} !important;
}

${indicatorCss}`;
  },
},
```

测试：
```typescript
it("tabBarStyle — 页签栏样式", () => {
  const profile = normalizeFeatureProfile({
    tabBarStyle: { enabled: true, values: { height: 36, fontSize: 14, activeIndicator: "background", indicatorColor: "#ff0000", backgroundColor: "#f5f5f5" } },
  } as Partial<FeatureStyleProfile>);
  const css = buildFeatureStyleCss(profile);
  expect(css).toContain(".layout-tab-bar");
  expect(css).toContain("height: 36px");
  expect(css).toContain("font-size: 14px");
});
```

- [ ] **Step 5: 运行测试并提交**

---

### Task 13: 新增 `breadcrumbStyle` 特性

```typescript
{
  value: "breadcrumbStyle",
  label: "面包屑样式",
  hint: "自定义面包屑文字颜色、背景和字号",
  preview: "🧭",
  risk: "全屋改造",
  controls: [
    { key: "textColor", label: "文字颜色", type: "color" },
    { key: "backgroundColor", label: "背景色", type: "color" },
    { key: "separatorColor", label: "分隔符颜色", type: "color" },
    { key: "fontSize", label: "字号", type: "number", min: 11, max: 14, step: 1, unit: "px" },
  ],
  defaults: createDefaultConfig({
    textColor: "#666666",
    backgroundColor: "transparent",
    separatorColor: "#999999",
    fontSize: 12,
  }),
  buildCss: config => {
    const textColor = stringValue(config.values.textColor, "#666666");
    const bgColor = stringValue(config.values.backgroundColor, "transparent");
    const sepColor = stringValue(config.values.separatorColor, "#999999");
    const fontSize = px(config.values.fontSize, 12);

    return `.protyle-breadcrumb {
  color: ${textColor} !important;
  background-color: ${bgColor} !important;
  font-size: ${fontSize} !important;
}

.protyle-breadcrumb .protyle-breadcrumb__separator {
  color: ${sepColor} !important;
}`;
  },
},
```

---

### Task 14: 新增 `dockStyle` 特性

```typescript
{
  value: "dockStyle",
  label: "停靠栏样式",
  hint: "自定义停靠栏图标大小、背景色和宽度",
  preview: "📌",
  risk: "全屋改造",
  controls: [
    { key: "iconSize", label: "图标大小", type: "number", min: 16, max: 28, step: 1, unit: "px", slider: true },
    { key: "backgroundColor", label: "背景色", type: "color" },
    { key: "hoverColor", label: "悬停颜色", type: "color" },
    { key: "width", label: "宽度", type: "number", min: 36, max: 56, step: 2, unit: "px", slider: true },
  ],
  defaults: createDefaultConfig({
    iconSize: 20,
    backgroundColor: "transparent",
    hoverColor: "#e8e8e8",
    width: 40,
  }),
  buildCss: config => {
    const iconSize = px(config.values.iconSize, 20);
    const bgColor = stringValue(config.values.backgroundColor, "transparent");
    const hoverColor = stringValue(config.values.hoverColor, "#e8e8e8");
    const width = px(config.values.width, 40);

    return `.dock {
  background: ${bgColor} !important;
  width: ${width} !important;
}

.dock__item {
  width: ${iconSize} !important;
  height: ${iconSize} !important;
}

.dock__item:hover {
  background: ${hoverColor} !important;
}`;
  },
},
```

---

## 阶段四：特性分组与预设系统

### Task 15: 新增 `group` 字段支持

**Files:**
- Modify: `src/lib/feature-style-types.ts`
- Modify: `src/lib/feature-style-definitions.ts`（所有特性加 group）
- Modify: `src/components/StyleEditorShell/FeatureSection.vue`（按 group 分组渲染）

- [ ] **Step 1: 扩展类型**

在 `src/lib/feature-style-types.ts` 中为 `FeatureStyleOption` 添加 `group` 字段：

```typescript
export interface FeatureStyleOption {
  controls: FeatureStyleControl[];
  group?: string;
  hint: string;
  label: string;
  preview: string;
  risk: "正文安全" | "全屋改造";
  value: FeatureStyleId;
}
```

- [ ] **Step 2: 为所有特性添加 group 标注**

在 `feature-style-definitions.ts` 中为每个特性定义添加 `group` 字段：

**正文安全分组：**
- "排版": `typographyBase`, `fontFamily`, `headingSpacing`, `headingDecoration`, `headingNumbering`
- "行内元素": `markStyle`, `inlineCodeStyle`, `boldTextStyle`, `linkStyle`, `blockRefStyle`, `underlineStyle`, `strikethroughStyle`
- "块级元素": `paragraphHover`, `foldedBlockStyle`, `blockquoteFrame`, `codeBlockStyle`, `tableStyle`, `hrStyle`, `imageRadius`
- "列表": `taskListStyle`, `orderedListStyle`, `unorderedListMarkerColor`, `listBulletLine`, `listMarkerStyle`
- "引用与链接": `referencedBlockCorners`, `refcountBadge`, `refSearchMenu`, `backlinkSticky`

**全屋改造分组：**
- "文档外观": `documentTitle`, `headImage`, `docTag`, `editorBackground`, `editorWidth`
- "导航与面板": `docTreeColorBlocks`, `outlineNumber`, `breadcrumbStyle`, `dockStyle`, `searchPanel`
- "操作界面": `topBarStyle`, `tabBarStyle`, `blockGutterAnim`, `toolbarStyle`, `slashMenu`, `emojiPanel`
- "系统元素": `scrollbarStyle`

- [ ] **Step 3: 更新 FeatureSection 按 group 分组渲染**

修改 `FeatureSection.vue` 的 `filteredOptions` 为按 group 分组：

```typescript
const groupedOptions = computed(() => {
  const groups = new Map<string, FeatureStyleOption[]>();
  for (const opt of filteredOptions.value) {
    const group = opt.group || "其他";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(opt);
  }
  return groups;
});
```

模板中渲染分组：
```vue
<div v-for="[groupName, features] in groupedOptions" :key="groupName" class="feature-group">
  <h4 class="feature-group__title">{{ groupName }}</h4>
  <div class="feature-grid">
    <article v-for="feature in features" :key="feature.value" ...>
      <!-- 现有卡片内容 -->
    </article>
  </div>
</div>
```

- [ ] **Step 4: 更新测试并提交**

---

### Task 16: 特性配置预设系统（远期占位）

此任务涉及思源 API 文件读写，复杂度较高。先实现数据结构和 UI 占位，实际存储逻辑后续迭代。

- [ ] **Step 1: 定义预设数据结构**

在 `src/lib/feature-style-types.ts` 中新增：

```typescript
export interface StylePreset {
  id: string;
  name: string;
  createdAt: string;
  profile: Record<string, { color: string; backgroundColor: string }>;
  featureProfile: FeatureStyleProfile;
}
```

- [ ] **Step 2: 在 WorkspaceHero 中添加预设按钮占位**

后续迭代实现完整功能。

- [ ] **Step 3: 提交**

```bash
git commit -m "feat: 新增 StylePreset 类型定义，预设系统数据结构就绪"
```

---

## 阶段五：锦上添花

### Task 17: 新增 `searchHighlight` 特性

```typescript
{
  value: "searchHighlight",
  label: "搜索高亮色",
  hint: "自定义搜索匹配项和当前匹配项的高亮颜色",
  preview: "🔍",
  risk: "全屋改造",
  controls: [
    { key: "matchColor", label: "匹配项颜色", type: "color" },
    { key: "currentMatchColor", label: "当前匹配颜色", type: "color" },
    { key: "matchBorderRadius", label: "高亮圆角", type: "number", min: 0, max: 4, step: 1, unit: "px" },
  ],
  defaults: createDefaultConfig({
    matchColor: "#fff3a8",
    currentMatchColor: "#ff9632",
    matchBorderRadius: 2,
  }),
  buildCss: config => {
    const matchColor = stringValue(config.values.matchColor, "#fff3a8");
    const currentColor = stringValue(config.values.currentMatchColor, "#ff9632");
    const radius = px(config.values.matchBorderRadius, 2);

    return `.protyle-wysiwyg mark[data-type="search-mark"] {
  background-color: ${matchColor} !important;
  border-radius: ${radius} !important;
}

.protyle-wysiwyg mark[data-type="search-mark"].search-mark--current {
  background-color: ${currentColor} !important;
}`;
  },
},
```

---

### Task 18: 新增 `dialogStyle` 特性

```typescript
{
  value: "dialogStyle",
  label: "对话框样式",
  hint: "自定义弹窗圆角、背景模糊和阴影",
  preview: "💬",
  risk: "全屋改造",
  controls: [
    { key: "borderRadius", label: "圆角", type: "number", min: 0, max: 24, step: 2, unit: "px", slider: true },
    { key: "backdropBlur", label: "背景模糊", type: "number", min: 0, max: 20, step: 1, unit: "px" },
    { key: "backdropOpacity", label: "遮罩透明度", type: "number", min: 0, max: 1, step: 0.05 },
    {
      key: "shadowIntensity", label: "阴影", type: "select",
      options: [
        { label: "无", value: "none" },
        { label: "轻", value: "light" },
        { label: "重", value: "heavy" },
      ],
    },
  ],
  defaults: createDefaultConfig({
    borderRadius: 12,
    backdropBlur: 8,
    backdropOpacity: 0.5,
    shadowIntensity: "light",
  }),
  buildCss: config => {
    const radius = px(config.values.borderRadius, 12);
    const blur = px(config.values.backdropBlur, 8);
    const opacity = numberValue(config.values.backdropOpacity, 0.5);
    const shadow = stringValue(config.values.shadowIntensity, "light");

    const SHADOW_MAP: Record<string, string> = {
      none: "none",
      light: "0 8px 32px rgba(0,0,0,0.12)",
      heavy: "0 16px 64px rgba(0,0,0,0.24)",
    };

    return `.b3-dialog__container {
  border-radius: ${radius} !important;
  box-shadow: ${SHADOW_MAP[shadow]} !important;
}

.b3-dialog__scrim {
  backdrop-filter: blur(${blur}) !important;
  -webkit-backdrop-filter: blur(${blur}) !important;
  background-color: rgba(0, 0, 0, ${opacity}) !important;
}`;
  },
},
```

---

### Task 19: 新增 `listMarkerStyle` 特性

```typescript
{
  value: "listMarkerStyle",
  label: "列表标记样式",
  hint: "自定义列表标记形状和列表项间距",
  preview: "📋",
  risk: "正文安全",
  controls: [
    {
      key: "unorderedStyle", label: "无序标记", type: "select",
      options: [
        { label: "默认", value: "default" },
        { label: "实心圆", value: "disc" },
        { label: "空心圆", value: "circle" },
        { label: "方块", value: "square" },
      ],
    },
    {
      key: "orderedStyle", label: "有序编号", type: "select",
      options: [
        { label: "默认", value: "default" },
        { label: "罗马数字", value: "upper-roman" },
        { label: "中文数字", value: "cjk" },
      ],
    },
    { key: "itemSpacing", label: "列表项间距", type: "number", min: 0, max: 12, step: 1, unit: "px", slider: true },
    { key: "indentation", label: "嵌套缩进", type: "number", min: 16, max: 40, step: 2, unit: "px" },
  ],
  defaults: createDefaultConfig({
    unorderedStyle: "default",
    orderedStyle: "default",
    itemSpacing: 4,
    indentation: 24,
  }),
  buildCss: config => {
    const unordered = stringValue(config.values.unorderedStyle, "default");
    const ordered = stringValue(config.values.orderedStyle, "default");
    const spacing = px(config.values.itemSpacing, 4);
    const indent = px(config.values.indentation, 24);

    const rules: string[] = [];

    if (unordered !== "default") {
      rules.push(`.protyle-wysiwyg .li > [data-type="NodeList"] > .li { list-style-type: ${unordered} !important; }`);
    }

    if (ordered === "upper-roman") {
      rules.push(`.protyle-wysiwyg [data-subtype="o"] > .li { list-style-type: upper-roman !important; }`);
    } else if (ordered === "cjk") {
      rules.push(`.protyle-wysiwyg [data-subtype="o"] > .li { list-style-type: cjk-ideographic !important; }`);
    }

    rules.push(`.protyle-wysiwyg .li { margin-bottom: ${spacing} !important; }`);
    rules.push(`.protyle-wysiwyg [data-node-id].li > [data-node-id] { margin-left: ${indent} !important; }`);

    return rules.join("\n");
  },
},
```

---

## 阶段六：测试与文档

### Task 20: 补充全量测试

**Files:**
- Modify: `src/lib/style-feature-catalog.test.ts`

- [ ] **Step 1: 为每个新特性编写 CSS 输出测试**

在 `style-feature-catalog.test.ts` 中为以下特性各添加一个 `it()` 块：
- `editorWidth`, `fontFamily`, `topBarStyle`, `scrollbarStyle`, `codeBlockStyle`
- `boldTextStyle`, `tabBarStyle`, `breadcrumbStyle`, `dockStyle`
- `searchHighlight`, `dialogStyle`, `listMarkerStyle`

每个测试遵循已有模式：
1. 构造 `normalizeFeatureProfile({ featureId: { enabled: true, values: {...} } })`
2. 调用 `buildFeatureStyleCss(profile)`
3. 断言 CSS 包含预期选择器和属性值

- [ ] **Step 2: 更新分组过滤测试**

验证新增特性出现在正确的 `BODY_SAFE_FEATURE_OPTIONS` 或 `EDITOR_UI_FEATURE_OPTIONS` 中。

- [ ] **Step 3: 运行全量测试**

Run: `npm test`
Expected: 全部通过

- [ ] **Step 4: 提交**

```bash
git add src/lib/style-feature-catalog.test.ts
git commit -m "test: 为所有新增特性补充 CSS 输出断言和分组过滤测试"
```

---

### Task 21: 更新文档

- [ ] **Step 1: 运行构建确认无错误**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 2: 更新 `docs/project-structure.md`（如存在）**

反映新文件结构（FeatureSection 替代 FeatureStudio + EditorUiStudio）。

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "docs: 更新项目结构文档，反映组件重构和新增特性"
```
