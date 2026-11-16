<template>
  <h2
    class="section-heading__title"
    :class="{ 'section-heading__title--wrap-tooltip': wrapTooltip }"
    :data-tooltip="titleTooltip"
  >
    {{ title }}
  </h2>
  <slot name="actions" />
  <button
    type="button"
    class="panel-collapse-btn"
    :aria-label="collapsed ? t('expandPanel') : t('collapsePanel')"
    :title="collapsed ? t('expandPanel') : t('collapsePanel')"
    @click="emit('toggle')"
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
</template>

<script setup lang="ts">
import { t } from "@/style-editor-runtime"

withDefaults(
  defineProps<{
    collapsed: boolean
    title: string
    titleTooltip?: string
    wrapTooltip?: boolean
  }>(),
  {
    titleTooltip: undefined,
    wrapTooltip: false,
  },
)

const emit = defineEmits<{
  toggle: []
}>()
</script>

<style scoped lang="scss">
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

.section-heading__title--wrap-tooltip[data-tooltip]::after {
  white-space: normal;
  max-width: 260px;
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
</style>
