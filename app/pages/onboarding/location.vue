<template>
  <div class="mx-auto w-full max-w-2xl space-y-10 pb-20">
    <OnboardingClientStepHeader
      :step="1"
      :total="2"
      label="Location"
      title="Where are you based?"
      description="We'll use your state to surface lawyers who practice in your region and understand local rules."
    />

    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-16 w-full rounded-xl" />
      <Skeleton class="h-16 w-full rounded-xl" />
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
        <p class="text-sm font-medium text-foreground">State or region</p>

        <Select v-model="storeState.state">
          <SelectTrigger
            class="h-auto min-h-14 w-full rounded-xl border-border bg-muted/40 px-4 py-3.5 text-base shadow-sm data-[size=default]:h-auto"
          >
            <SelectValue placeholder="Select state or region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="s in availableStates"
              :key="s.value"
              :value="s.value"
            >
              {{ s.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { PhWarningCircle } from '@phosphor-icons/vue'

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
  const selected = countries.value.find((c: { code2: string }) => c.code2 === storeState.country)
  const states = selected?.states || []
  return states.map((s: { code: string; name: string }) => ({
    label: s.name,
    value: s.code,
  }))
})
</script>
