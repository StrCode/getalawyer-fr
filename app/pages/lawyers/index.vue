<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLawyerFilters } from '~/composables/useLawyerFilters'
import { usePagination } from '~/composables/usePagination'
import { useLawyers } from '~/composables/useLawyers'
import type { Lawyer } from '~/types/lawyer'

// Page metadata
useHead({
  title: 'Find Lawyers - Getalawyer',
  meta: [
    { name: 'description', content: 'Search and find qualified lawyers by practice area, location, and consultation type.' }
  ]
})

// Composables
const { filters, resetFilters, filtersFromQuery, filtersToQuery } = useLawyerFilters()
const route = useRoute()
const router = useRouter()
const { useLawyersList } = useLawyers()

// State
const isMobileFiltersOpen = ref(false)
const isMobile = ref(false)
const totalItems = ref(0)

// Pagination - must be declared before searchParams
const { currentPage, totalPages, itemsPerPage } = usePagination({
  itemsPerPage: 12,
  totalItems
})

// Initialize filters from query params
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

// Build search params from filters
const searchParams = computed(() => {
  const params: any = {}
  
  if (filters.value.keywords) params.q = filters.value.keywords
  if (filters.value.location) params.state = filters.value.location
  if (filters.value.practiceAreas.length > 0) params.specializations = filters.value.practiceAreas
  if (filters.value.minExperience) params.minExperience = filters.value.minExperience
  if (filters.value.priceRange.max) params.maxExperience = filters.value.priceRange.max
  if (currentPage.value > 1) params.page = currentPage.value
  params.limit = itemsPerPage.value
  
  // Set sort by
  if (filters.value.keywords) {
    params.sortBy = 'relevance'
  } else {
    params.sortBy = 'experience'
  }
  
  return params
})

// Fetch lawyers using TanStack Query
const { data: lawyersData, isLoading, error } = useLawyersList(searchParams)

// Extract lawyers and pagination from response
const lawyers = computed(() => {
  if (!lawyersData.value?.results) return []
  return lawyersData.value.results
})

const pagination = computed(() => lawyersData.value?.pagination)
const availableFilters = computed(() => lawyersData.value?.filters)

// Update total items when data changes
watch(pagination, (newPagination) => {
  if (newPagination) {
    totalItems.value = newPagination.total
  }
}, { immediate: true })

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

// Watch for filter changes and update URL
watch([filters, currentPage], () => {
  const query = filtersToQuery(filters.value)
  router.push({ query })
}, { deep: true })

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
</script>

<template>
  <div class="page-wrapper">
    <!-- Navigation Bar -->
    <AppHeader />
    
    <!-- Page Header -->
    <div class="page-header">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find Your Lawyer</h1>
        <p class="text-lg text-gray-600 max-w-2xl">
          Connect with qualified legal professionals across Nigeria. Search by practice area, location, and expertise.
        </p>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="main-container">
      <div class="content-grid">
        <!-- Filters Sidebar (Desktop) -->
        <aside v-if="!isMobile" class="filters-sidebar">
          <FilterPanel
            v-model="filters"
            :practice-areas="practiceAreas"
            :loading="isLoading"
            @reset="resetFilters"
          />
        </aside>
        
        <!-- Mobile Filter Drawer -->
        <FilterPanel
          v-if="isMobile"
          v-model="filters"
          :practice-areas="practiceAreas"
          :loading="isLoading"
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
              
              <!-- Results Count -->
              <div v-if="pagination" class="results-count">
                Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} lawyers
              </div>
              
              <div v-if="filters.keywords" class="active-filter-tag">
                Keyword Search: {{ filters.keywords }}
                <button class="tag-close" @click="filters.keywords = ''">&times;</button>
              </div>
            </div>
            
            <div class="header-right">
              <button class="sort-button">
                {{ searchParams.sortBy === 'relevance' ? 'Most Relevant' : searchParams.sortBy === 'experience' ? 'Most Experienced' : 'Recently Joined' }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Lawyer Cards -->
          <div v-if="isLoading" class="loading-state">
            <div v-for="i in 3" :key="i" class="skeleton-card"></div>
          </div>
          
          <div v-else-if="error" class="empty-state">
            <EmptyState
              title="Error loading lawyers"
              description="There was an error loading the lawyers list. Please try again."
              action-text="Retry"
              @action="() => {}"
            />
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
            <LawyerSearchCard
              v-for="lawyer in lawyers"
              :key="lawyer.id"
              :lawyer="lawyer"
            />
          </div>
          
          <!-- Pagination -->
          <div v-if="pagination && pagination.totalPages > 1" class="pagination">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-heroicons-chevron-left"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Previous
            </UButton>
            
            <div class="page-numbers">
              <button
                v-for="page in Math.min(pagination.totalPages, 5)"
                :key="page"
                class="page-number"
                :class="{ active: page === currentPage }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <span v-if="pagination.totalPages > 5" class="page-ellipsis">...</span>
            </div>
            
            <UButton
              color="neutral"
              variant="outline"
              trailing-icon="i-heroicons-chevron-right"
              :disabled="!pagination.hasMore"
              @click="currentPage++"
            >
              Next
            </UButton>
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

.page-header {
  background: white;
  border-b: 1px solid #e0e0e0;
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
  top: 80px; /* Adjusted for nav only */
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 24px 0;
}

.page-numbers {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-number {
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.page-number:hover {
  background: #f9f9f6;
  border-color: #1d6b44;
}

.page-number.active {
  background: #1d6b44;
  color: white;
  border-color: #1d6b44;
}

.page-ellipsis {
  color: #888;
  font-weight: 600;
}

.results-count {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

@media (max-width: 640px) {
  .empty-state {
    padding: 32px 16px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .page-numbers {
    order: 3;
    width: 100%;
    justify-content: center;
  }
}
</style>
