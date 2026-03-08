<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

const { useSummary, useSubmitOnboarding } = useLawyerOnboarding()
const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: submitForm, isPending: isSubmitting, error: submitError } = useSubmitOnboarding()

const handleSubmit = async () => {
  submitForm()
}

// Format helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div v-if="isLoadingSummary" class="flex justify-center py-8">
    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-primary animate-spin" />
  </div>

  <div v-else-if="summary" class="space-y-8">
    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Review Application</h2>
      <p class="text-sm text-gray-500">Please review your information carefully before finalizing your submission. This cannot be updated once submitted.</p>
    </div>

    <!-- Error Banner -->
    <UAlert v-if="submitError" color="error" variant="soft" title="Submission Failed" :description="submitError.message || 'Failed to submit the application. Please try again.'" />

    <!-- Personal Info -->
    <div class="bg-gray-50 rounded-lg p-5 border shadow-sm">
      <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
         <h3 class="text-lg font-medium text-gray-900 border-l-4 border-primary pl-2">Personal Information</h3>
      </div>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div>
          <dt class="text-sm font-medium text-gray-500">Full Name</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.personalInfo?.firstName }} {{ summary.personalInfo?.lastName }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ formatDate(summary.personalInfo?.dateOfBirth || '') }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Gender</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.personalInfo?.gender }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Phone</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.personalInfo?.phoneNumber }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500">Address</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.personalInfo?.address }}, {{ summary.personalInfo?.city }}, {{ summary.personalInfo?.lga ? summary.personalInfo?.lga + ', ' : '' }}{{ summary.personalInfo?.state }}, {{ summary.personalInfo?.country }}</dd>
        </div>
      </dl>
    </div>

    <!-- Verification -->
    <div class="bg-gray-50 rounded-lg p-5 border shadow-sm">
      <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
         <h3 class="text-lg font-medium text-gray-900 border-l-4 border-primary pl-2">Identity Verification</h3>
      </div>
      <div class="flex items-center space-x-2">
         <UIcon v-if="summary.ninVerification?.verified" name="i-heroicons-check-circle" class="w-6 h-6 text-green-500" />
         <UIcon v-else name="i-heroicons-x-circle" class="w-6 h-6 text-red-500" />
         <span class="text-sm text-gray-900">National Identification Number (NIN) {{ summary.ninVerification?.verified ? 'Verified' : 'Not Verified' }}</span>
      </div>
    </div>

    <!-- Professional Info -->
    <div class="bg-gray-50 rounded-lg p-5 border shadow-sm">
      <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
         <h3 class="text-lg font-medium text-gray-900 border-l-4 border-primary pl-2">Professional Credentials</h3>
      </div>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div>
          <dt class="text-sm font-medium text-gray-500">Bar Number</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.professionalInfo?.barNumber }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Year of Call to Bar</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.professionalInfo?.yearOfCall }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Law School</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.professionalInfo?.lawSchool }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Graduation Year</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.professionalInfo?.graduationYear }}</dd>
        </div>
      </dl>
    </div>

    <!-- Practice Info -->
    <div class="bg-gray-50 rounded-lg p-5 border shadow-sm">
      <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
         <h3 class="text-lg font-medium text-gray-900 border-l-4 border-primary pl-2">Practice Details</h3>
      </div>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500">Firm Name</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.practiceInfo?.firmName }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500">Office Address</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.practiceInfo?.officeAddress }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Years of Experience</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.practiceInfo?.yearsOfExperience }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500">States of Practice</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.practiceInfo?.statesOfPractice?.join(', ') || 'None' }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500">Specializations</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ summary.practiceInfo?.specializationIds?.length }} Selected</dd>
        </div>
      </dl>
    </div>

    <!-- User Consent & Submit -->
    <div class="bg-blue-50 p-4 rounded-md border border-blue-200">
       <p class="text-sm text-blue-800">
         By submitting this application, I declare that all information provided is true and accurate. I understand that providing false information may result in the rejection of my application or suspension of my account.
       </p>
    </div>

    <div class="flex justify-end pt-4 border-t">
      <UButton type="button" size="lg" color="primary" @click="handleSubmit" :loading="isSubmitting" trailing-icon="i-heroicons-paper-airplane">
        Submit Application
      </UButton>
    </div>
  </div>
</template>
