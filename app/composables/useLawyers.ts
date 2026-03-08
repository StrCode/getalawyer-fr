/**
 * Composable for lawyers listing and search
 */

import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRef, unref } from 'vue'
import { api } from '~/lib/api'
import { queryKeys } from '~/lib/query-client'

export interface LawyersSearchParams {
  q?: string
  state?: string
  specializations?: string[]
  minExperience?: number
  maxExperience?: number
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'experience' | 'recent'
}

export const useLawyers = () => {
  // Query: Search lawyers with filters
  const useLawyersList = (params?: MaybeRef<LawyersSearchParams>) => {
    const searchParams = computed(() => unref(params))
    
    return useQuery({
      queryKey: computed(() => ['lawyers', 'search', searchParams.value]),
      queryFn: () => api.search.lawyers(searchParams.value || {}),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  // Query: Get lawyer by ID
  const useLawyerDetail = (id: MaybeRef<string>) => {
    const lawyerId = computed(() => unref(id))
    
    return useQuery({
      queryKey: computed(() => queryKeys.lawyers.detail(lawyerId.value)),
      queryFn: () => api.lawyer.getById(lawyerId.value),
      enabled: computed(() => !!lawyerId.value),
    })
  }

  // Query: Get public lawyer profile
  const useLawyerPublicProfile = (id: MaybeRef<string>) => {
    const lawyerId = computed(() => unref(id))
    
    return useQuery({
      queryKey: computed(() => queryKeys.lawyers.public(lawyerId.value)),
      queryFn: () => api.lawyer.getPublicProfile(lawyerId.value),
      enabled: computed(() => !!lawyerId.value),
    })
  }

  return {
    useLawyersList,
    useLawyerDetail,
    useLawyerPublicProfile,
  }
}
