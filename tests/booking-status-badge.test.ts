import { describe, expect, it } from 'vitest'
import { useBookingDisplay } from '~/composables/useBookingDisplay'

const { bookingStatusBadge } = useBookingDisplay()

describe('bookingStatusBadge', () => {
  it('maps pending to the semantic warning variant with no hardcoded palette classes', () => {
    const badge = bookingStatusBadge('pending')
    expect(badge.variant).toBe('warning')
    expect(badge.class).not.toMatch(/amber/)
    expect(badge.class).toContain('capitalize')
  })

  it('maps confirmed and completed to secondary', () => {
    expect(bookingStatusBadge('confirmed').variant).toBe('secondary')
    expect(bookingStatusBadge('completed').variant).toBe('secondary')
  })

  it('maps cancelled and no_show to destructive', () => {
    expect(bookingStatusBadge('cancelled').variant).toBe('destructive')
    expect(bookingStatusBadge('no_show').variant).toBe('destructive')
  })

  it('falls back to secondary for unknown statuses', () => {
    expect(bookingStatusBadge('anything_else').variant).toBe('secondary')
  })
})
