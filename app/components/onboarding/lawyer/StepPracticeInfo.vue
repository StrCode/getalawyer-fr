<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import { useSpecializations } from '~/composables/useSpecializations'
import type { OnboardingState } from '~/composables/useLawyerOnboarding'

const props = defineProps<{
  currentState: OnboardingState
  completedSteps: OnboardingState[]
}>()

const { useSummary, useSavePracticeInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: saveInfo, isPending: isSaving, error: saveError } = useSavePracticeInfo()

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
].map(s => ({ label: s, value: s }))

const schema = z.object({
  firmName: z.string().optional(),
  practiceAreas: z.array(z.string()).min(1, 'Select at least one practice area').max(5, 'Maximum of 5 practice areas'),
  statesOfPractice: z.array(z.string()).min(1, 'Select at least one state').max(37, 'Too many states'),
  officeAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(5, 'Postal code is required').max(6, 'Postal code too long')
  })
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  firmName: '',
  practiceAreas: [],
  statesOfPractice: [],
  officeAddress: {
    street: '',
    city: '',
    state: '',
    postalCode: ''
  }
})

watchEffect(() => {
  if (summary.value?.practice) {
    Object.assign(state, {
      firmName: summary.value.practice.firmName || '',
      practiceAreas: summary.value.practice.practiceAreas || [],
      statesOfPractice: summary.value.practice.statesOfPractice || [],
      officeAddress: {
        street: summary.value.practice.officeStreet || '',
        city: summary.value.practice.officeCity || '',
        state: summary.value.practice.officeState || '',
        postalCode: summary.value.practice.officePostalCode || ''
      }
    })
  }
})

const selectedCount = computed(() => state.practiceAreas.length)
const progressPercent = computed(() => (selectedCount.value / 5) * 100)
const isSelected = (id: string) => state.practiceAreas.includes(id)
const isDisabled = (id: string) => !isSelected(id) && selectedCount.value >= 5
const nameById = (id: string) => specializations.value.find((s: any) => s.id === id)?.name ?? id

const toggle = (id: string) => {
  const areas = state.practiceAreas
  state.practiceAreas = areas.includes(id) ? areas.filter(s => s !== id) : [...areas, id]
}

const handleSubmit = () => {
  if (state.practiceAreas.length === 0) return
  saveInfo(state)
}
</script>

