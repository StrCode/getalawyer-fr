<script setup lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()

// We don't actually need to re-declare reactive state; we just bind to store.personalInfo.
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
const dobDay = ref<string | undefined>(undefined)
const dobMonth = ref<string | undefined>(undefined)
const dobYear = ref<string | undefined>(undefined)

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
        This information will never be displayed publicly. <a href="#" class="text-primary hover:underline font-medium">Learn more</a>
      </p>
    </div>

    <div class="space-y-8">
      <!-- Country of Residence -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">Country of residence <span class="text-primary">*</span></label>
        <div class="w-full max-w-md">
          <Select v-model="state.country">
            <SelectTrigger class="h-12 rounded-lg border-gray-200 focus:ring-primary/20">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in countries" :key="c" :value="c">
                {{ c }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- First Name -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">First name <span class="text-primary">*</span></label>
        <Input v-model="state.firstName" placeholder="Jane" class="h-12 rounded-lg border-gray-200 w-full max-w-md focus-visible:ring-primary/20" />
      </div>

      <!-- Middle Name -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">Middle name <span class="text-gray-400 font-normal">(Optional)</span></label>
        <Input v-model="state.middleName" placeholder="Olu" class="h-12 rounded-lg border-gray-200 w-full max-w-md focus-visible:ring-primary/20" />
      </div>

      <!-- Last Name -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">Last name <span class="text-primary">*</span></label>
        <Input v-model="state.lastName" placeholder="Smith" class="h-12 rounded-lg border-gray-200 w-full max-w-md focus-visible:ring-primary/20" />
      </div>

      <!-- Date of Birth -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">Your date of birth <span class="text-primary">*</span></label>
        <div class="flex gap-4">
          <div class="w-24">
            <Select v-model="dobDay">
              <SelectTrigger class="h-12 rounded-lg border-gray-200">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="d in days" :key="d" :value="d">{{ d }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="w-40">
            <Select v-model="dobMonth">
              <SelectTrigger class="h-12 rounded-lg border-gray-200">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="m in months" :key="m" :value="m">{{ m }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="w-32">
            <Select v-model="dobYear">
              <SelectTrigger class="h-12 rounded-lg border-gray-200">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="y in years" :key="y" :value="y">{{ y }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-gray-100 italic text-[10px] text-gray-400 font-medium">
         * Required fields for verification
      </div>

      <!-- Taxpayer Address Section -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <div>
          <label class="text-[14px] font-bold text-gray-900 block tracking-tight">Professional address <span class="text-primary">*</span></label>
          <p class="mt-2 text-[12px] text-gray-400 font-medium leading-relaxed max-w-[180px]">This should be the same address used for professional records or bar registration.</p>
        </div>
        
        <div class="space-y-6 max-w-xl">
          <div class="grid grid-cols-[120px_1fr] gap-4">
            <div>
              <label class="text-[11px] font-bold mb-1.5 block text-gray-500 uppercase tracking-wider">Number</label>
              <Input v-model="state.city" placeholder="75" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
            </div>
            <div>
              <label class="text-[11px] font-bold mb-1.5 block text-gray-500 uppercase tracking-wider">Street Name</label>
              <Input v-model="state.address" placeholder="Ayer Rajah Crescent" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
            </div>
          </div>
          
          <div>
            <label class="text-[11px] font-bold mb-1.5 block text-gray-500 uppercase tracking-wider">Flat/Other <span class="text-gray-400 font-normal">(optional)</span></label>
            <Input placeholder="#02-02" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-bold mb-1.5 block text-gray-500 uppercase tracking-wider">State</label>
              <Input v-model="state.state" placeholder="Lagos" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
            </div>
            <div>
              <label class="text-[11px] font-bold mb-1.5 block text-gray-500 uppercase tracking-wider">Phone number</label>
              <Input v-model="state.phoneNumber" placeholder="+234..." class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
