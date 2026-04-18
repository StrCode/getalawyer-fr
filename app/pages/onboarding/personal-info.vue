<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()

// We don't actually need to re-declare reactive state; we just bind to store.personalInfo.
// However, the schema validation for this step can live here if we want to block "Next" visually,
// or we can rely on the store API response. 
// For now, we bind directly to store.personalInfo.
const state = store.personalInfo

// Options for dropdowns
const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - 18 - i))

const countries = ['Nigeria', 'United Kingdom', 'United States', 'Singapore']

// We reconstruct the ISO date string locally with a watcher, because the store
// needs the exact `dateOfBirth` ISO string for the backend API,
// but the UI uses 3 separate dropdowns. 
// To make this reactive without duplicating state:
const dobDay = ref('')
const dobMonth = ref('')
const dobYear = ref('')

watch(() => state.dateOfBirth, (newDob) => {
  if (newDob) {
    const dob = new Date(newDob)
    dobDay.value = String(dob.getDate())
    dobMonth.value = dob.toLocaleString('default', { month: 'long' })
    dobYear.value = String(dob.getFullYear())
  }
}, { immediate: true })

watch([dobDay, dobMonth, dobYear], () => {
  if (dobDay.value && dobMonth.value && dobYear.value) {
    const monthIdx = months.indexOf(dobMonth.value)
    const dateObj = new Date(Number(dobYear.value), monthIdx, Number(dobDay.value))
    state.dateOfBirth = dateObj.toISOString()
  }
})

</script>

<template>
  <div class="space-y-12 pb-20">
    <!-- Header Section (Etsy Style) -->
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Tell us a little bit about yourself</h1>
      <p class="text-sm text-gray-600">
        For compliance purposes, we may verify your identity with a secure third-party service. 
        This information will never be displayed publicly. <a href="#" class="text-primary-600 hover:underline">Learn more</a>
      </p>
    </div>

    <div class="space-y-8">
      <!-- Country of Residence -->
      <div class="form-row">
        <label class="etsy-label">Country of residence <span class="text-primary-600">*</span></label>
        <USelect v-model="state.country" :items="countries" size="xl" class="etsy-input-base w-full max-w-md" />
      </div>

      <!-- First Name -->
      <div class="form-row">
        <label class="etsy-label">First name <span class="text-primary-600">*</span></label>
        <UInput v-model="state.firstName" placeholder="Jane" size="xl" class="etsy-input-base w-full max-w-md" />
      </div>

      <!-- Middle Name -->
      <div class="form-row">
        <label class="etsy-label">Middle name <span class="text-gray-400 font-normal">(Optional)</span></label>
        <UInput v-model="state.middleName" placeholder="Olu" size="xl" class="etsy-input-base w-full max-w-md" />
      </div>

      <!-- Last Name -->
      <div class="form-row">
        <label class="etsy-label">Last name <span class="text-primary-600">*</span></label>
        <UInput v-model="state.lastName" placeholder="Smith" size="xl" class="etsy-input-base w-full max-w-md" />
      </div>

      <!-- Date of Birth -->
      <div class="form-row">
        <label class="etsy-label">Your date of birth <span class="text-primary-600">*</span></label>
        <div class="flex gap-4">
          <USelect v-model="dobDay" :items="days" placeholder="Day" size="xl" class="etsy-input-base w-24" />
          <USelect v-model="dobMonth" :items="months" placeholder="Month" size="xl" class="etsy-input-base w-40" />
          <USelect v-model="dobYear" :items="years" placeholder="Year" size="xl" class="etsy-input-base w-32" />
        </div>
      </div>

      <div class="pt-8 border-t border-gray-100 italic text-[10px] text-gray-400">
         * Required fields for verification
      </div>

      <!-- Taxpayer Address Section -->
      <div class="form-row pt-4">
        <div>
          <label class="etsy-label block">Professional address <span class="text-primary-600">*</span></label>
          <p class="etsy-description max-w-[180px]">This should be the same address used for professional records or bar registration.</p>
        </div>
        
        <div class="space-y-6 max-w-xl">
          <div class="grid grid-cols-[120px_1fr] gap-4">
            <div>
              <label class="text-[11px] font-bold mb-1 block">Number</label>
              <UInput v-model="state.city" placeholder="75" size="xl" class="etsy-input-base" />
            </div>
            <div>
              <label class="text-[11px] font-bold mb-1 block">Street Name</label>
              <UInput v-model="state.address" placeholder="Ayer Rajah Crescent" size="xl" class="etsy-input-base" />
            </div>
          </div>
          
          <div>
            <label class="text-[11px] font-bold mb-1 block">Flat/Other <span class="text-gray-400 font-normal">(optional)</span></label>
            <UInput placeholder="#02-02" size="xl" class="etsy-input-base" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-bold mb-1 block">State</label>
              <UInput v-model="state.state" placeholder="Lagos" size="xl" class="etsy-input-base" />
            </div>
            <div>
              <label class="text-[11px] font-bold mb-1 block">Phone number</label>
              <UInput v-model="state.phoneNumber" placeholder="100001" size="xl" class="etsy-input-base" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
