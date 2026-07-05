<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import type { HTMLAttributes } from "vue"
import { useForwardProps } from "reka-ui"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()

const forwarded = useForwardProps(props)
</script>

<template>
  <div
    data-slot="input-otp-separator"
    role="separator"
    v-bind="forwarded"
  >
    <slot>
      <AppIcon :icon="appIcons.minus" />
    </slot>
  </div>
</template>
