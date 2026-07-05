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

export interface DashboardNavGroup {
  title: string
  icon: DashboardIcon
  items: DashboardNavLink[]
}

export type DashboardNavEntry
  = | ({ type: 'link' } & DashboardNavLink)
    | ({ type: 'group' } & DashboardNavGroup)

const lawyerDashboardNav: DashboardNavEntry[] = [
  { type: 'link', title: 'Overview', to: '/dashboard', icon: appIcons.dashboardSquare, exact: true },
  {
    type: 'group',
    title: 'Practice',
    icon: appIcons.briefcase,
    items: [
      { title: 'Cases', to: '/dashboard/cases', icon: appIcons.briefcase, lawyerOnly: true },
      { title: 'Appointments', to: '/dashboard/appointments', icon: appIcons.calendar, lawyerOnly: true },
      { title: 'Messages', to: '/dashboard/messages', icon: appIcons.chatCircle },
      { title: 'Consultation Types', to: '/dashboard/consultation-types', icon: appIcons.legalDocument, lawyerOnly: true },
      { title: 'Availability', to: '/dashboard/availability', icon: appIcons.clock, lawyerOnly: true },
      { title: 'Profile', to: '/dashboard/profile', icon: appIcons.userCircle, lawyerOnly: true },
    ],
  },
  {
    type: 'group',
    title: 'Account',
    icon: appIcons.gearSix,
    items: [
      { title: 'Subscription', to: '/dashboard/subscription', icon: appIcons.creditCard, lawyerOnly: true },
      { title: 'Settings', to: '/dashboard/settings', icon: appIcons.gearSix },
    ],
  },
]

const clientDashboardNav: DashboardNavEntry[] = [
  { type: 'link', title: 'Overview', to: '/dashboard', icon: appIcons.dashboardSquare, exact: true },
  {
    type: 'group',
    title: 'Workspace',
    icon: appIcons.calendar,
    items: [
      { title: 'My Bookings', to: '/dashboard/bookings', icon: appIcons.calendar, clientOnly: true },
      { title: 'Messages', to: '/dashboard/messages', icon: appIcons.chatCircle },
    ],
  },
  {
    type: 'group',
    title: 'Account',
    icon: appIcons.gearSix,
    items: [
      { title: 'Profile', to: '/dashboard/profile', icon: appIcons.userCircle, clientOnly: true },
      { title: 'Settings', to: '/dashboard/settings', icon: appIcons.gearSix },
    ],
  },
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
  entries: DashboardNavEntry[],
  role: 'lawyer' | 'client',
): DashboardNavEntry[] {
  return entries
    .map((entry) => {
      if (entry.type === 'link')
        return filterLink(entry, role)

      const items = entry.items
        .map(item => filterLink(item, role))
        .filter((item): item is DashboardNavLink => item !== null)

      if (items.length === 0)
        return null

      return { ...entry, items }
    })
    .filter((entry): entry is DashboardNavEntry => entry !== null)
}

export function getDashboardNavForRole(role: 'lawyer' | 'client' | undefined): DashboardNavEntry[] | null {
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

export function isDashboardNavGroupActive(
  path: string,
  items: DashboardNavLink[],
): boolean {
  return items.some(item => isDashboardNavActive(path, item))
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

function collectLinks(entries: DashboardNavEntry[]): DashboardNavLink[] {
  return entries.flatMap((entry) => {
    if (entry.type === 'link')
      return [entry]
    return entry.items
  })
}

export function dashboardPageTitle(path: string): string {
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path

  if (normalized === '/dashboard' || normalized === '/dashboard/')
    return 'Overview'

  for (const role of ['lawyer', 'client'] as const) {
    const entries = getDashboardNavForRole(role)
    if (!entries)
      continue

    for (const item of collectLinks(entries)) {
      if (isDashboardNavActive(path, item))
        return item.title
    }

    for (const entry of entries) {
      if (entry.type === 'group' && isDashboardNavGroupActive(path, entry.items))
        return entry.title
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

/** @deprecated Use filterNavForRole with dashboardNavByRole */
export function getFilteredNavSections(role: 'lawyer' | 'client') {
  const entries = filterNavForRole(getDashboardNavForRole(role) ?? [], role)
  const groups = entries.filter((entry): entry is Extract<DashboardNavEntry, { type: 'group' }> => entry.type === 'group')

  const mainGroup = groups.find(group => group.title === 'Practice' || group.title === 'Workspace')
  const accountGroup = groups.find(group => group.title === 'Account')

  return {
    main: {
      label: mainGroup?.title ?? 'Platform',
      items: mainGroup?.items ?? collectLinks(entries).filter(link => link.to !== '/dashboard'),
    },
    account: {
      label: accountGroup?.title ?? 'Account',
      items: accountGroup?.items ?? [],
    },
    primaryCta: role === 'lawyer'
      ? { label: 'Set availability', to: '/dashboard/availability', icon: appIcons.clock }
      : { label: 'Find a lawyer', to: '/find-lawyers', icon: appIcons.magnifyingGlass },
  }
}
