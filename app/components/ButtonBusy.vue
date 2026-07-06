<script setup lang="ts">
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  loading: false,
})

const attrs = useAttrs()

const disabled = computed(() => {
  const d = attrs.disabled
  const explicit = d === true || d === ''
  return !!(props.loading || explicit)
})
</script>

<template>
  <Button
    :as="as"
    :as-child="asChild"
    :variant="variant"
    :size="size"
    :class="cn(asChild ? undefined : props.loading ? 'gap-2' : undefined, props.class)"
    data-slot="button-busy"
    v-bind="{ ...attrs, disabled }"
  >
    <HugeiconsIcon :icon="Loading03Icon"
      v-if="loading && !asChild"
      class="size-4 shrink-0 animate-spin opacity-70"
      aria-hidden="true"
    />
    <slot />
  </Button>
</template>
