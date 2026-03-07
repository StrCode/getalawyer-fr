<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLawyerFilters } from '~/composables/useLawyerFilters'
import { usePagination } from '~/composables/usePagination'
import type { Lawyer } from '~/types/lawyer'

// Page metadata
useHead({
  title: 'Find Lawyers - LexConnect',
  meta: [
    { name: 'description', content: 'Search and find qualified lawyers by practice area, location, and consultation type.' }
  ]
})

// Composables
const { filters, resetFilters, filtersFromQuery, filtersToQuery } = useLawyerFilters()
const route = useRoute()
const router = useRouter()

// State
const loading = ref(false)
const lawyers = ref<Lawyer[]>([])
const totalItems = ref(0)
const isMobileFiltersOpen = ref(false)
const isMobile = ref(false)

// Check if mobile on mount
onMounted(() => {
  filters.value = filtersFromQuery(route.query)
  
  // Check screen size
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Cleanup
  return () => window.removeEventListener('resize', checkMobile)
})

// Pagination
const { currentPage, totalPages, itemsPerPage } = usePagination({
  itemsPerPage: 12,
  totalItems
})

// Practice areas
const practiceAreas = [
  { name: 'Corporate Law', slug: 'corporate-law' },
  { name: 'Family Law', slug: 'family-law' },
  { name: 'Criminal Defense', slug: 'criminal-defense' },
  { name: 'Real Estate Law', slug: 'real-estate-law' },
  { name: 'Immigration Law', slug: 'immigration-law' },
  { name: 'Intellectual Property', slug: 'intellectual-property' },
  { name: 'Employment Law', slug: 'employment-law' },
  { name: 'Tax Law', slug: 'tax-law' },
  { name: 'Personal Injury', slug: 'personal-injury' },
  { name: 'Estate Planning', slug: 'estate-planning' }
]

// Data fetching
const fetchLawyers = async () => {
  loading.value = true
  
  try {
    // Mock data
    const mockLawyers: Lawyer[] = [
      {
        id: '1',
        name: 'Carina R.',
        verified: true,
        specialty: 'Family Law',
        practiceAreas: ['Family Law', 'Divorce'],
        location: 'Menlo Park, CA 94025',
        yearsExperience: 6,
        rating: 4.8,
        reviewCount: 12,
        consultationTypes: ['video', 'phone'],
        priceRange: { min: 34, max: 50 },
        bio: 'Nurturing children comes naturally to me, and I have six years of experience providing attentive care. My approach focuses on creating a safe and engaging environment.',
        certifications: ['board-certified'],
        languages: ['spanish']
      },
      {
        id: '2',
        name: 'Aura Z.',
        verified: true,
        specialty: 'Corporate Law',
        practiceAreas: ['Corporate Law', 'M&A'],
        location: 'Menlo Park, CA 94025',
        yearsExperience: 3,
        rating: 4.5,
        consultationTypes: ['video', 'in-person'],
        priceRange: { min: 35, max: 60 },
        bio: 'I am a very responsible and committed person, respectful, patient, lovely, honest, kind and caring person.',
        certifications: [],
        languages: []
      }
    ]
    
    lawyers.value = mockLawyers
    totalItems.value = mockLawyers.length
  } catch (err) {
    console.error('Error fetching lawyers:', err)
    lawyers.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// Watch for filter changes
watch([filters, currentPage], () => {
  fetchLawyers()
  const query = filtersToQuery(filters.value)
  router.push({ query })
}, { deep: true, immediate: true })

// Active filter count
const activeFilterCount = computed(() => {
  const f = filters.value
  let count = 0
  if (f.keywords) count++
  if (f.lawyerName) count++
  if (f.practiceAreas.length > 0) count++
  if (f.location) count++
  if (f.consultationTypes.length > 0) count++
  if (f.minRating) count++
  if (f.minExperience) count++
  if (f.priceRange.min || f.priceRange.max) count++
  if (f.certifications.length > 0) count++
  if (f.languages.length > 0) count++
  return count
})

const handleSearch = (searchData: any) => {
  console.log('Search:', searchData)
  // Handle search logic here
}
</script>

<template>
  <div class="page-wrapper">
    <!-- Navigation Bar -->
    <NavigationBar />
    
    <!-- Search Bar -->
    <LawyerSearchBar @search="handleSearch" />
    
    <!-- Main Content -->
    <div class="main-container">
      <div class="content-grid">
        <!-- Filters Sidebar (Desktop) -->
        <aside v-if="!isMobile" class="filters-sidebar">
          <FilterPanel
            v-model="filters"
            :practice-areas="practiceAreas"
            :loading="loading"
            @reset="resetFilters"
          />
        </aside>
        
        <!-- Mobile Filter Drawer -->
        <FilterPanel
          v-if="isMobile"
          v-model="filters"
          :practice-areas="practiceAreas"
          :loading="loading"
          :is-mobile="true"
          :is-open="isMobileFiltersOpen"
          @reset="resetFilters"
          @close="isMobileFiltersOpen = false"
        />
        
        <!-- Results Section -->
        <main class="results-section">
          <!-- Results Header -->
          <div class="results-header">
            <div class="header-left">
              <!-- Mobile Filter Button -->
              <button v-if="isMobile" class="mobile-filter-btn" @click="isMobileFiltersOpen = true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M3 6h18M7 12h10M11 18h2"/>
                </svg>
                Filters ({{ activeFilterCount }})
              </button>
              
              <div v-if="filters.keywords" class="active-filter-tag">
                Keyword Search: {{ filters.keywords }}
                <button class="tag-close" @click="filters.keywords = ''">&times;</button>
              </div>
            </div>
            
            <div class="header-right">
              <button class="sort-button">
                Recommended
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              
              <button class="save-search-button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Save search
              </button>
            </div>
          </div>
          
          <!-- Lawyer Cards -->
          <div v-if="loading" class="loading-state">
            <div v-for="i in 3" :key="i" class="skeleton-card"></div>
          </div>
          
          <div v-else-if="lawyers.length === 0" class="empty-state">
            <EmptyState
              title="No lawyers found"
              description="Try adjusting your filters to find more results."
              action-text="Reset Filters"
              @action="resetFilters"
            />
          </div>
          
          <div v-else class="cards-list">
            <LawyerCard
              v-for="lawyer in lawyers"
              :key="lawyer.id"
              :lawyer="lawyer"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: #f9f9f6;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 32px;
}

@media (max-width: 768px) {
  .main-container {
    padding: 16px;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 28px;
  align-items: start;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.filters-sidebar {
  position: sticky;
  top: 120px; /* Adjusted for nav + search bar */
}

.results-section {
  min-width: 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.mobile-filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 50px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.mobile-filter-btn:hover {
  background: #f9f9f6;
}

.active-filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f2f2f2;
  border-radius: 50px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}

.tag-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #888;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.header-right {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 50px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  font-family: inherit;
}

.save-search-button {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: inherit;
}

.save-search-button:hover {
  background: #f2f2f2;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  height: 200px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.empty-state {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
}

@media (max-width: 640px) {
  .empty-state {
    padding: 32px 16px;
  }
}
</style>
