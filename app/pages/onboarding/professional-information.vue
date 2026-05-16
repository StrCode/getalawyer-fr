<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, useId, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { PhCalendarBlank, PhStudent, PhBuildings } from '@phosphor-icons/vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import {
  isValidScnDigits,
  normalizeScnDigitsOnly,
  SCN_MAX_DIGITS
} from '~/lib/scn'
import { lawyerProfessionalInfoSchema } from '~/app/schemas/lawyerProfessionalInfo'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '~/components/ui/input-group'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()

const registerValidate = inject<
  ((fn: (() => Promise<boolean>) | null) => void) | undefined
>('registerLawyerOnboardingStepValidate', undefined)

function snapshotFromStore() {
  const p = store.professionalInfo
  return {
    barNumber: p.barNumber,
    yearOfCall: p.yearOfCall,
    university: p.university,
    llbYear: p.llbYear,
    lawSchool: p.lawSchool
  }
}

const form = useForm({
  defaultValues: snapshotFromStore(),
  validators: {
    onChange: lawyerProfessionalInfoSchema
  },
  validatorAdapter: zodValidator(),
  onSubmit: async ({ value }) => {
    Object.assign(store.professionalInfo, value)
  }
})

// Sync form values back to store
watch(
  () => form.state.values,
  (v) => {
    Object.assign(store.professionalInfo, v)
  },
  { deep: true }
)

onMounted(() => {
  // Sync store back to form if needed (initial load)
  form.setFieldValue('barNumber', store.professionalInfo.barNumber)
  form.setFieldValue('yearOfCall', store.professionalInfo.yearOfCall)
  form.setFieldValue('university', store.professionalInfo.university)
  form.setFieldValue('llbYear', store.professionalInfo.llbYear)
  form.setFieldValue('lawSchool', store.professionalInfo.lawSchool)

  registerValidate?.(async () => {
    await form.validateAllFields('submit')
    if (form.state.fieldMeta && Object.values(form.state.fieldMeta).some(m => m.errors.length > 0)) {
      return false
    }
    return true
  })
})

onBeforeUnmount(() => {
  registerValidate?.(null)
})

const currentYear = new Date().getFullYear()
const yearMin = 1970
const formId = useId()

const barNumberStr = computed(() => String(form.state.values.barNumber ?? ''))

const scnCounterClass = computed(() => {
  const n = barNumberStr.value.length
  if (n === 0) return 'text-muted-foreground/60'
  if (isValidScnDigits(barNumberStr.value)) return 'text-primary'
  return 'text-amber-700'
})

function onScnModelUpdate(field: any, v: unknown) {
  field.handleChange(normalizeScnDigitsOnly(String(v ?? '')))
}

function isInvalid(field: any) {
  return field.state.meta.isTouched && field.state.meta.errors.length > 0
}
</script>