<template>
  <div v-if="isLoadingSummary || isLoadingSpecs" class="flex flex-col justify-center items-center py-32">
    <div class="mb-4 border-2 border-gray-200 border-t-gray-900 rounded-full w-8 h-8 animate-spin" />
    <p class="font-medium text-gray-500 text-sm">Loading...</p>
  </div>

  <div v-else class="w-full max-w-2xl">
    <div class="mb-6">
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">Practice Details</h1>
      <p class="text-gray-500 text-sm">Tell us about your law practice and office location</p>
    </div>

    <div class="mb-6">
      <OnboardingLawyerProgressBar :current-state="currentState" :completed-steps="completedSteps" />
    </div>

    <div v-if="saveError" class="flex gap-3 bg-red-50 mb-4 p-4 border border-red-100 rounded-xl text-red-700">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="mt-0.5 shrink-0">
        <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.4"/>
        <path d="M9 5.5v4M9 11.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <p class="font-medium text-sm">{{ saveError.message || 'Failed to save practice info. Please try again.' }}</p>
    </div>

    <UForm :schema="schema" :state="state" @submit="handleSubmit">
      <div class="space-y-8 bg-white shadow-sm px-8 py-8 border border-gray-100 rounded-2xl">
        <div>
          <UFormField label="Law Firm Name (Optional)" name="firmName">
            <UInput v-model="state.firmName" size="md" placeholder="e.g. Adeyemi & Partners (leave empty for Solo Practitioner)" icon="heroicons:building-office-2" class="w-full" />
            <template #hint>
              <span class="text-gray-400 text-xs">Defaults to "Solo Practitioner" if left empty</span>
            </template>
          </UFormField>
        </div>

        <div class="border-gray-100 border-t" />

        <div>
          <h3 class="mb-4 font-bold text-gray-900 text-sm tracking-tight">Practice Areas</h3>
          <UInput v-model="query" icon="i-hugeicons-search-01" size="md" placeholder="Search legal areas..." class="mb-3" />

          <div class="flex justify-between items-center mb-1.5">
            <span class="font-medium text-gray-400 text-xs uppercase tracking-wider">Selected ({{ selectedCount }}/5)</span>
            <span class="font-semibold text-xs transition-colors" :class="selectedCount === 5 ? 'text-[#1d6b44]' : 'text-gray-400'">
              {{ selectedCount === 5 ? 'Max reached' : `${5 - selectedCount} left` }}
            </span>
          </div>
          <div class="bg-gray-100 mb-3 rounded-full w-full h-1.5 overflow-hidden">
            <div class="bg-[#1d6b44] rounded-full h-full transition-all duration-300" :style="{ width: `${progressPercent}%` }" />
          </div>

          <div v-if="selectedCount > 0" class="flex flex-wrap gap-2 mb-3">
            <button v-for="id in state.practiceAreas" :key="id" type="button" class="inline-flex items-center gap-1.5 bg-[#e8f5ee] hover:bg-[#d4f0de] py-1 pr-2 pl-3 border border-[#1d6b44]/30 rounded-full font-medium text-[#1d6b44] text-xs transition-colors cursor-pointer" @click="toggle(id)">
              {{ nameById(id) }}
              <span class="flex justify-center items-center bg-[#1d6b44] rounded-full w-4 h-4 text-white shrink-0" style="font-size:9px">✕</span>
            </button>
          </div>

          <div v-if="!isLoadingSpecs && filtered.length === 0" class="py-6 text-center">
            <p class="text-gray-400 text-sm">No legal areas match "<strong>{{ query }}</strong>".</p>
          </div>

          <div v-if="!isLoadingSpecs && filtered.length > 0" class="gap-2 grid grid-cols-2 mb-2">
            <button v-for="spec in filtered" :key="spec.id" type="button" class="group relative px-3 py-2.5 pr-8 border-[1.5px] rounded focus:outline-none text-left transition-all duration-150" :class="isSelected(spec.id) ? 'border-[#1d6b44] bg-[#f6fcf9]' : isDisabled(spec.id) ? 'border-gray-100 bg-white opacity-35 cursor-not-allowed' : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'" :disabled="isDisabled(spec.id)" @click="!isDisabled(spec.id) && toggle(spec.id)">
              <div class="top-2.5 right-2.5 absolute flex justify-center items-center border-[1.5px] rounded-full w-[16px] h-[16px] transition-all shrink-0" :class="isSelected(spec.id) ? 'border-[#1d6b44] bg-[#1d6b44]' : 'border-gray-300 bg-white'">
                <Icon v-if="isSelected(spec.id)" name="i-hugeicons-tick-02" class="w-2 h-2 text-white" />
              </div>
              <p class="mb-0.5 font-semibold text-[12px] text-gray-900 leading-snug">{{ spec.name }}</p>
              <p class="text-[10px] text-gray-400 line-clamp-1 leading-relaxed">{{ spec.description }}</p>
            </button>
          </div>
        </div>

        <div class="border-gray-100 border-t" />

        <div>
          <UFormField label="States of Practice" name="statesOfPractice" required>
            <USelectMenu v-model="state.statesOfPractice" :items="nigerianStatesOptions" value-key="value" size="md" multiple placeholder="Select states where you practice" icon="heroicons:map" class="w-full" />
            <template #hint>
              <span class="text-gray-400 text-xs">Select all states where you are licensed to practice</span>
            </template>
          </UFormField>
        </div>

        <div class="border-gray-100 border-t" />

        <div>
          <h3 class="mb-4 font-bold text-gray-900 text-sm tracking-tight">Primary Office Address</h3>
          <div class="space-y-4">
            <UFormField label="Street Address" name="officeAddress.street" required>
              <UInput v-model="state.officeAddress.street" size="md" placeholder="e.g. 123 Marina Street" icon="heroicons:map-pin" class="w-full" />
            </UFormField>

            <div class="gap-4 grid grid-cols-2">
              <UFormField label="City" name="officeAddress.city" required>
                <UInput v-model="state.officeAddress.city" size="md" placeholder="e.g. Lagos" icon="heroicons:building-office-2" class="w-full" />
              </UFormField>

              <UFormField label="State" name="officeAddress.state" required>
                <UInput v-model="state.officeAddress.state" size="md" placeholder="e.g. Lagos" icon="heroicons:map-pin" class="w-full" />
              </UFormField>
            </div>

            <UFormField label="Postal Code" name="officeAddress.postalCode" required>
              <UInput v-model="state.officeAddress.postalCode" size="md" placeholder="e.g. 100001" icon="heroicons:envelope" class="w-full" />
            </UFormField>
          </div>
        </div>

        <div class="pt-2 border-gray-100 border-t">
          <button type="submit" :disabled="isSaving || state.practiceAreas.length === 0" class="flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-xl w-full h-[50px] font-semibold text-[15px] text-white tracking-tight transition-colors disabled:cursor-not-allowed">
            <span v-if="isSaving" class="border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin" />
            <template v-else>
              Next Step
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
          </button>
        </div>
      </div>
    </UForm>
  </div>
</template>
