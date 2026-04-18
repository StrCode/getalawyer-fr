<template>
  <div class="space-y-12 pb-20">
    <!-- Green result pill -->
    <div
      v-if="storeState.country && storeState.state"
      class="inline-flex items-center gap-2 bg-primary-100 mb-6 px-4 py-2 rounded-full font-medium text-primary-700 text-sm"
    >
      <Icon name="i-hugeicons-checkmark-circle-02" class="w-4 h-4" />
      <span>Lawyers available in <strong>{{ selectedStateName || selectedCountryName }}</strong>!</span>
    </div>

    <!-- Heading -->
    <div class="mb-10">
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">
        Where are you located?
      </h1>
      <p class="text-gray-500 text-sm leading-relaxed">
        We'll use your location to filter qualified lawyers near you.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center gap-3 py-10">
      <Icon name="i-hugeicons-loading-03" class="w-5 h-5 text-primary-600 animate-spin" />
      <span class="text-gray-400 text-sm">Loading regions...</span>
    </div>

    <!-- Error -->
    <div
      v-else-if="isError"
      class="flex items-start gap-2 bg-red-50 mb-6 p-4 border border-red-100 rounded text-red-600 text-sm"
    >
      <Icon name="i-hugeicons-alert-circle" class="mt-0.5 w-4 h-4 shrink-0" />
      <span>Failed to load location data. Please refresh and try again.</span>
    </div>

    <!-- Form -->
    <div v-else class="space-y-8">
      <!-- Country -->
      <div class="form-row">
        <label class="etsy-label">Country <span class="text-primary-600">*</span></label>
        <div class="w-full max-w-md">
           <div class="relative">
             <select
               :value="storeState.country"
               disabled
               class="etsy-input-base w-full bg-gray-50 text-gray-600 appearance-none cursor-not-allowed"
             >
               <option value="NG">Nigeria</option>
             </select>
             <Icon name="i-hugeicons-lock-01" class="top-1/2 right-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none" />
           </div>
           <p class="etsy-description">Currently available in Nigeria only</p>
        </div>
      </div>

      <!-- State -->
      <div class="form-row">
        <label class="etsy-label">State / Region <span class="text-primary-600">*</span></label>
        <div class="w-full max-w-md">
           <USelectMenu
             v-model="selectedState"
             :items="availableStates"
             placeholder="Select state or region"
             size="xl"
             class="etsy-input-base w-full"
             @update:model-value="handleStateChange"
           />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'

definePageMeta({
  middleware: ['auth'],
  layout: 'onboarding-wizard',
})

const store = useClientOnboardingStore()
const storeState = store.clientState

const selectedState = ref<{ label: string; value: string } | undefined>(undefined)

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

watch(availableStates, (states) => {
   if (storeState.state && !selectedState.value) {
      const stateItem = states.find((s: any) => s.value === storeState.state)
      if (stateItem) {
        selectedState.value = stateItem
      }
   }
}, { immediate: true })

const handleStateChange = (value: { label: string; value: string } | undefined) => {
  if (value) {
    storeState.state = value.value
    selectedState.value = value
  }
}

// We rely on the layout's "Next" button to trigger the store's saveStep('location')
</script>