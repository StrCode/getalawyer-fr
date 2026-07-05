import type { Component } from 'vue'
import {
  PhBriefcase,
  PhCalendar,
  PhChatCircle,
  PhClock,
  PhCreditCard,
  PhFileText,
  PhGearSix,
  PhHouse,
  PhMagnifyingGlass,
  PhUserCircle,
} from '@phosphor-icons/vue'

export interface DashboardNavLink {
  title: string
  to: string
  icon: Component
  exact?: boolean
  lawyerOnly?: boolean
  clientOnly?: boolean
}

export interface DashboardNavSection {
  label: string
  items: DashboardNavLink[]
}

export interface DashboardNavConfig {
  main: DashboardNavSection
  account: DashboardNavSection
  primaryCta: {
    label: string
    to: string
    icon: Component
  }
}

const lawyerNav: DashboardNavConfig = {
  main: {
    label: 'Practice',
    items: [
      { title: 'Overview', to: '/dashboard', icon: PhHouse, exact: true },
      { title: 'Cases', to: '/dashboard/cases', icon: PhBriefcase, lawyerOnly: true },
      { title: 'Appointments', to: '/dashboard/appointments', icon: PhCalendar, lawyerOnly: true },
      { title: 'Messages', to: '/dashboard/messages', icon: PhChatCircle },
      { title: 'Consultation Types', to: '/dashboard/consultation-types', icon: PhFileText, lawyerOnly: true },
      { title: 'Availability', to: '/dashboard/availability', icon: PhClock, lawyerOnly: true },
      { title: 'Profile', to: '/dashboard/profile', icon: PhUserCircle, lawyerOnly: true },
    ],
  },
  account: {
    label: 'Account',
    items: [
      { title: 'Subscription', to: '/dashboard/subscription', icon: PhCreditCard, lawyerOnly: true },
      { title: 'Settings', to: '/dashboard/settings', icon: PhGearSix },
    ],
  },
  primaryCta: {
    label: 'Set availability',
    to: '/dashboard/availability',
    icon: PhClock,
  },
}

const clientNav: DashboardNavConfig = {
  main: {
    label: 'Workspace',
    items: [
      { title: 'Overview', to: '/dashboard', icon: PhHouse, exact: true },
      { title: 'My Bookings', to: '/dashboard/bookings', icon: PhCalendar, clientOnly: true },
      { title: 'Messages', to: '/dashboard/messages', icon: PhChatCircle },
    ],
  },
  account: {
    label: 'Account',
    items: [
      { title: 'Profile', to: '/dashboard/profile', icon: PhUserCircle, clientOnly: true },
      { title: 'Settings', to: '/dashboard/settings', icon: PhGearSix },
    ],
  },
  primaryCta: {
    label: 'Find a lawyer',
    to: '/find-lawyers',
    icon: PhMagnifyingGlass,
  },
}

export function getDashboardNavForRole(role: 'lawyer' | 'client' | undefined): DashboardNavConfig | null {
  if (role === 'lawyer')
    return lawyerNav
  if (role === 'client')
    return clientNav
  return null
}

function filterItems(items: DashboardNavLink[], role: 'lawyer' | 'client'): DashboardNavLink[] {
  return items.filter((item) => {
    if (item.lawyerOnly && role !== 'lawyer')
      return false
    if (item.clientOnly && role !== 'client')
      return false
    return true
  })
}

export function getFilteredNavSections(role: 'lawyer' | 'client') {
  const config = getDashboardNavForRole(role)
  if (!config)
    return null

  return {
    main: {
      label: config.main.label,
      items: filterItems(config.main.items, role),
    },
    account: {
      label: config.account.label,
      items: filterItems(config.account.items, role),
    },
    primaryCta: config.primaryCta,
  }
}

export function isDashboardNavActive(path: string, link: DashboardNavLink): boolean {
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
  '/dashboard/listings': 'Listings',
  '/dashboard/verify-email': 'Verify Email',
}

export function dashboardPageTitle(path: string): string {
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path

  if (normalized === '/dashboard' || normalized === '/dashboard/')
    return 'Overview'

  for (const role of ['lawyer', 'client'] as const) {
    const config = getDashboardNavForRole(role)
    if (!config)
      continue

    for (const item of [...config.main.items, ...config.account.items]) {
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
