import { appIcons, type AppIconData } from '@/lib/app-icons'

export type DashboardIcon = AppIconData

export interface DashboardNavLink {
  title: string
  to: string
  icon?: DashboardIcon
  exact?: boolean
  lawyerOnly?: boolean
  clientOnly?: boolean
}

const lawyerDashboardNav: DashboardNavLink[] = [
  { title: 'Overview', to: '/dashboard', icon: appIcons.dashboardSquare, exact: true },
  { title: 'Cases', to: '/dashboard/cases', icon: appIcons.briefcase, lawyerOnly: true },
  { title: 'Appointments', to: '/dashboard/appointments', icon: appIcons.calendar, lawyerOnly: true },
  { title: 'Messages', to: '/dashboard/messages', icon: appIcons.chatCircle },
  { title: 'Consultation Types', to: '/dashboard/consultation-types', icon: appIcons.legalDocument, lawyerOnly: true },
  { title: 'Availability', to: '/dashboard/availability', icon: appIcons.clock, lawyerOnly: true },
  { title: 'Profile', to: '/dashboard/profile', icon: appIcons.userCircle, lawyerOnly: true },
  { title: 'Subscription', to: '/dashboard/subscription', icon: appIcons.creditCard, lawyerOnly: true },
  { title: 'Settings', to: '/dashboard/settings', icon: appIcons.gearSix },
]

const clientDashboardNav: DashboardNavLink[] = [
  { title: 'Overview', to: '/dashboard', icon: appIcons.dashboardSquare, exact: true },
  { title: 'My Bookings', to: '/dashboard/bookings', icon: appIcons.calendar, clientOnly: true },
  { title: 'Messages', to: '/dashboard/messages', icon: appIcons.chatCircle },
  { title: 'Profile', to: '/dashboard/profile', icon: appIcons.userCircle, clientOnly: true },
  { title: 'Settings', to: '/dashboard/settings', icon: appIcons.gearSix },
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

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/bookings': 'My Bookings',
  '/dashboard/messages': 'Messages',
  '/dashboard/cases': 'Cases',
  '/dashboard/appointments': 'Appointments',
  '/dashboard/consultation-types': 'Consultation Types',
  '/dashboard/availability': 'Availability',
  '/dashboard/availability/exceptions': 'Exceptions',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
  '/dashboard/subscription': 'Subscription',
  '/dashboard/my-lawyers': 'My Lawyers',
  '/dashboard/verify-email': 'Verify Email',
}

export function dashboardPageTitle(path: string): string {
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path

  if (normalized === '/dashboard' || normalized === '/dashboard/')
    return 'Overview'

  for (const role of ['lawyer', 'client'] as const) {
    const links = getDashboardNavForRole(role)
    if (!links)
      continue

    for (const item of links) {
      if (isDashboardNavActive(path, item))
        return item.title
    }
  }

  if (ROUTE_LABELS[normalized])
    return ROUTE_LABELS[normalized]

  const parent = normalized.replace(/\/[^/]+$/, '')
  if (parent && ROUTE_LABELS[parent])
    return normalized.split('/').pop()?.replace(/-/g, ' ') ?? 'Details'

  return 'Dashboard'
}

export function getNavBadgeKey(to: string): string {
  return to
}

const ACCOUNT_PATHS = new Set([
  '/dashboard/profile',
  '/dashboard/settings',
  '/dashboard/subscription',
])

/** @deprecated Use filterNavForRole with dashboardNavByRole */
export function getFilteredNavSections(role: 'lawyer' | 'client') {
  const items = filterNavForRole(getDashboardNavForRole(role) ?? [], role)

  return {
    main: {
      label: 'Platform',
      items: items.filter(link => !ACCOUNT_PATHS.has(link.to)),
    },
    account: {
      label: 'Account',
      items: items.filter(link => ACCOUNT_PATHS.has(link.to)),
    },
    primaryCta: role === 'lawyer'
      ? { label: 'Set availability', to: '/dashboard/availability', icon: appIcons.clock }
      : { label: 'Find a lawyer', to: '/find-lawyers', icon: appIcons.magnifyingGlass },
  }
}
