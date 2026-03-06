<script setup lang="ts">
import { motion } from 'motion-v'
import { useReducedMotion, getTransition } from '~/composables/useReducedMotion'

export interface Lawyer {
  id: string
  name: string
  specialty: string
  location: string
  yearsExperience: number
  rating: number
  practiceAreas: string[]
  avatar?: string
  verified: boolean
}

interface LawyerCardProps {
  lawyer: Lawyer
}

const props = defineProps<LawyerCardProps>()

// Use reduced motion composable
const { prefersReducedMotion } = useReducedMotion()

// Generate initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Generate a consistent color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-cyan-500'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}
</script>

<template>
  <motion.div
    :class="[
      'bg-white shadow-card hover:shadow-card-hover rounded-2xl overflow-hidden lawyer-card',
      prefersReducedMotion ? 'transition-none' : 'transition-shadow duration-200'
    ]"
    :whileHover="{ y: -4, scale: 1.01 }"
    :transition="getTransition(prefersReducedMotion, { duration: 0.2 })"
  >
    <!-- Navy Header with Avatar -->
    <div class="relative bg-navy px-6 py-5 lawyer-header">
      <div class="flex items-start gap-4">
        <!-- Avatar or Initials -->
        <div
          v-if="lawyer.avatar"
          class="flex-shrink-0 rounded-full ring-2 ring-white/20 w-16 h-16 overflow-hidden lawyer-avatar"
        >
          <img :src="lawyer.avatar" :alt="lawyer.name" class="w-full h-full object-cover" />
        </div>
        <div
          v-else
          :class="[
            'lawyer-avatar w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white/20',
            getAvatarColor(lawyer.name)
          ]"
        >
          <span class="font-semibold text-white text-xl">{{ getInitials(lawyer.name) }}</span>
        </div>

        <!-- Name and Specialty -->
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-semibold text-white text-lg leading-tight lawyer-name">
              {{ lawyer.name }}
            </h3>
            <!-- Verified Badge -->
            <div
              v-if="lawyer.verified"
              class="flex flex-shrink-0 items-center gap-1 bg-gold/20 px-2 py-1 rounded-full font-medium text-gold text-xs verified-badge"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              Verified
            </div>
          </div>
          <p class="mt-1 text-gold text-sm lawyer-specialty">{{ lawyer.specialty }}</p>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-6">
      <!-- Location, Experience, Rating -->
      <div class="flex items-center gap-4 mb-4 text-gray-600 text-sm">
        <div class="flex items-center gap-1 lawyer-location">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{{ lawyer.location }}</span>
        </div>
        <div class="flex items-center gap-1 years-experience">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>{{ lawyer.yearsExperience }} years</span>
        </div>
        <div class="flex items-center gap-1 lawyer-rating">
          <svg class="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          <span class="font-medium text-gray-900">{{ lawyer.rating.toFixed(1) }}</span>
        </div>
      </div>

      <!-- Practice Area Tags -->
      <div class="flex flex-wrap gap-2 mb-5 practice-area-tags">
        <span
          v-for="area in lawyer.practiceAreas"
          :key="area"
          class="bg-cream px-3 py-1 rounded-full font-medium text-navy text-xs"
        >
          {{ area }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          :class="[
            'flex-1 bg-navy hover:bg-navy/90 px-4 py-2.5 rounded-full font-medium text-white text-sm btn-book-consultation',
            prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
          ]"
        >
          Book Consultation
        </button>
        <button
          :class="[
            'hover:bg-navy px-4 py-2.5 border-2 border-navy rounded-full font-medium text-navy hover:text-white text-sm btn-view-profile',
            prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
          ]"
        >
          View Profile
        </button>
      </div>
    </div>
  </motion.div>
</template>

<style scoped>
.shadow-card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
}

.shadow-card-hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
