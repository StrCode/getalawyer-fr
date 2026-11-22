<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { ensureLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { onboardingSubmittedAt } from '~/lib/lawyerOnboardingStatus'
import { APPLICATION_MEMBERSHIP } from '~/lib/setup-paths'
import { Button } from '@/components/ui/button'

/**
 * A lawyer's application, at one address whatever state it is in: being filled
 * in, in review, being corrected, closed, or withdrawn. The page shows the
 * screen for the state the application is in and follows it as it changes
 * (submitting, reopening, a decision arriving), so nothing here redirects to a
 * sibling page and back. Only two things leave: membership still to pay goes to
 * its own page, and an approved lawyer goes to the dashboard.
 */
definePageMeta({
  layout: 'application',
  middleware: ['auth', 'application'],
})

const router = useRouter()
const queryClient = useQueryClient()
await useAsyncData('application-status', () => ensureLawyerOnboardingStatus(queryClient))

const { state, status, correction, returned, subscriptionPending, refetchStatus } = useApplicationState({ poll: true })

// These two say where the refund stands, so they wait for that answer.
const loading = computed(() => state.value === 'loading' || ((state.value === 'closed' || state.value === 'withdrawn') && subscriptionPending.value))

const TITLES: Partial<Record<typeof state.value, string>> = {
  review: 'Application in review',
  changes: 'Your application needs a correction',
  closed: 'Your application was not approved',
  withdrawn: 'You withdrew your application',
}
useHead({
  title: () => TITLES[state.value] ?? 'Your application',
  meta: [{ name: 'description', content: 'Your lawyer application: where it stands and what is left to do.' }],
})

watch(state, (value) => {
  if (!import.meta.client) return
  if (value === 'payment') void router.replace(APPLICATION_MEMBERSHIP)
  else if (value === 'approved') void router.replace('/dashboard')
}, { immediate: true })

const reviewNotes = computed(() => status.value?.reviewNotes?.trim() || '')
const submittedAt = computed(() => (status.value ? onboardingSubmittedAt(status.value) : null))
</script>

<template>
  <div>
    <!-- also held while moving on to payment or the dashboard -->
    <ApplicationSkeleton v-if="loading || state === 'payment' || state === 'approved'" shape="home" />

    <div v-else-if="state === 'unavailable'" role="alert" class="mt-6 grid justify-items-start gap-2.75 rounded-card border border-dashed border-border p-6">
      <h1 class="text-2xl leading-none font-normal tracking-tight">We could not load your application.</h1>
      <p class="text-muted-foreground">Check your connection and try again.</p>
      <Button variant="line" size="pill-sm" @click="refetchStatus()">Try again</Button>
    </div>

    <ApplicationCorrection v-else-if="state === 'changes' && correction" :correction="correction" />
    <ApplicationClosed v-else-if="state === 'closed'" :reason="reviewNotes" :membership="returned" />
    <ApplicationWithdrawn v-else-if="state === 'withdrawn'" :membership="returned" />
    <ApplicationInReview v-else-if="state === 'review'" :submitted-at="submittedAt" @refresh="refetchStatus()" />
    <ApplicationDraftHome v-else />
  </div>
</template>
