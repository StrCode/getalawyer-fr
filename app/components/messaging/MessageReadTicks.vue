<script setup lang="ts">
import { PhCheck, PhChecks } from '@phosphor-icons/vue'

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
    <PhCheck
      v-if="status === 'sent'"
      class="size-3.5 opacity-70"
      weight="bold"
      aria-hidden="true"
    />
    <PhChecks
      v-else-if="status === 'delivered'"
      class="size-3.5 opacity-70"
      weight="bold"
      aria-hidden="true"
    />
    <PhChecks
      v-else
      class="size-3.5 text-sky-300"
      weight="bold"
      aria-hidden="true"
    />
  </span>
</template>
