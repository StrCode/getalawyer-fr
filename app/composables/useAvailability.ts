/**
 * Availability composable with TanStack Query
 * Manages lawyer availability schedules, exceptions, and available slots
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient, type ApiResponse } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import type {
  WeeklySchedule,
  AvailabilityException,
  CreateExceptionInput,
  AvailableSlot,
} from '~/types'

// API functions
const availabilityAPI = {
  getSchedule: async (): Promise<WeeklySchedule> => {
    const response = await httpClient.getAuth<ApiResponse<WeeklySchedule>>(
      '/api/lawyer/availability/schedule'
    )
    return response.data || {}
  },

  updateSchedule: async (schedule: WeeklySchedule): Promise<WeeklySchedule> => {
    const response = await httpClient.post<ApiResponse<WeeklySchedule>>(
      '/api/lawyer/availability/schedule',
      schedule
    )
    if (!response.data) throw new Error('Failed to update schedule')
    return response.data
  },

  getExceptions: async (): Promise<AvailabilityException[]> => {
    const response = await httpClient.getAuth<ApiResponse<AvailabilityException[]>>(
      '/api/lawyer/availability/exceptions'
    )
    return response.data || []
  },

  createException: async (data: CreateExceptionInput): Promise<AvailabilityException> => {
    const response = await httpClient.post<ApiResponse<AvailabilityException>>(
      '/api/lawyer/availability/exceptions',
      data
    )
    if (!response.data) throw new Error('Failed to create exception')
    return response.data
  },

  deleteException: async (id: string): Promise<void> => {
    await httpClient.delete<ApiResponse>(`/api/lawyer/availability/exceptions/${id}`)
  },

  getAvailableSlots: async (
    lawyerId: string,
    consultationTypeId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailableSlot[]> => {
    const params = new URLSearchParams({
      consultationTypeId,
      startDate,
      endDate,
    })
    const response = await httpClient.get<ApiResponse<AvailableSlot[]>>(
      `/api/lawyers/${lawyerId}/available-slots?${params}`
    )
    return response.data || []
  },
}

// Composable
export const useAvailability = () => {
  const queryClient = useQueryClient()

  // Query: Get availability schedule
  const useAvailabilitySchedule = () => {
    return useQuery({
      queryKey: queryKeys.availability.schedule,
      queryFn: availabilityAPI.getSchedule,
    })
  }

  // Mutation: Update availability schedule
  const useUpdateAvailabilitySchedule = () => {
    return useMutation({
      mutationFn: availabilityAPI.updateSchedule,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.schedule })
        queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      },
    })
  }

  // Query: Get availability exceptions
  const useAvailabilityExceptions = () => {
    return useQuery({
      queryKey: queryKeys.availability.exceptions,
      queryFn: availabilityAPI.getExceptions,
    })
  }

  // Mutation: Create availability exception
  const useCreateAvailabilityException = () => {
    return useMutation({
      mutationFn: availabilityAPI.createException,
      onMutate: async (newException) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.availability.exceptions })
        const previousExceptions = queryClient.getQueryData<AvailabilityException[]>(
          queryKeys.availability.exceptions
        )

        if (previousExceptions) {
          const optimisticException: AvailabilityException = {
            id: `temp-${Date.now()}`,
            lawyerId: 'current-lawyer',
            startDate: newException.startDate,
            endDate: newException.endDate,
            reason: newException.reason,
            createdAt: new Date().toISOString(),
          }

          queryClient.setQueryData<AvailabilityException[]>(
            queryKeys.availability.exceptions,
            [...previousExceptions, optimisticException]
          )
        }

        return { previousExceptions }
      },
      onError: (_err, _newException, context) => {
        if (context?.previousExceptions) {
          queryClient.setQueryData(queryKeys.availability.exceptions, context.previousExceptions)
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.exceptions })
        queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      },
    })
  }

  // Mutation: Delete availability exception
  const useDeleteAvailabilityException = () => {
    return useMutation({
      mutationFn: availabilityAPI.deleteException,
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.availability.exceptions })
        const previousExceptions = queryClient.getQueryData<AvailabilityException[]>(
          queryKeys.availability.exceptions
        )

        if (previousExceptions) {
          queryClient.setQueryData<AvailabilityException[]>(
            queryKeys.availability.exceptions,
            previousExceptions.filter((exception) => exception.id !== id)
          )
        }

        return { previousExceptions }
      },
      onError: (_err, _id, context) => {
        if (context?.previousExceptions) {
          queryClient.setQueryData(queryKeys.availability.exceptions, context.previousExceptions)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.exceptions })
        queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      },
    })
  }

  // Query: Get available slots
  const useAvailableSlots = (
    lawyerId: Ref<string>,
    consultationTypeId: Ref<string>,
    startDate: Ref<string>,
    endDate: Ref<string>
  ) => {
    return useQuery({
      queryKey: computed(() =>
        queryKeys.availableSlots(
          lawyerId.value,
          consultationTypeId.value,
          startDate.value,
          endDate.value
        )
      ),
      queryFn: () =>
        availabilityAPI.getAvailableSlots(
          lawyerId.value,
          consultationTypeId.value,
          startDate.value,
          endDate.value
        ),
      enabled: computed(
        () =>
          !!lawyerId.value &&
          !!consultationTypeId.value &&
          !!startDate.value &&
          !!endDate.value
      ),
    })
  }

  return {
    useAvailabilitySchedule,
    useUpdateAvailabilitySchedule,
    useAvailabilityExceptions,
    useCreateAvailabilityException,
    useDeleteAvailabilityException,
    useAvailableSlots,
  }
}
