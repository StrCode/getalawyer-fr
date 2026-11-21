import { describe, expect, it } from 'vitest'
import { needsSignIn, signOutFailed, signOutTarget } from '../app/lib/sign-out'

describe('signOutTarget', () => {
  it('sends the presets to their pages', () => {
    expect(signOutTarget('login', '/dashboard', true)).toBe('/login')
    expect(signOutTarget('home', '/dashboard', true)).toBe('/')
    expect(signOutTarget('/forgot-password', '/dashboard', true)).toBe('/forgot-password')
  })

  it('stays on a page anyone can see', () => {
    expect(signOutTarget('stay', '/find-lawyers?area=family', false)).toBe('/find-lawyers?area=family')
  })

  it('leaves a page that needs signing in for the sign-in page', () => {
    expect(signOutTarget('stay', '/dashboard/appointments', true)).toBe('/login')
  })
})

describe('needsSignIn', () => {
  it('reads the page middleware, named or listed', () => {
    expect(needsSignIn('auth')).toBe(true)
    expect(needsSignIn(['auth', 'application'])).toBe(true)
    expect(needsSignIn(['require-login', 'client-directory'])).toBe(true)
    expect(needsSignIn(['client-directory'])).toBe(false)
    expect(needsSignIn('guest')).toBe(false)
    expect(needsSignIn(undefined)).toBe(false)
  })

  it('ignores inline middleware functions', () => {
    expect(needsSignIn([() => {}, 'auth'])).toBe(true)
    expect(needsSignIn(() => {})).toBe(false)
  })
})

describe('signOutFailed', () => {
  it('is not a failure when the session is already gone', () => {
    expect(signOutFailed(null)).toBe(false)
    expect(signOutFailed(undefined)).toBe(false)
    expect(signOutFailed({ status: 401 })).toBe(false)
    expect(signOutFailed({ status: 403 })).toBe(false)
  })

  it('is a failure when the server could not be reached or broke', () => {
    expect(signOutFailed({ status: 0 })).toBe(true)
    expect(signOutFailed({ status: 500 })).toBe(true)
    expect(signOutFailed(new TypeError('Failed to fetch'))).toBe(true)
  })
})
