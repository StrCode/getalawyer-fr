<script setup lang="ts">
import { useId, watch } from 'vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useSpecializations } from '~/composables/useSpecializations'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import {
  PhCircleNotch,
  PhMagnifyingGlass,
  PhX,
  PhCheck,
  PhMapPin,
  PhCheckCircle,
  PhCaretDown
} from '@phosphor-icons/vue'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()
const state = store.practiceInfo

const soloFieldId = useId()

watch(
  () => state.soloPractitioner,
  (solo) => {
    if (solo) state.firmName = ''
  }
)

const { data: specData, isPending: isLoadingSpecs } = useSpecializations()
const specializations = computed(() => specData.value || [])

const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return specializations.value
  return specializations.value.filter((s: any) =>
    s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
  )
})

const nigerianStatesOptions = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT Abuja'
]

const selectedCount = computed(() => state.practiceAreas.length)
const progressPercent = computed(() => (selectedCount.value / 5) * 100)
const isSelected = (id: string) => state.practiceAreas.includes(id)
const isDisabled = (id: string) => !isSelected(id) && selectedCount.value >= 5
const nameById = (id: string) => specializations.value.find((s: any) => s.id === id)?.name ?? id

const toggle = (id: string) => {
  const areas = state.practiceAreas
  state.practiceAreas = areas.includes(id) ? areas.filter(s => s !== id) : [...areas, id]
}

const toggleState = (s: string) => {
  if (state.statesOfPractice.includes(s)) {
    state.statesOfPractice = state.statesOfPractice.filter(item => item !== s)
  } else {
    state.statesOfPractice = [...state.statesOfPractice, s]
  }
}

/** Flat controls: border only (`Input` defaults include shadow-xs — override). */
const inputClass =
  'h-12 rounded-lg border border-gray-200/80 bg-background shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 w-full'

const labelColClass =
  'text-[14px] font-bold leading-snug text-gray-900 md:w-[200px] md:shrink-0 md:pt-1 items-start self-start tracking-tight'

// We rely on the layout's "Next" button to trigger the store's saveStep('practice-information')
</script>

