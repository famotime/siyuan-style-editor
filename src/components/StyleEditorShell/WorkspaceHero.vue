<template>
  <header class="workspace-hero">
    <div class="workspace-hero__copy">
      <p class="style-editor-shell__eyebrow">
        Live Document Styling
      </p>
      <h1 class="style-editor-shell__title">
        文档样式编辑器
      </h1>
      <p
        v-if="importedStyleSignature"
        class="workspace-hero__import-signature"
      >
        {{ importedStyleSignature }}
      </p>
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
          class="import-styles-button"
          @click="emit('open-import')"
        >
          导入样式
        </button>
        <button
          type="button"
          class="export-styles-button"
          @click="openExportForm"
        >
          导出样式
        </button>
        <button
          type="button"
          class="preview-document-button workspace-hero__preview-button"
          @click="emit('create-preview-document')"
        >
          生成样式效果预览文档
        </button>
      </div>
      <form
        v-if="isExportFormVisible"
        class="workspace-hero__export-panel"
        @submit.prevent="submitExportForm"
      >
        <div class="workspace-hero__export-copy">
          <p class="workspace-hero__export-kicker">
            Export Signature
          </p>
          <p class="workspace-hero__export-title">
            为导出样式填写署名信息
          </p>
        </div>
        <div class="workspace-hero__export-fields">
          <label class="workspace-hero__export-field">
            <span class="workspace-hero__export-label">作者</span>
            <input
              ref="exportAuthorInputRef"
              v-model="exportAuthor"
              type="text"
              class="workspace-hero__export-input workspace-hero__export-input--author"
              maxlength="40"
              placeholder="输入作者名称"
              @keydown.esc.prevent="closeExportForm"
            >
          </label>
          <label class="workspace-hero__export-field">
            <span class="workspace-hero__export-label">样式名称</span>
            <input
              v-model="exportStyleName"
              type="text"
              class="workspace-hero__export-input workspace-hero__export-input--style"
              maxlength="60"
              placeholder="输入样式名称"
              @keydown.esc.prevent="closeExportForm"
            >
          </label>
        </div>
        <div class="workspace-hero__export-actions">
          <button
            type="submit"
            class="workspace-hero__export-confirm"
          >
            确认
          </button>
          <button
            type="button"
            class="workspace-hero__export-cancel"
            @click="closeExportForm"
          >
            取消
          </button>
        </div>
      </form>
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
import {
  nextTick,
  ref,
} from "vue";

import {
  DEFAULT_STYLE_TRANSFER_AUTHOR,
  DEFAULT_STYLE_TRANSFER_NAME,
} from "@/lib/style-transfer";

defineProps<{
  importedStyleSignature: string;
  setImportFileInputRef: (element: Element | null) => void;
  statusCopy: string;
}>();

const emit = defineEmits<{
  "create-preview-document": [];
  "import-change": [event: Event];
  "open-import": [];
  extract: [];
  export: [author: string, styleName: string];
  reset: [];
}>();

const exportAuthor = ref(DEFAULT_STYLE_TRANSFER_AUTHOR);
const exportAuthorInputRef = ref<HTMLInputElement | null>(null);
const exportStyleName = ref(DEFAULT_STYLE_TRANSFER_NAME);
const isExportFormVisible = ref(false);

async function openExportForm() {
  exportAuthor.value = DEFAULT_STYLE_TRANSFER_AUTHOR;
  exportStyleName.value = DEFAULT_STYLE_TRANSFER_NAME;
  isExportFormVisible.value = true;
  await nextTick();
  exportAuthorInputRef.value?.focus();
  exportAuthorInputRef.value?.select();
}

function closeExportForm() {
  isExportFormVisible.value = false;
  exportAuthor.value = DEFAULT_STYLE_TRANSFER_AUTHOR;
  exportStyleName.value = DEFAULT_STYLE_TRANSFER_NAME;
}

function submitExportForm() {
  emit("export", exportAuthor.value, exportStyleName.value);
  closeExportForm();
}
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

