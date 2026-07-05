<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { formatScnForDisplay } from '~/lib/scn'
import { formatPracticeAreaYears } from '~/lib/practice-areas'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('review')

const store = useLawyerOnboardingStore()
const summary = computed(() => store.summary)

const { data: specData, isPending: isLoadingSpecs } = useSpecializations()
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

const statesList = computed(() => summary.value?.practice?.statesOfPractice ?? [])

const primaryStateDisplay = computed(() => {
  const primary = summary.value?.practice?.primaryState
  if (primary) return primary
  return statesList.value[0] ?? 'Not provided'
})

const additionalStatesDisplay = computed(() => {
  const extra = summary.value?.practice?.additionalPracticeStates
  if (Array.isArray(extra) && extra.length) return extra.join(', ')
  const primary = summary.value?.practice?.primaryState
  const rest = statesList.value.filter((s) => s !== primary)
  return rest.length ? rest.join(', ') : '—'
})

const publicLegalName = computed(() => {
  const p = summary.value?.personal
  const legal = String(p?.governmentIdLegalName ?? '').trim()
  if (legal) return legal
  if (!p) return 'Not provided'
  const parts = [p.firstName, p.middleName, p.lastName].filter(Boolean)
  return parts.join(' ') || 'Not provided'
})

const scnLegalName = computed(() => {
  const name = String(summary.value?.professional?.scnFullNameAtCallToBar ?? '').trim()
  return name || 'Not provided'
})

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return 'Not provided'
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
  if (!n) return { variant: 'action' as const, label: 'Not started' }
  if (n.verified) return { variant: 'verified' as const, label: 'Verified' }
  if (n.isSubmitted) return { variant: 'pending' as const, label: 'Submitted — awaiting review' }
  return { variant: 'action' as const, label: 'Not started' }
})

const firmDisplay = computed(() => {
  if (summary.value?.practice?.soloPractitioner) return 'Solo practitioner'
  const name = String(summary.value?.practice?.firmName ?? '').trim()
  return name || 'Not provided'
})

const residenceDisplay = computed(() => {
  const p = summary.value?.personal
  if (!p?.state && !p?.lga) return 'Not provided'
  if (p.lga && p.state) return `${p.lga}, ${p.state}`
  return p.state || p.lga || 'Not provided'
})

const cardClass =
  'relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm'

const sectionHeaderClass = 'flex items-start justify-between gap-4 border-b border-border/40 pb-4'
const sectionTitleClass = 'text-xs font-semibold uppercase tracking-widest text-primary'
const fieldLabelClass = 'text-sm font-semibold uppercase tracking-wide text-muted-foreground/70'
const fieldValueClass = 'text-base font-medium leading-snug text-foreground'
</script>

