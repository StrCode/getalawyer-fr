import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { useLawyerOnboarding, type PersonalInfoData, type ProfessionalInfoData, type PracticeInfoData, type NinSubmitData } from '~/composables/useLawyerOnboarding'

export const useLawyerOnboardingStore = defineStore('lawyer-onboarding', () => {
    // We use the existing composable to fetch initial data and perform mutations
    const { useSummary, useSavePersonalInfo, useSaveProfessionalInfo, useSavePracticeInfo, useSaveNin, useSubmitOnboarding } = useLawyerOnboarding()
    
    // We can fetch data here and populate the state
    const { data: summary } = useSummary()

    // Form State
    const personalInfo = reactive<PersonalInfoData>({
        firstName: '',
        lastName: '',
        middleName: '',
        dateOfBirth: '',
        gender: 'other',
        country: 'Nigeria',
        state: '',
        lga: '',
        city: '',
        address: '',
        phoneNumber: ''
    })

    const ninVerification = reactive<NinSubmitData>({
        nin: '',
        consent: false
    })

    const professionalInfo = reactive<ProfessionalInfoData>({
        barNumber: '',
        lawSchool: '',
        yearOfCall: new Date().getFullYear(),
        graduationYear: new Date().getFullYear(),
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
    watch(summary, (newSummary) => {
        if (newSummary) {
            if (newSummary.personal) Object.assign(personalInfo, newSummary.personal)
            // Note: nin is not returned for security, but verified status is inside summary.ninVerification
            if (newSummary.professional) Object.assign(professionalInfo, newSummary.professional)
            if (newSummary.practice) {
                Object.assign(practiceInfo, newSummary.practice)
                // Normalize office address format to match the state if necessary
                if (newSummary.practice.officeStreet) {
                    practiceInfo.officeAddress = {
                        street: newSummary.practice.officeStreet,
                        city: newSummary.practice.officeCity,
                        state: newSummary.practice.officeState,
                        postalCode: newSummary.practice.officePostalCode
                    }
                }
            }
        }
    }, { immediate: true })

    // Generic save function to be called by the layout
    const saveStep = async (stepKey: string): Promise<boolean> => {
        return new Promise((resolve) => {
            switch (stepKey) {
                case 'personal-info':
                    useSavePersonalInfo().mutate(toRaw(personalInfo), {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to save personal info', e)
                            resolve(false)
                        }
                    })
                    break
                case 'nin-verification':
                    // Just return true if they already verified, otherwise save it
                    if (summary.value?.ninVerification?.verified) return resolve(true)
                    
                    useSaveNin().mutate(toRaw(ninVerification), {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to save NIN', e)
                            resolve(false)
                        }
                    })
                    break
                case 'professional-information':
                    useSaveProfessionalInfo().mutate(toRaw(professionalInfo), {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to save professional info', e)
                            resolve(false)
                        }
                    })
                    break
                case 'practice-information':
                    useSavePracticeInfo().mutate(toRaw(practiceInfo), {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to save practice info', e)
                            resolve(false)
                        }
                    })
                    break
                case 'review':
                    useSubmitOnboarding().mutate(undefined, {
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
