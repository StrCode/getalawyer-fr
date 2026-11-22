import { describe, expect, it } from 'vitest'
import { applicationStateOf } from '~/lib/application-state'

const base = {
  statusPending: false,
  statusError: false,
  hasActiveSubscription: undefined,
  subscriptionPending: false,
}

describe('applicationStateOf', () => {
  it('is loading until the status is known, and unavailable when it cannot be fetched', () => {
    expect(applicationStateOf({ ...base, status: null, statusPending: true })).toBe('loading')
    expect(applicationStateOf({ ...base, status: null, statusError: true })).toBe('unavailable')
  })

  it('is a draft while the application is being filled in or has been reopened', () => {
    expect(applicationStateOf({ ...base, status: { currentState: 'not_started' } })).toBe('draft')
    expect(applicationStateOf({ ...base, status: { currentState: 'personal_info', applicationStatus: 'pending' } })).toBe('draft')
  })

  it('asks for payment only once it knows the membership is not paid', () => {
    const status = { currentState: 'submitted', applicationStatus: 'pending' }
    expect(applicationStateOf({ ...base, status, subscriptionPending: true })).toBe('loading')
    expect(applicationStateOf({ ...base, status, hasActiveSubscription: false })).toBe('payment')
    expect(applicationStateOf({ ...base, status, hasActiveSubscription: true })).toBe('review')
  })

  it('tells a correction from an application that is closed or withdrawn', () => {
    expect(applicationStateOf({ ...base, status: { currentState: 'review', applicationStatus: 'changes_requested' } })).toBe('changes')
    expect(applicationStateOf({ ...base, status: { currentState: 'rejected', applicationStatus: 'rejected' } })).toBe('closed')
    expect(applicationStateOf({ ...base, status: { currentState: 'rejected', applicationStatus: 'verification_failed' } })).toBe('closed')
    expect(applicationStateOf({ ...base, status: { currentState: 'rejected', applicationStatus: 'withdrawn' } })).toBe('withdrawn')
  })

  it('is approved when the status or the session says so', () => {
    expect(applicationStateOf({ ...base, status: { currentState: 'approved', applicationStatus: 'approved' } })).toBe('approved')
    expect(applicationStateOf({ ...base, status: null, statusPending: true, completed: true })).toBe('approved')
  })
})
