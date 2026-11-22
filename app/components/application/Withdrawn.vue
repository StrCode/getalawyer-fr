<script setup lang="ts">
import type { ReturnedMembership } from '~/lib/application-correction'
import { useReopenApplication } from '~/composables/useOnboardingRestart'

/** The application home after the lawyer withdrew it: where the refund stands, and applying again. */
const props = defineProps<{ membership: ReturnedMembership }>()

const { reopen, isPending } = useReopenApplication()
const refundPending = computed(() => props.membership === 'owed' || props.membership === 'refunding')

async function applyAgain() {
  await reopen({
    done: { title: 'Your application is open again', description: 'Check your details, enter your NIN, then submit and pay.' },
    failed: 'Could not open your application',
  })
}
</script>

<template>
  <ApplicationStatus
    kicker="Application withdrawn"
    title="You withdrew your application"
    description="We have stopped reviewing it."
    :pill="{ label: 'Withdrawn', tone: 'warn' }"
    :membership="membership"
    sections-state="reopen"
  >
    <AuthSubmit type="button" :loading="isPending" :disabled="refundPending" @click="applyAgain">
      Apply again
    </AuthSubmit>
    <p v-if="refundPending" role="status" class="text-sm text-muted-foreground">
      You can apply again once your refund has gone through. You will get an email when it has been sent, and this page checks by itself.
    </p>
    <p v-else class="text-sm text-muted-foreground">
      Your details are kept. You will be asked for your NIN again, and pay for a membership after you submit.
    </p>
    <p class="text-sm text-muted-foreground">
      Questions? Write to <a :href="`mailto:${SUPPORT_EMAIL}`" :class="authLink">{{ SUPPORT_EMAIL }}</a>.
    </p>
  </ApplicationStatus>
</template>
