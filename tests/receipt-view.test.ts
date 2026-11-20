import { describe, expect, it } from 'vitest'
import { receiptCardLine, receiptTermLine, receiptTitle } from '../app/lib/receipt-view'

describe('receiptCardLine', () => {
  it('names the card and the bank', () => {
    expect(receiptCardLine({ last4: '4081', brand: 'visa', bank: 'Access Bank' })).toBe('Visa ending 4081, Access Bank')
    expect(receiptCardLine({ last4: '4081', brand: 'MASTERCARD ', bank: null })).toBe('Mastercard ending 4081')
    expect(receiptCardLine({ last4: '4081', brand: 'visa DEBIT', bank: null })).toBe('Visa ending 4081')
  })

  it('says "Card" when the brand was not kept', () => {
    expect(receiptCardLine({ last4: '4081', brand: null, bank: 'Access Bank' })).toBe('Card ending 4081, Access Bank')
  })

  it('works from whatever is there', () => {
    expect(receiptCardLine({ last4: null, brand: 'verve', bank: null })).toBe('Verve card')
    expect(receiptCardLine({ last4: null, brand: null, bank: 'Access Bank' })).toBe('Access Bank')
  })

  it('is null when nothing about the card was kept', () => {
    expect(receiptCardLine(null)).toBeNull()
    expect(receiptCardLine(undefined)).toBeNull()
    expect(receiptCardLine({ last4: ' ', brand: '', bank: null })).toBeNull()
  })
})

describe('receiptTermLine', () => {
  it('gives the term a payment bought', () => {
    expect(receiptTermLine('2026-08-14T12:00:00Z', '2027-08-14T12:00:00Z')).toBe('14 August 2026 to 14 August 2027')
  })

  it('gives the end alone when the start is unknown', () => {
    expect(receiptTermLine(null, '2027-08-14T12:00:00Z')).toBe('Until 14 August 2027')
  })

  it('is null without an end date', () => {
    expect(receiptTermLine('2026-08-14T12:00:00Z', null)).toBeNull()
    expect(receiptTermLine(null, 'nonsense')).toBeNull()
  })
})

describe('receiptTitle', () => {
  it('carries the payment date, for the saved file name', () => {
    expect(receiptTitle('2026-08-14T12:00:00Z')).toBe('Receipt 2026-08-14')
  })

  it('still reads as a receipt without a date', () => {
    expect(receiptTitle(null)).toBe('Receipt')
    expect(receiptTitle('nonsense')).toBe('Receipt')
  })
})