.workspace-hero__preview-button {
  grid-column: 1 / -1;
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

.workspace-hero__import-signature {
  margin: 2px 0 0;
  font-family: "Snell Roundhand", "STKaiti", "Kaiti SC", "Source Han Serif SC", cursive, serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 1.2;
  color: transparent;
  text-shadow: 0 8px 24px color-mix(in srgb, var(--panel-accent) 24%, transparent);
  background: linear-gradient(135deg, #d18a27 0%, #f5d58b 36%, #7f4517 100%);
  background-clip: text;
  -webkit-background-clip: text;
}

.workspace-hero__export-panel {
  display: grid;
  gap: 12px;
  margin-top: 2px;
  padding: 14px;
  border: 1px solid color-mix(in srgb, var(--panel-accent-outline) 42%, var(--panel-card-stroke) 58%);
  border-radius: 18px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--panel-chip-active-bg) 62%, transparent) 0%, transparent 58%),
    linear-gradient(180deg, color-mix(in srgb, var(--panel-card-bg) 88%, white 12%) 0%, var(--panel-card-bg) 100%);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white 55%, transparent),
    0 14px 34px color-mix(in srgb, var(--panel-accent) 10%, transparent);
}

.workspace-hero__export-copy {
  display: grid;
  gap: 4px;
}

.workspace-hero__export-kicker {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--panel-accent);
}

.workspace-hero__export-title {
  margin: 0;
  font-family: "Iowan Old Style", "Source Han Serif SC", "Noto Serif SC", Georgia, serif;
  font-size: 17px;
  line-height: 1.2;
  color: var(--panel-text);
}

.workspace-hero__export-description {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--panel-text-subtle);
}

.workspace-hero__export-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.workspace-hero__export-field {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.workspace-hero__export-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--panel-text);
}

.extract-styles-button,
.export-styles-button,
.import-styles-button,
.preview-document-button,
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

.preview-document-button {
  border: 1px solid color-mix(in srgb, var(--panel-accent-outline) 38%, var(--panel-card-stroke) 62%);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--panel-chip-active-bg) 54%, white 46%) 0%, color-mix(in srgb, var(--panel-card-bg) 92%, white 8%) 100%);
  color: color-mix(in srgb, var(--panel-accent) 54%, var(--panel-text) 46%);
}

.workspace-hero__export-form {
  width: 100%;
}

.workspace-hero__export-input,
.workspace-hero__export-confirm,
.workspace-hero__export-cancel {
  min-height: 32px;
  border-radius: 14px;
  font-size: 12px;
}

.workspace-hero__export-input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--panel-text) 14%, var(--panel-card-stroke) 86%);
  background: color-mix(in srgb, var(--panel-card-bg) 82%, white 18%);
  color: var(--panel-text);
}

.workspace-hero__export-input::placeholder {
  color: var(--panel-text-subtle);
}

.workspace-hero__export-confirm,
.workspace-hero__export-cancel {
  padding: 0 12px;
  font-weight: 700;
  cursor: pointer;
}

.workspace-hero__export-actions {
  display: flex;
  gap: 8px;
}

.workspace-hero__export-confirm {
  border: 1px solid var(--panel-accent-outline);
  background: var(--panel-chip-active-bg);
  color: var(--panel-accent);
}

.workspace-hero__export-cancel {
  border: 1px solid color-mix(in srgb, var(--panel-text) 12%, var(--panel-card-stroke) 88%);
  background: color-mix(in srgb, var(--panel-card-bg) 68%, var(--panel-glass) 32%);
  color: var(--panel-text);
}

.extract-styles-button:hover,
.export-styles-button:hover,
.import-styles-button:hover,
.preview-document-button:hover,
.reset-styles-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--panel-hover-shadow);
}

.workspace-hero__export-confirm:hover,
.workspace-hero__export-cancel:hover,
.workspace-hero__export-input:focus {
  box-shadow: var(--panel-hover-shadow);
}

.workspace-hero__export-input:focus {
  outline: none;
  border-color: var(--panel-accent-outline);
}

.workspace-hero__file-input {
  display: none;
}

@media (max-width: 720px) {
  .workspace-hero__actions {
    grid-template-columns: 1fr;
  }

  .workspace-hero__export-fields {
    grid-template-columns: 1fr;
  }

  .workspace-hero__export-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
