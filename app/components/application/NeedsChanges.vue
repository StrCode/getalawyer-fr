<script setup lang="ts">
import { useReopenApplication } from '~/composables/useOnboardingRestart'

/**
 * The application home when the review team has asked for changes: their
 * feedback and one button to reopen. Reopening makes the application editable
 * again, and the page that shows this switches to the editable home by itself.
 */
defineProps<{
  /** What the review team wrote. */
  reason: string
}>()

const { reopen, isPending } = useReopenApplication()

async function reopenApplication() {
  await reopen({ failed: 'Could not reopen your application' })
}
</script>

<template>
  <ApplicationStatus
    kicker="Application reviewed"
    title="Your application needs changes"
    description="Our review team could not approve it yet. Read the feedback, reopen your application, fix what is listed and submit again."
    :pill="{ label: 'Needs changes', tone: 'warn' }"
    membership="later"
    sections-state="reopen"
  >
    <section aria-labelledby="feedback-title" class="rounded-[1.1rem] border border-warning/30 bg-warning/10 px-4 py-[0.95rem] text-warning-subtle-foreground">
      <h2 id="feedback-title" class="font-semibold">Feedback from the review team</h2>
      <p v-if="reason" class="mt-1 whitespace-pre-line">{{ reason }}</p>
      <p v-else class="mt-1">No detailed feedback was provided. Write to support if you need to know what to change.</p>
    </section>

    <AuthSubmit type="button" :loading="isPending" @click="reopenApplication">
      Reopen and fix my application
    </AuthSubmit>
    <p class="text-[0.9rem] text-muted-foreground">
      Your details are kept, so you only edit what needs fixing. You will be asked for your NIN again. Having trouble?
      <a :href="`mailto:${SUPPORT_EMAIL}`" :class="authLink">{{ SUPPORT_EMAIL }}</a>
    </p>
  </ApplicationStatus>
</template>
