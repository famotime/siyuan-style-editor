<template>
  <section
    ref="featureSectionRef"
    class="feature-section"
  >
    <div class="feature-section__header">
      <div>
        <h2 class="section-heading__title" :data-tooltip="`${kicker} — ${enabledCount}/${totalCount} 已启用`">
          {{ title }}
        </h2>
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
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div
      v-show="!collapsed"
      class="feature-section__body"
    >
      <div class="feature-search">
        <input
          v-model="searchQuery"
          type="text"
          class="feature-search__input"
          placeholder="搜索特性..."
        >
      </div>

      <div
        v-for="[groupName, features] in groupedOptions"
        :key="groupName"
        class="feature-group"
      >
        <h4 class="feature-group__title">
          {{ groupName }}
        </h4>
        <div class="feature-grid">
          <article
            v-for="feature in features"
            :key="feature.value"
            class="feature-card"
            :class="{ 'feature-card--enabled': featureProfile[feature.value].enabled }"
            :data-feature-id="feature.value"
          >
            <div class="feature-card__top">
              <div class="feature-card__copy">
                <h3
                  class="feature-card__title"
                  :data-tooltip="feature.preview || feature.hint ? [feature.preview, feature.hint].filter(Boolean).join(' — ') : undefined"
                >
                  {{ feature.label }}
                </h3>
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

                <div
                  v-if="control.type === 'color'"
                  class="feature-control__color-group"
                >
                  <input
                    type="color"
                    class="feature-control__color"
                    :value="getColorControlValue(feature.value, control.key)"
                    @input="handleControlInput(feature.value, control.key, $event)"
                  >
                  <input
                    type="text"
                    class="feature-control__color-text"
                    :value="getColorControlValue(feature.value, control.key)"
                    @input="handleControlInput(feature.value, control.key, $event)"
                  >
                </div>

                <div
                  v-else-if="control.type === 'number' && control.slider"
                  class="feature-control__number-group"
                >
                  <input
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

                <input
                  v-else-if="control.type === 'number'"
                  type="number"
                  class="feature-control__number"
                  :min="control.min"
                  :max="control.max"
                  :step="control.step"
                  :value="featureProfile[feature.value].values[control.key]"
                  @input="handleControlInput(feature.value, control.key, $event)"
                >

                <input
                  v-else-if="control.type === 'text'"
                  type="text"
                  class="feature-control__text"
                  :placeholder="control.placeholder"
                  :value="featureProfile[feature.value].values[control.key]"
                  @input="handleControlInput(feature.value, control.key, $event)"
                >

                <select
                  v-else
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
              </label>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  PanelThemeAppearance,
} from "@/lib/panel-theme"
import type {
  FeatureStyleId,
  FeatureStyleOption,
  FeatureStyleProfile,
} from "@/lib/style-feature-catalog"
import { resolveColorPickerValue } from "@/lib/custom-color"

import {
  computed,
  onMounted,
  nextTick,
  ref,
  watch,
} from "vue"

const props = defineProps<{
  featureProfile: FeatureStyleProfile
  featureStyleOptions: FeatureStyleOption[]
  kicker: string
  themeAppearance?: PanelThemeAppearance
  title: string
}>()
const emit = defineEmits<{
  "update-feature-style": [
    featureId: FeatureStyleId,
    config: {
      enabled?: boolean
      values?: Record<string, string | number | boolean>
    },
  ]
}>()
const collapsed = ref(true)
const featureSectionRef = ref<HTMLElement | null>(null)
const colorControlRenderTick = ref(0)
const searchQuery = ref("")

onMounted(() => {
  void nextTick(() => {
    colorControlRenderTick.value += 1
  })
})

watch(() => props.themeAppearance, () => {
  colorControlRenderTick.value += 1
})

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.featureStyleOptions
  }

  const query = searchQuery.value.toLowerCase()
  return props.featureStyleOptions.filter((option) =>
    option.label.toLowerCase().includes(query)
    || option.hint.toLowerCase().includes(query),
  )
})

const groupedOptions = computed(() => {
  const groups = new Map<string, FeatureStyleOption[]>()
  for (const opt of filteredOptions.value) {
    const group = opt.group || "其他"
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push(opt)
  }
  return groups
})

