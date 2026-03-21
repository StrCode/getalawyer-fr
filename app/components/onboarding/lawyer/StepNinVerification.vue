<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import type { OnboardingState } from '~/composables/useLawyerOnboarding'

const props = defineProps<{
  currentState: OnboardingState
  completedSteps: OnboardingState[]
}>()

const { useInitiateNinVerification, useConfirmNinVerification, useSummary } = useLawyerOnboarding()

const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: initiateNin, isPending: isInitiating, error: initError, data: initResult, reset: resetInit } = useInitiateNinVerification()
const { mutate: confirmNin, isPending: isConfirming, error: confirmError } = useConfirmNinVerification()

const isVerified = computed(() => summary.value?.ninVerification?.verified || false)
const showConfirmationPhase = computed(() => !!initResult.value?.firstName)

const ninFormSchema = z.object({
  nin: z.string().min(11, 'NIN must be 11 digits').max(11, 'NIN must be 11 digits'),
  consent: z.boolean().refine(val => val === true, 'You must provide consent to verify your identity')
})
const ninState = reactive({ nin: '', consent: false })
const confirmState = reactive({ confirmed: false })

const handleInitiate = async () => initiateNin(ninState)

const handleConfirm = async () => {
  if (!ninState.nin) return
  if (confirmState.confirmed) {
    confirmNin({
      nin: ninState.nin,
      confirmed: true,
      verificationData: {
        firstName: initResult.value?.firstName,
        lastName: initResult.value?.lastName,
        middleName: initResult.value?.middleName,
        dateOfBirth: initResult.value?.dateOfBirth,
        gender: initResult.value?.gender,
        mobile: initResult.value?.mobile,
        religion: initResult.value?.religion,
        birthState: initResult.value?.birthState,
        birthLGA: initResult.value?.birthLGA,
        address: initResult.value?.address,
        photo: initResult.value?.photo,
        signature: initResult.value?.signature
      }
    })
  } else {
    resetInit()
  }
}

