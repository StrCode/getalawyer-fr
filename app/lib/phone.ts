import { parsePhoneNumberFromString } from 'libphonenumber-js'

/**
 * Phone helpers, backed by libphonenumber-js (the default/min metadata
 * bundle — validation only; the server needs /max for number-type checks).
 * Mirrors the reference app's phone.ts: parse with a Nigeria default, gate on
 * .isValid(), store E.164, display national-for-NG / international otherwise.
 *
 * Signatures are unchanged from the previous regex implementation so every
 * call site keeps working. The gain is real validity checking: numbers the
 * old length-only regex waved through (e.g. 0000000000) are now rejected.
 */
export const DEFAULT_PHONE_COUNTRY = 'NG'

/**
 * Validated E.164 **without** the leading `+` (e.g. `2348012345678`), or null
 * if the input isn't a valid phone number. A bare Nigerian number (with or
 * without the trunk 0) parses against the NG default.
 */
export function normalizeNgPhone(raw: string): string | null {
  if (!raw?.trim()) return null
  const parsed = parsePhoneNumberFromString(raw.trim(), DEFAULT_PHONE_COUNTRY)
  if (!parsed?.isValid()) return null
  return parsed.number.replace(/^\+/, '')
}

/** Prepend `+` to an E.164 string that may lack it. */
export function toE164Plus(normalized: string): string {
  const cleaned = normalized.replace(/[^\d+]/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

/**
 * Human-readable form: national for Nigerian numbers (`0801 234 5678`),
 * international for everything else (`+44 7400 123456`) so a foreign number
 * can't be mistaken for a local one.
 */
export function formatNgPhoneDisplay(normalized: string): string {
  const e164 = toE164Plus(normalized)
  const parsed = parsePhoneNumberFromString(e164)
  if (!parsed) return e164
  return parsed.country === DEFAULT_PHONE_COUNTRY
    ? parsed.formatNational()
    : parsed.formatInternational()
}

export function isValidNgPhone(phone: string): boolean {
  return normalizeNgPhone(phone) !== null
}

/** Validated E.164 **with** the leading `+`, the form better-auth expects. */
export function toBetterAuthPhone(phone: string): string | null {
  if (!phone?.trim()) return null
  const parsed = parsePhoneNumberFromString(phone.trim(), DEFAULT_PHONE_COUNTRY)
  return parsed?.isValid() ? parsed.number : null
}
