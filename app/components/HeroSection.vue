<script setup lang="ts">
import { motion } from 'motion-v'
import LawyerSearch from './LawyerSearch.vue'
import { useLawyerSearch } from '~/composables/useLawyerSearch'
import { useReducedMotion, getTransition } from '~/composables/useReducedMotion'

// Props interface
interface HeroSectionProps {
  isScrolled?: boolean
  searchExpanded?: boolean
}

// Define props with defaults
const props = withDefaults(defineProps<HeroSectionProps>(), {
  isScrolled: false,
  searchExpanded: false
})

// Define emits
const emit = defineEmits<{
  search: [data: { practiceArea: string | null; location: string | null; consultationType: string | null }]
  toggleExpanded: []
  quickSearchTag: [tag: string]
}>()

// Use the composable to update search state
const { updatePracticeArea } = useLawyerSearch()

// Use reduced motion composable
const { prefersReducedMotion } = useReducedMotion()

// Quick search tags for common legal needs
const quickSearchTags = [
  'Family Law',
  'Criminal Defense',
  'Real Estate Law',
  'Immigration Law',
  'Corporate Law'
]

// Platform statistics
const statistics = [
  { value: '2,500+', label: 'Verified Lawyers' },
  { value: '50+', label: 'Practice Areas' },
  { value: '10,000+', label: 'Consultations Booked' },
  { value: '4.8', label: 'Average Rating' }
]

// Handle quick search tag click
const handleQuickSearchTag = (tag: string) => {
  updatePracticeArea(tag)
  emit('quickSearchTag', tag)
}

// Handle search event from LawyerSearch component
const handleSearch = (data: { practiceArea: string | null; location: string | null; consultationType: string | null }) => {
  emit('search', data)
}

// Handle toggle expanded event
const handleToggleExpanded = () => {
  emit('toggleExpanded')
}
</script>

<template>
  <section class="hero-section">
    <!-- Gradient overlay -->
    <div class="hero-overlay" />
    
    <!-- Hero content -->
    <div class="hero-content">
      <!-- Main heading with fade-up animation -->
      <motion.h1
        class="hero-heading"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="getTransition(prefersReducedMotion, { duration: 0.6, delay: 0.1 })"
      >
        Find the Right Lawyer
      </motion.h1>

      <!-- Subtitle with fade-up animation -->
      <motion.p
        class="hero-subtitle"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="getTransition(prefersReducedMotion, { duration: 0.6, delay: 0.2 })"
      >
        Connect with verified legal professionals for video, phone, or in-person consultations
      </motion.p>

      <!-- Search component with fade-up animation -->
      <motion.div
        class="hero-search"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="getTransition(prefersReducedMotion, { duration: 0.6, delay: 0.3 })"
      >
        <LawyerSearch
          :is-scrolled="isScrolled"
          :search-expanded="searchExpanded"
          @search="handleSearch"
          @toggle-expanded="handleToggleExpanded"
        />
      </motion.div>

      <!-- Quick search tags with fade-up animation -->
      <motion.div
        class="quick-search-tags"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="getTransition(prefersReducedMotion, { duration: 0.6, delay: 0.4 })"
      >
        <span class="tags-label">Popular searches:</span>
        <button
          v-for="tag in quickSearchTags"
          :key="tag"
          type="button"
          class="quick-tag"
          @click="handleQuickSearchTag(tag)"
        >
          {{ tag }}
        </button>
      </motion.div>

      <!-- Verified badge with fade-up animation -->
      <motion.div
        class="verified-badge"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="getTransition(prefersReducedMotion, { duration: 0.6, delay: 0.5 })"
      >
        <svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Verified Legal Professionals</span>
      </motion.div>

      <!-- Platform statistics with fade-up animation -->
      <motion.div
        class="platform-statistics"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="getTransition(prefersReducedMotion, { duration: 0.6, delay: 0.6 })"
      >
        <div
          v-for="(stat, index) in statistics"
          :key="index"
          class="stat-item"
        >
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </motion.div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f2744;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 39, 68, 0.95) 0%, rgba(15, 39, 68, 0.85) 50%, rgba(201, 168, 76, 0.1) 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  text-align: center;
}

.hero-heading {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-search {
  margin-bottom: 2rem;
}

.quick-search-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.tags-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.quick-tag {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.quick-tag:hover {
  background: rgba(201, 168, 76, 0.2);
  border-color: #c9a84c;
  transform: translateY(-2px);
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(201, 168, 76, 0.15);
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: 9999px;
  margin-bottom: 3rem;
  backdrop-filter: blur(8px);
}

.badge-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #c9a84c;
}

.verified-badge span {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: white;
  font-weight: 600;
}

.platform-statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  color: #c9a84c;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-section {
    min-height: 100svh; /* Use svh for better mobile support */
  }

  .hero-content {
    padding: 0 1.5rem;
  }

  .hero-heading {
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    margin-bottom: 2rem;
  }

  .quick-search-tags {
    flex-direction: column;
    gap: 0.5rem;
  }

  .tags-label {
    width: 100%;
    text-align: center;
  }

  .platform-statistics {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }
}
</style>
