import { appIcons, type AppIconData } from '@/lib/app-icons'
import type { SettingsSectionId } from '~/types/account-settings'

export interface SettingsNavItem {
  id: SettingsSectionId
  label: string
  icon: AppIconData
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: 'legal-interests',
    label: 'Legal interests',
    icon: appIcons.scales,
  },
  {
    id: 'account-security',
    label: 'Account & security',
    icon: appIcons.shieldCheck,
  },
  {
    id: 'help',
    label: 'Help & support',
    icon: appIcons.headset,
  },
]

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SETTINGS_NAV.some(item => item.id === value)
}