watchEffect(() => {
  if (isVerified.value) resetInit()
})
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoadingSummary" class="flex flex-col justify-center items-center py-32">
    <div class="mb-4 border-2 border-gray-200 border-t-gray-900 rounded-full w-8 h-8 animate-spin" />
    <p class="font-medium text-gray-500 text-sm">Loading...</p>
  </div>

  <!-- Already verified -->
  <div v-else-if="isVerified" class="w-full max-w-xl">
    <div class="mb-6">
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">NIN Verification</h1>
      <p class="text-gray-500 text-sm">Identity verification status</p>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <OnboardingLawyerProgressBar :current-state="currentState" :completed-steps="completedSteps" />
    </div>

    <div class="bg-white shadow-sm px-8 py-12 border border-gray-100 rounded-2xl text-center">
      <div class="flex justify-center items-center bg-green-50 mx-auto mb-4 rounded-full w-16 h-16">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="#16a34a" stroke-width="1.5"/>
          <path d="M8.5 14l4 4 7-8" stroke="#16a34a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="mb-2 font-bold text-gray-900 text-lg">Verification Complete</h2>
      <p class="text-gray-500 text-sm">Your National Identification Number has been successfully verified.</p>
    </div>
  </div>

  <!-- Confirmation phase -->
  <div v-else-if="showConfirmationPhase" class="w-full max-w-2xl">
    <div class="mb-6">
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">Confirm Your Identity</h1>
      <p class="text-gray-500 text-sm">Verify that the information below matches your identity</p>
    </div>
    <div class="mb-6">
      <OnboardingLawyerProgressBar :current-state="currentState" :completed-steps="completedSteps" />
    </div>

    <!-- Error -->
    <div v-if="confirmError" class="flex gap-3 bg-red-50 mb-4 p-4 border border-red-100 rounded-xl text-red-700">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="mt-0.5 shrink-0">
        <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.4"/>
        <path d="M9 5.5v4M9 11.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <p class="font-medium text-sm">{{ confirmError.message || 'Failed to confirm verification. Please try again.' }}</p>
    </div>

    <div class="space-y-6 bg-white shadow-sm px-8 py-8 border border-gray-100 rounded-2xl">
      <!-- Photo + details -->
      <div class="flex sm:flex-row flex-col gap-6">
        <!-- Photo -->
        <div class="flex flex-col items-center gap-3 shrink-0">
          <div class="bg-gray-100 border border-gray-200 rounded-xl w-32 h-32 overflow-hidden">
            <img v-if="initResult?.photo" :src="initResult.photo" alt="Identity Photo" class="w-full h-full object-cover" />
            <div v-else class="flex justify-center items-center w-full h-full">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="14" r="7" stroke="#9ca3af" stroke-width="1.5"/>
                <path d="M4 32c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          <div v-if="initResult?.signature" class="bg-gray-50 p-2 border border-gray-200 rounded-lg w-32">
            <p class="mb-1 font-medium text-[10px] text-gray-400 text-center">Signature</p>
            <img :src="initResult.signature" alt="Signature" class="w-full h-10 object-contain mix-blend-multiply" />
          </div>
        </div>

        <!-- Details -->
        <div class="flex-1 space-y-4">
          <div>
            <p class="mb-0.5 text-gray-400 text-xs">Full Name</p>
            <p class="font-bold text-gray-900 text-base">
              {{ initResult?.firstName }} {{ initResult?.middleName }} {{ initResult?.lastName }}
            </p>
          </div>
          <div class="gap-4 grid grid-cols-2">
            <div>
              <p class="mb-0.5 text-gray-400 text-xs">Date of Birth</p>
              <p class="font-semibold text-gray-900 text-sm">{{ initResult?.dateOfBirth }}</p>
            </div>
            <div>
              <p class="mb-0.5 text-gray-400 text-xs">Gender</p>
              <p class="font-semibold text-gray-900 text-sm">
                {{ initResult?.gender === 'f' ? 'Female' : initResult?.gender === 'm' ? 'Male' : initResult?.gender }}
              </p>
            </div>
            <div>
              <p class="mb-0.5 text-gray-400 text-xs">Phone Number</p>
              <p class="font-semibold text-gray-900 text-sm">{{ initResult?.mobile || 'N/A' }}</p>
            </div>
            <div>
              <p class="mb-0.5 text-gray-400 text-xs">Birth Location</p>
              <p class="font-semibold text-gray-900 text-sm">{{ initResult?.birthLGA }}, {{ initResult?.birthState }}</p>
            </div>
          </div>
          <div v-if="initResult?.address">
            <p class="mb-0.5 text-gray-400 text-xs">Registered Address</p>
            <p class="font-semibold text-gray-900 text-sm">{{ initResult.address.addressLine }}, {{ initResult.address.lga }}</p>
          </div>
        </div>
      </div>

      <!-- Confirm checkbox -->
      <label class="flex items-start gap-3 bg-blue-50 p-4 border border-blue-100 rounded-xl cursor-pointer">
        <input type="checkbox" v-model="confirmState.confirmed" class="mt-0.5 rounded w-4 h-4 accent-gray-900 cursor-pointer shrink-0" />
        <span class="font-medium text-gray-800 text-sm">
          I confirm that this photo and information match my identity
        </span>
      </label>

      <div class="flex gap-3 pt-2 border-gray-100 border-t">
        <!-- Back -->
        <button
          type="button"
          :disabled="isConfirming"
          @click="resetInit()"
          class="flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 px-5 border border-gray-200 rounded-xl h-[50px] font-semibold text-[14px] text-gray-700 transition-colors disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back
        </button>
        <!-- Confirm -->
        <button
          type="button"
          :disabled="!confirmState.confirmed || isConfirming"
          @click="handleConfirm"
          class="flex flex-1 justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-xl h-[50px] font-semibold text-[15px] text-white tracking-tight transition-colors disabled:cursor-not-allowed"
        >
          <span v-if="isConfirming" class="border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin" />
          <template v-else>
            Confirm & Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </template>
        </button>
      </div>
    </div>
  </div>

  <!-- NIN entry phase -->
  <div v-else class="w-full max-w-xl">
    <div class="mb-6">
      <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">NIN Verification</h1>
      <p class="text-gray-500 text-sm">We need your National Identification Number to verify your identity</p>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <OnboardingLawyerProgressBar :current-state="currentState" :completed-steps="completedSteps" />
    </div>

    <!-- Error -->
    <div v-if="initError" class="flex gap-3 bg-red-50 mb-4 p-4 border border-red-100 rounded-xl text-red-700">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="mt-0.5 shrink-0">
        <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.4"/>
        <path d="M9 5.5v4M9 11.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <p class="font-medium text-sm">{{ initError.message || 'We could not verify your NIN. Please check the number and try again.' }}</p>
    </div>

    <UForm :schema="ninFormSchema" :state="ninState" @submit="handleInitiate">
      <div class="space-y-5 bg-white shadow-sm px-8 py-8 border border-gray-100 rounded-2xl">

        <UFormField label="National Identification Number (NIN)" name="nin" required>
          <UInput
            v-model="ninState.nin"
            size="md"
            placeholder="Enter your 11-digit NIN"
            autocomplete="off"
            icon="heroicons:identification"
            class="w-full"
          />
          <template #hint>
            <span class="text-gray-400 text-xs">Your 11-digit National Identification Number</span>
          </template>
        </UFormField>

        <UFormField name="consent">
          <label class="flex items-start gap-3 bg-blue-50 p-4 border border-blue-100 rounded-xl cursor-pointer">
            <input type="checkbox" v-model="ninState.consent" class="mt-0.5 rounded w-4 h-4 accent-gray-900 cursor-pointer shrink-0" />
            <span class="font-medium text-gray-800 text-sm">
              I consent to GetALawyer verifying my National Identification Number (NIN) with the National Identity Management Commission (NIMC)
            </span>
          </label>
        </UFormField>

        <div class="pt-2 border-gray-100 border-t">
          <button
            type="submit"
            :disabled="isInitiating"
            class="flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-xl w-full h-[50px] font-semibold text-[15px] text-white tracking-tight transition-colors disabled:cursor-not-allowed"
          >
            <span v-if="isInitiating" class="border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin" />
            <template v-else>
              Verify NIN
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