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
  changes: { status: 'Correction needed', note: 'The review team asked you to correct something.', action: 'See what to correct', to: APPLICATION_HOME },
  closed: { status: 'Not approved', note: 'Your application is closed.', action: 'See why', to: APPLICATION_HOME },
  withdrawn: { status: 'Withdrawn', note: 'You withdrew your application.', action: 'See where it stands', to: APPLICATION_HOME },
  approved: { status: 'Approved', note: 'Your application is approved.', action: 'Open your dashboard', to: '/dashboard' },
}
const copy = computed(() => COPY[state.value])
</script>

<template>
  <DropdownMenuItem as-child class="block cursor-pointer rounded-lg bg-mint p-3.5 text-deep focus:bg-mint focus:text-deep focus:ring-2 focus:ring-brand">
    <NuxtLink :to="copy.to">
      <small class="block text-xs font-medium tracking-wider uppercase">Lawyer application</small>
      <b class="mt-0.75 block font-display text-base font-normal tracking-tight">{{ copy.status }}</b>
      <span class="mt-0.5 block text-sm">{{ copy.note }}</span>
      <span class="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium">{{ copy.action }}<CanopyGlyph name="arrow" :size="14" :stroke="2.4" class="!text-deep" /></span>
    </NuxtLink>
  </DropdownMenuItem>
</template>
