<script setup lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { type DateValue, getLocalTimeZone, today, parseDate } from '@internationalized/date'
import { ChevronDownIcon } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()

// We don't actually need to re-declare reactive state; we just bind to store.personalInfo.
const state = store.personalInfo

const genders = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
]

// Date of Birth handling
const dobDate = ref<DateValue | undefined>()

// Sync from store to local picker
watch(() => state.dateOfBirth, (newDob) => {
  if (newDob && !dobDate.value) {
    try {
      // Extract YYYY-MM-DD from ISO string
      const datePart = newDob.split('T')[0]
      dobDate.value = parseDate(datePart)
    } catch (e) {
      console.warn('[Personal Info] Failed to parse dateOfBirth:', e)
    }
  }
}, { immediate: true })

// Sync from local picker to store
watch(dobDate, (newVal) => {
  if (newVal) {
    state.dateOfBirth = newVal.toDate(getLocalTimeZone()).toISOString()
  }
})

// Max date: Today minus 18 years (standard legal age)
const maxDate = today(getLocalTimeZone()).subtract({ years: 18 })

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
      <!-- Names Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
        <!-- First Name -->
        <div class="flex flex-col gap-3 py-1">
          <label class="text-3.5 font-bold text-gray-900 tracking-tight">First name <span class="text-primary">*</span></label>
          <Input v-model="state.firstName" placeholder="Jane" class="h-12 rounded-lg border-gray-200 w-full focus-visible:ring-primary/20" />
        </div>

        <!-- Middle Name -->
        <div class="flex flex-col gap-3 py-1">
          <label class="text-3.5 font-bold text-gray-900 tracking-tight">Middle name <span class="text-gray-400 font-normal">(Optional)</span></label>
          <Input v-model="state.middleName" placeholder="Olu" class="h-12 rounded-lg border-gray-200 w-full focus-visible:ring-primary/20" />
        </div>

        <!-- Last Name -->
        <div class="flex flex-col gap-3 py-1">
          <label class="text-3.5 font-bold text-gray-900 tracking-tight">Last name <span class="text-primary">*</span></label>
          <Input v-model="state.lastName" placeholder="Smith" class="h-12 rounded-lg border-gray-200 w-full focus-visible:ring-primary/20" />
        </div>
      </div>

      <!-- General Info Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 pt-6 border-t border-gray-50">
        <!-- Date of Birth -->
        <div class="flex flex-col gap-3 py-1">
          <label class="text-3.5 font-bold text-gray-900 tracking-tight">Date of birth <span class="text-primary">*</span></label>
          <div class="w-full">
             <Popover v-slot="{ close }">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  class="w-full h-12 justify-between font-normal rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {{ dobDate ? dobDate.toDate(getLocalTimeZone()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Select your date of birth" }}
                  <ChevronDownIcon class="w-4 h-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  v-model="dobDate"
                  :max-value="maxDate"
                  initial-focus
                  layout="month-and-year"
                  @update:model-value="() => close()"
                />
              </PopoverContent>
            </Popover>
            <p class="mt-2 text-3 text-gray-400 font-medium">You must be at least 18 years old to register as a lawyer.</p>
          </div>
        </div>

        <!-- Gender -->
        <div class="flex flex-col gap-3 py-1">
          <label class="text-3.5 font-bold text-gray-900 tracking-tight">Gender <span class="text-primary">*</span></label>
          <Select v-model="state.gender">
            <SelectTrigger class="h-12 rounded-lg border-gray-200 focus:ring-primary/20 w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="g in genders" :key="g.value" :value="g.value">
                {{ g.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Location Section -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3 border-t border-gray-50 pt-8">
        <div>
          <label class="text-3.5 font-bold text-gray-900 block tracking-tight">Location <span class="text-primary">*</span></label>
          <p class="mt-2 text-3 text-gray-400 font-medium leading-relaxed max-w-[180px]">Provide your current state and local government area of residence.</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
          <div>
            <label class="text-3 font-bold mb-1.5 block text-gray-500 uppercase tracking-wider">State</label>
            <Input v-model="state.state" placeholder="Lagos" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
          </div>
          <div>
            <label class="text-3 font-bold mb-1.5 block text-gray-500 uppercase tracking-wider">LGA</label>
            <Input v-model="state.lga" placeholder="Ikeja" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
          </div>
        </div>
      </div>

      <div class="pt-8 italic text-2.5 text-gray-400 font-medium">
         * Required fields for verification
      </div>
    </div>
  </div>
</template>
