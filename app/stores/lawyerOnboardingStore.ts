import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { ApiError } from '~/lib/api/client'
import { formatOnboardingApiError } from '~/lib/onboarding-api-errors'
import { normalizeScnDigitsOnly } from '~/lib/scn'
import { lawyerPersonalInfoSchema } from '~/schemas/lawyerPersonalInfo'
import { normalizePracticeAreaSelections } from '~/lib/practice-areas'
import { lawyerProfessionalInfoSchema } from '~/schemas/lawyerProfessionalInfo'
import { createLawyerPracticeInfoSchema } from '~/schemas/lawyerPracticeInfo'
import { CURRENT_TERMS_VERSION } from '~/lib/legal'
import {
    useLawyerOnboarding,
    type PersonalInfoData,
    type ProfessionalInfoData,
    type PracticeInfoData,
    type NinSubmitData,
} from '~/composables/useLawyerOnboarding'

/** Draft last_step values that imply NIN was already saved server-side */
const STEPS_AFTER_NIN_VERIFICATION = new Set([
    'professional_info',
    'practice_info',
    'review',
    'submitted',
    'approved'
])

export const useLawyerOnboardingStore = defineStore('lawyer-onboarding', () => {
    // We use the existing composable to fetch initial data and perform mutations
    const { useDraft, useSaveDraft, useSaveNin, useSubmitOnboarding } = useLawyerOnboarding()

    /** Shares TanStack cache with /onboarding index and wizard layout (one network fetch). */
    const { data: draftDataResponse } = useDraft({
        enabled: import.meta.client,
    })

    // Initialize mutations here (in the setup context) to avoid injection errors in async actions
    const saveDraftMutation = useSaveDraft()
    const saveNinMutation = useSaveNin()
    const submitOnboardingMutation = useSubmitOnboarding()

    const validationError = ref<string | null>(null)

    // Form State
    const personalInfo = reactive<PersonalInfoData>({
        firstName: '',
        lastName: '',
        middleName: '',
        governmentIdLegalName: '',
        dateOfBirth: '',
        gender: undefined,
        state: '',
        lga: ''
    })

    const ninVerification = reactive<
        NinSubmitData & { verified?: boolean; isSubmitted?: boolean }
    >({
        nin: '',
        consent: false,
        verified: false,
        isSubmitted: false
    })

    /** User clicked "Change NIN" — do not re-apply draft `last_step` until they save or leave */
    const ninResubmitMode = ref(false)

    const professionalInfo = reactive<ProfessionalInfoData>({
        barNumber: '',
        scnFullNameAtCallToBar: '',
        yearOfCall: undefined,
    })

    const practiceInfo = reactive<PracticeInfoData>({
        soloPractitioner: true,
        firmName: '',
        practiceAreas: [],
        statesOfPractice: [],
        primaryState: '',
        additionalPracticeStates: [],
        termsAccepted: false,
        termsVersion: CURRENT_TERMS_VERSION,
        refundPolicyAccepted: false,
    })

    // Sync draft data with the reactive store state
    watch(draftDataResponse, (draftRoot) => {
        const payload = draftRoot?.data
        if (payload) {
            if (payload.personal) Object.assign(personalInfo, payload.personal)
            if (payload.professional) {
                const prof = { ...payload.professional } as ProfessionalInfoData
                if (prof.barNumber != null && prof.barNumber !== '') {
                    prof.barNumber = normalizeScnDigitsOnly(String(prof.barNumber))
                }
                Object.assign(professionalInfo, {
                    barNumber: prof.barNumber ?? '',
                    scnFullNameAtCallToBar: prof.scnFullNameAtCallToBar ?? '',
                    yearOfCall: prof.yearOfCall,
                })
            }
            if (payload.ninVerified) {
                ninVerification.verified = true
                ninVerification.isSubmitted = true
            }
            if (payload.practice) {
                const raw = payload.practice as Record<string, unknown>
                practiceInfo.soloPractitioner = Boolean(raw.soloPractitioner)
                practiceInfo.firmName = String(raw.firmName ?? '')
                practiceInfo.statesOfPractice = Array.isArray(raw.statesOfPractice)
                    ? [...(raw.statesOfPractice as string[])]
                    : []
                const primary =
                    String(raw.primaryState ?? '').trim()
                    || practiceInfo.statesOfPractice[0]
                    || ''
                practiceInfo.primaryState = primary
                if (Array.isArray(raw.additionalPracticeStates)) {
                    practiceInfo.additionalPracticeStates = [...(raw.additionalPracticeStates as string[])]
                } else if (primary) {
                    practiceInfo.additionalPracticeStates = practiceInfo.statesOfPractice.filter((s) => s !== primary)
                } else {
                    practiceInfo.additionalPracticeStates = []
                }
                practiceInfo.termsAccepted = Boolean(raw.termsAccepted)
                practiceInfo.refundPolicyAccepted = Boolean(raw.refundPolicyAccepted)
                practiceInfo.termsVersion = String(raw.termsVersion ?? CURRENT_TERMS_VERSION)
                practiceInfo.practiceAreas = normalizePracticeAreaSelections(raw.practiceAreas)
                const hasFirm = String(practiceInfo.firmName ?? '').trim().length > 0
                if (hasFirm) {
                    practiceInfo.soloPractitioner = false
                } else if (raw.soloPractitioner == null) {
                    practiceInfo.soloPractitioner = true
                }
                if (practiceInfo.soloPractitioner) {
                    practiceInfo.firmName = ''
                }
            }
        }

        if (ninResubmitMode.value || ninVerification.verified) return

        const lastStep = draftRoot?.last_step ?? (draftRoot as { lastStep?: string | null })?.lastStep
        if (lastStep && STEPS_AFTER_NIN_VERIFICATION.has(lastStep)) {
            ninVerification.isSubmitted = true
        }
        const ninSubmittedFlag =
            payload?.ninSubmitted === true ||
            (payload as { nin_submitted?: boolean } | undefined)?.nin_submitted === true
        if (ninSubmittedFlag) {
            ninVerification.isSubmitted = true
        }
    }, { immediate: true })

    const saveDraftState = async (stepKey: string) => {
        return new Promise<boolean>((resolve) => {
            saveDraftMutation.mutate({
                data: {
                    personal: toRaw(personalInfo),
                    professional: toRaw(professionalInfo),
                    practice: toRaw(practiceInfo),
                    ninVerified: ninVerification.verified
                },
                lastStep: stepKey
            }, {
                onSuccess: () => resolve(true),
                onError: (e) => {
                    console.error('[Store] Failed to save draft', e)
                    resolve(false)
                }
            })
        })
    }

    // Generic save function to be called by the layout
    const saveStep = async (stepKey: string): Promise<boolean> => {
        validationError.value = null

        if (stepKey === 'nin_verification') {
            if (ninVerification.verified) {
                return saveDraftState(stepKey)
            }

            // NIN already stored; user is only advancing (or came back and did not click "Change NIN")
            if (ninVerification.isSubmitted) {
                return saveDraftState(stepKey)
            }

            // Client-side validation
            if (!ninVerification.nin || ninVerification.nin.length !== 11 || !/^\d+$/.test(ninVerification.nin)) {
                validationError.value = 'NIN must be exactly 11 digits'
                return false
            }

            if (!ninVerification.consent) {
                validationError.value = 'You must provide consent to verify your NIN'
                return false
            }

            const payload = { nin: ninVerification.nin, consent: ninVerification.consent }

            return new Promise((resolve) => {
                saveNinMutation.mutate(payload, {
                    onSuccess: async () => {
                        ninResubmitMode.value = false
                        ninVerification.isSubmitted = true
                        const success = await saveDraftState(stepKey)
                        resolve(success)
                    },
                    onError: (e: unknown) => {
                        console.error('[Store] Failed to save NIN', e)
                        const code = e instanceof ApiError ? e.code : undefined
                        if (code === 'NIN_ALREADY_VERIFIED') {
                            ninVerification.verified = true
                            ninVerification.isSubmitted = true
                            validationError.value = null
                        } else {
                            const errorMsg =
                                e instanceof ApiError
                                    ? e.message
                                    : (e as any)?.response?.data?.details?.[0]?.message ||
                                      (e as any)?.response?.data?.error ||
                                      'Failed to verify NIN'
                            validationError.value = errorMsg
                        }
                        resolve(false)
                    }
                })
            })
        }
        
        if (stepKey === 'review') {
            const submitSchema = createLawyerPracticeInfoSchema(professionalInfo.yearOfCall, {
                requireLegalAcceptances: true,
            })
            const legalOk = submitSchema.safeParse(toRaw(practiceInfo))
            if (!legalOk.success) {
                const first = legalOk.error.issues[0]
                validationError.value = first?.message ?? 'Accept the Terms and refund policy to submit.'
                return false
            }
            Object.assign(practiceInfo, legalOk.data)

            const draftSaved = await saveDraftState('review')
            if (!draftSaved) return false

            return new Promise((resolve) => {
                submitOnboardingMutation.mutate(undefined, {
                    onSuccess: () => resolve(true),
                    onError: (e: unknown) => {
                        console.error('[Store] Failed to submit onboarding', e)
                        const code =
                            e instanceof ApiError
                                ? e.code
                                : (e as { code?: string })?.code
                        /** Already in review pipeline — treat as success for navigation */
                        if (code === 'ALREADY_SUBMITTED') {
                            resolve(true)
                            return
                        }
                        validationError.value = formatOnboardingApiError(
                            e,
                            'Could not submit your application. Please try again.',
                        )
                        resolve(false)
                    },
                })
            })
        }

        if (stepKey === 'personal_info') {
            const parsed = lawyerPersonalInfoSchema.safeParse(toRaw(personalInfo))
            if (!parsed.success) {
                const first = parsed.error.issues[0]
                validationError.value = first?.message ?? 'Please check your personal details.'
                return false
            }
        }

        if (stepKey === 'professional_info') {
            const parsed = lawyerProfessionalInfoSchema.safeParse(toRaw(professionalInfo))
            if (!parsed.success) {
                const first = parsed.error.issues[0]
                validationError.value = first?.message ?? 'Please check your professional details.'
                return false
            }
            Object.assign(professionalInfo, parsed.data)
        }

        if (stepKey === 'practice_info') {
            const schema = createLawyerPracticeInfoSchema(professionalInfo.yearOfCall, {
                requireLegalAcceptances: false,
            })
            const parsed = schema.safeParse(toRaw(practiceInfo))
            if (!parsed.success) {
                const first = parsed.error.issues[0]
                validationError.value = first?.message ?? 'Please check your practice details.'
                return false
            }
            Object.assign(practiceInfo, parsed.data)
        }

        return saveDraftState(stepKey)
    }

    const resetStore = () => {
        ninResubmitMode.value = false
        Object.assign(personalInfo, {
            firstName: '',
            lastName: '',
            middleName: '',
            governmentIdLegalName: '',
            dateOfBirth: '',
            gender: undefined,
            state: '',
            lga: '',
        })
        Object.assign(ninVerification, { nin: '', consent: false, verified: false, isSubmitted: false })
        Object.assign(professionalInfo, { barNumber: '', scnFullNameAtCallToBar: '', yearOfCall: undefined })
        Object.assign(practiceInfo, {
            soloPractitioner: true,
            firmName: '',
            practiceAreas: [],
            statesOfPractice: [],
            primaryState: '',
            additionalPracticeStates: [],
            termsAccepted: false,
            termsVersion: CURRENT_TERMS_VERSION,
            refundPolicyAccepted: false,
        })
    }

    /** Reveal the NIN form again so the user can correct or replace their NIN (backend overwrites until verified). */
    const beginChangeNin = () => {
        ninResubmitMode.value = true
        ninVerification.isSubmitted = false
        ninVerification.nin = ''
        ninVerification.consent = false
    }

    const clearNinResubmitMode = () => {
        ninResubmitMode.value = false
    }

    const summary = computed(() => ({
        personal: personalInfo,
        professional: professionalInfo,
        practice: practiceInfo,
        ninVerification: {
            verified: !!ninVerification.verified,
            /** Saved server-side but admin has not verified yet — same idea as `nin-verification.vue` `isSubmittedPending`. */
            isSubmitted: !!ninVerification.isSubmitted
        }
    }))

    return {
        personalInfo,
        ninVerification,
        professionalInfo,
        practiceInfo,
        draft: computed(() => draftDataResponse.value),
        summary,
        validationError,
        saveStep,
        resetStore,
        beginChangeNin,
        clearNinResubmitMode
    }
})
