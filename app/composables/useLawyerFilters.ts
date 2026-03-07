import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import type { FilterState } from '~/types/filter'
import type { LocationQuery } from 'vue-router'
import { validateQueryParams } from '~/utils/validation'

export interface UseLawyerFiltersReturn {
  filters: Ref<FilterState>
  updateFilter: (key: keyof FilterState, value: any) => void
  resetFilters: () => void
  applyFilters: () => void
  filtersFromQuery: (query: LocationQuery) => FilterState
  filtersToQuery: (filters: FilterState) => LocationQuery
}

const defaultFilters = (): FilterState => ({
  practiceAreas: [],
  location: '',
  consultationTypes: [],
  minRating: null,
  minExperience: null,
  priceRange: {
    min: null,
    max: null
  },
  keywords: '',
  lawyerName: '',
  certifications: [],
  languages: []
})

export function filtersToQuery(filters: FilterState): LocationQuery {
  const query: LocationQuery = {}
  
  if (filters.practiceAreas.length > 0) {
    query.areas = filters.practiceAreas.join(',')
  }
  
  if (filters.location) {
    query.location = filters.location
  }
  
  if (filters.consultationTypes.length > 0) {
    query.types = filters.consultationTypes.join(',')
  }
  
  if (filters.minRating !== null) {
    query.rating = filters.minRating.toString()
  }
  
  if (filters.minExperience !== null) {
    query.experience = filters.minExperience.toString()
  }
  
  if (filters.priceRange.min !== null) {
    query.priceMin = filters.priceRange.min.toString()
  }
  
  if (filters.priceRange.max !== null) {
    query.priceMax = filters.priceRange.max.toString()
  }
  
  if (filters.keywords) {
    query.keywords = filters.keywords
  }
  
  if (filters.lawyerName) {
    query.name = filters.lawyerName
  }
  
  if (filters.certifications && filters.certifications.length > 0) {
    query.certifications = filters.certifications.join(',')
  }
  
  if (filters.languages && filters.languages.length > 0) {
    query.languages = filters.languages.join(',')
  }
  
  return query
}

export function filtersFromQuery(query: LocationQuery): FilterState {
  // Validate query parameters first
  const validation = validateQueryParams(query)
  
  // If validation fails, log errors and use default values for invalid fields
  if (!validation.valid) {
    console.warn('Invalid query parameters detected:', validation.errors)
  }
  
  // Parse rating with validation
  let minRating: number | null = null
  if (query.rating) {
    const rating = Number(query.rating)
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      minRating = rating
    }
  }
  
  // Parse experience with validation
  let minExperience: number | null = null
  if (query.experience) {
    const experience = Number(query.experience)
    if (!isNaN(experience) && experience >= 0 && experience <= 50) {
      minExperience = experience
    }
  }
  
  // Parse price range with validation
  let priceMin: number | null = null
  let priceMax: number | null = null
  
  if (query.priceMin) {
    const min = Number(query.priceMin)
    if (!isNaN(min) && min >= 0) {
      priceMin = min
    }
  }
  
  if (query.priceMax) {
    const max = Number(query.priceMax)
    if (!isNaN(max) && max >= 0) {
      priceMax = max
    }
  }
  
  // Ensure price range consistency
  if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
    console.warn('Invalid price range: minimum exceeds maximum, ignoring both')
    priceMin = null
    priceMax = null
  }
  
  // Parse consultation types with validation
  const validTypes = ['video', 'phone', 'in-person']
  const consultationTypes = query.types 
    ? String(query.types).split(',').filter(type => validTypes.includes(type)) as any[]
    : []
  
  return {
    practiceAreas: query.areas ? String(query.areas).split(',').filter(Boolean) : [],
    location: query.location ? String(query.location) : '',
    consultationTypes,
    minRating,
    minExperience,
    priceRange: {
      min: priceMin,
      max: priceMax
    },
    keywords: query.keywords ? String(query.keywords) : '',
    lawyerName: query.name ? String(query.name) : '',
    certifications: query.certifications ? String(query.certifications).split(',').map(s => s.trim()).filter(Boolean) : [],
    languages: query.languages ? String(query.languages).split(',').map(s => s.trim()).filter(Boolean) : []
  }
}

export function useLawyerFilters(): UseLawyerFiltersReturn {
  const router = useRouter()
  const route = useRoute()
  
  const filters = ref<FilterState>(filtersFromQuery(route.query))
  
  const updateURL = useDebounceFn((filterState: FilterState) => {
    const query = filtersToQuery(filterState)
    router.push({ query })
  }, 500)
  
  const updateFilter = (key: keyof FilterState, value: any) => {
    filters.value = { ...filters.value, [key]: value }
  }
  
  const resetFilters = () => {
    filters.value = defaultFilters()
  }
  
  const applyFilters = () => {
    updateURL(filters.value)
  }
  
  watch(filters, (newFilters) => {
    updateURL(newFilters)
  }, { deep: true })
  
  watch(() => route.query, (newQuery) => {
    filters.value = filtersFromQuery(newQuery)
  })
  
  return {
    filters,
    updateFilter,
    resetFilters,
    applyFilters,
    filtersFromQuery,
    filtersToQuery
  }
}
