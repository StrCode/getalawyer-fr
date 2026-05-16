<template>
  <div class="space-y-10 pb-20">
    <OnboardingClientStepHeader
      :step="1"
      :total="2"
      label="Location"
      title="Where are you based?"
      description="We'll use your state to surface lawyers who practice in your region and understand local rules."
    />

    <ClientOnly>
      <div
        v-if="storeState.country && storeState.state"
        class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary"
      >
        <PhMapPin class="size-4 shrink-0" weight="fill" />
        {{ selectedStateName || selectedCountryName }}
      </div>
    </ClientOnly>

    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-16 w-full rounded-xl" />
      <Skeleton class="h-11 w-full rounded-lg" />
      <div class="space-y-2">
        <Skeleton v-for="i in 6" :key="i" class="h-11 w-full rounded-lg" />
      </div>
    </div>

    <div
      v-else-if="isError"
      class="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center"
    >
      <PhWarningCircle class="mx-auto mb-3 size-8 text-muted-foreground" />
      <p class="text-sm font-medium text-muted-foreground">
        We couldn't load location data. Refresh the page and try again.
      </p>
    </div>

    <div v-else class="space-y-8">
      <section class="space-y-3">
        <p class="text-sm font-medium text-foreground">Country</p>
        <div
          class="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3.5"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-lg shadow-sm ring-1 ring-border"
              aria-hidden="true"
            >
              🇳🇬
            </span>
            <div class="min-w-0">
              <p class="font-medium text-foreground">Nigeria</p>
              <p class="text-sm text-muted-foreground">
                GetaLawyer is available in Nigeria for now.
              </p>
            </div>
          </div>
          <Badge variant="secondary" class="shrink-0 font-normal">
            Fixed
          </Badge>
        </div>
      </section>

      <section class="space-y-3">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-foreground">State or region</p>
            <p class="mt-0.5 text-sm text-muted-foreground">
              Choose where you usually need legal help.
            </p>
          </div>
          <p
            v-if="storeState.state"
            class="shrink-0 text-sm font-medium text-primary"
          >
            Selected
          </p>
        </div>

        <div class="relative">
          <PhMagnifyingGlass
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            v-model="stateQuery"
            type="search"
            placeholder="Search states..."
            class="h-11 pl-9 text-base"
            autocomplete="off"
          />
        </div>

        <div
          class="max-h-[min(22rem,50vh)] overflow-y-auto rounded-xl border border-border bg-background p-1.5 shadow-sm"
          role="listbox"
          aria-label="Nigerian states"
        >
          <p
            v-if="filteredStates.length === 0"
            class="px-3 py-8 text-center text-sm text-muted-foreground"
          >
            No state matches "<span class="font-medium text-foreground">{{ stateQuery }}</span>".
          </p>
          <button
            v-for="s in filteredStates"
            :key="s.value"
            type="button"
            role="option"
            :aria-selected="storeState.state === s.value"
            class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
            :class="
              storeState.state === s.value
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            "
            @click="handleStateIdChange(s.value)"
          >
            <span class="font-medium">{{ s.label }}</span>
            <PhCheck
              v-if="storeState.state === s.value"
              class="size-4 shrink-0"
              weight="bold"
            />
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { PhCheck, PhMagnifyingGlass, PhMapPin, PhWarningCircle } from '@phosphor-icons/vue'

definePageMeta({
  middleware: ['auth'],
  layout: 'onboarding-wizard',
})

const store = useClientOnboardingStore()
const storeState = store.clientState
const stateQuery = ref('')

const { useCountries } = useClientOnboarding()
const { data: countriesData, isPending: isLoading, isError } = useCountries()

const countries = computed(() => countriesData.value?.data || [])
const availableStates = computed(() => {
  const selected = countries.value.find((c: { code2: string }) => c.code2 === storeState.country)
  const states = selected?.states || []
  return states.map((s: { code: string; name: string }) => ({
    label: s.name,
    value: s.code,
  }))
})
const filteredStates = computed(() => {
  const q = stateQuery.value.trim().toLowerCase()
  if (!q) return availableStates.value
  return availableStates.value.filter((s: { label: string }) =>
    s.label.toLowerCase().includes(q),
  )
})
const selectedCountryName = computed(
  () => countries.value.find((c: { code2: string }) => c.code2 === storeState.country)?.name || '',
)
const selectedStateName = computed(() => {
  const stateItem = availableStates.value.find(
    (s: { value: string }) => s.value === storeState.state,
  )
  return stateItem?.label || ''
})

const handleStateIdChange = (value: string) => {
  storeState.state = value
}
</script>
