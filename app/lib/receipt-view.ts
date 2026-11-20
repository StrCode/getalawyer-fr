/**
 * How a payment receipt is worded. Kept free of Nuxt and network code so each
 * line can be unit-tested. The facts themselves (plan, fee, card, term) come
 * from the backend, recorded on the day of the payment.
 */
import { longDate } from './membership-view'

interface ReceiptCard { last4: string | null, brand: string | null, bank: string | null }

/** "Visa" from Paystack's "visa", "Mastercard" from "mastercard ", "Verve" from "VERVE". */
function brandName(brand: string | null): string | null {
  const text = brand?.trim().split(/\s+/)[0]
  if (!text) return null
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * "Visa ending 4081, Access Bank". Null when nothing about the card was kept,
 * so the receipt leaves the row out and does not guess.
 */
export function receiptCardLine(card: ReceiptCard | null | undefined): string | null {
  if (!card) return null
  const brand = brandName(card.brand)
  const last4 = card.last4?.trim()
  const bank = card.bank?.trim()
  const cardPart = last4 ? `${brand ?? 'Card'} ending ${last4}` : brand ? `${brand} card` : null
  const parts = [cardPart, bank].filter((part): part is string => Boolean(part))
  return parts.length ? parts.join(', ') : null
}

/** "14 August 2026 to 14 August 2027": the membership term a payment bought. */
export function receiptTermLine(from: string | null | undefined, until: string | null | undefined): string | null {
  const start = longDate(from)
  const end = longDate(until)
  if (start && end) return `${start} to ${end}`
  return end ? `Until ${end}` : null
}

/**
 * The page title, which a browser offers as the file name when the receipt is
 * saved as a PDF. The site adds its own name after it.
 */
export function receiptTitle(paidAt: string | null | undefined): string {
  const date = paidAt ? new Date(paidAt) : null
  if (!date || Number.isNaN(date.getTime())) return 'Receipt'
  return `Receipt ${date.toISOString().slice(0, 10)}`
}
