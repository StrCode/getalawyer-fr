import { describe, expect, it } from 'vitest'
import {
  countUnread,
  formatBadgeCount,
  formatRelativeTime,
  notificationLink,
  sortNotificationsNewestFirst,
} from '../app/lib/notifications'

const base = { type: 'new_message' as const, conversationId: null, bookingId: null, caseId: null, data: null }

describe('notificationLink', () => {
  it('routes conversations to the messages page with the selected conversation', () => {
    expect(notificationLink({ ...base, conversationId: 'c1' }, 'client')).toBe('/dashboard/messages?conversation=c1')
  })

  it('routes bookings per role', () => {
    expect(notificationLink({ ...base, bookingId: 'b1' }, 'lawyer')).toBe('/dashboard/appointments/b1')
    expect(notificationLink({ ...base, data: { bookingId: 'b1' } }, 'client')).toBe('/dashboard/bookings/b1')
  })

  it('routes cases and falls back to messages', () => {
    expect(notificationLink({ ...base, caseId: 'k1' }, 'client')).toBe('/dashboard/cases/k1')
    expect(notificationLink(base, 'lawyer')).toBe('/dashboard/messages')
    expect(notificationLink({ ...base, type: 'consultation_fee_request' }, 'client')).toBe('/dashboard/bookings')
  })
})

describe('helpers', () => {
  it('sorts newest first and counts unread', () => {
    const items = [
      { id: 'a', createdAt: '2026-01-01T00:00:00Z', read: true },
      { id: 'b', createdAt: '2026-02-01T00:00:00Z', read: false },
    ]
    expect(sortNotificationsNewestFirst(items).map(i => i.id)).toEqual(['b', 'a'])
    expect(countUnread(items)).toBe(1)
    expect(countUnread(undefined)).toBe(0)
  })

  it('caps badge counts', () => {
    expect(formatBadgeCount(5)).toBe('5')
    expect(formatBadgeCount(100)).toBe('99+')
  })

  it('formats relative time', () => {
    const now = Date.parse('2026-08-22T12:00:00Z')
    expect(formatRelativeTime('2026-08-22T11:59:40Z', now)).toBe('just now')
    expect(formatRelativeTime('2026-08-22T11:30:00Z', now)).toBe('30m ago')
    expect(formatRelativeTime('2026-08-22T09:00:00Z', now)).toBe('3h ago')
    expect(formatRelativeTime('2026-08-20T12:00:00Z', now)).toBe('2d ago')
    expect(formatRelativeTime('2026-06-01T12:00:00Z', now)).toBe('1 Jun')
    expect(formatRelativeTime('2025-06-01T12:00:00Z', now)).toBe('1 Jun 2025')
    expect(formatRelativeTime('nope', now)).toBe('')
  })
})
