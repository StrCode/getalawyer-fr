<script setup lang="ts">
import { useRegistration } from '~/composables/useRegistration'

definePageMeta({
  middleware: ['auth'],
  layout: 'registration',
})

const acceptTerms = ref(false)
const error = ref('')

// Use registration composable
const { useRegistrationSummary, useSubmitApplication } = useRegistration()

// Query
const { data: summaryData, isPending } = useRegistrationSummary()

// Mutation
const submitApplication = useSubmitApplication()

const summary = computed(() => summaryData.value?.data || null)

const handleSubmit = async () => {
  if (!acceptTerms.value) {
    error.value = 'You must accept the terms and conditions to continue'
    return
  }

  error.value = ''

  try {
    await submitApplication.mutateAsync()
    await navigateTo('/pending-approval')
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to submit application. Please try again.'
  }
}

const editStep = (step: number) => {
  navigateTo(`/register/step${step}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-6">
      <div class="mb-6">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-medium text-gray-600">Step 6 of 6</span>
          <span class="text-gray-500">Review & Submit</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full transition-all" style="width: 100%"></div>
        </div>
      </div>

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Review Your Application</h1>
        <p class="text-gray-600">Please review all information before submitting</p>
      </div>

      <div v-if="isPending" class="text-center py-12">
        <Icon name="i-hugeicons-loading-03" class="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p class="text-sm text-gray-600">Loading your information...</p>
      </div>

      <div v-else-if="summary" class="space-y-4">
        <!-- Personal Information -->
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex justify-between items-start mb-4">
            <h2 class="font-semibold text-gray-900">Personal Information</h2>
            <button @click="editStep(2)" class="text-primary text-sm hover:underline">Edit</button>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-600">Name:</span> <span class="font-medium">{{ summary.personal.firstName }} {{ summary.personal.middleName }} {{ summary.personal.lastName }}</span></div>
            <div><span class="text-gray-600">Date of Birth:</span> <span class="font-medium">{{ summary.personal.dateOfBirth }}</span></div>
            <div><span class="text-gray-600">Gender:</span> <span class="font-medium capitalize">{{ summary.personal.gender }}</span></div>
            <div><span class="text-gray-600">Location:</span> <span class="font-medium">{{ summary.personal.state }}, {{ summary.personal.lga }}</span></div>
          </div>
        </div>

        <!-- NIN Verification -->
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex justify-between items-start mb-4">
            <h2 class="font-semibold text-gray-900">Identity Verification</h2>
            <div class="flex items-center gap-2">
              <Icon name="i-hugeicons-tick-double-02" class="w-5 h-5 text-green-600" />
              <span class="text-sm text-green-600 font-medium">Verified</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-600">NIN:</span> <span class="font-medium">{{ summary.nin.nin }}</span></div>
            <div><span class="text-gray-600">Verified Name:</span> <span class="font-medium">{{ summary.nin.firstName }} {{ summary.nin.lastName }}</span></div>
            <div><span class="text-gray-600">Phone:</span> <span class="font-medium">{{ summary.nin.mobile }}</span></div>
            <div><span class="text-gray-600">Address:</span> <span class="font-medium">{{ summary.nin.town }}, {{ summary.nin.state }}</span></div>
          </div>
        </div>

        <!-- Professional Information -->
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex justify-between items-start mb-4">
            <h2 class="font-semibold text-gray-900">Professional Information</h2>
            <button @click="editStep(4)" class="text-primary text-sm hover:underline">Edit</button>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-600">Bar Number:</span> <span class="font-medium">{{ summary.professional.barNumber }}</span></div>
            <div><span class="text-gray-600">Year of Call:</span> <span class="font-medium">{{ summary.professional.yearOfCall }}</span></div>
            <div><span class="text-gray-600">Law School:</span> <span class="font-medium">{{ summary.professional.lawSchool }}</span></div>
            <div><span class="text-gray-600">University:</span> <span class="font-medium">{{ summary.professional.university }}</span></div>
            <div><span class="text-gray-600">LLB Year:</span> <span class="font-medium">{{ summary.professional.llbYear }}</span></div>
          </div>
        </div>

        <!-- Practice Information -->
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex justify-between items-start mb-4">
            <h2 class="font-semibold text-gray-900">Practice Information</h2>
            <button @click="editStep(5)" class="text-primary text-sm hover:underline">Edit</button>
          </div>
          <div class="space-y-3 text-sm">
            <div v-if="summary.practice.firmName"><span class="text-gray-600">Firm:</span> <span class="font-medium">{{ summary.practice.firmName }}</span></div>
            <div><span class="text-gray-600">Office:</span> <span class="font-medium">{{ summary.practice.officeStreet }}, {{ summary.practice.officeCity }}, {{ summary.practice.officeState }} {{ summary.practice.officePostalCode }}</span></div>
            <div><span class="text-gray-600">States of Practice:</span> <span class="font-medium">{{ summary.practice.statesOfPractice.join(', ') }}</span></div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <UCheckbox v-model="acceptTerms">
            <template #label>
              <div class="text-sm font-medium text-gray-900 mb-1">I accept the Terms and Conditions</div>
            </template>
            <template #description>
              I confirm that all information provided is accurate and complete. I understand that providing false information may result in rejection of my application or termination of my account.
            </template>
          </UCheckbox>
        </div>

        <UAlert v-if="error" color="error" variant="soft" :description="error" icon="i-hugeicons-alert-circle" />

        <!-- Submit Button -->
        <UButton
          color="primary"
          class="w-full justify-center py-3 font-medium text-lg mt-6"
          :loading="submitApplication.isPending.value"
          :disabled="!acceptTerms"
          @click="handleSubmit"
        >
          Submit Application
        </UButton>
      </div>
    </div>
  </div>
</template>
