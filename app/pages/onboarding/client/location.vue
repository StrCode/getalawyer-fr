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
    class="flex items-start gap-2 bg-red-50 mb-6 p-4 border border-red-100 rounded text-red-600 text-sm"
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
          class="bg-gray-100 px-4 pr-10 border border-gray-300 rounded outline-none w-full h-12 text-gray-700 text-sm appearance-none cursor-not-allowed"
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
      <USelectMenu
        v-model="selectedState"
        :items="availableStates"
        placeholder="Select state or region"
        size="xl"
        class="w-full"
        @update:model-value="handleStateChange"
      />
      <p v-if="errors.state" class="mt-1 text-red-500 text-xs">{{ errors.state }}</p>
    </div>

    <!-- Next -->
    <div class="pt-4">
      <UButton
        size="xl"
        color="primary"
        block
        @click="validateAndNext"
      >
        Next
      </UButton>
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
const currentStep = useState('onboarding-step', () => 1)
const totalSteps = useState('onboarding-total', () => 2)

const STORAGE_KEY = 'client-onboarding-data'

const country = ref('NG') // Default to Nigeria
const state = ref<string>('')
const selectedState = ref<{ label: string; value: string } | undefined>(undefined)
const errors = ref<Record<string, string>>({})

// Load from storage on client side only - after mount to avoid hydration mismatch
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const data = JSON.parse(saved)
    // Handle both old object format and new string format
    if (typeof data.state === 'object' && data.state?.value) {
      state.value = data.state.value
    } else if (typeof data.state === 'string') {
      state.value = data.state
    }
    // Set selectedState for USelectMenu
    if (state.value) {
      const stateItem = availableStates.value.find((s: any) => s.value === state.value)
      if (stateItem) {
        selectedState.value = stateItem
      }
    }
  }
  // Save Nigeria as default with correct string format
  saveToStorage({ country: 'NG', state: state.value })
})

const { useCountries } = useClientOnboarding()
const { data: countriesData, isPending: isLoading, isError } = useCountries()

const countries = computed(() => countriesData.value?.data || [])
const availableStates = computed(() => {
  const selected = countries.value.find((c: any) => c.code2 === country.value)
  const states = selected?.states || []
  // Transform to format USelectMenu expects with label/value
  return states.map((s: any) => ({
    label: s.name,
    value: s.code
  }))
})
const selectedCountryName = computed(() =>
  countries.value.find((c: any) => c.code2 === country.value)?.name || ''
)
const selectedStateName = computed(() => {
  const stateItem = availableStates.value.find((s: any) => s.value === state.value)
  return stateItem?.label || ''
})

const saveToStorage = (data: object) => {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }))
}

const handleStateChange = (value: { label: string; value: string } | undefined) => {
  if (value) {
    state.value = value.value
    selectedState.value = value
    saveToStorage({ state: value.value })
    errors.value = {}
  }
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