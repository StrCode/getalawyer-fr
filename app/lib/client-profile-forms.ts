import * as z from 'zod'
import type { ClientProfile } from '~/lib/api'
import { isValidNgPhone } from '~/lib/phone'

/**
 * The forms on a client's profile: name and company, where they live, a note
 * about what they need, and a phone number. For each, what a field may hold,
 * the values the form starts from, and what is sent. Limits follow the API's
 * own (Law-Backend `client-validator.ts`).
 */

export const DEFAULT_COUNTRY = 'NG'

export const personalSchema = z.object({
  name: z.string().trim().min(1, { error: 'Enter your name.' }).max(100, { error: 'Keep your name to 100 characters.' }),
  company: z.string().trim().max(160, { error: 'Keep this to 160 characters.' }),
})
export type PersonalValues = z.input<typeof personalSchema>
export function personalValues(saved?: ClientProfile | null): PersonalValues {
  return { name: saved?.name ?? '', company: saved?.company ?? '' }
}
export function personalPayload(values: PersonalValues) {
  return { name: values.name.trim(), company: values.company.trim() || undefined }
}

export const locationSchema = z.object({
  state: z.string().min(2, { error: 'Choose your state.' }),
  city: z.string().trim().max(120, { error: 'Keep the city to 120 characters.' }),
})
export type LocationValues = z.input<typeof locationSchema>
export function locationValues(saved?: ClientProfile | null): LocationValues {
  return { state: saved?.state ?? '', city: saved?.city ?? '' }
}
export function locationPayload(values: LocationValues) {
  return { country: DEFAULT_COUNTRY, state: values.state, city: values.city.trim() || undefined }
}

export const BIO_MAX = 2000
export const bioSchema = z.object({
  bio: z.string().trim().max(BIO_MAX, { error: 'Keep this to 2,000 characters.' }),
})
export type BioValues = z.input<typeof bioSchema>
export function bioValues(saved?: ClientProfile | null): BioValues {
  return { bio: saved?.bio ?? '' }
}
export function bioPayload(values: BioValues) {
  return { bio: values.bio.trim() || undefined }
}

export const contactSchema = z.object({
  phoneNumber: z.string().trim().refine(value => value === '' || isValidNgPhone(value), {
    error: 'Enter a Nigerian phone number, or leave it empty.',
  }),
})
export type ContactValues = z.input<typeof contactSchema>
export function contactValues(saved?: ClientProfile | null): ContactValues {
  return { phoneNumber: saved?.phoneNumber ?? '' }
}
export function contactPayload(values: ContactValues) {
  return { phoneNumber: values.phoneNumber.trim() || undefined }
}

/** Up to three practice areas a client wants help with. */
export const MAX_INTERESTS = 3
export const interestsSchema = z.object({
  ids: z.array(z.string().min(1))
    .min(1, { error: 'Choose at least one area.' })
    .max(MAX_INTERESTS, { error: `Choose up to ${MAX_INTERESTS} areas.` }),
})
export type InterestsValues = z.input<typeof interestsSchema>
export function interestsValues(saved?: ClientProfile | null): InterestsValues {
  return { ids: (saved?.specializations ?? []).map(area => area.id) }
}

/** A phone number to verify, from the settings page. */
export const phoneToVerifySchema = z.object({
  phone: z.string().trim().min(1, { error: 'Enter your phone number.' }).refine(value => value === '' || isValidNgPhone(value), {
    error: 'Enter a Nigerian phone number.',
  }),
})
export type PhoneToVerifyValues = z.input<typeof phoneToVerifySchema>