<template>
  <div v-if="isLoadingSpecs" class="flex justify-center py-20">
    <PhCircleNotch class="w-12 h-12 text-primary/20 animate-spin" />
  </div>

  <div v-else class="space-y-12 pb-20">
    <div class="mb-10 space-y-2">
      <h1 class="text-2xl font-bold text-gray-900">Practice Details</h1>
      <p class="mt-2 text-sm text-gray-600">
        Tell us about your law practice, office location, and areas of legal expertise.
      </p>
    </div>

    <div class="space-y-10">
      <!-- Practice identity -->
      <div class="space-y-6">
        <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          Practice identity
        </p>
        <div class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0">
          <label :class="labelColClass">
            Firm or practice name <span class="font-normal text-gray-400">(optional)</span>
          </label>
          <div class="min-w-0 w-full max-w-xl flex-1 space-y-4">
            <Label
              :for="soloFieldId"
              class="hover:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200/80 bg-background p-4 transition-colors has-data-[state=checked]:border-primary/35 has-data-[state=checked]:bg-primary/5"
            >
              <Checkbox :id="soloFieldId" v-model="state.soloPractitioner" class="mt-0.5" />
              <span class="grid min-w-0 flex-1 gap-1">
                <span class="text-sm font-bold leading-snug text-gray-900">I am a solo practitioner</span>
                <span class="text-xs font-medium leading-relaxed text-gray-500">
                  Practising under your own name — no firm or partnership is shown on your profile.
                </span>
              </span>
            </Label>
            <div v-if="!state.soloPractitioner" class="space-y-2">
              <Input
                v-model="state.firmName"
                placeholder="e.g. Adeyemi & Partners"
                :class="inputClass"
              />
              <p class="px-0.5 text-xs font-medium leading-relaxed text-gray-500">
                This name appears on your public profile when you represent a firm or chambers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Practice areas -->
      <div class="space-y-6">
        <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          Practice areas
        </p>
        <div class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0">
          <div class="md:w-[200px] md:shrink-0">
            <p class="text-[14px] font-bold leading-snug text-gray-900">
              Legal specializations <span class="text-primary">*</span>
            </p>
            <p class="mt-2 max-w-[200px] text-xs font-medium leading-relaxed text-gray-500">
              Select up to 5 areas that match how you practise.
            </p>
          </div>
          <div class="min-w-0 w-full flex-1 space-y-4">
            <div class="relative w-full max-w-xl">
              <div class="relative">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <PhMagnifyingGlass class="h-5 w-5" />
                </div>
                <Input
                  v-model="query"
                  placeholder="Search legal areas..."
                  class="h-12 w-full rounded-lg border border-gray-200/80 bg-background pl-10 shadow-none focus-visible:ring-2 focus-visible:ring-primary/15"
                />
              </div>

              <div class="mt-4 flex items-center justify-between px-1">
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Selected ({{ selectedCount }}/5)</span>
                <div class="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                  <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${progressPercent}%` }" />
                </div>
              </div>

              <div v-if="selectedCount > 0" class="mt-4 flex flex-wrap gap-2">
                <button
                  v-for="id in state.practiceAreas"
                  :key="id"
                  type="button"
                  class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 py-1.5 pr-2 pl-3 text-[11px] font-bold text-primary transition-all hover:bg-primary/20 active:scale-95"
                  @click="toggle(id)"
                >
                  {{ nameById(id) }}
                  <PhX class="h-3.5 w-3.5" />
                </button>
              </div>

              <div
                class="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white ring-1 ring-black/[0.04]"
              >
                <div v-if="filtered.length === 0" class="py-10 text-center text-sm italic text-gray-400">
                  No legal areas match "{{ query }}"
                </div>
                <div v-else class="grid max-h-[300px] grid-cols-1 gap-2 overflow-y-auto p-2 sm:grid-cols-2">
                  <button
                    v-for="spec in filtered"
                    :key="spec.id"
                    type="button"
                    class="group relative rounded-lg border p-3 text-left transition-all duration-150"
                    :class="isSelected(spec.id) ? 'border-primary bg-primary/5' : isDisabled(spec.id) ? 'cursor-not-allowed border-gray-50 bg-gray-50 opacity-50' : 'cursor-pointer border-gray-200 bg-white hover:border-gray-300'"
                    :disabled="isDisabled(spec.id)"
                    @click="!isDisabled(spec.id) && toggle(spec.id)"
                  >
                    <p class="mb-0.5 text-[13px] font-bold tracking-tight text-gray-900">{{ spec.name }}</p>
                    <p class="line-clamp-1 text-[10px] font-medium leading-snug text-gray-400">{{ spec.description }}</p>
                    <div v-if="isSelected(spec.id)" class="absolute top-2 right-2">
                      <PhCheckCircle class="h-4.5 w-4.5 text-primary" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- States of practice -->
      <div class="space-y-6">
        <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          Licensing & coverage
        </p>
        <div class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0">
          <label :class="labelColClass">
            States of practice <span class="text-primary">*</span>
          </label>
          <div class="min-w-0 w-full max-w-xl flex-1 space-y-2">
            <Popover>
              <PopoverTrigger as-child>
                <div
                  class="flex h-12 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200/80 bg-background px-4 transition-colors hover:border-gray-300"
                >
                  <div class="flex min-w-0 items-center gap-2 overflow-hidden">
                    <PhMapPin class="h-5 w-5 shrink-0 text-gray-400" />
                    <div v-if="state.statesOfPractice.length === 0" class="truncate font-medium text-gray-400">
                      Select states where you practice
                    </div>
                    <div v-else class="flex gap-1.5 overflow-hidden">
                      <span
                        v-for="s in state.statesOfPractice.slice(0, 2)"
                        :key="s"
                        class="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700"
                      >
                        {{ s }}
                      </span>
                      <span v-if="state.statesOfPractice.length > 2" class="pt-0.5 text-[11px] font-bold text-gray-400">
                        +{{ state.statesOfPractice.length - 2 }} more
                      </span>
                    </div>
                  </div>
                  <div class="text-gray-400">
                    <PhCaretDown class="h-4 w-4" />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent class="w-[var(--reka-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Filter states..." />
                  <CommandList class="max-h-[300px]">
                    <CommandEmpty>No states found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        v-for="s in nigerianStatesOptions"
                        :key="s"
                        :value="s"
                        class="flex cursor-pointer items-center gap-2"
                        @select="toggleState(s)"
                      >
                        <div
                          class="flex h-4 w-4 items-center justify-center rounded border transition-colors"
                          :class="state.statesOfPractice.includes(s) ? 'border-primary bg-primary' : 'border-gray-300'"
                        >
                          <PhCheck v-if="state.statesOfPractice.includes(s)" class="h-3 w-3 text-white" />
                        </div>
                        {{ s }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p class="px-0.5 text-xs font-medium leading-relaxed text-gray-500">
              List all states where you are licensed or actively practising.
            </p>
          </div>
        </div>
      </div>

      <!-- Office address -->
      <div class="space-y-6">
        <p class="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2">
          {{ state.soloPractitioner ? 'Your practice address' : 'Primary office' }}
        </p>
        <div class="flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-x-10 md:gap-y-0">
          <div class="md:w-[200px] md:shrink-0">
            <p class="text-[14px] font-bold leading-snug text-gray-900">
              <template v-if="state.soloPractitioner">
                Your office address <span class="text-primary">*</span>
              </template>
              <template v-else>
                Office address <span class="text-primary">*</span>
              </template>
            </p>
            <p class="mt-2 max-w-[200px] text-xs font-medium leading-relaxed text-gray-500">
              <template v-if="state.soloPractitioner">
                Where you practise on your own — the address clients may visit or use to reach you.
              </template>
              <template v-else>
                Physical location of your principal law office.
              </template>
            </p>
          </div>
          <div class="min-w-0 w-full max-w-xl flex-1 space-y-6">
            <div>
              <label class="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">Street address</label>
              <Input
                v-model="state.officeAddress.street"
                placeholder="e.g. 123 Marina Street"
                :class="inputClass"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">City</label>
                <Input v-model="state.officeAddress.city" placeholder="Lagos" :class="inputClass" />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">State</label>
                <Input v-model="state.officeAddress.state" placeholder="Lagos State" :class="inputClass" />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">Postal code</label>
              <Input v-model="state.officeAddress.postalCode" placeholder="100001" :class="[inputClass, 'max-w-40']" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
