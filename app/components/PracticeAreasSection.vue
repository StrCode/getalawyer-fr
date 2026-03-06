<script setup lang="ts">
import PracticeAreaCard, { type PracticeArea } from './PracticeAreaCard.vue'

const emit = defineEmits<{
  selectArea: [areaName: string]
}>()

const practiceAreas: PracticeArea[] = [
  { id: '1', name: 'Corporate Law', icon: '🏢', lawyerCount: 245 },
  { id: '2', name: 'Family Law', icon: '👨‍👩‍👧', lawyerCount: 312 },
  { id: '3', name: 'Criminal Defense', icon: '⚖️', lawyerCount: 198 },
  { id: '4', name: 'Real Estate Law', icon: '🏠', lawyerCount: 276 },
  { id: '5', name: 'Immigration Law', icon: '✈️', lawyerCount: 189 },
  { id: '6', name: 'Intellectual Property', icon: '💡', lawyerCount: 167 },
  { id: '7', name: 'Employment Law', icon: '💼', lawyerCount: 223 },
  { id: '8', name: 'Tax Law', icon: '💰', lawyerCount: 154 },
  { id: '9', name: 'Personal Injury', icon: '🚑', lawyerCount: 289 },
  { id: '10', name: 'Estate Planning', icon: '📜', lawyerCount: 201 },
  { id: '11', name: 'Bankruptcy Law', icon: '📊', lawyerCount: 143 },
  { id: '12', name: 'Environmental Law', icon: '🌍', lawyerCount: 98 },
]

const handleAreaSelect = (areaName: string) => {
  emit('selectArea', areaName)
}
</script>

<template>
  <section id="practice-areas" class="bg-gray-50 py-16 md:py-24">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <!-- Section Header -->
      <div class="mb-12 text-center">
        <p class="mb-2 font-semibold text-gold text-sm uppercase tracking-wider">
          Browse by Specialty
        </p>
        <h2 class="mb-4 font-serif font-bold text-navy text-3xl md:text-4xl">
          Practice Areas
        </h2>
        <p class="mx-auto max-w-2xl text-gray-600 text-lg">
          Find experienced lawyers across a wide range of legal specialties
        </p>
      </div>

      <!-- Practice Area Grid -->
      <div class="gap-4 md:gap-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <PracticeAreaCard
          v-for="area in practiceAreas"
          :key="area.id"
          :area="area"
          @select="handleAreaSelect"
        />
      </div>
    </div>
  </section>
</template>
