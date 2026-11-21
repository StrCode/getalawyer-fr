<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { REFUND_POLICY_SUMMARY } from '~/lib/lawyerOnboardingStatus'

/**
 * What someone agrees to before they finish: the terms, and for lawyers the
 * refund policy on the payment that follows. Shown at the point of commitment
 * (a lawyer's Submit, a client's Finish), each as one tappable row.
 */
withDefaults(
  defineProps<{
    termsAccepted: boolean
    refundPolicyAccepted?: boolean
    /** Clients accept the terms; lawyers also accept the verification refund policy. */
    variant?: 'client' | 'lawyer'
    /** Message shown under the rows when something is not accepted. */
    error?: string | null
  }>(),
  { variant: 'lawyer', error: null },
)

const emit = defineEmits<{
  'update:termsAccepted': [value: boolean]
  'update:refundPolicyAccepted': [value: boolean]
}>()

const termsId = useId()
const refundId = useId()
</script>

<template>
  <div class="grid gap-2.5">
    <label :for="termsId" :class="canopyChoice">
      <Checkbox
        :id="termsId"
        :model-value="termsAccepted === true"
        :class="canopyCheckbox"
        aria-required="true"
        @update:model-value="(v) => emit('update:termsAccepted', !!v)"
      />
      <span class="grid min-w-0 gap-0.75">
        <span class="text-base leading-snug font-medium">
          I accept the
          <NuxtLink to="/terms" target="_blank" :class="authLink" @click.stop>Terms and Conditions</NuxtLink>
        </span>
        <span class="text-sm text-muted-foreground">
          {{ variant === 'lawyer' ? 'Needed to submit your application.' : 'Needed to finish setting up.' }}
        </span>
      </span>
    </label>

    <label v-if="variant === 'lawyer'" :for="refundId" :class="canopyChoice">
      <Checkbox
        :id="refundId"
        :model-value="refundPolicyAccepted === true"
        :class="canopyCheckbox"
        aria-required="true"
        @update:model-value="(v) => emit('update:refundPolicyAccepted', !!v)"
      />
      <span class="grid min-w-0 gap-0.75">
        <span class="text-base leading-snug font-medium">I understand the verification refund policy</span>
        <span class="text-sm text-muted-foreground">{{ REFUND_POLICY_SUMMARY }}</span>
      </span>
    </label>

    <p v-if="error" role="alert" class="text-sm font-medium text-destructive">{{ error }}</p>
  </div>
</template>
