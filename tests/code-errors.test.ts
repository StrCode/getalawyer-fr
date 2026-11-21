import { describe, expect, it } from 'vitest'
import { codeErrorMessage } from '../app/lib/code-errors'

describe('codeErrorMessage', () => {
  it('puts Better Auth code errors in plain words', () => {
    expect(codeErrorMessage({ code: 'OTP_EXPIRED' }, 'x')).toBe('That code has expired. Send a new one.')
    expect(codeErrorMessage({ code: 'OTP_NOT_FOUND' }, 'x')).toBe('That code has expired. Send a new one.')
    expect(codeErrorMessage({ code: 'INVALID_OTP' }, 'x')).toBe('That code is not right. Check it and try again.')
    expect(codeErrorMessage({ code: 'TOO_MANY_ATTEMPTS' }, 'x')).toBe('Too many tries with that code. Send a new one.')
  })

  it('falls back to the screen\'s own words, never the raw server text', () => {
    expect(codeErrorMessage({ code: 'SOMETHING_ELSE' }, 'We could not check the code.')).toBe('We could not check the code.')
    expect(codeErrorMessage(null, 'Fallback')).toBe('Fallback')
    expect(codeErrorMessage({}, 'Fallback')).toBe('Fallback')
  })
})
