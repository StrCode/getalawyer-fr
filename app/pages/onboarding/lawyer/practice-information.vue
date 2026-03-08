<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'
import { PRACTICE_TYPE_OPTIONS } from '~/constants/registration'
import { NIGERIA_STATES } from '~/constants/nigeria-states-lgas'

definePageMeta({
  middleware: ['auth'],
  layout: 'registration',
})

const schema = z.object({
  practiceType: z.enum(['solo', 'firm']),
  firmName: z.string().optional(),
  practiceAreas: z.array(z.string()).min(1, 'Select at least one practice area'),
  statesOfPractice: z.array(z.string()).min(1, 'Select at least one state'),
  officeAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
}).refine(data => {
  if (data.practiceType === 'firm') {
    return data.firmName && data.firmName.length > 0
  }
  return true
}, {
  message: 'Firm name is required when practice type is firm',
  path: ['firmName'],
})

// Use registration composable
const { usePracticeInfo, useSavePracticeInfo } = useRegistration()

// Query
const { data: existingData, isPending: isLoadingData } = usePracticeInfo()

// Mutation
const savePracticeInfo = useSavePracticeInfo()

const formData = ref({
  practiceType: 'solo' as 'solo' | 'firm',
  firmName: '',
  practiceAreas: [] as string[],
  statesOfPractice: [] as string[],
  officeAddress: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
  },
})
const errors = ref<Record<string, any>>({})

// Populate form when data loads
watch(existingData, (data) => {
  if (data) {
    formData.value = { ...formData.value, ...data }
  }
}, { immediate: true })

const config = useRuntimeConfig()

// Fetch specializations
const { data: specializationsData } = await useFetch<{ specializations: Array<{ id: string; name: string }> }>(`${config.public.apiUrl}/api/specializations`, {
  credentials: 'include',
})
const specializations = computed(() => specializationsData.value?.specializations || [])

// States from constants
const states = NIGERIA_STATES

const togglePracticeArea = (id: string) => {
  const index = formData.value.practiceAreas.indexOf(id)
  if (index > -1) {
    formData.value.practiceAreas.splice(index, 1)
  } else {
    formData.value.practiceAreas.push(id)
  }
}

const toggleState = (code: string) => {
  const index = formData.value.statesOfPractice.indexOf(code)
  if (index > -1) {
    formData.value.statesOfPractice.splice(index, 1)
  } else {
    formData.value.statesOfPractice.push(code)
  }
}

const handleSubmit = async (event: any) => {
  try {
    await savePracticeInfo.mutateAsync(event.data)
    await navigateTo('/register/step7')
  } catch (err: any) {
    console.error(err)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-6">
      <div class="mb-6">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-medium text-gray-600">Step 5 of 6</span>
          <span class="text-gray-500">Practice Information</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full transition-all" style="width: 83%"></div>
        </div>
      </div>

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Practice Information</h1>
        <p class="text-gray-600">Tell us about your legal practice</p>
      </div>
      <!-- Loading State -->
      <div v-if="isLoadingData" class="text-center py-12">
        <Icon name="i-hugeicons-loading-03" class="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p class="text-sm text-gray-600">Loading your information...</p>
      </div>
      
      <UForm v-else :schema="schema" :state="formData" class="space-y-6 bg-white rounded-xl shadow-sm p-6 border" @submit="handleSubmit">
        <!-- Practice Type -->
        <UFormField label="Practice Type" name="practiceType" required>
          <div class="grid grid-cols-2 gap-3 w-full">
            <label :class="['border-2 rounded-lg p-4 cursor-pointer transition-all', formData.practiceType === 'solo' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50']">
              <input v-model="formData.practiceType" type="radio" value="solo" class="sr-only" />
              <div class="font-medium text-sm">Solo Practitioner</div>
              <div class="text-xs text-gray-600 mt-1">Independent practice</div>
            </label>
            <label :class="['border-2 rounded-lg p-4 cursor-pointer transition-all', formData.practiceType === 'firm' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50']">
              <input v-model="formData.practiceType" type="radio" value="firm" class="sr-only" />
              <div class="font-medium text-sm">Law Firm</div>
              <div class="text-xs text-gray-600 mt-1">Part of a firm</div>
            </label>
          </div>
        </UFormField>

        <!-- Firm Name -->
        <UFormField v-if="formData.practiceType === 'firm'" label="Firm Name" name="firmName" required>
          <UInput v-model="formData.firmName" class="w-full" />
        </UFormField>

        <!-- Practice Areas -->
        <UFormField label="Practice Areas" name="practiceAreas" required>
          <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg w-full">
            <label v-for="spec in specializations" :key="spec.id" class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input type="checkbox" :checked="formData.practiceAreas.includes(spec.id)" @change="togglePracticeArea(spec.id)" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              <span class="text-sm">{{ spec.name }}</span>
            </label>
          </div>
        </UFormField>

        <!-- States of Practice -->
        <UFormField label="States of Practice" name="statesOfPractice" required>
          <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg w-full">
            <label v-for="state in states" :key="state.code" class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input type="checkbox" :checked="formData.statesOfPractice.includes(state.code)" @change="toggleState(state.code)" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              <span class="text-sm">{{ state.name }}</span>
            </label>
          </div>
        </UFormField>

        <!-- Office Address -->
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900 border-b pb-2">Office Address</h3>
          
          <UFormField label="Street Address" name="officeAddress.street" required>
            <UInput v-model="formData.officeAddress.street" class="w-full" />
          </UFormField>
          
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="City" name="officeAddress.city" required>
              <UInput v-model="formData.officeAddress.city" class="w-full" />
            </UFormField>
            <UFormField label="State" name="officeAddress.state" required>
              <USelect v-model="formData.officeAddress.state" :items="states" value-key="code" label-key="name" class="w-full" />
            </UFormField>
          </div>
          
          <UFormField label="Postal Code" name="officeAddress.postalCode" required>
            <UInput v-model="formData.officeAddress.postalCode" class="w-full" />
          </UFormField>
        </div>

        <UButton type="submit" color="primary" class="w-full justify-center py-2.5 font-medium mt-4" :loading="savePracticeInfo.isPending.value">
          Continue to Review
        </UButton>

        <UAlert v-if="savePracticeInfo.error.value" color="error" variant="soft" :description="savePracticeInfo.error.value.message" />
      </UForm>
    </div>
  </div>
</template>
