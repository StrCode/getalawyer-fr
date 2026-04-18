<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import type { OnboardingState } from '~/composables/useLawyerOnboarding'

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

const handleInitiate = async (): Promise<boolean> => {
   return new Promise((resolve) => {
     initiateNin(ninState, {
       onSuccess: () => resolve(true),
       onError: () => resolve(false)
     })
   })
}

const handleConfirm = async (): Promise<boolean> => {
  if (!ninState.nin) return false
  return new Promise((resolve) => {
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
    }, {
      onSuccess: () => resolve(true),
      onError: () => resolve(false)
    })
  })
}

const handleGeneralNext = async (): Promise<boolean> => {
  if (showConfirmationPhase.value) {
    if (!confirmState.confirmed) return false
    return await handleConfirm()
  } else {
    return await handleInitiate()
  }
}

// Register save handler for the wizard layout
const registerSaveHandler = inject<(handler: () => Promise<boolean>) => void>('wizard-save-handler')
if (registerSaveHandler) {
  registerSaveHandler(handleGeneralNext)
}

watchEffect(() => {
  if (isVerified.value) resetInit()
})
</script>

<template>
  <div v-if="isLoadingSummary" class="flex justify-center py-20">
    <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-primary-200 animate-spin" />
  </div>

  <!-- Already verified Success State -->
  <div v-else-if="isVerified" class="text-center py-12">
    <div class="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-[0_0_15px_-3px_rgba(37,99,235,0.2)]">
       <UIcon name="i-heroicons-shield-check" class="w-10 h-10" />
    </div>
    <h2 class="text-2xl font-bold text-gray-900 mb-3">Identity Verified</h2>
    <p class="text-base text-gray-600 max-w-md mx-auto">Your National Identification Number has been successfully verified against official records.</p>
  </div>

  <!-- Processing State -->
  <div v-else-if="isInitiating || isConfirming" class="flex flex-col items-center justify-center py-20">
    <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-primary-blue animate-spin mb-4" />
    <p class="text-gray-500 font-medium tracking-tight">Verifying your identity with NIMC...</p>
  </div>

  <!-- Confirmation phase -->
  <div v-else-if="showConfirmationPhase" class="space-y-10">
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Confirm Your Identity</h1>
      <p class="text-sm text-gray-600">Please verify that the information below matches your official identity records.</p>
    </div>

    <!-- Error Banner -->
    <UAlert 
      v-if="confirmError" 
      color="error" 
      variant="soft" 
      title="Confirmation Failed" 
      :description="confirmError.message || 'We could not confirm your details. Please try again.'"
      icon="i-heroicons-exclamation-circle"
      class="mb-6"
    />

    <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100 flex flex-col md:flex-row gap-8">
      <!-- Photo Section -->
      <div class="shrink-0 flex flex-col items-center gap-4">
        <div class="w-32 h-32 bg-gray-200 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
           <img v-if="initResult?.photo" :src="initResult.photo" alt="Identity Photo" class="w-full h-full object-cover" />
           <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
              <UIcon name="i-heroicons-user" class="w-12 h-12 text-gray-400" />
           </div>
        </div>
        <div v-if="initResult?.signature" class="w-32 bg-white px-2 py-1 border border-gray-100 rounded shadow-sm text-center">
           <p class="text-[9px] font-bold text-gray-300 uppercase tracking-tighter mb-1">Signature</p>
           <img :src="initResult.signature" alt="Signature" class="h-8 mx-auto mix-blend-multiply grayscale" />
        </div>
      </div>

      <!-- Details List -->
      <div class="flex-1 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white p-3 rounded-lg border border-gray-100">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
            <p class="text-sm font-bold text-gray-900">{{ initResult?.firstName }} {{ initResult?.middleName }} {{ initResult?.lastName }}</p>
          </div>
          <div class="bg-white p-3 rounded-lg border border-gray-100">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Birth</p>
            <p class="text-sm font-bold text-gray-900">{{ initResult?.dateOfBirth }}</p>
          </div>
          <div class="bg-white p-3 rounded-lg border border-gray-100">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</p>
            <p class="text-sm font-bold text-gray-900 uppercase">{{ initResult?.gender }}</p>
          </div>
          <div class="bg-white p-3 rounded-lg border border-gray-100">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID Number</p>
            <p class="text-sm font-bold text-gray-900">{{ initResult?.idNumber || ninState.nin }}</p>
          </div>
        </div>

        <div v-if="initResult?.address" class="bg-white p-3 rounded-lg border border-gray-100">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registered Address</p>
            <p class="text-sm font-bold text-gray-900 leading-tight">{{ initResult.address.addressLine }}, {{ initResult.address.lga }}</p>
        </div>

        <div class="pt-2 flex items-start gap-3">
          <UCheckbox 
             v-model="confirmState.confirmed" 
             name="confirm"
             class="mt-1"
          />
          <label for="confirm" class="text-sm font-medium text-gray-700 cursor-pointer select-none">
            I confirm that these details match my legal identity as registered with NIMC.
          </label>
        </div>
        
        <div class="pt-4">
           <UButton 
              variant="link" 
              color="neutral" 
              class="text-xs p-0 text-gray-400 hover:text-red-500 transition-colors"
              @click="resetInit()"
           >
              Incorrect info? Try another NIN
           </UButton>
        </div>
      </div>
    </div>
  </div>

  <!-- NIN entry phase -->
  <div v-else class="space-y-12">
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h1>
      <p class="text-sm text-gray-600">We verify your identity using the National Identification Number (NIN) to ensure the security and integrity of our network.</p>
    </div>

    <!-- Error Banner -->
    <UAlert 
      v-if="initError" 
      color="error" 
      variant="soft" 
      title="Verification Error" 
      :description="initError.message || 'We could not verify your NIN. Please check the number and try again.'"
      icon="i-heroicons-exclamation-triangle"
      class="mb-6"
    />

    <UForm :schema="ninFormSchema" :state="ninState" @submit="handleInitiate" class="space-y-10">
      <div class="form-row">
        <label class="etsy-label">National Identity Number <span class="text-primary-blue">*</span></label>
        <div class="w-full max-w-md">
           <UInput
              v-model="ninState.nin"
              size="xl"
              placeholder="11-digit NIN"
              autocomplete="off"
              icon="i-heroicons-identification"
              class="etsy-input-base w-full"
           />
           <p class="etsy-description">Enter your 11-digit National Identity Number as found on your NIN slip or ID card.</p>
        </div>
      </div>

      <div class="form-row">
        <label class="etsy-label">Verification Consent <span class="text-primary-blue">*</span></label>
        <div class="w-full max-w-md">
           <div class="flex items-start gap-3 bg-blue-50/50 p-4 border border-blue-100 rounded-xl">
             <UCheckbox 
                v-model="ninState.consent" 
                class="mt-1"
             />
             <div class="text-[13px] font-medium text-gray-700 leading-snug">
               I consent to Getalawyer verifying my identity details with the National Identity Management Commission (NIMC) for professional background checks.
             </div>
           </div>
        </div>
      </div>
    </UForm>
  </div>
</template>
