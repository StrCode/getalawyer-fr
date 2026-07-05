<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { AppIconData, AppIconName } from '@/lib/app-icons'
import { resolveAppIcon } from '@/lib/app-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  icon?: AppIconData
  name?: string | null | undefined
  size?: number
  strokeWidth?: number
  class?: HTMLAttributes['class']
}>()

const attrs = useAttrs()

const resolvedIcon = computed(() => {
  if (props.icon)
    return props.icon
  if (props.name)
    return resolveAppIcon(props.name)
  return resolveAppIcon('')
})

const nakedAttrs = computed(() => {
  const copy = { ...(attrs as Record<string, unknown>) }
  delete copy.class
  return copy
})

const mergedClass = computed(() => cn(attrs.class as string | string[] | undefined, props.class))
</script>

<template>
  <HugeiconsIcon
    :key="String(name ?? icon)"
    :icon="resolvedIcon"
    :size="size ?? 16"
    color="currentColor"
    :strokeWidth="strokeWidth ?? 1.75"
    v-bind="nakedAttrs"
    :class="mergedClass"
  />
</template>