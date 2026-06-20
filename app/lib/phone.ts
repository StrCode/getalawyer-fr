/** Normalize Nigerian numbers to E.164 without + (e.g. 2348012345678). */
export function normalizeNgPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return null

  if (digits.startsWith("234")) {
    return digits.length >= 13 && digits.length <= 14 ? digits : null
  }

  if (digits.startsWith("0")) {
    const local = digits.slice(1)
    if (local.length === 10) return `234${local}`
    return null
  }

  if (digits.length === 10) return `234${digits}`

  return null
}

export function toE164Plus(normalized: string): string {
  const digits = normalized.replace(/\D/g, "")
  return digits.startsWith("+") ? digits : `+${digits}`
}

export function formatNgPhoneDisplay(normalized: string): string {
  const digits = normalized.replace(/\D/g, "")
  if (digits.startsWith("234") && digits.length >= 13) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return `+${digits}`
}

export function isValidNgPhone(phone: string): boolean {
  return normalizeNgPhone(phone) !== null
}

export function toBetterAuthPhone(phone: string): string | null {
  const normalized = normalizeNgPhone(phone)
  if (!normalized) return null
  return toE164Plus(normalized)
}
