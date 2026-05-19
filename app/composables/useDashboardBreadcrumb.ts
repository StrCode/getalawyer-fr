export type DashboardBreadcrumbItem = {
  label: string
  to?: string
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
  '/dashboard/my-lawyers': 'My Lawyers',
  '/dashboard/listings': 'Listings',
}

function labelForPath(path: string) {
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  if (ROUTE_LABELS[normalized])
    return ROUTE_LABELS[normalized]

  const parent = normalized.replace(/\/[^/]+$/, '')
  if (parent && ROUTE_LABELS[parent])
    return normalized.split('/').pop()?.replace(/-/g, ' ') ?? 'Details'

  return 'Dashboard'
}

export function useDashboardBreadcrumb() {
  const route = useRoute()

  const items = computed<DashboardBreadcrumbItem[]>(() => {
    const path = route.path
    if (path === '/dashboard' || path === '/dashboard/')
      return [{ label: 'Overview' }]

    const segments: DashboardBreadcrumbItem[] = [{ label: 'Overview', to: '/dashboard' }]

    const parts = path.replace(/^\/dashboard\/?/, '').split('/').filter(Boolean)
    let accumulated = '/dashboard'

    for (let i = 0; i < parts.length; i++) {
      accumulated += `/${parts[i]}`
      const isLast = i === parts.length - 1
      segments.push({
        label: labelForPath(accumulated),
        to: isLast ? undefined : accumulated,
      })
    }

    return segments
  })

  return { items }
}
