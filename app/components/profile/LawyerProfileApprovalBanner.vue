<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import type { ProfileEditorApprovalNotice } from '~/lib/lawyerOnboardingStatus'

defineProps<{
  notice: ProfileEditorApprovalNotice
}>()

const variantClasses: Record<ProfileEditorApprovalNotice['variant'], string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100',
  warning:
    'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100',
  destructive:
    'border-destructive/30 bg-destructive/5 text-foreground',
}
</script>

<template>
  <div
    class="rounded-xl border px-4 py-3 sm:px-5 sm:py-4"
    :class="variantClasses[notice.variant]"
    role="status"
  >
    <div class="flex gap-3">
      <AppIcon :icon="appIcons.info"
        v-if="notice.variant === 'info'"
        class="mt-0.5 size-5 shrink-0"
        aria-hidden="true"
      />
      <AppIcon :icon="appIcons.warning"
        v-else-if="notice.variant === 'warning'"
        class="mt-0.5 size-5 shrink-0"
        aria-hidden="true"
      />
      <AppIcon :icon="appIcons.warningCircle"
        v-else
        class="mt-0.5 size-5 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div class="min-w-0 space-y-1">
        <p class="text-sm font-semibold">
          {{ notice.title }}
        </p>
        <p class="text-sm leading-relaxed opacity-90">
          {{ notice.description }}
        </p>
      </div>
    </div>
  </div>
</template>
