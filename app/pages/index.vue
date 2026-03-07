<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useLawyerSearch } from '~/composables/useLawyerSearch'

const isScrolled = ref(false)
const searchExpanded = ref(false)
const { updatePracticeArea } = useLawyerSearch()

// Throttled scroll handler
let ticking = false
const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      isScrolled.value = window.scrollY > 80
      ticking = false
    })
    ticking = true
  }
}

const handlePracticeAreaSelect = (areaName: string) => {
  updatePracticeArea(areaName)
  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const handleSearch = (data: {
  practiceArea: string | null
  location: string | null
  consultationType: string | null
}) => {
  // Future: navigate to /search?area=...&location=...
  console.log('Search:', data)
}

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <div class="">

    <HeroSection
      id="hero"
      :is-scrolled="isScrolled"
      :search-expanded="searchExpanded"
      @toggle-expanded="searchExpanded = !searchExpanded"
      @search="handleSearch"
    />

    <HowItWorksSection id="how-it-works" />

    <FeaturedLawyersSection id="find-lawyers" />

    <PracticeAreasSection
      id="practice-areas"
      @select-area="handlePracticeAreaSelect"
    />

    <ForLawyersSection id="for-lawyers" />

    <FooterSection />
  </div>
</template>