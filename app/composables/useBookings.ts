/**
 * Bookings composable with TanStack Query
 * Manages client and lawyer bookings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient, type ApiResponse } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  RescheduleBookingInput,
  UpdateLawyerBookingInput,
} from '~/types'

export interface BookingFilters {
  status?: string
  upcoming?: boolean
}

// API functions
const bookingsAPI = {
  // Client Bookings
  getClientBookings: async (filters?: BookingFilters): Promise<Booking[]> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.upcoming !== undefined) params.append('upcoming', filters.upcoming.toString())

    const qs = params.toString()
    const url = qs ? `/api/bookings?${qs}` : '/api/bookings'

    const response = await httpClient.getAuth<ApiResponse<{ bookings: Booking[] } | Booking[]>>(url)

    // Handle both { bookings: [...] } and [...] responses
    if (response.data && 'bookings' in (response.data as any)) {
      return (response.data as any).bookings || []
    }
    return (response.data as Booking[]) || []
  },

  getUpcomingBookings: async (): Promise<Booking[]> => {
    const response = await httpClient.getAuth<ApiResponse<{ bookings: Booking[] } | Booking[]>>('/api/bookings/upcoming')
    if (response.data && 'bookings' in (response.data as any)) {
      return (response.data as any).bookings || []
    }
    return (response.data as Booking[]) || []
  },

  getClientBooking: async (id: string): Promise<Booking> => {
    const response = await httpClient.getAuth<ApiResponse<Booking>>(`/api/bookings/${id}`)
    if (!response.data) throw new Error('Booking not found')
    return response.data
  },

  createBooking: async (data: CreateBookingInput): Promise<Booking> => {
    const response = await httpClient.post<ApiResponse<Booking>>('/api/bookings', data)
    if (!response.data) throw new Error('Failed to create booking')
    return response.data
  },

  updateClientBooking: async (id: string, data: UpdateBookingInput): Promise<Booking> => {
    const response = await httpClient.put<ApiResponse<Booking>>(`/api/bookings/${id}`, data)
    if (!response.data) throw new Error('Failed to update booking')
    return response.data
  },

  cancelClientBooking: async (id: string, data: CancelBookingInput): Promise<Booking> => {
    const response = await httpClient.put<ApiResponse<{ booking: Booking }>>(`/api/bookings/${id}/cancel`, data)
    return (response.data as unknown as { booking: Booking }).booking || (response.data as unknown as Booking)
  },

  rescheduleClientBooking: async (id: string, data: RescheduleBookingInput): Promise<Booking> => {
    const response = await httpClient.put<ApiResponse<{ booking: Booking }>>(`/api/bookings/${id}/reschedule`, data)
    return (response.data as unknown as { booking: Booking }).booking || (response.data as unknown as Booking)
  },

  // Lawyer Bookings
  getLawyerBookings: async (): Promise<Booking[]> => {
    const response = await httpClient.getAuth<ApiResponse<Booking[]>>('/api/lawyer/bookings')
    return response.data || []
  },

  getLawyerBooking: async (id: string): Promise<Booking> => {
    const response = await httpClient.getAuth<ApiResponse<Booking>>(
      `/api/lawyer/bookings/${id}`
    )
    if (!response.data) throw new Error('Booking not found')
    return response.data
  },

  updateLawyerBooking: async (
    id: string,
    data: UpdateLawyerBookingInput
  ): Promise<Booking> => {
    const response = await httpClient.put<ApiResponse<Booking>>(
      `/api/lawyer/bookings/${id}`,
      data
    )
    if (!response.data) throw new Error('Failed to update booking')
    return response.data
  },
}

// Composable
export const useBookings = () => {
  const queryClient = useQueryClient()

  // Query: Get client bookings
  const useClientBookings = (filters?: Ref<BookingFilters> | BookingFilters) => {
    return useQuery({
      queryKey: computed(() => [...queryKeys.bookings.client, unref(filters)]),
      queryFn: () => bookingsAPI.getClientBookings(unref(filters)),
    })
  }

  // Query: Get upcoming client bookings
  const useUpcomingBookings = () => {
    return useQuery({
      queryKey: [...queryKeys.bookings.client, 'upcoming'],
      queryFn: bookingsAPI.getUpcomingBookings,
    })
  }

  // Query: Get client booking by ID
  const useClientBooking = (id: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => queryKeys.bookings.detail(id.value)),
      queryFn: () => bookingsAPI.getClientBooking(id.value),
      enabled: computed(() => !!id.value),
    })
  }

  // Mutation: Create booking
  const useCreateBooking = () => {
    return useMutation({
      mutationFn: bookingsAPI.createBooking,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.client })
      },
    })
  }

  // Mutation: Cancel client booking
  const useCancelBooking = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: CancelBookingInput }) =>
        bookingsAPI.cancelClientBooking(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.client })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) })
      },
    })
  }

  // Mutation: Reschedule client booking
  const useRescheduleBooking = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: RescheduleBookingInput }) =>
        bookingsAPI.rescheduleClientBooking(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.client })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) })
      },
    })
  }

  // Mutation: Update client booking
  const useUpdateClientBooking = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateBookingInput }) =>
        bookingsAPI.updateClientBooking(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.client })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) })
      },
    })
  }

  // Query: Get lawyer bookings
  const useLawyerBookings = () => {
    return useQuery({
      queryKey: queryKeys.bookings.lawyer,
      queryFn: bookingsAPI.getLawyerBookings,
    })
  }

  // Query: Get lawyer booking by ID
  const useLawyerBooking = (id: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => queryKeys.bookings.detail(id.value)),
      queryFn: () => bookingsAPI.getLawyerBooking(id.value),
      enabled: computed(() => !!id.value),
    })
  }

  // Mutation: Update lawyer booking with optimistic updates
  const useUpdateLawyerBooking = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateLawyerBookingInput }) =>
        bookingsAPI.updateLawyerBooking(id, data),
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.bookings.lawyer })
        const previousBookings = queryClient.getQueryData<Booking[]>(queryKeys.bookings.lawyer)

        if (previousBookings) {
          queryClient.setQueryData<Booking[]>(
            queryKeys.bookings.lawyer,
            previousBookings.map((booking) =>
              booking.id === id ? { ...booking, ...data } : booking
            )
          )
        }

        return { previousBookings }
      },
      onError: (_err, _variables, context) => {
        if (context?.previousBookings) {
          queryClient.setQueryData(queryKeys.bookings.lawyer, context.previousBookings)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lawyer })
      },
    })
  }

  return {
    useClientBookings,
    useUpcomingBookings,
    useClientBooking,
    useCreateBooking,
    useCancelBooking,
    useRescheduleBooking,
    useUpdateClientBooking,
    useLawyerBookings,
    useLawyerBooking,
    useUpdateLawyerBooking,
  }
}
