<script setup lang="ts">
import { toast } from 'vue-sonner'
import LegalAcceptanceFields from '~/components/onboarding/LegalAcceptanceFields.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CURRENT_TERMS_VERSION } from '~/lib/legal'
import { APPLICATION_SECTION_PATHS } from '~/lib/setup-paths'
import { formatScnForDisplay } from '~/lib/scn'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

/**
 * The lawyer's application home while it is being filled in: the sections as a
 * task list, done in any order, each showing whether it is complete and a line
 * of what was entered. When every section is done the lawyer accepts the terms
 * and submits here. Submitting changes where the application stands, and the
 * page that shows this moves on to the membership payment by itself.
 */
const store = useLawyerOnboardingStore()

// Coming back from a section that was just saved: that one row's tick arrives
// (a short fade and scale), so the change is seen. Read once, then forgotten.
const justSavedState = useState<string | null>('application-just-saved', () => null)
const justSaved = justSavedState.value
onMounted(() => { justSavedState.value = null })

const { data: specializations } = useSpecializations()
const areaNames = computed(() => {
  const list = specializations.value ?? []
  return store.practiceInfo.practiceAreas
    .map(row => list.find(area => area.id === row.practiceAreaId)?.name)
    .filter(Boolean) as string[]
})

/** True once anything has been typed in a section, to say "Continue" instead of "Start". */
const started = computed(() => ({
  personal: Boolean(store.personalInfo.governmentIdLegalName || store.personalInfo.dateOfBirth || store.personalInfo.state),
  nin: false,
  professional: Boolean(store.professionalInfo.barNumber || store.professionalInfo.yearOfCall),
  practice: Boolean(store.practiceInfo.firmName || store.practiceInfo.practiceAreas.length || store.practiceInfo.primaryState),
}))

const sections = computed(() => {
  const done = store.sectionDone
  const p = store.personalInfo
  const pro = store.professionalInfo
  const pr = store.practiceInfo
  return [
    {
      key: 'personal' as const,
      step: 'personal_info',
      to: APPLICATION_SECTION_PATHS.personal_info,
      title: 'About you',
      hint: 'Your name, date of birth and where you live',
      summary: [p.governmentIdLegalName, p.state].filter(Boolean).join(' · '),
    },
    {
      key: 'nin' as const,
      step: 'nin_verification',
      to: APPLICATION_SECTION_PATHS.nin_verification,
      title: 'Identity',
      hint: 'Your NIN and consent to verify it',
      summary: store.ninVerification.verified ? 'NIN verified' : 'NIN received',
    },
    {
      key: 'professional' as const,
      step: 'professional_info',
      to: APPLICATION_SECTION_PATHS.professional_info,
      title: 'Bar credentials',
      hint: 'Supreme Court number and year of call',
      summary: [pro.barNumber ? formatScnForDisplay(pro.barNumber) : '', pro.yearOfCall ? `Called ${pro.yearOfCall}` : ''].filter(Boolean).join(' · '),
    },
    {
      key: 'practice' as const,
      step: 'practice_info',
      to: APPLICATION_SECTION_PATHS.practice_info,
      title: 'How you practise',
      hint: 'Firm, practice areas and states',
      summary: [pr.soloPractitioner ? 'Solo practitioner' : pr.firmName, pr.primaryState, areaNames.value.join(', ')].filter(Boolean).join(' · '),
    },
  ].map(section => ({
    ...section,
    done: done[section.key],
    action: done[section.key] ? 'Edit' : started.value[section.key] ? 'Continue' : 'Start',
  }))
})

const doneCount = computed(() => sections.value.filter(section => section.done).length)
const allDone = computed(() => doneCount.value === sections.value.length)
const nextSection = computed(() => sections.value.find(section => !section.done) ?? null)

// ---- email, terms and submit ----
const { session } = useAuth()
const emailVerified = computed(() => (session.value?.user as { emailVerified?: boolean } | undefined)?.emailVerified === true)

const submitAttempted = ref(false)
const legalError = computed(() => {
  if (!submitAttempted.value) return null
  if (!emailVerified.value) return 'Confirm your email address to submit.'
  if (!store.practiceInfo.termsAccepted) return 'You must accept the Terms and Conditions to continue.'
  if (!store.practiceInfo.refundPolicyAccepted) return 'You must accept the refund policy to continue.'
  return null
})

