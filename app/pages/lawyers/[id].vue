<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { httpClient } from '~/lib/api/client'
import type { LawyerProfileResponse, ConsultationType, AvailabilitySchedule } from '~/types/lawyer'

const route = useRoute()
const lawyerId = route.params.id as string

// Fetch lawyer profile data
const { data: profileData, pending, error } = await useLazyAsyncData<LawyerProfileResponse>(
  `lawyer-${lawyerId}`,
  () => httpClient.get<LawyerProfileResponse>(`/api/lawyers/${lawyerId}`),
  {
    server: true
  }
)

const lawyer = computed(() => profileData.value?.data)
const isAuthenticated = computed(() => profileData.value?.authenticated || false)

// Computed properties for display
const displayLocation = computed(() => {
  if (!lawyer.value?.practiceInfo) return 'Nigeria'
  const { officeCity, officeState } = lawyer.value.practiceInfo
  return `${officeCity}, ${officeState}`
})

const yearsExperience = computed(() => {
  if (!lawyer.value?.professionalInfo) return 0
  return new Date().getFullYear() - lawyer.value.professionalInfo.yearOfCall
})

const primarySpecialty = computed(() => {
  if (!lawyer.value?.specializations?.length) return 'Legal Services'
  return lawyer.value.specializations[0]?.name || 'Legal Services'
})

const priceRange = computed(() => {
  if (!lawyer.value?.consultationTypes?.length) return { min: 0, max: 0 }
  const prices = lawyer.value.consultationTypes
    .filter((ct: ConsultationType) => ct.isActive && parseFloat(ct.price) > 0)
    .map((ct: ConsultationType) => parseFloat(ct.price))
  
  if (prices.length === 0) return { min: 0, max: 0 }
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }
})

const availableMeetingTypes = computed(() => {
  if (!lawyer.value?.consultationTypes?.length) return []
  const types = new Set<string>()
  lawyer.value.consultationTypes
    .filter((ct: ConsultationType) => ct.isActive)
    .forEach((ct: ConsultationType) => {
      if (ct.meetingType === 'any') {
        types.add('video')
        types.add('phone')
        types.add('in_person')
      } else {
        types.add(ct.meetingType)
      }
    })
  return Array.from(types)
})

const workingDays = computed(() => {
  if (!lawyer.value?.availability?.schedule?.length) return []
  return lawyer.value.availability.schedule
    .filter((s: AvailabilitySchedule) => s.isAvailable)
    .map((s: AvailabilitySchedule) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return {
        day: days[parseInt(s.dayOfWeek)],
        startTime: s.startTime.slice(0, 5), // HH:mm
        endTime: s.endTime.slice(0, 5)
      }
    })
})

useHead({
  title: computed(() => `${lawyer.value?.name || 'Lawyer'} - ${primarySpecialty.value} | Getalawyer`)
})

const isBookingModalOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    
    <!-- Use the app/Header component -->
    <AppHeader />

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
        <p class="text-gray-600">Loading lawyer profile...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !lawyer" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md mx-auto px-4">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Lawyer Not Found</h2>
        <p class="text-gray-600 mb-6">The lawyer profile you're looking for doesn't exist or has been removed.</p>
        <UButton to="/lawyers" color="primary">Browse Lawyers</UButton>
      </div>
    </div>

    <!-- Profile Content -->
    <template v-else>
      <!-- Hero / Header Section -->
      <div class="bg-white border-b border-gray-200 pt-10 pb-12 sm:pt-14 sm:pb-16 mb-12 sm:mb-16 relative overflow-hidden">
         <!-- Subtle Background Pattern -->
         <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
         
         <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="flex flex-col md:flex-row gap-8 items-start">
               
               <!-- Avatar -->
               <div class="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden shrink-0 shadow-lg border-4 border-white relative bg-gray-100">
                   <img v-if="lawyer.image" :src="lawyer.image" class="w-full h-full object-cover" :alt="`${lawyer.name} profile photo`" />
                   <div v-else class="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500 to-primary-600">
                     <span class="text-5xl font-bold text-white">{{ lawyer.name.charAt(0) }}</span>
                   </div>
                   <div class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
               </div>
               
               <!-- Header Info -->
               <div class="flex-1 mt-2">
                  <div class="flex flex-wrap items-center gap-3 mb-2">
                     <h1 class="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">{{ lawyer.name }}</h1>
                     <UIcon v-if="lawyer.ninVerified" name="i-heroicons-check-badge-solid" class="w-8 h-8 text-blue-500 mt-1" />
                  </div>
                  <p class="text-xl text-gray-600 font-medium mb-5">{{ primarySpecialty }}</p>
                  
                  <div class="flex flex-wrap items-center gap-5 text-sm md:text-base text-gray-500 mb-6">
                     <div class="flex items-center gap-1.5">
                       <UIcon name="i-heroicons-map-pin" class="w-5 h-5"/> 
                       {{ displayLocation }}
                     </div>
                     <div v-if="yearsExperience > 0" class="flex items-center gap-1.5">
                       <UIcon name="i-heroicons-briefcase" class="w-5 h-5"/> 
                       {{ yearsExperience }} Years Experience
                     </div>
                     <div v-if="lawyer.professionalInfo" class="flex items-center gap-1.5">
                       <UIcon name="i-heroicons-identification" class="w-5 h-5"/> 
                       Called {{ lawyer.professionalInfo.yearOfCall }}
                     </div>
                  </div>

                  <div v-if="lawyer.specializations.length" class="flex flex-wrap gap-2">
                     <UBadge 
                       v-for="spec in lawyer.specializations" 
                       :key="spec.id" 
                       color="neutral" 
                       variant="soft" 
                       class="px-3.5 py-1.5 text-sm font-medium rounded-full border border-gray-200"
                     >
                        {{ spec.name }}
                     </UBadge>
                  </div>
               </div>
               
               <div class="w-full md:w-auto flex flex-col gap-3 shrink-0 mt-4 md:mt-2">
                 <UButton 
                   size="xl" 
                   color="primary" 
                   class="w-full md:justify-center shadow-sm font-semibold px-8" 
                   icon="i-heroicons-calendar-days" 
                   @click="isBookingModalOpen = true"
                   :disabled="!lawyer.consultationTypes.some(ct => ct.isActive)"
                 >
                    Book Consultation
                 </UButton>
                 <UButton 
                   v-if="isAuthenticated && lawyer.email" 
                   size="xl" 
                   color="neutral" 
                   variant="solid" 
                   class="w-full md:justify-center shadow-sm text-gray-700 font-semibold px-8 hover:bg-gray-50" 
                   icon="i-heroicons-envelope"
                   :to="`mailto:${lawyer.email}`"
                   external
                 >
                    Send Email
                 </UButton>
               </div>
            </div>
         </div>
      </div>

    <!-- Main Content Split Layout -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
       
       <!-- Left Column (About, Experience, etc) -->
       <div class="lg:col-span-2 space-y-12">
          
          <!-- About / Bio Section -->
          <section v-if="lawyer.practiceInfo?.firmName || lawyer.specializations.length">
             <h2 class="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <UIcon name="i-heroicons-user" class="w-6 h-6 text-gray-400" />
                About {{ lawyer.personalInfo?.firstName || lawyer.name.split(' ')[0] }}
             </h2>
             <div class="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg">
                <p v-if="lawyer.practiceInfo?.firmName">
                  {{ lawyer.personalInfo?.firstName || lawyer.name.split(' ')[0] }} is a legal professional at 
                  <strong>{{ lawyer.practiceInfo.firmName }}</strong>, specializing in 
                  {{ lawyer.specializations.map(s => s.name).join(', ') }}.
                </p>
                <p v-if="lawyer.professionalInfo" class="mt-4">
                  With {{ yearsExperience }} years of experience since being called to the Nigerian Bar in 
                  {{ lawyer.professionalInfo.yearOfCall }}, they bring extensive knowledge and expertise to every case.
                </p>
                <p v-if="lawyer.practiceInfo?.statesOfPractice?.length" class="mt-4">
                  Licensed to practice in {{ lawyer.practiceInfo.statesOfPractice.join(', ') }}, providing legal services 
                  across multiple jurisdictions.
                </p>
             </div>
          </section>

          <hr class="border-gray-200" />

          <!-- Specializations Detail -->
          <section v-if="lawyer.specializations.length">
             <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UIcon name="i-heroicons-scale" class="w-6 h-6 text-gray-400" />
                Practice Areas & Expertise
             </h2>
             <div class="grid grid-cols-1 gap-4">
                <div 
                  v-for="spec in lawyer.specializations" 
                  :key="spec.id"
                  class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                   <div class="flex items-start justify-between mb-2">
                      <h3 class="text-lg font-bold text-gray-900">{{ spec.name }}</h3>
                      <UBadge color="primary" variant="soft" class="shrink-0">
                        {{ spec.yearsOfExperience }} years
                      </UBadge>
                   </div>
                   <p v-if="spec.description" class="text-gray-600 text-sm leading-relaxed">
                     {{ spec.description }}
                   </p>
                </div>
             </div>
          </section>

          <hr class="border-gray-200" />

          <!-- Education & Credentials -->
          <section v-if="lawyer.professionalInfo">
             <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-gray-400" />
                Education & Admissions
             </h2>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <!-- University -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                   <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                      <UIcon name="i-heroicons-building-library" class="w-6 h-6 text-blue-600" />
                   </div>
                   <div>
                      <h3 class="text-base font-bold text-gray-900 leading-tight">{{ lawyer.professionalInfo.university }}</h3>
                      <p class="text-sm text-gray-500 mt-1">Bachelor of Laws (LL.B.)</p>
                      <p class="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase">
                        Class of {{ lawyer.professionalInfo.llbYear }}
                      </p>
                   </div>
                </div>
                
                <!-- Law School -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                   <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                      <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-purple-600" />
                   </div>
                   <div>
                      <h3 class="text-base font-bold text-gray-900 leading-tight">{{ lawyer.professionalInfo.lawSchool }}</h3>
                      <p class="text-sm text-gray-500 mt-1">Nigerian Law School</p>
                      <p class="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase">
                        Called {{ lawyer.professionalInfo.yearOfCall }}
                      </p>
                   </div>
                </div>
                
                <!-- Bar Admission -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
                   <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
                      <UIcon name="i-heroicons-identification" class="w-6 h-6 text-green-600" />
                   </div>
                   <div>
                      <h3 class="text-base font-bold text-gray-900 leading-tight">Nigerian Bar Association</h3>
                      <p class="text-sm text-gray-500 mt-1">Supreme Court No. {{ lawyer.professionalInfo.barNumber }}</p>
                      <p class="text-xs text-green-600 mt-1 font-semibold tracking-wide uppercase flex items-center gap-1">
                          <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />
                          {{ lawyer.ninVerified ? 'Verified' : 'Active' }}
                      </p>
                   </div>
                </div>
             </div>
          </section>

          <hr class="border-gray-200" />

          <!-- Consultation Types -->
          <section v-if="lawyer.consultationTypes.filter(ct => ct.isActive).length">
             <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-gray-400" />
                Consultation Options
             </h2>
             <div class="grid grid-cols-1 gap-4">
                <div 
                  v-for="consult in lawyer.consultationTypes.filter(ct => ct.isActive)" 
                  :key="consult.id"
                  class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                   <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-1">{{ consult.name }}</h3>
                        <p v-if="consult.description" class="text-sm text-gray-600">{{ consult.description }}</p>
                      </div>
                      <div class="text-right shrink-0 ml-4">
                        <div class="text-2xl font-bold text-gray-900">
                          {{ parseFloat(consult.price) === 0 ? 'Free' : `₦${parseFloat(consult.price).toLocaleString()}` }}
                        </div>
                        <div class="text-xs text-gray-500">{{ consult.durationMinutes }} minutes</div>
                      </div>
                   </div>
                   <div class="flex flex-wrap gap-2 mt-4">
                      <UBadge 
                        v-if="consult.meetingType === 'video' || consult.meetingType === 'any'" 
                        color="info" 
                        variant="soft"
                        class="text-xs"
                      >
                        <UIcon name="i-heroicons-video-camera" class="w-3 h-3 mr-1" />
                        Video Call
                      </UBadge>
                      <UBadge 
                        v-if="consult.meetingType === 'phone' || consult.meetingType === 'any'" 
                        color="success" 
                        variant="soft"
                        class="text-xs"
                      >
                        <UIcon name="i-heroicons-phone" class="w-3 h-3 mr-1" />
                        Phone Call
                      </UBadge>
                      <UBadge 
                        v-if="consult.meetingType === 'in_person' || consult.meetingType === 'any'" 
                        color="secondary" 
                        variant="soft"
                        class="text-xs"
                      >
                        <UIcon name="i-heroicons-building-office" class="w-3 h-3 mr-1" />
                        In-Person
                      </UBadge>
                   </div>
                </div>
             </div>
          </section>

          <hr class="border-gray-200" />

          <!-- Availability Schedule -->
          <section v-if="workingDays.length">
             <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-gray-400" />
                Availability Schedule
             </h2>
             <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div class="space-y-3">
                   <div 
                     v-for="schedule in workingDays" 
                     :key="schedule.day"
                     class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                   >
                      <span class="font-semibold text-gray-900">{{ schedule.day }}</span>
                      <span class="text-gray-600">{{ schedule.startTime }} - {{ schedule.endTime }}</span>
                   </div>
                </div>
                <p class="text-xs text-gray-500 mt-4 flex items-center gap-1">
                  <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
                  Times shown are in your local timezone
                </p>
             </div>
          </section>
       </div>

       <!-- Right Column (Sticky Box) -->
       <div class="lg:col-span-1">
          <div class="sticky top-20 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden mt-2 lg:mt-0">
             
             <!-- Price Header -->
             <div class="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
                <div v-if="priceRange.min > 0" class="flex items-baseline gap-2 mb-1">
                   <span class="text-4xl font-extrabold text-gray-900">₦{{ priceRange.min.toLocaleString() }}</span>
                   <span v-if="priceRange.max > priceRange.min" class="text-gray-500 font-medium">- ₦{{ priceRange.max.toLocaleString() }}</span>
                </div>
                <div v-else class="mb-1">
                   <span class="text-3xl font-extrabold text-green-600">Free Consultation</span>
                </div>
                <p class="text-sm text-gray-500">{{ priceRange.min > 0 ? 'Consultation rates' : 'Available' }}</p>
             </div>
             
             <!-- Box Details -->
             <div class="p-6 md:p-8 space-y-8">
                
                <!-- Meeting Types -->
                <div v-if="availableMeetingTypes.length">
                   <h3 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Available Meeting Types</h3>
                   <div class="space-y-3">
                      <div 
                        v-if="availableMeetingTypes.includes('video')"
                        class="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 transition-colors hover:bg-blue-50"
                      >
                         <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                               <UIcon name="i-heroicons-video-camera" class="w-4 h-4 text-blue-700" />
                            </div>
                            <span class="text-sm font-semibold text-gray-900">Video Call</span>
                         </div>
                         <UIcon name="i-heroicons-check" class="w-5 h-5 text-blue-600" />
                      </div>
                      <div 
                        v-if="availableMeetingTypes.includes('phone')"
                        class="flex items-center justify-between p-3.5 rounded-xl bg-green-50/60 border border-green-100 transition-colors hover:bg-green-50"
                      >
                         <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                               <UIcon name="i-heroicons-phone" class="w-4 h-4 text-green-700" />
                            </div>
                            <span class="text-sm font-semibold text-gray-900">Phone Call</span>
                         </div>
                         <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-600" />
                      </div>
                      <div 
                        v-if="availableMeetingTypes.includes('in_person')"
                        class="flex items-center justify-between p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 transition-colors hover:bg-purple-50"
                      >
                         <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                               <UIcon name="i-heroicons-building-office" class="w-4 h-4 text-purple-700" />
                            </div>
                            <span class="text-sm font-semibold text-gray-900">In-Person</span>
                         </div>
                         <UIcon name="i-heroicons-check" class="w-5 h-5 text-purple-600" />
                      </div>
                   </div>
                </div>

                <!-- Office Location (for authenticated users or if in-person available) -->
                <div v-if="lawyer.practiceInfo && (isAuthenticated || availableMeetingTypes.includes('in_person'))">
                   <h3 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Office Location</h3>
                   <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div class="flex items-start gap-3">
                         <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                         <div class="text-sm text-gray-700">
                            <p v-if="isAuthenticated && lawyer.practiceInfo.officeStreet" class="font-medium">
                              {{ lawyer.practiceInfo.officeStreet }}
                            </p>
                            <p>{{ lawyer.practiceInfo.officeCity }}, {{ lawyer.practiceInfo.officeState }}</p>
                            <p v-if="isAuthenticated && lawyer.practiceInfo.officePostalCode">
                              {{ lawyer.practiceInfo.officePostalCode }}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>

                <!-- States of Practice -->
                <div v-if="lawyer.practiceInfo?.statesOfPractice?.length">
                   <h3 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Licensed in</h3>
                   <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="state in lawyer.practiceInfo.statesOfPractice" 
                        :key="state" 
                        class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200"
                      >
                        {{ state }}
                      </span>
                   </div>
                </div>

                <!-- Call to Action -->
                <div class="pt-2">
                   <UButton 
                     size="xl" 
                     block 
                     color="neutral" 
                     class="h-14 font-bold text-base shadow-md hover:shadow-lg transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800" 
                     @click="isBookingModalOpen = true"
                     :disabled="!lawyer.consultationTypes.some(ct => ct.isActive)"
                   >
                      Book Consultation
                   </UButton>
                   <p class="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                      <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-green-600" />
                      Secure booking process
                   </p>
                </div>

             </div>
          </div>
       </div>

    </div>


      <BookingModal v-model:open="isBookingModalOpen" :initialLawyerId="lawyerId" />
      </template>
  </div>
</template>
