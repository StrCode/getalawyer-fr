<script setup lang="ts">
import { Building01Icon, Calendar01Icon, CallIcon, Video01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import LawyerProfileSectionHeading from '@/components/lawyer-profile/LawyerProfileSectionHeading.vue'
import type { ConsultationType } from '~/types/lawyer'
defineProps<{
  consultationTypes: ConsultationType[]
}>()

const MEETING_BADGES = [
  { value: 'video', label: 'Video', icon: Video01Icon },
  { value: 'phone', label: 'Phone', icon: CallIcon },
  { value: 'in_person', label: 'In person', icon: Building01Icon },
] as const

function badgesFor(meetingType: ConsultationType['meetingType']) {
  return MEETING_BADGES.filter(b => meetingType === 'any' || b.value === meetingType)
}

function formatPrice(price: string): string {
  return parseFloat(price) === 0 ? 'Free' : `₦${parseFloat(price).toLocaleString()}`
}
</script>

<template>
  <section v-if="consultationTypes.length">
    <LawyerProfileSectionHeading title="Consultation options">
      <template #icon>
        <HugeiconsIcon :icon="Calendar01Icon" />
      </template>
    </LawyerProfileSectionHeading>
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="consult in consultationTypes"
        :key="consult.id"
        class="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
           <h3 class="font-semibold text-foreground">
              {{ consult.name }}
            </h3>
            <p
              v-if="consult.description"
              class="mt-1 text-sm text-muted-foreground"
            >
              {{ consult.description }}
            </p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-xl font-semibold tabular-nums text-foreground">
              {{ formatPrice(consult.price) }}
            </p>
            <p class="font-mono text-xs tabular-nums text-muted-foreground">
              {{ consult.durationMinutes }} min
            </p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <Badge
            v-for="badge in badgesFor(consult.meetingType)"
            :key="badge.value"
            variant="soft"
            class="gap-1"
          >
            <HugeiconsIcon :icon="badge.icon" class="size-3.5" />
            {{ badge.label }}
          </Badge>
        </div>
      </div>
    </div>
  </section>
</template>
