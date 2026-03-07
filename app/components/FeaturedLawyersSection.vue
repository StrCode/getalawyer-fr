<script setup lang="ts">
import { motion } from 'motion-v'
import { ref } from 'vue'

interface Lawyer {
  id: string
  name: string
  specialty: string
  location: string
  yearsExperience: number
  rating: number
  reviewCount?: number
  practiceAreas: string[]
  avatar?: string
  verified: boolean
  available?: boolean
}

const favorites = ref<string[]>([])
const toggleFav = (id: string) => {
  const i = favorites.value.indexOf(id)
  if (i === -1) favorites.value.push(id)
  else favorites.value.splice(i, 1)
}

const avatarColors: Record<string, string> = {
  '1': '#6a9e8a', '2': '#6a7a9e', '3': '#9e6a6a',
  '4': '#9e8a6a', '5': '#6a9e6a', '6': '#7a6a9e',
  '7': '#9e6a8a', '8': '#6a8a9e',
}

const featuredLawyers: Lawyer[] = [
  { id: '1', name: 'Sarah Mitchell', specialty: 'Corporate Law', location: 'New York, NY', yearsExperience: 15, rating: 4.9, reviewCount: 87, practiceAreas: ['Mergers & Acquisitions', 'Corporate Governance', 'Securities'], verified: true, available: true },
  { id: '2', name: 'David Chen', specialty: 'Family Law', location: 'Los Angeles, CA', yearsExperience: 12, rating: 4.8, reviewCount: 64, practiceAreas: ['Divorce', 'Child Custody', 'Adoption'], avatar: 'https://i.pravatar.cc/150?img=12', verified: true },
  { id: '3', name: 'Emily Rodriguez', specialty: 'Criminal Defense', location: 'Chicago, IL', yearsExperience: 18, rating: 4.9, reviewCount: 102, practiceAreas: ['White Collar Crime', 'DUI Defense', 'Appeals'], verified: true, available: true },
  { id: '4', name: 'Michael Thompson', specialty: 'Real Estate Law', location: 'Miami, FL', yearsExperience: 10, rating: 4.7, reviewCount: 43, practiceAreas: ['Commercial Real Estate', 'Property Disputes', 'Zoning'], avatar: 'https://i.pravatar.cc/150?img=33', verified: true },
  { id: '5', name: 'Jennifer Park', specialty: 'Immigration Law', location: 'San Francisco, CA', yearsExperience: 14, rating: 4.8, reviewCount: 76, practiceAreas: ['Visa Applications', 'Citizenship', 'Deportation Defense'], verified: true, available: true },
  { id: '6', name: 'Robert Williams', specialty: 'Intellectual Property', location: 'Boston, MA', yearsExperience: 20, rating: 4.9, reviewCount: 118, practiceAreas: ['Patent Law', 'Trademark', 'Copyright'], avatar: 'https://i.pravatar.cc/150?img=52', verified: true },
  { id: '7', name: 'Amanda Foster', specialty: 'Employment Law', location: 'Seattle, WA', yearsExperience: 11, rating: 4.8, reviewCount: 55, practiceAreas: ['Workplace Discrimination', 'Wrongful Termination', 'Contracts'], verified: true },
  { id: '8', name: 'James Anderson', specialty: 'Tax Law', location: 'Austin, TX', yearsExperience: 16, rating: 4.7, reviewCount: 39, practiceAreas: ['Tax Planning', 'IRS Disputes', 'Estate Tax'], avatar: 'https://i.pravatar.cc/150?img=68', verified: true, available: true },
]

const initials = (name: string) => name.split(' ').map(n => n[0]).join('')
</script>

