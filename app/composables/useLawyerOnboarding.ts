import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'

// --- Types ---

export type OnboardingState =
    | 'not_started'
    | 'personal_info'
    | 'nin_verification'
    | 'professional_info'
    | 'practice_info'
    | 'review'
    | 'submitted'
    | 'approved'
    | 'rejected'

export interface OnboardingStatus {
    currentState: OnboardingState
    completedSteps: OnboardingState[]
    stepNumber: number
    startedAt: string
    lastActivityAt: string
}

export interface OnboardingSummary {
    status: OnboardingStatus
    personal?: any
    professional?: any
    practice?: any
    ninVerification?: {
        verified: boolean
        verifiedAt: string
    }
}

export interface PersonalInfoData {
    firstName: string
    lastName: string
    middleName?: string
    dateOfBirth: string // ISO 8601 datetime format with timezone
    gender: 'male' | 'female' | 'other'
    country: string
    state: string
    lga: string
    city: string
    address: string
    phoneNumber: string
}

export interface NinSubmitData {
    nin: string
    consent: boolean
}

export interface NinSubmitResponse {
    success: boolean
    message: string
}

export interface ProfessionalInfoData {
    barNumber: string
    yearOfCall: number
    lawSchool: string
    graduationYear: number
    university: string
    llbYear: number
}

export interface PracticeInfoData {
    firmName: string
    officeAddress: {
        street: string
        city: string
        state: string
        postalCode: string
    }
    statesOfPractice: string[]
    practiceAreas: string[]
}

export interface SubmitResponse {
    success: boolean
    message: string
}

// --- API Client Methods ---

const lawyerOnboardingAPI = {
    getStatus: async (): Promise<OnboardingStatus> => {
        const res = await httpClient.get<any>('/api/onboarding/status')
        return res.data || res
    },

    getSummary: async (): Promise<OnboardingSummary> => {
        const res = await httpClient.get<any>('/api/onboarding/summary')
        return res.data || res
    },

    startOnboarding: async (): Promise<any> => {
        const res = await httpClient.post<any>('/api/onboarding/start')
        return res.data || res
    },

    savePersonalInfo: async (data: PersonalInfoData) => {
        return await httpClient.put('/api/onboarding/steps/personal-info', data)
    },

    saveNin: async (data: NinSubmitData): Promise<NinSubmitResponse> => {
        const res = await httpClient.put<any>('/api/onboarding/steps/nin', data)
        return res.data || res
    },

    saveProfessionalInfo: async (data: ProfessionalInfoData) => {
        return await httpClient.put('/api/onboarding/steps/professional-info', data)
    },

    savePracticeInfo: async (data: PracticeInfoData) => {
        return await httpClient.put('/api/onboarding/steps/practice-info', data)
    },

    submitOnboarding: async (): Promise<SubmitResponse> => {
        const res = await httpClient.post<any>('/api/onboarding/submit', { confirmSubmission: true })
        return res.data || res
    }
}

// --- Composable ---

export const useLawyerOnboarding = () => {
    const queryClient = useQueryClient()

    // Queries
    const useStatus = (options?: { enabled?: any }) => {
        return useQuery({
            queryKey: ['lawyer', 'onboarding', 'status'],
            queryFn: lawyerOnboardingAPI.getStatus,
            enabled: options?.enabled !== undefined ? options.enabled : process.client, // Only fetch on client
        })
    }

    const useSummary = (options?: { enabled?: any }) => {
        return useQuery({
            queryKey: ['lawyer', 'onboarding', 'summary'],
            queryFn: lawyerOnboardingAPI.getSummary,
            enabled: options?.enabled !== undefined ? options.enabled : process.client,
        })
    }

    // Mutations
    const useStartOnboarding = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.startOnboarding,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'status'] })
            }
        })
    }

    const useSavePersonalInfo = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.savePersonalInfo,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'status'] })
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'summary'] })
            }
        })
    }

    const useSaveNin = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.saveNin,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'status'] })
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'summary'] })
            }
        })
    }

    const useSaveProfessionalInfo = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.saveProfessionalInfo,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'status'] })
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'summary'] })
            }
        })
    }

    const useSavePracticeInfo = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.savePracticeInfo,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'status'] })
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'summary'] })
            }
        })
    }

    const useSubmitOnboarding = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.submitOnboarding,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'status'] })
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'summary'] })
                // Invalidate session/profile so application status gets refreshed
                queryClient.invalidateQueries({ queryKey: ['user', 'session'] })
                queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.all })
            }
        })
    }

    return {
        useStatus,
        useSummary,
        useStartOnboarding,
        useSavePersonalInfo,
        useSaveNin,
        useSaveProfessionalInfo,
        useSavePracticeInfo,
        useSubmitOnboarding,
    }
}
