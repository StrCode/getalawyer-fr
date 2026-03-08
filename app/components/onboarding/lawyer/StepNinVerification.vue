<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

const { 
  useInitiateNinVerification, 
  useConfirmNinVerification, 
  useSummary 
} = useLawyerOnboarding()

const { data: summary, isPending: isLoadingSummary } = useSummary()
const { mutate: initiateNin, isPending: isInitiating, error: initError, data: initResult } = useInitiateNinVerification()
const { mutate: confirmNin, isPending: isConfirming, error: confirmError } = useConfirmNinVerification()

const isVerified = computed(() => summary.value?.ninVerification?.verified || false)
const showConfirmationPhase = ref(false)

const ninFormSchema = z.object({
  nin: z.string().min(11, 'NIN must be 11 digits').max(11, 'NIN must be 11 digits'),
  consent: z.boolean().refine(val => val === true, 'You must provide consent to verify your identity')
})
const ninState = reactive({ nin: '', consent: false })

const confirmState = reactive({
  confirmed: false
})

const handleInitiate = async () => {
  initiateNin(ninState, {
    onSuccess: (res) => {
      // res is already unwrapped from the axios/fetch layer via useLawyerOnboarding
      // When success is true and data exists, we transition to the confirmation phase
      if (res.success && res.data) {
        showConfirmationPhase.value = true
      }
    }
  })
}

const handleConfirm = async () => {
  if (!ninState.nin) return
  
  if (confirmState.confirmed) {
     confirmNin({ 
      nin: ninState.nin,
      confirmed: true 
    })
  } else {
    // If not confirmed, reset to initiation phase
    showConfirmationPhase.value = false
  }
}

// Check if they are already verified based on summary
watchEffect(() => {
   if (isVerified.value) {
      showConfirmationPhase.value = false
   }
})
</script>

<template>
  <div v-if="isLoadingSummary" class="flex justify-center py-8">
    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-primary animate-spin" />
  </div>

  <div v-else-if="isVerified" class="text-center py-8">
    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
      <UIcon name="i-heroicons-check" class="h-8 w-8 text-green-600" />
    </div>
    <h2 class="text-2xl font-semibold text-gray-900 mb-2">Verification Complete</h2>
    <p class="text-gray-500 mb-6">Your National Identification Number has been successfully verified.</p>
    <!-- We don't have a NEXT button here because the backend state should auto-transition, 
         or we can trigger a NEXT call by saving some dummy data or checking status again. 
         For now, since NIN confirmation updates state and invalidates status, the parent 
         component will automatically switch to the next step when the status query invalidates. -->
  </div>

  <div v-else-if="showConfirmationPhase" class="space-y-6">
    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Confirm Your Identity</h2>
      <p class="text-sm text-gray-500">Please confirm that the photo below matches the person registering.</p>
    </div>

    <!-- Error Banner -->
    <UAlert v-if="confirmError" color="error" variant="soft" title="Error" :description="confirmError.message || 'Failed to confirm verification. Please try again.'" />

    <div class="flex flex-col sm:flex-row gap-6 bg-gray-50 rounded border p-4">
       <!-- Photo Column -->
       <div class="flex-shrink-0 flex justify-center">
         <img v-if="initResult?.data?.photo" :src="initResult.data.photo" alt="Identity Photo" class="w-48 h-48 object-cover rounded shadow-md" />
         <div v-else class="w-48 h-48 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
           <UIcon name="i-heroicons-user" class="w-16 h-16 text-gray-400" />
         </div>
       </div>
       
       <!-- Data Details Column -->
       <div class="flex-grow space-y-4">
         <div>
           <h3 class="text-sm font-medium text-gray-500">Full Name</h3>
           <p class="text-base font-semibold text-gray-900 mt-1">
             {{ initResult?.data?.firstName }} {{ initResult?.data?.middleName }} {{ initResult?.data?.lastName }}
           </p>
         </div>
         <div class="grid grid-cols-2 gap-4">
           <div>
             <h3 class="text-sm font-medium text-gray-500">Date of Birth</h3>
             <p class="text-base font-medium text-gray-900 mt-1">{{ initResult?.data?.dateOfBirth }}</p>
           </div>
           <div>
             <h3 class="text-sm font-medium text-gray-500">Gender</h3>
             <p class="text-base font-medium text-gray-900 mt-1">{{ initResult?.data?.gender }}</p>
           </div>
         </div>
       </div>
    </div>
    
    <div class="flex items-center space-x-3 bg-blue-50 p-4 rounded-md">
       <UCheckbox v-model="confirmState.confirmed" name="confirm" label="I confirm that this photo matches my identity." />
    </div>

    <div class="flex justify-end gap-3 pt-4 border-t">
      <UButton type="button" color="neutral" variant="soft" @click="showConfirmationPhase = false" :disabled="isConfirming">
        Back
      </UButton>
      <UButton type="button" color="primary" @click="handleConfirm" :loading="isConfirming" :disabled="!confirmState.confirmed" trailing-icon="i-heroicons-arrow-right">
        Confirm & Continue
      </UButton>
    </div>
  </div>

  <UForm v-else :schema="ninFormSchema" :state="ninState" class="space-y-6" @submit="handleInitiate">
    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Identity Verification</h2>
      <p class="text-sm text-gray-500">We need your National Identification Number (NIN) to verify your identity.</p>
    </div>

    <!-- Error Banner -->
    <UAlert v-if="initError" color="error" variant="soft" title="Verification Failed" :description="initError.message || 'We could not verify your NIN. Please check the number and try again.'" />

    <UFormField label="National Identification Number (NIN)" name="nin">
      <UInput v-model="ninState.nin" placeholder="Enter your 11-digit NIN" autocomplete="off" />
    </UFormField>

    <UFormField name="consent">
      <UCheckbox 
        v-model="ninState.consent" 
        label="I consent to GetALawyer verifying my National Identification Number (NIN) with the National Identity Management Commission (NIMC)." 
      />
    </UFormField>

    <div class="flex justify-end pt-4 border-t">
      <UButton type="submit" color="primary" :loading="isInitiating" trailing-icon="i-heroicons-shield-check">
        Verify NIN
      </UButton>
    </div>
  </UForm>
</template>
