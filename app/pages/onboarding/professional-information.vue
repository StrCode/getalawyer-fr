<script setup lang="ts">
import { computed } from 'vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { isValidScnDigits, normalizeScnDigitsOnly, SCN_MAX_DIGITS } from '~/lib/scn'
import { lawyerProfessionalInfoSchema } from '~/schemas/lawyerProfessionalInfo'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { Card } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
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

const fieldControlClass =
  'h-11 w-full rounded-xl border-border/50 bg-background text-base shadow-none focus:bg-background'

const fieldLabelClass = 'text-sm'
const fieldClass = 'gap-2'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('professional_info')

const store = useLawyerOnboardingStore()

function snapshotFromStore() {
  const p = store.professionalInfo
  return {
    barNumber: p.barNumber ?? '',
    scnFullNameAtCallToBar: p.scnFullNameAtCallToBar ?? '',
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
const yearMin = 1970
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
  <div class="flex w-full flex-col gap-6">
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <Card class="gap-0 p-6 sm:p-8">
      <FieldGroup class="gap-6">
        <FieldSet class="gap-4">
          <FieldGroup class="gap-5">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <form.Field v-slot="{ field }" name="barNumber">
                <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" :class="fieldLabelClass">
                    Supreme Court number (SCN)
                  </FieldLabel>
                  <InputGroup class="h-11 rounded-xl border-border/50 bg-background shadow-none">
                    <InputGroupAddon>
                      <span class="font-mono text-sm font-medium text-foreground">SCN</span>
                    </InputGroupAddon>
                    <InputGroupInput
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      placeholder="12345"
                      autocomplete="off"
                      inputmode="numeric"
                      :maxlength="SCN_MAX_DIGITS"
                      class="font-mono text-base tabular-nums"
                      :aria-invalid="isInvalid(field)"
                      @blur="field.handleBlur"
                      @update:model-value="(v: unknown) => onScnInput(field, v)"
                    />
                    <InputGroupAddon align="inline-end">
                      <span
                        class="text-xs font-medium tracking-wider uppercase tabular-nums"
                        :class="isValidScnDigits(barNumberStr) ? 'text-primary' : 'text-muted-foreground/60'"
                      >
                        {{ barNumberStr.length }}/{{ SCN_MAX_DIGITS }}
                      </span>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Enter the digits only (4–6) — not the “SCN” prefix.
                  </FieldDescription>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field v-slot="{ field }" name="yearOfCall">
                <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" :class="fieldLabelClass">
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
                      :class="fieldControlClass"
                      :aria-invalid="isInvalid(field)"
                    >
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="y in yearOptions"
                        :key="y"
                        :value="String(y)"
                      >
                        {{ y }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    The year you were admitted to the Nigerian Bar.
                  </FieldDescription>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>
            </div>

            <form.Field v-slot="{ field }" name="scnFullNameAtCallToBar">
              <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="fieldLabelClass">
                  Name on your SCN
                </FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="fieldControlClass"
                  placeholder="Exactly as on your call-to-bar records"
                  autocomplete="name"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v: string | number) => field.handleChange(String(v ?? ''))"
                />
                <FieldDescription>
                  For bar verification only — not shown on your public profile.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </FieldGroup>
        </FieldSet>

        <p class="text-sm leading-relaxed text-muted-foreground">
          All fields are required for verification.
        </p>
      </FieldGroup>
    </Card>
  </div>
</template>
