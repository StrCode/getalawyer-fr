<script setup lang="ts">
import { AlertCircleIcon, InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { cn } from '@/lib/utils'

export type SubscriptionBannerTone = 'info' | 'warning' | 'success'

export interface SubscriptionBanner {
  tone: SubscriptionBannerTone
  /** One-line headline. */
  message: string
  /** Optional muted clause rendered after the headline (e.g. a gateway failure reason). */
  detail?: string | null
  /** Inline primary action; omitted when the state has no retry. */
  actionLabel?: string | null
}

defineProps<{
  banner: SubscriptionBanner
  loading?: boolean
}>()

const emit = defineEmits<{
  action: []
}>()

const toneClass: Record<SubscriptionBannerTone, string> = {
  info: 'border-info-border bg-info-subtle text-info-subtle-foreground [&>svg]:text-info',
  warning: 'border-warning-border bg-warning-subtle text-warning-subtle-foreground [&>svg]:text-warning',
  success: 'border-success-border bg-success-subtle text-success-subtle-foreground [&>svg]:text-success',
}
</script>

<template>
  <div
    role="status"
    :class="cn(
      'flex flex-col gap-3 rounded-xl border px-4 py-3 text-sm sm:flex-row sm:items-center',
      toneClass[banner.tone],
    )"
  >
    <HugeiconsIcon
      :icon="banner.tone === 'warning' ? AlertCircleIcon : InformationCircleIcon"
      class="hidden size-4 shrink-0 sm:block"
      aria-hidden="true"
    />
    <p class="min-w-0 flex-1 leading-snug">
      <span class="font-medium">{{ banner.message }}</span>
      <span
        v-if="banner.detail"
        class="opacity-80"
      >
        — {{ banner.detail }}
      </span>
    </p>
    <ButtonBusy
      v-if="banner.actionLabel"
      size="sm"
      class="shrink-0 cursor-pointer self-start sm:self-auto"
      :loading="loading"
      @click="emit('action')"
    >
      {{ banner.actionLabel }}
    </ButtonBusy>
  </div>
</template>
