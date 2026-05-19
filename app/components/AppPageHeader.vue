<template>
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0">
      <h1 :class="titleClass">
        {{ title }}
      </h1>
      <p
        v-if="description"
        :class="descriptionClass"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="flex shrink-0 flex-wrap items-center gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    titleClass?: string
    descriptionClass?: string
  }>(),
  {
    titleClass: 'app-page-title',
    descriptionClass: 'app-page-description',
  },
)
</script>
