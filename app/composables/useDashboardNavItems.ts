import type { DashboardNavItem } from '@/types/dashboard-nav'
import {
  clientMainNav,
  clientSupportNav,
  dashboardNavIcons,
  lawyerMainNav,
  lawyerSupportNav,
  type DashboardNavDefinition,
} from '@/config/dashboard-nav'
import { getSessionUserType } from '~/lib/session-user'

function toNavItems(
  definitions: DashboardNavDefinition[],
  badges: Partial<Record<string, string | undefined>>,
): DashboardNavItem[] {
  return definitions.map((item) => ({
    label: item.label,
    to: item.to,
    exact: item.exact,
    iconComponent: dashboardNavIcons[item.icon],
    badge: badges[item.to],
  }))
}

export function useDashboardNavItems() {
  const { session } = useAuth()
  const role = computed(() => getSessionUserType(session.value?.user) as 'client' | 'lawyer' | undefined)

  const {
    clientUpcomingBookingsBadge,
    unreadMessagesBadge,
    activeCasesBadge,
    lawyerPendingAppointmentsBadge,
    lawyerSubscriptionBadge,
  } = useDashboardNavBadges()

  const mainLinks = computed<DashboardNavItem[]>(() => {
    if (role.value === 'lawyer') {
      return toNavItems(lawyerMainNav, {
        '/dashboard/cases': activeCasesBadge.value,
        '/dashboard/appointments': lawyerPendingAppointmentsBadge.value,
        '/dashboard/messages': unreadMessagesBadge.value,
      })
    }

    if (role.value === 'client') {
      return toNavItems(clientMainNav, {
        '/dashboard/bookings': clientUpcomingBookingsBadge.value,
        '/dashboard/messages': unreadMessagesBadge.value,
      })
    }

    return []
  })

  const supportLinks = computed<DashboardNavItem[]>(() => {
    if (role.value === 'lawyer') {
      return toNavItems(lawyerSupportNav, {
        '/dashboard/subscription': lawyerSubscriptionBadge.value,
      })
    }

    if (role.value === 'client')
      return toNavItems(clientSupportNav, {})

    return []
  })

  const primaryCta = computed(() => {
    if (role.value === 'lawyer') {
      return {
        label: 'Set availability',
        to: '/dashboard/availability',
        icon: dashboardNavIcons.availability,
      }
    }

    return {
      label: 'Find a lawyer',
      to: '/find-lawyers',
      icon: dashboardNavIcons.findLawyer,
    }
  })

  const mainGroupLabel = computed(() => {
    return role.value === 'lawyer' ? 'Practice' : 'Workspace'
  })

  return {
    mainLinks,
    supportLinks,
    primaryCta,
    mainGroupLabel,
    role,
  }
}
