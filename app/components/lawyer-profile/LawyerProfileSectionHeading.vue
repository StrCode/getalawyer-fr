<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <h2 class="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground">
    <span class="inline-flex shrink-0 text-muted-foreground [&>svg]:size-5">
      <slot name="icon" />
    </span>
    {{ title }}
  </h2>
</template>
