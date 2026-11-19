<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { lawyerNinSchema } from '~/schemas/lawyerNin'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'

definePageMeta({
  layout: 'onboarding-lawyer',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('nin_verification')

const store = useLawyerOnboardingStore()
const ninState = store.ninVerification
const consentFieldId = useId()

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

const { form, formValues, isInvalid, reset } = useWizardStepForm({
  snapshot: snapshotFromStore,
  parse: (values) => lawyerNinSchema.safeParse(values),
  sync: (values) => {
    ninState.nin = String(values.nin ?? '').replace(/\D/g, '').slice(0, 11)
    ninState.consent = values.consent === true
  },
  commit: (parsed) => {
    ninState.nin = parsed.nin
    ninState.consent = parsed.consent
  },
  // Already verified by admin or awaiting review: Continue just moves on.
  skip: () => isAdminVerified.value || isSubmittedPending.value,
  onValidated: () => {
    suppressPendingUntilLeave.value = true
  },
})

const ninLength = computed(() => String(formValues.value.nin ?? '').length)

onBeforeUnmount(() => {
  store.clearNinResubmitMode()
})

watch(isSubmittedPending, (pending) => {
  if (pending) reset()
})

watch(
  () => ninState.isSubmitted,
  (submitted) => {
    if (!submitted && !ninState.verified) {
      reset()
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
  <div>
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <!-- verified by the review team: nothing left to do here -->
    <section
      v-if="isAdminVerified"
      aria-labelledby="nin-verified-title"
      class="mt-[1.6rem] grid grid-cols-[2.6rem_minmax(0,1fr)] gap-[0.9rem] rounded-card border border-border bg-card p-[clamp(1.1rem,2.4vw,1.5rem)]"
    >
      <span class="grid size-[2.6rem] place-items-center rounded-[0.9rem] bg-primary text-white">
        <CanopyGlyph name="tick" :size="16" :stroke="3.2" />
      </span>
      <div>
        <p class="text-[0.78rem] font-bold tracking-[0.06em] text-brand uppercase">Verified by getalawyer</p>
        <h2 id="nin-verified-title" class="mt-1 text-[1.3rem] font-[650] tracking-[-0.02em]">Identity verified</h2>
        <p class="mt-1 text-muted-foreground">
          Your NIN is verified. It cannot be changed while this application is in review.
        </p>
      </div>
    </section>

    <!-- already saved (a return visit, not the moment after saving from the form) -->
    <section
      v-else-if="showPendingConfirmation"
      aria-labelledby="nin-saved-title"
      class="mt-[1.6rem] grid grid-cols-[2.6rem_minmax(0,1fr)] gap-[0.9rem] rounded-card border border-border bg-card p-[clamp(1.1rem,2.4vw,1.5rem)]"
    >
      <span class="grid size-[2.6rem] place-items-center rounded-[0.9rem] bg-primary text-white">
        <CanopyGlyph name="tick" :size="16" :stroke="3.2" />
      </span>
      <div class="grid justify-items-start gap-[0.7rem]">
        <div>
          <h2 id="nin-saved-title" class="text-[1.3rem] font-[650] tracking-[-0.02em]">NIN received</h2>
          <p class="mt-1 text-muted-foreground">
            We have your NIN and keep it encrypted. If you entered it wrongly, you can change it until our team finishes verification.
          </p>
        </div>
        <Button type="button" variant="line" size="pill-sm" @click="store.beginChangeNin()">
          Change NIN
        </Button>
        <p :class="canopyHint">
          Press <b class="font-semibold text-foreground">Save and return</b> to keep this NIN.
        </p>
      </div>
    </section>

    <!-- entry form -->
    <div v-if="showEntryForm" :class="canopyForm">
      <FieldSet :class="canopyGroup">
        <legend :class="canopyLegend">National ID</legend>
        <form.Field v-slot="{ field }" name="nin">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">
              NIN
            </FieldLabel>
            <InputGroup :class="authInputGroup">
              <InputGroupInput
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                placeholder="11 digits"
                autocomplete="off"
                inputmode="numeric"
                maxlength="11"
                :class="authInputGroupControl"
                class="tracking-[0.04em] placeholder:tracking-normal"
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @update:model-value="(v: unknown) => onNinInput(field, v)"
              />
              <InputGroupAddon align="inline-end">
                <span
                  class="pr-1 text-[0.8rem] font-semibold"
                  :class="ninLength === 11 ? 'text-brand' : 'text-muted-foreground'"
                >
                  {{ ninLength }}/11
                </span>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription :class="canopyHint">
              Your 11-digit number from NIMC. We keep it encrypted and only use it to verify you.
            </FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
      </FieldSet>

      <FieldSet :class="canopyGroup">
        <legend :class="canopyLegend">Consent</legend>
        <form.Field v-slot="{ field }" name="consent">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <Label :for="consentFieldId" :class="canopyChoice">
              <Checkbox
                :id="consentFieldId"
                :model-value="field.state.value === true"
                :class="canopyCheckbox"
                @update:model-value="(v) => {
                  field.handleChange(!!v)
                  field.handleBlur()
                }"
              />
              <span class="grid min-w-0 flex-1 gap-1">
                <span class="text-[0.95rem] leading-snug font-semibold text-foreground">
                  I agree to getalawyer verifying my identity with NIMC.
                </span>
                <span class="text-[0.85rem] leading-normal font-normal text-muted-foreground">
                  Required. Used only to verify your identity.
                </span>
              </span>
            </Label>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
      </FieldSet>
    </div>
  </div>
</template>
