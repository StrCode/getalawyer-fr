<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'
import { resolvePhIcon } from '~/utils/ph-icon-resolve'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: string | null | undefined
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()
const IconComponent = computed(() => resolvePhIcon(String(props.name ?? '')))

const nakedAttrs = computed(() => {
  const copy = { ...(attrs as Record<string, unknown>) }
  delete copy.class
  return copy
})

const mergedClass = computed(() => cn(attrs.class as string | string[] | undefined, props.class))
</script>

<template>
  <component
    :is="IconComponent"
    :key="String(name)"
    v-bind="nakedAttrs"
    :class="mergedClass"
  />
</template>
