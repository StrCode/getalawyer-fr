import type { BadgeVariants } from '@/components/ui/badge'
import type { Booking, BookingStatus } from '~/types/booking'

const LOCALE = 'en-US'

export function useBookingDisplay() {
  function formatBookingDate(date: string, options?: Intl.DateTimeFormatOptions) {
    return new Date(date).toLocaleDateString(LOCALE, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      ...options,
    })
  }

  function formatBookingDateLong(date: string) {
    return new Date(date).toLocaleDateString(LOCALE, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function formatStatusLabel(status: BookingStatus | string) {
    return status.replace('_', ' ')
  }

  function bookingStatusBadge(status: string): {
    variant: NonNullable<BadgeVariants['variant']>
    class: string
  } {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return {
          variant: 'secondary',
          class: 'border-transparent bg-muted text-primary capitalize',
        }
      case 'pending':
        return {
          variant: 'outline',
          class: 'border-amber-200 bg-amber-50 text-amber-800 capitalize',
        }
      case 'cancelled':
      case 'no_show':
        return { variant: 'destructive', class: 'capitalize' }
      default:
        return { variant: 'secondary', class: 'capitalize' }
    }
  }

  function isUpcomingBooking(booking: Booking) {
    if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'no_show') {
      return false
    }
    const scheduled = new Date(`${booking.scheduledDate}T${booking.scheduledStartTime}`)
    return scheduled >= new Date()
  }

  function sortBookingsByDate(bookings: Booking[]) {
    return [...bookings].sort((a, b) => {
      const aTime = new Date(`${a.scheduledDate}T${a.scheduledStartTime}`).getTime()
      const bTime = new Date(`${b.scheduledDate}T${b.scheduledStartTime}`).getTime()
      return aTime - bTime
    })
  }

  function getNextBooking(bookings: Booking[]) {
    return sortBookingsByDate(bookings.filter(isUpcomingBooking))[0] ?? null
  }

  function getAgendaBookings(bookings: Booking[], limit = 5) {
    return sortBookingsByDate(bookings.filter(isUpcomingBooking)).slice(0, limit)
  }

  function formatRelativeSchedule(booking: Booking) {
    const scheduled = new Date(`${booking.scheduledDate}T${booking.scheduledStartTime}`)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const bookingDay = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate())
    const diffDays = Math.round((bookingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    const time = booking.scheduledStartTime.slice(0, 5)

    if (diffDays === 0) return `Today at ${time}`
    if (diffDays === 1) return `Tomorrow at ${time}`
    if (diffDays > 1 && diffDays <= 7) {
      return `${formatBookingDate(booking.scheduledDate)} at ${time}`
    }
    return `${formatBookingDateLong(booking.scheduledDate)} at ${time}`
  }

  return {
    formatBookingDate,
    formatBookingDateLong,
    formatStatusLabel,
    bookingStatusBadge,
    isUpcomingBooking,
    sortBookingsByDate,
    getNextBooking,
    getAgendaBookings,
    formatRelativeSchedule,
  }
}
