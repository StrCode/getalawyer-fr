<script setup lang="ts">
import { computed, useId } from 'vue'
import { PhCalendarBlank, PhStudent, PhBuildings } from '@phosphor-icons/vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import {
  isValidScnDigits,
  normalizeScnDigitsOnly,
  SCN_MAX_DIGITS
} from '~/lib/scn'
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
const state = store.professionalInfo

const currentYear = new Date().getFullYear()
const yearMin = 1970

const formId = useId()

function onScnInput(e: Event) {
  const el = e.target as HTMLInputElement
  state.barNumber = normalizeScnDigitsOnly(el.value)
}

const scnCounterClass = computed(() => {
  const n = state.barNumber.length
  if (n === 0) return 'text-muted-foreground/60'
  if (isValidScnDigits(state.barNumber)) return 'text-primary'
  return 'text-amber-700'
})

// We rely on the layout's "Next" button to trigger the store's saveStep('professional_info')
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
        <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          Bar admission
        </p>

        <div
          class="grid grid-cols-1 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)] gap-x-10 gap-y-4 md:items-start"
        >
          <label
            class="text-[14px] font-bold text-gray-900 pt-1 md:pt-3 leading-snug"
            :for="`${formId}-bar`"
          >
            Supreme Court enrolment number (SCN) <span class="text-primary">*</span>
          </label>
          <div class="w-full max-w-md space-y-2">
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
                :model-value="state.barNumber"
                placeholder="1234"
                autocomplete="off"
                inputmode="numeric"
                :maxlength="SCN_MAX_DIGITS"
                class="h-12 min-h-12 text-base tabular-nums md:text-sm"
                @input="onScnInput"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText
                  class="text-[10px] font-bold uppercase tracking-widest tabular-nums"
                  :class="scnCounterClass"
                >
                  {{ state.barNumber.length }}/{{ SCN_MAX_DIGITS }}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <p class="text-muted-foreground px-0.5 text-xs font-medium leading-relaxed">
              Your NBA Supreme Court number — also called a Supreme Court Enrolment Number — is issued when you are enrolled at the Supreme Court of Nigeria. Type
              <span class="font-semibold text-foreground/90">only the numeric part</span>
              (4–6 digits), e.g.
              <span class="font-mono font-semibold text-foreground/90">SCN1234</span>
              → enter
              <span class="font-mono font-semibold text-foreground/90">1234</span>.
            </p>
          </div>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)] gap-x-10 gap-y-4 md:items-start"
        >
          <label
            class="text-[14px] font-bold text-gray-900 pt-1 md:pt-3 leading-snug"
            :for="`${formId}-call`"
          >
            Year called to the Nigerian Bar <span class="text-primary">*</span>
          </label>
          <div class="w-full max-w-md space-y-2">
            <InputGroup
              class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
            >
              <InputGroupAddon>
                <PhCalendarBlank class="size-5 text-muted-foreground" weight="duotone" />
              </InputGroupAddon>
              <InputGroupInput
                :id="`${formId}-call`"
                v-model.number="state.yearOfCall"
                type="number"
                :min="yearMin"
                :max="currentYear"
                placeholder="Year"
                class="h-12 min-h-12 text-base tabular-nums md:text-sm"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {{ yearMin }}–{{ currentYear }}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <p class="text-muted-foreground px-0.5 text-xs font-medium leading-relaxed">
              Calendar year you were admitted to the bar in Nigeria (after completing the Nigerian Law School Bar Part II programme).
            </p>
          </div>
        </div>
      </div>

      <!-- University -->
      <div class="space-y-6">
        <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          University education
        </p>

        <div
          class="grid grid-cols-1 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)] gap-x-10 gap-y-4 md:items-start"
        >
          <label
            class="text-[14px] font-bold text-gray-900 pt-1 md:pt-3 leading-snug"
            :for="`${formId}-uni`"
          >
            University (LLB) <span class="text-primary">*</span>
          </label>
          <div class="w-full max-w-md space-y-2">
            <InputGroup
              class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
            >
              <InputGroupAddon>
                <PhStudent class="size-5 text-muted-foreground" weight="duotone" />
              </InputGroupAddon>
              <InputGroupInput
                :id="`${formId}-uni`"
                v-model="state.university"
                placeholder="e.g. University of Lagos"
                autocomplete="organization"
                class="h-12 min-h-12 text-base md:text-sm"
              />
            </InputGroup>
            <p class="text-muted-foreground px-0.5 text-xs font-medium leading-relaxed">
              The institution where you completed your Bachelor of Laws (LLB) degree.
            </p>
          </div>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)] gap-x-10 gap-y-4 md:items-start"
        >
          <label
            class="text-[14px] font-bold text-gray-900 pt-1 md:pt-3 leading-snug"
            :for="`${formId}-llb`"
          >
            Year of LLB graduation <span class="text-primary">*</span>
          </label>
          <div class="w-full max-w-md space-y-2">
            <InputGroup
              class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
            >
              <InputGroupAddon>
                <PhCalendarBlank class="size-5 text-muted-foreground" weight="duotone" />
              </InputGroupAddon>
              <InputGroupInput
                :id="`${formId}-llb`"
                v-model.number="state.llbYear"
                type="number"
                :min="yearMin"
                :max="currentYear"
                placeholder="Year"
                class="h-12 min-h-12 text-base tabular-nums md:text-sm"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {{ yearMin }}–{{ currentYear }}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <p class="text-muted-foreground px-0.5 text-xs font-medium leading-relaxed">
              Year you finished your LLB. It must not be after your year of call to the bar.
            </p>
          </div>
        </div>
      </div>

      <!-- Law school -->
      <div class="space-y-6">
        <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          Nigerian Law School
        </p>

        <div
          class="grid grid-cols-1 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)] gap-x-10 gap-y-4 md:items-start"
        >
          <label
            class="text-[14px] font-bold text-gray-900 pt-1 md:pt-3 leading-snug"
            :for="`${formId}-ls`"
          >
            NLS campus <span class="text-primary">*</span>
          </label>
          <div class="w-full max-w-md space-y-2">
            <InputGroup
              class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
            >
              <InputGroupAddon>
                <PhBuildings class="size-5 text-muted-foreground" weight="duotone" />
              </InputGroupAddon>
              <InputGroupInput
                :id="`${formId}-ls`"
                v-model="state.lawSchool"
                placeholder="e.g. Lagos Campus"
                autocomplete="off"
                class="h-12 min-h-12 text-base md:text-sm"
              />
            </InputGroup>
            <p class="text-muted-foreground px-0.5 text-xs font-medium leading-relaxed">
              Nigerian Law School campus where you attended the Bar Part II programme (often named after the city or region).
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
