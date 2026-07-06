<script setup lang="ts">
import { Building01Icon, CallIcon, Clock01Icon, Location01Icon, Message02Icon, SecurityCheckIcon, Tick01Icon, Video01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { LawyerPriceRange, PrimaryConsultation } from '~/lib/lawyer-public-profile'
import type { LawyerPracticeInfo } from '~/types/lawyer'
defineProps<{
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
</script>

<template>
  <div class="sticky top-24 overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-border/40">
    <div class="border-b border-border p-6 md:p-7">
      <p class="mb-1 text-2xl font-semibold text-primary">
        Free to message
      </p>
      <p class="mt-1 text-sm text-muted-foreground">
        Ask a question — the lawyer may request a consultation fee if needed.
      </p>
      <p
        v-if="primaryConsultation"
        class="mt-3 text-xs text-muted-foreground"
      >
        Consultation from
        <template v-if="primaryConsultation.price > 0">
          ₦{{ primaryConsultation.price.toLocaleString() }}
        </template>
        <template v-else>
          free
        </template>
        · {{ primaryConsultation.durationMinutes }} min
      </p>
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
        <h3 class="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
          Meeting types
        </h3>
        <div class="space-y-2">
          <div
            v-if="availableMeetingTypes.includes('video')"
            class="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
          >
            <div class="flex items-center gap-3">
              <HugeiconsIcon :icon="Video01Icon" class="size-4 text-muted-foreground" />
              <span class="text-sm font-medium text-foreground">Video call</span>
            </div>
            <HugeiconsIcon :icon="Tick01Icon" class="size-4 text-primary" />
          </div>
          <div
            v-if="availableMeetingTypes.includes('phone')"
            class="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
          >
            <div class="flex items-center gap-3">
              <HugeiconsIcon :icon="CallIcon" class="size-4 text-muted-foreground" />
              <span class="text-sm font-medium text-foreground">Phone call</span>
            </div>
            <HugeiconsIcon :icon="Tick01Icon" class="size-4 text-primary" />
          </div>
          <div
            v-if="availableMeetingTypes.includes('in_person')"
            class="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
          >
            <div class="flex items-center gap-3">
              <HugeiconsIcon :icon="Building01Icon" class="size-4 text-muted-foreground" />
              <span class="text-sm font-medium text-foreground">In person</span>
            </div>
            <HugeiconsIcon :icon="Tick01Icon" class="size-4 text-primary" />
          </div>
        </div>
      </div>

      <div v-if="practiceInfo && (isAuthenticated || availableMeetingTypes.includes('in_person'))">
        <h3 class="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
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
        <h3 class="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
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

      <div v-if="!isOwnProfile">
        <Button
          size="lg"
          class="h-12 w-full font-semibold"
          :disabled="!canMessage"
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
