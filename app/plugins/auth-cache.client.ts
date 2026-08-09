import { useQueryClient } from '@tanstack/vue-query'
import { clearAuthClientState } from '~/lib/clear-auth-client-state'

/**
 * Clears TanStack / Pinia / storage when the signed-in user id changes
 * (sign-out → null, or account switch without a full reload).
 */
export default defineNuxtPlugin(() => {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  const previousUserId = ref<string | null | undefined>(undefined)

  watch(
    () => session.value?.user?.id ?? null,
    (nextId) => {
      const prev = previousUserId.value
      previousUserId.value = nextId

      // Skip the first observation so a normal page load does not wipe fresh caches.
      if (prev === undefined) return

      // Sign-out: drop previous user caches. Sign-in (null → id) is already cleared by useSignOut.
      if (nextId === null && prev != null) {
        clearAuthClientState(queryClient)
        return
      }

      // Account switch without a full sign-out in between.
      if (prev != null && nextId != null && prev !== nextId) {
        clearAuthClientState(queryClient)
      }
    },
    { flush: 'sync' },
  )
})