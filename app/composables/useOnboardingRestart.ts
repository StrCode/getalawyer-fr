/**
 * Onboarding Restart composable
 * Handles restarting rejected lawyer applications
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient, type ApiResponse } from '~/lib/api/client'

interface RestartResponse {
  success: boolean
  message: string
  nextState: string
}

// API functions
const onboardingRestartAPI = {
  restart: async (): Promise<RestartResponse> => {
    const response = await httpClient.post<ApiResponse<RestartResponse>>(
      '/api/onboarding/restart'
    )
    if (!response.data) throw new Error('Failed to restart application')
    return response.data
  }
}

// Composable
export const useOnboardingRestart = () => {
  const queryClient = useQueryClient()

  // Mutation: Restart application
  const useRestartApplication = () => {
    return useMutation({
      mutationFn: onboardingRestartAPI.restart,
      onSuccess: () => {
        // Invalidate onboarding-related queries
        queryClient.invalidateQueries({ queryKey: ['onboarding'] })
        queryClient.invalidateQueries({ queryKey: ['lawyer-dashboard'] })
      },
    })
  }

  return {
    useRestartApplication
  }
}