const enabledCount = computed(() =>
  props.featureStyleOptions.filter((option) => props.featureProfile[option.value].enabled).length,
)

const totalCount = computed(() => props.featureStyleOptions.length)

function handleEnabledChange(featureId: FeatureStyleId, event: Event) {
  const input = event.target as HTMLInputElement
  emit("update-feature-style", featureId, {
    enabled: input.checked,
  })
}

function parseInputValue(event: Event) {
  const input = event.target as HTMLInputElement | HTMLSelectElement
  if (input instanceof HTMLInputElement && (input.type === "number" || input.type === "range")) {
    return Number(input.value)
  }

  return input.value
}

function handleControlInput(featureId: FeatureStyleId, key: string, event: Event) {
  emit("update-feature-style", featureId, {
    values: {
      [key]: parseInputValue(event),
    },
  })
}

function getColorControlValue(featureId: FeatureStyleId, key: string) {
  void colorControlRenderTick.value
  const value = props.featureProfile[featureId].values[key]
  const channel = key.toLowerCase().includes("bg") || key.toLowerCase().includes("background")
    ? "backgroundColor"
    : "color"
  return typeof value === "string" ? resolveColorPickerValue(value, channel, featureSectionRef.value) : "#888888"
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

.section-heading__title {
  position: relative;
  margin: 0;
  font-size: 20px;
  line-height: 1.1;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  color: var(--panel-text);
  cursor: help;
}

.section-heading__title[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-2px);
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--panel-text);
  color: var(--panel-card-bg);
  font-size: 11px;
  font-weight: 500;
  font-family: system-ui, sans-serif;
  line-height: 1.4;
  white-space: nowrap;
  z-index: 100;
  transition: opacity 140ms ease, transform 140ms ease;
}

.section-heading__title[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateY(0);
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

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.feature-section__body {
  display: grid;
  gap: 12px;
}

.feature-group:not(:first-of-type) {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--panel-divider);
}

.feature-group__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: var(--panel-text);
  letter-spacing: 0.04em;
}

.feature-group__title::before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 12px;
  border-radius: 1.5px;
  background-color: var(--panel-accent);
}

.feature-search {
  margin-bottom: 4px;
}

.feature-search__input {
  width: 100%;
  padding: 8px 12px;
  box-sizing: border-box;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 10px;
  background: var(--panel-card-bg);
  color: var(--panel-text);
  font: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 160ms ease;
}

.feature-search__input:focus {
  border-color: var(--panel-accent);
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

.feature-card__title {
  position: relative;
  margin: 0;
  color: var(--panel-text);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  cursor: help;
}

.feature-card__title[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 0;
  top: calc(100% + 4px);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-2px);
  padding: 5px 8px;
  border-radius: 6px;
  background: var(--panel-text);
  color: var(--panel-card-bg);
  font-size: 11px;
  font-weight: 500;
  font-family: system-ui, sans-serif;
  line-height: 1.3;
  white-space: nowrap;
  z-index: 100;
  transition: opacity 140ms ease, transform 140ms ease;
}

.feature-card__title[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateY(0);
}


.feature-card__controls {
  display: grid;
  gap: 8px;
}

.feature-control {
  display: grid;
  grid-template-columns: minmax(70px, 1fr) minmax(0, 105px);
  align-items: center;
  gap: 8px;
}

.feature-control__label {
  color: var(--panel-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.feature-control__color-group {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 4px;
  align-items: center;
}

.feature-control__color,
.feature-control__number,
.feature-control__select,
.feature-control__text {
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

.feature-control__color-text {
  width: 100%;
  min-height: 30px;
  box-sizing: border-box;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 10px;
  background: var(--panel-card-bg);
  color: var(--panel-text);
  font: inherit;
  font-size: 12px;
  padding: 0 8px;
}

.feature-control__number,
.feature-control__select,
.feature-control__text {
  padding: 0 8px;
}

.feature-control__number-group {
  display: grid;
  grid-template-columns: 1fr 60px;
  gap: 4px;
  align-items: center;
}

.feature-control__range {
  width: 100%;
  height: 30px;
  box-sizing: border-box;
  border: none;
  background: transparent;
  color: var(--panel-accent);
  cursor: pointer;
}
</style>
