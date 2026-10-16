<template>
  <template v-if="!query || !query.trim()">
    {{ text }}
  </template>
  <template v-else>
    <template
      v-for="(part, index) in parts"
      :key="index"
    >
      <mark
        v-if="part.isMatch"
        class="search-highlight"
      >{{ part.text }}</mark>
      <template v-else>
        {{ part.text }}
      </template>
    </template>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { highlightParts } from "@/lib/config-search"

const props = defineProps<{
  query?: string
  text?: string
}>()

const parts = computed(() => {
  return highlightParts(props.text ?? "", props.query ?? "")
})
</script>

<style scoped>
.search-highlight {
  background-color: color-mix(in srgb, var(--panel-accent, #3b82f6) 35%, transparent);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
  font-weight: 600;
  text-decoration: none;
}
</style>
