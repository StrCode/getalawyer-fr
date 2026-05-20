<template>
  <div class="grid gap-4 md:grid-cols-[minmax(0,12.5rem)_1fr] md:items-start md:gap-8">
    <div class="space-y-1">
      <p class="text-sm font-medium text-foreground">
        {{ title }}
      </p>
      <p
        v-if="description"
        class="text-sm leading-relaxed text-muted-foreground"
      >
        {{ description }}
      </p>
    </div>
    <div class="min-w-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
