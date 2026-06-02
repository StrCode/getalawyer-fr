/**
 * Onboarding Restart composable
 * Handles restarting rejected lawyer applications
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient, type ApiResponse } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'

interface RestartResponse {
  success: boolean
  message: string
  nextState: string
}

const onboardingRestartAPI = {
  restart: async (): Promise<RestartResponse> => {
    const response = await httpClient.post<ApiResponse<RestartResponse>>(
      '/api/onboarding/restart',
    )
    if (!response.data) throw new Error('Failed to restart application')
    return response.data
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
