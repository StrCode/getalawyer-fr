/**
 * Client Onboarding composable with TanStack Query
 * Manages client onboarding flow (2 steps)
 */

import { useQuery } from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'

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
  code2: string
  code3: string
  name: string
  capital: string
  region: string
  subregion: string
  states: Array<{ code: string; name: string; subdivision: any }>
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

/** Plain POST — safe from Pinia (no vue-query hooks). Invalidate session/profile in the wizard via `useQueryClient()`. */
export async function completeClientOnboarding(
  data: OnboardingData,
): Promise<CompleteOnboardingResponse> {
  return await clientOnboardingAPI.completeOnboarding(data)
}

// Composable
export const useClientOnboarding = () => {
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

  return {
    useCountries,
    useSpecializations,
  }
}
