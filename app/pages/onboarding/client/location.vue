<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'

definePageMeta({
  middleware: ['auth', 'onboarding-guard'],
  layout: 'onboarding',
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
  
  if (availableStates.value.length > 1 && !state.value) {
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
  <div class="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
    <!-- Progress indicator -->
    <div class="bg-white border-b w-full">
      <div class="mx-auto px-6 py-3 max-w-3xl">
        <div class="flex justify-between items-center text-sm">
          <span class="font-medium text-muted-foreground">Step 1 of 2</span>
          <div class="flex gap-1.5">
            <div class="bg-primary rounded-full w-16 h-1" />
            <div class="bg-gray-200 rounded-full w-16 h-1" />
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto px-6 py-6 max-w-3xl">
      <!-- Header -->
      <div class="mb-6 text-center">
        <div class="inline-flex justify-center items-center bg-primary/10 mb-3 rounded-full w-12 h-12">
          <Icon name="heroicons:map-pin" class="w-5 h-5 text-primary" />
        </div>
        <h1 class="mb-1 font-semibold text-gray-900 text-lg">
          Where are you located?
        </h1>
        <p class="text-muted-foreground text-xs">
          Help us connect you with legal professionals in your area
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <Icon name="lucide:loader-circle" class="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p class="text-sm text-gray-600">Loading countries...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-800 text-sm">Failed to load countries. Please refresh the page.</p>
      </div>

      <!-- Form Card -->
      <div v-else class="space-y-5 bg-white shadow-sm mb-4 p-6 border rounded-3xl">
        <!-- Country Select -->
        <div>
          <label class="flex items-center gap-1.5 mb-2 font-medium text-gray-700 text-sm">
            <Icon name="heroicons:globe-alt" class="w-4 h-4 text-primary" />
            Country
            <span class="text-red-500">*</span>
          </label>
          <select
            :value="country"
            @change="handleCountryChange"
            :class="[
              'w-full h-10 px-3 rounded-lg border transition-colors',
              errors.country ? 'border-red-500' : 'hover:border-primary/50'
            ]"
          >
            <option value="">Select your country</option>
            <option v-for="c in countries" :key="c.code" :value="c.code">
              {{ c.name }}
            </option>
          </select>
          <p v-if="errors.country" class="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs">
            <Icon name="heroicons:exclamation-circle" class="w-3.5 h-3.5" />
            {{ errors.country }}
          </p>
        </div>

        <!-- State Select -->
        <div v-if="country && availableStates.length > 1">
          <label class="flex items-center gap-1.5 mb-2 font-medium text-gray-700 text-sm">
            <Icon name="heroicons:map-pin" class="w-4 h-4 text-primary" />
            State / Region
            <span class="text-red-500">*</span>
          </label>
          <select
            :value="state"
            @change="handleStateChange"
            :class="[
              'w-full h-10 px-3 rounded-lg border transition-colors',
              errors.state ? 'border-red-500' : 'hover:border-primary/50'
            ]"
          >
            <option value="">Select your state or region</option>
            <option v-for="s in availableStates" :key="s.code" :value="s.code">
              {{ s.name }}
            </option>
          </select>
          <p v-if="errors.state" class="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs">
            <Icon name="heroicons:exclamation-circle" class="w-3.5 h-3.5" />
            {{ errors.state }}
          </p>
        </div>

        <!-- Selected Location Preview -->
        <div v-if="country" class="bg-gradient-to-br from-green-50 to-emerald-50 p-3 border border-green-200 rounded-lg">
          <div class="flex items-center gap-2">
            <div class="flex flex-shrink-0 justify-center items-center bg-green-100 rounded-full w-8 h-8">
              <Icon name="heroicons:check-circle" class="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p class="font-medium text-green-900 text-xs">Selected Location</p>
              <p class="font-semibold text-green-800 text-sm">
                {{ selectedCountryName }}{{ state && availableStates.length > 1 ? `, ${selectedStateName}` : '' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button
        @click="validateAndNext"
        class="w-full h-10 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Continue to Specializations
        <Icon name="heroicons:arrow-right" class="ml-1.5 w-4 h-4 inline" />
      </button>
    </div>
  </div>
</template>
