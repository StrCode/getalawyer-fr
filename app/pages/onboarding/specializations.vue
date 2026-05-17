<template>
  <div class="w-full space-y-8 pb-20">
    <OnboardingClientStepHeader
      :step="2"
      :total="2"
      label="Legal needs"
      title="What do you need help with?"
      description="Choose up to three practice areas. We'll use them to recommend lawyers who fit your situation."
    />

    <!-- Selection status (Medium / Kit pattern) -->
    <div class="space-y-3 text-center sm:text-left">
      <p class="text-sm font-medium text-foreground">
        <template v-if="selectedCount === 0">
          Select at least one practice area
        </template>
        <template v-else-if="selectedCount < 3">
          {{ selectedCount }} of 3 selected
          <span class="font-normal text-muted-foreground">
            · {{ slotsLeft }} more {{ slotsLeft === 1 ? 'slot' : 'slots' }} available
          </span>
        </template>
        <template v-else>
          3 of 3 selected
          <span class="font-normal text-muted-foreground">
            · remove one to choose a different area
          </span>
        </template>
      </p>
      <div
        class="flex justify-center gap-1.5 sm:justify-start"
        role="progressbar"
        :aria-valuenow="selectedCount"
        aria-valuemin="0"
        aria-valuemax="3"
        :aria-label="`${selectedCount} of 3 practice areas selected`"
      >
        <span
          v-for="slot in 3"
          :key="slot"
          class="h-1.5 w-10 rounded-full transition-colors duration-300"
          :class="slot <= selectedCount ? 'bg-primary' : 'bg-muted'"
        />
      </div>
    </div>

    <!-- Search -->
    <div class="relative w-full">
      <PhMagnifyingGlass
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        v-model="query"
        type="search"
        placeholder="Search practice areas..."
        class="h-11 pl-9 text-base"
        autocomplete="off"
      />
    </div>

    <div v-if="isLoadingSpecializations" class="flex flex-wrap justify-center gap-2 sm:justify-start">
      <Skeleton v-for="i in 12" :key="i" class="h-10 w-28 rounded-full" />
    </div>

    <div
      v-else-if="filtered.length === 0"
      class="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center"
    >
      <p class="text-sm text-muted-foreground">
        No practice areas match
        <span class="font-medium text-foreground">"{{ query }}"</span>.
      </p>
    </div>

    <div v-else class="space-y-6">
      <!-- Centered pill cloud (Kit / Care.com) -->
      <div class="flex flex-wrap justify-center gap-2 sm:justify-start">
        <button
          v-for="spec in filtered"
          :key="spec.id"
          type="button"
          :disabled="isDisabled(spec.id)"
          class="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          :class="
            isSelected(spec.id)
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50'
          "
          :title="spec.description"
          @click="!isDisabled(spec.id) && toggle(spec.id)"
        >
          {{ spec.name }}
          <PhCheck
            v-if="isSelected(spec.id)"
            class="size-4 shrink-0"
            weight="bold"
            aria-hidden="true"
          />
          <PhPlus
            v-else
            class="size-4 shrink-0 opacity-50"
            weight="bold"
            aria-hidden="true"
          />
        </button>
      </div>

      <!-- Context for last selection -->
      <p
        v-if="expandedSpec"
        class="rounded-xl border border-border bg-muted/30 px-4 py-3 text-center text-sm leading-relaxed text-muted-foreground sm:text-left"
      >
        <span class="font-medium text-foreground">{{ expandedSpec.name }} — </span>
        {{ expandedSpec.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { PhMagnifyingGlass, PhCheck, PhPlus } from '@phosphor-icons/vue'

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

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return specializations.value
  return specializations.value.filter(
    (s: { name: string; description?: string }) =>
      s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q),
  )
})

const selectedCount = computed(() => storeState.specializationIds.length)
const slotsLeft = computed(() => Math.max(0, 3 - selectedCount.value))

const expandedSpec = computed(() => {
  const lastId = storeState.specializationIds.at(-1)
  if (!lastId) return null
  return specializations.value.find((s: { id: string }) => s.id === lastId) ?? null
})

const isSelected = (id: string) => storeState.specializationIds.includes(id)
const isDisabled = (id: string) => !isSelected(id) && selectedCount.value >= 3

const toggle = (id: string) => {
  const specs = storeState.specializationIds
  storeState.specializationIds = specs.includes(id)
    ? specs.filter(s => s !== id)
    : [...specs, id]
}
</script>
