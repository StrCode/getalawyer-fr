<template>
  <div class="space-y-10 pb-20">
    <OnboardingClientStepHeader
      :step="2"
      :total="2"
      label="Legal needs"
      title="What do you need help with?"
      description="Choose up to three practice areas. We'll use them to recommend lawyers who fit your situation."
    />

    <ClientOnly>
      <div
        class="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border"
          >
            <svg class="size-11 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                class="stroke-muted"
                stroke-width="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                class="stroke-primary transition-all duration-300"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="`${progressPercent} 100`"
                pathLength="100"
              />
            </svg>
            <span class="absolute text-xs font-semibold text-foreground">
              {{ selectedCount }}
            </span>
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">
              {{ selectedCount === 0 ? 'Pick at least one area' : `${selectedCount} of 3 selected` }}
            </p>
            <p class="text-sm text-muted-foreground">
              {{
                selectedCount === 3
                  ? 'You can remove one to choose a different area.'
                  : `${slotsLeft} more ${slotsLeft === 1 ? 'slot' : 'slots'} available`
              }}
            </p>
          </div>
        </div>

        <div
          v-if="selectedCount > 0"
          class="flex flex-wrap gap-2"
        >
          <button
            v-for="id in storeState.specializationIds"
            :key="id"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary px-3 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            @click="toggle(id)"
          >
            {{ nameById(id) }}
            <PhX class="size-3.5" weight="bold" />
          </button>
        </div>
      </div>
    </ClientOnly>

    <div class="relative max-w-xl">
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

    <div v-if="isLoadingSpecializations" class="flex flex-wrap gap-2">
      <Skeleton v-for="i in 12" :key="i" class="h-9 w-28 rounded-full" />
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

    <ClientOnly>
      <div v-if="!isLoadingSpecializations && filtered.length > 0" class="space-y-6">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="spec in filtered"
            :key="spec.id"
            type="button"
            :disabled="isDisabled(spec.id)"
            class="rounded-full border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            :class="
              isSelected(spec.id)
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/50'
            "
            :title="spec.description"
            @click="!isDisabled(spec.id) && toggle(spec.id)"
          >
            {{ spec.name }}
          </button>
        </div>

        <p
          v-if="expandedSpec"
          class="max-w-2xl rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
        >
          <span class="font-medium text-foreground">{{ expandedSpec.name }} — </span>
          {{ expandedSpec.description }}
        </p>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'

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
const progressPercent = computed(() => (selectedCount.value / 3) * 100)

const expandedSpec = computed(() => {
  const lastId = storeState.specializationIds.at(-1)
  if (!lastId) return null
  return specializations.value.find((s: { id: string }) => s.id === lastId) ?? null
})

const isSelected = (id: string) => storeState.specializationIds.includes(id)
const isDisabled = (id: string) => !isSelected(id) && selectedCount.value >= 3

const nameById = (id: string) =>
  specializations.value.find((s: { id: string; name: string }) => s.id === id)?.name ?? id

const toggle = (id: string) => {
  const specs = storeState.specializationIds
  storeState.specializationIds = specs.includes(id)
    ? specs.filter(s => s !== id)
    : [...specs, id]
}
</script>
