<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'

definePageMeta({
  middleware: ['auth', 'onboarding-guard'],
  layout: 'onboarding',
})

const STORAGE_KEY = 'client-onboarding-data'

interface OnboardingData {
  country: string
  state: string
  specializations: string[]
}

// State
const onboardingData = ref<OnboardingData>({
  country: '',
  state: '',
  specializations: [],
})
const error = ref('')

// Load saved data
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const parsed = JSON.parse(saved)
    onboardingData.value = {
      country: parsed.country || '',
      state: parsed.state || '',
      specializations: parsed.specializations || [],
    }
  }
  
  // Redirect if no location data
  if (!onboardingData.value.country) {
    navigateTo('/onboarding/client/location')
  }
})

// Fetch specializations using TanStack Query
const { useSpecializations } = useClientOnboarding()
const { data: specializationsData, isPending: isLoadingSpecializations } = useSpecializations()
const specializations = computed(() => specializationsData.value?.specializations || [])

// Toggle specialization
const toggleSpecialization = (id: string) => {
  const specs = onboardingData.value.specializations || []
  
  if (specs.includes(id)) {
    onboardingData.value.specializations = specs.filter(s => s !== id)
  } else {
    if (specs.length < 3) {
      onboardingData.value.specializations = [...specs, id]
    }
  }
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData.value))
  error.value = ''
}

// Submit onboarding
const { useCompleteOnboarding } = useClientOnboarding()
const completeOnboarding = useCompleteOnboarding()

const handleSubmit = async () => {
  if (onboardingData.value.specializations.length === 0) {
    error.value = "Please select at least one specialization"
    return
  }
  
  if (onboardingData.value.specializations.length > 3) {
    error.value = "Please select a maximum of 3 specializations"
    return
  }

  error.value = ''

  try {
    await completeOnboarding.mutateAsync({
      country: onboardingData.value.country,
      state: onboardingData.value.state,
      specializationIds: onboardingData.value.specializations,
    })

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY)
    
    // Redirect to dashboard
    await navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err.data?.message || "Failed to complete onboarding. Please try again."
  }
}

const handleBack = () => {
  navigateTo('/onboarding/client/location')
}

// Computed
const selectedCount = computed(() => onboardingData.value.specializations?.length || 0)
const progressPercentage = computed(() => (selectedCount.value / 3) * 100)
const isDisabled = (id: string) => {
  const specs = onboardingData.value.specializations || []
  return !specs.includes(id) && selectedCount.value >= 3
}
</script>

<template>
  <div class="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
    <!-- Progress indicator -->
    <div class="bg-white border-b w-full">
      <div class="mx-auto px-6 py-3 max-w-3xl">
        <div class="flex justify-between items-center text-sm">
          <span class="font-medium text-muted-foreground">Step 2 of 2</span>
          <div class="flex gap-1.5">
            <div class="bg-primary rounded-full w-16 h-1" />
            <div class="bg-primary rounded-full w-16 h-1" />
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto px-6 py-6 max-w-3xl">
      <!-- Header -->
      <div class="mb-6 text-center">
        <div class="inline-flex justify-center items-center bg-primary/10 mb-3 rounded-full w-12 h-12">
          <Icon name="heroicons:scale" class="w-5 h-5 text-primary" />
        </div>
        <h1 class="mb-1 font-semibold text-gray-900 text-lg">
          What legal services are you interested in?
        </h1>
        <p class="text-muted-foreground text-xs">
          Select up to 3 areas to help us match you with the right lawyers
        </p>
      </div>

      <!-- Location Summary -->
      <div class="bg-white shadow-sm mb-4 p-4 border rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex flex-shrink-0 justify-center items-center bg-blue-100 rounded-full w-10 h-10">
            <Icon name="heroicons:map-pin" class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Your Location</p>
            <p class="font-medium text-gray-900 text-sm">
              {{ onboardingData.country }}{{ onboardingData.state ? `, ${onboardingData.state}` : '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Specializations Grid -->
      <div v-if="isLoadingSpecializations" class="bg-white shadow-sm mb-4 p-6 border rounded-3xl text-center">
        <Icon name="lucide:loader-circle" class="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p class="text-sm text-gray-600">Loading specializations...</p>
      </div>
      
      <div v-else class="space-y-4 bg-white shadow-sm mb-4 p-6 border rounded-3xl">
        <div class="gap-3 grid grid-cols-1 md:grid-cols-2">
          <div
            v-for="spec in specializations"
            :key="spec.id"
            @click="!isDisabled(spec.id) && toggleSpecialization(spec.id)"
            :class="[
              'p-4 border-2 rounded-xl cursor-pointer transition-all',
              (onboardingData.specializations || []).includes(spec.id)
                ? 'border-primary bg-primary/5'
                : isDisabled(spec.id)
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                : 'border-gray-200 hover:border-primary/50'
            ]"
          >
            <div class="flex items-start gap-3">
              <div
                :class="[
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center',
                  (onboardingData.specializations || []).includes(spec.id)
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                ]"
              >
                <Icon
                  v-if="(onboardingData.specializations || []).includes(spec.id)"
                  name="heroicons:check"
                  class="w-3 h-3 text-white"
                />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 text-sm">{{ spec.name }}</h3>
                <p class="mt-1 text-gray-600 text-xs">{{ spec.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="flex items-center gap-2 bg-red-50 p-3 border border-red-200 rounded-lg">
          <Icon name="heroicons:exclamation-circle" class="w-4 h-4 text-red-600" />
          <span class="text-red-800 text-xs">{{ error }}</span>
        </div>

        <!-- Selection Progress -->
        <div class="pt-4 border-t">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600 text-xs">Selected Specializations</span>
            <span class="font-semibold text-primary text-xs">{{ selectedCount }} / 3</span>
          </div>
          <div class="bg-gray-200 rounded-full h-1.5">
            <div
              class="bg-primary rounded-full h-1.5 transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            />
          </div>
          <p class="mt-1.5 text-muted-foreground text-xs">
            {{ selectedCount === 0 ? 'Select at least one to continue' :
               selectedCount === 3 ? 'Maximum reached' :
               `${3 - selectedCount} more available` }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          @click="handleBack"
          :disabled="completeOnboarding.isPending.value || isLoadingSpecializations"
          class="flex-1 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Icon name="heroicons:arrow-left" class="mr-1.5 w-4 h-4 inline" />
          Back
        </button>
        <button
          @click="handleSubmit"
          :disabled="completeOnboarding.isPending.value || selectedCount === 0 || isLoadingSpecializations"
          :class="[
            'flex-1 h-10 rounded-lg transition-colors',
            completeOnboarding.isPending.value || selectedCount === 0 || isLoadingSpecializations
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90'
          ]"
        >
          <Icon v-if="completeOnboarding.isPending.value" name="lucide:loader-circle" class="w-4 h-4 inline animate-spin mr-1.5" />
          <span v-if="completeOnboarding.isPending.value">Completing...</span>
          <span v-else>Complete Onboarding</span>
        </button>
      </div>
    </div>
  </div>
</template>
