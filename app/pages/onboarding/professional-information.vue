<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, useId, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { PhCalendarBlank, PhStudent, PhBuildings } from '@phosphor-icons/vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import {
  isValidScnDigits,
  normalizeScnDigitsOnly,
  SCN_MAX_DIGITS
} from '~/lib/scn'
import { lawyerProfessionalInfoSchema } from '~/schemas/lawyerProfessionalInfo'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form'
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

const { validate, values, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(lawyerProfessionalInfoSchema),
  initialValues: snapshotFromStore()
})

watch(
  values,
  (v) => {
    Object.assign(store.professionalInfo, v)
  },
  { deep: true }
)

onMounted(() => {
  resetForm({ values: snapshotFromStore() })
  registerValidate?.(async () => {
    const { valid } = await validate()
    if (!valid) {
      store.validationError = null
      return false
    }
    store.validationError = null
    return true
  })
})

onBeforeUnmount(() => {
  registerValidate?.(null)
})

const currentYear = new Date().getFullYear()
const yearMin = 1970
const formId = useId()

const barNumberStr = computed(() => String(values.barNumber ?? ''))

const scnCounterClass = computed(() => {
  const n = barNumberStr.value.length
  if (n === 0) return 'text-muted-foreground/60'
  if (isValidScnDigits(barNumberStr.value)) return 'text-primary'
  return 'text-amber-700'
})

function onScnModelUpdate(v: unknown) {
  setFieldValue('barNumber', normalizeScnDigitsOnly(String(v ?? '')))
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

        <FormField v-slot="{ componentField }" name="barNumber">
          <FormItem
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
          >
            <FormLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
            >
              Supreme Court enrolment number (SCN) <span class="text-primary">*</span>
            </FormLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <FormControl>
                <InputGroup
                  class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
                >
                  <InputGroupAddon>
                    <InputGroupText class="font-mono text-sm font-semibold text-foreground tabular-nums">
                      SCN
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    :id="`${formId}-bar`"
                    :name="componentField.name"
                    :model-value="values.barNumber"
                    placeholder="1234"
                    autocomplete="off"
                    inputmode="numeric"
                    :maxlength="SCN_MAX_DIGITS"
                    class="h-12 min-h-12 text-base tabular-nums md:text-sm"
                    @blur="componentField.onBlur"
                    @update:model-value="onScnModelUpdate"
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
              </FormControl>
              <FormDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                Your NBA Supreme Court number — also called a Supreme Court Enrolment Number — is issued when you are enrolled at the Supreme Court of Nigeria. Type
                <span class="font-semibold text-foreground/90">only the numeric part</span>
                (4–6 digits), e.g.
                <span class="font-mono font-semibold text-foreground/90">SCN1234</span>
                → enter
                <span class="font-mono font-semibold text-foreground/90">1234</span>.
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="yearOfCall">
          <FormItem
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
          >
            <FormLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
            >
              Year called to the Nigerian Bar <span class="text-primary">*</span>
            </FormLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <FormControl>
                <InputGroup
                  class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
                >
                  <InputGroupAddon>
                    <PhCalendarBlank class="size-5 text-muted-foreground" weight="duotone" />
                  </InputGroupAddon>
                  <InputGroupInput
                    :id="`${formId}-call`"
                    type="number"
                    :min="yearMin"
                    :max="currentYear"
                    placeholder="Year"
                    class="h-12 min-h-12 text-base tabular-nums md:text-sm"
                    v-bind="componentField"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText class="text-2.5 font-bold uppercase tracking-widest text-muted-foreground">
                      {{ yearMin }}–{{ currentYear }}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                Calendar year you were admitted to the bar in Nigeria (after completing the Nigerian Law School Bar Part II programme).
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        </FormField>
      </div>

      <!-- University -->
      <div class="space-y-6">
        <p class="text-3 font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          University education
        </p>

        <FormField v-slot="{ componentField }" name="university">
          <FormItem
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
          >
            <FormLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
            >
              University (LLB) <span class="text-primary">*</span>
            </FormLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <FormControl>
                <InputGroup
                  class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
                >
                  <InputGroupAddon>
                    <PhStudent class="size-5 text-muted-foreground" weight="duotone" />
                  </InputGroupAddon>
                  <InputGroupInput
                    :id="`${formId}-uni`"
                    placeholder="e.g. University of Lagos"
                    autocomplete="organization"
                    class="h-12 min-h-12 text-base md:text-sm"
                    v-bind="componentField"
                  />
                </InputGroup>
              </FormControl>
              <FormDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                The institution where you completed your Bachelor of Laws (LLB) degree.
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="llbYear">
          <FormItem
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
          >
            <FormLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
            >
              Year of LLB graduation <span class="text-primary">*</span>
            </FormLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <FormControl>
                <InputGroup
                  class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
                >
                  <InputGroupAddon>
                    <PhCalendarBlank class="size-5 text-muted-foreground" weight="duotone" />
                  </InputGroupAddon>
                  <InputGroupInput
                    :id="`${formId}-llb`"
                    type="number"
                    :min="yearMin"
                    :max="currentYear"
                    placeholder="Year"
                    class="h-12 min-h-12 text-base tabular-nums md:text-sm"
                    v-bind="componentField"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText class="text-2.5 font-bold uppercase tracking-widest text-muted-foreground">
                      {{ yearMin }}–{{ currentYear }}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                Year you finished your LLB. It must not be after your year of call to the bar.
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        </FormField>
      </div>

      <!-- Law school -->
      <div class="space-y-6">
        <p class="text-3 font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          Nigerian Law School
        </p>

        <FormField v-slot="{ componentField }" name="lawSchool">
          <FormItem
            class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0"
          >
            <FormLabel
              class="text-3.5 font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start"
            >
              NLS campus <span class="text-primary">*</span>
            </FormLabel>
            <div class="min-w-0 w-full max-w-md flex-1 space-y-2">
              <FormControl>
                <InputGroup
                  class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
                >
                  <InputGroupAddon>
                    <PhBuildings class="size-5 text-muted-foreground" weight="duotone" />
                  </InputGroupAddon>
                  <InputGroupInput
                    :id="`${formId}-ls`"
                    placeholder="e.g. Lagos Campus"
                    autocomplete="off"
                    class="h-12 min-h-12 text-base md:text-sm"
                    v-bind="componentField"
                  />
                </InputGroup>
              </FormControl>
              <FormDescription
                class="px-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
              >
                Nigerian Law School campus where you attended the Bar Part II programme (often named after the city or region).
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        </FormField>
      </div>
    </div>
  </div>
</template>
