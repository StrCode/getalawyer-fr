import type { Hugeicon } from '@/lib/icon-types'
import { HeadsetIcon, JusticeScale01Icon, SecurityCheckIcon } from '@hugeicons/core-free-icons'

import type { SettingsSectionId } from '~/types/account-settings'

export interface SettingsNavItem {
  id: SettingsSectionId
  label: string
  icon: Hugeicon
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: 'legal-interests',
    label: 'Legal interests',
    icon: JusticeScale01Icon,
  },
  {
    id: 'account-security',
    label: 'Account & security',
    icon: SecurityCheckIcon,
  },
  {
    id: 'help',
    label: 'Help & support',
    icon: HeadsetIcon,
  },
]

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SETTINGS_NAV.some(item => item.id === value)
}
