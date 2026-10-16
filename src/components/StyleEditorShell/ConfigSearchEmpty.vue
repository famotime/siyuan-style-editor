<template>
  <div class="config-search-empty">
    <div
      class="config-search-empty__icon"
      aria-hidden="true"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="11"
          cy="11"
          r="7"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 20L16 16"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9 11H13"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <p class="config-search-empty__text">
      {{ t("noMatchingConfigs") }}
    </p>
    <button
      type="button"
      class="config-search-empty__btn"
      @click="emit('clear')"
    >
      {{ t("clearSearch") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { t } from "@/style-editor-runtime"

const emit = defineEmits<{
  clear: []
}>()
</script>

<style scoped lang="scss">
.config-search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 36px 16px;
  border: 1px dashed var(--panel-card-inner-stroke);
  border-radius: 16px;
  background: color-mix(in srgb, var(--panel-card-bg) 60%, transparent 40%);
  color: var(--panel-text-subtle);
  text-align: center;
}

.config-search-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--panel-pill-bg) 60%, transparent 40%);
  color: var(--panel-text-subtle);
}

.config-search-empty__text {
  margin: 0;
  font-size: 13px;
  color: var(--panel-text-muted);
}

.config-search-empty__btn {
  padding: 6px 14px;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 8px;
  background: var(--panel-chip-active-bg);
  color: var(--panel-text);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease;
}

.config-search-empty__btn:hover {
  border-color: var(--panel-accent);
  background: color-mix(in srgb, var(--panel-accent) 20%, transparent);
}
</style>
