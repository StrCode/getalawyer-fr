<template>
  <div class="space-y-8 pb-20">
    <!-- Heading -->
    <div>
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">
        What do you need help with?
      </h1>
      <p class="text-gray-500 text-sm leading-relaxed">
        Pick up to 3 legal areas. We'll match you with the right lawyers.
      </p>
    </div>

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
          :class="selectedCount === 3 ? 'text-primary-600' : 'text-gray-400'"
        >
          {{ selectedCount === 3 ? 'Max reached' : `${3 - selectedCount} left` }}
        </span>
      </div>
      <div class="bg-gray-100 mb-4 rounded-full w-full h-1.5 overflow-hidden">
        <div
          class="bg-primary-600 rounded-full h-full transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>

      <!-- Selected pills -->
      <div v-if="selectedCount > 0" class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="id in storeState.specializationIds"
          :key="id"
          type="button"
          class="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 py-1 pr-2 pl-3 border border-primary-600/30 rounded-full font-medium text-primary-700 text-xs transition-colors cursor-pointer"
          @click="toggle(id)"
        >
          {{ nameById(id) }}
          <span class="flex justify-center items-center bg-primary-600 rounded-full w-4 h-4 text-white shrink-0" style="font-size:9px">✕</span>
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
            ? 'border-primary-600 bg-primary-50/50'
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
              ? 'border-primary-600 bg-primary-600'
              : 'border-gray-300 bg-white'"
          >
            <Icon v-if="isSelected(spec.id)" name="i-hugeicons-tick-02" class="w-2.5 h-2.5 text-white" />
          </div>

          <p class="mb-0.5 font-semibold text-[13px] text-gray-900 leading-snug">{{ spec.name }}</p>
          <p class="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{{ spec.description }}</p>
        </button>
      </div>
    </ClientOnly>

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

const query = ref('')

const { useSpecializations } = useClientOnboarding()
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

const selectedCount = computed(() => storeState.specializationIds.length)
const progressPercent = computed(() => (selectedCount.value / 3) * 100)

const isSelected = (id: string) => storeState.specializationIds.includes(id)
const isDisabled = (id: string) => !isSelected(id) && selectedCount.value >= 3

const nameById = (id: string) =>
  specializations.value.find((s: any) => s.id === id)?.name ?? id

const toggle = (id: string) => {
  const specs = storeState.specializationIds
  storeState.specializationIds = specs.includes(id)
    ? specs.filter(s => s !== id)
    : [...specs, id]
}

// We rely on the layout's "Submit Application" button to trigger the store's saveStep('specializations') handler, which executes the mutation.
</script>