<template>
  <div class="space-y-12 pb-20">
    <div class="mb-10 space-y-2">
      <h1 class="text-2xl font-bold text-gray-900">Professional Background</h1>
      <p class="text-sm text-gray-600">
        We use this to confirm you are enrolled with the Nigerian Bar Association. Provide your legal education and bar admission details.
      </p>
    </div>

    <div class="space-y-10">
      <!-- Bar admission -->
      <div class="space-y-6">
        <p class="text-3 font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          Bar admission
        </p>

        <form.Field v-slot="{ field }" name="barNumber">
          <Field
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
            :data-invalid="isInvalid(field)"
          >
            <FieldLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
              :for="field.name"
            >
              Supreme Court enrolment number (SCN) <span class="text-primary">*</span>
            </FieldLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <InputGroup
                class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
              >
                <InputGroupAddon>
                  <InputGroupText class="font-mono text-sm font-semibold text-foreground tabular-nums">
                    SCN
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="1234"
                  autocomplete="off"
                  inputmode="numeric"
                  :maxlength="SCN_MAX_DIGITS"
                  class="h-12 min-h-12 text-base tabular-nums md:text-sm"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => onScnModelUpdate(field, v)"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText
                    class="text-2.5 font-bold uppercase tracking-widest tabular-nums"
                    :class="scnCounterClass"
                  >
                    {{ barNumberStr.length }}/{{ SCN_MAX_DIGITS }}
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                Your NBA Supreme Court number — also called a Supreme Court Enrolment Number — is issued when you are enrolled at the Supreme Court of Nigeria. Type
                <span class="font-semibold text-foreground/90">only the numeric part</span>
                (4–6 digits), e.g.
                <span class="font-mono font-semibold text-foreground/90">SCN1234</span>
                → enter
                <span class="font-mono font-semibold text-foreground/90">1234</span>.
              </FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </div>
          </Field>
        </form.Field>

        <form.Field v-slot="{ field }" name="yearOfCall">
          <Field
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
            :data-invalid="isInvalid(field)"
          >
            <FieldLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
              :for="field.name"
            >
              Year called to the Nigerian Bar <span class="text-primary">*</span>
            </FieldLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <InputGroup
                class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
              >
                <InputGroupAddon>
                  <PhCalendarBlank class="size-5 text-muted-foreground" weight="duotone" />
                </InputGroupAddon>
                <InputGroupInput
                  :id="field.name"
                  :name="field.name"
                  type="number"
                  :min="yearMin"
                  :max="currentYear"
                  :model-value="field.state.value"
                  placeholder="Year"
                  class="h-12 min-h-12 text-base tabular-nums md:text-sm"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText class="text-2.5 font-bold uppercase tracking-widest text-muted-foreground">
                    {{ yearMin }}–{{ currentYear }}
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                Calendar year you were admitted to the bar in Nigeria (after completing the Nigerian Law School Bar Part II programme).
              </FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </div>
          </Field>
        </form.Field>
      </div>

      <!-- University -->
      <div class="space-y-6">
        <p class="text-3 font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          University education
        </p>

        <form.Field v-slot="{ field }" name="university">
          <Field
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
            :data-invalid="isInvalid(field)"
          >
            <FieldLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
              :for="field.name"
            >
              University (LLB) <span class="text-primary">*</span>
            </FieldLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <InputGroup
                class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
              >
                <InputGroupAddon>
                  <PhStudent class="size-5 text-muted-foreground" weight="duotone" />
                </InputGroupAddon>
                <InputGroupInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="e.g. University of Lagos"
                  autocomplete="organization"
                  class="h-12 min-h-12 text-base md:text-sm"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
              </InputGroup>
              <FieldDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                The institution where you completed your Bachelor of Laws (LLB) degree.
              </FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </div>
          </Field>
        </form.Field>

        <form.Field v-slot="{ field }" name="llbYear">
          <Field
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
            :data-invalid="isInvalid(field)"
          >
            <FieldLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
              :for="field.name"
            >
              Year of LLB graduation <span class="text-primary">*</span>
            </FieldLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <InputGroup
                class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
              >
                <InputGroupAddon>
                  <PhCalendarBlank class="size-5 text-muted-foreground" weight="duotone" />
                </InputGroupAddon>
                <InputGroupInput
                  :id="field.name"
                  :name="field.name"
                  type="number"
                  :min="yearMin"
                  :max="currentYear"
                  :model-value="field.state.value"
                  placeholder="Year"
                  class="h-12 min-h-12 text-base tabular-nums md:text-sm"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText class="text-2.5 font-bold uppercase tracking-widest text-muted-foreground">
                    {{ yearMin }}–{{ currentYear }}
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                Year you finished your LLB. It must not be after your year of call to the bar.
              </FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </div>
          </Field>
        </form.Field>
      </div>

      <!-- Law school -->
      <div class="space-y-6">
        <p class="text-3 font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          Nigerian Law School
        </p>

        <form.Field v-slot="{ field }" name="lawSchool">
          <Field
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
            :data-invalid="isInvalid(field)"
          >
            <FieldLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
              :for="field.name"
            >
              NLS campus <span class="text-primary">*</span>
            </FieldLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <InputGroup
                class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
              >
                <InputGroupAddon>
                  <PhBuildings class="size-5 text-muted-foreground" weight="duotone" />
                </InputGroupAddon>
                <InputGroupInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="e.g. Lagos Campus"
                  autocomplete="off"
                  class="h-12 min-h-12 text-base md:text-sm"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
              </InputGroup>
              <FieldDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                Nigerian Law School campus where you attended the Bar Part II programme (often named after the city or region).
              </FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </div>
          </Field>
        </form.Field>
      </div>
    </div>
  </div>
</template>
