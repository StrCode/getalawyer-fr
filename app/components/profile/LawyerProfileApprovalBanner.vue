<script setup lang="ts">
import { Alert01Icon, AlertCircleIcon, InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { Hugeicon } from '@/lib/icon-types'
import type { ProfileEditorApprovalNotice } from '~/lib/lawyerOnboardingStatus'

defineProps<{
  notice: ProfileEditorApprovalNotice
}>()

const variantIcons: Record<ProfileEditorApprovalNotice['variant'], Hugeicon> = {
  info: InformationCircleIcon,
  warning: Alert01Icon,
  destructive: AlertCircleIcon,
}
</script>

<template>
  <Alert :variant="notice.variant">
    <HugeiconsIcon :icon="variantIcons[notice.variant]" aria-hidden="true" />
    <AlertTitle>{{ notice.title }}</AlertTitle>
    <AlertDescription>{{ notice.description }}</AlertDescription>
  </Alert>
</template>
