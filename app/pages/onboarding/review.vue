<script setup lang="ts">
import { AlertCircleIcon, CancelCircleIcon, CheckmarkCircle01Icon, Clock01Icon, InformationCircleIcon, PencilEdit01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import LegalAcceptanceFields from '~/components/onboarding/LegalAcceptanceFields.vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { formatScnForDisplay } from '~/lib/scn'
import { CURRENT_TERMS_VERSION } from '~/lib/legal'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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
  'relative w-full rounded-xl border border-foreground/15 bg-card shadow-xs'

const sectionTitleClass = 'text-base font-medium text-foreground'
const fieldLabelClass = 'text-xs font-medium tracking-wide text-muted-foreground uppercase'
const fieldValueClass = 'text-base font-medium leading-snug text-foreground'

const isAboutExpanded = ref(true)
const isCredentialsExpanded = ref(true)
const isPracticeExpanded = ref(true)
</script>

<template>
  <div class="flex w-full flex-col gap-5">
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <div
      v-if="ninDisplay.variant === 'action'"
      class="flex gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-4 sm:px-5"
      role="status"
    >
      <HugeiconsIcon :icon="AlertCircleIcon" class="mt-0.5 size-5 shrink-0 text-primary" />
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <p class="text-sm font-medium text-foreground">
          NIN still needed
        </p>
        <p class="text-sm leading-relaxed text-muted-foreground">
          Add your NIN before you submit. We’ll verify it when we review your application.
        </p>
        <Button variant="outline" size="sm" class="w-fit cursor-pointer border-primary/30 bg-card hover:bg-primary/10" as-child>
          <NuxtLink to="/onboarding/nin-verification">
            Add NIN
          </NuxtLink>
        </Button>
      </div>
    </div>

    <div
      v-else
      class="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4 sm:px-5"
      role="status"
    >
      <HugeiconsIcon :icon="CheckmarkCircle01Icon" class="mt-0.5 size-5 shrink-0 text-primary" />
      <p class="text-sm leading-relaxed text-foreground">
        <span class="font-medium">Ready to submit.</span>
        Check each section below. Use Edit if anything needs changing.
      </p>
    </div>

    <div class="flex flex-col gap-3">
      <!-- About you -->
      <Collapsible v-model:open="isAboutExpanded" class="w-full">
        <Card :class="cardClass">
          <div class="flex items-center justify-between p-4 sm:p-6">
            <div class="flex items-center gap-4">
              <CollapsibleTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full hover:bg-muted">
                  <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 transition-transform duration-200" :class="{ 'rotate-180': isAboutExpanded }" />
                  <span class="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
              <h2 :class="sectionTitleClass">About you</h2>
            </div>
            <Button variant="outline" size="sm" class="h-8 gap-1.5 rounded-lg" as-child>
              <NuxtLink to="/onboarding/personal-info">
                <HugeiconsIcon :icon="PencilEdit01Icon" class="size-3.5" /> Edit
              </NuxtLink>
            </Button>
          </div>
          <CollapsibleContent>
            <div class="border-t border-border/40 p-4 pt-5 sm:p-6 sm:pt-6">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="flex flex-col gap-1 sm:col-span-2">
                  <p :class="fieldLabelClass">Name on government ID</p>
                  <p :class="fieldValueClass">{{ publicLegalName }}</p>
                </div>
                <div class="flex flex-col gap-1">
                  <p :class="fieldLabelClass">Gender</p>
                  <p :class="[fieldValueClass, 'capitalize']">{{ summary.personal?.gender || 'Not provided' }}</p>
                </div>
                <div class="flex flex-col gap-1">
                  <p :class="fieldLabelClass">Date of birth</p>
                  <p :class="fieldValueClass">{{ formatDate(summary.personal?.dateOfBirth) }}</p>
                </div>
                <div class="flex flex-col gap-1 sm:col-span-2">
                  <p :class="fieldLabelClass">Residence</p>
                  <p :class="fieldValueClass">{{ residenceDisplay }}</p>
                </div>
                <div class="flex flex-col gap-2 sm:col-span-2">
                  <p :class="fieldLabelClass">NIN verification</p>
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge
                      :variant="ninDisplay.variant === 'verified' ? 'default' : 'outline'"
                      class="text-sm"
                      :class="{
                        'border-primary/30 bg-primary/10 text-primary': ninDisplay.variant === 'verified' || ninDisplay.variant === 'action',
                        'border-primary/20 bg-primary/5 text-primary': ninDisplay.variant === 'pending',
                      }"
                    >
                      <HugeiconsIcon :icon="CheckmarkCircle01Icon" v-if="ninDisplay.variant === 'verified'" class="mr-1 size-3.5" />
                      <HugeiconsIcon :icon="Clock01Icon" v-else-if="ninDisplay.variant === 'pending'" class="mr-1 size-3.5" />
                      <HugeiconsIcon :icon="CancelCircleIcon" v-else class="mr-1 size-3.5" />
                      {{ ninDisplay.label }}
                    </Badge>
                    <Button v-if="ninDisplay.variant !== 'verified'" variant="link" class="h-auto px-0 text-sm font-medium" as-child>
                      <NuxtLink to="/onboarding/nin-verification">
                        {{ ninDisplay.variant === 'action' ? 'Add NIN' : 'View' }}
                      </NuxtLink>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <!-- Bar credentials -->
      <Collapsible v-model:open="isCredentialsExpanded" class="w-full">
        <Card :class="cardClass">
          <div class="flex items-center justify-between p-4 sm:p-6">
            <div class="flex items-center gap-4">
              <CollapsibleTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full hover:bg-muted">
                  <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 transition-transform duration-200" :class="{ 'rotate-180': isCredentialsExpanded }" />
                  <span class="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
              <h2 :class="sectionTitleClass">Bar credentials</h2>
            </div>
            <Button variant="outline" size="sm" class="h-8 gap-1.5 rounded-lg" as-child>
              <NuxtLink to="/onboarding/professional-information">
                <HugeiconsIcon :icon="PencilEdit01Icon" class="size-3.5" /> Edit
              </NuxtLink>
            </Button>
          </div>
          <CollapsibleContent>
            <div class="border-t border-border/40 p-4 pt-5 sm:p-6 sm:pt-6">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="flex flex-col gap-1">
                  <p :class="fieldLabelClass">SCN</p>
                  <p :class="[fieldValueClass, 'font-mono tabular-nums']">{{ formatScn(summary.professional?.barNumber) }}</p>
                </div>
                <div class="flex flex-col gap-1">
                  <p :class="fieldLabelClass">Year of call</p>
                  <p :class="fieldValueClass">{{ summary.professional?.yearOfCall ?? 'Not provided' }}</p>
                </div>
                <div class="flex flex-col gap-1 sm:col-span-2">
                  <p :class="fieldLabelClass">Name on SCN</p>
                  <p :class="fieldValueClass">{{ scnLegalName }}</p>
                </div>
                <div class="flex flex-col gap-1 sm:col-span-2">
                  <p :class="fieldLabelClass">Practice arrangement</p>
                  <p :class="fieldValueClass">{{ firmDisplay }}</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <!-- Practice -->
      <Collapsible v-model:open="isPracticeExpanded" class="w-full">
        <Card :class="cardClass">
          <div class="flex items-center justify-between p-4 sm:p-6">
            <div class="flex items-center gap-4">
              <CollapsibleTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full hover:bg-muted">
                  <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 transition-transform duration-200" :class="{ 'rotate-180': isPracticeExpanded }" />
                  <span class="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
              <h2 :class="sectionTitleClass">Practice</h2>
            </div>
            <Button variant="outline" size="sm" class="h-8 gap-1.5 rounded-lg" as-child>
              <NuxtLink to="/onboarding/practice-information">
                <HugeiconsIcon :icon="PencilEdit01Icon" class="size-3.5" /> Edit
              </NuxtLink>
            </Button>
          </div>
          <CollapsibleContent>
            <div class="flex flex-col gap-5 border-t border-border/40 p-4 pt-5 sm:p-6 sm:pt-6">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="flex flex-col gap-1">
                  <p :class="fieldLabelClass">Primary state</p>
                  <p :class="fieldValueClass">{{ primaryStateDisplay }}</p>
                </div>
                <div class="flex flex-col gap-1">
                  <p :class="fieldLabelClass">Also practises in</p>
                  <p :class="fieldValueClass">{{ additionalStatesDisplay }}</p>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <p :class="fieldLabelClass">Practice areas</p>
                <div v-if="practiceAreaRows.length" class="flex flex-wrap gap-2">
                  <Badge
                    v-for="row in practiceAreaRows"
                    :key="row.id"
                    variant="outline"
                    class="rounded-md border-primary/25 bg-primary/5 px-2.5 py-1 text-sm font-medium text-primary"
                  >
                    {{ row.name }}
                  </Badge>
                </div>
                <p v-else :class="[fieldValueClass, 'text-muted-foreground']">None selected</p>
                <p v-if="isLoadingSpecs && practiceAreaRows.length" class="text-xs text-muted-foreground">Loading specialization names…</p>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>

    <LegalAcceptanceFields
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

    <Card class="gap-0 rounded-xl border-foreground/15 p-5 shadow-xs sm:p-6">
      <div class="flex gap-3">
        <HugeiconsIcon :icon="InformationCircleIcon" class="mt-0.5 size-5 shrink-0 text-primary" />
        <div class="flex flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground">
          <p class="font-medium text-foreground">After you submit</p>
          <p>
            Your application moves to review while we check your credentials — usually one to two
            business days. We’ll notify you when there’s a decision.
          </p>
          <p>
            You can’t edit these details from this screen after submitting. Use Edit above first if
            something needs fixing.
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>
