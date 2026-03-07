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

const handleSubmit = async () => {
  try {
    schema.parse(formData.value)
    errors.value = {}
    
    await savePracticeInfo.mutateAsync(formData.value)
    await navigateTo('/register/step7')
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      errors.value = err.flatten().fieldErrors
    }
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
      
      <form v-else @submit.prevent="handleSubmit" class="space-y-6 bg-white rounded-xl shadow-sm p-6 border">
        <!-- Practice Type -->
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700">Practice Type <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-2 gap-3">
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
        </div>

        <!-- Firm Name -->
        <div v-if="formData.practiceType === 'firm'">
          <label class="block text-sm font-medium mb-1.5 text-gray-700">Firm Name <span class="text-red-500">*</span></label>
          <input v-model="formData.firmName" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" :class="{ 'border-red-500': errors.firmName }" />
          <p v-if="errors.firmName" class="text-red-500 text-xs mt-1">{{ errors.firmName[0] }}</p>
        </div>

        <!-- Practice Areas -->
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700">Practice Areas <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
            <label v-for="spec in specializations" :key="spec.id" class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input type="checkbox" :checked="formData.practiceAreas.includes(spec.id)" @change="togglePracticeArea(spec.id)" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              <span class="text-sm">{{ spec.name }}</span>
            </label>
          </div>
          <p v-if="errors.practiceAreas" class="text-red-500 text-xs mt-1">{{ errors.practiceAreas[0] }}</p>
        </div>

        <!-- States of Practice -->
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700">States of Practice <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
            <label v-for="state in states" :key="state.code" class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input type="checkbox" :checked="formData.statesOfPractice.includes(state.code)" @change="toggleState(state.code)" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              <span class="text-sm">{{ state.name }}</span>
            </label>
          </div>
          <p v-if="errors.statesOfPractice" class="text-red-500 text-xs mt-1">{{ errors.statesOfPractice[0] }}</p>
        </div>

        <!-- Office Address -->
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900">Office Address</h3>
          <div>
            <label class="block text-sm font-medium mb-1.5 text-gray-700">Street Address <span class="text-red-500">*</span></label>
            <input v-model="formData.officeAddress.street" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
            <p v-if="errors['officeAddress.street']" class="text-red-500 text-xs mt-1">{{ errors['officeAddress.street'][0] }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1.5 text-gray-700">City <span class="text-red-500">*</span></label>
              <input v-model="formData.officeAddress.city" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-gray-700">State <span class="text-red-500">*</span></label>
              <select v-model="formData.officeAddress.state" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
                <option value="">Select state</option>
                <option v-for="state in states" :key="state.code" :value="state.code">{{ state.name }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5 text-gray-700">Postal Code <span class="text-red-500">*</span></label>
            <input v-model="formData.officeAddress.postalCode" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
          </div>
        </div>

        <button type="submit" :disabled="savePracticeInfo.isPending.value" class="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium">
          <Icon v-if="savePracticeInfo.isPending.value" name="lucide:loader-circle" class="w-4 h-4 inline animate-spin mr-2" />
          {{ savePracticeInfo.isPending.value ? 'Saving...' : 'Continue to Review' }}
        </button>
      </form>
    </div>
  </div>
</template>
