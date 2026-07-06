<template>
  <div class="w-full space-y-10 pb-20">
    <OnboardingClientStepHeader
      :step="1"
      :total="2"
      label="Location"
      title="Where do you need legal help?"
      description="Choose your state so we can surface lawyers who practise in your region and understand local rules."
    />

    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-16 w-full rounded-xl" />
      <Skeleton class="h-16 w-full rounded-xl" />
    </div>

    <div
      v-else-if="isError"
      class="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center"
    >
      <HugeiconsIcon :icon="AlertCircleIcon" class="mx-auto mb-3 size-8 text-muted-foreground" />
      <p class="text-sm font-medium text-muted-foreground">
        We couldn't load location data. Refresh the page and try again.
      </p>
    </div>

    <div v-else class="w-full">
      <FieldGroup class="gap-6">
        <Field>
          <FieldLabel>Country</FieldLabel>
          <Select disabled model-value="NG">
            <SelectTrigger>
              <SelectValue>
                <div class="flex items-center gap-2">
                  <span>🇳🇬</span> Nigeria
                </div>
              </SelectValue>
            </SelectTrigger>
          </Select>
          <p class="text-xs text-muted-foreground mt-1">
            GetaLawyer is available in Nigeria for now.
          </p>
        </Field>

        <Field>
          <FieldLabel>State</FieldLabel>
          <Select v-model="storeState.state">
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="s in availableStates"
                :key="s.value"
                :value="s.label"
              >
                {{ s.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
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
    value: s.name,
  }))
})

watch(
  () => storeState.state,
  (state) => {
    if (state) store.validationError = null
  },
)
</script>
