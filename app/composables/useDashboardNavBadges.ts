import type { Booking } from '~/types/booking'
import type { ConversationInfo } from '~/types/messaging'

function badgeFromCount(count: number): string | undefined {
  return count > 0 ? String(count) : undefined
}

/**
 * Sidebar badge counts. Returns undefined until data is fetched and only when count > 0.
 */
export function useDashboardNavBadges() {
  const { session } = useAuth()
  const role = computed(() => session.value?.user.userType)
  const { isUpcomingBooking } = useBookingDisplay()

  const { useClientBookings, useLawyerBookings } = useBookings()
  const { data: clientBookings, isFetched: clientBookingsFetched } = useClientBookings()
  const { data: lawyerBookings, isFetched: lawyerBookingsFetched } = useLawyerBookings()

  const { useConversations } = useMessaging()
  const { data: conversations, isFetched: conversationsFetched } = useConversations()

  const { useCasesList } = useCases()
  const { data: casesData, isFetched: casesFetched } = useCasesList()

  const clientUpcomingBookingsBadge = computed(() => {
    if (role.value !== 'client' || !clientBookingsFetched.value) return undefined
    const count = (clientBookings.value ?? []).filter((b: Booking) => isUpcomingBooking(b)).length
    return badgeFromCount(count)
  })

  const unreadMessagesBadge = computed(() => {
    if (!conversationsFetched.value) return undefined
    const count = (conversations.value ?? []).reduce(
      (sum: number, c: ConversationInfo) => sum + (c.unreadCount ?? 0),
      0,
    )
    return badgeFromCount(count)
  })

  const activeCasesBadge = computed(() => {
    if (!casesFetched.value) return undefined
    const count = (casesData.value?.cases ?? []).filter(c => c.status === 'active').length
    return badgeFromCount(count)
  })

  const lawyerPendingAppointmentsBadge = computed(() => {
    if (role.value !== 'lawyer' || !lawyerBookingsFetched.value) return undefined
    const count = (lawyerBookings.value ?? []).filter((b: Booking) => b.status === 'pending').length
    return badgeFromCount(count)
  })

  return {
    clientUpcomingBookingsBadge,
    unreadMessagesBadge,
    activeCasesBadge,
    lawyerPendingAppointmentsBadge,
  }
}
