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

const handleSubmit = async () => {
  if (state.practiceAreas.length === 0) return false
  return new Promise<boolean>((resolve) => {
    saveInfo(state, {
      onSuccess: () => resolve(true),
      onError: () => resolve(false)
    })
  })
}

// Register save handler for the wizard layout
const registerSaveHandler = inject<(handler: () => Promise<boolean>) => void>('wizard-save-handler')
if (registerSaveHandler) {
  registerSaveHandler(handleSubmit)
}
</script>

<template>
  <div v-if="isLoadingSummary || isLoadingSpecs" class="flex justify-center py-20">
    <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-primary-200 animate-spin" />
  </div>

  <UForm v-else :schema="schema" :state="state" class="space-y-12 pb-20" @submit="handleSubmit">
    <!-- Header Section -->
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Practice Details</h1>
      <p class="text-sm text-gray-600">Tell us about your law practice, office location, and areas of legal expertise.</p>
    </div>

    <!-- Error Banner -->
    <UAlert 
      v-if="saveError" 
      color="error" 
      variant="soft" 
      title="Error" 
      :description="saveError.message || 'Failed to save practice info. Please try again.'"
      icon="i-heroicons-exclamation-triangle"
    />

    <div class="space-y-12">
      <!-- Law Firm Details -->
      <div class="form-row">
        <label class="etsy-label">Law Firm Name <span class="text-gray-400 font-normal">(Optional)</span></label>
        <div class="w-full max-w-md">
           <UInput v-model="state.firmName" placeholder="e.g. Adeyemi & Partners" size="xl" class="etsy-input-base w-full" />
           <p class="etsy-description">Leave empty if you are a Solo Practitioner.</p>
        </div>
      </div>

      <!-- Practice Areas -->
      <div class="form-row pt-4">
        <div>
           <label class="etsy-label block">Practice Areas <span class="text-primary-blue">*</span></label>
           <p class="etsy-description max-w-[180px]">Select up to 5 areas that match your legal specializations.</p>
        </div>
        
        <div class="space-y-4 w-full">
          <div class="relative w-full max-w-xl">
            <UInput v-model="query" icon="i-heroicons-magnifying-glass" size="xl" placeholder="Search legal areas..." class="etsy-input-base w-full" />
            
            <div class="mt-4 flex justify-between items-center px-1">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected ({{ selectedCount }}/5)</span>
              <div class="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                <div class="bg-primary-blue h-full transition-all duration-300" :style="{ width: `${progressPercent}%` }" />
              </div>
            </div>

            <div v-if="selectedCount > 0" class="flex flex-wrap gap-2 mt-4">
              <button v-for="id in state.practiceAreas" :key="id" type="button" class="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 py-1.5 pr-2 pl-3 border border-blue-200 rounded-full font-bold text-primary-blue text-[11px] transition-all cursor-pointer shadow-sm active:scale-95" @click="toggle(id)">
                {{ nameById(id) }}
                <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="mt-6 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                <div v-if="filtered.length === 0" class="py-10 text-center text-gray-400 text-sm italic">
                   No legal areas match "{{ query }}"
                </div>
                <div v-else class="max-h-[300px] overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    v-for="spec in filtered" 
                    :key="spec.id" 
                    type="button" 
                    class="group p-3 border rounded-lg text-left transition-all duration-150 relative" 
                    :class="isSelected(spec.id) ? 'border-primary-blue bg-blue-50/50' : isDisabled(spec.id) ? 'border-gray-50 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'" 
                    :disabled="isDisabled(spec.id)" 
                    @click="!isDisabled(spec.id) && toggle(spec.id)"
                  >
                    <p class="font-bold text-xs text-gray-900 mb-0.5">{{ spec.name }}</p>
                    <p class="text-[10px] text-gray-400 line-clamp-1 leading-snug">{{ spec.description }}</p>
                    <div v-if="isSelected(spec.id)" class="absolute top-2 right-2">
                       <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-primary-blue" />
                    </div>
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <!-- States of Practice -->
      <div class="form-row">
        <label class="etsy-label">States of Practice <span class="text-primary-blue">*</span></label>
        <div class="w-full max-w-xl">
           <USelectMenu v-model="state.statesOfPractice" :items="nigerianStatesOptions" value-key="value" size="xl" multiple placeholder="Select states where you practice" icon="i-heroicons-map" class="etsy-input-base w-full" />
           <p class="etsy-description">List all states where you are currently licensed or actively practicing.</p>
        </div>
      </div>

      <!-- Office Address Section -->
      <div class="form-row pt-4">
        <div>
          <label class="etsy-label block">Primary office address <span class="text-primary-blue">*</span></label>
          <p class="etsy-description max-w-[180px]">The physical location of your principal law office.</p>
        </div>
        
        <div class="space-y-6 max-w-xl">
          <div>
            <label class="text-[11px] font-bold mb-1 block uppercase tracking-wider text-gray-400">Street Address</label>
            <UInput v-model="state.officeAddress.street" placeholder="e.g. 123 Marina Street" size="xl" class="etsy-input-base w-full" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-bold mb-1 block uppercase tracking-wider text-gray-400">City</label>
              <UInput v-model="state.officeAddress.city" placeholder="Lagos" size="xl" class="etsy-input-base" />
            </div>
            <div>
              <label class="text-[11px] font-bold mb-1 block uppercase tracking-wider text-gray-400">State</label>
              <UInput v-model="state.officeAddress.state" placeholder="Lagos State" size="xl" class="etsy-input-base" />
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold mb-1 block uppercase tracking-wider text-gray-400">Postal Code</label>
            <UInput v-model="state.officeAddress.postalCode" placeholder="100001" size="xl" class="etsy-input-base w-40" />
          </div>
        </div>
      </div>
    </div>
  </UForm>
</template>
