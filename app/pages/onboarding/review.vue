<script setup lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { formatScnForDisplay } from '~/lib/scn'
import { formatPracticeAreaYears } from '~/lib/practice-areas'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { PhCheckCircle, PhXCircle, PhClock } from '@phosphor-icons/vue'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('review')

const store = useLawyerOnboardingStore()
const summary = computed(() => store.summary)

const { data: specData } = useSpecializations()
const specializations = computed(() => specData.value || [])

const practiceAreaRows = computed(() => {
  const areas = summary.value?.practice?.practiceAreas ?? []
  const list = specializations.value
  return areas.map((row) => ({
    id: row.practiceAreaId,
    name:
      list.find((s: { id: string; name: string }) => s.id === row.practiceAreaId)?.name
      ?? row.practiceAreaId,
    yearsLabel: formatPracticeAreaYears(row.yearsOfExperience),
  }))
})

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatScn(raw: string | undefined) {
  const s = formatScnForDisplay(raw)
  return s || 'Not provided'
}

const ninDisplay = computed(() => {
  const n = summary.value?.ninVerification
  if (!n) return { variant: 'action' as const, label: 'Action required' }
  if (n.verified) return { variant: 'verified' as const, label: 'Verified' }
  if (n.isSubmitted) return { variant: 'pending' as const, label: 'Awaiting verification' }
  return { variant: 'action' as const, label: 'Action required' }
})

const firmDisplay = computed(() => {
  if (summary.value?.practice?.soloPractitioner) return 'Solo practitioner'
  const name = String(summary.value?.practice?.firmName ?? '').trim()
  return name || 'Solo practitioner'
})

const statesDisplay = computed(() => {
  const states = summary.value?.practice?.statesOfPractice ?? []
  return states.length ? states.join(', ') : 'N/A'
})

const minimalRow =
  'flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8'
const minimalLabel = 'text-3 font-bold uppercase tracking-wider text-gray-400 sm:w-[200px] sm:shrink-0'
const minimalValue = 'min-w-0 flex-1 text-sm font-semibold text-gray-900'
</script>

<template>
  <div v-if="summary" class="w-full space-y-10 pb-20">
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <div class="space-y-8">
      <section class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <p class="text-3 font-bold uppercase tracking-widest text-gray-500">About you</p>
          <Button variant="link" class="h-auto shrink-0 px-0 text-sm font-semibold text-primary" as-child>
            <NuxtLink to="/onboarding/personal-info">Edit</NuxtLink>
          </Button>
        </div>
        <div class="divide-y divide-gray-100 rounded-lg border border-gray-100 px-4 sm:px-5">
          <div :class="minimalRow">
            <span :class="minimalLabel">Full name</span>
            <span :class="minimalValue">
              {{ summary.personal?.firstName }}
              {{ summary.personal?.middleName ? `${summary.personal.middleName} ` : '' }}
              {{ summary.personal?.lastName }}
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
                  'text-red-600': ninDisplay.variant === 'action',
                }"
              >
                {{ ninDisplay.label }}
              </span>
            </div>
          </div>
          <div :class="minimalRow">
            <span :class="minimalLabel">Residence</span>
            <span :class="minimalValue">
              {{ summary.personal?.lga || 'N/A' }}, {{ summary.personal?.state || 'N/A' }}
            </span>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <p class="text-3 font-bold uppercase tracking-widest text-gray-500">Credentials & practice</p>
          <div class="flex shrink-0 gap-3">
            <Button variant="link" class="h-auto px-0 text-sm font-semibold text-primary" as-child>
              <NuxtLink to="/onboarding/professional-information">Edit bar</NuxtLink>
            </Button>
            <Button variant="link" class="h-auto px-0 text-sm font-semibold text-primary" as-child>
              <NuxtLink to="/onboarding/practice-information">Edit practice</NuxtLink>
            </Button>
          </div>
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
            <span :class="minimalLabel">Firm</span>
            <span :class="minimalValue">{{ firmDisplay }}</span>
          </div>
          <div :class="minimalRow">
            <span :class="minimalLabel">States of practice</span>
            <span :class="minimalValue">{{ statesDisplay }}</span>
          </div>
          <div :class="minimalRow">
            <span :class="minimalLabel">Practice areas</span>
            <ul class="min-w-0 flex-1 space-y-1.5 text-sm font-semibold text-gray-900">
              <li v-for="row in practiceAreaRows" :key="row.id">
                {{ row.name }}
                <span class="font-normal text-gray-500">— {{ row.yearsLabel }}</span>
              </li>
              <li v-if="practiceAreaRows.length === 0" class="font-normal text-gray-500">None selected</li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <div class="border-t border-gray-100 pt-10 text-center">
      <p class="mx-auto max-w-sm text-xs font-medium italic leading-relaxed text-gray-400">
        Once submitted, your application will enter a pending state for manual administrative review.
        This usually takes 1–2 business days.
      </p>
    </div>
  </div>
</template>
