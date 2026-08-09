<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { VERIFICATION_FAILED_COPY } from '~/lib/lawyerOnboardingStatus'
import { cn } from '@/lib/utils'

withDefaults(
  defineProps<{
    termsAccepted: boolean
    refundPolicyAccepted?: boolean
    /** Clients only accept T&C; lawyers also accept the verification refund policy. */
    variant?: 'client' | 'lawyer'
    /** Validation message rendered inline under the terms checkbox. */
    error?: string | null
    /** Drop outer chrome when nested inside another card/section. */
    embedded?: boolean
    /** Tighter sticky-footer layout: shorter copy, denser spacing. */
    compact?: boolean
  }>(),
  { variant: 'lawyer', error: null, embedded: false, compact: false },
)

const emit = defineEmits<{
  'update:termsAccepted': [value: boolean]
  'update:refundPolicyAccepted': [value: boolean]
}>()

const termsId = useId()
const refundId = useId()
</script>

<template>
  <div
    :class="cn(
      'flex flex-col',
      compact ? 'gap-2.5' : 'gap-4',
      !embedded && !compact && 'rounded-xl border border-border/50 bg-background/80 p-4',
      compact && 'rounded-xl border border-border/50 bg-muted/40 p-3 sm:p-3.5',
    )"
  >
    <p v-if="!embedded && !compact" class="text-sm font-semibold text-foreground">
      Legal agreements
    </p>

    <div
      :class="cn(
        'flex flex-col',
        compact ? 'gap-3 sm:grid sm:grid-cols-2 sm:gap-4' : 'gap-4',
      )"
    >
      <Field>
        <div class="flex items-start gap-3">
          <Checkbox
            :id="termsId"
            :model-value="termsAccepted === true"
            class="mt-0.5"
            @update:model-value="(v) => emit('update:termsAccepted', !!v)"
          />
          <div class="grid gap-0.5">
            <FieldLabel
              :for="termsId"
              class="cursor-pointer text-sm font-normal leading-snug"
            >
              I accept the
              <NuxtLink
                to="/terms"
                class="font-medium text-primary underline underline-offset-2"
                target="_blank"
              >
                Terms &amp; Conditions
              </NuxtLink>
              <span class="text-destructive">*</span>
            </FieldLabel>
            <FieldDescription v-if="!compact">
              Required to complete registration on GetaLawyer.
            </FieldDescription>
          </div>
        </div>
      </Field>

      <Field v-if="variant === 'lawyer'">
        <div class="flex items-start gap-3">
          <Checkbox
            :id="refundId"
            :model-value="refundPolicyAccepted === true"
            class="mt-0.5"
            @update:model-value="(v) => emit('update:refundPolicyAccepted', !!v)"
          />
          <div class="grid gap-0.5">
            <FieldLabel
              :for="refundId"
              class="cursor-pointer text-sm font-normal leading-snug"
            >
              I understand the verification refund policy
              <span class="text-destructive">*</span>
            </FieldLabel>
            <FieldDescription :class="compact ? 'text-xs' : undefined">
              {{ VERIFICATION_FAILED_COPY.refundNote }}
            </FieldDescription>
          </div>
        </div>
      </Field>
    </div>

    <p v-if="error" class="text-sm font-medium text-destructive" role="alert">
      {{ error }}
    </p>
  </div>
</template>
