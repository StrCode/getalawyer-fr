<script lang="ts" setup>
import { Alert01Icon, Cancel01Icon, CancelCircleIcon, CheckmarkCircle01Icon, InformationCircleIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

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
      <HugeiconsIcon :icon="CheckmarkCircle01Icon" class="size-4" />
    </template>
    <template #info-icon>
      <HugeiconsIcon :icon="InformationCircleIcon" class="size-4" />
    </template>
    <template #warning-icon>
      <HugeiconsIcon :icon="Alert01Icon" class="size-4" />
    </template>
    <template #error-icon>
      <HugeiconsIcon :icon="CancelCircleIcon" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <HugeiconsIcon :icon="Loading03Icon" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <HugeiconsIcon :icon="Cancel01Icon" class="size-4" />
    </template>
  </Sonner>
</template>
