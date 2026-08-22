import type { Hugeicon } from '@/lib/icon-types'
import { Briefcase01Icon, Calendar01Icon, Clock01Icon, CreditCardIcon, DashboardSquare01Icon, LegalDocument01Icon, Message01Icon, Notification03Icon, Settings01Icon, UserCircleIcon, UserIcon } from '@hugeicons/core-free-icons'

export type DashboardIcon = Hugeicon

export interface DashboardNavLink {
  title: string
  to: string
  icon?: DashboardIcon
  exact?: boolean
  lawyerOnly?: boolean
  clientOnly?: boolean
  /** Sidebar section label. Ungrouped links (Overview) render above the first group. */
  group?: string
}

// Nav is grouped by what the user is doing, not by feature name:
// "Today" = time-sensitive surfaces, "Practice"/"My legal life" = the
// durable objects they manage, "Account" = self-service.
// Lawyer "Listing" is the public directory object (not personal account profile).
// Today = operational work; Practice = how clients book you; Account = self-service.
const lawyerDashboardNav: DashboardNavLink[] = [
  { title: 'Overview', to: '/dashboard', icon: DashboardSquare01Icon, exact: true },
  { title: 'Appointments', to: '/dashboard/appointments', icon: Calendar01Icon, lawyerOnly: true, group: 'Today' },
  { title: 'Messages', to: '/dashboard/messages', icon: Message01Icon, group: 'Today' },
  { title: 'Notifications', to: '/dashboard/notifications', icon: Notification03Icon, group: 'Today' },
  { title: 'Cases', to: '/dashboard/cases', icon: Briefcase01Icon, lawyerOnly: true, group: 'Today' },
  { title: 'Listing', to: '/dashboard/profile', icon: UserCircleIcon, lawyerOnly: true, group: 'Practice' },
  { title: 'Consultation Types', to: '/dashboard/consultation-types', icon: LegalDocument01Icon, lawyerOnly: true, group: 'Practice' },
  { title: 'Availability', to: '/dashboard/availability', icon: Clock01Icon, lawyerOnly: true, group: 'Practice' },
  { title: 'Subscription', to: '/dashboard/subscription', icon: CreditCardIcon, lawyerOnly: true, group: 'Account' },
  { title: 'Settings', to: '/dashboard/settings', icon: Settings01Icon, group: 'Account' },
]

const clientDashboardNav: DashboardNavLink[] = [
  { title: 'Overview', to: '/dashboard', icon: DashboardSquare01Icon, exact: true },
  { title: 'My Bookings', to: '/dashboard/bookings', icon: Calendar01Icon, clientOnly: true, group: 'Today' },
  { title: 'Messages', to: '/dashboard/messages', icon: Message01Icon, group: 'Today' },
  { title: 'Notifications', to: '/dashboard/notifications', icon: Notification03Icon, group: 'Today' },
  { title: 'My Cases', to: '/dashboard/cases', icon: Briefcase01Icon, clientOnly: true, group: 'My legal life' },
  { title: 'My Lawyers', to: '/dashboard/my-lawyers', icon: UserIcon, clientOnly: true, group: 'My legal life' },
  { title: 'Profile', to: '/dashboard/profile', icon: UserCircleIcon, clientOnly: true, group: 'Account' },
  { title: 'Settings', to: '/dashboard/settings', icon: Settings01Icon, group: 'Account' },
]

export const dashboardNavByRole = {
  lawyer: lawyerDashboardNav,
  client: clientDashboardNav,
} as const

function filterLink(link: DashboardNavLink, role: 'lawyer' | 'client'): DashboardNavLink | null {
  if (link.lawyerOnly && role !== 'lawyer')
    return null
  if (link.clientOnly && role !== 'client')
    return null
  return link
}

export function filterNavForRole(
  links: DashboardNavLink[],
  role: 'lawyer' | 'client',
): DashboardNavLink[] {
  return links
    .map(link => filterLink(link, role))
    .filter((link): link is DashboardNavLink => link !== null)
}

export function getDashboardNavForRole(role: 'lawyer' | 'client' | undefined): DashboardNavLink[] | null {
  if (role === 'lawyer')
    return lawyerDashboardNav
  if (role === 'client')
    return clientDashboardNav
  return null
}

export function isDashboardNavActive(
  path: string,
  link: Pick<DashboardNavLink, 'to' | 'exact'>,
): boolean {
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path || '/'

  if (link.exact)
    return normalized === link.to || normalized === `${link.to}/`

  return normalized === link.to || normalized.startsWith(`${link.to}/`)
}

export function getNavBadgeKey(to: string): string {
  return to
}
