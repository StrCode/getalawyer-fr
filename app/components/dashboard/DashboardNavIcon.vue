<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  active?: boolean
}>()
</script>

<template>
  <component
    :is="icon"
    class="size-[22px] shrink-0 group-data-[collapsible=icon]:size-[22px]"
    :class="active ? 'text-primary' : 'text-muted-foreground'"
    :weight="active ? 'fill' : 'regular'"
  />
</template>
