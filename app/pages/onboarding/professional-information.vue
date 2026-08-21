<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
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

const registerValidate = inject<
  ((fn: (() => Promise<boolean>) | null) => void) | undefined
>('registerLawyerOnboardingStepValidate', undefined)

function snapshotFromStore() {
  const p = store.professionalInfo
  return {
    barNumber: p.barNumber ?? '',
    scnFullNameAtCallToBar: p.scnFullNameAtCallToBar ?? '',
    yearOfCall: p.yearOfCall,
  }
}

const form = useForm({
  defaultValues: snapshotFromStore(),
  validators: {
    onChange: lawyerProfessionalInfoSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    Object.assign(store.professionalInfo, value)
  },
})

const formValues = form.useStore((state) => state.values)
const formFieldMeta = form.useStore((state) => state.fieldMeta)

function syncFormToStore() {
  Object.assign(store.professionalInfo, { ...formValues.value })
}

watch(
  formValues,
  (v) => {
    Object.assign(store.professionalInfo, v)
  },
  { deep: true },
)

const submitAttempted = ref(false)

function isInvalid(field: { state: { meta: { isBlurred: boolean; isValid: boolean } } }) {
  if (submitAttempted.value) return !field.state.meta.isValid
  return field.state.meta.isBlurred && !field.state.meta.isValid
}

const currentYear = new Date().getFullYear()
const yearMin = 1970
const yearOptions = computed(() => {
  const years: number[] = []
  for (let y = currentYear; y >= yearMin; y--) years.push(y)
  return years
})

const barNumberStr = computed(() => String(formValues.value.barNumber ?? ''))

onMounted(() => {
  form.reset(snapshotFromStore())

  registerValidate?.(async () => {
    submitAttempted.value = true
    syncFormToStore()
    await form.validateAllFields('submit')
    const meta = formFieldMeta.value
    const invalid = meta && Object.values(meta).some((m) => !m.isValid)
    if (invalid) return false
    const parsed = lawyerProfessionalInfoSchema.safeParse(formValues.value)
    if (!parsed.success) return false
    Object.assign(store.professionalInfo, parsed.data)
    submitAttempted.value = false
    return true
  })
})

onBeforeUnmount(() => {
  registerValidate?.(null)
})

useOnboardingDraftHydration('professional', () => {
  submitAttempted.value = false
  form.reset(snapshotFromStore())
})

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
                      @update:model-value="(v) => onScnInput(field, v)"
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
                  @update:model-value="field.handleChange"
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
