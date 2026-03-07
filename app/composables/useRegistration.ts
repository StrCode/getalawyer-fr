/**
 * Registration composable with TanStack Query
 * Manages lawyer registration flow (6 steps)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient, type ApiResponse } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import type {
  PersonalInfoFormData,
  PersonalInfoResponse,
  NINVerificationResponse,
  NINConfirmationResponse,
  ProfessionalInfoFormData,
  ProfessionalInfoResponse,
  PracticeInfoFormData,
  PracticeInfoResponse,
  RegistrationSummaryResponse,
  SubmitApplicationResponse,
  RegistrationStatusResponse,
} from '~/types'

// API functions
const registrationAPI = {
  // Step 2: Personal Information
  getPersonalInfo: async (): Promise<PersonalInfoFormData | null> => {
    const response = await httpClient.getAuth<ApiResponse<PersonalInfoFormData | null>>(
      '/api/register/step2'
    )
    return response.data ?? null
  },

  savePersonalInfo: async (data: PersonalInfoFormData): Promise<PersonalInfoResponse> => {
    return await httpClient.post<PersonalInfoResponse>('/api/register/step2', data)
  },

  // Step 3: NIN Verification
  verifyNIN: async (nin: string, consent: boolean): Promise<NINVerificationResponse> => {
    return await httpClient.post<NINVerificationResponse>('/api/register/step3/verify-nin', {
      nin,
      consent,
    })
  },

  confirmNIN: async (confirmed: boolean): Promise<NINConfirmationResponse> => {
    return await httpClient.post<NINConfirmationResponse>('/api/register/step3/confirm', {
      confirmed,
    })
  },

  // Step 4: Professional Information
  getProfessionalInfo: async (): Promise<ProfessionalInfoFormData | null> => {
    const response = await httpClient.getAuth<ApiResponse<ProfessionalInfoFormData | null>>(
      '/api/register/step4'
    )
    return response.data ?? null
  },

  saveProfessionalInfo: async (
    data: ProfessionalInfoFormData
  ): Promise<ProfessionalInfoResponse> => {
    return await httpClient.post<ProfessionalInfoResponse>('/api/register/step4', data)
  },

  // Step 5: Practice Information
  getPracticeInfo: async (): Promise<PracticeInfoFormData | null> => {
    const response = await httpClient.getAuth<ApiResponse<PracticeInfoFormData | null>>(
      '/api/register/step5'
    )
    return response.data ?? null
  },

  savePracticeInfo: async (data: PracticeInfoFormData): Promise<PracticeInfoResponse> => {
    const payload = {
      ...data,
      ...(data.practiceType === 'solo' && { firmName: undefined }),
    }

    return await httpClient.post<PracticeInfoResponse>('/api/register/step5', payload)
  },

  // Step 7: Review & Submit
  getRegistrationSummary: async (): Promise<RegistrationSummaryResponse> => {
    return await httpClient.getAuth<RegistrationSummaryResponse>('/api/register/summary')
  },

  submitApplication: async (): Promise<SubmitApplicationResponse> => {
    return await httpClient.post<SubmitApplicationResponse>('/api/register/submit')
  },

  // Status Management
  getRegistrationStatus: async (): Promise<RegistrationStatusResponse> => {
    return await httpClient.getAuth<RegistrationStatusResponse>('/api/register/status')
  },
}

// Composable
export const useRegistration = () => {
  const queryClient = useQueryClient()

  // Query: Get registration status
  const useRegistrationStatus = () => {
    return useQuery({
      queryKey: queryKeys.registration.status,
      queryFn: registrationAPI.getRegistrationStatus,
      staleTime: 1 * 60 * 1000, // 1 minute
    })
  }

  // Query: Get personal info (Step 2)
  const usePersonalInfo = () => {
    return useQuery({
      queryKey: queryKeys.registration.step2,
      queryFn: registrationAPI.getPersonalInfo,
    })
  }

  // Mutation: Save personal info (Step 2)
  const useSavePersonalInfo = () => {
    return useMutation({
      mutationFn: registrationAPI.savePersonalInfo,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.registration.step2 })
        queryClient.invalidateQueries({ queryKey: queryKeys.registration.status })
      },
    })
  }

  // Mutation: Verify NIN (Step 3)
  const useVerifyNIN = () => {
    return useMutation({
      mutationFn: ({ nin, consent }: { nin: string; consent: boolean }) =>
        registrationAPI.verifyNIN(nin, consent),
    })
  }

  // Mutation: Confirm NIN (Step 3)
  const useConfirmNIN = () => {
    return useMutation({
      mutationFn: registrationAPI.confirmNIN,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.registration.status })
      },
    })
  }

  // Query: Get professional info (Step 4)
  const useProfessionalInfo = () => {
    return useQuery({
      queryKey: queryKeys.registration.step4,
      queryFn: registrationAPI.getProfessionalInfo,
    })
  }

  // Mutation: Save professional info (Step 4)
  const useSaveProfessionalInfo = () => {
    return useMutation({
      mutationFn: registrationAPI.saveProfessionalInfo,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.registration.step4 })
        queryClient.invalidateQueries({ queryKey: queryKeys.registration.status })
      },
    })
  }

  // Query: Get practice info (Step 5)
  const usePracticeInfo = () => {
    return useQuery({
      queryKey: queryKeys.registration.step5,
      queryFn: registrationAPI.getPracticeInfo,
    })
  }

  // Mutation: Save practice info (Step 5)
  const useSavePracticeInfo = () => {
    return useMutation({
      mutationFn: registrationAPI.savePracticeInfo,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.registration.step5 })
        queryClient.invalidateQueries({ queryKey: queryKeys.registration.status })
      },
    })
  }

  // Query: Get registration summary (Step 7)
  const useRegistrationSummary = () => {
    return useQuery({
      queryKey: queryKeys.registration.summary,
      queryFn: registrationAPI.getRegistrationSummary,
    })
  }

  // Mutation: Submit application (Step 7)
  const useSubmitApplication = () => {
    return useMutation({
      mutationFn: registrationAPI.submitApplication,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.registration.status })
        queryClient.invalidateQueries({ queryKey: queryKeys.registration })
      },
    })
  }

  return {
    // Queries
    useRegistrationStatus,
    usePersonalInfo,
    useProfessionalInfo,
    usePracticeInfo,
    useRegistrationSummary,
    // Mutations
    useSavePersonalInfo,
    useVerifyNIN,
    useConfirmNIN,
    useSaveProfessionalInfo,
    useSavePracticeInfo,
    useSubmitApplication,
  }
}
