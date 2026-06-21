<script setup lang="ts">
import { PhMegaphoneSimple } from '@phosphor-icons/vue'
import type { LawyerDirectoryEligibility } from '~/types/lawyer-directory-eligibility'

defineProps<{
  eligibility: LawyerDirectoryEligibility | null | undefined
  isApproved: boolean
}>()
</script>

<template>
  <div
    v-if="isApproved && eligibility && !eligibility.isDirectoryVisible"
    class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
    role="status"
  >
    <div class="flex gap-3">
      <PhMegaphoneSimple class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p class="font-medium">
          Approved — not visible in search yet
        </p>
        <p class="mt-1 text-amber-900/80 dark:text-amber-100/80">
          Your profile is approved but clients cannot find you in the directory until all
          visibility gates pass. Complete the checklist below to go live.
        </p>
      </div>
    </div>
  </div>
</template>
