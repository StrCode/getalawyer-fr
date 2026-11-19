import { describe, expect, it } from 'vitest'
import { joinFullName, splitAccountName } from '../app/lib/account-name'

describe('splitAccountName', () => {
  it('splits a two-part name', () => {
    expect(splitAccountName('Adaeze Okafor')).toEqual({ firstName: 'Adaeze', lastName: 'Okafor' })
  })
  it('keeps everything after the first word as the last name', () => {
    expect(splitAccountName('  Adaeze   Ngozi Okafor ')).toEqual({ firstName: 'Adaeze', lastName: 'Ngozi Okafor' })
  })
  it('handles a single word', () => {
    expect(splitAccountName('Adaeze')).toEqual({ firstName: 'Adaeze', lastName: '' })
  })
  it('ignores a phone number or email used as the account name', () => {
    expect(splitAccountName('+2348012345678')).toEqual({ firstName: '', lastName: '' })
    expect(splitAccountName('ada@example.com')).toEqual({ firstName: '', lastName: '' })
  })
  it('returns blanks for nothing', () => {
    expect(splitAccountName(null)).toEqual({ firstName: '', lastName: '' })
    expect(splitAccountName('   ')).toEqual({ firstName: '', lastName: '' })
  })
})

describe('joinFullName', () => {
  it('joins the parts that are filled in', () => {
    expect(joinFullName('Adaeze', '', ' Okafor ')).toBe('Adaeze Okafor')
    expect(joinFullName('Adaeze', 'Ngozi', 'Okafor')).toBe('Adaeze Ngozi Okafor')
    expect(joinFullName('', null, undefined)).toBe('')
  })
})
