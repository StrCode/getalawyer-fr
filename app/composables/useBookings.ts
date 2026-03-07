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
  UpdateLawyerBookingInput,
} from '~/types'

// API functions
const bookingsAPI = {
  // Client Bookings
  getClientBookings: async (): Promise<Booking[]> => {
    const response = await httpClient.getAuth<ApiResponse<Booking[]>>('/api/bookings')
    return response.data || []
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
  const useClientBookings = () => {
    return useQuery({
      queryKey: queryKeys.bookings.client,
      queryFn: bookingsAPI.getClientBookings,
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
    useClientBooking,
    useCreateBooking,
    useUpdateClientBooking,
    useLawyerBookings,
    useLawyerBooking,
    useUpdateLawyerBooking,
  }
}
