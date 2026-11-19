<script setup lang="ts">
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import type { ApplicationState } from '~/lib/application-state'
import { APPLICATION_HOME, APPLICATION_MEMBERSHIP } from '~/lib/setup-paths'

/**
 * Inside the account menu, for a lawyer whose application is not approved yet:
 * where the application stands, as one link into it. It stands in for the
 * dashboard links, which such a lawyer cannot open.
 */
const { state } = useApplicationState()

const COPY: Record<ApplicationState, { status: string, note: string, action: string, to: string }> = {
  loading: { status: 'Your application', note: 'Checking where it stands…', action: 'Open your application', to: APPLICATION_HOME },
  unavailable: { status: 'Your application', note: 'We could not check where it stands just now.', action: 'Open your application', to: APPLICATION_HOME },
  draft: { status: 'Application in progress', note: 'Finish the sections, then submit it for review.', action: 'Continue your application', to: APPLICATION_HOME },
  payment: { status: 'One step left', note: 'Your application is submitted. Membership is still to pay.', action: 'Choose a plan and pay', to: APPLICATION_MEMBERSHIP },
  review: { status: 'In review', note: `We are checking your credentials. You will get an email, usually within ${REVIEW_TIME}.`, action: 'See where it stands', to: APPLICATION_HOME },
  changes: { status: 'Changes needed', note: 'The review team left feedback on your application.', action: 'Read the feedback', to: APPLICATION_HOME },
  failed: { status: 'Not verified', note: 'We could not verify your identity or enrolment.', action: 'See what to do next', to: APPLICATION_HOME },
  approved: { status: 'Approved', note: 'Your application is approved.', action: 'Open your dashboard', to: '/dashboard' },
}
const copy = computed(() => COPY[state.value])
</script>

<template>
  <DropdownMenuItem as-child class="block cursor-pointer rounded-[1.1rem] bg-mint p-[0.9rem] text-deep focus:bg-mint focus:text-deep focus:ring-2 focus:ring-brand">
    <NuxtLink :to="copy.to">
      <small class="block text-[0.72rem] font-bold tracking-[0.06em] uppercase">Lawyer application</small>
      <b class="mt-[0.2rem] block font-display text-[1.05rem] font-[650] tracking-[-0.02em]">{{ copy.status }}</b>
      <span class="mt-[0.15rem] block text-[0.88rem]">{{ copy.note }}</span>
      <span class="mt-[0.6rem] inline-flex items-center gap-[0.35rem] text-[0.9rem] font-semibold">{{ copy.action }}<CanopyGlyph name="arrow" :size="14" :stroke="2.4" class="!text-deep" /></span>
    </NuxtLink>
  </DropdownMenuItem>
</template>
