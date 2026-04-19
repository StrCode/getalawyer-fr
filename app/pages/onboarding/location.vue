<template>
  <div class="space-y-12 pb-20">
    <!-- Green result pill -->
    <div
      v-if="storeState.country && storeState.state"
      class="inline-flex items-center gap-2 bg-primary/10 mb-6 px-4 py-2 rounded-full font-medium text-primary text-sm shadow-sm border border-primary/10"
    >
      <PhCheckCircle class="w-4 h-4" />
      <span>Lawyers available in <strong>{{ selectedStateName || selectedCountryName || 'your region' }}</strong>!</span>
    </div>

    <!-- Heading -->
    <div class="mb-10">
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">
        Where are you located?
      </h1>
      <p class="text-gray-500 text-sm leading-relaxed font-medium">
        We'll use your location to filter qualified lawyers near you.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center gap-3 py-10">
      <PhCircleNotch class="w-5 h-5 text-primary animate-spin" />
      <span class="text-gray-400 text-sm font-bold tracking-tight">Loading regions...</span>
    </div>

    <!-- Error -->
    <div
      v-else-if="isError"
      class="flex items-start gap-2 bg-red-50 mb-6 p-4 border border-red-100 rounded-xl text-red-600 text-sm font-medium"
    >
      <PhWarningCircle class="mt-0.5 w-4 h-4 shrink-0" />
      <span>Failed to load location data. Please refresh and try again.</span>
    </div>

    <!-- Form -->
    <div v-else class="space-y-8">
      <!-- Country -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">Country <span class="text-primary">*</span></label>
        <div class="w-full max-w-md">
           <div class="relative">
             <div class="w-full bg-gray-50 text-gray-400 flex items-center justify-between h-12 px-4 rounded-lg border border-gray-100 cursor-not-allowed font-medium transition-all duration-200">
               <span>Nigeria</span>
               <PhLock class="w-4 h-4" />
             </div>
           </div>
           <p class="mt-2 text-[12px] text-gray-400 font-medium leading-relaxed">Currently available in Nigeria only</p>
        </div>
      </div>

      <!-- State -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">State / Region <span class="text-primary">*</span></label>
        <div class="w-full max-w-md">
           <Select :model-value="storeState.state" @update:model-value="handleStateIdChange">
             <SelectTrigger class="h-12 rounded-lg border-gray-200 focus:ring-primary/20">
               <SelectValue :placeholder="selectedStateName || 'Select state or region'" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem v-for="s in availableStates" :key="s.value" :value="s.value">
                 {{ s.label }}
               </SelectItem>
             </SelectContent>
           </Select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { 
  PhCheckCircle, 
  PhCircleNotch, 
  PhWarningCircle, 
  PhLock 
} from '@phosphor-icons/vue'

definePageMeta({
  middleware: ['auth'],
  layout: 'onboarding-wizard',
})

const store = useClientOnboardingStore()
const storeState = store.clientState

const { useCountries } = useClientOnboarding()
const { data: countriesData, isPending: isLoading, isError } = useCountries()

const countries = computed(() => countriesData.value?.data || [])
const availableStates = computed(() => {
  const selected = countries.value.find((c: any) => c.code2 === storeState.country)
  const states = selected?.states || []
  return states.map((s: any) => ({
    label: s.name,
    value: s.code
  }))
})
const selectedCountryName = computed(() =>
  countries.value.find((c: any) => c.code2 === storeState.country)?.name || ''
)
const selectedStateName = computed(() => {
  const stateItem = availableStates.value.find((s: any) => s.value === storeState.state)
  return stateItem?.label || ''
})

const handleStateIdChange = (value: string) => {
  storeState.state = value
}
</script>