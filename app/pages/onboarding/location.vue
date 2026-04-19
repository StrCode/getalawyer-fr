<template>
  <div class="space-y-8 pb-20">
    <!-- Heading -->
    <div>
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">
        Where are you located?
      </h1>
      <p class="text-gray-500 text-sm leading-relaxed font-medium">
        We'll use your location to filter qualified lawyers near you.
      </p>
    </div>

    <!-- Selected region (when complete) -->
    <ClientOnly>
      <div
        v-if="storeState.country && storeState.state"
        class="flex flex-wrap gap-2"
      >
        <div
          class="inline-flex items-center gap-1.5 bg-primary/10 py-1 px-3 border border-primary/20 rounded-full font-bold text-primary text-[11px] shadow-sm"
        >
          <PhCheck class="w-3.5 h-3.5 shrink-0" />
          {{ selectedStateName || selectedCountryName || 'Your region' }}
        </div>
      </div>
    </ClientOnly>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <Skeleton class="h-12 rounded-lg w-full max-w-xl" />
      <Skeleton class="h-12 rounded-lg w-full max-w-xl" />
    </div>

    <!-- Error -->
    <div
      v-else-if="isError"
      class="py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200"
    >
      <p class="text-gray-400 text-sm font-medium">
        Failed to load location data. Please refresh and try again.
      </p>
    </div>

    <!-- Form -->
    <div v-else class="space-y-6 max-w-xl">
      <!-- Country -->
      <div>
        <div class="flex justify-between items-center mb-1.5">
          <span class="font-bold text-gray-400 text-[10px] uppercase tracking-wider">
            Country
          </span>
          <span class="font-bold text-[10px] uppercase tracking-wider text-gray-400">
            Fixed
          </span>
        </div>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <PhLock class="w-5 h-5" />
          </div>
          <div
            class="flex items-center h-12 pl-10 pr-4 rounded-lg border border-gray-200 bg-gray-50/80 text-gray-500 text-sm font-medium cursor-not-allowed w-full"
          >
            Nigeria
          </div>
        </div>
        <p class="mt-2 text-[11px] text-gray-400 font-medium leading-snug">
          Currently available in Nigeria only
        </p>
      </div>

      <!-- State -->
      <div>
        <div class="mb-1.5">
          <span class="font-bold text-gray-400 text-[10px] uppercase tracking-wider">
            State / region
          </span>
        </div>
        <Select :model-value="storeState.state" @update:model-value="handleStateIdChange">
          <SelectTrigger
            class="h-12 rounded-lg border-gray-200 focus:ring-primary/20 w-full"
          >
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
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { PhCheck, PhLock } from '@phosphor-icons/vue'

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
