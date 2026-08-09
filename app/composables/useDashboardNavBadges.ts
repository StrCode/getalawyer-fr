import type { Booking } from '~/types/booking'
import type { ConversationInfo } from '~/types/messaging'
import { useSubscriptionStatus } from '~/composables/useSubscription'
import {
  getListingProgressTone,
  LISTING_PROGRESS_NAV_BADGE_CLASS,
} from '@/lib/listing-progress'
import { getSessionUserType } from '~/lib/session-user'

export type DashboardNavBadge = {
  label: string
  className?: string
}

function badgeFromCount(count: number): DashboardNavBadge | undefined {
  return count > 0 ? { label: String(count) } : undefined
}

function badgeAlert(label = '!'): DashboardNavBadge {
  return {
    label,
    className: 'border-0 bg-amber-500/15 text-amber-800 dark:text-amber-400',
  }
}

/**
 * Sidebar badge counts. Returns undefined until data is fetched and only when count > 0
 * (except listing progress, which shows a percent until complete).
 */
export function useDashboardNavBadges() {
  const { session } = useAuth()
  const role = computed(() => getSessionUserType(session.value?.user))
  const { isUpcomingBooking } = useBookingDisplay()

  const { useClientBookings, useLawyerBookings } = useBookings()
  const isClient = computed(() => role.value === 'client')
  const isLawyer = computed(() => role.value === 'lawyer')

  const { data: clientBookings, isFetched: clientBookingsFetched } = useClientBookings(undefined, {
    enabled: isClient,
  })
  const { data: lawyerBookings, isFetched: lawyerBookingsFetched } = useLawyerBookings(undefined, {
    enabled: isLawyer,
  })

  const { useConversations } = useMessaging()
  const { data: conversations, isFetched: conversationsFetched } = useConversations()

  const { useCasesList } = useCases()
  const { data: casesData, isFetched: casesFetched } = useCasesList()

  const { data: subscriptionStatus, isFetched: subscriptionFetched } = useSubscriptionStatus({
    enabled: computed(() => role.value === 'lawyer'),
  })

  const {
    profileQuery,
    profileStrength,
  } = useLawyerProfileEditor({
    enabled: computed(() => role.value === 'lawyer'),
  })

  const { useConsultationTypesList } = useConsultationTypes()
  const { data: consultationTypes, isFetched: consultationTypesFetched } = useConsultationTypesList(
    false,
    { enabled: isLawyer },
  )

  const { useAvailabilitySchedule } = useAvailability()
  const { data: availabilitySchedule, isFetched: availabilityFetched } = useAvailabilitySchedule({
    enabled: isLawyer,
  })

  const clientUpcomingBookingsBadge = computed((): DashboardNavBadge | undefined => {
    if (role.value !== 'client' || !clientBookingsFetched.value) return undefined
    const count = (clientBookings.value ?? []).filter((b: Booking) => isUpcomingBooking(b)).length
    return badgeFromCount(count)
  })

  const unreadMessagesBadge = computed((): DashboardNavBadge | undefined => {
    if (!conversationsFetched.value) return undefined
    const count = (conversations.value ?? []).reduce(
      (sum: number, c: ConversationInfo) => sum + (c.unreadCount ?? 0),
      0,
    )
    return badgeFromCount(count)
  })

  const activeCasesBadge = computed((): DashboardNavBadge | undefined => {
    if (role.value !== 'lawyer' && role.value !== 'client') return undefined
    if (!casesFetched.value) return undefined
    const count = (casesData.value?.cases ?? []).filter(
      (c) => c.status === 'active' || c.status === 'reopened',
    ).length
    return badgeFromCount(count)
  })

  const lawyerPendingAppointmentsBadge = computed((): DashboardNavBadge | undefined => {
    if (role.value !== 'lawyer' || !lawyerBookingsFetched.value) return undefined
    const count = (lawyerBookings.value ?? []).filter((b: Booking) => b.status === 'pending').length
    return badgeFromCount(count)
  })

  /** Shown when lawyer has no active membership. */
  const lawyerSubscriptionBadge = computed((): DashboardNavBadge | undefined => {
    if (role.value !== 'lawyer' || !subscriptionFetched.value) return undefined
    return subscriptionStatus.value?.hasActiveSubscription ? undefined : badgeAlert()
  })

  /**
   * Listing progress (Mobbin/Aboard-style percent). Color tracks completion
   * band; hidden once the checklist hits 100%.
   */
  const lawyerListingBadge = computed((): DashboardNavBadge | undefined => {
    if (role.value !== 'lawyer' || !profileQuery.isFetched.value) return undefined
    const percent = profileStrength.value?.percent
    if (percent == null) return undefined
    if (percent >= 100) return undefined
    const tone = getListingProgressTone(percent)
    return {
      label: `${percent}%`,
      className: LISTING_PROGRESS_NAV_BADGE_CLASS[tone],
    }
  })

  /** Nudge until at least one active consultation type exists. */
  const lawyerConsultationTypesBadge = computed((): DashboardNavBadge | undefined => {
    if (role.value !== 'lawyer' || !consultationTypesFetched.value) return undefined
    const active = (consultationTypes.value ?? []).filter((t) => t.isActive).length
    return active > 0 ? undefined : badgeAlert()
  })

  /** Nudge until at least one weekday is open for booking. */
  const lawyerAvailabilityBadge = computed((): DashboardNavBadge | undefined => {
    if (role.value !== 'lawyer' || !availabilityFetched.value) return undefined
    const hasOpenDay = (availabilitySchedule.value ?? []).some((row) => row.isAvailable)
    return hasOpenDay ? undefined : badgeAlert()
  })

  return {
    clientUpcomingBookingsBadge,
    unreadMessagesBadge,
    activeCasesBadge,
    lawyerPendingAppointmentsBadge,
    lawyerSubscriptionBadge,
    lawyerListingBadge,
    lawyerConsultationTypesBadge,
    lawyerAvailabilityBadge,
  }
}