const submitting = ref(false)
async function submit() {
  if (submitting.value || !allDone.value) return
  submitAttempted.value = true
  store.practiceInfo.termsVersion = CURRENT_TERMS_VERSION
  if (legalError.value) return
  submitting.value = true
  try {
    // 'review' is the store's submit: it re-checks every section, saves, then submits.
    const ok = await store.saveStep('review')
    if (!ok) return
    // The submit refreshed the application's status; the page moves on from that.
    toast.success('Application submitted', { description: 'Choose a membership plan and pay on the next screen.' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <p class="text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">{{ doneCount }} of {{ sections.length }} done</p>
        <h1 class="mt-[0.6rem] text-[clamp(1.75rem,2.9vw,2.25rem)] leading-[1.04] font-[650] tracking-[-0.035em]">Your application</h1>
      </div>
    </div>
    <p class="mt-[0.6rem] max-w-[38rem] text-muted-foreground">
      Do these in any order. Everything saves as you go, so you can leave and come back.
    </p>

    <div class="mt-[1.2rem] h-2 overflow-hidden rounded-full bg-border" role="progressbar" :aria-valuenow="doneCount" aria-valuemin="0" :aria-valuemax="sections.length" :aria-valuetext="`${doneCount} of ${sections.length} sections done`">
      <i class="block h-full rounded-full bg-primary transition-[width] duration-500 ease-canopy" :style="{ width: `${(doneCount / sections.length) * 100}%` }" />
    </div>

    <!-- the saved application is still loading: hold the list's place -->
    <div v-if="!store.draftLoaded" role="status" aria-busy="true" class="mt-[1.4rem] grid gap-[0.6rem]">
      <span class="sr-only">Loading your application</span>
      <Skeleton v-for="n in 4" :key="n" aria-hidden="true" class="h-[4.6rem] rounded-[1.25rem]" />
    </div>

    <ul v-else class="mt-[1.4rem] grid gap-[0.6rem]">
      <li v-for="(section, index) in sections" :key="section.key">
        <NuxtLink
          :to="section.to"
          class="grid grid-cols-[2.6rem_minmax(0,1fr)_auto] items-center gap-[0.9rem] rounded-[1.25rem] border border-border bg-card px-[1.1rem] py-[0.95rem] transition-[translate,box-shadow,border-color] duration-200 ease-canopy hover:-translate-y-0.5 hover:border-brand max-sm:grid-cols-[2.6rem_minmax(0,1fr)]"
        >
          <span class="grid size-[2.6rem] place-items-center rounded-[0.9rem] font-display font-bold" :class="[section.done ? 'bg-primary text-white' : 'bg-background text-deep', section.done && justSaved === section.step ? 'animate-tick-in' : '']">
            <CanopyGlyph v-if="section.done" name="tick" :size="16" :stroke="3.2" />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="min-w-0">
            <b class="block font-display text-[1.12rem] font-[650] tracking-[-0.02em]">{{ section.title }}</b>
            <small class="block truncate text-[0.88rem] text-muted-foreground">{{ section.done && section.summary ? section.summary : section.hint }}</small>
          </span>
          <span class="text-[0.85rem] font-semibold whitespace-nowrap max-sm:col-start-2" :class="section.done ? 'text-muted-foreground' : 'text-brand'">
            {{ section.done ? `Done · ${section.action}` : section.action }}
          </span>
        </NuxtLink>
      </li>
      <!-- what comes after submitting, so payment is not a surprise -->
      <li class="grid grid-cols-[2.6rem_minmax(0,1fr)] items-center gap-[0.9rem] rounded-[1.25rem] border border-dashed border-border px-[1.1rem] py-[0.95rem] text-muted-foreground">
        <span class="grid size-[2.6rem] place-items-center rounded-[0.9rem] bg-background font-display font-bold">{{ sections.length + 1 }}</span>
        <span class="min-w-0">
          <b class="block font-display text-[1.12rem] font-[650] tracking-[-0.02em] text-foreground">Membership</b>
          <small class="block text-[0.88rem]">After you submit: choose a plan and pay. Refunded if verification does not pass.</small>
        </span>
      </li>
    </ul>

    <div class="mt-[1.4rem] grid gap-[0.8rem]">
      <!-- agreed to at the point of submitting, not before there is anything to submit -->
      <section v-if="allDone" aria-labelledby="before-submit-title" class="mt-[0.4rem] grid gap-[0.7rem]">
        <h2 id="before-submit-title" class="font-display text-[1.15rem] font-[650] tracking-[-0.02em]">Before you submit</h2>
        <ApplicationEmailConfirm />
        <LegalAcceptanceFields
          variant="lawyer"
          :terms-accepted="store.practiceInfo.termsAccepted"
          :refund-policy-accepted="store.practiceInfo.refundPolicyAccepted"
          :error="legalError"
          @update:terms-accepted="(v) => { store.practiceInfo.termsAccepted = v }"
          @update:refund-policy-accepted="(v) => { store.practiceInfo.refundPolicyAccepted = v }"
        />
      </section>

      <p v-if="store.validationError" role="alert" class="rounded-[1rem] border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
        {{ store.validationError }}
      </p>

      <Button
        v-if="allDone"
        type="button"
        variant="canopy"
        size="pill"
        class="group/btn h-[3.25rem] w-full justify-between pr-2 pl-[1.4rem]"
        :disabled="submitting"
        :aria-busy="submitting"
        @click="submit"
      >
        {{ submitting ? 'Submitting…' : 'Submit and continue to payment' }}<CanopyArrowChip />
      </Button>
      <Button v-else-if="nextSection" as-child variant="canopy" size="pill" class="group/btn h-[3.25rem] w-full justify-between pr-2 pl-[1.4rem]">
        <NuxtLink :to="nextSection.to">{{ nextSection.action }}: {{ nextSection.title }}<CanopyArrowChip /></NuxtLink>
      </Button>

      <p class="text-[0.85rem] text-muted-foreground">
        <template v-if="allDone">After you submit, we usually review applications within {{ REVIEW_TIME }}. You will not be able to edit these details once submitted.</template>
        <template v-else>You can submit once all {{ sections.length }} sections are done.</template>
      </p>
    </div>
  </div>
</template>
