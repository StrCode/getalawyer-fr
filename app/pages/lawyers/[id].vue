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
  <div class="flex flex-col bg-gray-50 min-h-screen font-sans">
    
    <!-- Use the app/Header component -->
    <AppHeader />

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="mx-auto mb-4 w-8 h-8 text-primary-500 animate-spin" />
        <p class="text-gray-600">Loading lawyer profile...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !lawyer" class="flex justify-center items-center min-h-screen">
      <div class="mx-auto px-4 max-w-md text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-4 w-16 h-16 text-red-500" />
        <h2 class="mb-2 font-bold text-gray-900 text-2xl">Lawyer Not Found</h2>
        <p class="mb-6 text-gray-600">The lawyer profile you're looking for doesn't exist or has been removed.</p>
        <UButton to="/lawyers" color="primary">Browse Lawyers</UButton>
      </div>
    </div>

    <!-- Profile Content -->
    <template v-else>
      <!-- Hero / Header Section -->
      <div class="relative bg-white mb-12 sm:mb-16 pt-10 sm:pt-14 pb-12 sm:pb-16 border-gray-200 border-b overflow-hidden">
         <!-- Subtle Background Pattern -->
         <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
         
         <div class="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div class="flex md:flex-row flex-col items-start gap-8">
               
               <!-- Avatar -->
               <div class="relative bg-gray-100 shadow-lg border-4 border-white rounded-2xl w-32 md:w-44 h-32 md:h-44 overflow-hidden shrink-0">
                   <img v-if="lawyer.image" :src="lawyer.image" class="w-full h-full object-cover" :alt="`${lawyer.name} profile photo`" />
                   <div v-else class="flex justify-center items-center bg-linear-to-br from-primary-500 to-primary-600 w-full h-full">
                     <span class="font-bold text-white text-5xl">{{ lawyer.name.charAt(0) }}</span>
                   </div>
                   <div class="absolute inset-0 rounded-2xl ring-1 ring-black/10 ring-inset"></div>
               </div>
               
               <!-- Header Info -->
               <div class="flex-1 mt-2">
                  <div class="flex flex-wrap items-center gap-3 mb-2">
                     <h1 class="font-bold text-gray-900 text-3xl md:text-5xl tracking-tight">{{ lawyer.name }}</h1>
                     <UIcon v-if="lawyer.ninVerified" name="i-heroicons-check-badge-solid" class="mt-1 w-8 h-8 text-blue-500" />
                  </div>
                  <p class="mb-5 font-medium text-gray-600 text-xl">{{ primarySpecialty }}</p>
                  
                  <div class="flex flex-wrap items-center gap-5 mb-6 text-gray-500 text-sm md:text-base">
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
                       class="px-3.5 py-1.5 border border-gray-200 rounded-full font-medium text-sm"
                     >
                        {{ spec.name }}
                     </UBadge>
                  </div>
               </div>
               
               <div class="flex flex-col gap-3 mt-4 md:mt-2 w-full md:w-auto shrink-0">
                 <UButton 
                   size="xl" 
                   color="primary" 
                   class="md:justify-center shadow-sm px-8 w-full font-semibold" 
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
                   class="md:justify-center hover:bg-gray-50 shadow-sm px-8 w-full font-semibold text-gray-700" 
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
    <div class="gap-10 grid grid-cols-1 lg:grid-cols-3 mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
       
       <!-- Left Column (About, Experience, etc) -->
       <div class="space-y-12 lg:col-span-2">
          
          <!-- About / Bio Section -->
          <section v-if="lawyer.practiceInfo?.firmName || lawyer.specializations.length">
             <h2 class="flex items-center gap-2 mb-5 font-bold text-gray-900 text-2xl">
                <UIcon name="i-heroicons-user" class="w-6 h-6 text-gray-400" />
                About {{ lawyer.personalInfo?.firstName || lawyer.name.split(' ')[0] }}
             </h2>
             <div class="max-w-none text-gray-600 text-lg leading-relaxed prose prose-gray">
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
             <h2 class="flex items-center gap-2 mb-6 font-bold text-gray-900 text-2xl">
                <UIcon name="i-heroicons-scale" class="w-6 h-6 text-gray-400" />
                Practice Areas & Expertise
             </h2>
             <div class="gap-4 grid grid-cols-1">
                <div 
                  v-for="spec in lawyer.specializations" 
                  :key="spec.id"
                  class="bg-white shadow-sm hover:shadow-md p-6 border border-gray-200 rounded-2xl transition-shadow"
                >
                   <div class="flex justify-between items-start mb-2">
                      <h3 class="font-bold text-gray-900 text-lg">{{ spec.name }}</h3>
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
             <h2 class="flex items-center gap-2 mb-6 font-bold text-gray-900 text-2xl">
                <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-gray-400" />
                Education & Admissions
             </h2>
             <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
                 <!-- University -->
                <div class="flex items-start gap-4 bg-white shadow-sm hover:shadow-md p-6 border border-gray-200 rounded-2xl transition-shadow">
                   <div class="flex justify-center items-center bg-blue-50 border border-blue-100 rounded-xl w-12 h-12 shrink-0">
                      <UIcon name="i-heroicons-building-library" class="w-6 h-6 text-blue-600" />
                   </div>
                   <div>
                      <h3 class="font-bold text-gray-900 text-base leading-tight">{{ lawyer.professionalInfo.university }}</h3>
                      <p class="mt-1 text-gray-500 text-sm">Bachelor of Laws (LL.B.)</p>
                      <p class="mt-1 font-medium text-gray-400 text-xs uppercase tracking-wide">
                        Class of {{ lawyer.professionalInfo.llbYear }}
                      </p>
                   </div>
                </div>
                
                <!-- Law School -->
                <div class="flex items-start gap-4 bg-white shadow-sm hover:shadow-md p-6 border border-gray-200 rounded-2xl transition-shadow">
                   <div class="flex justify-center items-center bg-purple-50 border border-purple-100 rounded-xl w-12 h-12 shrink-0">
                      <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-purple-600" />
                   </div>
                   <div>
                      <h3 class="font-bold text-gray-900 text-base leading-tight">{{ lawyer.professionalInfo.lawSchool }}</h3>
                      <p class="mt-1 text-gray-500 text-sm">Nigerian Law School</p>
                      <p class="mt-1 font-medium text-gray-400 text-xs uppercase tracking-wide">
                        Called {{ lawyer.professionalInfo.yearOfCall }}
                      </p>
                   </div>
                </div>
                
                <!-- Bar Admission -->
                <div class="flex items-start gap-4 md:col-span-2 bg-white shadow-sm hover:shadow-md p-6 border border-gray-200 rounded-2xl transition-shadow">
                   <div class="flex justify-center items-center bg-green-50 border border-green-100 rounded-xl w-12 h-12 shrink-0">
                      <UIcon name="i-heroicons-identification" class="w-6 h-6 text-green-600" />
                   </div>
                   <div>
                      <h3 class="font-bold text-gray-900 text-base leading-tight">Nigerian Bar Association</h3>
                      <p class="mt-1 text-gray-500 text-sm">Supreme Court No. {{ lawyer.professionalInfo.barNumber }}</p>
                      <p class="flex items-center gap-1 mt-1 font-semibold text-green-600 text-xs uppercase tracking-wide">
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
             <h2 class="flex items-center gap-2 mb-6 font-bold text-gray-900 text-2xl">
                <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-gray-400" />
                Consultation Options
             </h2>
             <div class="gap-4 grid grid-cols-1">
                <div 
                  v-for="consult in lawyer.consultationTypes.filter(ct => ct.isActive)" 
                  :key="consult.id"
                  class="bg-white shadow-sm hover:shadow-md p-6 border border-gray-200 rounded-2xl transition-shadow"
                >
                   <div class="flex justify-between items-start mb-3">
                      <div class="flex-1">
                        <h3 class="mb-1 font-bold text-gray-900 text-lg">{{ consult.name }}</h3>
                        <p v-if="consult.description" class="text-gray-600 text-sm">{{ consult.description }}</p>
                      </div>
                      <div class="ml-4 text-right shrink-0">
                        <div class="font-bold text-gray-900 text-2xl">
                          {{ parseFloat(consult.price) === 0 ? 'Free' : `₦${parseFloat(consult.price).toLocaleString()}` }}
                        </div>
                        <div class="text-gray-500 text-xs">{{ consult.durationMinutes }} minutes</div>
                      </div>
                   </div>
                   <div class="flex flex-wrap gap-2 mt-4">
                      <UBadge 
                        v-if="consult.meetingType === 'video' || consult.meetingType === 'any'" 
                        color="info" 
                        variant="soft"
                        class="text-xs"
                      >
                        <UIcon name="i-heroicons-video-camera" class="mr-1 w-3 h-3" />
                        Video Call
                      </UBadge>
                      <UBadge 
                        v-if="consult.meetingType === 'phone' || consult.meetingType === 'any'" 
                        color="success" 
                        variant="soft"
                        class="text-xs"
                      >
                        <UIcon name="i-heroicons-phone" class="mr-1 w-3 h-3" />
                        Phone Call
                      </UBadge>
                      <UBadge 
                        v-if="consult.meetingType === 'in_person' || consult.meetingType === 'any'" 
                        color="secondary" 
                        variant="soft"
                        class="text-xs"
                      >
                        <UIcon name="i-heroicons-building-office" class="mr-1 w-3 h-3" />
                        In-Person
                      </UBadge>
                   </div>
                </div>
             </div>
          </section>

          <hr class="border-gray-200" />

          <!-- Availability Schedule -->
          <section v-if="workingDays.length">
             <h2 class="flex items-center gap-2 mb-6 font-bold text-gray-900 text-2xl">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-gray-400" />
                Availability Schedule
             </h2>
             <div class="bg-white shadow-sm p-6 border border-gray-200 rounded-2xl">
                <div class="space-y-3">
                   <div 
                     v-for="schedule in workingDays" 
                     :key="schedule.day"
                     class="flex justify-between items-center py-2 border-gray-100 last:border-0 border-b"
                   >
                      <span class="font-semibold text-gray-900">{{ schedule.day }}</span>
                      <span class="text-gray-600">{{ schedule.startTime }} - {{ schedule.endTime }}</span>
                   </div>
                </div>
                <p class="flex items-center gap-1 mt-4 text-gray-500 text-xs">
                  <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
                  Times shown are in your local timezone
                </p>
             </div>
          </section>
       </div>

       <!-- Right Column (Sticky Box) -->
       <div class="lg:col-span-1">
          <div class="top-20 sticky bg-white shadow-xl mt-2 lg:mt-0 border border-gray-200 rounded-3xl overflow-hidden">
             
             <!-- Price Header -->
             <div class="bg-gray-50/50 p-6 md:p-8 border-gray-100 border-b">
                <div v-if="priceRange.min > 0" class="flex items-baseline gap-2 mb-1">
                   <span class="font-extrabold text-gray-900 text-4xl">₦{{ priceRange.min.toLocaleString() }}</span>
                   <span v-if="priceRange.max > priceRange.min" class="font-medium text-gray-500">- ₦{{ priceRange.max.toLocaleString() }}</span>
                </div>
                <div v-else class="mb-1">
                   <span class="font-extrabold text-green-600 text-3xl">Free Consultation</span>
                </div>
                <p class="text-gray-500 text-sm">{{ priceRange.min > 0 ? 'Consultation rates' : 'Available' }}</p>
             </div>
             
             <!-- Box Details -->
             <div class="space-y-8 p-6 md:p-8">
                
                <!-- Meeting Types -->
                <div v-if="availableMeetingTypes.length">
                   <h3 class="mb-3 font-bold text-gray-400 text-xs uppercase tracking-wider">Available Meeting Types</h3>
                   <div class="space-y-3">
                      <div 
                        v-if="availableMeetingTypes.includes('video')"
                        class="flex justify-between items-center bg-blue-50/60 hover:bg-blue-50 p-3.5 border border-blue-100 rounded-xl transition-colors"
                      >
                         <div class="flex items-center gap-3">
                            <div class="flex justify-center items-center bg-blue-100 rounded-full w-8 h-8 shrink-0">
                               <UIcon name="i-heroicons-video-camera" class="w-4 h-4 text-blue-700" />
                            </div>
                            <span class="font-semibold text-gray-900 text-sm">Video Call</span>
                         </div>
                         <UIcon name="i-heroicons-check" class="w-5 h-5 text-blue-600" />
                      </div>
                      <div 
                        v-if="availableMeetingTypes.includes('phone')"
                        class="flex justify-between items-center bg-green-50/60 hover:bg-green-50 p-3.5 border border-green-100 rounded-xl transition-colors"
                      >
                         <div class="flex items-center gap-3">
                            <div class="flex justify-center items-center bg-green-100 rounded-full w-8 h-8 shrink-0">
                               <UIcon name="i-heroicons-phone" class="w-4 h-4 text-green-700" />
                            </div>
                            <span class="font-semibold text-gray-900 text-sm">Phone Call</span>
                         </div>
                         <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-600" />
                      </div>
                      <div 
                        v-if="availableMeetingTypes.includes('in_person')"
                        class="flex justify-between items-center bg-purple-50/60 hover:bg-purple-50 p-3.5 border border-purple-100 rounded-xl transition-colors"
                      >
                         <div class="flex items-center gap-3">
                            <div class="flex justify-center items-center bg-purple-100 rounded-full w-8 h-8 shrink-0">
                               <UIcon name="i-heroicons-building-office" class="w-4 h-4 text-purple-700" />
                            </div>
                            <span class="font-semibold text-gray-900 text-sm">In-Person</span>
                         </div>
                         <UIcon name="i-heroicons-check" class="w-5 h-5 text-purple-600" />
                      </div>
                   </div>
                </div>

                <!-- Office Location (for authenticated users or if in-person available) -->
                <div v-if="lawyer.practiceInfo && (isAuthenticated || availableMeetingTypes.includes('in_person'))">
                   <h3 class="mb-3 font-bold text-gray-400 text-xs uppercase tracking-wider">Office Location</h3>
                   <div class="bg-gray-50 p-4 border border-gray-200 rounded-xl">
                      <div class="flex items-start gap-3">
                         <UIcon name="i-heroicons-map-pin" class="mt-0.5 w-5 h-5 text-gray-500 shrink-0" />
                         <div class="text-gray-700 text-sm">
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
                   <h3 class="mb-3 font-bold text-gray-400 text-xs uppercase tracking-wider">Licensed in</h3>
                   <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="state in lawyer.practiceInfo.statesOfPractice" 
                        :key="state" 
                        class="inline-flex items-center bg-gray-100 px-3 py-1.5 border border-gray-200 rounded-lg font-bold text-gray-700 text-xs"
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
                     class="bg-gray-900 hover:bg-gray-800 shadow-md hover:shadow-lg h-14 font-bold text-white text-base transition-all duration-200" 
                     @click="isBookingModalOpen = true"
                     :disabled="!lawyer.consultationTypes.some(ct => ct.isActive)"
                   >
                      Book Consultation
                   </UButton>
                   <p class="flex justify-center items-center gap-1.5 mt-4 text-gray-500 text-xs text-center">
                      <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-green-600" />
                      Secure booking process
                   </p>
                </div>

             </div>
          </div>
       </div>

    </div>


      <BookingWizard v-model:open="isBookingModalOpen" :initialLawyerId="lawyerId" :lawyerInfo="lawyer" />
      </template>
  </div>
</template>
