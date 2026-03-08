<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

const { useSummary, useSaveProfessionalInfo } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: saveInfo, isPending: isSaving, error: saveError } = useSaveProfessionalInfo()

const schema = z.object({
  barNumber: z.string().min(5, 'Bar Number is required'),
  lawSchool: z.string().min(3, 'Law school name is required'),
  yearOfCall: z.number().int().min(1950, 'Invalid year').max(new Date().getFullYear(), 'Cannot be in the future'),
  graduationYear: z.number().int().min(1950, 'Invalid year').max(new Date().getFullYear(), 'Cannot be in the future'),
  university: z.string().min(3, 'University name is required'),
  llbYear: z.number().int().min(1950, 'Invalid year').max(new Date().getFullYear(), 'Cannot be in the future'),
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  barNumber: '',
  lawSchool: '',
  yearOfCall: new Date().getFullYear(),
  graduationYear: new Date().getFullYear(),
  university: '',
  llbYear: new Date().getFullYear(),
})

watchEffect(() => {
  if (summary.value?.professional) {
    Object.assign(state, summary.value.professional)
  }
})

const currentYear = new Date().getFullYear()

const handleSubmit = async () => {
  saveInfo(state)
}
</script>

<template>
  <div v-if="isLoadingSummary" class="flex justify-center py-20">
    <Icon name="lucide:loader-circle" class="w-12 h-12 text-primary animate-spin" />
  </div>

  <UForm v-else :schema="schema" :state="state" class="space-y-8" @submit="handleSubmit">
    <!-- Error Banner -->
    <UAlert 
      v-if="saveError" 
      color="error" 
      variant="soft" 
      title="Error" 
      :description="saveError.message || 'Failed to save professional info. Please try again.'"
      icon="heroicons:exclamation-triangle"
    />

    <!-- Bar Admission Section -->
    <div class="space-y-6">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-xl font-semibold text-gray-900">Bar Admission</h3>
        <p class="text-sm text-gray-500 mt-1">Provide your Nigerian Bar Association credentials</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="NBA Supreme Court Number (Bar Number)" name="barNumber" required size="xl" class="md:col-span-2">
          <UInput 
            v-model="state.barNumber" 
            size="xl"
            placeholder="e.g. SCN000000" 
            icon="heroicons:identification"
            class="w-full"
          />
          <template #hint>
            <span class="text-xs text-gray-500">Your Supreme Court enrollment number</span>
          </template>
        </UFormField>

        <UFormField label="Year of Call to Bar" name="yearOfCall" required size="xl">
          <UInput 
            v-model.number="state.yearOfCall" 
            type="number" 
            size="xl"
            :min="1950" 
            :max="currentYear"
            icon="heroicons:calendar"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- University Education Section -->
    <div class="space-y-6">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-xl font-semibold text-gray-900">University Education</h3>
        <p class="text-sm text-gray-500 mt-1">Details about your undergraduate law degree (LLB)</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="University Attended" name="university" required size="xl" class="md:col-span-2">
          <UInput 
            v-model="state.university" 
            size="xl"
            placeholder="e.g. University of Lagos" 
            icon="heroicons:building-library"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Year of LLB Graduation" name="llbYear" required size="xl">
          <UInput 
            v-model.number="state.llbYear" 
            type="number" 
            size="xl"
            :min="1950" 
            :max="currentYear"
            icon="heroicons:calendar"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Law School Section -->
    <div class="space-y-6">
      <div class="border-b border-gray-200 pb-3">
        <h3 class="text-xl font-semibold text-gray-900">Law School</h3>
        <p class="text-sm text-gray-500 mt-1">Nigerian Law School attendance and graduation details</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="Law School Campus" name="lawSchool" required size="xl" class="md:col-span-2">
          <UInput 
            v-model="state.lawSchool" 
            size="xl"
            placeholder="e.g. Nigerian Law School, Lagos Campus" 
            icon="heroicons:academic-cap"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Year of Graduation" name="graduationYear" required size="xl">
          <UInput 
            v-model.number="state.graduationYear" 
            type="number" 
            size="xl"
            :min="1950" 
            :max="currentYear"
            icon="heroicons:calendar"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="pt-6 border-t border-gray-200">
      <UButton
        type="submit"
        size="xl"
        color="primary"
        block
        :loading="isSaving"
        icon="heroicons:arrow-right"
        trailing
      >
        Save & Continue
      </UButton>
    </div>
  </UForm>
</template>
