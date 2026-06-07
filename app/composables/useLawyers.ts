/**
 * Composable for lawyers listing and search
 */

import { useQuery, useInfiniteQuery } from '@tanstack/vue-query'
import { computed, type MaybeRef, unref } from 'vue'
import { api } from '~/lib/api'
import { queryKeys } from '~/lib/query-client'

export interface LawyersSearchParams {
  q?: string
  name?: string
  state?: string
  specializations?: string[]
  minExperience?: number
  maxExperience?: number
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'experience' | 'recent'
}

export const useLawyers = () => {
  // Query: Search lawyers with filters (single page)
  const useLawyersList = (params?: MaybeRef<LawyersSearchParams>) => {
    const searchParams = computed(() => unref(params))
    
    return useQuery({
      queryKey: computed(() => ['lawyers', 'search', searchParams.value]),
      queryFn: () => api.search.lawyers(searchParams.value || {}),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  // Infinite query: load-more directory listing
  const useLawyersInfiniteList = (params?: MaybeRef<Omit<LawyersSearchParams, 'page'>>) => {
    const searchParams = computed(() => unref(params) ?? {})

    return useInfiniteQuery({
      queryKey: computed(() => ['lawyers', 'search', 'infinite', searchParams.value]),
      queryFn: ({ pageParam }) =>
        api.search.lawyers({ ...searchParams.value, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
      staleTime: 5 * 60 * 1000,
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
    useLawyersInfiniteList,
    useLawyerDetail,
    useLawyerPublicProfile,
  }
}
