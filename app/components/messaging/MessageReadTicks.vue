<script setup lang="ts">
import { Tick01Icon, TickDouble01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
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
    <HugeiconsIcon :icon="Tick01Icon"
      v-if="status === 'sent'"
      class="size-3.5 opacity-70"
      aria-hidden="true"
    />
    <HugeiconsIcon :icon="TickDouble01Icon"
      v-else-if="status === 'delivered'"
      class="size-3.5 opacity-70"
      aria-hidden="true"
    />
    <!-- Read state distinguishes by brightness: no hue stays legible on the
         primary bubble in both themes, so full-strength foreground vs the
         dimmed sent/delivered ticks. -->
    <HugeiconsIcon :icon="TickDouble01Icon"
      v-else
      class="size-3.5 text-primary-foreground"
      aria-hidden="true"
    />
  </span>
</template>
