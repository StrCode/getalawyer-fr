import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { completeClientOnboarding } from '~/composables/useClientOnboarding'
import { CURRENT_TERMS_VERSION } from '~/lib/legal'

export interface ClientOnboardingData {
    country: string
    state: string
    specializationIds: string[]
    termsAccepted: boolean
    termsVersion: string
}

export const useClientOnboardingStore = defineStore('client-onboarding', () => {
    const clientState = reactive<ClientOnboardingData>({
        country: 'NG',
        state: '',
        specializationIds: [],
        termsAccepted: false,
        termsVersion: CURRENT_TERMS_VERSION,
    })

    const validationError = ref<string | null>(null)

    const saveStep = async (stepKey: string): Promise<boolean> => {
        validationError.value = null

        switch (stepKey) {
            case 'location':
                if (!clientState.country || !clientState.state) return false
                return true

            case 'specializations':
                if (clientState.specializationIds.length === 0) {
                    validationError.value = 'Select at least one practice area.'
                    return false
                }
                if (!clientState.termsAccepted) {
                    validationError.value = 'Accept the Terms and Conditions to continue.'
                    return false
                }
                try {
                    await completeClientOnboarding(toRaw(clientState) as ClientOnboardingData)
                    return true
                } catch (e) {
                    console.error('[Store] Failed to complete client onboarding', e)
                    validationError.value = 'Could not save your preferences. Please try again.'
                    return false
                }
            default:
                return true
        }
    }

    return {
        clientState,
        validationError,
        saveStep,
    }
})
