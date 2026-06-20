import { describe, expect, test } from 'vitest'
import {
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

  test('isValidNgPhone validates', () => {
    expect(isValidNgPhone('08012345678')).toBe(true)
    expect(isValidNgPhone('bad')).toBe(false)
  })
})

describe('auth constants', () => {
  test('isTempPhoneEmail detects placeholder domain', () => {
    expect(isTempPhoneEmail('2348012345678@phone.getalawyer.ng')).toBe(true)
    expect(isTempPhoneEmail('user@example.com')).toBe(false)
  })
})
