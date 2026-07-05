<script lang="ts" setup>
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'

import type { ToasterProps } from "vue-sonner"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <AppIcon :icon="appIcons.checkCircle" class="size-4" />
    </template>
    <template #info-icon>
      <AppIcon :icon="appIcons.info" class="size-4" />
    </template>
    <template #warning-icon>
      <AppIcon :icon="appIcons.warning" class="size-4" />
    </template>
    <template #error-icon>
      <AppIcon :icon="appIcons.xCircle" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <AppIcon :icon="appIcons.circleNotch" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <AppIcon :icon="appIcons.x" class="size-4" />
    </template>
  </Sonner>
</template>
