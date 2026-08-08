<template>
  <div
    v-if="message"
    role="alert"
    class="flex gap-2 items-start rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-destructive text-sm"
  >
    <HugeiconsIcon :icon="AlertCircleIcon" class="mt-0.5 w-4 h-4 shrink-0" />
    <span>{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
defineProps<{
  message?: string
}>()
</script>
