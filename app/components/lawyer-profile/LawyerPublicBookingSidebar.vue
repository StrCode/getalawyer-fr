<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { LawyerPriceRange, PrimaryConsultation } from '~/lib/lawyer-public-profile'
import type { LawyerPracticeInfo } from '~/types/lawyer'
import {
  PhBuildings,
  PhCheck,
  PhClock,
  PhMapPin,
  PhPhone,
  PhShieldCheck,
  PhVideoCamera,
} from '@phosphor-icons/vue'

defineProps<{
  priceRange: LawyerPriceRange
  primaryConsultation: PrimaryConsultation | null
  availableMeetingTypes: string[]
  practiceInfo: LawyerPracticeInfo | null
  isAuthenticated: boolean
  isOwnProfile: boolean
  canBook: boolean
  statesOfPractice: string[]
  availabilitySummary: string | null
}>()

const emit = defineEmits<{
  book: []
}>()
</script>

<template>
  <div class="sticky top-24 overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-border/40">
    <div class="border-b border-border p-6 md:p-7">
      <div
        v-if="primaryConsultation"
        class="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1"
      >
        <span class="text-3xl font-semibold tabular-nums text-foreground">
          <template v-if="primaryConsultation.price > 0">
            From ₦{{ primaryConsultation.price.toLocaleString() }}
          </template>
          <template v-else>
            Free
          </template>
        </span>
        <span class="text-sm text-muted-foreground">
          · {{ primaryConsultation.durationMinutes }} min
        </span>
      </div>
      <div
        v-else-if="priceRange.min > 0"
        class="mb-1 flex flex-wrap items-baseline gap-2"
      >
        <span class="text-3xl font-semibold tabular-nums text-foreground">
          ₦{{ priceRange.min.toLocaleString() }}
        </span>
        <span
          v-if="priceRange.max > priceRange.min"
          class="text-sm text-muted-foreground"
        >
          – ₦{{ priceRange.max.toLocaleString() }}
        </span>
      </div>
      <p
        v-else
        class="text-2xl font-semibold text-primary"
      >
        Free consultation
      </p>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ primaryConsultation?.name || (priceRange.min > 0 ? 'Consultation rates' : 'Available to book') }}
      </p>
      <p
        v-if="availabilitySummary"
        class="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <PhClock class="size-3.5 shrink-0" />
        {{ availabilitySummary }}
      </p>
    </div>

    <div class="space-y-6 p-6 md:p-7">
      <div v-if="availableMeetingTypes.length">
        <h3 class="text-eyebrow mb-3 text-muted-foreground">
          Meeting types
        </h3>
        <div class="space-y-2">
          <div
            v-if="availableMeetingTypes.includes('video')"
            class="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
          >
            <div class="flex items-center gap-3">
              <PhVideoCamera class="size-4 text-muted-foreground" />
              <span class="text-sm font-medium text-foreground">Video call</span>
            </div>
            <PhCheck class="size-4 text-primary" weight="bold" />
          </div>
          <div
            v-if="availableMeetingTypes.includes('phone')"
            class="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
          >
            <div class="flex items-center gap-3">
              <PhPhone class="size-4 text-muted-foreground" />
              <span class="text-sm font-medium text-foreground">Phone call</span>
            </div>
            <PhCheck class="size-4 text-primary" weight="bold" />
          </div>
          <div
            v-if="availableMeetingTypes.includes('in_person')"
            class="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
          >
            <div class="flex items-center gap-3">
              <PhBuildings class="size-4 text-muted-foreground" />
              <span class="text-sm font-medium text-foreground">In person</span>
            </div>
            <PhCheck class="size-4 text-primary" weight="bold" />
          </div>
        </div>
      </div>

      <div v-if="practiceInfo && (isAuthenticated || availableMeetingTypes.includes('in_person'))">
        <h3 class="text-eyebrow mb-3 text-muted-foreground">
          Office
        </h3>
        <div class="rounded-lg border border-border p-4">
          <div class="flex items-start gap-3">
            <PhMapPin class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
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
        <h3 class="text-eyebrow mb-3 text-muted-foreground">
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
          :disabled="!canBook"
          @click="emit('book')"
        >
          Book consultation
        </Button>
        <p class="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <PhShieldCheck class="size-4 text-primary" weight="fill" />
          Secure booking · pick a time after checkout
        </p>
      </div>
    </div>
  </div>
</template>
