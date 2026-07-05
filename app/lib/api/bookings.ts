/**
 * Bookings API Module
 * Centralized API calls for booking management
 */

import { httpClient, type ApiResponse } from './client'
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  RescheduleBookingInput,
  UpdateLawyerBookingInput,
  RecordEngagementInput,
  RecordEngagementResponse,
} from '~/types'

export interface BookingFilters {
  status?: string
  upcoming?: boolean
  date?: string
}

const BASE_PATH = '/api/bookings'
const LAWYER_BASE_PATH = '/api/lawyer/bookings'

export const bookingsAPI = {
  // ==================== Client Bookings ====================
  
  /**
   * Get all bookings for the authenticated client
   */
  getClientBookings: async (filters?: BookingFilters): Promise<Booking[]> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.upcoming !== undefined) params.append('upcoming', filters.upcoming.toString())

    const qs = params.toString()
    const url = qs ? `${BASE_PATH}?${qs}` : BASE_PATH

    const response = await httpClient.getAuth<{ bookings: Booking[] }>(url)

    // API returns { bookings: [...] } directly (not wrapped in ApiResponse)
    if (response && typeof response === 'object' && 'bookings' in response) {
      const result = response.bookings || []
      return result
    }

    // Fallback: check if response is already an array
    if (Array.isArray(response)) {
      return response
    }
    
    console.warn('⚠️ Unexpected response format:', response)
    return []
  },

  /**
   * Get upcoming bookings for the authenticated client
   */
  getUpcomingBookings: async (): Promise<Booking[]> => {
    const response = await httpClient.getAuth<{ bookings: Booking[] }>(
      `${BASE_PATH}?upcoming=true`
    )
    
    if (response && typeof response === 'object' && 'bookings' in response) {
      return response.bookings || []
    }
    
    if (Array.isArray(response)) {
      return response
    }
    
    return []
  },

  /**
   * Get a specific booking by ID (client)
   */
  getClientBooking: async (id: string): Promise<Booking> => {
    const response = await httpClient.getAuth<{ booking: Booking } | Booking>(`${BASE_PATH}/${id}`)
    
    // Handle both { booking: {...} } and {...} responses
    if (response && typeof response === 'object' && 'booking' in response) {
      if (!response.booking) throw new Error('Booking not found')
      return response.booking
    }
    
    if (!response) throw new Error('Booking not found')
    return response as Booking
  },

  /**
   * Create a new booking
   */
  createBooking: async (data: CreateBookingInput): Promise<Booking> => {
    const response = await httpClient.post<{ booking: Booking } | Booking>(BASE_PATH, data)
    
    if (response && typeof response === 'object' && 'booking' in response) {
      if (!response.booking) throw new Error('Failed to create booking')
      return response.booking
    }
    
    if (!response) throw new Error('Failed to create booking')
    return response as Booking
  },

  /**
   * Update a client booking
   */
  updateClientBooking: async (id: string, data: UpdateBookingInput): Promise<Booking> => {
    const response = await httpClient.put<{ booking: Booking } | Booking>(`${BASE_PATH}/${id}`, data)
    
    if (response && typeof response === 'object' && 'booking' in response) {
      if (!response.booking) throw new Error('Failed to update booking')
      return response.booking
    }
    
    if (!response) throw new Error('Failed to update booking')
    return response as Booking
  },

  /**
   * Cancel a booking (client)
   */
  cancelClientBooking: async (id: string, data: CancelBookingInput): Promise<Booking> => {
    const response = await httpClient.put<{ booking: Booking }>(
      `${BASE_PATH}/${id}/cancel`,
      data
    )
    if (!response.booking) throw new Error('Failed to cancel booking')
    return response.booking
  },

  /**
   * Reschedule a booking (client)
   */
  rescheduleClientBooking: async (id: string, data: RescheduleBookingInput): Promise<Booking> => {
    const response = await httpClient.put<{ booking: Booking }>(
      `${BASE_PATH}/${id}/reschedule`,
      data
    )
    if (!response.booking) throw new Error('Failed to reschedule booking')
    return response.booking
  },

  // ==================== Lawyer Bookings ====================

  /**
   * Get all bookings for the authenticated lawyer
   */
  getLawyerBookings: async (filters?: BookingFilters): Promise<Booking[]> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.upcoming !== undefined) params.append('upcoming', filters.upcoming.toString())
    if (filters?.date) params.append('date', filters.date)

    const qs = params.toString()
    const url = qs ? `${LAWYER_BASE_PATH}?${qs}` : LAWYER_BASE_PATH

    const response = await httpClient.getAuth<{ bookings: Booking[] }>(url)

    if (response && typeof response === 'object' && 'bookings' in response) {
      const result = response.bookings || []
      return result
    }

    if (Array.isArray(response)) {
      return response
    }
    
    console.warn('⚠️ Unexpected response format:', response)
    return []
  },

  /**
   * Get a specific booking by ID (lawyer)
   */
  getLawyerBooking: async (id: string): Promise<Booking> => {
    const response = await httpClient.getAuth<{ booking: Booking } | Booking>(
      `${LAWYER_BASE_PATH}/${id}`
    )
    
    if (response && typeof response === 'object' && 'booking' in response) {
      if (!response.booking) throw new Error('Booking not found')
      return response.booking
    }
    
    if (!response) throw new Error('Booking not found')
    return response as Booking
  },

  /**
   * Confirm a pending booking (creates conversation)
   */
  confirmBooking: async (id: string): Promise<Booking> => {
    const response = await httpClient.put<{ booking: Booking }>(
      `${LAWYER_BASE_PATH}/${id}/confirm`
    )
    if (!response.booking) throw new Error('Failed to confirm booking')
    return response.booking
  },

  /**
   * Mark booking as completed
   */
  completeBooking: async (id: string): Promise<Booking> => {
    const response = await httpClient.put<{ booking: Booking }>(
      `${LAWYER_BASE_PATH}/${id}/complete`
    )
    if (!response.booking) throw new Error('Failed to complete booking')
    return response.booking
  },

  /**
   * Mark booking as no-show
   */
  markAsNoShow: async (id: string): Promise<Booking> => {
    const response = await httpClient.put<{ booking: Booking }>(
      `${LAWYER_BASE_PATH}/${id}/no-show`
    )
    if (!response.booking) throw new Error('Failed to mark as no-show')
    return response.booking
  },

  /**
   * Cancel a booking (lawyer)
   */
  cancelLawyerBooking: async (id: string, data: CancelBookingInput): Promise<Booking> => {
    const response = await httpClient.put<{ booking: Booking }>(
      `${LAWYER_BASE_PATH}/${id}/cancel`,
      data
    )
    if (!response.booking) throw new Error('Failed to cancel booking')
    return response.booking
  },

  /**
   * Update lawyer booking
   */
  updateLawyerBooking: async (id: string, data: UpdateLawyerBookingInput): Promise<Booking> => {
    const response = await httpClient.put<{ booking: Booking } | Booking>(
      `${LAWYER_BASE_PATH}/${id}`,
      data
    )
    
    if (response && typeof response === 'object' && 'booking' in response) {
      if (!response.booking) throw new Error('Failed to update booking')
      return response.booking
    }
    
    if (!response) throw new Error('Failed to update booking')
    return response as Booking
  },

  /**
   * Record engagement outcome after consultation
   * Creates a case if client was hired
   */
  recordEngagement: async (
    id: string,
    data: RecordEngagementInput
  ): Promise<RecordEngagementResponse> => {
    const response = await httpClient.post<RecordEngagementResponse>(
      `${LAWYER_BASE_PATH}/${id}/engagement`,
      data
    )
    if (!response) throw new Error('Failed to record engagement')
    return response
  },
}
