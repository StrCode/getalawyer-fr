<script lang="ts" setup>
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'

import type { CalendarNextProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { CalendarNext, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from '@/components/ui/button'

const props = defineProps<CalendarNextProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarNext
    data-slot="calendar-next-button"
    :class="cn(
      buttonVariants({ variant: 'outline' }),
      'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
      props.class,
    )"
    v-bind="forwardedProps"
  >
    <slot>
      <AppIcon :icon="appIcons.caretRight" class="size-4" />
    </slot>
  </CalendarNext>
</template>
