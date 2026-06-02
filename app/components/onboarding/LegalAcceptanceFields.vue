<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'

defineProps<{
  termsAccepted: boolean
  refundPolicyAccepted: boolean
}>()

const emit = defineEmits<{
  'update:termsAccepted': [value: boolean]
  'update:refundPolicyAccepted': [value: boolean]
}>()

const termsId = useId()
const refundId = useId()
</script>

<template>
  <div class="space-y-4 rounded-xl border border-border/50 bg-white/80 p-4">
    <p class="text-sm font-semibold text-foreground">Legal agreements</p>

    <Field>
      <div class="flex items-start gap-3">
        <Checkbox
          :id="termsId"
          :model-value="termsAccepted === true"
          class="mt-0.5"
          @update:model-value="(v) => emit('update:termsAccepted', !!v)"
        />
        <div class="grid gap-1">
          <FieldLabel :for="termsId" class="cursor-pointer font-normal leading-snug">
            I accept the
            <NuxtLink to="/privacy" class="font-semibold text-primary underline underline-offset-2" target="_blank">
              Terms &amp; Conditions
            </NuxtLink>
            <span class="text-destructive">*</span>
          </FieldLabel>
          <FieldDescription>
            Required to complete registration on GetaLawyer.
          </FieldDescription>
        </div>
      </div>
    </Field>

    <Field>
      <div class="flex items-start gap-3">
        <Checkbox
          :id="refundId"
          :model-value="refundPolicyAccepted === true"
          class="mt-0.5"
          @update:model-value="(v) => emit('update:refundPolicyAccepted', !!v)"
        />
        <div class="grid gap-1">
          <FieldLabel :for="refundId" class="cursor-pointer font-normal leading-snug">
            I understand the verification refund policy
            <span class="text-destructive">*</span>
          </FieldLabel>
          <FieldDescription>
            If identity or SCN verification fails after payment, your subscription is refunded minus a
            small admin fee (as stated at checkout).
          </FieldDescription>
        </div>
      </div>
    </Field>
  </div>
</template>
