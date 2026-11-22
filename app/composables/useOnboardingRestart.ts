/**
 * Opens an application again after the lawyer withdrew it.
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { ApiError, httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

const onboardingRestartAPI = {
  restart: async () => {
    const response = await httpClient.post<Record<string, unknown>>(
      '/api/onboarding/restart',
    )
    if (!response) {
      throw new ApiError('Failed to restart application', 400)
    }
    return response
  },
}

export const useOnboardingRestart = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: onboardingRestartAPI.restart,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.draft }),
        queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.status }),
        queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status }),
        queryClient.invalidateQueries({ queryKey: ['user', 'session'] }),
        queryClient.invalidateQueries({ queryKey: ['lawyer-dashboard'] }),
      ])
    },
  })

  return {
    restart: () => mutation.mutateAsync(),
    isPending: mutation.isPending,
    useRestartApplication: () => mutation,
  }
}

/**
 * Open an application again after it was withdrawn, and load the forms from
 * what the server rebuilt. `restart` resolves once the application's status and
 * saved details have been fetched again, so the application page shows the
 * editable home without any navigation.
 */
export function useReopenApplication() {
  const { restart, isPending } = useOnboardingRestart()
  const store = useLawyerOnboardingStore()

  async function reopen(messages: {
    /** Toast shown when it worked, if any. */
    done?: { title: string, description?: string }
    /** Title of the toast shown when it did not. */
    failed: string
  }): Promise<boolean> {
    try {
      await restart()
      store.reloadFromDraft()
      if (messages.done) toast.success(messages.done.title, { description: messages.done.description })
      return true
    }
    catch (error) {
      toast.error(messages.failed, {
        description: error instanceof Error ? error.message : 'Please try again, or write to support.',
      })
      return false
    }
  }

  return { reopen, isPending }
}
