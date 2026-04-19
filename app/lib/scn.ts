/** Supreme Court Enrolment Number — prefix shown in UI; payload stores digits only. */
export const SCN_PREFIX = 'SCN'

/** Valid length for the numeric part (after SCN). */
export const SCN_MIN_DIGITS = 4
export const SCN_MAX_DIGITS = 6

/**
 * Strips optional leading `SCN` (any case) and non-digits so the stored value is digits only.
 * Capped at {@link SCN_MAX_DIGITS}.
 */
export function normalizeScnDigitsOnly(raw: string | null | undefined): string {
  if (raw == null || raw === '') return ''
  const trimmed = String(raw).trim()
  const upper = trimmed.toUpperCase()
  const rest = upper.startsWith(SCN_PREFIX) ? upper.slice(SCN_PREFIX.length) : upper
  return rest.replace(/\D/g, '').slice(0, SCN_MAX_DIGITS)
}

export function isValidScnDigits(digits: string): boolean {
  if (!digits || !/^\d+$/.test(digits)) return false
  return digits.length >= SCN_MIN_DIGITS && digits.length <= SCN_MAX_DIGITS
}

/** For review / profile UI when the stored value is digits-only or legacy full string. */
export function formatScnForDisplay(stored: string | null | undefined): string {
  const digits = normalizeScnDigitsOnly(stored)
  if (!digits) return ''
  return `${SCN_PREFIX}${digits}`
}
