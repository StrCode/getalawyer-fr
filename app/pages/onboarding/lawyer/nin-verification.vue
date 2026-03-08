<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'

definePageMeta({
  middleware: ['auth'],
  layout: 'registration',
})

const schema = z.object({
  nin: z.string().length(11, 'NIN must be exactly 11 digits').regex(/^\d+$/, 'NIN must contain only numbers'),
  consent: z.boolean().refine(val => val === true, 'You must give consent to verify your NIN'),
})

interface NINVerificationResult {
  firstName: string
  middleName: string
  lastName: string
  image: string
  dateOfBirth: string
  gender: string
  mobile: string
  address: {
    addressLine: string
    town: string
    lga: string
    state: string
  }
  idNumber: string
}

// Use registration composable
const { useVerifyNIN, useConfirmNIN } = useRegistration()

// Mutations
const verifyNIN = useVerifyNIN()
const confirmNIN = useConfirmNIN()

// State
const formData = ref({
  nin: '',
  consent: false,
})
const errors = ref<Record<string, string[]>>({})
const verificationResult = ref<NINVerificationResult | null>(null)

// Verify NIN
const handleVerify = async (event: any) => {
  try {
    const response = await verifyNIN.mutateAsync({
      nin: event.data.nin,
      consent: event.data.consent,
    })
    
    if (response.success) {
      verificationResult.value = response.data
    }
  } catch (err: any) {
    errors.value = { nin: [err.data?.message || 'Failed to verify NIN. Please try again.'] }
  }
}

// Confirm and continue
const handleConfirm = async () => {
  try {
    await confirmNIN.mutateAsync(true)
    await navigateTo('/register/step4')
  } catch (err: any) {
    errors.value = { nin: [err.data?.message || 'Failed to confirm. Please try again.'] }
  }
}

// Retry verification
const handleRetry = () => {
  verificationResult.value = null
  formData.value.nin = ''
  formData.value.consent = false
  errors.value = {}
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-6">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-medium text-gray-600">Step 3 of 6</span>
          <span class="text-gray-500">NIN Verification</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full transition-all" style="width: 50%"></div>
        </div>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
        <p class="text-gray-600">We need to verify your identity using your National Identification Number (NIN)</p>
      </div>

      <!-- Verification Form -->
      <div v-if="!verificationResult" class="bg-white rounded-xl shadow-sm p-6 border">
        <UForm :schema="schema" :state="formData" class="space-y-5" @submit="handleVerify">
          <!-- NIN Input -->
          <UFormField label="National Identification Number (NIN)" name="nin" required>
            <UInput
              v-model="formData.nin"
              maxlength="11"
              placeholder="Enter your 11-digit NIN"
              class="w-full"
            />
            <template #description>
              Your NIN is an 11-digit number on your National ID card
            </template>
          </UFormField>

          <!-- Consent Checkbox -->
          <UFormField name="consent">
            <UCheckbox v-model="formData.consent" class="mt-2">
              <template #label>
                <div class="text-sm text-gray-900 font-medium mb-1">Consent to Verify</div>
              </template>
              <template #description>
                I consent to the verification of my National Identification Number (NIN) for identity verification purposes. 
                This information will be used solely for registration and will be handled in accordance with data protection regulations.
              </template>
            </UCheckbox>
          </UFormField>

          <!-- Info Box -->
          <UAlert
            color="warning"
            variant="soft"
            icon="i-hugeicons-information-circle"
            title="Why do we need this?"
            description="NIN verification helps us ensure the authenticity of lawyer registrations and maintain the integrity of our platform. Your information is secure and will only be used for verification purposes."
            class="my-4"
          />

          <!-- Submit Button -->
          <UButton
            type="submit"
            color="primary"
            class="w-full justify-center py-2.5 font-medium mt-4"
            :loading="verifyNIN.isPending.value"
            :disabled="!formData.consent"
          >
            Verify NIN
          </UButton>

          <!-- Global Error -->
          <UAlert v-if="errors.nin" color="error" variant="soft" :description="errors.nin[0]" />
        </UForm>
      </div>

      <!-- Verification Result -->
      <div v-else class="space-y-4">
        <!-- Success Message -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex gap-3">
            <Icon name="i-hugeicons-tick-double-02" class="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-green-900">NIN Verified Successfully</p>
              <p class="text-xs text-green-700 mt-1">Please review the information below and confirm it's correct</p>
            </div>
          </div>
        </div>

        <!-- Verified Information -->
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <h3 class="font-semibold text-gray-900 mb-4">Verified Information</h3>
          
          <div class="space-y-4">
            <!-- Photo -->
            <div v-if="verificationResult.image" class="flex justify-center">
              <img :src="verificationResult.image" alt="NIN Photo" class="w-32 h-32 rounded-lg object-cover border-2 border-gray-200" />
            </div>

            <!-- Personal Details -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">First Name</p>
                <p class="font-medium text-gray-900">{{ verificationResult.firstName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Last Name</p>
                <p class="font-medium text-gray-900">{{ verificationResult.lastName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Middle Name</p>
                <p class="font-medium text-gray-900">{{ verificationResult.middleName || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Date of Birth</p>
                <p class="font-medium text-gray-900">{{ verificationResult.dateOfBirth }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Gender</p>
                <p class="font-medium text-gray-900 capitalize">{{ verificationResult.gender }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Phone Number</p>
                <p class="font-medium text-gray-900">{{ verificationResult.mobile }}</p>
              </div>
            </div>

            <!-- Address -->
            <div class="pt-4 border-t">
              <p class="text-xs text-gray-500 mb-2">Address</p>
              <p class="font-medium text-gray-900 text-sm">
                {{ verificationResult.address.addressLine }}<br>
                {{ verificationResult.address.town }}, {{ verificationResult.address.lga }}<br>
                {{ verificationResult.address.state }}
              </p>
            </div>

            <!-- NIN -->
            <div class="pt-4 border-t">
              <p class="text-xs text-gray-500">NIN</p>
              <p class="font-medium text-gray-900">{{ verificationResult.idNumber }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <UButton
            @click="handleRetry"
            color="neutral"
            variant="outline"
            class="flex-1 justify-center py-2.5 font-medium"
            :disabled="confirmNIN.isPending.value"
          >
            Retry Verification
          </UButton>
          <UButton
            @click="handleConfirm"
            color="primary"
            class="flex-1 justify-center py-2.5 font-medium"
            :loading="confirmNIN.isPending.value"
          >
            Confirm & Continue
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
