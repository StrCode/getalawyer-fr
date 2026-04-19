import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import {
    parseLawyerDashboardMe,
    parseOnboardingStatus,
    type LawyerDashboardMePayload,
    type OnboardingStatusPayload
} from '~/lib/lawyerOnboardingStatus'

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

export interface PropertyDraftResponse {
    data: any // the raw JSON propertyForm
    last_step: string | null
    last_saved_at: string
}

export interface PersonalInfoData {
    firstName: string
    lastName: string
    middleName?: string
    dateOfBirth: string // ISO 8601 datetime format with timezone
    gender: 'male' | 'female' | 'other'
    state: string
    lga: string
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
    university: string
    llbYear: number
}

export interface PracticeInfoData {
    /** When true, the lawyer practises alone — firm name is hidden and cleared for save. */
    soloPractitioner: boolean
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
    getDraft: async (): Promise<PropertyDraftResponse> => {
        const res = await httpClient.get<any>('/api/onboarding/draft')
        return res.data || res
    },

    saveDraft: async (payload: { data: any; lastStep: string }) => {
        const res = await httpClient.post<any>('/api/onboarding/draft', payload)
        return res.data || res
    },

    discardDraft: async () => {
        const res = await httpClient.delete<any>('/api/onboarding')
        return res.data || res
    },

    saveNin: async (data: NinSubmitData): Promise<NinSubmitResponse> => {
        const res = await httpClient.put<any>('/api/onboarding/steps/nin', data)
        return res.data || res
    },

    submitOnboarding: async (): Promise<SubmitResponse> => {
        const res = await httpClient.post<any>('/api/onboarding/submit', {})
        return res.data || res
    },

    getOnboardingStatus: async (): Promise<unknown> => {
        return httpClient.getAuth<unknown>('/api/onboarding/status')
    },

    getOnboardingSummary: async (): Promise<unknown> => {
        return httpClient.getAuth<unknown>('/api/onboarding/summary')
    },

    getDashboardLawyer: async (): Promise<unknown> => {
        return httpClient.getAuth<unknown>('/api/dashboard/lawyer')
    }
}

/** For middleware and guards — normalized status fields */
export async function fetchLawyerOnboardingStatus(): Promise<OnboardingStatusPayload> {
    const raw = await lawyerOnboardingAPI.getOnboardingStatus()
    return parseOnboardingStatus(raw)
}

export async function fetchLawyerDashboardMe(): Promise<LawyerDashboardMePayload> {
    const raw = await lawyerOnboardingAPI.getDashboardLawyer()
    return parseLawyerDashboardMe(raw)
}

// --- Composable ---

export const useLawyerOnboarding = () => {
    const queryClient = useQueryClient()

    // Queries
    const useDraft = (options?: { enabled?: any }) => {
        return useQuery({
            queryKey: ['lawyer', 'onboarding', 'draft'],
            queryFn: lawyerOnboardingAPI.getDraft,
            enabled: options?.enabled !== undefined ? options.enabled : process.client, // Only fetch on client
        })
    }

    // Mutations
    const useSaveDraft = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.saveDraft,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'draft'] })
            }
        })
    }

    const useDiscardDraft = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.discardDraft,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'draft'] })
            }
        })
    }

    const useSaveNin = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.saveNin,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'draft'] })
            }
        })
    }

    const useSubmitOnboarding = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.submitOnboarding,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'draft'] })
                queryClient.invalidateQueries({ queryKey: ['lawyer', 'onboarding', 'status'] })
                // Invalidate session/profile so application status gets refreshed
                queryClient.invalidateQueries({ queryKey: ['user', 'session'] })
                queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.all })
            }
        })
    }

    const useOnboardingStatus = () => {
        return useQuery({
            queryKey: ['lawyer', 'onboarding', 'status'],
            queryFn: async () => fetchLawyerOnboardingStatus(),
            staleTime: 30 * 1000
        })
    }

    return {
        useDraft,
        useSaveDraft,
        useDiscardDraft,
        useSaveNin,
        useSubmitOnboarding,
        useOnboardingStatus
    }
}
