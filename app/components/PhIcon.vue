<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  name: string | null | undefined
  class?: string
}>()
</script>

<template>
  <AppIcon v-bind="$attrs" :name="name" :class="$props.class" />
</template>
