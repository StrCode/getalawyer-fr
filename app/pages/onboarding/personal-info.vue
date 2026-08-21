<script setup lang="ts">
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref, watch } from 'vue'
import { type DateValue, getLocalTimeZone, today, parseDate } from '@internationalized/date'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { lawyerPersonalInfoSchema } from '~/schemas/lawyerPersonalInfo'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { getLgasForState, NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'
import { Card } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'

/** Taller touch targets + larger control text; labels stay text-sm for hierarchy. */
const fieldControlClass =
  'h-11 w-full rounded-xl border-border/50 bg-background text-base shadow-none focus:bg-background'

/** FieldLabel defaults to text-base — keep labels smaller than control text. */
const fieldLabelClass = 'text-sm'

/** Tighter label → control gap than Field’s default gap-3. */
const fieldClass = 'gap-1.5'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('personal_info')

const store = useLawyerOnboardingStore()

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
    governmentIdLegalName: p.governmentIdLegalName ?? '',
    dateOfBirth: p.dateOfBirth ?? '',
    gender: p.gender,
    state: p.state ?? '',
    lga: p.lga ?? '',
  }
}

const { form, formValues, isInvalid } = useWizardStepForm({
  draftSection: 'personal',
  snapshot: snapshotFromStore,
  parse: (values) => lawyerPersonalInfoSchema.safeParse(values),
  sync: (values) => Object.assign(store.personalInfo, values),
  commit: (parsed) => Object.assign(store.personalInfo, parsed),
  // reset() seeds the form from the store, so the store holds the same value
  onReset: () => syncDobFromIso(store.personalInfo.dateOfBirth ?? undefined),
})

const dobDate = ref<DateValue | undefined>()

function syncDobFromIso(iso: string | undefined) {
  if (!iso) {
    dobDate.value = undefined
    return
  }
  try {
    dobDate.value = parseDate(iso.split('T')[0] ?? '')
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

</script>

<template>
  <div class="flex w-full flex-col gap-5">
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <Card class="gap-0 p-5 sm:p-7">
    <FieldGroup class="gap-5">
      <FieldSet class="gap-3">
        <FieldLegend variant="label" class="mb-1.5">
          Name
        </FieldLegend>
        <FieldGroup class="gap-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <form.Field v-slot="{ field }" name="firstName">
              <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="fieldLabelClass">First name</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="fieldControlClass"
                  placeholder="First name"
                  autocomplete="given-name"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="middleName">
              <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="fieldLabelClass">
                  Middle name
                  <span class="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="fieldControlClass"
                  placeholder="Middle name"
                  autocomplete="additional-name"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="lastName">
              <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="fieldLabelClass">Last name</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="fieldControlClass"
                  placeholder="Last name"
                  autocomplete="family-name"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </div>

          <form.Field v-slot="{ field }" name="governmentIdLegalName">
            <Field :class="fieldClass" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="fieldLabelClass">
                Full name on government-issued ID
              </FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="fieldControlClass"
                placeholder="As shown on NIN, passport, or driver licence"
                autocomplete="name"
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @update:model-value="field.handleChange"
              />
              <FieldDescription>
                Must match your NIN exactly. This is also the name shown on your public profile.
              </FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet class="gap-3 border-t border-border/40 pt-5">
        <FieldLegend variant="label" class="mb-1.5">
          Personal details
        </FieldLegend>
        <FieldGroup class="gap-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field v-slot="{ field }" name="dateOfBirth">
              <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                <FieldLabel :for="`${field.name}-trigger`" :class="fieldLabelClass">
                  Date of birth
                </FieldLabel>
                <Popover v-slot="{ close }">
                  <PopoverTrigger as-child>
                    <Button
                      :id="`${field.name}-trigger`"
                      type="button"
                      variant="outline"
                      :class="[
                        fieldControlClass,
                        'cursor-pointer justify-between font-normal text-foreground hover:bg-muted/40',
                      ]"
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
                      <HugeiconsIcon :icon="ArrowDown01Icon" class="h-4 w-4 shrink-0 text-muted-foreground" />
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
                          // Calendar-date only: toDate(localTZ).toISOString() lands on the previous
                          // day in UTC+1 and drifts one day back on every save/reload round-trip.
                          field.handleChange(`${val.toString()}T00:00:00.000Z`)
                          field.handleBlur()
                        }
                        close()
                      }"
                    />
                  </PopoverContent>
                </Popover>
                <FieldDescription>
                  You must be 18 or older to register as a lawyer.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="gender">
              <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="fieldLabelClass">Gender</FieldLabel>
                <Select
                  :model-value="field.state.value"
                  @update:model-value="(v) => {
                    field.handleChange(v)
                    field.handleBlur()
                  }"
                >
                  <SelectTrigger
                    :id="field.name"
                    :class="fieldControlClass"
                    :aria-invalid="isInvalid(field)"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="g in genders"
                      :key="g.value"
                      :value="g.value"
                    >
                      {{ g.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet class="gap-3 border-t border-border/40 pt-5">
        <FieldLegend variant="label" class="mb-1.5">
          Location
        </FieldLegend>
        <FieldDescription>
          Where you currently live in Nigeria.
        </FieldDescription>
        <FieldGroup class="gap-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field v-slot="{ field }" name="state">
              <Field :class="fieldClass" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="fieldLabelClass">State</FieldLabel>
                <Select
                  :model-value="field.state.value || undefined"
                  @update:model-value="(v) => {
                    field.handleChange(v ?? '')
                    field.handleBlur()
                  }"
                >
                  <SelectTrigger
                    :id="field.name"
                    :class="fieldControlClass"
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
              <Field
                :class="fieldClass"
                :data-invalid="isInvalid(field)"
                :data-disabled="!selectedState || undefined"
              >
                <FieldLabel :for="field.name" :class="fieldLabelClass">LGA</FieldLabel>
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
                    :class="fieldControlClass"
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
        </FieldGroup>
      </FieldSet>

      <p class="text-sm leading-relaxed text-muted-foreground">
        Middle name is optional. Everything else is required.
      </p>
    </FieldGroup>
    </Card>
  </div>
</template>
