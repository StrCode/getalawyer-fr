<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { isValidScnDigits, normalizeScnDigitsOnly, SCN_MAX_DIGITS } from '~/lib/scn'
import { lawyerProfessionalInfoSchema } from '~/schemas/lawyerProfessionalInfo'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { Card } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('professional_info')
const inputClass =
  'h-11 rounded-xl border-border/50 bg-white/80 text-base placeholder:text-muted-foreground/50 focus:bg-white'

const store = useLawyerOnboardingStore()

const registerValidate = inject<
  ((fn: (() => Promise<boolean>) | null) => void) | undefined
>('registerLawyerOnboardingStepValidate', undefined)

function snapshotFromStore() {
  const p = store.professionalInfo
  return {
    barNumber: p.barNumber ?? '',
    yearOfCall: p.yearOfCall,
  }
}

const form = useForm({
  defaultValues: snapshotFromStore(),
  validators: {
    onBlur: lawyerProfessionalInfoSchema,
    onSubmit: lawyerProfessionalInfoSchema,
  },
  validatorAdapter: zodValidator(),
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

function isInvalid(field: { state: { meta: { isTouched: boolean; isValid: boolean } } }) {
  if (submitAttempted.value) return !field.state.meta.isValid
  return field.state.meta.isTouched && !field.state.meta.isValid
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

function onScnInput(field: { handleChange: (v: string) => void }, v: unknown) {
  field.handleChange(normalizeScnDigitsOnly(String(v ?? '')))
}
</script>

<template>
  <div class="w-full space-y-8 pb-20">
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <Card
      class="relative w-full overflow-hidden rounded-3xl border border-border/50 bg-white/70 shadow-xl shadow-primary/5 backdrop-blur-xl"
    >
      <div
        class="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-muted/50 blur-3xl"
        aria-hidden="true"
      />

      <div class="relative z-10 p-6 sm:p-8">
        <FieldGroup class="gap-6">
          <form.Field v-slot="{ field }" name="barNumber">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">
                Supreme Court enrolment number (SCN)
                <span class="text-primary">*</span>
              </FieldLabel>
              <div class="flex gap-2">
                <span
                  class="flex h-11 shrink-0 items-center rounded-xl border border-border/50 bg-white/80 px-3 font-mono text-sm font-semibold text-foreground"
                >
                  SCN
                </span>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="12345"
                  autocomplete="off"
                  inputmode="numeric"
                  :maxlength="SCN_MAX_DIGITS"
                  :class="[inputClass, 'flex-1 font-mono tabular-nums']"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => onScnInput(field, v)"
                />
              </div>
              <FieldDescription>
                Digits only (4–6), e.g. for SCN12345 enter
                <span class="font-mono font-semibold">12345</span>.
                <span
                  class="ml-2 tabular-nums"
                  :class="isValidScnDigits(barNumberStr) ? 'text-primary' : 'text-muted-foreground'"
                >
                  {{ barNumberStr.length }}/{{ SCN_MAX_DIGITS }}
                </span>
              </FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="yearOfCall">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">
                Year called to the Nigerian Bar
                <span class="text-primary">*</span>
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
                  :class="inputClass"
                  :aria-invalid="isInvalid(field)"
                >
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="y in yearOptions" :key="y" :value="String(y)">
                    {{ y }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Calendar year you were admitted to the Nigerian Bar.
              </FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </FieldGroup>
      </div>
    </Card>
  </div>
</template>
