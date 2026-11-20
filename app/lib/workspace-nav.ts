/**
 * Where the dashboard's navigation sends each kind of account.
 *
 * The bar holds the few places someone goes every day. A lawyer's "Practice"
 * menu holds what they set up and revisit now and then; the account menu holds
 * what belongs to the account itself. A client has no Practice menu: a client
 * is not running anything, so everything fits in the bar and the account menu.
 *
 * On phones the bar's links become a tab bar along the bottom, with a "More"
 * sheet for whatever the bar does not hold.
 */
export type WorkspaceIcon = 'grid' | 'calendar' | 'chat' | 'scales' | 'user' | 'video' | 'clock' | 'card' | 'sliders'

export interface WorkspaceLink {
  label: string
  to: string
  icon: WorkspaceIcon
  /** Only the exact path counts as "here" (the overview, which every other page sits under). */
  exact?: boolean
  /** A shorter name for the phone tab bar, where a long label would be cut off. */
  short?: string
}

export interface WorkspaceNav {
  bar: WorkspaceLink[]
  practice: WorkspaceLink[]
  account: WorkspaceLink[]
}

const OVERVIEW: WorkspaceLink = { label: 'Overview', to: '/dashboard', icon: 'grid', exact: true }
const MESSAGES: WorkspaceLink = { label: 'Messages', to: '/dashboard/messages', icon: 'chat' }
const CASES: WorkspaceLink = { label: 'Cases', to: '/dashboard/cases', icon: 'scales' }
const SETTINGS: WorkspaceLink = { label: 'Settings', to: '/dashboard/settings', icon: 'sliders' }

const LAWYER: WorkspaceNav = {
  bar: [
    OVERVIEW,
    { label: 'Appointments', short: 'Diary', to: '/dashboard/appointments', icon: 'calendar' },
    MESSAGES,
    CASES,
  ],
  practice: [
    { label: 'Profile', to: '/dashboard/profile', icon: 'user' },
    { label: 'Consultation types', to: '/dashboard/consultation-types', icon: 'video' },
    { label: 'Availability', to: '/dashboard/availability', icon: 'clock' },
  ],
  account: [
    { label: 'Membership', to: '/dashboard/subscription', icon: 'card' },
    SETTINGS,
  ],
}

const CLIENT: WorkspaceNav = {
  bar: [
    OVERVIEW,
    { label: 'Bookings', to: '/dashboard/bookings', icon: 'calendar' },
    MESSAGES,
    CASES,
    { label: 'Lawyers', to: '/dashboard/my-lawyers', icon: 'user' },
  ],
  practice: [],
  account: [
    { label: 'Profile', to: '/dashboard/profile', icon: 'user' },
    SETTINGS,
  ],
}

const EMPTY: WorkspaceNav = { bar: [], practice: [], account: [] }

export function workspaceNavFor(role: 'lawyer' | 'client' | null | undefined): WorkspaceNav {
  if (role === 'lawyer') return LAWYER
  if (role === 'client') return CLIENT
  return EMPTY
}

/** Whether `path` is the link's page or a page under it. */
export function isWorkspaceLinkActive(path: string, link: Pick<WorkspaceLink, 'to' | 'exact'>): boolean {
  const here = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path || '/'
  if (link.exact) return here === link.to
  return here === link.to || here.startsWith(`${link.to}/`)
}

/**
 * The phone tab bar: at most `slots` tabs. When there is more to reach than
 * fits (a lawyer's Practice and account pages), the last slot is "More" and the
 * rest go in its sheet; otherwise every bar link gets a tab and there is no More.
 */
export function workspaceTabs(nav: WorkspaceNav, slots = 5): { tabs: WorkspaceLink[], more: WorkspaceLink[] } {
  const overflow = [...nav.practice, ...nav.account]
  if (nav.bar.length <= slots && nav.practice.length === 0) {
    // The account pages stay in the account menu at the top; nothing needs More.
    return { tabs: nav.bar, more: [] }
  }
  const tabs = nav.bar.slice(0, slots - 1)
  return { tabs, more: [...nav.bar.slice(slots - 1), ...overflow] }
}
