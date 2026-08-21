<script setup lang="ts">
import { CheckmarkCircle01Icon, IdentityCardIcon, SecurityCheckIcon, SquareLock01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { inject, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { lawyerNinSchema } from '~/schemas/lawyerNin'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'

const fieldLabelClass = 'text-sm'
const fieldClass = 'gap-1.5'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('nin_verification')

const store = useLawyerOnboardingStore()
const ninState = store.ninVerification
const consentFieldId = useId()

const registerValidate = inject<
  ((fn: (() => Promise<boolean>) | null) => void) | undefined
>('registerLawyerOnboardingStepValidate', undefined)

const isAdminVerified = computed(() => !!ninState.verified)
const isSubmittedPending = computed(() => !!ninState.isSubmitted && !ninState.verified)

/**
 * After first Continue from the entry form, keep the form mounted until we leave
 * so we don't flash the "NIN received" card before navigating to the next step.
 * Returning later (isSubmitted already true) still shows the confirmation UI.
 */
const suppressPendingUntilLeave = ref(false)

const showEntryForm = computed(
  () =>
    !isAdminVerified.value
    && (!isSubmittedPending.value || suppressPendingUntilLeave.value),
)
const showPendingConfirmation = computed(
  () =>
    isSubmittedPending.value
    && !isAdminVerified.value
    && !suppressPendingUntilLeave.value,
)

function snapshotFromStore() {
  return {
    nin: ninState.nin ?? '',
    consent: !!ninState.consent,
  }
}

const form = useForm({
  defaultValues: snapshotFromStore(),
  validators: {
    onChange: lawyerNinSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  validatorAdapter: zodValidator(),
  onSubmit: async ({ value }) => {
    ninState.nin = value.nin
    ninState.consent = value.consent
  },
})

const formValues = form.useStore((state) => state.values)
const formFieldMeta = form.useStore((state) => state.fieldMeta)

function syncFormToStore() {
  ninState.nin = String(formValues.value.nin ?? '').replace(/\D/g, '').slice(0, 11)
  ninState.consent = formValues.value.consent === true
}

watch(
  formValues,
  () => syncFormToStore(),
  { deep: true },
)

const submitAttempted = ref(false)

function isInvalid(field: { state: { meta: { isBlurred: boolean; isValid: boolean } } }) {
  if (submitAttempted.value) return !field.state.meta.isValid
  return field.state.meta.isBlurred && !field.state.meta.isValid
}

const ninLength = computed(() => String(formValues.value.nin ?? '').length)

onMounted(() => {
  form.reset(snapshotFromStore())

  registerValidate?.(async () => {
    if (isAdminVerified.value || isSubmittedPending.value) {
      return true
    }

    submitAttempted.value = true
    syncFormToStore()

    await form.validateAllFields('submit')
    const meta = formFieldMeta.value
    const invalid = meta && Object.values(meta).some((m) => !m.isValid)
    if (invalid) return false

    const parsed = lawyerNinSchema.safeParse({
      nin: ninState.nin,
      consent: ninState.consent,
    })
    if (!parsed.success) return false

    ninState.nin = parsed.data.nin
    ninState.consent = parsed.data.consent
    submitAttempted.value = false
    suppressPendingUntilLeave.value = true
    return true
  })
})

onBeforeUnmount(() => {
  registerValidate?.(null)
  store.clearNinResubmitMode()
})

watch(isSubmittedPending, (pending) => {
  if (pending) {
    submitAttempted.value = false
  }
})

watch(
  () => ninState.isSubmitted,
  (submitted) => {
    if (!submitted && !ninState.verified) {
      form.reset(snapshotFromStore())
      submitAttempted.value = false
      suppressPendingUntilLeave.value = false
    }
  },
)

function onNinInput(field: { handleChange: (v: string) => void }, raw: unknown) {
  const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 11)
  field.handleChange(digits)
}
</script>

<template>
  <div class="flex w-full flex-col gap-5">
    <OnboardingClientStepHeader
      v-if="!isAdminVerified"
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <!-- Admin verified -->
    <Card
      v-if="isAdminVerified"
      class="relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 text-center shadow-xs sm:p-8"
    >
      <div class="relative z-10">
        <div
          class="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border-4 border-background bg-primary/5 text-primary shadow-xs"
        >
          <HugeiconsIcon :icon="SquareLock01Icon" class="size-8" />
        </div>
        <div
          class="eyebrow mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary-strong"
        >
          <HugeiconsIcon :icon="SecurityCheckIcon" class="size-4" />
          Verified by GetaLawyer
        </div>
        <h2 class="mb-2 text-2xl font-medium tracking-[-0.02em] text-foreground">
          Identity verified
        </h2>
        <p class="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Your NIN is verified. It can’t be changed while this application is in review.
        </p>
      </div>
    </Card>

    <!-- Already submitted (return visit — not mid-Continue from the entry form) -->
    <Card
      v-else-if="showPendingConfirmation"
      class="relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-xs"
    >
      <div class="relative z-10 p-6 text-center sm:p-8">
        <div
          class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5"
        >
          <HugeiconsIcon :icon="CheckmarkCircle01Icon" class="size-7 text-primary" />
        </div>
        <p class="mb-1 text-lg font-medium text-foreground">NIN received</p>
        <p class="mx-auto mb-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          We’ve saved your NIN securely. Continue to the next step, or change it if you entered it
          incorrectly — until our team finishes verification.
        </p>
        <Button
          type="button"
          variant="outline"
          class="h-11 cursor-pointer rounded-xl"
          @click="store.beginChangeNin()"
        >
          Change NIN
        </Button>
        <p class="mt-5 text-sm text-muted-foreground">
          Press <span class="font-medium text-foreground">Continue</span> to keep this NIN and move on.
        </p>
      </div>
    </Card>

    <!-- Entry form -->
    <Card
      v-if="showEntryForm"
      class="gap-0 p-5 sm:p-7"
    >
      <FieldGroup class="gap-5">
        <FieldSet class="gap-3">
          <FieldLegend variant="label" class="mb-1.5">
            National ID
          </FieldLegend>
          <FieldGroup class="gap-4">
            <form.Field v-slot="{ field }" name="nin">
              <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="fieldLabelClass">
                  NIN
                </FieldLabel>
                <InputGroup class="h-11 rounded-xl border-border/50 bg-background shadow-none">
                  <InputGroupAddon>
                    <HugeiconsIcon :icon="IdentityCardIcon" class="size-5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    placeholder="11 digits"
                    autocomplete="off"
                    inputmode="numeric"
                    maxlength="11"
                    class="font-mono text-base tabular-nums"
                    :aria-invalid="isInvalid(field)"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => onNinInput(field, v)"
                  />
                  <InputGroupAddon align="inline-end">
                    <span
                      class="text-xs font-medium tracking-wider uppercase tabular-nums"
                      :class="ninLength === 11 ? 'text-primary' : 'text-muted-foreground/60'"
                    >
                      {{ ninLength }}/11
                    </span>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Your 11-digit number from NIMC. We keep it encrypted and only use it to verify you.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet class="gap-3 border-t border-border/40 pt-5">
          <FieldLegend variant="label" class="mb-1.5">
            Consent
          </FieldLegend>
          <FieldGroup class="gap-4">
            <form.Field v-slot="{ field }" name="consent">
              <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                <Label
                  :for="consentFieldId"
                  class="flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 bg-background p-4 transition-colors has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/5"
                >
                  <Checkbox
                    :id="consentFieldId"
                    :model-value="field.state.value === true"
                    class="mt-0.5"
                    @update:model-value="(v) => {
                      field.handleChange(!!v)
                      field.handleBlur()
                    }"
                  />
                  <span class="grid min-w-0 flex-1 gap-1">
                    <span class="text-sm font-medium leading-snug text-foreground">
                      I agree to GetaLawyer verifying my identity with NIMC.
                    </span>
                    <span class="text-xs leading-relaxed text-muted-foreground">
                      Required. Used only to confirm you are a licensed professional.
                    </span>
                  </span>
                </Label>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </Card>
  </div>
</template>
