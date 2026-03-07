<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'

definePageMeta({
  middleware: ['auth', 'registration-guard'],
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
const handleVerify = async () => {
  try {
    schema.parse(formData.value)
    errors.value = {}
    
    const response = await verifyNIN.mutateAsync({
      nin: formData.value.nin,
      consent: formData.value.consent,
    })
    
    if (response.success) {
      verificationResult.value = response.data
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      errors.value = err.flatten().fieldErrors
    } else {
      errors.value = { nin: [err.data?.message || 'Failed to verify NIN. Please try again.'] }
    }
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
        <form @submit.prevent="handleVerify" class="space-y-5">
          <!-- NIN Input -->
          <div>
            <label class="block text-sm font-medium mb-1.5 text-gray-700">
              National Identification Number (NIN) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.nin"
              type="text"
              maxlength="11"
              placeholder="Enter your 11-digit NIN"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              :class="{ 'border-red-500': errors.nin }"
            />
            <p v-if="errors.nin" class="text-red-500 text-xs mt-1">
              {{ errors.nin[0] }}
            </p>
            <p class="text-gray-500 text-xs mt-1">Your NIN is an 11-digit number on your National ID card</p>
          </div>

          <!-- Consent Checkbox -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="formData.consent"
                type="checkbox"
                class="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <div class="flex-1">
                <p class="text-sm text-gray-900 font-medium mb-1">Consent to Verify</p>
                <p class="text-xs text-gray-600">
                  I consent to the verification of my National Identification Number (NIN) for identity verification purposes. 
                  This information will be used solely for registration and will be handled in accordance with data protection regulations.
                </p>
              </div>
            </label>
            <p v-if="errors.consent" class="text-red-500 text-xs mt-2">
              {{ errors.consent[0] }}
            </p>
          </div>

          <!-- Info Box -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex gap-3">
              <Icon name="heroicons:information-circle" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-yellow-900 mb-1">Why do we need this?</p>
                <p class="text-xs text-yellow-800">
                  NIN verification helps us ensure the authenticity of lawyer registrations and maintain the integrity of our platform. 
                  Your information is secure and will only be used for verification purposes.
                </p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="verifyNIN.isPending.value || !formData.consent"
            class="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Icon v-if="verifyNIN.isPending.value" name="lucide:loader-circle" class="w-4 h-4 inline animate-spin mr-2" />
            {{ verifyNIN.isPending.value ? 'Verifying...' : 'Verify NIN' }}
          </button>
        </form>
      </div>

      <!-- Verification Result -->
      <div v-else class="space-y-4">
        <!-- Success Message -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex gap-3">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600 flex-shrink-0" />
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
          <button
            @click="handleRetry"
            :disabled="confirmNIN.isPending.value"
            class="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Retry Verification
          </button>
          <button
            @click="handleConfirm"
            :disabled="confirmNIN.isPending.value"
            class="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Icon v-if="confirmNIN.isPending.value" name="lucide:loader-circle" class="w-4 h-4 inline animate-spin mr-2" />
            {{ confirmNIN.isPending.value ? 'Confirming...' : 'Confirm & Continue' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
