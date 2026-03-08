/**
 * Availability composable with TanStack Query
 * Manages lawyer availability schedules, exceptions, and available slots
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient, type ApiResponse } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import type {
  LawyerAvailabilitySchedule,
  AvailabilityException,
  CreateScheduleInput,
  BulkScheduleInput,
  CreateExceptionInput,
  BulkExceptionInput,
  AvailableSlot,
  WeeklyScheduleResponse,
  ExceptionsResponse,
  AvailabilityRangeResponse,
} from '~/types'

// API functions
const availabilityAPI = {
  getSchedule: async (): Promise<LawyerAvailabilitySchedule[]> => {
    const response = await httpClient.getAuth<ApiResponse<WeeklyScheduleResponse>>(
      '/api/lawyer/availability/schedule'
    )
    return response.data?.schedule || []
  },

  setSchedule: async (data: CreateScheduleInput): Promise<LawyerAvailabilitySchedule> => {
    const response = await httpClient.post<ApiResponse<{ schedule: LawyerAvailabilitySchedule }>>(
      '/api/lawyer/availability/schedule',
      data
    )
    if (!response.data?.schedule) throw new Error('Failed to set schedule')
    return response.data.schedule
  },

  bulkSetSchedule: async (data: BulkScheduleInput): Promise<LawyerAvailabilitySchedule[]> => {
    const response = await httpClient.post<ApiResponse<{ schedules: LawyerAvailabilitySchedule[] }>>(
      '/api/lawyer/availability/schedule/bulk',
      data
    )
    if (!response.data?.schedules) throw new Error('Failed to set bulk schedule')
    return response.data.schedules
  },

  deleteSchedule: async (id: string): Promise<void> => {
    await httpClient.delete<ApiResponse>(`/api/lawyer/availability/schedule/${id}`)
  },

  getExceptions: async (params?: { startDate?: string; endDate?: string; futureOnly?: boolean }): Promise<AvailabilityException[]> => {
    const queryParams = new URLSearchParams()
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.futureOnly !== undefined) queryParams.append('futureOnly', String(params.futureOnly))
    
    const url = `/api/lawyer/availability/exceptions${queryParams.toString() ? `?${queryParams}` : ''}`
    const response = await httpClient.getAuth<ApiResponse<ExceptionsResponse>>(url)
    return response.data?.exceptions || []
  },

  createException: async (data: CreateExceptionInput): Promise<AvailabilityException> => {
    const response = await httpClient.post<ApiResponse<{ exception: AvailabilityException }>>(
      '/api/lawyer/availability/exceptions',
      data
    )
    if (!response.data?.exception) throw new Error('Failed to create exception')
    return response.data.exception
  },

  bulkCreateExceptions: async (data: BulkExceptionInput): Promise<AvailabilityException[]> => {
    const response = await httpClient.post<ApiResponse<{ exceptions: AvailabilityException[] }>>(
      '/api/lawyer/availability/exceptions/bulk',
      data
    )
    if (!response.data?.exceptions) throw new Error('Failed to create bulk exceptions')
    return response.data.exceptions
  },

  deleteException: async (id: string): Promise<void> => {
    await httpClient.delete<ApiResponse>(`/api/lawyer/availability/exceptions/${id}`)
  },

  getAvailabilityRange: async (startDate: string, endDate: string): Promise<AvailabilityRangeResponse> => {
    const params = new URLSearchParams({ startDate, endDate })
    const response = await httpClient.getAuth<ApiResponse<AvailabilityRangeResponse>>(
      `/api/lawyer/availability/range?${params}`
    )
    return response.data || { weeklySchedule: [], exceptions: [] }
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

  // Mutation: Set schedule for single day
  const useSetSchedule = () => {
    return useMutation({
      mutationFn: availabilityAPI.setSchedule,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.schedule })
        queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      },
    })
  }

  // Mutation: Bulk set schedule
  const useBulkSetSchedule = () => {
    return useMutation({
      mutationFn: availabilityAPI.bulkSetSchedule,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.schedule })
        queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      },
    })
  }

  // Mutation: Delete schedule entry
  const useDeleteSchedule = () => {
    return useMutation({
      mutationFn: availabilityAPI.deleteSchedule,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.schedule })
        queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      },
    })
  }

  // Query: Get availability exceptions
  const useAvailabilityExceptions = (params?: MaybeRef<{ startDate?: string; endDate?: string; futureOnly?: boolean }>) => {
    return useQuery({
      queryKey: computed(() => [...queryKeys.availability.exceptions, unref(params)]),
      queryFn: () => availabilityAPI.getExceptions(unref(params)),
    })
  }

  // Mutation: Create availability exception
  const useCreateAvailabilityException = () => {
    return useMutation({
      mutationFn: availabilityAPI.createException,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.exceptions })
        queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      },
    })
  }

  // Mutation: Bulk create exceptions
  const useBulkCreateExceptions = () => {
    return useMutation({
      mutationFn: availabilityAPI.bulkCreateExceptions,
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.exceptions })
        queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      },
    })
  }

  // Query: Get availability range
  const useAvailabilityRange = (startDate: Ref<string>, endDate: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => ['availability-range', startDate.value, endDate.value]),
      queryFn: () => availabilityAPI.getAvailabilityRange(startDate.value, endDate.value),
      enabled: computed(() => !!startDate.value && !!endDate.value),
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
    useSetSchedule,
    useBulkSetSchedule,
    useDeleteSchedule,
    useAvailabilityExceptions,
    useCreateAvailabilityException,
    useBulkCreateExceptions,
    useDeleteAvailabilityException,
    useAvailabilityRange,
    useAvailableSlots,
  }
}
