import { appIcons, type AppIconData } from '@/lib/app-icons'
import type { SettingsSectionId } from '~/types/account-settings'

export interface SettingsNavItem {
  id: SettingsSectionId
  label: string
  description: string
  icon: AppIconData
  group: 'account' | 'activity' | 'preferences'
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: 'legal-preferences',
    label: 'Legal preferences',
    description: 'Areas, budget, and urgency',
    icon: appIcons.scales,
    group: 'account',
  },
  {
    id: 'identity',
    label: 'Identity verification',
    description: 'ID, address, and phone OTP',
    icon: appIcons.identificationCard,
    group: 'account',
  },
  {
    id: 'documents',
    label: 'My documents',
    description: 'Upload and manage files',
    icon: appIcons.folderOpen,
    group: 'activity',
  },
  {
    id: 'case-history',
    label: 'Case history',
    description: 'Past and ongoing consultations',
    icon: appIcons.briefcase,
    group: 'activity',
  },
  {
    id: 'saved-lawyers',
    label: 'Saved lawyers',
    description: 'Bookmarks and quick book',
    icon: appIcons.bookmarkSimple,
    group: 'activity',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'In-app, email, and SMS',
    icon: appIcons.bell,
    group: 'preferences',
  },
  {
    id: 'privacy',
    label: 'Privacy & security',
    description: 'Password, 2FA, visibility',
    icon: appIcons.shieldCheck,
    group: 'preferences',
  },
  {
    id: 'help',
    label: 'Help & account',
    description: 'Support and data controls',
    icon: appIcons.headset,
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
