<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const lawyerId = route.params.id

// Mock Data
const lawyer = ref({
  id: lawyerId,
  name: 'Eleanor Sterling, Esq.',
  verified: true,
  specialty: 'Corporate & Tech Law',
  practiceAreas: ['Corporate Law', 'Mergers & Acquisitions', 'Intellectual Property', 'Startups'],
  location: 'Lagos, Nigeria',
  yearsExperience: 12,
  rating: 4.9,
  reviewCount: 47,
  priceRange: { min: 45000, max: 90000 },
  bio: 'Eleanor is a seasoned corporate attorney specializing in high-growth technology startups and venture capital financing. With over a decade of experience navigating complex regulatory landscapes, she provides strategic counsel to founders and investors alike. She previously served as lead counsel for several successful fintech acquisitions across West Africa before starting her own private practice.',
  languages: ['english', 'french', 'yoruba'],
  avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256'
})

useHead({
  title: `${lawyer.value.name} - ${lawyer.value.specialty} | Getalawyer`
})

const isBookingModalOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    
    <!-- Hero / Header Section -->
    <div class="bg-white border-b border-gray-200 pt-10 pb-12 sm:pt-14 sm:pb-16 relative overflow-hidden">
       <!-- Subtle Background Pattern -->
       <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
       
       <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="flex flex-col md:flex-row gap-8 items-start">
             
             <!-- Avatar -->
             <div class="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden shrink-0 shadow-lg border-4 border-white relative bg-gray-100">
                 <img :src="lawyer.avatar" class="w-full h-full object-cover" alt="Lawyer Avatar" />
                 <div class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
             </div>
             
             <!-- Header Info -->
             <div class="flex-1 mt-2">
                <div class="flex flex-wrap items-center gap-3 mb-2">
                   <h1 class="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">{{ lawyer.name }}</h1>
                   <UIcon v-if="lawyer.verified" name="i-heroicons-check-badge-solid" class="w-8 h-8 text-blue-500 mt-1" />
                </div>
                <p class="text-xl text-gray-600 font-medium mb-5">{{ lawyer.specialty }}</p>
                
                <div class="flex flex-wrap items-center gap-5 text-sm md:text-base text-gray-500 mb-6">
                   <div class="flex items-center gap-1.5"><UIcon name="i-heroicons-map-pin" class="w-5 h-5"/> {{ lawyer.location }}</div>
                   <div class="flex items-center gap-1.5"><UIcon name="i-heroicons-briefcase" class="w-5 h-5"/> {{ lawyer.yearsExperience }} Years Experience</div>
                   <div class="flex items-center gap-1.5 font-medium text-gray-900">
                       <UIcon name="i-heroicons-star-solid" class="w-5 h-5 text-yellow-400"/> 
                       {{ lawyer.rating }} <span class="text-gray-500 font-normal">({{ lawyer.reviewCount }} reviews)</span>
                   </div>
                </div>

                <div class="flex flex-wrap gap-2">
                   <UBadge v-for="area in lawyer.practiceAreas" :key="area" color="neutral" variant="soft" class="px-3.5 py-1.5 text-sm font-medium rounded-full border border-gray-200">
                      {{ area }}
                   </UBadge>
                </div>
             </div>
             
             <div class="w-full md:w-auto flex flex-col gap-3 shrink-0 mt-4 md:mt-2">
               <UButton size="xl" color="primary" class="w-full md:justify-center shadow-sm font-semibold px-8" icon="i-heroicons-calendar-days" @click="isBookingModalOpen = true">
                  Book Consultation
               </UButton>
               <UButton size="xl" color="neutral" variant="solid" class="w-full md:justify-center shadow-sm text-gray-700 font-semibold px-8 hover:bg-gray-50" icon="i-heroicons-chat-bubble-left-ellipsis">
                  Send Message
               </UButton>
             </div>
          </div>
       </div>
    </div>

    <!-- Main Content Split Layout -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
       
       <!-- Left Column (About, Experience, etc) -->
       <div class="lg:col-span-2 space-y-12">
          
          <!-- About -->
          <section>
             <h2 class="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <UIcon name="i-heroicons-user" class="w-6 h-6 text-gray-400" />
                About Eleanor
             </h2>
             <div class="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg">
                <p>{{ lawyer.bio }}</p>
                <p class="mt-4">I pride myself on providing clear, actionable legal advice and aggressive representation when necessary. My priority is ensuring my clients understand their rights, their operating boundaries, and the strategic pathways available to them to protect their business interests.</p>
             </div>
          </section>

          <hr class="border-gray-200" />

          <!-- Education & Credentials -->
          <section>
             <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-gray-400" />
                Education & Admissions
             </h2>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <!-- Card 1 -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                   <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                      <UIcon name="i-heroicons-building-library" class="w-6 h-6 text-blue-600" />
                   </div>
                   <div>
                      <h3 class="text-base font-bold text-gray-900 leading-tight">University of Lagos</h3>
                      <p class="text-sm text-gray-500 mt-1">Bachelor of Laws (LL.B.)</p>
                      <p class="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase">Class of 2012</p>
                   </div>
                </div>
                <!-- Card 2 -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                   <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
                      <UIcon name="i-heroicons-identification" class="w-6 h-6 text-green-600" />
                   </div>
                   <div>
                      <h3 class="text-base font-bold text-gray-900 leading-tight">Nigerian Bar Association</h3>
                      <p class="text-sm text-gray-500 mt-1">Supreme Court No. SC48992</p>
                      <p class="text-xs text-green-600 mt-1 font-semibold tracking-wide uppercase flex items-center gap-1">
                          <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />
                          Active & Verified
                      </p>
                   </div>
                </div>
             </div>
          </section>

          <hr class="border-gray-200" />

          <!-- Reviews -->
          <section>
             <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                   <UIcon name="i-heroicons-star" class="w-6 h-6 text-gray-400" />
                   Client Reviews
                </h2>
                <div class="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                   <UIcon name="i-heroicons-star-solid" class="w-5 h-5 text-yellow-500" />
                   <span class="font-bold text-gray-900">{{ lawyer.rating }}</span>
                   <span class="text-yellow-700 font-medium text-sm">({{ lawyer.reviewCount }} reviews)</span>
                </div>
             </div>
             
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <!-- Review 1 -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
                   <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                         <UAvatar alt="Michael Roberts" size="sm" class="bg-gray-200" />
                         <div>
                            <p class="font-bold text-gray-900 text-sm">Michael R.</p>
                            <p class="text-xs text-gray-500">October 2023</p>
                         </div>
                      </div>
                      <div class="flex text-yellow-400">
                         <UIcon name="i-heroicons-star-solid" class="w-4 h-4" v-for="s in 5" :key="s" />
                      </div>
                   </div>
                   <p class="text-gray-600 text-sm leading-relaxed flex-grow italic">
                      "Absolutely fantastic experience. Eleanor handled my corporate restructuring with incredible professionalism and speed. Always available to answer questions and explain complex legalese in plain English. Highly recommended!"
                   </p>
                </div>
                <!-- Review 2 -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
                   <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                         <UAvatar alt="Sarah Jenkins" size="sm" class="bg-gray-200" />
                         <div>
                            <p class="font-bold text-gray-900 text-sm">Sarah J.</p>
                            <p class="text-xs text-gray-500">July 2023</p>
                         </div>
                      </div>
                      <div class="flex text-yellow-400">
                         <UIcon name="i-heroicons-star-solid" class="w-4 h-4" v-for="s in 5" :key="s" />
                      </div>
                   </div>
                   <p class="text-gray-600 text-sm leading-relaxed flex-grow italic">
                      "Saved our startup during a rigorous Series A due diligence process. Her attention to detail and ability to draft airtight IP assignment contracts was exactly what we needed. A true partner."
                   </p>
                </div>
             </div>
             
             <div class="mt-6">
                <UButton variant="outline" color="neutral" class="font-semibold text-gray-700 border-gray-200 hover:bg-gray-50">
                   Read all {{ lawyer.reviewCount }} reviews
                </UButton>
             </div>
          </section>
       </div>

       <!-- Right Column (Sticky Box) -->
       <div class="lg:col-span-1">
          <div class="sticky top-24 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden mt-2 lg:mt-0">
             
             <!-- Price Header -->
             <div class="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
                <div class="flex items-baseline gap-2 mb-1">
                   <span class="text-4xl font-extrabold text-gray-900">₦{{ lawyer.priceRange.min.toLocaleString() }}</span>
                   <span class="text-gray-500 font-medium">/ hr</span>
                </div>
                <p class="text-sm text-gray-500">Starting consultation rate</p>
             </div>
             
             <!-- Box Details -->
             <div class="p-6 md:p-8 space-y-8">
                
                <!-- Availability -->
                <div>
                   <h3 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Communication Mediums</h3>
                   <div class="space-y-3">
                      <div class="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 transition-colors hover:bg-blue-50">
                         <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                               <UIcon name="i-heroicons-video-camera" class="w-4 h-4 text-blue-700" />
                            </div>
                            <span class="text-sm font-semibold text-gray-900">Video Call</span>
                         </div>
                         <UIcon name="i-heroicons-check" class="w-5 h-5 text-blue-600" />
                      </div>
                      <div class="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                         <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                               <UIcon name="i-heroicons-users" class="w-4 h-4 text-gray-600" />
                            </div>
                            <span class="text-sm font-semibold text-gray-900">In-Person</span>
                         </div>
                         <UIcon name="i-heroicons-check" class="w-5 h-5 text-gray-400" />
                      </div>
                   </div>
                </div>

                <!-- Languages -->
                <div>
                   <h3 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Languages Spoken</h3>
                   <div class="flex flex-wrap gap-2">
                      <span v-for="lang in lawyer.languages" :key="lang" class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 capitalize border border-gray-200">
                        {{ lang }}
                      </span>
                   </div>
                </div>

                <!-- Call to Action -->
                <div class="pt-2">
                   <UButton size="xl" block color="neutral" class="h-14 font-bold text-base shadow-md hover:shadow-lg transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800" @click="isBookingModalOpen = true">
                      Request a Meeting
                   </UButton>
                   <p class="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                      <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-green-600" />
                      No charges until accepted
                   </p>
                </div>

             </div>
          </div>
       </div>

    </div>

    <BookingModal v-model:open="isBookingModalOpen" :initialLawyerId="lawyerId as string" />
  </div>
</template>
