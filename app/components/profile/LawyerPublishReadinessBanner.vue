<script setup lang="ts">
import { Megaphone01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { LawyerDirectoryEligibility } from '~/types/lawyer-directory-eligibility'

defineProps<{
  eligibility: LawyerDirectoryEligibility | null | undefined
  isApproved: boolean
}>()
</script>

<template>
  <Alert
    v-if="isApproved && eligibility && !eligibility.isDirectoryVisible"
    variant="warning"
  >
    <HugeiconsIcon :icon="Megaphone01Icon" aria-hidden="true" />
    <AlertTitle>Approved — not visible in search yet</AlertTitle>
    <AlertDescription>
      Your profile is approved but clients cannot find you in the directory until all
      visibility gates pass. Complete the checklist below to go live.
    </AlertDescription>
  </Alert>
</template>
