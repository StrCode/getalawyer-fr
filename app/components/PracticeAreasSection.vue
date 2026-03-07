<script setup lang="ts">
import { motion } from 'motion-v'
import { ref } from 'vue'

interface PracticeArea {
  id: string
  name: string
  icon: string
  lawyerCount: number
}

const emit = defineEmits<{ selectArea: [areaName: string] }>()
const hoveredId = ref<string | null>(null)

const practiceAreas: PracticeArea[] = [
  { id: '1',  name: 'Corporate Law',       icon: '🏢', lawyerCount: 245 },
  { id: '2',  name: 'Family Law',          icon: '👨‍👩‍👧', lawyerCount: 312 },
  { id: '3',  name: 'Criminal Defense',    icon: '⚖️', lawyerCount: 198 },
  { id: '4',  name: 'Real Estate Law',     icon: '🏠', lawyerCount: 276 },
  { id: '5',  name: 'Immigration Law',     icon: '✈️', lawyerCount: 189 },
  { id: '6',  name: 'Intellectual Property', icon: '💡', lawyerCount: 167 },
  { id: '7',  name: 'Employment Law',      icon: '💼', lawyerCount: 223 },
  { id: '8',  name: 'Tax Law',             icon: '💰', lawyerCount: 154 },
  { id: '9',  name: 'Personal Injury',     icon: '🚑', lawyerCount: 289 },
  { id: '10', name: 'Estate Planning',     icon: '📜', lawyerCount: 201 },
  { id: '11', name: 'Bankruptcy Law',      icon: '📊', lawyerCount: 143 },
  { id: '12', name: 'Environmental Law',   icon: '🌍', lawyerCount: 98  },
]
</script>

<template>
  <section id="practice-areas" class="bg-[#f9f9f6] py-20 md:py-28">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">

      <!-- Header -->
      <div class="text-center mb-12">
        <motion.p
          :initial="{ opacity: 0, y: 10 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.4 }"
          class="text-xs font-semibold uppercase tracking-widest text-[#1d6b44] mb-3"
        >Browse by Specialty</motion.p>
        <motion.h2
          :initial="{ opacity: 0, y: 14 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: 0.06 }"
          class="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight"
        >Practice Areas</motion.h2>
        <motion.p
          :initial="{ opacity: 0, y: 10 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.45, delay: 0.1 }"
          class="text-neutral-500 text-lg max-w-xl mx-auto"
        >
          Find experienced lawyers across a wide range of legal specialties.
        </motion.p>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.button
          v-for="(area, i) in practiceAreas"
          :key="area.id"
          :initial="{ opacity: 0, y: 20 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, margin: '-20px' }"
          :transition="{ duration: 0.38, delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }"
          :whileHover="{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }"
          :whileTap="{ scale: 0.97 }"
          @click="emit('selectArea', area.name)"
          @mouseenter="hoveredId = area.id"
          @mouseleave="hoveredId = null"
          class="group bg-white border border-neutral-200 rounded-xl p-4 flex flex-col items-center text-center cursor-pointer font-[DM_Sans] transition-colors duration-150"
          :class="hoveredId === area.id ? 'border-[#1d6b44]/30' : ''"
        >
          <span class="text-3xl mb-3 leading-none">{{ area.icon }}</span>
          <span class="text-sm font-semibold text-neutral-800 mb-1 leading-snug">{{ area.name }}</span>
          <span class="text-[11px] text-neutral-400 font-medium">{{ area.lawyerCount }} lawyers</span>
        </motion.button>
      </div>
    </div>
  </section>
</template>