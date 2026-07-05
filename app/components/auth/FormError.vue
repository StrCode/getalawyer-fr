<template>
  <div
    v-if="message"
    role="alert"
    class="flex gap-2 items-start rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-destructive text-sm"
  >
    <AppIcon :icon="appIcons.warningCircle" class="mt-0.5 w-4 h-4 shrink-0" />
    <span>{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
defineProps<{
  message?: string
}>()
</script>
