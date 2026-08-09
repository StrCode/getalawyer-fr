<script setup lang="ts">
import {
  AlertCircleIcon,
  CancelCircleIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  PencilEdit01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import LegalAcceptanceFields from '~/components/onboarding/LegalAcceptanceFields.vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { formatScnForDisplay } from '~/lib/scn'
import { CURRENT_TERMS_VERSION } from '~/lib/legal'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('review')

const store = useLawyerOnboardingStore()
const summary = computed(() => store.summary)

const registerValidate = inject<
  ((fn: (() => Promise<boolean>) | null) => void) | undefined
>('registerLawyerOnboardingStepValidate', undefined)

const legalSubmitAttempted = ref(false)

const legalError = computed(() => {
  if (!legalSubmitAttempted.value) return null
  if (!store.practiceInfo.termsAccepted) {
    return 'You must accept the Terms and Conditions to continue.'
  }
  if (!store.practiceInfo.refundPolicyAccepted) {
    return 'You must accept the refund policy to continue.'
  }
  return null
})

onMounted(() => {
  registerValidate?.(async () => {
    legalSubmitAttempted.value = true
    store.practiceInfo.termsVersion = CURRENT_TERMS_VERSION
    if (!store.practiceInfo.termsAccepted || !store.practiceInfo.refundPolicyAccepted) {
      store.validationError = legalError.value
        ?? 'Accept the Terms and refund policy to submit.'
      return false
    }
    store.validationError = null
    return true
  })
})

onBeforeUnmount(() => {
  registerValidate?.(null)
})

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
  return rest.length ? rest.join(', ') : null
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

const ninIcon = computed(() => {
  if (ninDisplay.value.variant === 'verified') return CheckmarkCircle01Icon
  if (ninDisplay.value.variant === 'pending') return Clock01Icon
  return CancelCircleIcon
})
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <Alert v-if="ninDisplay.variant === 'action'" variant="destructive">
      <HugeiconsIcon :icon="AlertCircleIcon" aria-hidden="true" />
      <AlertTitle>NIN still needed</AlertTitle>
      <AlertDescription class="flex flex-col gap-3">
        <p>Add your National Identification Number before you submit.</p>
        <Button
          variant="outline"
          size="sm"
          class="w-fit cursor-pointer border-destructive/25 bg-background"
          as-child
        >
          <NuxtLink to="/onboarding/nin-verification">
            Add NIN
          </NuxtLink>
        </Button>
      </AlertDescription>
    </Alert>

    <Card class="gap-0 overflow-hidden p-0">
      <!-- About you -->
      <section class="flex flex-col gap-5 p-6 sm:p-8">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-1">
            <h2 class="text-base font-medium text-foreground">
              About you
            </h2>
            <p class="text-sm text-muted-foreground">
              Identity details from your application
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 shrink-0 cursor-pointer gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            as-child
          >
            <NuxtLink to="/onboarding/personal-info">
              <HugeiconsIcon :icon="PencilEdit01Icon" data-icon="inline-start" />
              Edit
            </NuxtLink>
          </Button>
        </div>

        <dl class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1 sm:col-span-2">
            <dt class="text-sm text-muted-foreground">Name on government ID</dt>
            <dd class="text-base font-medium leading-snug text-foreground">{{ publicLegalName }}</dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt class="text-sm text-muted-foreground">Gender</dt>
            <dd class="text-base font-medium capitalize leading-snug text-foreground">
              {{ summary.personal?.gender || 'Not provided' }}
            </dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt class="text-sm text-muted-foreground">Date of birth</dt>
            <dd class="text-base font-medium leading-snug text-foreground">
              {{ formatDate(summary.personal?.dateOfBirth) }}
            </dd>
          </div>
          <div class="flex flex-col gap-1 sm:col-span-2">
            <dt class="text-sm text-muted-foreground">Residence</dt>
            <dd class="text-base font-medium leading-snug text-foreground">{{ residenceDisplay }}</dd>
          </div>
          <div class="flex flex-col gap-2 sm:col-span-2">
            <dt class="text-sm text-muted-foreground">NIN verification</dt>
            <dd class="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                class="gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium"
                :class="{
                  'border-primary/30 bg-primary/10 text-primary': ninDisplay.variant === 'verified',
                  'border-border bg-muted/50 text-foreground': ninDisplay.variant === 'pending',
                  'border-destructive/30 bg-destructive/5 text-destructive': ninDisplay.variant === 'action',
                }"
              >
                <HugeiconsIcon :icon="ninIcon" class="size-3.5" />
                {{ ninDisplay.label }}
              </Badge>
              <Button
                v-if="ninDisplay.variant !== 'verified'"
                variant="link"
                class="h-auto cursor-pointer px-0 text-sm"
                as-child
              >
                <NuxtLink to="/onboarding/nin-verification">
                  {{ ninDisplay.variant === 'action' ? 'Add NIN' : 'View' }}
                </NuxtLink>
              </Button>
            </dd>
          </div>
        </dl>
      </section>

      <Separator />

      <!-- Bar credentials -->
      <section class="flex flex-col gap-5 p-6 sm:p-8">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-1">
            <h2 class="text-base font-medium text-foreground">
              Bar credentials
            </h2>
            <p class="text-sm text-muted-foreground">
              Details used to confirm you’re called to the Nigerian Bar
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 shrink-0 cursor-pointer gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            as-child
          >
            <NuxtLink to="/onboarding/professional-information">
              <HugeiconsIcon :icon="PencilEdit01Icon" data-icon="inline-start" />
              Edit
            </NuxtLink>
          </Button>
        </div>

        <dl class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <dt class="text-sm text-muted-foreground">Supreme Court number</dt>
            <dd class="font-mono text-base font-medium tabular-nums leading-snug text-foreground">
              {{ formatScn(summary.professional?.barNumber) }}
            </dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt class="text-sm text-muted-foreground">Year of call</dt>
            <dd class="text-base font-medium leading-snug text-foreground">
              {{ summary.professional?.yearOfCall ?? 'Not provided' }}
            </dd>
          </div>
          <div class="flex flex-col gap-1 sm:col-span-2">
            <dt class="text-sm text-muted-foreground">Name on SCN</dt>
            <dd class="text-base font-medium leading-snug text-foreground">{{ scnLegalName }}</dd>
          </div>
        </dl>
      </section>

      <Separator />

      <!-- Practice -->
      <section class="flex flex-col gap-5 p-6 sm:p-8">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-1">
            <h2 class="text-base font-medium text-foreground">
              Practice
            </h2>
            <p class="text-sm text-muted-foreground">
              How and where you practise
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 shrink-0 cursor-pointer gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            as-child
          >
            <NuxtLink to="/onboarding/practice-information">
              <HugeiconsIcon :icon="PencilEdit01Icon" data-icon="inline-start" />
              Edit
            </NuxtLink>
          </Button>
        </div>

        <dl class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1 sm:col-span-2">
            <dt class="text-sm text-muted-foreground">Arrangement</dt>
            <dd class="text-base font-medium leading-snug text-foreground">{{ firmDisplay }}</dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt class="text-sm text-muted-foreground">Primary state</dt>
            <dd class="text-base font-medium leading-snug text-foreground">{{ primaryStateDisplay }}</dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt class="text-sm text-muted-foreground">Also practises in</dt>
            <dd class="text-base font-medium leading-snug text-foreground">
              {{ additionalStatesDisplay ?? '—' }}
            </dd>
          </div>
          <div class="flex flex-col gap-2 sm:col-span-2">
            <dt class="text-sm text-muted-foreground">Practice areas</dt>
            <dd>
              <div v-if="practiceAreaRows.length" class="flex flex-wrap gap-2">
                <Badge
                  v-for="row in practiceAreaRows"
                  :key="row.id"
                  variant="secondary"
                  class="rounded-md px-2.5 py-1 text-sm font-medium"
                >
                  {{ row.name }}
                </Badge>
              </div>
              <p v-else class="text-base font-medium text-muted-foreground">None selected</p>
              <p
                v-if="isLoadingSpecs && practiceAreaRows.length"
                class="mt-1 text-xs text-muted-foreground"
              >
                Loading specialization names…
              </p>
            </dd>
          </div>
        </dl>
      </section>
    </Card>

    <p class="pb-2 text-sm leading-relaxed text-muted-foreground">
      After you submit, we usually review applications within one to two business days.
      You won’t be able to edit these details from here once submitted — use Edit above first if
      something needs fixing.
    </p>

    <ClientOnly>
      <Teleport defer to="#onboarding-wizard-footer-above">
        <LegalAcceptanceFields
          compact
          :terms-accepted="store.practiceInfo.termsAccepted === true"
          :refund-policy-accepted="store.practiceInfo.refundPolicyAccepted === true"
          :error="legalError"
          @update:terms-accepted="(v) => {
            store.practiceInfo.termsAccepted = v
            if (v && store.practiceInfo.refundPolicyAccepted) {
              legalSubmitAttempted = false
              store.validationError = null
            }
          }"
          @update:refund-policy-accepted="(v) => {
            store.practiceInfo.refundPolicyAccepted = v
            if (v && store.practiceInfo.termsAccepted) {
              legalSubmitAttempted = false
              store.validationError = null
            }
          }"
        />
      </Teleport>
    </ClientOnly>
  </div>
</template>
