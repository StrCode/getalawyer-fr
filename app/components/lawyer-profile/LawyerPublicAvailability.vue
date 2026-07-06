<script setup lang="ts">
import { Clock01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import LawyerProfileSectionHeading from '@/components/lawyer-profile/LawyerProfileSectionHeading.vue'
import type { LawyerWorkingDay } from '~/lib/lawyer-public-profile'
defineProps<{
  workingDays: LawyerWorkingDay[]
}>()
</script>

<template>
  <section v-if="workingDays.length">
    <LawyerProfileSectionHeading title="Availability">
      <template #icon>
        <HugeiconsIcon :icon="Clock01Icon" />
      </template>
    </LawyerProfileSectionHeading>
    <div class="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div class="space-y-1">
        <div
          v-for="schedule in workingDays"
          :key="schedule.day"
          class="flex items-center justify-between border-b border-border/60 py-2.5 last:border-0"
        >
          <span class="text-sm font-medium text-foreground">{{ schedule.day }}</span>
          <span class="font-mono text-sm tabular-nums text-muted-foreground">
            {{ schedule.startTime }} – {{ schedule.endTime }}
          </span>
        </div>
      </div>
      <p class="mt-4 text-xs text-muted-foreground">
        Times shown in your local timezone.
      </p>
    </div>
  </section>
</template>
