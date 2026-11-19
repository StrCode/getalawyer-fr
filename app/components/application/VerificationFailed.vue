<script setup lang="ts">
import { useReopenApplication } from '~/composables/useOnboardingRestart'
import { VERIFICATION_FAILED_COPY } from '~/lib/lawyerOnboardingStatus'

/**
 * The application home when identity or enrolment could not be verified: what
 * the review team found, where the refund stands, and how to start again.
 * Starting again reopens the application, and the page that shows this then
 * switches to the editable home by itself.
 */
defineProps<{
  /** What the review team wrote. */
  reason: string
  /** Where the membership fee stands; "later" when nothing was paid. */
  membership: 'refunding' | 'refunded' | 'later'
  /** The server refuses to reopen the application while a refund is in flight. */
  refundInFlight: boolean
}>()

const { reopen, isPending } = useReopenApplication()

async function startNewApplication() {
  await reopen({
    done: { title: 'Application reopened', description: 'Update your details, then submit and pay again.' },
    failed: 'Could not start a new application',
  })
}
</script>

<template>
  <ApplicationStatus
    kicker="Verification"
    :title="VERIFICATION_FAILED_COPY.title"
    :description="VERIFICATION_FAILED_COPY.description"
    :pill="{ label: 'Not verified', tone: 'bad' }"
    :membership="membership"
    sections-state="reopen"
  >
    <section v-if="reason" aria-labelledby="failure-title" class="rounded-[1.1rem] border border-destructive/30 bg-destructive/10 px-4 py-[0.95rem]">
      <h2 id="failure-title" class="font-semibold text-destructive">What the review team found</h2>
      <p class="mt-1 whitespace-pre-line">{{ reason }}</p>
    </section>
    <p v-if="membership !== 'later'" class="rounded-[1.1rem] border border-warning/30 bg-warning/10 px-4 py-[0.85rem] text-warning-subtle-foreground">
      <b class="block font-semibold">About your payment</b>
      {{ VERIFICATION_FAILED_COPY.refundNote }}
    </p>
    <section class="rounded-card border border-border bg-card p-[clamp(1.1rem,2.4vw,1.5rem)]">
      <h2 class="text-[1.3rem] font-[650] tracking-[-0.02em]">{{ VERIFICATION_FAILED_COPY.resubmitTitle }}</h2>
      <p class="mt-1 text-muted-foreground">{{ VERIFICATION_FAILED_COPY.resubmitDescription }}</p>
      <ol class="mt-4 grid gap-[0.6rem]">
        <li v-for="(step, index) in VERIFICATION_FAILED_COPY.resubmitSteps" :key="step" class="flex items-start gap-3">
          <span class="grid size-7 flex-none place-items-center rounded-full bg-mint font-display text-[0.9rem] font-bold text-deep">{{ index + 1 }}</span>
          <span>{{ step }}</span>
        </li>
      </ol>
      <AuthSubmit type="button" :loading="isPending" :disabled="refundInFlight" class="mt-5" @click="startNewApplication">
        {{ VERIFICATION_FAILED_COPY.ctaLabel }}
      </AuthSubmit>
      <p v-if="refundInFlight" role="status" class="mt-3 text-[0.9rem] text-muted-foreground">
        Your refund is still being processed. You can start a new application as soon as it has gone through; this page checks by itself.
      </p>
    </section>
    <p class="text-[0.9rem] text-muted-foreground">
      {{ VERIFICATION_FAILED_COPY.supportLabel }}
      <a :href="`mailto:${SUPPORT_EMAIL}`" :class="authLink">{{ SUPPORT_EMAIL }}</a>
    </p>
  </ApplicationStatus>
</template>
