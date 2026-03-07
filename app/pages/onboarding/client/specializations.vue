<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'

definePageMeta({
  middleware: ['auth'],
  layout: false, // Split screen layout so we disable default
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
  <div class="h-screen w-full flex overflow-hidden bg-white">
    <!-- Left Column: Hero Image -->
    <div class="hidden lg:flex lg:w-[40%] relative bg-gray-900">
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
            Step 2 of 2
          </div>
        </div>

        <div class="mb-12">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <Icon name="i-hugeicons-legal-document-02" class="w-6 h-6 text-white" />
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Almost done. <br/>What do you need?
          </h1>
          <p class="text-lg text-white/80 max-w-md">
            Pick up to three legal areas that match your current needs.
          </p>

          <div class="mt-8 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Icon name="i-hugeicons-location-04" class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-xs font-medium text-white/60 uppercase tracking-wider">Filtering for</p>
              <p class="text-sm font-semibold text-white mt-0.5">
                {{ onboardingData.country }}{{ onboardingData.state ? `, ${onboardingData.state}` : '' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Specializations Selection -->
    <div class="w-full lg:w-[60%] flex flex-col h-full bg-white relative">
      <!-- Mobile View Header (hidden on lg) -->
      <div class="lg:hidden p-6 gap-2 absolute top-0 left-0 w-full flex justify-between items-center z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <button @click="handleBack" class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center">
            <Icon name="i-hugeicons-arrow-left-01" class="w-4 h-4 text-gray-700" />
        </button>
        <div class="text-sm font-medium text-gray-500">Step 2 of 2</div>
      </div>

      <!-- Main Content Container -->
      <div class="flex-1 overflow-y-auto w-full pt-20 lg:pt-0">
        <div class="min-h-full flex flex-col p-6 sm:p-12 lg:px-16 xl:px-24">
          
          <div class="mt-8 lg:mt-12 mb-8 text-center lg:text-left">
            <h2 class="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Select Legal Areas</h2>
            <p class="text-gray-500">
              You can choose up to 3 specializations to help us narrow down the right attorneys for you.
            </p>
          </div>

          <!-- Progress Bar Overlay -->
          <div class="mb-8 sticky top-0 bg-white z-10 py-2 border-b border-gray-100">
            <div class="flex justify-between items-end mb-2">
              <span class="text-gray-500 text-xs font-medium uppercase tracking-wider">Selections ({{ selectedCount }}/3)</span>
              <span class="text-xs text-black font-semibold">{{ selectedCount === 3 ? 'Max reached' : `${3 - selectedCount} left` }}</span>
            </div>
            <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
               <div class="bg-black h-full transition-all duration-300 rounded-full" :style="{ width: `${progressPercentage}%` }"></div>
            </div>
          </div>

          <!-- Loading State Grid -->
          <div v-if="isLoadingSpecializations" class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div v-for="i in 6" :key="i" class="h-24 bg-gray-50 animate-pulse rounded-2xl border border-gray-100"></div>
          </div>

          <!-- Error Alert -->
          <div v-else-if="error && !onboardingData.specializations?.length" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 mb-6 flex items-start gap-3">
             <Icon name="i-hugeicons-alert-circle" class="w-5 h-5 shrink-0 mt-0.5" />
             <p>{{ error }}</p>
          </div>

          <!-- Specializations Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-12">
            <button
              v-for="spec in specializations"
              :key="spec.id"
              @click="!isDisabled(spec.id) && toggleSpecialization(spec.id)"
              :disabled="isDisabled(spec.id) && !(onboardingData.specializations || []).includes(spec.id)"
              :class="[
                'group text-left p-5 rounded-2xl transition-all duration-200 border-2 relative overflow-hidden focus:outline-none',
                (onboardingData.specializations || []).includes(spec.id)
                  ? 'border-black bg-gray-50/80 shadow-[0_4px_12px_rgba(0,0,0,0.05)] shadow-black/5 transform -translate-y-[2px]'
                  : isDisabled(spec.id)
                  ? 'border-gray-100 bg-gray-50/50 opacity-40 cursor-not-allowed'
                  : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-xs focus:ring-2 focus:ring-black/5'
              ]"
            >
              <!-- Checkmark icon top right -->
               <div :class="[
                   'absolute top-4 right-4 w-5 h-5 rounded-full border transition-all flex items-center justify-center shadow-xs',
                   (onboardingData.specializations || []).includes(spec.id)
                    ? 'border-black bg-black text-white' : 'border-gray-300 bg-white'
               ]">
                  <Icon v-if="(onboardingData.specializations || []).includes(spec.id)" name="i-hugeicons-tick-02" class="w-3.5 h-3.5" />
               </div>

              <h3 class="font-semibold text-gray-900 text-base mb-1 pr-6 leading-tight">{{ spec.name }}</h3>
              <p class="text-gray-500 text-xs line-clamp-2 leading-relaxed">{{ spec.description }}</p>
            </button>
          </div>

          <!-- Bottom Footer Action Area -->
          <div class="mt-auto sticky bottom-0 border-t border-gray-100 bg-white/90 backdrop-blur-md pt-6 pb-6 lg:pb-10 flex gap-4">
            <UButton
              @click="handleBack"
              color="white"
              size="lg"
              class="hidden sm:flex border border-gray-200 text-gray-700 shadow-none font-medium h-12 px-6 hover:bg-gray-50"
              :disabled="completeOnboarding.isPending.value || isLoadingSpecializations"
            >
              Back
            </UButton>
            <UButton
              @click="handleSubmit"
              color="black"
              size="lg"
              block
              class="font-semibold h-12 shadow-sm"
              :disabled="completeOnboarding.isPending.value || selectedCount === 0 || isLoadingSpecializations"
              :loading="completeOnboarding.isPending.value"
            >
              {{ completeOnboarding.isPending.value ? 'Finishing setup...' : 'Complete Profile' }}
            </UButton>
          </div>
          <!-- Mobile back button underneath the main submit -->
           <button @click="handleBack" class="sm:hidden text-gray-500 font-medium text-sm mt-4 pb-6 hover:text-gray-800 transition-colors">
              Go back
           </button>

        </div>
      </div>
    </div>
  </div>
</template>
