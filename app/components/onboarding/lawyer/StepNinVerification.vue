<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

const { 
  useInitiateNinVerification, 
  useConfirmNinVerification, 
  useSummary 
} = useLawyerOnboarding()

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

const confirmState = reactive({
  confirmed: false
})

const handleInitiate = async () => {
  initiateNin(ninState)
}

watchEffect(() => {
  console.log('[NIN Initiate] initResult reactive variable changed:', initResult.value)
})

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
    // If not confirmed, reset to initiation phase
    resetInit()
  }
}

// Check if they are already verified based on summary
watchEffect(() => {
   if (isVerified.value) {
      resetInit()
   }
})
</script>

<template>
  <div v-if="isLoadingSummary" class="flex justify-center py-20">
    <Icon name="lucide:loader-circle" class="w-12 h-12 text-primary animate-spin" />
  </div>

  <div v-else-if="isVerified" class="text-center py-12">
    <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
      <Icon name="heroicons:check-circle" class="h-12 w-12 text-green-600" />
    </div>
    <h2 class="text-3xl font-bold text-gray-900 mb-3">Verification Complete</h2>
    <p class="text-base text-gray-600 mb-6">Your National Identification Number has been successfully verified.</p>
  </div>

  <div v-else-if="showConfirmationPhase" class="space-y-8">
    <div class="border-b border-gray-200 pb-3">
      <h3 class="text-xl font-semibold text-gray-900">Confirm Your Identity</h3>
      <p class="text-sm text-gray-500 mt-1">Please verify that the information below matches your identity</p>
    </div>

    <!-- Error Banner -->
    <UAlert 
      v-if="confirmError" 
      color="error" 
      variant="soft" 
      title="Error" 
      :description="confirmError.message || 'Failed to confirm verification. Please try again.'"
      icon="heroicons:exclamation-triangle"
    />

    <div class="flex flex-col lg:flex-row gap-8 bg-gray-50 rounded-xl border border-gray-200 p-6">
       <!-- Photo Column -->
       <div class="shrink-0 flex flex-col items-center gap-4">
         <div class="bg-white rounded-lg p-2 shadow-sm">
           <img v-if="initResult?.photo" :src="initResult.photo" alt="Identity Photo" class="w-56 h-56 object-cover rounded-lg" />
           <div v-else class="w-56 h-56 bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
             <Icon name="heroicons:user" class="w-20 h-20 text-gray-400" />
           </div>
         </div>
         <div v-if="initResult?.signature" class="bg-white rounded-lg p-3 shadow-sm w-full">
           <p class="text-xs font-medium text-gray-500 mb-2">Digital Signature</p>
           <img :src="initResult.signature" alt="Digital Signature" class="w-full h-16 object-contain mix-blend-multiply" />
         </div>
       </div>
       
       <!-- Data Details Column -->
       <div class="grow space-y-6">
         <div>
           <h3 class="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
           <p class="text-xl font-bold text-gray-900">
             {{ initResult?.firstName }} {{ initResult?.middleName }} {{ initResult?.lastName }}
           </p>
         </div>
         <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div>
             <h3 class="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
             <p class="text-base font-semibold text-gray-900">{{ initResult?.dateOfBirth }}</p>
           </div>
           <div>
             <h3 class="text-sm font-medium text-gray-500 mb-1">Gender</h3>
             <p class="text-base font-semibold text-gray-900 uppercase">{{ initResult?.gender === 'f' ? 'Female' : initResult?.gender === 'm' ? 'Male' : initResult?.gender }}</p>
           </div>
           <div>
             <h3 class="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
             <p class="text-base font-semibold text-gray-900">{{ initResult?.mobile || 'N/A' }}</p>
           </div>
           <div>
             <h3 class="text-sm font-medium text-gray-500 mb-1">Birth Location</h3>
             <p class="text-base font-semibold text-gray-900">{{ initResult?.birthLGA }}, {{ initResult?.birthState }}</p>
           </div>
         </div>
         <div v-if="initResult?.address">
           <h3 class="text-sm font-medium text-gray-500 mb-1">Registered Address</h3>
           <p class="text-base font-semibold text-gray-900">{{ initResult.address.addressLine }}, {{ initResult.address.lga }}</p>
         </div>
       </div>
    </div>
    
    <div class="flex items-start space-x-3 bg-blue-50 border border-blue-200 p-5 rounded-xl">
       <UCheckbox v-model="confirmState.confirmed" name="confirm" size="lg" />
       <label for="confirm" class="text-sm font-medium text-gray-900 cursor-pointer">
         I confirm that this photo and information match my identity
       </label>
    </div>

    <div class="flex justify-between gap-4 pt-6 border-t border-gray-200">
      <UButton 
        type="button" 
        color="neutral" 
        variant="outline" 
        size="xl"
        @click="resetInit()" 
        :disabled="isConfirming"
        icon="heroicons:arrow-left"
      >
        Back
      </UButton>
      <UButton 
        type="button" 
        color="primary" 
        size="xl"
        @click="handleConfirm" 
        :loading="isConfirming" 
        :disabled="!confirmState.confirmed" 
        icon="heroicons:arrow-right"
        trailing
      >
        Confirm & Continue
      </UButton>
    </div>
  </div>

  <UForm v-else :schema="ninFormSchema" :state="ninState" class="space-y-8" @submit="handleInitiate">
    <div class="border-b border-gray-200 pb-3">
      <h3 class="text-xl font-semibold text-gray-900">Identity Verification</h3>
      <p class="text-sm text-gray-500 mt-1">We need your National Identification Number (NIN) to verify your identity</p>
    </div>

    <!-- Error Banner -->
    <UAlert 
      v-if="initError" 
      color="error" 
      variant="soft" 
      title="Verification Failed" 
      :description="initError.message || 'We could not verify your NIN. Please check the number and try again.'"
      icon="heroicons:exclamation-triangle"
    />

    <UFormField label="National Identification Number (NIN)" name="nin" required size="xl">
      <UInput 
        v-model="ninState.nin" 
        size="xl"
        placeholder="Enter your 11-digit NIN" 
        autocomplete="off" 
        icon="heroicons:identification"
        class="w-full"
      />
      <template #hint>
        <span class="text-xs text-gray-500">Your 11-digit National Identification Number</span>
      </template>
    </UFormField>

    <UFormField name="consent" size="xl">
      <div class="flex items-start space-x-3 bg-blue-50 border border-blue-200 p-5 rounded-xl">
        <UCheckbox 
          v-model="ninState.consent" 
          name="consent"
          size="lg"
        />
        <label for="consent" class="text-sm font-medium text-gray-900 cursor-pointer">
          I consent to GetALawyer verifying my National Identification Number (NIN) with the National Identity Management Commission (NIMC)
        </label>
      </div>
    </UFormField>

    <div class="pt-6 border-t border-gray-200">
      <UButton 
        type="submit" 
        color="primary" 
        size="xl"
        block
        :loading="isInitiating" 
        icon="heroicons:shield-check"
        trailing
      >
        Verify NIN
      </UButton>
    </div>
  </UForm>
</template>
