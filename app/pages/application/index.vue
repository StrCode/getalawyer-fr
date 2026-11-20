<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { ensureLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { onboardingSubmittedAt, VERIFICATION_FAILED_COPY } from '~/lib/lawyerOnboardingStatus'
import { APPLICATION_MEMBERSHIP } from '~/lib/setup-paths'
import { Button } from '@/components/ui/button'

/**
 * A lawyer's application, at one address whatever state it is in: being filled
 * in, in review, needing changes, or failed verification. The page shows the
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

const { state, status, subscription, subscriptionPending, refundInFlight, refetchStatus } = useApplicationState({ poll: true })

// The failed-verification screen says where the refund stands, so it waits for that answer.
const loading = computed(() => state.value === 'loading' || (state.value === 'failed' && subscriptionPending.value))

const TITLES: Partial<Record<typeof state.value, string>> = {
  review: 'Application in review',
  changes: 'Your application needs changes',
  failed: VERIFICATION_FAILED_COPY.title,
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

/** Where the money stands after a failed verification. */
const failedMembership = computed<'refunding' | 'refunded' | 'later'>(() => {
  if (refundInFlight.value) return 'refunding'
  return subscription.value?.status === 'refunded' ? 'refunded' : 'later'
})
</script>

<template>
  <div>
    <!-- also held while moving on to payment or the dashboard -->
    <ApplicationSkeleton v-if="loading || state === 'payment' || state === 'approved'" shape="home" />

    <div v-else-if="state === 'unavailable'" role="alert" class="mt-6 grid justify-items-start gap-[0.7rem] rounded-card border border-dashed border-border p-6">
      <h1 class="text-[1.6rem] leading-[1.1] font-[650] tracking-[-0.03em]">We could not load your application.</h1>
      <p class="text-muted-foreground">Check your connection and try again.</p>
      <Button variant="line" size="pill-sm" @click="refetchStatus()">Try again</Button>
    </div>

    <ApplicationNeedsChanges v-else-if="state === 'changes'" :reason="reviewNotes" />
    <ApplicationVerificationFailed
      v-else-if="state === 'failed'"
      :reason="reviewNotes"
      :membership="failedMembership"
      :refund-in-flight="refundInFlight"
    />
    <ApplicationInReview v-else-if="state === 'review'" :submitted-at="submittedAt" @refresh="refetchStatus()" />
    <ApplicationDraftHome v-else />
  </div>
</template>
