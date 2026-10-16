<template>
  <div class="config-search-bar">
    <span
      class="config-search-bar__icon"
      aria-hidden="true"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14 14L11.1 11.1"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>

    <input
      ref="inputRef"
      type="text"
      class="config-search-bar__input"
      :value="modelValue"
      :placeholder="t('searchConfigPlaceholder')"
      @input="handleInput"
      @keydown.esc="handleEsc"
    >

    <button
      v-if="modelValue"
      type="button"
      class="config-search-bar__clear"
      :aria-label="t('clearSearch')"
      :title="t('clearSearch')"
      @click="clear"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { t } from "@/style-editor-runtime"

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit("update:modelValue", value)
}

function handleEsc() {
  emit("update:modelValue", "")
  inputRef.value?.blur()
}

function clear() {
  emit("update:modelValue", "")
  inputRef.value?.focus()
}
</script>

<style scoped lang="scss">
.config-search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.config-search-bar__icon {
  position: absolute;
  left: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--panel-text-subtle);
  pointer-events: none;
  transition: color 160ms ease;
}

.config-search-bar__input {
  width: 100%;
  height: 38px;
  padding: 0 34px 0 36px;
  box-sizing: border-box;
  border: 1px solid var(--panel-card-inner-stroke);
  border-radius: 12px;
  background: color-mix(in srgb, var(--panel-card-bg) 85%, transparent 15%);
  color: var(--panel-text);
  font: inherit;
  font-size: 13px;
  line-height: 1;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
}

.config-search-bar__input::placeholder {
  color: var(--panel-text-subtle);
  opacity: 0.8;
}

.config-search-bar__input:focus {
  border-color: var(--panel-accent);
  background: var(--panel-card-bg);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.08),
    0 0 0 3px color-mix(in srgb, var(--panel-accent) 20%, transparent);
}

.config-search-bar:focus-within .config-search-bar__icon {
  color: var(--panel-accent);
}

.config-search-bar__clear {
  position: absolute;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: color-mix(in srgb, var(--panel-text-subtle) 22%, transparent);
  color: var(--panel-text-muted);
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease;
}

.config-search-bar__clear:hover {
  background: color-mix(in srgb, var(--panel-accent) 30%, transparent);
  color: var(--panel-text);
}
</style>
