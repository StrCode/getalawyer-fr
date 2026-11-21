import type { ConsultationType, MeetingType } from '~/types/booking'

/**
 * How a consultation type is put into words on the lawyer's own list: its
 * length, its price and how the meeting happens. Kept apart from the page so
 * it can be tested.
 */

/** "30 minutes", "1 hour", "1 hour 30 minutes". */
export function durationLabel(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const parts: string[] = []
  if (hours > 0) parts.push(hours === 1 ? '1 hour' : `${hours} hours`)
  if (rest > 0) parts.push(rest === 1 ? '1 minute' : `${rest} minutes`)
  return parts.join(' ')
}

/** "Free", "₦15,000", "₦2,500.50", "$40". The price arrives as text ("15000.00"). */
export function priceLabel(price: string | number, currency: string): string {
  const amount = typeof price === 'number' ? price : Number.parseFloat(price)
  if (!Number.isFinite(amount) || amount <= 0) return 'Free'
  const whole = Number.isInteger(amount)
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount)
  }
  catch {
    // a currency code the browser does not know
    return `${currency} ${amount.toLocaleString('en-NG')}`
  }
}

export const MEETING_LABEL: Record<MeetingType, string> = {
  video: 'Video call',
  phone: 'Phone call',
  in_person: 'In person',
  any: 'Client chooses how to meet',
}

export function meetingLabel(type: string): string {
  return MEETING_LABEL[type as MeetingType] ?? type
}

/** The facts under a type's name: length, how it is held, and the gap kept after it. */
export function typeFacts(type: Pick<ConsultationType, 'durationMinutes' | 'meetingType' | 'bufferMinutes'>): string[] {
  const facts = [durationLabel(type.durationMinutes), meetingLabel(type.meetingType)]
  if (type.bufferMinutes > 0) facts.push(`${durationLabel(type.bufferMinutes)} kept free afterwards`)
  return facts.filter(Boolean)
}

/** "1 offered to clients", "2 offered to clients", "None offered to clients". */
export function offeredSummary(types: Pick<ConsultationType, 'isActive'>[]): string {
  const count = types.filter(type => type.isActive).length
  return count === 0 ? 'None offered to clients' : `${count} offered to clients`
}
