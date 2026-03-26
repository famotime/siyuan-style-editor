<template>
  <header class="workspace-hero">
    <div class="workspace-hero__copy">
      <p class="style-editor-shell__eyebrow">
        Live Document Styling
      </p>
      <h1 class="style-editor-shell__title">
        文档样式编辑器
      </h1>
      <p class="workspace-hero__summary">
        以更轻的操作路径调整对象文字色与背景色，提取、清除与即时预览统一在一个编辑台里。
      </p>
      <div class="workspace-hero__actions">
        <button
          type="button"
          class="extract-styles-button"
          @click="emit('extract')"
        >
          提取样式
        </button>
        <button
          type="button"
          class="reset-styles-button"
          @click="emit('reset')"
        >
          清除样式
        </button>
        <button
          type="button"
          class="export-styles-button"
          @click="emit('export')"
        >
          导出样式
        </button>
        <button
          type="button"
          class="import-styles-button"
          @click="emit('open-import')"
        >
          导入样式
        </button>
      </div>
      <p class="workspace-hero__status">
        {{ statusCopy }}
      </p>
      <input
        :ref="setImportFileInputRef"
        type="file"
        accept=".json,application/json"
        class="workspace-hero__file-input"
        @change="emit('import-change', $event)"
      >
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  setImportFileInputRef: (element: Element | null) => void;
  statusCopy: string;
}>();

const emit = defineEmits<{
  "import-change": [event: Event];
  "open-import": [];
  extract: [];
  export: [];
  reset: [];
}>();
</script>

<style scoped lang="scss">
.workspace-hero {
  position: relative;
  display: grid;
  gap: 8px;
  padding: 2px 2px 0;
}

.workspace-hero__copy {
  display: grid;
  align-content: start;
  gap: 6px;
  max-width: 540px;
}

.workspace-hero__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 4px;
}

.workspace-hero__summary,
.workspace-hero__status {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--panel-text-subtle);
}

.style-editor-shell__eyebrow {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--panel-text-subtle);
}

.style-editor-shell__title {
  margin: 0;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  font-size: 28px;
  line-height: 1.02;
  letter-spacing: 0.03em;
  color: var(--panel-text);
}

.extract-styles-button,
.export-styles-button,
.import-styles-button,
.reset-styles-button {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.extract-styles-button {
  border: 1px solid var(--panel-accent-outline);
  background: var(--panel-chip-active-bg);
  color: var(--panel-accent);
}

.export-styles-button {
  border: 1px solid color-mix(in srgb, var(--panel-text) 18%, var(--panel-card-stroke) 82%);
  background: color-mix(in srgb, var(--panel-card-bg) 68%, var(--panel-glass) 32%);
  color: var(--panel-text);
}

.import-styles-button {
  border: 1px solid color-mix(in srgb, var(--panel-accent) 18%, var(--panel-card-stroke) 82%);
  background: color-mix(in srgb, var(--panel-toolbar-bg) 82%, var(--panel-glass) 18%);
  color: color-mix(in srgb, var(--panel-accent) 70%, var(--panel-text) 30%);
}

.reset-styles-button {
  border: 1px solid color-mix(in srgb, var(--b3-card-error-color) 38%, var(--panel-card-stroke) 62%);
  background: color-mix(in srgb, var(--b3-card-error-background) 30%, var(--panel-pill-bg) 70%);
  color: color-mix(in srgb, var(--b3-card-error-color) 78%, var(--panel-text) 22%);
}

.extract-styles-button:hover,
.export-styles-button:hover,
.import-styles-button:hover,
.reset-styles-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.workspace-hero__file-input {
  display: none;
}

@media (max-width: 720px) {
  .workspace-hero__actions {
    grid-template-columns: 1fr;
  }
}
</style>
