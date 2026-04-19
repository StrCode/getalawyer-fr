<script setup lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { formatScnForDisplay } from '~/lib/scn'
import {
  PhNotePencil,
  PhCheckCircle,
  PhXCircle,
  PhClock
} from '@phosphor-icons/vue'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()
// Use computed to ensure reactivity to summary changes
const summary = computed(() => store.summary)

const { data: specData } = useSpecializations()
const specializations = computed(() => specData.value || [])

/** `practiceAreas` in the draft are specialization ids — resolve to labels for display */
const practiceAreaRows = computed(() => {
  const ids = summary.value?.practice?.practiceAreas ?? []
  const list = specializations.value
  return ids.map((id: string) => ({
    id,
    name: list.find((s: { id: string; name: string }) => s.id === id)?.name ?? id
  }))
})

// Format helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatScn = (raw: string | undefined) => {
  const s = formatScnForDisplay(raw)
  return s || 'Not provided'
}

/** Street, city, state, postal — comma-separated; omits empty parts */
const officeAddressFull = computed(() => {
  const a = summary.value?.practice?.officeAddress
  if (!a) return 'N/A'
  const parts = [a.street, a.city, a.state, a.postalCode]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
  return parts.length ? parts.join(', ') : 'N/A'
})

/** Mirrors `nin-verification.vue`: verified | submitted & pending | needs action */
const ninDisplay = computed(() => {
  const n = summary.value?.ninVerification
  if (!n) {
    return { variant: 'action' as const, label: 'Action required' }
  }
  if (n.verified) {
    return { variant: 'verified' as const, label: 'Verified' }
  }
  if (n.isSubmitted) {
    return { variant: 'pending' as const, label: 'Awaiting verification' }
  }
  return { variant: 'action' as const, label: 'Action required' }
})

const minimalRow =
  'flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8'
const minimalLabel = 'text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:w-[200px] sm:shrink-0'
const minimalValue = 'min-w-0 flex-1 text-sm font-semibold text-gray-900'
</script>

<template>
  <div v-if="summary" class="space-y-12 pb-20">
    <div class="mb-10 text-center">
      <div
        class="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary/10 text-primary shadow-sm"
      >
        <PhNotePencil class="h-10 w-10" />
      </div>
      <h1 class="mb-2 text-2xl font-bold text-gray-900">Review your application</h1>
      <p class="mx-auto max-w-md text-sm font-medium text-gray-600">
        Please take a moment to double-check your information before submitting your application for professional review.
      </p>
    </div>

    <div class="space-y-10">
        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500">Basic information</p>
            <Button variant="link" class="h-auto shrink-0 px-0 text-sm font-semibold text-primary" as-child>
              <NuxtLink to="/onboarding/personal-info">Edit</NuxtLink>
            </Button>
          </div>
          <div class="divide-y divide-gray-100 rounded-lg border border-gray-100 px-4 sm:px-5">
            <div :class="minimalRow">
              <span :class="minimalLabel">Full name</span>
              <span :class="minimalValue">
                {{ summary.personal?.firstName }} {{ summary.personal?.lastName }}
              </span>
            </div>
            <div :class="minimalRow">
              <span :class="minimalLabel">Gender</span>
              <span :class="[minimalValue, 'capitalize']">{{ summary.personal?.gender || 'N/A' }}</span>
            </div>
            <div :class="minimalRow">
              <span :class="minimalLabel">Date of birth</span>
              <span :class="minimalValue">{{ formatDate(summary.personal?.dateOfBirth) }}</span>
            </div>
            <div :class="minimalRow">
              <span :class="minimalLabel">Identity status</span>
              <div class="flex min-w-0 flex-1 items-center gap-1.5">
                <PhCheckCircle
                  v-if="ninDisplay.variant === 'verified'"
                  class="h-4 w-4 shrink-0 text-primary"
                  weight="fill"
                />
                <PhClock
                  v-else-if="ninDisplay.variant === 'pending'"
                  class="h-4 w-4 shrink-0 text-emerald-600"
                  weight="fill"
                />
                <PhXCircle v-else class="h-4 w-4 shrink-0 text-red-500" weight="fill" />
                <span
                  class="text-sm font-semibold"
                  :class="{
                    'text-primary': ninDisplay.variant === 'verified',
                    'text-emerald-700': ninDisplay.variant === 'pending',
                    'text-red-600': ninDisplay.variant === 'action'
                  }"
                >
                  {{ ninDisplay.label }}
                </span>
              </div>
            </div>
            <div :class="minimalRow">
              <span :class="minimalLabel">Current state</span>
              <span :class="minimalValue">{{ summary.personal?.state || 'N/A' }}</span>
            </div>
            <div :class="minimalRow">
              <span :class="minimalLabel">LGA</span>
              <span :class="minimalValue">{{ summary.personal?.lga || 'N/A' }}</span>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500">Professional background</p>
            <Button variant="link" class="h-auto shrink-0 px-0 text-sm font-semibold text-primary" as-child>
              <NuxtLink to="/onboarding/professional-information">Edit</NuxtLink>
            </Button>
          </div>
          <div class="divide-y divide-gray-100 rounded-lg border border-gray-100 px-4 sm:px-5">
            <div :class="minimalRow">
              <span :class="minimalLabel">SCN</span>
              <span :class="[minimalValue, 'font-mono']">{{ formatScn(summary.professional?.barNumber) }}</span>
            </div>
            <div :class="minimalRow">
              <span :class="minimalLabel">Year of call</span>
              <span :class="minimalValue">{{ summary.professional?.yearOfCall || 'Not provided' }}</span>
            </div>
            <div :class="minimalRow">
              <span :class="minimalLabel">University & LLB</span>
              <span :class="minimalValue">
                {{ summary.professional?.university }} ({{ summary.professional?.llbYear }})
              </span>
            </div>
            <div :class="minimalRow">
              <span :class="minimalLabel">Law school</span>
              <span :class="minimalValue">{{ summary.professional?.lawSchool }}</span>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500">Practice details</p>
            <Button variant="link" class="h-auto shrink-0 px-0 text-sm font-semibold text-primary" as-child>
              <NuxtLink to="/onboarding/practice-information">Edit</NuxtLink>
            </Button>
          </div>
          <div class="space-y-4">
            <div class="rounded-lg border border-gray-100 px-4 py-4 sm:px-5">
              <p class="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Practice areas</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="row in practiceAreaRows"
                  :key="row.id"
                  class="rounded-md border border-gray-200/80 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-800"
                >
                  {{ row.name }}
                </span>
              </div>
            </div>
            <div class="divide-y divide-gray-100 rounded-lg border border-gray-100 px-4 sm:px-5">
              <div :class="minimalRow">
                <span :class="minimalLabel">Firm name</span>
                <span :class="minimalValue">{{ summary.practice?.firmName || 'Solo Practitioner' }}</span>
              </div>
              <div :class="minimalRow">
                <span :class="minimalLabel">Office address</span>
                <span :class="minimalValue">{{ officeAddressFull }}</span>
              </div>
            </div>
          </div>
        </section>
    </div>

    <div class="border-t border-gray-100 pt-10 text-center">
      <p class="mx-auto max-w-sm text-xs font-medium italic leading-relaxed text-gray-400">
        Once submitted, your application will enter a pending state for manual administrative review. This usually takes 1-2 business days.
      </p>
    </div>
  </div>
</template>
