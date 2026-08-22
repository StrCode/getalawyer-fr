import { describe, expect, it } from 'vitest'
import { getDirectoryBlockerItems } from '../app/lib/directory-blockers'

describe('getDirectoryBlockerItems', () => {
  it('returns nothing without eligibility', () => {
    expect(getDirectoryBlockerItems(null)).toEqual([])
  })

  it('maps non-profile blockers to labels + links, skipping profile', () => {
    const items = getDirectoryBlockerItems({
      isDirectoryVisible: false,
      blockers: ['approval', 'profile', 'payment_issue'],
      subscriptionGate: 'payment_issue',
      tier1Complete: false,
    })
    expect(items.map((i) => i.id)).toEqual(['approval', 'payment_issue'])
    expect(items[0]).toMatchObject({ label: 'Application not approved yet', href: '/dashboard' })
    expect(items[1]).toMatchObject({ href: '/dashboard/subscription' })
  })

  it('de-duplicates repeated blockers', () => {
    const items = getDirectoryBlockerItems({
      isDirectoryVisible: false,
      blockers: ['subscription_inactive', 'subscription_inactive'],
      subscriptionGate: 'subscription_inactive',
      tier1Complete: true,
    })
    expect(items).toHaveLength(1)
  })
})