<template>
  <div class="w-full space-y-8 pb-20">
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <div
      v-if="ninDisplay.variant === 'action'"
      class="flex gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-4 sm:px-5"
      role="status"
    >
      <AppIcon :icon="appIcons.warningCircle" class="mt-0.5 size-5 shrink-0 text-primary" />
      <div class="min-w-0 flex-1 space-y-2">
        <p class="text-base font-semibold text-foreground">
          Identity verification is incomplete
        </p>
        <p class="text-base leading-relaxed text-muted-foreground">
          Add your NIN before submitting. Our team verifies it during application review.
        </p>
        <Button variant="outline" size="sm" class="border-primary/30 bg-card hover:bg-primary/10" as-child>
          <NuxtLink to="/onboarding/nin-verification">
            Complete NIN verification
          </NuxtLink>
        </Button>
      </div>
    </div>

    <div
      v-else
      class="flex gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 sm:px-5"
      role="status"
    >
      <AppIcon :icon="appIcons.checkCircle" class="mt-0.5 size-5 shrink-0 text-primary" />
      <p class="text-base leading-relaxed text-foreground">
        <span class="font-semibold">You’re ready to submit.</span>
        Review each section below. Use Edit to change anything before our team reviews your application.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- About you -->
      <Card :class="cardClass">
        <div
          class="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-muted/40 blur-3xl"
          aria-hidden="true"
        />
        <div class="relative z-10 space-y-6 p-6 sm:p-8">
          <div :class="sectionHeaderClass">
            <h2 :class="sectionTitleClass">About you</h2>
            <Button
              variant="outline"
              size="sm"
              class="h-9 shrink-0 gap-1.5 rounded-lg border-border/50 bg-card/80 px-3 text-sm font-semibold"
              as-child
            >
              <NuxtLink to="/onboarding/personal-info">
                <AppIcon :icon="appIcons.pencilSimple" class="size-3.5" aria-hidden="true" />
                Edit
              </NuxtLink>
            </Button>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div class="space-y-1 sm:col-span-2">
              <p :class="fieldLabelClass">Name on government ID</p>
              <p :class="fieldValueClass">{{ publicLegalName }}</p>
            </div>
            <div class="space-y-1">
              <p :class="fieldLabelClass">Gender</p>
              <p :class="[fieldValueClass, 'capitalize']">
                {{ summary.personal?.gender || 'Not provided' }}
              </p>
            </div>
            <div class="space-y-1">
              <p :class="fieldLabelClass">Date of birth</p>
              <p :class="fieldValueClass">{{ formatDate(summary.personal?.dateOfBirth) }}</p>
            </div>
            <div class="space-y-1 sm:col-span-2">
              <p :class="fieldLabelClass">Residence</p>
              <p :class="fieldValueClass">{{ residenceDisplay }}</p>
            </div>
            <div class="space-y-2 sm:col-span-2">
              <p :class="fieldLabelClass">NIN verification</p>
              <div class="flex flex-wrap items-center gap-2">
                <Badge
                  :variant="ninDisplay.variant === 'verified' ? 'default' : 'outline'"
                  class="text-sm"
                  :class="{
                    'border-primary/30 bg-primary/10 text-primary': ninDisplay.variant === 'verified',
                    'border-primary/20 bg-primary/5 text-primary': ninDisplay.variant === 'pending',
                    'border-primary/30 bg-primary/10 text-primary': ninDisplay.variant === 'action',
                  }"
                >
                  <AppIcon :icon="appIcons.checkCircle"
                    v-if="ninDisplay.variant === 'verified'"
                    class="mr-1 size-3.5"
                  />
                  <AppIcon :icon="appIcons.clock"
                    v-else-if="ninDisplay.variant === 'pending'"
                    class="mr-1 size-3.5"
                  />
                  <AppIcon :icon="appIcons.xCircle" v-else class="mr-1 size-3.5" />
                  {{ ninDisplay.label }}
                </Badge>
                <Button
                  v-if="ninDisplay.variant !== 'verified'"
                  variant="link"
                  class="h-auto px-0 text-sm font-semibold"
                  as-child
                >
                  <NuxtLink to="/onboarding/nin-verification">
                    {{ ninDisplay.variant === 'action' ? 'Add NIN' : 'View' }}
                  </NuxtLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Bar credentials -->
      <Card :class="cardClass">
        <div
          class="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl"
          aria-hidden="true"
        />
        <div class="relative z-10 space-y-6 p-6 sm:p-8">
          <div :class="sectionHeaderClass">
            <h2 :class="sectionTitleClass">Bar credentials</h2>
            <Button
              variant="outline"
              size="sm"
              class="h-9 shrink-0 gap-1.5 rounded-lg border-border/50 bg-card/80 px-3 text-sm font-semibold"
              as-child
            >
              <NuxtLink to="/onboarding/professional-information">
                <AppIcon :icon="appIcons.pencilSimple" class="size-3.5" aria-hidden="true" />
                Edit
              </NuxtLink>
            </Button>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div class="space-y-1">
              <p :class="fieldLabelClass">SCN</p>
              <p :class="[fieldValueClass, 'font-mono tabular-nums']">
                {{ formatScn(summary.professional?.barNumber) }}
              </p>
            </div>
            <div class="space-y-1">
              <p :class="fieldLabelClass">Year of call</p>
              <p :class="fieldValueClass">
                {{ summary.professional?.yearOfCall ?? 'Not provided' }}
              </p>
            </div>
            <div class="space-y-1 sm:col-span-2">
              <p :class="fieldLabelClass">Name on SCN</p>
              <p :class="fieldValueClass">{{ scnLegalName }}</p>
            </div>
            <div class="space-y-1 sm:col-span-2">
              <p :class="fieldLabelClass">Practice arrangement</p>
              <p :class="fieldValueClass">{{ firmDisplay }}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Practice (full width) -->
    <Card :class="cardClass">
      <div class="relative z-10 space-y-6 p-6 sm:p-8">
        <div :class="sectionHeaderClass">
          <h2 :class="sectionTitleClass">Practice</h2>
          <Button
            variant="outline"
            size="sm"
            class="h-9 shrink-0 gap-1.5 rounded-lg border-border/50 bg-card/80 px-3 text-sm font-semibold"
            as-child
          >
            <NuxtLink to="/onboarding/practice-information">
              <AppIcon :icon="appIcons.pencilSimple" class="size-3.5" aria-hidden="true" />
              Edit
            </NuxtLink>
          </Button>
        </div>

        <div class="space-y-6">
          <div class="grid gap-5 sm:grid-cols-2">
            <div class="space-y-1">
              <p :class="fieldLabelClass">Primary state</p>
              <p :class="fieldValueClass">{{ primaryStateDisplay }}</p>
            </div>
            <div class="space-y-1">
              <p :class="fieldLabelClass">Additional states</p>
              <p :class="fieldValueClass">{{ additionalStatesDisplay }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <p :class="fieldLabelClass">States of practice</p>
            <div v-if="statesList.length" class="flex flex-wrap gap-2">
              <Badge
                v-for="state in statesList"
                :key="state"
                variant="outline"
                class="rounded-md border-primary/25 bg-primary/5 px-2.5 py-1 text-sm font-medium text-primary"
              >
                {{ state }}
              </Badge>
            </div>
            <p v-else :class="[fieldValueClass, 'text-muted-foreground']">None selected</p>
          </div>

          <div class="space-y-3">
            <p :class="fieldLabelClass">Legal specializations</p>
            <ul
              v-if="practiceAreaRows.length"
              class="divide-y divide-border/30 overflow-hidden rounded-xl border border-border/40 bg-muted/50"
            >
              <li
                v-for="row in practiceAreaRows"
                :key="row.id"
                class="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span class="text-base font-medium text-foreground">{{ row.name }}</span>
                <span class="shrink-0 text-sm font-medium text-muted-foreground tabular-nums">
                  {{ row.yearsLabel }}
                </span>
              </li>
            </ul>
            <p v-else :class="[fieldValueClass, 'text-muted-foreground']">None selected</p>
            <p
              v-if="isLoadingSpecs && practiceAreaRows.length"
              class="text-xs text-muted-foreground"
            >
              Loading specialization names…
            </p>
          </div>
        </div>
      </div>
    </Card>

    <!-- Submit notice -->
    <Card class="rounded-2xl border border-border bg-card shadow-sm">
      <div class="flex gap-3 p-5 sm:p-6">
        <AppIcon :icon="appIcons.info" class="mt-0.5 size-5 shrink-0 text-primary" />
        <div class="space-y-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p class="font-semibold text-foreground">What happens after you submit</p>
          <p>
            Your application goes into a pending state while our team manually reviews your credentials.
            This usually takes one to two business days. You’ll be notified when a decision is made.
          </p>
          <p class="text-sm text-muted-foreground">
            You won’t be able to change these details from this screen after submitting.
            Use Edit above if something needs correcting.
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>
