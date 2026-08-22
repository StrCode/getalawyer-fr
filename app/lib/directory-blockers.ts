/**
 * Human labels for the non-profile reasons a lawyer is hidden from directory search.
 * Profile (tier-1) blockers are rendered from `profile-check-catalog.ts` instead.
 */

import type {
  DirectoryEligibilityBlocker,
  LawyerDirectoryEligibility,
} from '~/types/lawyer-directory-eligibility'

export type DirectoryBlockerItem = {
  id: Exclude<DirectoryEligibilityBlocker, 'profile'>
  label: string
  href: string
}

export const DIRECTORY_BLOCKER_ITEMS: Record<Exclude<DirectoryEligibilityBlocker, 'profile'>, DirectoryBlockerItem> = {
  approval: {
    id: 'approval',
    label: 'Application not approved yet',
    href: '/dashboard',
  },
  subscription_inactive: {
    id: 'subscription_inactive',
    label: 'Subscription inactive',
    href: '/dashboard/subscription',
  },
  payment_issue: {
    id: 'payment_issue',
    label: 'Payment issue on your subscription',
    href: '/dashboard/subscription',
  },
}

/** Non-profile blockers, in the backend's order, de-duplicated. */
export function getDirectoryBlockerItems(
  eligibility: LawyerDirectoryEligibility | null | undefined,
): DirectoryBlockerItem[] {
  if (!eligibility) return []
  const seen = new Set<string>()
  const items: DirectoryBlockerItem[] = []
  for (const blocker of eligibility.blockers) {
    if (blocker === 'profile' || seen.has(blocker)) continue
    seen.add(blocker)
    items.push(DIRECTORY_BLOCKER_ITEMS[blocker])
  }
  return items
}
