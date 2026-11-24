import { describe, expect, it } from 'vitest'
import { googleReturn, onThisSite, socialSignInError } from '../app/lib/social-sign-in'

describe('onThisSite', () => {
  it('turns a path into the full address on this site', () => {
    expect(onThisSite('/dashboard', 'https://getalawyer.ng')).toBe('https://getalawyer.ng/dashboard')
    expect(onThisSite('/welcome/legal-needs?x=1', 'http://localhost:3002/')).toBe('http://localhost:3002/welcome/legal-needs?x=1')
  })

  it('never sends the visitor to another site', () => {
    expect(onThisSite('https://evil.example/x', 'https://getalawyer.ng')).toBe('https://getalawyer.ng/dashboard')
    expect(onThisSite('//evil.example/x', 'https://getalawyer.ng')).toBe('https://getalawyer.ng/dashboard')
  })
})

describe('googleReturn', () => {
  it('gives full addresses for both outcomes', () => {
    expect(googleReturn('/dashboard', '/login', 'https://getalawyer.ng')).toEqual({
      callbackURL: 'https://getalawyer.ng/dashboard',
      errorCallbackURL: 'https://getalawyer.ng/login',
    })
  })
})

describe('socialSignInError', () => {
  it('says nothing when there was no error', () => {
    expect(socialSignInError(undefined)).toBeNull()
    expect(socialSignInError('')).toBeNull()
  })

  it('explains the common cases in plain words', () => {
    expect(socialSignInError('access_denied')).toMatch(/cancelled/)
    expect(socialSignInError('account_not_linked')).toMatch(/already an account/)
    expect(socialSignInError('something_new')).toMatch(/could not sign you in with Google/)
  })
})
