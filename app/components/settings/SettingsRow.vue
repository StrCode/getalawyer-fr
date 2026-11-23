<script setup lang="ts">
/**
 * One row of a settings panel: what it is on the left, where it stands in the
 * middle, and one action on the right. Anything opened by the action (a form,
 * a code to type) goes in the `more` slot, under the row.
 */
defineProps<{
  label: string
  hint?: string
}>()
</script>

<template>
  <div class="px-4.5 py-4.5 lg:px-5.75 xl:px-6">
    <div class="grid items-center gap-x-6 gap-y-2.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto]">
      <div class="min-w-0">
        <p class="font-medium">{{ label }}</p>
        <p v-if="hint" class="mt-0.5 text-sm text-muted-foreground">{{ hint }}</p>
      </div>
      <div class="flex min-w-0 flex-wrap items-center gap-2.5">
        <slot />
      </div>
      <div v-if="$slots.action" class="flex-none sm:justify-self-end">
        <slot name="action" />
      </div>
    </div>
    <div v-if="$slots.more" class="mt-4 sm:pl-[calc(13rem+1.5rem)]">
      <slot name="more" />
    </div>
  </div>
</template>
