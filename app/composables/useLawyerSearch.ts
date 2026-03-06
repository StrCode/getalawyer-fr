import { ref, readonly } from 'vue'

export type ConsultationType = 'video' | 'phone' | 'in-person'

export interface SearchState {
  practiceArea: string | null
  location: string | null
  consultationType: ConsultationType | null
  isOpen: boolean
  activeSection: 'practice-area' | 'location' | 'consultation-type' | null
}

export const useLawyerSearch = () => {
  const searchState = ref<SearchState>({
    practiceArea: null,
    location: null,
    consultationType: null,
    isOpen: false,
    activeSection: null
  })

  const updatePracticeArea = (area: string) => {
    searchState.value.practiceArea = area
  }

  const updateLocation = (location: string) => {
    searchState.value.location = location
  }

  const updateConsultationType = (type: ConsultationType) => {
    searchState.value.consultationType = type
  }

  const performSearch = () => {
    // Log search data for now since backend isn't implemented
    console.log('Performing search with:', {
      practiceArea: searchState.value.practiceArea,
      location: searchState.value.location,
      consultationType: searchState.value.consultationType
    })
  }

  const resetSearch = () => {
    searchState.value = {
      practiceArea: null,
      location: null,
      consultationType: null,
      isOpen: false,
      activeSection: null
    }
  }

  return {
    searchState: readonly(searchState),
    updatePracticeArea,
    updateLocation,
    updateConsultationType,
    performSearch,
    resetSearch
  }
}
