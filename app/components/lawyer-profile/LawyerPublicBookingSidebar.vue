<script setup lang="ts">
import { Building01Icon, Calendar01Icon, CallIcon, Clock01Icon, Location01Icon, Message02Icon, SecurityCheckIcon, Video01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { LawyerPriceRange, PrimaryConsultation } from '~/lib/lawyer-public-profile'
import type { LawyerPracticeInfo } from '~/types/lawyer'
defineProps<{
  lawyerId: string
  priceRange: LawyerPriceRange
  primaryConsultation: PrimaryConsultation | null
  availableMeetingTypes: string[]
  practiceInfo: LawyerPracticeInfo | null
  isAuthenticated: boolean
  isOwnProfile: boolean
  canMessage: boolean
  statesOfPractice: string[]
  availabilitySummary: string | null
}>()

const emit = defineEmits<{
  ask: []
}>()

const MEETING_TYPE_ROWS = [
  { value: 'video', label: 'Video call', icon: Video01Icon },
  { value: 'phone', label: 'Phone call', icon: CallIcon },
  { value: 'in_person', label: 'In person', icon: Building01Icon },
] as const
</script>

<template>
  <div class="sticky top-24 overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-border/40">
<!-- Price leads: it's the #1 comparison signal, not a footnote. -->
    <div class="border-b border-border p-6 md:p-7">
      <template v-if="primaryConsultation">
        <p class="mb-1 text-2xl font-semibold text-primary tabular-nums">
          <template v-if="priceRange.min > 0 && priceRange.max > priceRange.min">
            From ₦{{ priceRange.min.toLocaleString() }}
          </template>
          <template v-else-if="primaryConsultation.price > 0">
            ₦{{ primaryConsultation.price.toLocaleString() }}
          </template>
          <template v-else>
            Free consultation
          </template>
        </p>
        <p class="text-sm text-muted-foreground">
          {{ primaryConsultation.durationMinutes }} min · {{ primaryConsultation.name }}
        </p>
        <p class="mt-3 text-xs text-muted-foreground">
          Messaging is free — ask a question before committing to anything.
        </p>
      </template>
      <template v-else>
        <p class="mb-1 text-2xl font-semibold text-primary tabular-nums">
          Free to message
        </p>
        <p class="mt-1 text-sm text-muted-foreground">
          Ask a question — the lawyer may request a consultation fee if needed.
        </p>
      </template>
      <p
        v-if="availabilitySummary"
        class="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <HugeiconsIcon :icon="Clock01Icon" class="size-3.5 shrink-0" />
        {{ availabilitySummary }}
      </p>
    </div>

    <div class="space-y-6 p-6 md:p-7">
      <div v-if="availableMeetingTypes.length">
       <h3 class="eyebrow mb-3 text-muted-foreground">
          Meeting types
        </h3>
        <div class="space-y-2">
          <div
            v-for="meeting in MEETING_TYPE_ROWS.filter(m => availableMeetingTypes.includes(m.value))"
            :key="meeting.value"
            class="flex items-center gap-3 rounded-lg border border-border px-3.5 py-3"
          >
            <HugeiconsIcon :icon="meeting.icon" class="size-4 text-muted-foreground" />
            <span class="text-sm font-medium text-foreground">{{ meeting.label }}</span>
          </div>
        </div>
      </div>

      <div v-if="practiceInfo && (isAuthenticated || availableMeetingTypes.includes('in_person'))">
       <h3 class="eyebrow mb-3 text-muted-foreground">
          Office
        </h3>
        <div class="rounded-lg border border-border p-4">
          <div class="flex items-start gap-3">
            <HugeiconsIcon :icon="Location01Icon" class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div class="text-sm text-muted-foreground">
              <p
                v-if="isAuthenticated && practiceInfo.officeStreet"
                class="font-medium text-foreground"
              >
                {{ practiceInfo.officeStreet }}
              </p>
              <p>{{ practiceInfo.officeCity }}, {{ practiceInfo.officeState }}</p>
              <p v-if="isAuthenticated && practiceInfo.officePostalCode">
                {{ practiceInfo.officePostalCode }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="statesOfPractice.length">
       <h3 class="eyebrow mb-3 text-muted-foreground">
          Licensed in
        </h3>
        <div class="flex flex-wrap gap-2">
          <Badge
            v-for="state in statesOfPractice"
            :key="state"
            variant="outline"
          >
            {{ state }}
          </Badge>
        </div>
      </div>

      <div v-if="!isOwnProfile" class="space-y-3">
        <Button
          v-if="primaryConsultation"
          size="lg"
          class="h-12 w-full font-semibold"
          as-child
        >
          <NuxtLink :to="`/lawyers/${lawyerId}/book`">
            <HugeiconsIcon :icon="Calendar01Icon" class="mr-2 size-5" />
            Book a consultation
          </NuxtLink>
        </Button>
        <Button
          size="lg"
          :variant="primaryConsultation ? 'outline' : 'default'"
          class="h-12 w-full font-semibold"
          @click="emit('ask')"
        >
          <HugeiconsIcon :icon="Message02Icon" class="mr-2 size-5" />
          Ask question
        </Button>
        <p class="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <HugeiconsIcon :icon="SecurityCheckIcon" class="size-4 text-primary" />
          Secure messaging · free to start
        </p>
      </div>
    </div>
  </div>
</template>
