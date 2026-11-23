<script setup lang="ts">
import type { ReturnedMembership } from '~/lib/application-correction'

/** The application home once it has been rejected for good: why, and what happens to what was paid. */
defineProps<{
  /** What the review team wrote. */
  reason: string
  membership: ReturnedMembership
}>()
</script>

<template>
  <ApplicationStatus
    kicker="Application reviewed"
    title="Your application was not approved"
    description="Our review team could not approve it, and it is now closed."
    :pill="{ label: 'Closed', tone: 'bad' }"
    :membership="membership"
  >
    <section v-if="reason" aria-labelledby="closed-title" class="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3.75">
      <h2 id="closed-title" class="font-medium text-destructive">What the review team found</h2>
      <p class="mt-1 whitespace-pre-line">{{ reason }}</p>
    </section>
    <RefundBankAccount />
    <p v-if="membership === 'owed'" class="text-muted-foreground">
      You do not need to do anything for the refund. The verification fee is kept, because the checks were carried out, and you will get an email when the rest has been sent.
    </p>
    <p class="text-sm text-muted-foreground">
      Do you think this is a mistake? Write to <a :href="`mailto:${SUPPORT_EMAIL}`" :class="authLink">{{ SUPPORT_EMAIL }}</a>.
    </p>
  </ApplicationStatus>
</template>
