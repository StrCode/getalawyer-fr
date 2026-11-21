<script setup lang="ts">
import LegalAcceptanceFields from '~/components/onboarding/LegalAcceptanceFields.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'

/** Client onboarding, step 2: up to three practice areas, and the terms. */
definePageMeta({
  middleware: ['auth'],
  layout: 'welcome',
})

useHead({ title: 'Choose your legal interests' })

const MAX = 3

const store = useClientOnboardingStore()
const storeState = store.clientState

const legalFieldsEl = ref<HTMLElement | null>(null)
watch(() => store.termsError, (error) => {
  if (error) void nextTick(() => legalFieldsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
})

const { useSpecializations } = useClientOnboarding()
const { data, isPending } = useSpecializations()
const areas = computed(() => data.value?.specializations || [])

const query = ref('')
const visible = computed(() => {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return areas.value
  return areas.value.filter((area: { name: string, description?: string, keywords?: string[] }) => {
    const text = `${area.name} ${area.description ?? ''} ${(area.keywords ?? []).join(' ')}`.toLowerCase()
    return words.some(word => text.includes(word))
  })
})

const count = computed(() => storeState.specializationIds.length)
const isSelected = (id: string) => storeState.specializationIds.includes(id)
const isFull = computed(() => count.value >= MAX)

function toggle(id: string) {
  const chosen = storeState.specializationIds
  if (chosen.includes(id)) storeState.specializationIds = chosen.filter(item => item !== id)
  else if (!isFull.value) storeState.specializationIds = [...chosen, id]
  if (storeState.specializationIds.length) store.validationError = null
}

/** The area picked last, described in a line under the list. */
const lastPicked = computed(() => {
  const id = storeState.specializationIds.at(-1)
  return id ? areas.value.find((area: { id: string }) => area.id === id) ?? null : null
})
</script>

<template>
  <div>
    <h1 class="text-[clamp(1.75rem,2.9vw,2.25rem)] leading-[1.04] font-[650] tracking-[-0.035em] text-balance">Choose your legal interests</h1>
    <p class="mt-[0.6rem] max-w-[38rem] text-muted-foreground">Pick up to three areas. We use them to recommend lawyers who fit your situation.</p>

    <div v-if="isPending" class="mt-[1.6rem] flex flex-wrap gap-[0.4rem]" aria-busy="true" aria-label="Loading practice areas">
      <Skeleton v-for="n in 9" :key="n" class="h-[2.6rem] w-32 rounded-full" />
    </div>

    <template v-else>
      <label v-if="areas.length > 8" for="area-filter" class="mt-[1.6rem] flex items-center gap-3 rounded-full border border-border bg-card py-[0.3rem] pr-[0.3rem] pl-4">
        <CanopyGlyph name="search" :size="18" :stroke="2.2" class="flex-none text-muted-foreground" />
        <span class="sr-only">Search practice areas</span>
        <input
          id="area-filter"
          v-model="query"
          type="search"
          placeholder="Tenancy, divorce, unpaid salary…"
          class="min-h-11 min-w-0 flex-1 bg-transparent text-[1rem] outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
        >
      </label>

      <div role="group" aria-label="Practice areas" class="mt-[1.1rem] flex flex-wrap gap-[0.4rem]">
        <button
          v-for="area in visible"
          :key="area.id"
          type="button"
          :aria-pressed="isSelected(area.id)"
          :disabled="isFull && !isSelected(area.id)"
          class="min-h-[2.6rem] cursor-pointer rounded-full border border-border bg-card px-[0.95rem] text-[0.92rem] font-semibold transition-colors duration-200 hover:border-brand disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-border aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          @click="toggle(area.id)"
        >
          {{ area.name }}
        </button>
        <p v-if="visible.length === 0" class="py-2 text-muted-foreground">No practice area matches “{{ query.trim() }}”.</p>
      </div>

      <p aria-live="polite" class="mt-[0.9rem] text-[0.85rem] font-semibold text-brand">
        {{ count }} of {{ MAX }} selected<template v-if="isFull"> · remove one to choose a different area</template>
      </p>
      <p v-if="lastPicked?.description" class="mt-[0.4rem] text-[0.92rem] text-muted-foreground">
        <b class="font-semibold text-foreground">{{ lastPicked.name }}:</b> {{ lastPicked.description }}
      </p>
    </template>

    <div ref="legalFieldsEl" class="mt-[1.6rem]">
      <LegalAcceptanceFields
        variant="client"
        :terms-accepted="storeState.termsAccepted"
        :error="store.termsError"
        @update:terms-accepted="(v) => { storeState.termsAccepted = v }"
      />
    </div>
  </div>
</template>
