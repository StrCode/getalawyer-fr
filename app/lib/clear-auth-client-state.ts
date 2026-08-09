import type { QueryClient } from '@tanstack/vue-query'
import { SUBSCRIPTION_PAYMENT_REF_KEY } from '~/composables/useSubscription'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useMessagingStore } from '~/stores/messagingStore'

/** User-scoped browser storage keys cleared on sign-out / account switch. */
export const AUTH_SCOPED_STORAGE_KEYS = [
  'client-onboarding-draft',
  'case-saved-searches',
  'getalawyer-fr:recent-lawyer-directory-searches',
  'getalawyer-fr:find-lawyers-layout',
] as const

/**
 * Clears TanStack Query, Pinia onboarding/messaging state, and auth-scoped
 * local/session storage so the next account cannot see the previous user's data.
 */
export function clearAuthClientState(queryClient?: QueryClient | null) {
  if (!import.meta.client) return

  try {
    queryClient?.clear()
  } catch (error) {
    console.error('[clearAuthClientState] queryClient.clear failed:', error)
  }

  try {
    useLawyerOnboardingStore().resetStore()
  } catch (error) {
    console.error('[clearAuthClientState] lawyer onboarding reset failed:', error)
  }

  try {
    useClientOnboardingStore().resetStore()
  } catch (error) {
    console.error('[clearAuthClientState] client onboarding reset failed:', error)
  }

  try {
    useMessagingStore().resetStore()
  } catch (error) {
    console.error('[clearAuthClientState] messaging reset failed:', error)
  }

  try {
    for (const key of AUTH_SCOPED_STORAGE_KEYS) {
      localStorage.removeItem(key)
    }
    sessionStorage.removeItem(SUBSCRIPTION_PAYMENT_REF_KEY)
  } catch (error) {
    console.error('[clearAuthClientState] storage clear failed:', error)
  }
}
