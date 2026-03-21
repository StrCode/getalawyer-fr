<template>
  <div class="max-w-lg">
  <!-- Green result pill -->
  <div
    v-if="country && state"
    class="inline-flex items-center gap-2 bg-gray-400 mb-6 px-4 py-2 rounded-full font-medium text-white text-sm"
  >
    <Icon name="i-hugeicons-checkmark-circle-02" class="w-4 h-4" />
    <span>Lawyers available in <strong>{{ selectedStateName || selectedCountryName }}</strong>!</span>
  </div>

  <!-- Heading -->
  <h1 class="mb-1 font-bold text-[28px] text-gray-900 tracking-tight">
    Where are you located?
  </h1>
  <p class="mb-8 text-gray-500 text-sm leading-relaxed">
    We'll use your location to filter qualified lawyers near you.
  </p>

  <!-- Loading -->
  <div v-if="isLoading" class="flex justify-center items-center gap-3 py-10">
    <Icon name="i-hugeicons-loading-03" class="w-5 h-5 text-[#1d6b44] animate-spin" />
    <span class="text-gray-400 text-sm">Loading regions...</span>
  </div>

  <!-- Error -->
  <div
    v-else-if="isError"
    class="flex items-start gap-2 bg-red-50 mb-6 p-4 border border-red-100 rounded-xl text-red-600 text-sm"
  >
    <Icon name="i-hugeicons-alert-circle" class="mt-0.5 w-4 h-4 shrink-0" />
    <span>Failed to load location data. Please refresh and try again.</span>
  </div>

  <!-- Form -->
  <div v-else class="space-y-4">

    <!-- Country -->
    <div>
      <label class="block mb-1.5 font-medium text-gray-700 text-sm">
        Country <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <select
          :value="country"
          disabled
          class="bg-gray-100 px-4 pr-10 border border-gray-300 rounded-xl outline-none w-full h-12 text-gray-700 text-sm appearance-none cursor-not-allowed"
        >
          <option value="NG">Nigeria</option>
        </select>
        <Icon name="i-hugeicons-lock-01" class="top-1/2 right-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none" />
      </div>
      <p class="mt-1 text-gray-500 text-xs">Currently available in Nigeria only</p>
    </div>

    <!-- State -->
    <div>
      <label class="block mb-1.5 font-medium text-gray-700 text-sm">
        State / Region <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <select
          v-model="state"
          class="bg-white px-4 pr-10 border rounded-xl outline-none w-full h-12 text-gray-900 text-sm transition-all appearance-none"
          :class="errors.state
            ? 'border-red-400 focus:border-red-500'
            : 'border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10'"
          @change="handleStateChange"
        >
          <option value="" disabled>Select state or region</option>
          <option v-for="s in availableStates" :key="s.code" :value="s.code">{{ s.name }}</option>
        </select>
        <Icon name="i-hugeicons-arrow-down-01" class="top-1/2 right-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none" />
      </div>
      <p v-if="errors.state" class="mt-1 text-red-500 text-xs">{{ errors.state }}</p>
    </div>

    <!-- Next -->
    <div class="pt-4">
      <button
        class="bg-primary-600 hover:bg-primary-700 rounded-full w-full h-12 font-semibold text-white text-sm transition-colors"
        @click="validateAndNext"
      >
        Next
      </button>
    </div>

  </div>
  </div>
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'

definePageMeta({
  middleware: ['auth'],
  layout: 'client-onboarding',
})

// Set step state so the layout can read it
useState('onboarding-step', () => 1).value = 1
useState('onboarding-total', () => 2).value = 2

const STORAGE_KEY = 'client-onboarding-data'

const country = ref('NG') // Default to Nigeria
const state = ref('')
const errors = ref<Record<string, string>>({})

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const data = JSON.parse(saved)
    // Always keep country as Nigeria
    country.value = 'NG'
    state.value = data.state || ''
  }
  // Save Nigeria as default
  saveToStorage({ country: 'NG' })
})

const { useCountries } = useClientOnboarding()
const { data: countriesData, isPending: isLoading, isError } = useCountries()

const countries = computed(() => countriesData.value?.data || [])
const availableStates = computed(() => {
  const selected = countries.value.find((c: any) => c.code2 === country.value)
  return selected?.states || []
})
const selectedCountryName = computed(() =>
  countries.value.find((c: any) => c.code2 === country.value)?.name || ''
)
const selectedStateName = computed(() =>
  availableStates.value.find((s: any) => s.code === state.value)?.name || ''
)

const saveToStorage = (data: object) => {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }))
}

const handleStateChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  state.value = value
  saveToStorage({ state: value })
  errors.value = {}
}

const validateAndNext = () => {
  const newErrors: Record<string, string> = {}
  if (!state.value) newErrors.state = 'Please select a state or region.'
  if (Object.keys(newErrors).length > 0) {
    errors.value = newErrors
    return
  }
  navigateTo('/onboarding/client/specializations')
}
</script>