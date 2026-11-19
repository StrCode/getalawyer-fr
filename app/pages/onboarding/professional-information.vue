<script setup lang="ts">
import { computed } from 'vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { isValidScnDigits, normalizeScnDigitsOnly, SCN_MAX_DIGITS } from '~/lib/scn'
import { lawyerProfessionalInfoSchema } from '~/schemas/lawyerProfessionalInfo'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

definePageMeta({
  layout: 'onboarding-lawyer',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('professional_info')

const store = useLawyerOnboardingStore()

function snapshotFromStore() {
  const p = store.professionalInfo
  return {
    barNumber: p.barNumber ?? '',
    // Most lawyers are enrolled under the name on their ID; start from it so it
    // is typed once. It stays editable for anyone enrolled under another name.
    scnFullNameAtCallToBar: p.scnFullNameAtCallToBar || store.personalInfo.governmentIdLegalName || '',
    yearOfCall: p.yearOfCall,
  }
}

const { form, formValues, isInvalid } = useWizardStepForm({
  draftSection: 'professional',
  snapshot: snapshotFromStore,
  parse: (values) => lawyerProfessionalInfoSchema.safeParse(values),
  sync: (values) => Object.assign(store.professionalInfo, values),
  commit: (parsed) => Object.assign(store.professionalInfo, parsed),
})

const currentYear = new Date().getFullYear()
const yearMin = 1960
const yearOptions = computed(() => {
  const years: number[] = []
  for (let y = currentYear; y >= yearMin; y--) years.push(y)
  return years
})

const barNumberStr = computed(() => String(formValues.value.barNumber ?? ''))

function onScnInput(field: { handleChange: (v: string) => void }, v: unknown) {
  field.handleChange(normalizeScnDigitsOnly(String(v ?? '')))
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

    <div :class="canopyForm">
      <FieldSet :class="canopyGroup">
        <legend class="sr-only">Bar credentials</legend>
        <div class="grid gap-[0.9rem]">
            <div class="grid grid-cols-1 gap-[0.9rem] sm:grid-cols-2">
              <form.Field v-slot="{ field }" name="barNumber">
                <Field :class="canopyField" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">
                    Supreme Court number (SCN)
                  </FieldLabel>
                  <InputGroup :class="authInputGroup">
                    <InputGroupAddon>
                      <span class="pl-1 font-display text-[0.95rem] font-[650] text-deep">SCN</span>
                    </InputGroupAddon>
                    <InputGroupInput
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      placeholder="12345"
                      autocomplete="off"
                      inputmode="numeric"
                      :maxlength="SCN_MAX_DIGITS"
                      :class="authInputGroupControl" class="tracking-[0.04em] placeholder:tracking-normal"
                      :aria-invalid="isInvalid(field)"
                      @blur="field.handleBlur"
                      @update:model-value="(v: unknown) => onScnInput(field, v)"
                    />
                    <InputGroupAddon align="inline-end">
                      <span
                        class="pr-1 text-[0.8rem] font-semibold"
                        :class="isValidScnDigits(barNumberStr) ? 'text-brand' : 'text-muted-foreground'"
                      >
                        {{ barNumberStr.length }}/{{ SCN_MAX_DIGITS }}
                      </span>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription :class="canopyHint">
                    Digits only (4 to 6), without the “SCN” prefix.
                  </FieldDescription>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field v-slot="{ field }" name="yearOfCall">
                <Field :class="canopyField" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">
                    Year of call
                  </FieldLabel>
                  <Select
                    :model-value="field.state.value != null ? String(field.state.value) : undefined"
                    @update:model-value="(v) => {
                      field.handleChange(v ? Number(v) : undefined)
                      field.handleBlur()
                    }"
                  >
                    <SelectTrigger
                      :id="field.name"
                      :class="canopySelect"
                      :aria-invalid="isInvalid(field)"
                    >
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent :class="canopyPanel">
                      <SelectItem
                        v-for="y in yearOptions"
                        :key="y"
                        :value="String(y)"
                      >
                        {{ y }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription :class="canopyHint">
                    The year you were admitted to the Nigerian Bar.
                  </FieldDescription>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>
            </div>

            <form.Field v-slot="{ field }" name="scnFullNameAtCallToBar">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">
                  Name on your SCN
                </FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="authInput"
                  placeholder="Exactly as on your call-to-bar records"
                  autocomplete="name"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v: string | number) => field.handleChange(String(v ?? ''))"
                />
                <FieldDescription :class="canopyHint">
                  Used for bar verification only. Not shown on your public profile.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
        </div>
      </FieldSet>

      <p :class="canopyHint">
        All fields are required for verification.
      </p>
    </div>
  </div>
</template>
