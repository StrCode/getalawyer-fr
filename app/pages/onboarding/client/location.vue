<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'

definePageMeta({
  middleware: ['auth'],
  layout: false, // Don't use default layout for split screen
})

interface OnboardingData {
  country: string
  state: string
  specializations: string[]
}

const STORAGE_KEY = 'client-onboarding-data'

// State
const country = ref('')
const state = ref('')
const errors = ref<Record<string, string>>({})

// Load saved data
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const data = JSON.parse(saved) as OnboardingData
    country.value = data.country || ''
    state.value = data.state || ''
  }
})

// Fetch countries using TanStack Query
const { useCountries } = useClientOnboarding()
const { data: countriesData, isPending: isLoading, isError } = useCountries()

const countries = computed(() => countriesData.value?.data || [])
const availableStates = computed(() => {
  if (!country.value) return []
  const selectedCountry = countries.value.find(c => c.code === country.value)
  return selectedCountry?.states || []
})

// Handlers
const handleCountryChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  country.value = value
  state.value = ''
  saveToStorage({ country: value, state: '' })
  errors.value = {}
}

const handleStateChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  state.value = value
  saveToStorage({ state: value })
  errors.value = {}
}

const saveToStorage = (data: Partial<OnboardingData>) => {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }))
}

const validateAndNext = () => {
  const newErrors: Record<string, string> = {}
  
  if (!country.value) {
    newErrors.country = "Please select a country"
  }
  
  if (availableStates.value.length > 0 && !state.value) {
    newErrors.state = "Please select a state/region"
  }
  
  if (Object.keys(newErrors).length > 0) {
    errors.value = newErrors
    return
  }
  
  navigateTo('/onboarding/client/specializations')
}

const selectedCountryName = computed(() => {
  const selected = countries.value.find(c => c.code === country.value)
  return selected?.name || ''
})

const selectedStateName = computed(() => {
  const selected = availableStates.value.find(s => s.code === state.value)
  return selected?.name || ''
})
</script>

<template>
  <div class="h-screen w-full flex overflow-hidden bg-white">
    <!-- Left Column: Hero Image -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gray-900">
      <!-- Image Background -->
      <div 
        class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style="background-image: url('/images/legal_hero.png');"
      ></div>
      <!-- Dark Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-black/20"></div>
      
      <!-- Content Overlay -->
      <div class="relative z-10 p-12 flex flex-col justify-between h-full w-full">
        <!-- Top Banner -->
        <div class="flex justify-between items-center w-full">
          <NuxtLink to="/" class="inline-flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Icon name="i-hugeicons-legal-document-02" class="w-5 h-5 text-white" />
            </div>
            <span class="text-xl font-semibold text-white tracking-tight">GetALawyer</span>
          </NuxtLink>
          <div class="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/90 text-sm font-medium">
            Step 1 of 2
          </div>
        </div>

        <div class="mb-12">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <Icon name="i-hugeicons-location-04" class="w-6 h-6 text-white" />
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Find the right <br/>legal expert near you.
          </h1>
          <p class="text-lg text-white/80 max-w-md">
            Help us connect you with qualified attorneys in your specific region.
          </p>
        </div>
      </div>
    </div>

    <!-- Right Column: Location Form -->
    <div class="w-full lg:w-1/2 flex flex-col h-full bg-white relative">
      <!-- Mobile View Header (hidden on lg) -->
      <div class="lg:hidden p-6 absolute top-0 left-0 w-full flex justify-between items-center z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <Icon name="i-hugeicons-legal-document-02" class="w-4 h-4 text-white" />
          </div>
        </NuxtLink>
        <div class="text-sm font-medium text-gray-500">Step 1 of 2</div>
      </div>

      <!-- Form Container -->
      <div class="flex-1 overflow-y-auto w-full pt-20 lg:pt-0">
        <div class="min-h-full flex flex-col justify-center p-6 sm:p-12 lg:px-20 xl:px-32">
          
          <div class="mb-10 text-center lg:text-left">
            <h2 class="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Where are you located?</h2>
            <p class="text-gray-500">
              Provide your location so we can filter local professionals.
            </p>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
            <Icon name="i-hugeicons-loading-03" class="w-8 h-8 text-black animate-spin mb-4" />
            <p class="text-sm font-medium text-gray-500">Loading regions...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="isError" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 mb-6 flex items-start gap-3">
             <Icon name="i-hugeicons-alert-circle" class="w-5 h-5 shrink-0 mt-0.5" />
             <p>Failed to load location data. Please refresh to try again.</p>
          </div>

          <!-- The Form Fields -->
          <div v-else class="space-y-6">
            <!-- Country Select -->
            <div class="space-y-2">
              <label class="block font-medium text-gray-700 text-sm">
                Country <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  :value="country"
                  @change="handleCountryChange"
                  :class="[
                    'w-full h-12 px-4 appearance-none rounded-xl border bg-gray-50/50 outline-none transition-all duration-200',
                    errors.country ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 hover:border-black/30 focus:border-black focus:ring-1 focus:ring-black'
                  ]"
                >
                  <option value="" disabled>Select your country</option>
                  <option v-for="c in countries" :key="c.code" :value="c.code">
                    {{ c.name }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <Icon name="i-hugeicons-arrow-down-01" class="w-4 h-4" />
                </div>
              </div>
              <p v-if="errors.country" class="text-red-500 text-xs mt-1">{{ errors.country }}</p>
            </div>

            <!-- State Select -->
            <div class="space-y-2" :class="[(!country || availableStates.length === 0) ? 'opacity-50 pointer-events-none transition-all' : 'opacity-100 transition-all']">
              <label class="block font-medium text-gray-700 text-sm">
                State / Region <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  :value="state"
                  @change="handleStateChange"
                  :disabled="!country || availableStates.length === 0"
                  :class="[
                    'w-full h-12 px-4 appearance-none rounded-xl border bg-gray-50/50 outline-none transition-all duration-200',
                    errors.state ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 hover:border-black/30 focus:border-black focus:ring-1 focus:ring-black'
                  ]"
                >
                  <option value="" disabled>Select state or region</option>
                  <option v-for="s in availableStates" :key="s.code" :value="s.code">
                    {{ s.name }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <Icon name="i-hugeicons-arrow-down-01" class="w-4 h-4" />
                </div>
              </div>
              <p v-if="errors.state" class="text-red-500 text-xs mt-1">{{ errors.state }}</p>
            </div>

            <!-- Preview Card -->
            <div v-if="country" class="mt-8 p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-4 transition-all duration-300">
              <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                <Icon name="i-hugeicons-tick-double-02" class="w-5 h-5 text-black" />
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmed Location</p>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">
                  {{ selectedCountryName }}{{ state && availableStates.length > 0 ? `, ${selectedStateName}` : '' }}
                </p>
              </div>
            </div>

            <!-- Action Area -->
            <div class="mt-10 pt-8 border-t border-gray-100">
              <UButton
                @click="validateAndNext"
                color="black"
                size="lg"
                block
                class="font-semibold h-12"
              >
                Continue to Next Step
                <Icon name="i-hugeicons-arrow-right-01" class="ml-2 w-5 h-5" />
              </UButton>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
