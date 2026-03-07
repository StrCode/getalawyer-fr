/**
 * Client Onboarding composable with TanStack Query
 * Manages client onboarding flow (2 steps)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'

interface OnboardingData {
  country: string
  state: string
  specializationIds: string[]
}

interface CompleteOnboardingResponse {
  success: boolean
  message?: string
}

interface Country {
  code: string
  name: string
  states: Array<{ code: string; name: string }>
}

interface Specialization {
  id: string
  name: string
  description: string
}

// API functions
const clientOnboardingAPI = {
  completeOnboarding: async (data: OnboardingData): Promise<CompleteOnboardingResponse> => {
    return await httpClient.post<CompleteOnboardingResponse>(
      '/api/clients/onboarding/complete',
      data
    )
  },
  
  getCountries: async (): Promise<{ data: Country[] }> => {
    return await httpClient.get<{ data: Country[] }>('/api/countries')
  },
  
  getSpecializations: async (): Promise<{ specializations: Specialization[] }> => {
    return await httpClient.get<{ specializations: Specialization[] }>('/api/specializations')
  },
}

// Composable
export const useClientOnboarding = () => {
  const queryClient = useQueryClient()

  // Query: Get countries
  const useCountries = () => {
    return useQuery({
      queryKey: ['countries'],
      queryFn: clientOnboardingAPI.getCountries,
      staleTime: 1000 * 60 * 60, // 1 hour - countries don't change often
      enabled: process.client, // Only run on client side
    })
  }

  // Query: Get specializations
  const useSpecializations = () => {
    return useQuery({
      queryKey: ['specializations'],
      queryFn: clientOnboardingAPI.getSpecializations,
      staleTime: 1000 * 60 * 30, // 30 minutes
      enabled: process.client, // Only run on client side
    })
  }

  // Mutation: Complete onboarding
  const useCompleteOnboarding = () => {
    return useMutation({
      mutationFn: clientOnboardingAPI.completeOnboarding,
      onSuccess: () => {
        // Invalidate user session to refresh onboarding_completed flag
        queryClient.invalidateQueries({ queryKey: ['user', 'session'] })
        queryClient.invalidateQueries({ queryKey: queryKeys.client.profile })
      },
    })
  }

  return {
    useCountries,
    useSpecializations,
    useCompleteOnboarding,
  }
}
