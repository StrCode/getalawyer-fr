/**
 * Client Onboarding composable with TanStack Query
 * Manages client onboarding flow (2 steps)
 */

import { useQuery } from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'
import { CURRENT_TERMS_VERSION } from '~/lib/legal'

interface OnboardingData {
  country: string
  state: string
  specializationIds: string[]
  termsAccepted: boolean
  termsVersion: string
  refundPolicyAccepted: boolean
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
  states: Array<{ code: string; name: string; subdivision: unknown }>
}

interface Specialization {
  id: string
  name: string
  description: string
}

const clientOnboardingAPI = {
  completeOnboarding: async (data: OnboardingData): Promise<CompleteOnboardingResponse> => {
    return await httpClient.post<CompleteOnboardingResponse>(
      '/api/clients/onboarding/complete',
      data,
    )
  },

  getCountries: async (): Promise<{ data: Country[] }> => {
    return await httpClient.get<{ data: Country[] }>('/api/countries')
  },

  getSpecializations: async (): Promise<{ specializations: Specialization[] }> => {
    return await httpClient.get<{ specializations: Specialization[] }>('/api/specializations')
  },
}

/** Plain POST — safe from Pinia (no vue-query hooks). */
export async function completeClientOnboarding(
  data: Omit<OnboardingData, 'termsVersion'> & { termsVersion?: string },
): Promise<CompleteOnboardingResponse> {
  return await clientOnboardingAPI.completeOnboarding({
    ...data,
    termsVersion: data.termsVersion ?? CURRENT_TERMS_VERSION,
  })
}

export const useClientOnboarding = () => {
  const useCountries = () => {
    return useQuery({
      queryKey: ['countries'],
      queryFn: clientOnboardingAPI.getCountries,
      staleTime: 1000 * 60 * 60,
      enabled: process.client,
    })
  }

  const useSpecializations = () => {
    return useQuery({
      queryKey: ['specializations'],
      queryFn: clientOnboardingAPI.getSpecializations,
      staleTime: 1000 * 60 * 30,
      enabled: process.client,
    })
  }

  return {
    useCountries,
    useSpecializations,
  }
}
