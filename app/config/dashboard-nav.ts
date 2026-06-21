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

/** Phosphor icon map for dashboard sidebar navigation */
export const dashboardNavIcons = {
  overview: PhHouse,
  cases: PhBriefcase,
  appointments: PhCalendar,
  bookings: PhCalendar,
  messages: PhChatCircle,
  consultationTypes: PhFileText,
  availability: PhClock,
  profile: PhUserCircle,
  subscription: PhCreditCard,
  settings: PhGearSix,
  findLawyer: PhMagnifyingGlass,
} as const satisfies Record<string, Component>

export type DashboardNavIconKey = keyof typeof dashboardNavIcons

export interface DashboardNavDefinition {
  label: string
  icon: DashboardNavIconKey
  to: string
  exact?: boolean
}

export const lawyerMainNav: DashboardNavDefinition[] = [
  { label: 'Overview', icon: 'overview', to: '/dashboard', exact: true },
  { label: 'Cases', icon: 'cases', to: '/dashboard/cases' },
  { label: 'Appointments', icon: 'appointments', to: '/dashboard/appointments' },
  { label: 'Messages', icon: 'messages', to: '/dashboard/messages' },
  { label: 'Consultation Types', icon: 'consultationTypes', to: '/dashboard/consultation-types' },
  { label: 'Availability', icon: 'availability', to: '/dashboard/availability' },
  { label: 'Profile', icon: 'profile', to: '/dashboard/profile' },
]

export const clientMainNav: DashboardNavDefinition[] = [
  { label: 'Overview', icon: 'overview', to: '/dashboard', exact: true },
  { label: 'My Bookings', icon: 'bookings', to: '/dashboard/bookings' },
  { label: 'Messages', icon: 'messages', to: '/dashboard/messages' },
]

export const lawyerSupportNav: DashboardNavDefinition[] = [
  { label: 'Subscription', icon: 'subscription', to: '/dashboard/subscription' },
  { label: 'Settings', icon: 'settings', to: '/dashboard/settings' },
]

export const clientSupportNav: DashboardNavDefinition[] = [
  { label: 'Profile', icon: 'profile', to: '/dashboard/profile' },
  { label: 'Settings', icon: 'settings', to: '/dashboard/settings' },
]
