<script setup lang="ts">
import { NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'

/**
 * Client onboarding, step 1: the state the client needs legal help in.
 * getalawyer only operates in Nigeria, so there is no country to choose: the
 * step is the state alone, picked from the same list of states the directory
 * and lawyers' profiles use (so a client's state matches lawyers' states).
 */
definePageMeta({
  middleware: ['auth'],
  layout: 'welcome',
})

useHead({ title: 'Which state are you in?' })

const store = useClientOnboardingStore()
const storeState = store.clientState

/** What each state is called on screen; the stored value stays the list's own name. */
function displayName(state: string) {
  return state === 'FCT' ? 'Abuja (FCT)' : state
}

// In the order people read them: "Abuja (FCT)" belongs with the A's, not under F.
const ordered = [...NIGERIA_STATE_NAMES].sort((a, b) => displayName(a).localeCompare(displayName(b)))

const query = ref('')
const states = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return ordered
  return ordered.filter(state => displayName(state).toLowerCase().includes(q) || state.toLowerCase().includes(q))
})

function choose(state: string) {
  storeState.state = state
  store.validationError = null
}
</script>

<template>
  <div>
    <h1 class="text-3xl md:text-4xl leading-none font-normal tracking-tight text-balance">Which state are you in?</h1>
    <p class="mt-2.5 max-w-152 text-muted-foreground">We show you lawyers who practise there first. You can search any other state whenever you like.</p>

    <label for="state-search" class="mt-6.5 flex items-center gap-3 rounded-full border border-border bg-card py-1.25 pr-1.25 pl-4">
      <CanopyGlyph name="search" :size="18" :stroke="2.2" class="flex-none text-muted-foreground" />
      <span class="sr-only">Search states</span>
      <input
        id="state-search"
        v-model="query"
        type="search"
        placeholder="Search states"
        autocomplete="off"
        class="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
      >
    </label>

    <div role="radiogroup" aria-label="State" class="mt-4.5 flex flex-wrap gap-1.5">
      <button
        v-for="state in states"
        :key="state"
        type="button"
        role="radio"
        :aria-checked="storeState.state === state"
        class="min-h-10.5 cursor-pointer rounded-full border border-border bg-card px-3.75 text-base font-medium transition-colors duration-200 hover:border-brand aria-checked:border-foreground aria-checked:bg-foreground aria-checked:text-background"
        @click="choose(state)"
      >
        {{ displayName(state) }}
      </button>
      <p v-if="states.length === 0" class="py-2 text-muted-foreground">No state matches “{{ query.trim() }}”.</p>
    </div>

    <p aria-live="polite" class="mt-3.5 text-sm text-muted-foreground">
      <template v-if="storeState.state"><b class="font-medium text-brand">{{ displayName(storeState.state) }}</b> selected.</template>
      <template v-else>getalawyer covers all 36 states and the FCT.</template>
    </p>
  </div>
</template>
