<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { type DateValue, getLocalTimeZone, today, parseDate } from '@internationalized/date'
import { ChevronDownIcon } from 'lucide-vue-next'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { lawyerPersonalInfoSchema } from '~/schemas/lawyerPersonalInfo'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { getLgasForState, NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'
import { Card } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('personal_info')

const inputClass =
  'h-11 rounded-xl border-border/50 bg-white/80 text-base placeholder:text-muted-foreground/50 focus:bg-white'

const selectTriggerClass = `${inputClass} w-full`

const store = useLawyerOnboardingStore()

const registerValidate = inject<
  ((fn: (() => Promise<boolean>) | null) => void) | undefined
>('registerLawyerOnboardingStepValidate', undefined)

const genders = [
  { label: 'Male', value: 'male' as const },
  { label: 'Female', value: 'female' as const },
  { label: 'Other', value: 'other' as const },
]

function snapshotFromStore() {
  const p = store.personalInfo
  return {
    firstName: p.firstName ?? '',
    lastName: p.lastName ?? '',
    middleName: p.middleName ?? '',
    dateOfBirth: p.dateOfBirth ?? '',
    gender: p.gender,
    state: p.state ?? '',
    lga: p.lga ?? '',
  }
}

const form = useForm({
  defaultValues: snapshotFromStore(),
  validators: {
    onBlur: lawyerPersonalInfoSchema,
    onSubmit: lawyerPersonalInfoSchema,
  },
  validatorAdapter: zodValidator(),
  onSubmit: async ({ value }) => {
    Object.assign(store.personalInfo, value)
  },
})

/** Reactive snapshot — `form.state.values` is not tracked by Vue watchers. */
const formValues = form.useStore((state) => state.values)
const formFieldMeta = form.useStore((state) => state.fieldMeta)

function syncFormToStore() {
  Object.assign(store.personalInfo, { ...formValues.value })
}

watch(
  formValues,
  (v) => {
    Object.assign(store.personalInfo, v)
  },
  { deep: true },
)

const dobDate = ref<DateValue | undefined>()

function syncDobFromIso(iso: string | undefined) {
  if (!iso) {
    dobDate.value = undefined
    return
  }
  try {
    dobDate.value = parseDate(iso.split('T')[0])
  } catch {
    dobDate.value = undefined
  }
}

watch(
  () => formValues.value.dateOfBirth,
  (iso) => syncDobFromIso(iso),
  { immediate: true },
)

const formState = form.useStore((state) => state.values.state)

const selectedState = computed(() => String(formState.value ?? '').trim())

const lgaOptions = computed(() => getLgasForState(selectedState.value))

watch(formState, (state, prev) => {
  if (prev !== undefined && state !== prev) {
    form.setFieldValue('lga', '')
  }
})

const maxDate = today(getLocalTimeZone()).subtract({ years: 18 })

const submitAttempted = ref(false)

/** Show errors after blur or after a failed Continue. */
function isInvalid(field: { state: { meta: { isTouched: boolean; isValid: boolean } } }) {
  if (submitAttempted.value) return !field.state.meta.isValid
  return field.state.meta.isTouched && !field.state.meta.isValid
}

function resetFormFromStore() {
  form.reset(snapshotFromStore())
  syncDobFromIso(formValues.value.dateOfBirth)
}

onMounted(() => {
  resetFormFromStore()

  registerValidate?.(async () => {
    submitAttempted.value = true
    syncFormToStore()

    await form.validateAllFields('submit')
    const meta = formFieldMeta.value
    const invalid = meta && Object.values(meta).some((m) => !m.isValid)
    if (invalid) return false

    const parsed = lawyerPersonalInfoSchema.safeParse(formValues.value)
    if (!parsed.success) return false

    Object.assign(store.personalInfo, parsed.data)
    submitAttempted.value = false
    return true
  })
})

onBeforeUnmount(() => {
  registerValidate?.(null)
})

const hydratedFromDraft = ref(false)
watch(
  () => store.draft,
  (draft) => {
    if (hydratedFromDraft.value || !draft?.data?.personal) return
    hydratedFromDraft.value = true
    submitAttempted.value = false
    resetFormFromStore()
  },
)
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
        <FieldGroup class="gap-5">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <form.Field v-slot="{ field }" name="firstName">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">First name</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="First name"
                  autocomplete="given-name"
                  :class="inputClass"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="middleName">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">
                  Middle name
                  <span class="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="Middle name"
                  autocomplete="additional-name"
                  :class="inputClass"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="lastName">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Last name</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="Last name"
                  autocomplete="family-name"
                  :class="inputClass"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <form.Field v-slot="{ field }" name="dateOfBirth">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="`${field.name}-trigger`">Date of birth</FieldLabel>
                <Popover v-slot="{ close }">
                  <PopoverTrigger as-child>
                    <Button
                      :id="`${field.name}-trigger`"
                      type="button"
                      variant="outline"
                      class="h-11 w-full justify-between rounded-xl border-border/50 bg-white/80 font-normal text-foreground shadow-none hover:bg-white focus:bg-white"
                      :aria-invalid="isInvalid(field)"
                      @blur="field.handleBlur"
                    >
                      <span :class="dobDate ? 'text-foreground' : 'text-muted-foreground/70'">
                        {{
                          dobDate
                            ? dobDate.toDate(getLocalTimeZone()).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                            : 'Select your date of birth'
                        }}
                      </span>
                      <ChevronDownIcon class="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      v-model="dobDate"
                      :max-value="maxDate"
                      initial-focus
                      layout="month-and-year"
                      @update:model-value="(val) => {
                        if (val) {
                          field.handleChange(val.toDate(getLocalTimeZone()).toISOString())
                          field.handleBlur()
                        }
                        close()
                      }"
                    />
                  </PopoverContent>
                </Popover>
                <FieldDescription>
                  You must be at least 18 years old to register as a lawyer.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="gender">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Gender</FieldLabel>
                <Select
                  :model-value="field.state.value"
                  @update:model-value="(v) => {
                    field.handleChange(v)
                    field.handleBlur()
                  }"
                >
                  <SelectTrigger
                    :id="field.name"
                    class="h-11 w-full rounded-xl border-border/50 bg-white/80 text-base focus:bg-white"
                    :aria-invalid="isInvalid(field)"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="g in genders" :key="g.value" :value="g.value">
                      {{ g.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </div>

          <div class="border-t border-border/40 pt-5">
            <p class="mb-4 text-sm font-medium text-sidebar">Location</p>
            <FieldDescription class="mb-4">
              Your current state and local government area of residence.
            </FieldDescription>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <form.Field v-slot="{ field }" name="state">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">State</FieldLabel>
                  <Select
                    :model-value="field.state.value || undefined"
                    @update:model-value="(v) => {
                      field.handleChange(v ?? '')
                      field.handleBlur()
                    }"
                  >
                    <SelectTrigger
                      :id="field.name"
                      :class="selectTriggerClass"
                      :aria-invalid="isInvalid(field)"
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="name in NIGERIA_STATE_NAMES"
                        :key="name"
                        :value="name"
                      >
                        {{ name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field v-slot="{ field }" name="lga">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">LGA</FieldLabel>
                  <Select
                    :key="`lga-${selectedState}`"
                    :model-value="field.state.value || undefined"
                    :disabled="!selectedState"
                    @update:model-value="(v) => {
                      field.handleChange(v ?? '')
                      field.handleBlur()
                    }"
                  >
                    <SelectTrigger
                      :id="field.name"
                      :class="selectTriggerClass"
                      :aria-invalid="isInvalid(field)"
                      :disabled="!selectedState"
                    >
                      <SelectValue
                        :placeholder="selectedState ? 'Select LGA' : 'Select state first'"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="lgaName in lgaOptions"
                        :key="lgaName"
                        :value="lgaName"
                      >
                        {{ lgaName }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>
            </div>
          </div>

          <p class="text-sm leading-relaxed text-muted-foreground">
            All fields except middle name are required for identity verification.
          </p>
        </FieldGroup>
      </div>
    </Card>
  </div>
</template>
