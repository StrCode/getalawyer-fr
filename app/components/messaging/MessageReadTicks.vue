<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
const props = defineProps<{
  status: 'sent' | 'delivered' | 'read'
}>()

const statusLabel = computed(() => {
  if (props.status === 'read') return 'Read'
  if (props.status === 'delivered') return 'Delivered'
  return 'Sent'
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center"
    :aria-label="statusLabel"
  >
    <AppIcon :icon="appIcons.check"
      v-if="status === 'sent'"
      class="size-3.5 opacity-70"
      aria-hidden="true"
    />
    <AppIcon :icon="appIcons.checks"
      v-else-if="status === 'delivered'"
      class="size-3.5 opacity-70"
      aria-hidden="true"
    />
    <AppIcon :icon="appIcons.checks"
      v-else
      class="size-3.5 text-sky-300"
      aria-hidden="true"
    />
  </span>
</template>
