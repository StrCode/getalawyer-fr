/**
 * Restarts rejected or verification-failed lawyer applications for resubmit.
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ApiError, httpClient, type ApiResponse } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'

const onboardingRestartAPI = {
  restart: async () => {
    const response = await httpClient.post<ApiResponse<Record<string, unknown>>>(
      '/api/onboarding/restart',
    )
    if (!response.success && !response.data) {
      throw new ApiError(response.error || 'Failed to restart application', 400)
    }
    return response.data ?? response
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
