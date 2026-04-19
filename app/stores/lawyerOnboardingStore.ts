import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { useLawyerOnboarding, type PersonalInfoData, type ProfessionalInfoData, type PracticeInfoData, type NinSubmitData } from '~/composables/useLawyerOnboarding'

export const useLawyerOnboardingStore = defineStore('lawyer-onboarding', () => {
    // We use the existing composable to fetch initial data and perform mutations
    const { useDraft, useSaveDraft, useSaveNin, useSubmitOnboarding } = useLawyerOnboarding()
    
    // We can fetch data here and populate the state
    const { data: draftDataResponse } = useDraft()

    // Initialize mutations here (in the setup context) to avoid injection errors in async actions
    const saveDraftMutation = useSaveDraft()
    const saveNinMutation = useSaveNin()
    const submitOnboardingMutation = useSubmitOnboarding()

    // Form State
    const personalInfo = reactive<PersonalInfoData>({
        firstName: '',
        lastName: '',
        middleName: '',
        dateOfBirth: '',
        gender: 'other',
        state: '',
        lga: ''
    })

    const ninVerification = reactive<NinSubmitData & { verified?: boolean }>({
        nin: '',
        consent: false,
        verified: false
    })

    const professionalInfo = reactive<ProfessionalInfoData>({
        barNumber: '',
        lawSchool: '',
        yearOfCall: new Date().getFullYear(),
        university: '',
        llbYear: new Date().getFullYear()
    })

    const practiceInfo = reactive<PracticeInfoData>({
        firmName: '',
        practiceAreas: [],
        statesOfPractice: [],
        officeAddress: {
            street: '',
            city: '',
            state: '',
            postalCode: ''
        }
    })

    // Sync draft data with the reactive store state
    watch(draftDataResponse, (newResponse) => {
        const payload = newResponse?.data
        if (payload) {
            if (payload.personal) Object.assign(personalInfo, payload.personal)
            if (payload.professional) Object.assign(professionalInfo, payload.professional)
            if (payload.ninVerified) ninVerification.verified = true
            if (payload.practice) {
                const { officeAddress, ...otherPractice } = payload.practice
                Object.assign(practiceInfo, otherPractice)
                if (officeAddress) {
                    Object.assign(practiceInfo.officeAddress, officeAddress)
                }
            }
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
        if (stepKey === 'nin_verification') {
            if (ninVerification.verified) {
                return saveDraftState(stepKey)
            }
            return new Promise((resolve) => {
                saveNinMutation.mutate(toRaw(ninVerification), {
                    onSuccess: async () => {
                        ninVerification.verified = true
                        const success = await saveDraftState(stepKey)
                        resolve(success)
                    },
                    onError: (e) => {
                        console.error('[Store] Failed to save NIN', e)
                        resolve(false)
                    }
                })
            })
        }
        
        if (stepKey === 'review') {
            return new Promise((resolve) => {
                submitOnboardingMutation.mutate(undefined, {
                    onSuccess: () => resolve(true),
                    onError: (e) => {
                        console.error('[Store] Failed to submit onboarding', e)
                        resolve(false)
                    }
                })
            })
        }

        // For personal_info, professional_info, practice_info
        return saveDraftState(stepKey)
    }

    const resetStore = () => {
        Object.assign(personalInfo, { firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: 'other', state: '', lga: '' })
        Object.assign(ninVerification, { nin: '', consent: false, verified: false })
        Object.assign(professionalInfo, { barNumber: '', lawSchool: '', yearOfCall: new Date().getFullYear(), university: '', llbYear: new Date().getFullYear() })
        Object.assign(practiceInfo, { firmName: '', practiceAreas: [], statesOfPractice: [], officeAddress: { street: '', city: '', state: '', postalCode: '' } })
    }

    return {
        personalInfo,
        ninVerification,
        professionalInfo,
        practiceInfo,
        draft: computed(() => draftDataResponse.value),
        saveStep,
        resetStore
    }
})
