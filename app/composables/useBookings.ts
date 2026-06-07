/**
 * Bookings composable with TanStack Query
 * Manages client and lawyer bookings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '~/lib/query-client'
import { bookingsAPI, type BookingFilters } from '~/lib/api/bookings'
import type {
  Booking,
  UpdateBookingInput,
  CancelBookingInput,
  RescheduleBookingInput,
  UpdateLawyerBookingInput,
  RecordEngagementInput,
  CreateBookingInput,
} from '~/types'

type BookingsQueryOptions = {
  enabled?: MaybeRef<boolean>
}

export const useBookings = () => {
  const queryClient = useQueryClient()

  // Query: Get client bookings
  const useClientBookings = (
    filters?: Ref<BookingFilters> | BookingFilters,
    options?: BookingsQueryOptions,
  ) => {
    return useQuery({
      queryKey: computed(() => [...queryKeys.bookings.client, unref(filters)]),
      queryFn: () => bookingsAPI.getClientBookings(unref(filters)),
      enabled: computed(() => options?.enabled === undefined || !!unref(options.enabled)),
    })
  }

  // Query: Get upcoming client bookings
  const useUpcomingBookings = (options?: BookingsQueryOptions) => {
    return useQuery({
      queryKey: [...queryKeys.bookings.client, 'upcoming'],
      queryFn: bookingsAPI.getUpcomingBookings,
      enabled: computed(() => options?.enabled === undefined || !!unref(options.enabled)),
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
  const useLawyerBookings = (
    filters?: Ref<{ status?: string; upcoming?: boolean; date?: string }>,
    options?: BookingsQueryOptions,
  ) => {
    return useQuery({
      queryKey: computed(() => [...queryKeys.bookings.lawyer, unref(filters)]),
      queryFn: () => bookingsAPI.getLawyerBookings(unref(filters)),
      enabled: computed(() => options?.enabled === undefined || !!unref(options.enabled)),
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

  // Mutation: Confirm booking
  const useConfirmBooking = () => {
    return useMutation({
      mutationFn: (id: string) => bookingsAPI.confirmBooking(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lawyer })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) })
      },
    })
  }

  // Mutation: Complete booking
  const useCompleteBooking = () => {
    return useMutation({
      mutationFn: (id: string) => bookingsAPI.completeBooking(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lawyer })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) })
      },
    })
  }

  // Mutation: Mark as no-show
  const useMarkAsNoShow = () => {
    return useMutation({
      mutationFn: (id: string) => bookingsAPI.markAsNoShow(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lawyer })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) })
      },
    })
  }

  // Mutation: Cancel lawyer booking
  const useCancelLawyerBooking = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: CancelBookingInput }) =>
        bookingsAPI.cancelLawyerBooking(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lawyer })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) })
      },
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

  // Mutation: Record engagement outcome
  const useRecordEngagement = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: RecordEngagementInput }) =>
        bookingsAPI.recordEngagement(id, data),
      onSuccess: (result, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lawyer })
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) })
        
        // If client was hired, invalidate cases queries
        if (result.case) {
          queryClient.invalidateQueries({ queryKey: queryKeys.cases.lawyer })
        }
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
    useConfirmBooking,
    useCompleteBooking,
    useMarkAsNoShow,
    useCancelLawyerBooking,
    useUpdateLawyerBooking,
    useRecordEngagement,
  }
}
