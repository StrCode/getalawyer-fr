<script setup lang="ts">
import { z } from 'zod'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()
const state = store.professionalInfo

const currentYear = new Date().getFullYear()

// We rely on the layout's "Next" button to trigger the store's saveStep('professional-information')
</script>

<template>
  <div class="space-y-12 pb-20">
    <!-- Header Section -->
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Professional Background</h1>
      <p class="text-sm text-gray-600">Provide your legal credentials and education details for professional verification.</p>
    </div>

    <div class="space-y-12">
      <!-- Bar Admission Group -->
      <div class="space-y-8">
        <div class="form-row border-b border-gray-100 pb-2">
           <label class="etsy-label border-b-2 border-primary-600 pb-2 inline-block">Bar Admission</label>
           <div class="hidden md:block"></div>
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">NBA Supreme Court Number <span class="text-primary-600">*</span></label>
          <div class="w-full max-w-md">
             <UInput v-model="state.barNumber" placeholder="SCN000000" size="xl" class="etsy-input-base w-full" />
             <p class="etsy-description">Your Supreme Court enrollment number used for official identification.</p>
          </div>
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">Year of Call to Bar <span class="text-primary-600">*</span></label>
          <UInput v-model.number="state.yearOfCall" type="number" size="xl" class="etsy-input-base w-32" />
        </div>
      </div>

      <!-- University Education Group -->
      <div class="space-y-8">
        <div class="form-row border-b border-gray-100 pb-2">
           <label class="etsy-label border-b-2 border-primary-600 pb-2 inline-block font-bold">University Education</label>
           <div class="hidden md:block"></div>
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">University Attended <span class="text-primary-600">*</span></label>
          <UInput v-model="state.university" placeholder="e.g. University of Lagos" size="xl" class="etsy-input-base w-full max-w-md" />
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">Year of LLB Graduation <span class="text-primary-600">*</span></label>
          <UInput v-model.number="state.llbYear" type="number" size="xl" class="etsy-input-base w-32" />
        </div>
      </div>

      <!-- Law School Group -->
      <div class="space-y-8">
        <div class="form-row border-b border-gray-100 pb-2">
           <label class="etsy-label border-b-2 border-primary-600 pb-2 inline-block">Law School</label>
           <div class="hidden md:block"></div>
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">Law School Campus <span class="text-primary-600">*</span></label>
          <UInput v-model="state.lawSchool" placeholder="e.g. Lagos Campus" size="xl" class="etsy-input-base w-full max-w-md" />
        </div>

        <div class="form-row">
          <label class="etsy-label text-gray-500 font-medium">Year of Graduation <span class="text-primary-600">*</span></label>
          <UInput v-model.number="state.graduationYear" type="number" size="xl" class="etsy-input-base w-32" />
        </div>
      </div>
    </div>
  </div>
</template>
