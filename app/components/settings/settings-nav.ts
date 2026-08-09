import type { Hugeicon } from '@/lib/icon-types'
import { HeadsetIcon, JusticeScale01Icon, SecurityCheckIcon } from '@hugeicons/core-free-icons'

import type { SettingsSectionId } from '~/types/account-settings'

export interface SettingsNavItem {
  id: SettingsSectionId
  label: string
  icon: Hugeicon
}

const ACCOUNT_SECURITY: SettingsNavItem = {
  id: 'account-security',
  label: 'Account & security',
  icon: SecurityCheckIcon,
}

const HELP: SettingsNavItem = {
  id: 'help',
  label: 'Help & support',
  icon: HeadsetIcon,
}

const LEGAL_INTERESTS: SettingsNavItem = {
  id: 'legal-interests',
  label: 'Legal interests',
  icon: JusticeScale01Icon,
}

/** Client: preferences + security. Lawyer: security only (practice tools live in their own nav). */
export function getSettingsNavForRole(role: 'lawyer' | 'client' | undefined): SettingsNavItem[] {
  if (role === 'lawyer')
    return [ACCOUNT_SECURITY, HELP]
  if (role === 'client')
    return [LEGAL_INTERESTS, ACCOUNT_SECURITY, HELP]
  return [ACCOUNT_SECURITY, HELP]
}

export function getDefaultSettingsSection(role: 'lawyer' | 'client' | undefined): SettingsSectionId {
  return role === 'client' ? 'legal-interests' : 'account-security'
}

export function isSettingsSectionId(
  value: string,
  role?: 'lawyer' | 'client' | undefined,
): value is SettingsSectionId {
  const nav = getSettingsNavForRole(role)
  return nav.some(item => item.id === value)
}

/** @deprecated Prefer getSettingsNavForRole — client nav shape for older imports. */
export const SETTINGS_NAV: SettingsNavItem[] = getSettingsNavForRole('client')
