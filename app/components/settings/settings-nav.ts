import type { Component } from 'vue'
import {
  PhBell,
  PhBookmarkSimple,
  PhBriefcase,
  PhFolderOpen,
  PhHeadset,
  PhIdentificationCard,
  PhScales,
  PhShieldCheck,
} from '@phosphor-icons/vue'
import type { SettingsSectionId } from '~/types/account-settings'

export interface SettingsNavItem {
  id: SettingsSectionId
  label: string
  description: string
  icon: Component
  group: 'account' | 'activity' | 'preferences'
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: 'legal-preferences',
    label: 'Legal preferences',
    description: 'Areas, budget, and urgency',
    icon: PhScales,
    group: 'account',
  },
  {
    id: 'identity',
    label: 'Identity verification',
    description: 'ID, address, and phone OTP',
    icon: PhIdentificationCard,
    group: 'account',
  },
  {
    id: 'documents',
    label: 'My documents',
    description: 'Upload and manage files',
    icon: PhFolderOpen,
    group: 'activity',
  },
  {
    id: 'case-history',
    label: 'Case history',
    description: 'Past and ongoing consultations',
    icon: PhBriefcase,
    group: 'activity',
  },
  {
    id: 'saved-lawyers',
    label: 'Saved lawyers',
    description: 'Bookmarks and quick book',
    icon: PhBookmarkSimple,
    group: 'activity',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'In-app, email, and SMS',
    icon: PhBell,
    group: 'preferences',
  },
  {
    id: 'privacy',
    label: 'Privacy & security',
    description: 'Password, 2FA, visibility',
    icon: PhShieldCheck,
    group: 'preferences',
  },
  {
    id: 'help',
    label: 'Help & account',
    description: 'Support and data controls',
    icon: PhHeadset,
    group: 'preferences',
  },
]

export const SETTINGS_NAV_GROUPS = [
  { key: 'account' as const, label: 'Account' },
  { key: 'activity' as const, label: 'Activity' },
  { key: 'preferences' as const, label: 'Preferences' },
]

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SETTINGS_NAV.some(item => item.id === value)
}
