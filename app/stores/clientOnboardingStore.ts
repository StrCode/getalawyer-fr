import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { completeClientOnboarding } from '~/composables/useClientOnboarding'
import { ApiError } from '~/lib/api/client'
import { CURRENT_TERMS_VERSION } from '~/lib/legal'

export interface ClientOnboardingData {
    country: string
    state: string
    specializationIds: string[]
    termsAccepted: boolean
    termsVersion: string
}

const STORAGE_KEY = 'client-onboarding-draft'

export const useClientOnboardingStore = defineStore('client-onboarding', () => {
    const clientState = reactive<ClientOnboardingData>({
        country: 'NG',
        state: '',
        specializationIds: [],
        termsAccepted: false,
        termsVersion: CURRENT_TERMS_VERSION,
    })

    if (import.meta.client) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                const saved = JSON.parse(raw) as Partial<ClientOnboardingData>
                // Stale consent must not survive a terms-version bump.
                const sameTerms = saved.termsVersion === CURRENT_TERMS_VERSION
                Object.assign(clientState, {
                    country: saved.country ?? 'NG',
                    state: saved.state ?? '',
                    specializationIds: Array.isArray(saved.specializationIds) ? saved.specializationIds : [],
                    termsAccepted: sameTerms ? Boolean(saved.termsAccepted) : false,
                    termsVersion: CURRENT_TERMS_VERSION,
                })
            }
        } catch {
            localStorage.removeItem(STORAGE_KEY)
        }

        watch(clientState, () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clientState))
        }, { deep: true })
    }

    /**
     * Someone invited by our staff starts from the state and legal areas staff
     * chose for them. Only fills what is still empty, and only once.
     */
    let prefilled = false
    const applyInvitationPrefill = async () => {
        if (prefilled || !import.meta.client) return
        prefilled = true
        try {
            const { invitationsAPI } = await import('~/lib/api/invitations')
            const { prefill } = await invitationsAPI.mine()
            if (prefill?.state && !clientState.state) clientState.state = prefill.state
            if (prefill?.interests?.length && !clientState.specializationIds.length) {
                clientState.specializationIds = prefill.interests.slice(0, 3)
            }
        } catch {
            // Nothing filled in; they choose as anyone would.
        }
    }

    const validationError = ref<string | null>(null)
    // Rendered inline next to the terms checkbox, not in the layout banner.
    const termsError = ref<string | null>(null)

    const saveStep = async (stepKey: string): Promise<boolean> => {
        validationError.value = null
        termsError.value = null

        switch (stepKey) {
            case 'location':
                if (!clientState.country || !clientState.state) {
                    validationError.value = 'Select your state to continue.'
                    return false
                }
                return true

            case 'specializations':
                if (clientState.specializationIds.length === 0) {
                    validationError.value = 'Select at least one practice area.'
                    return false
                }
                if (!clientState.termsAccepted) {
                    termsError.value = 'Accept the Terms and Conditions to continue.'
                    return false
                }
                try {
                    await completeClientOnboarding(toRaw(clientState) as ClientOnboardingData)
                    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
                    return true
                } catch (e) {
                    // "Already completed": an earlier attempt succeeded but its reply
                    // was lost (or the button was pressed twice). That is success.
                    if (e instanceof ApiError && e.status === 409) {
                        if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
                        return true
                    }
                    console.error('[Store] Failed to complete client onboarding', e)
                    validationError.value = 'Could not save your preferences. Please try again.'
                    return false
                }
            default:
                return true
        }
    }

    const resetStore = () => {
        clientState.country = 'NG'
        clientState.state = ''
        clientState.specializationIds = []
        clientState.termsAccepted = false
        clientState.termsVersion = CURRENT_TERMS_VERSION
        validationError.value = null
        termsError.value = null
        if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
    }

    return {
        clientState,
        validationError,
        termsError,
        saveStep,
        resetStore,
        applyInvitationPrefill,
    }
})
