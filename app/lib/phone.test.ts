import { describe, expect, test } from 'vitest'
import {
  formatNgPhoneDisplay,
  isValidNgPhone,
  normalizeNgPhone,
  toBetterAuthPhone,
  toE164Plus,
} from '~/lib/phone'
import { isTempPhoneEmail } from '~/lib/auth-constants'

describe('phone utilities', () => {
  test('normalizeNgPhone accepts local format', () => {
    expect(normalizeNgPhone('08012345678')).toBe('2348012345678')
  })

  test('toBetterAuthPhone returns E.164', () => {
    expect(toBetterAuthPhone('08012345678')).toBe('+2348012345678')
  })

  test('toE164Plus adds plus', () => {
    expect(toE164Plus('2348012345678')).toBe('+2348012345678')
  })

  test('normalizeNgPhone accepts spaced and E.164 input', () => {
    expect(normalizeNgPhone('0801 234 5678')).toBe('2348012345678')
    expect(normalizeNgPhone('+2348012345678')).toBe('2348012345678')
  })

  test('isValidNgPhone validates', () => {
    expect(isValidNgPhone('08012345678')).toBe(true)
    expect(isValidNgPhone('bad')).toBe(false)
  })

  test('isValidNgPhone rejects real invalid numbers (not just wrong length)', () => {
    // libphonenumber knows these aren't assignable NG numbers — the old
    // length-only regex accepted the all-zeros case.
    expect(isValidNgPhone('00000000000')).toBe(false)
    expect(isValidNgPhone('0801234567')).toBe(false) // too short
    expect(isValidNgPhone('01234567890')).toBe(false) // not a mobile/valid range
  })

  test('formatNgPhoneDisplay renders Nigerian numbers in national form', () => {
    expect(formatNgPhoneDisplay('2348012345678')).toBe('0801 234 5678')
  })
})

describe('auth constants', () => {
  test('isTempPhoneEmail detects placeholder domain', () => {
    expect(isTempPhoneEmail('2348012345678@phone.getalawyer.ng')).toBe(true)
    expect(isTempPhoneEmail('user@example.com')).toBe(false)
  })
})
