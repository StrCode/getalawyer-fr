<template>
  <!-- Heading -->
  <h1 class="mb-1 font-bold text-[28px] text-gray-900 tracking-tight">
    What do you need help with?
  </h1>
  <p class="mb-6 text-gray-500 text-sm leading-relaxed">
    Pick up to 3 legal areas. We'll match you with the right lawyers.
  </p>

  <!-- Search -->
  <UInput
    v-model="query"
    icon="i-hugeicons-search-01"
    size="xl"
    placeholder="Search legal areas..."
    class="mb-4"
  />

  <!-- Counter + progress -->
  <ClientOnly>
    <div class="flex justify-between items-center mb-1.5">
      <span class="font-medium text-gray-400 text-xs uppercase tracking-wider">
        Selected ({{ selectedCount }}/3)
      </span>
      <span
        class="font-semibold text-xs transition-colors"
        :class="selectedCount === 3 ? 'text-[#1d6b44]' : 'text-gray-400'"
      >
        {{ selectedCount === 3 ? 'Max reached' : `${3 - selectedCount} left` }}
      </span>
    </div>
    <div class="bg-gray-100 mb-4 rounded-full w-full h-1.5 overflow-hidden">
      <div
        class="bg-[#1d6b44] rounded-full h-full transition-all duration-300"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- Selected pills -->
    <div v-if="selectedCount > 0" class="flex flex-wrap gap-2 mb-4">
    <button
      v-for="id in onboardingData.specializations"
      :key="id"
      type="button"
      class="inline-flex items-center gap-1.5 bg-[#e8f5ee] hover:bg-[#d4f0de] py-1 pr-2 pl-3 border border-[#1d6b44]/30 rounded-full font-medium text-[#1d6b44] text-xs transition-colors cursor-pointer"
      @click="toggle(id)"
    >
      {{ nameById(id) }}
      <span class="flex justify-center items-center bg-[#1d6b44] rounded-full w-4 h-4 text-white shrink-0" style="font-size:9px">✕</span>
    </button>
  </div>
  </ClientOnly>

  <!-- Loading skeleton -->
  <div v-if="isLoadingSpecializations" class="gap-2 grid grid-cols-2 mb-6">
    <div v-for="i in 8" :key="i" class="bg-gray-100 rounded h-16 animate-pulse" />
  </div>

  <!-- No results -->
  <div v-else-if="filtered.length === 0" class="py-10 text-center">
    <p class="text-gray-400 text-sm">No legal areas match "<strong>{{ query }}</strong>".</p>
  </div>

  <!-- Grid -->
  <ClientOnly>
    <div v-if="!isLoadingSpecializations && filtered.length > 0" class="gap-2 grid grid-cols-3 mb-6">
    <button
      v-for="spec in filtered"
      :key="spec.id"
      type="button"
      class="group relative px-3.5 py-3 pr-9 border-[1.5px] rounded focus:outline-none text-left transition-all duration-150"
      :class="isSelected(spec.id)
        ? 'border-[#1d6b44] bg-[#f6fcf9]'
        : isDisabled(spec.id)
        ? 'border-gray-100 bg-white opacity-35 cursor-not-allowed'
        : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'"
      :disabled="isDisabled(spec.id)"
      @click="!isDisabled(spec.id) && toggle(spec.id)"
    >
      <!-- Check indicator -->
      <div
        class="top-3 right-3 absolute flex justify-center items-center border-[1.5px] rounded-full w-[18px] h-[18px] transition-all shrink-0"
        :class="isSelected(spec.id)
          ? 'border-[#1d6b44] bg-[#1d6b44]'
          : 'border-gray-300 bg-white'"
      >
        <Icon v-if="isSelected(spec.id)" name="i-hugeicons-tick-02" class="w-2.5 h-2.5 text-white" />
      </div>

      <p class="mb-0.5 font-semibold text-[13px] text-gray-900 leading-snug">{{ spec.name }}</p>
      <p class="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{{ spec.description }}</p>
    </button>
  </div>
  </ClientOnly>

  <!-- Error -->
  <div
    v-if="error"
    class="flex items-start gap-2 bg-red-50 mb-4 p-3 border border-red-100 rounded text-red-600 text-sm"
  >
    <Icon name="i-hugeicons-alert-circle" class="mt-0.5 w-4 h-4 shrink-0" />
    <span>{{ error }}</span>
  </div>

  <!-- Actions -->
  <div class="flex gap-3">
    <UButton
      type="button"
      color="neutral"
      variant="outline"
      size="xl"
      @click="navigateTo('/onboarding/client/location')"
    >
      Back
    </UButton>
    <ClientOnly>
      <UButton
        type="button"
        color="primary"
        size="xl"
        block
        :disabled="selectedCount === 0 || completeOnboarding.isPending.value"
        :loading="completeOnboarding.isPending.value"
        @click="handleSubmit"
      >
        <span v-if="completeOnboarding.isPending.value">Finishing setup...</span>
        <span v-else>Complete Profile</span>
      </UButton>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'

definePageMeta({
  middleware: ['auth'],
  layout: 'client-onboarding',
})

const STORAGE_KEY = 'client-onboarding-data'

interface OnboardingData {
  country: string
  state: string
  specializations: string[]
}

const onboardingData = ref<OnboardingData>({ country: '', state: '', specializations: [] })
const query = ref('')
const error = ref('')

// Initialize state on server to match client expectations
const currentStep = useState('onboarding-step', () => 2)
const totalSteps = useState('onboarding-total', () => 2)

// Load from storage on client side only - after mount to avoid hydration mismatch
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const parsed = JSON.parse(saved)
    // Handle both old object format and new string format for state
    let stateValue = parsed.state || ''
    if (typeof parsed.state === 'object' && parsed.state?.value) {
      stateValue = parsed.state.value
    }
    onboardingData.value = {
      country: parsed.country || '',
      state: stateValue,
      specializations: parsed.specializations || [],
    }
  }
})

onMounted(() => {
  if (!onboardingData.value.country) {
    navigateTo('/onboarding/client/location')
  }
})

const { useSpecializations, useCompleteOnboarding } = useClientOnboarding()
const { data: specializationsData, isPending: isLoadingSpecializations } = useSpecializations()

const specializations = computed(() => specializationsData.value?.specializations || [])

// Filter by search query
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return specializations.value
  return specializations.value.filter((s: any) =>
    s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
  )
})

const completeOnboarding = useCompleteOnboarding()

const selectedCount = computed(() => onboardingData.value.specializations.length)
const progressPercent = computed(() => (selectedCount.value / 3) * 100)

const isSelected = (id: string) => onboardingData.value.specializations.includes(id)
const isDisabled = (id: string) => !isSelected(id) && selectedCount.value >= 3

const nameById = (id: string) =>
  specializations.value.find((s: any) => s.id === id)?.name ?? id

const toggle = (id: string) => {
  const specs = onboardingData.value.specializations
  onboardingData.value.specializations = specs.includes(id)
    ? specs.filter(s => s !== id)
    : [...specs, id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData.value))
  error.value = ''
}

const handleSubmit = async () => {
  if (selectedCount.value === 0) {
    error.value = 'Please select at least one specialization.'
    return
  }
  error.value = ''
  try {
    await completeOnboarding.mutateAsync({
      country: onboardingData.value.country,
      state: onboardingData.value.state,
      specializationIds: onboardingData.value.specializations,
    })
    localStorage.removeItem(STORAGE_KEY)
    await navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to complete setup. Please try again.'
  }
}
</script>