import * as z from 'zod'
import type { ConsultationType, CreateConsultationTypeInput, MeetingType } from '~/types/booking'

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

// ───────── the form for one type ─────────
export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240] as const
export const BUFFER_OPTIONS = [0, 5, 10, 15, 30, 60] as const
export const MEETING_TYPES = ['video', 'phone', 'in_person', 'any'] as const
export const CURRENCIES = ['NGN', 'USD', 'EUR', 'GBP'] as const

/**
 * What the form may hold. The price is text, as the field holds it; the
 * address is needed when the meeting is only in person; the video link, when
 * given, must be a full web address.
 */
export const consultationTypeSchema = z
  .object({
    name: z.string().trim().min(1, { error: 'Give the consultation a name.' }).max(120, { error: 'Keep the name to 120 characters.' }),
    description: z.string().trim().max(1000, { error: 'Keep this to 1,000 characters.' }),
    durationMinutes: z.number().int().positive(),
    bufferMinutes: z.number().int().min(0),
    price: z.string().trim().refine(value => value === '' || (/^\d+(\.\d{1,2})?$/.test(value)), {
      error: 'Enter an amount, for example 15000. Enter 0 for a free consultation.',
    }),
    currency: z.enum(CURRENCIES),
    meetingType: z.enum(MEETING_TYPES),
    officeAddress: z.string().trim().max(500, { error: 'Keep the address to 500 characters.' }),
    defaultMeetingLink: z.string().trim().max(500, { error: 'Keep the link to 500 characters.' }).refine((value) => {
      if (value === '') return true
      try {
        return ['http:', 'https:'].includes(new URL(value).protocol)
      }
      catch {
        return false
      }
    }, { error: 'Enter a full link, starting with https://' }),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.meetingType === 'in_person' && !data.officeAddress) {
      ctx.addIssue({ code: 'custom', path: ['officeAddress'], message: 'Add the address where you meet clients.' })
    }
  })
export type ConsultationTypeValues = z.input<typeof consultationTypeSchema>

export function consultationTypeValues(saved?: ConsultationType | null): ConsultationTypeValues {
  const price = saved ? Number.parseFloat(saved.price) : 0
  return {
    name: saved?.name ?? '',
    description: saved?.description ?? '',
    durationMinutes: saved?.durationMinutes ?? 30,
    bufferMinutes: saved?.bufferMinutes ?? 15,
    price: Number.isFinite(price) && price > 0 ? String(price) : '0',
    currency: (CURRENCIES as readonly string[]).includes(saved?.currency ?? '') ? saved!.currency as ConsultationTypeValues['currency'] : 'NGN',
    meetingType: saved?.meetingType ?? 'video',
    officeAddress: saved?.officeAddress ?? '',
    defaultMeetingLink: saved?.defaultMeetingLink ?? '',
    isActive: saved?.isActive ?? true,
  }
}

/** What is sent: the price as a number, and no address or link the meeting type does not use. */
export function consultationTypePayload(values: ConsultationTypeValues): CreateConsultationTypeInput {
  const usesAddress = values.meetingType === 'in_person' || values.meetingType === 'any'
  const usesLink = values.meetingType === 'video' || values.meetingType === 'any'
  const payload: CreateConsultationTypeInput = {
    name: values.name.trim(),
    durationMinutes: values.durationMinutes,
    bufferMinutes: values.bufferMinutes,
    price: values.price.trim() === '' ? 0 : Number(values.price),
    currency: values.currency,
    meetingType: values.meetingType,
    isActive: values.isActive,
  }
  if (values.description.trim()) payload.description = values.description.trim()
  if (usesAddress && values.officeAddress.trim()) payload.officeAddress = values.officeAddress.trim()
  if (usesLink && values.defaultMeetingLink.trim()) payload.defaultMeetingLink = values.defaultMeetingLink.trim()
  return payload
}
