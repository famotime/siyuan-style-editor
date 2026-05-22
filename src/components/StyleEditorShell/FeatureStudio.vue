<template>
  <section class="feature-studio">
    <div class="feature-studio__header">
      <div>
        <p class="section-heading__kicker">
          Style Modules
        </p>
        <h2 class="section-heading__title">
          功能样式
        </h2>
      </div>
    </div>

    <div class="feature-grid">
      <article
        v-for="feature in featureStyleOptions"
        :key="feature.value"
        class="feature-card"
        :class="{ 'feature-card--enabled': featureProfile[feature.value].enabled }"
        :data-feature-id="feature.value"
      >
        <div class="feature-card__top">
          <div class="feature-card__copy">
            <span class="feature-card__risk">{{ feature.risk }}</span>
            <h3 class="feature-card__title">
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

        <div
          class="feature-card__preview"
          :style="getPreviewStyle(feature.value)"
        >
          {{ feature.preview }}
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

            <input
              v-if="control.type === 'color'"
              type="color"
              class="feature-control__color"
              :value="getColorControlValue(feature.value, control.key)"
              @input="handleControlInput(feature.value, control.key, $event)"
            >

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
  </section>
</template>

<script setup lang="ts">
import type {
  FeatureStyleId,
  FeatureStyleOption,
  FeatureStyleProfile,
} from "@/lib/style-feature-catalog";

const props = defineProps<{
  featureProfile: FeatureStyleProfile;
  featureStyleOptions: FeatureStyleOption[];
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

function getPreviewStyle(featureId: FeatureStyleId) {
  const config = props.featureProfile[featureId];
  const values = config.values;
  const style: Record<string, string> = {};

  if (!config.enabled) {
    return style;
  }

  if (featureId === "imageRadius") {
    style.borderRadius = `${values.radius}px`;
  }
  if (featureId === "linkStyle") {
    style.color = String(values.color);
    style.borderBottom = `1px ${values.lineStyle} currentColor`;
  }
  if (featureId === "blockquoteFrame") {
    style.boxShadow = `inset 0 0 0 2px ${values.borderColor}`;
    style.borderLeft = `4px solid ${values.lineColor}`;
  }
  if (featureId === "tableStyle") {
    style.backgroundColor = String(values.headerBackgroundColor);
    style.color = String(values.headerColor);
  }
  if (featureId === "paragraphHover") {
    style.backgroundColor = String(values.backgroundColor);
  }
  if (featureId === "underlineStyle") {
    style.borderBottom = `${values.thickness}px ${values.lineStyle} ${values.color}`;
  }
  if (featureId === "strikethroughStyle") {
    style.textDecoration = `line-through ${values.lineStyle} ${values.color}`;
  }
  if (featureId === "taskListStyle") {
    style.opacity = String(values.doneOpacity);
    style.color = String(values.doneColor);
  }

  return style;
}
</script>

<style scoped lang="scss">
.feature-studio {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid var(--panel-divider);
  background: var(--panel-toolbar-bg);
  box-shadow: var(--panel-toolbar-shadow);
}

.feature-studio__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.section-heading__kicker {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--panel-text-subtle);
}

.section-heading__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.1;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  color: var(--panel-text);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  justify-content: space-between;
  gap: 10px;
}

.feature-card__copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.feature-card__risk {
  width: fit-content;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--panel-chip-active-bg);
  color: var(--panel-accent);
  font-size: 10px;
  font-weight: 700;
}

.feature-card__title {
  margin: 0;
  color: var(--panel-text);
  font-size: 14px;
  line-height: 1.25;
}

.feature-card__preview {
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--panel-card-inner-stroke);
  background: var(--panel-preview-bg);
  color: var(--panel-text);
  font-size: 13px;
  font-weight: 700;
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
  font-size: 11px;
  font-weight: 700;
}

.feature-control__color,
.feature-control__number,
.feature-control__select {
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
.feature-control__select {
  padding: 0 8px;
}

@media (max-width: 720px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
