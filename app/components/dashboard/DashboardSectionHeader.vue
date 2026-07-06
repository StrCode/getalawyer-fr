<template>
  <div class="flex items-center justify-between gap-3">
   <h2 class="font-semibold text-foreground text-lg">
      {{ title }}
    </h2>
    <div
      v-if="$slots.actions"
      class="flex shrink-0 items-center gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
