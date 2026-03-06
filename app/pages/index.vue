<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useLawyerSearch } from '~/composables/useLawyerSearch'

const isScrolled = ref(false)
const searchExpanded = ref(false)
const { updatePracticeArea } = useLawyerSearch()

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

const handlePracticeAreaSelect = (areaName: string) => {
  updatePracticeArea(areaName)
  const heroSection = document.getElementById('hero')
  if (heroSection) {
    heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleToggleExpanded = () => {
  searchExpanded.value = !searchExpanded.value
}

const handleSearch = (data: { practiceArea: string | null; location: string | null; consultationType: string | null }) => {
  console.log('Search submitted:', data)
  // Future: Navigate to results page or filter lawyers
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div>
    <!-- NavigationBar with transparency control based on scroll state -->
    <NavigationBar :transparent="!isScrolled" />
    
    <!-- HeroSection passes isScrolled to LawyerSearch component -->
    <HeroSection 
      id="hero" 
      :is-scrolled="isScrolled" 
      :search-expanded="searchExpanded"
      @toggle-expanded="handleToggleExpanded"
      @search="handleSearch"
    />
    
    <!-- Section IDs for smooth scroll navigation -->
    <HowItWorksSection id="how-it-works" />
    <FeaturedLawyersSection id="find-lawyers" />
    
    <!-- Practice area selection connected to search component -->
    <PracticeAreasSection id="practice-areas" @select-area="handlePracticeAreaSelect" />
    
    <ForLawyersSection id="for-lawyers" />
    <FooterSection />
  </div>
</template>
