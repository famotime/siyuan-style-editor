<template>
  <section
    ref="featureSectionRef"
    class="feature-section"
  >
    <div class="feature-section__header">
      <CollapseHeader
        :collapsed="internalCollapsed"
        :title="title"
        :title-tooltip="headingTooltip"
        @toggle="toggleCollapse"
      />
    </div>

    <div
      v-show="!internalCollapsed"
      class="feature-section__body"
    >
      <div
        v-if="props.searchQuery === undefined"
        class="feature-search"
      >
        <input
          v-model="localSearchQuery"
          type="text"
          class="feature-search__input"
          :placeholder="t('searchPlaceholder')"
        >
      </div>

      <div
        v-for="[groupName, features] in groupedOptions"
        :key="groupName"
        class="feature-group"
      >
        <h4 class="feature-group__title">
          <HighlightText
            :text="t(groupName)"
            :query="effectiveSearchQuery"
          />
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
                  :data-tooltip="feature.preview || feature.hint ? [feature.preview ? t(feature.preview) : '', feature.hint ? t(feature.hint) : ''].filter(Boolean).join(' — ') : undefined"
                >
                  <HighlightText
                    :text="t(feature.label)"
                    :query="effectiveSearchQuery"
                  />
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
                  <HighlightText
                    :text="t(control.label)"
                    :query="effectiveSearchQuery"
                  />
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
                    {{ t(option.label) }}
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
import { t } from "@/style-editor-runtime"
import type {
  FeatureStyleId,
  FeatureStyleOption,
  FeatureStyleProfile,
} from "@/lib/style-feature-catalog"
import { resolveColorPickerValue } from "@/lib/custom-color"
import { matchFeatureOption } from "@/lib/config-search"
import CollapseHeader from "@/components/StyleEditorShell/CollapseHeader.vue"
import HighlightText from "@/components/StyleEditorShell/HighlightText.vue"
import { useCollapsedModel } from "@/composables/use-collapsed-model"

import {
  computed,
  onMounted,
  nextTick,
  ref,
  watch,
} from "vue"

const props = withDefaults(
  defineProps<{
    collapsed?: boolean
    featureProfile: FeatureStyleProfile
    featureStyleOptions: FeatureStyleOption[]
    kicker: string
    searchQuery?: string
    themeAppearance?: PanelThemeAppearance
    title: string
  }>(),
  {
    collapsed: true,
    searchQuery: undefined,
    themeAppearance: undefined,
  },
)
const emit = defineEmits<{
  "update:collapsed": [value: boolean]
  "update-feature-style": [
    featureId: FeatureStyleId,
    config: {
      enabled?: boolean
      values?: Record<string, string | number | boolean>
    },
  ]
}>()

const { internalCollapsed, toggleCollapse } = useCollapsedModel({
  collapsed: () => props.collapsed,
  onUpdateCollapsed: (value) => emit("update:collapsed", value),
})

const headingTooltip = computed(() =>
  t("enabledCountTip", {
    enabled: String(enabledCount.value),
    kicker: props.kicker,
    total: String(totalCount.value),
  }),
)

const featureSectionRef = ref<HTMLElement | null>(null)
const colorControlRenderTick = ref(0)
const localSearchQuery = ref("")
const effectiveSearchQuery = computed(() => {
  return props.searchQuery !== undefined ? props.searchQuery : localSearchQuery.value
})

onMounted(() => {
  void nextTick(() => {
    colorControlRenderTick.value += 1
  })
})

watch(() => props.themeAppearance, () => {
  colorControlRenderTick.value += 1
})

const filteredOptions = computed(() => {
  if (!effectiveSearchQuery.value.trim()) {
    return props.featureStyleOptions
  }

  return props.featureStyleOptions.filter((option) =>
    matchFeatureOption(option, effectiveSearchQuery.value, t),
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
