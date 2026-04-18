import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { useClientOnboarding } from '~/composables/useClientOnboarding'

export interface ClientOnboardingData {
    country: string
    state: string
    specializationIds: string[]
}

export const useClientOnboardingStore = defineStore('client-onboarding', () => {
    // API composables
    const { useCompleteOnboarding } = useClientOnboarding()

    // Form State
    const clientState = reactive<ClientOnboardingData>({
        country: 'NG', // Defaulted to Nigeria for now
        state: '',
        specializationIds: []
    })

    // Generic save function to be called by the overall layout
    const saveStep = async (stepKey: string): Promise<boolean> => {
        return new Promise((resolve) => {
            switch (stepKey) {
                case 'location':
                    // Just basic validation, no backend draft save required for this step
                    if (!clientState.country || !clientState.state) {
                        resolve(false)
                        return
                    }
                    resolve(true)
                    break
                
                case 'specializations':
                    // On latest step, we fire the final mutation 
                    if (clientState.specializationIds.length === 0) {
                        resolve(false)
                        return
                    }

                    useCompleteOnboarding().mutate(toRaw(clientState), {
                        onSuccess: () => resolve(true),
                        onError: (e) => {
                            console.error('[Store] Failed to complete client onboarding', e)
                            resolve(false)
                        }
                    })
                    break
                default:
                    resolve(true)
            }
        })
    }

    return {
        clientState,
        saveStep
    }
})
