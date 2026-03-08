/**
 * Client Booking composable with TanStack Query
 * Handles available slots and booking creation for clients
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient, type ApiResponse } from '~/lib/api/client'
import type { Booking, CreateBookingInput } from '~/types'

// Types for available slots
export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
  reason?: string
}

export interface AvailableSlotsResponse {
  date: string
  timezone: string
  slots: TimeSlot[]
  consultationType: {
    id: string
    name: string
    durationMinutes: number
    price: string
    currency: string
  }
}

export interface NextAvailableResponse {
  date: string | null
  time: string | null
  message?: string
  consultationType?: {
    id: string
    name: string
    durationMinutes: number
  }
}

export interface SlotAvailabilityCheck {
  available: boolean
  reason?: string
}

// API functions
const clientBookingAPI = {
  // Get available slots for a single date
  getAvailableSlots: async (
    lawyerId: string,
    date: string,
    consultationTypeId: string,
    timezone: string = 'Africa/Lagos',
    onlyAvailable: boolean = false
  ): Promise<AvailableSlotsResponse> => {
    const params = new URLSearchParams({
      date,
      consultationTypeId,
      timezone,
      ...(onlyAvailable && { onlyAvailable: 'true' })
    })
    
    const response = await httpClient.get<AvailableSlotsResponse>(
      `/api/lawyers/${lawyerId}/available-slots?${params}`
    )
    return response
  },

  // Get available slots for date range
  getAvailableSlotsRange: async (
    lawyerId: string,
    startDate: string,
    endDate: string,
    consultationTypeId: string,
    timezone: string = 'Africa/Lagos'
  ): Promise<{ results: AvailableSlotsResponse[] }> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      consultationTypeId,
      timezone
    })
    
    const response = await httpClient.get<{ results: AvailableSlotsResponse[] }>(
      `/api/lawyers/${lawyerId}/available-slots/range?${params}`
    )
    return response
  },

  // Check specific slot availability
  checkSlotAvailability: async (
    lawyerId: string,
    date: string,
    time: string,
    consultationTypeId: string,
    timezone: string = 'Africa/Lagos'
  ): Promise<SlotAvailabilityCheck> => {
    const params = new URLSearchParams({
      date,
      time,
      consultationTypeId,
      timezone
    })
    
    const response = await httpClient.get<SlotAvailabilityCheck>(
      `/api/lawyers/${lawyerId}/available-slots/check?${params}`
    )
    return response
  },

  // Get next available slot
  getNextAvailable: async (
    lawyerId: string,
    consultationTypeId: string,
    timezone: string = 'Africa/Lagos'
  ): Promise<NextAvailableResponse> => {
    const params = new URLSearchParams({
      consultationTypeId,
      timezone
    })
    
    const response = await httpClient.get<NextAvailableResponse>(
      `/api/lawyers/${lawyerId}/next-available?${params}`
    )
    return response
  },

  // Create booking
  createBooking: async (data: CreateBookingInput): Promise<Booking> => {
    const response = await httpClient.post<ApiResponse<{ booking: Booking }> >(
      '/api/bookings',
      data
    )
    if (!response.data?.booking) throw new Error('Failed to create booking')
    return response.data.booking
  }
}

// Composable
export const useClientBooking = () => {
  const queryClient = useQueryClient()

  // Query: Get available slots for single date
  const useAvailableSlots = (
    lawyerId: Ref<string>,
    date: Ref<string>,
    consultationTypeId: Ref<string>,
    timezone: Ref<string> = ref('Africa/Lagos'),
    onlyAvailable: Ref<boolean> = ref(false)
  ) => {
    return useQuery({
      queryKey: computed(() => [
        'available-slots',
        lawyerId.value,
        date.value,
        consultationTypeId.value,
        timezone.value,
        onlyAvailable.value
      ]),
      queryFn: () =>
        clientBookingAPI.getAvailableSlots(
          lawyerId.value,
          date.value,
          consultationTypeId.value,
          timezone.value,
          onlyAvailable.value
        ),
      enabled: computed(
        () => !!lawyerId.value && !!date.value && !!consultationTypeId.value
      ),
      staleTime: 1000 * 60 * 2, // 2 minutes
    })
  }

  // Query: Get available slots for date range
  const useAvailableSlotsRange = (
    lawyerId: Ref<string>,
    startDate: Ref<string>,
    endDate: Ref<string>,
    consultationTypeId: Ref<string>,
    timezone: Ref<string> = ref('Africa/Lagos')
  ) => {
    return useQuery({
      queryKey: computed(() => [
        'available-slots-range',
        lawyerId.value,
        startDate.value,
        endDate.value,
        consultationTypeId.value,
        timezone.value
      ]),
      queryFn: () =>
        clientBookingAPI.getAvailableSlotsRange(
          lawyerId.value,
          startDate.value,
          endDate.value,
          consultationTypeId.value,
          timezone.value
        ),
      enabled: computed(
        () =>
          !!lawyerId.value &&
          !!startDate.value &&
          !!endDate.value &&
          !!consultationTypeId.value
      ),
      staleTime: 1000 * 60 * 2, // 2 minutes
    })
  }

  // Query: Check specific slot availability
  const useCheckSlotAvailability = (
    lawyerId: Ref<string>,
    date: Ref<string>,
    time: Ref<string>,
    consultationTypeId: Ref<string>,
    timezone: Ref<string> = ref('Africa/Lagos')
  ) => {
    return useQuery({
      queryKey: computed(() => [
        'check-slot',
        lawyerId.value,
        date.value,
        time.value,
        consultationTypeId.value,
        timezone.value
      ]),
      queryFn: () =>
        clientBookingAPI.checkSlotAvailability(
          lawyerId.value,
          date.value,
          time.value,
          consultationTypeId.value,
          timezone.value
        ),
      enabled: computed(
        () =>
          !!lawyerId.value &&
          !!date.value &&
          !!time.value &&
          !!consultationTypeId.value
      ),
      staleTime: 1000 * 30, // 30 seconds
    })
  }

  // Query: Get next available slot
  const useNextAvailable = (
    lawyerId: Ref<string>,
    consultationTypeId: Ref<string>,
    timezone: Ref<string> = ref('Africa/Lagos')
  ) => {
    return useQuery({
      queryKey: computed(() => [
        'next-available',
        lawyerId.value,
        consultationTypeId.value,
        timezone.value
      ]),
      queryFn: () =>
        clientBookingAPI.getNextAvailable(
          lawyerId.value,
          consultationTypeId.value,
          timezone.value
        ),
      enabled: computed(() => !!lawyerId.value && !!consultationTypeId.value),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })
  }

  // Mutation: Create booking
  const useCreateClientBooking = () => {
    return useMutation({
      mutationFn: clientBookingAPI.createBooking,
      onSuccess: () => {
        // Invalidate all booking-related queries
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      },
    })
  }

  return {
    useAvailableSlots,
    useAvailableSlotsRange,
    useCheckSlotAvailability,
    useNextAvailable,
    useCreateClientBooking,
  }
}