<template>
  <section id="find-lawyers" class="bg-white py-20 md:py-28">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
        <div>
          <motion.p
            :initial="{ opacity: 0, y: 10 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.4 }"
            class="text-xs font-semibold uppercase tracking-widest text-[#1d6b44] mb-3"
          >Featured Professionals</motion.p>
          <motion.h2
            :initial="{ opacity: 0, y: 14 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.5, delay: 0.06 }"
            class="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight"
          >
            Top-Rated Lawyers
          </motion.h2>
        </div>
        <motion.div
          :initial="{ opacity: 0 }"
          :whileInView="{ opacity: 1 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.4, delay: 0.1 }"
        >
          <UButton variant="outline" size="md" class="rounded-full border-neutral-200 text-neutral-700 hover:border-[#1d6b44] hover:text-[#1d6b44] font-semibold">
            View all lawyers →
          </UButton>
        </motion.div>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <motion.div
          v-for="(lawyer, i) in featuredLawyers"
          :key="lawyer.id"
          :initial="{ opacity: 0, y: 24 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, margin: '-30px' }"
          :transition="{ duration: 0.42, delay: i * 0.055, ease: [0.25, 0.46, 0.45, 0.94] }"
          :whileHover="{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.09)' }"
          class="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col"
        >
          <!-- Top row -->
          <div class="flex items-start justify-between mb-4">
            <!-- Avatar -->
            <div class="relative">
              <div v-if="lawyer.avatar"
                class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img :src="lawyer.avatar" :alt="lawyer.name" class="w-full h-full object-cover" />
              </div>
              <div v-else
                class="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                :style="`background: linear-gradient(135deg, ${avatarColors[lawyer.id]}cc, ${avatarColors[lawyer.id]})`">
                {{ initials(lawyer.name) }}
              </div>
              <!-- Verified tick -->
              <div v-if="lawyer.verified"
                class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1d6b44] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>

            <!-- Favorite -->
            <motion.button
              :whileTap="{ scale: 0.8 }"
              @click="toggleFav(lawyer.id)"
              class="bg-transparent border-none cursor-pointer p-0 text-xl leading-none transition-colors"
              :class="favorites.includes(lawyer.id) ? 'text-[#e91e63]' : 'text-neutral-200 hover:text-neutral-400'"
            >
              {{ favorites.includes(lawyer.id) ? '♥' : '♡' }}
            </motion.button>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h3 class="font-bold text-neutral-900 text-[15px] mb-0.5">{{ lawyer.name }}</h3>
            <p class="text-[#1d6b44] font-semibold text-sm mb-1">{{ lawyer.specialty }}</p>
            <p class="text-neutral-400 text-xs mb-3 flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ lawyer.location }}
            </p>

            <!-- Rating row -->
            <div class="flex items-center gap-1.5 mb-3">
              <span class="text-[#f5a623] text-sm">★</span>
              <span class="text-sm font-semibold text-neutral-900">{{ lawyer.rating }}</span>
              <span class="text-xs text-neutral-400">({{ lawyer.reviewCount }})</span>
              <span class="text-neutral-200 mx-1">·</span>
              <span class="text-xs text-neutral-500">{{ lawyer.yearsExperience }} yrs exp</span>
            </div>

            <!-- Practice area chips -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span
                v-for="area in lawyer.practiceAreas.slice(0, 2)"
                :key="area"
                class="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f2f2f2] text-neutral-600"
              >{{ area }}</span>
              <span v-if="lawyer.practiceAreas.length > 2"
                class="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f2f2f2] text-neutral-400">
                +{{ lawyer.practiceAreas.length - 2 }}
              </span>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center gap-2">
            <motion.button
              :whileHover="{ scale: 1.03 }"
              :whileTap="{ scale: 0.97 }"
              class="flex-1 py-2.5 rounded-lg bg-[#1d6b44] hover:bg-[#154a2f] text-white text-sm font-semibold border-none cursor-pointer font-[DM_Sans] transition-colors duration-150"
            >
              View Profile
            </motion.button>
            <div
              v-if="lawyer.available"
              class="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#e8f3ec] text-[#1d6b44] whitespace-nowrap"
            >
              Available
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
</template>