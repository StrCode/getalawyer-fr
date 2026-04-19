import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { completeClientOnboarding } from '~/composables/useClientOnboarding'

export interface ClientOnboardingData {
    country: string
    state: string
    specializationIds: string[]
}

export const useClientOnboardingStore = defineStore('client-onboarding', () => {
    // Form State
    const clientState = reactive<ClientOnboardingData>({
        country: 'NG', // Defaulted to Nigeria for now
        state: '',
        specializationIds: []
    })

    // Generic save function to be called by the overall layout
    const saveStep = async (stepKey: string): Promise<boolean> => {
        switch (stepKey) {
            case 'location':
                if (!clientState.country || !clientState.state) return false
                return true

            case 'specializations':
                if (clientState.specializationIds.length === 0) return false
                try {
                    await completeClientOnboarding(toRaw(clientState) as ClientOnboardingData)
                    return true
                } catch (e) {
                    console.error('[Store] Failed to complete client onboarding', e)
                    return false
                }
            default:
                return true
        }
    }

    return {
        clientState,
        saveStep
    }
})
