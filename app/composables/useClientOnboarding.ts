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

const clientOnboardingAPI = {
  completeOnboarding: async (data: OnboardingData): Promise<CompleteOnboardingResponse> => {
    return await httpClient.post<CompleteOnboardingResponse>(
      '/api/clients/onboarding/complete',
      data,
    )
  },

  getCountries: async (): Promise<{ data: Country[]; count?: number }> => {
    return await httpClient.get<{ data: Country[]; count?: number }>('/api/countries')
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
      enabled: import.meta.client,
    })
  }

  return {
    useCountries,
  }
}
