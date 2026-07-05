import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import {
    parseOnboardingStatus,
    type OnboardingStatusPayload
} from '~/lib/lawyerOnboardingStatus'
import type { PracticeAreaSelection } from '~/lib/practice-areas'

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
    governmentIdLegalName: string
    dateOfBirth: string // ISO 8601 datetime format with timezone
    gender?: 'male' | 'female' | 'other'
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
    scnFullNameAtCallToBar: string
    yearOfCall?: number
}

export interface PracticeInfoData {
    soloPractitioner: boolean
    firmName: string
    statesOfPractice: string[]
    primaryState: string
    additionalPracticeStates: string[]
    practiceAreas: PracticeAreaSelection[]
    termsAccepted: boolean
    termsVersion: string
    refundPolicyAccepted: boolean
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
}

/** GET /api/onboarding/status — used as TanStack `queryFn` */
export async function fetchLawyerOnboardingStatus(): Promise<OnboardingStatusPayload> {
    const raw = await lawyerOnboardingAPI.getOnboardingStatus()
    return parseOnboardingStatus(raw)
}

const LAWYER_ONBOARDING_STALE_MS = 60 * 1000

/** Deduped status fetch for middleware and entry routing (shared query cache). */
export function ensureLawyerOnboardingStatus(
  queryClient: QueryClient,
): Promise<OnboardingStatusPayload> {
  return queryClient.ensureQueryData({
    queryKey: queryKeys.lawyerOnboarding.status,
    queryFn: fetchLawyerOnboardingStatus,
    staleTime: LAWYER_ONBOARDING_STALE_MS,
  })
}

/** Shared status query — prefer this over calling `fetchLawyerOnboardingStatus` directly. */
export function useLawyerOnboardingStatus(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: queryKeys.lawyerOnboarding.status,
    queryFn: fetchLawyerOnboardingStatus,
    enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
    staleTime: LAWYER_ONBOARDING_STALE_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

// --- Composable ---

export const useLawyerOnboarding = () => {
    const queryClient = useQueryClient()

    // Queries
    const useDraft = (options?: { enabled?: MaybeRef<boolean> }) => {
        return useQuery({
            queryKey: queryKeys.lawyerOnboarding.draft,
            queryFn: lawyerOnboardingAPI.getDraft,
            enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
            staleTime: LAWYER_ONBOARDING_STALE_MS,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        })
    }

    // Mutations
    const useSaveDraft = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.saveDraft,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.draft })
            }
        })
    }

    const useDiscardDraft = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.discardDraft,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.draft })
            }
        })
    }

    const useSaveNin = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.saveNin,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.draft })
            }
        })
    }

    const useSubmitOnboarding = () => {
        return useMutation({
            mutationFn: lawyerOnboardingAPI.submitOnboarding,
            onSuccess: async () => {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.draft }),
                    // Refetch (not only invalidate) so post-submit navigation sees submitted status
                    // even when no status query observer is mounted on the review step.
                    queryClient.refetchQueries({ queryKey: queryKeys.lawyerOnboarding.status }),
                    queryClient.invalidateQueries({ queryKey: ['user', 'session'] }),
                    queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.all }),
                ])
            },
        })
    }

    const useOnboardingSummary = (options?: { enabled?: MaybeRef<boolean> }) => {
        return useQuery({
            queryKey: queryKeys.lawyerOnboarding.summary,
            queryFn: async () => {
                const raw = await lawyerOnboardingAPI.getOnboardingSummary()
                if (raw && typeof raw === 'object' && 'data' in raw) {
                    return (raw as { data: unknown }).data
                }
                return raw
            },
            enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
            staleTime: LAWYER_ONBOARDING_STALE_MS,
        })
    }

    return {
        useDraft,
        useLawyerOnboardingStatus,
        useOnboardingSummary,
        /** @deprecated Use `useOnboardingSummary` */
        useSummary: useOnboardingSummary,
        useSaveDraft,
        useDiscardDraft,
        useSaveNin,
        useSubmitOnboarding,
    }
}
