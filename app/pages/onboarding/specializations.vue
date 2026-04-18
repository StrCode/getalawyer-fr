<template>
  <div class="space-y-8 pb-20">
    <!-- Heading -->
    <div>
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">
        What do you need help with?
      </h1>
      <p class="text-gray-500 text-sm leading-relaxed font-medium">
        Pick up to 3 legal areas. We'll match you with the right lawyers.
      </p>
    </div>

    <!-- Search -->
    <div class="relative">
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <PhMagnifyingGlass class="w-5 h-5" />
      </div>
      <Input
        v-model="query"
        placeholder="Search legal areas..."
        class="h-12 pl-10 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full"
      />
    </div>

    <!-- Counter + progress -->
    <ClientOnly>
      <div class="flex justify-between items-center mb-1.5">
        <span class="font-bold text-gray-400 text-[10px] uppercase tracking-wider">
          Selected ({{ selectedCount }}/3)
        </span>
        <span
          class="font-bold text-[10px] uppercase tracking-wider transition-colors"
          :class="selectedCount === 3 ? 'text-primary' : 'text-gray-400'"
        >
          {{ selectedCount === 3 ? 'Max reached' : `${3 - selectedCount} left` }}
        </span>
      </div>
      <div class="bg-gray-100 mb-4 rounded-full w-full h-1.5 overflow-hidden">
        <div
          class="bg-primary rounded-full h-full transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>

      <!-- Selected pills -->
      <div v-if="selectedCount > 0" class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="id in storeState.specializationIds"
          :key="id"
          type="button"
          class="group inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 py-1 pr-1 pl-3 border border-primary/20 rounded-full font-bold text-primary text-[11px] transition-all cursor-pointer shadow-sm active:scale-95"
          @click="toggle(id)"
        >
          {{ nameById(id) }}
          <span class="flex justify-center items-center bg-primary rounded-full w-4 h-4 text-white shrink-0 group-hover:bg-primary/80 transition-colors" style="font-size:8px">✕</span>
        </button>
      </div>
    </ClientOnly>

    <!-- Loading skeleton -->
    <div v-if="isLoadingSpecializations" class="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
      <Skeleton v-for="i in 9" :key="i" class="h-20 rounded-xl" />
    </div>

    <!-- No results -->
    <div v-else-if="filtered.length === 0" class="py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
      <p class="text-gray-400 text-sm font-medium">No legal areas match "<strong>{{ query }}</strong>".</p>
    </div>

    <!-- Grid -->
    <ClientOnly>
      <div v-if="!isLoadingSpecializations && filtered.length > 0" class="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <button
          v-for="spec in filtered"
          :key="spec.id"
          type="button"
          class="group relative px-4 py-4 pr-10 border rounded-xl focus:outline-none text-left transition-all duration-150 ring-primary/20 shadow-sm"
          :class="isSelected(spec.id)
            ? 'border-primary bg-primary/5 ring-1'
            : isDisabled(spec.id)
            ? 'border-gray-50 bg-gray-50/50 opacity-40 cursor-not-allowed'
            : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-md cursor-pointer'"
          :disabled="isDisabled(spec.id)"
          @click="!isDisabled(spec.id) && toggle(spec.id)"
        >
          <!-- Check indicator -->
          <div
            class="top-3 right-3 absolute flex justify-center items-center border-[1.5px] rounded-full w-5 h-5 transition-all shrink-0"
            :class="isSelected(spec.id)
              ? 'border-primary bg-primary'
              : 'border-gray-200 bg-white'"
          >
            <PhCheck v-if="isSelected(spec.id)" class="w-3 h-3 text-white" />
          </div>

          <p class="mb-1 font-bold text-[14px] text-gray-900 leading-tight tracking-tight group-hover:text-primary transition-colors">{{ spec.name }}</p>
          <p class="text-[11px] text-gray-400 line-clamp-2 leading-snug font-medium">{{ spec.description }}</p>
        </button>
      </div>
    </ClientOnly>

  </div>
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { PhMagnifyingGlass, PhCheck } from '@phosphor-icons/vue'

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

// We rely on the layout's "Submit Application" button.
</script>