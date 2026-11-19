<script setup lang="ts">
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref, watch } from 'vue'
import { type DateValue, getLocalTimeZone, today, parseDate } from '@internationalized/date'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { joinFullName, splitAccountName } from '~/lib/account-name'
import { lawyerPersonalInfoSchema } from '~/schemas/lawyerPersonalInfo'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { getLgasForState, NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'

definePageMeta({
  layout: 'application',
  middleware: ['auth', 'application'],
})

const step = getLawyerStepDisplay('personal_info')

useHead({ title: step.label })

const store = useLawyerOnboardingStore()

const genders = [
  { label: 'Male', value: 'male' as const },
  { label: 'Female', value: 'female' as const },
  { label: 'Other', value: 'other' as const },
]

// The name was already typed at sign-up: start from it instead of asking again.
const { session } = useAuth()
const fromAccount = computed(() => splitAccountName(session.value?.user?.name))

function snapshotFromStore() {
  const p = store.personalInfo
  return {
    firstName: p.firstName || fromAccount.value.firstName,
    lastName: p.lastName || fromAccount.value.lastName,
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

/** One tap to fill the ID name from the three name fields, when it is still empty. */
const suggestedLegalName = computed(() => {
  const v = formValues.value
  if (String(v.governmentIdLegalName ?? '').trim()) return ''
  return joinFullName(v.firstName, v.middleName, v.lastName)
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

// The calendar opens on the chosen date, or on the latest date a lawyer can be
// born on. It used to open on today's month, where every day is disabled.
const maxDate = today(getLocalTimeZone()).subtract({ years: 18 })

</script>

<template>
  <div>
    <ApplicationSectionHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <div :class="canopyForm">
      <FieldSet :class="canopyGroup">
        <legend :class="canopyLegend">Name</legend>
        <div class="grid gap-[0.9rem]">
          <div class="grid grid-cols-1 gap-[0.9rem] sm:grid-cols-3">
            <form.Field v-slot="{ field }" name="firstName">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">First name</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="authInput"
                  placeholder="First name"
                  autocomplete="given-name"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v: string | number) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="middleName">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">
                  Middle name
                  <span class="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="authInput"
                  placeholder="Middle name"
                  autocomplete="additional-name"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v: string | number) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="lastName">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">Last name</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="authInput"
                  placeholder="Last name"
                  autocomplete="family-name"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v: string | number) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </div>

          <form.Field v-slot="{ field }" name="governmentIdLegalName">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">
                Full name on government-issued ID
              </FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                placeholder="As shown on NIN, passport, or driver licence"
                autocomplete="name"
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @update:model-value="(v: string | number) => field.handleChange(String(v ?? ''))"
              />
              <button
                v-if="suggestedLegalName"
                type="button"
                :class="authLink" class="w-fit text-[0.9rem]"
                @click="field.handleChange(suggestedLegalName)"
              >
                Use “{{ suggestedLegalName }}”
              </button>
              <FieldDescription :class="canopyHint">
                Must match your NIN exactly. This is also the name shown on your public profile.
              </FieldDescription>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>
      </FieldSet>

      <FieldSet :class="canopyGroup">
        <legend :class="canopyLegend">Personal details</legend>
        <div class="grid gap-[0.9rem]">
          <div class="grid grid-cols-1 gap-[0.9rem] sm:grid-cols-2">
            <form.Field v-slot="{ field }" name="dateOfBirth">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="`${field.name}-trigger`" :class="canopyLabel">
                  Date of birth
                </FieldLabel>
                <Popover v-slot="{ close }">
                  <PopoverTrigger as-child>
                    <Button
                      :id="`${field.name}-trigger`"
                      type="button"
                      variant="outline"
                      :class="canopyTrigger"
                      :aria-invalid="isInvalid(field)"
                      @blur="field.handleBlur"
                    >
                      <span :class="dobDate ? 'text-foreground' : 'text-placeholder'">
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
                      <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto overflow-hidden p-0" :class="canopyPanel" align="start">
                    <Calendar
                      v-model="dobDate"
                      :max-value="maxDate"
                      :default-placeholder="dobDate ?? maxDate"
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
                <FieldDescription :class="canopyHint">
                  You must be 18 or older to register as a lawyer.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="gender">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">Gender</FieldLabel>
                <Select
                  :model-value="field.state.value"
                  @update:model-value="(v) => {
                    field.handleChange((v || undefined) as (typeof genders)[number]['value'] | undefined)
                    field.handleBlur()
                  }"
                >
                  <SelectTrigger
                    :id="field.name"
                    :class="canopySelect"
                    :aria-invalid="isInvalid(field)"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent :class="canopyPanel">
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
        </div>
      </FieldSet>

      <FieldSet :class="canopyGroup">
        <legend :class="canopyLegend">Location</legend>
        <p :class="canopyHint" class="-mt-[0.6rem]">
          Where you currently live in Nigeria.
        </p>
        <div class="grid gap-[0.9rem]">
          <div class="grid grid-cols-1 gap-[0.9rem] sm:grid-cols-2">
            <form.Field v-slot="{ field }" name="state">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">State</FieldLabel>
                <Select
                  :model-value="field.state.value || undefined"
                  @update:model-value="(v) => {
                    field.handleChange(String(v ?? ''))
                    field.handleBlur()
                  }"
                >
                  <SelectTrigger
                    :id="field.name"
                    :class="canopySelect"
                    :aria-invalid="isInvalid(field)"
                  >
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent :class="canopyPanel">
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
                :class="canopyField"
                :data-invalid="isInvalid(field)"
                :data-disabled="!selectedState || undefined"
              >
                <FieldLabel :for="field.name" :class="canopyLabel">LGA</FieldLabel>
                <Select
                  :key="`lga-${selectedState}`"
                  :model-value="field.state.value || undefined"
                  :disabled="!selectedState"
                  @update:model-value="(v) => {
                    field.handleChange(String(v ?? ''))
                    field.handleBlur()
                  }"
                >
                  <SelectTrigger
                    :id="field.name"
                    :class="canopySelect"
                    :aria-invalid="isInvalid(field)"
                    :disabled="!selectedState"
                  >
                    <SelectValue
                      :placeholder="selectedState ? 'Select LGA' : 'Select state first'"
                    />
                  </SelectTrigger>
                  <SelectContent :class="canopyPanel">
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
      </FieldSet>

      <p :class="canopyHint">
        Middle name is optional. Everything else is required.
      </p>
    </div>
  </div>
</template>
