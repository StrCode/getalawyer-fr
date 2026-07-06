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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('nin_verification')

const inputClass =
  'h-11 rounded-xl border-border/50 bg-card/80 text-base placeholder:text-muted-foreground/50 focus:bg-card'

const store = useLawyerOnboardingStore()
const ninState = store.ninVerification
const consentFieldId = useId()

const registerValidate = inject<
  ((fn: (() => Promise<boolean>) | null) => void) | undefined
>('registerLawyerOnboardingStepValidate', undefined)

const isAdminVerified = computed(() => !!ninState.verified)
const isSubmittedPending = computed(() => !!ninState.isSubmitted && !ninState.verified)
const showEntryForm = computed(() => !isAdminVerified.value && !isSubmittedPending.value)

function snapshotFromStore() {
  return {
    nin: ninState.nin ?? '',
    consent: !!ninState.consent,
  }
}

const form = useForm({
  defaultValues: snapshotFromStore(),
  validators: {
    onBlur: lawyerNinSchema,
    onSubmit: lawyerNinSchema,
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

function isInvalid(field: { state: { meta: { isTouched: boolean; isValid: boolean } } }) {
  if (submitAttempted.value) return !field.state.meta.isValid
  return field.state.meta.isTouched && !field.state.meta.isValid
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
    }
  },
)

function onNinInput(field: { handleChange: (v: string) => void }, raw: unknown) {
  const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 11)
  field.handleChange(digits)
}
</script>

<template>
  <div class="w-full space-y-8 pb-20">
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
      class="relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-card p-8 text-center shadow-sm sm:p-10"
    >
      <div
        class="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative z-10">
        <div
          class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-primary/5 text-primary shadow-sm"
        >
          <HugeiconsIcon :icon="SquareLock01Icon" class="h-10 w-10" />
        </div>
        <div
          class="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary"
        >
          <HugeiconsIcon :icon="SecurityCheckIcon" class="h-4 w-4" />
          Verified by Getalawyer
        </div>
       <h2 class="mb-3 text-2xl font-medium tracking-[-0.02em] text-foreground">Identity verified</h2>
        <p class="mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
          Your National Identification Number has been verified. It cannot be changed while your
          application is active.
        </p>
      </div>
    </Card>

    <!-- Already submitted -->
    <Card
      v-else-if="isSubmittedPending"
      class="relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm"
    >
      <div class="relative z-10 p-6 text-center sm:p-8">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5"
        >
          <HugeiconsIcon :icon="CheckmarkCircle01Icon" class="h-8 w-8 text-primary" />
        </div>
        <p class="mb-1 text-lg font-medium text-foreground">NIN already submitted</p>
        <p class="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Your NIN is saved securely. You can continue, or replace it if you made a mistake — until
          our team verifies it.
        </p>
        <Button type="button" variant="outline" class="rounded-xl" @click="store.beginChangeNin()">
          Change NIN
        </Button>
        <p class="mt-6 text-sm text-muted-foreground">
          Use <span class="font-medium text-foreground">Continue</span> to move on without
          changing your NIN.
        </p>
      </div>
    </Card>

    <!-- Entry form -->
    <Card
      v-else-if="showEntryForm"
      class="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div
        class="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-muted/50 blur-3xl"
        aria-hidden="true"
      />

      <div class="relative z-10 p-6 sm:p-8">
        <FieldGroup class="gap-6">
          <form.Field v-slot="{ field }" name="nin">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">
                National Identity Number (NIN)
                <span class="text-primary">*</span>
              </FieldLabel>
              <div class="flex gap-2">
                <span
                  class="flex h-11 shrink-0 items-center rounded-xl border border-border/50 bg-card/80 px-3 text-muted-foreground"
                  aria-hidden="true"
                >
                  <HugeiconsIcon :icon="IdentityCardIcon" class="h-5 w-5" />
                </span>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="11-digit NIN"
                  autocomplete="off"
                  inputmode="numeric"
                  maxlength="11"
                  :class="[inputClass, 'flex-1 font-mono tabular-nums']"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => onNinInput(field, v)"
                />
                <span
                  class="flex h-11 shrink-0 items-center rounded-xl border border-border/50 bg-card/80 px-3 text-xs font-medium uppercase tracking-wider tabular-nums"
                  :class="ninLength === 11 ? 'text-primary' : 'text-muted-foreground/60'"
                >
                  {{ ninLength }}/11
                </span>
              </div>
              <FieldDescription>Enter your 11-digit National Identity Number.</FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="consent">
            <Field :data-invalid="isInvalid(field)">
              <Label
                :for="consentFieldId"
                class="flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 bg-card/80 p-4 transition-colors has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/5"
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
                    I consent to Getalawyer verifying my identity with the National Identity
                    Management Commission (NIMC) for professional background checks.
                  </span>
                  <span class="text-xs leading-relaxed text-muted-foreground">
                    Required to proceed. Used only for identity verification.
                  </span>
                </span>
              </Label>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </FieldGroup>
      </div>
    </Card>
  </div>
</template>
