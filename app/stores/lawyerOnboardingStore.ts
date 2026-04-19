import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { useLawyerOnboarding, type PersonalInfoData, type ProfessionalInfoData, type PracticeInfoData, type NinSubmitData } from '~/composables/useLawyerOnboarding'

export const useLawyerOnboardingStore = defineStore('lawyer-onboarding', () => {
    // We use the existing composable to fetch initial data and perform mutations
    const { useSummary, useSavePersonalInfo, useSaveProfessionalInfo, useSavePracticeInfo, useSaveNin, useSubmitOnboarding } = useLawyerOnboarding()
    
    // We can fetch data here and populate the state
    const { data: summary } = useSummary()

    // Initialize mutations here (in the setup context) to avoid injection errors in async actions
    const savePersonalInfoMutation = useSavePersonalInfo()
    const saveProfessionalInfoMutation = useSaveProfessionalInfo()
    const savePracticeInfoMutation = useSavePracticeInfo()
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

    const ninVerification = reactive<NinSubmitData>({
        nin: '',
        consent: false
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

    // Sync summary data with the reactive store state
    // Sync summary data with the reactive store state
    watch(summary, (newSummary) => {
        if (newSummary) {
            if (newSummary.personal) Object.assign(personalInfo, newSummary.personal)
            // Note: nin is not returned for security, but verified status is inside summary.ninVerification
            if (newSummary.professional) Object.assign(professionalInfo, newSummary.professional)
            if (newSummary.practice) {
                const { officeAddress, ...otherPractice } = newSummary.practice
                Object.assign(practiceInfo, otherPractice)
                if (officeAddress) {
                    Object.assign(practiceInfo.officeAddress, officeAddress)
                }
            }
        }
    }, { immediate: true })

    // Generic save function to be called by the layout
    const saveStep = async (stepKey: string): Promise<boolean> => {
        return new Promise((resolve) => {
            switch (stepKey) {
                case 'personal_info':
                    savePersonalInfoMutation.mutate(toRaw(personalInfo), {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to save personal info', e)
                            resolve(false)
                        }
                    })
                    break
                case 'nin_verification':
                    // Just return true if they already verified, otherwise save it
                    if (summary.value?.ninVerification?.verified) return resolve(true)
                    
                    saveNinMutation.mutate(toRaw(ninVerification), {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to save NIN', e)
                            resolve(false)
                        }
                    })
                    break
                case 'professional_info':
                    saveProfessionalInfoMutation.mutate(toRaw(professionalInfo), {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to save professional info', e)
                            resolve(false)
                        }
                    })
                    break
                case 'practice_info':
                    savePracticeInfoMutation.mutate(toRaw(practiceInfo), {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to save practice info', e)
                            resolve(false)
                        }
                    })
                    break
                case 'review':
                    submitOnboardingMutation.mutate(undefined, {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to submit onboarding', e)
                            resolve(false)
                        }
                    })
                    break
            }
        })
    }

    return {
        personalInfo,
        ninVerification,
        professionalInfo,
        practiceInfo,
        summary: computed(() => summary.value),
        saveStep
    }
})
