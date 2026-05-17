export interface PracticeAreaSelection {
  practiceAreaId: string
  yearsOfExperience?: number | null
}

/** Normalize draft/API payloads: legacy `string[]` or `{ practiceAreaId, yearsOfExperience? }[]`. */
export function normalizePracticeAreaSelections(raw: unknown): PracticeAreaSelection[] {
  if (!Array.isArray(raw)) return []
  if (raw.length === 0) return []
  if (typeof raw[0] === 'string') {
    return raw.map((id) => ({
      practiceAreaId: String(id),
      yearsOfExperience: null,
    }))
  }
  return raw
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => ({
      practiceAreaId: String(item.practiceAreaId ?? item.id ?? ''),
      yearsOfExperience:
        item.yearsOfExperience === undefined || item.yearsOfExperience === ''
          ? null
          : Number(item.yearsOfExperience),
    }))
    .filter((item) => item.practiceAreaId.length > 0)
}

export function formatPracticeAreaYears(years: number | null | undefined): string {
  if (years == null || Number.isNaN(years)) return '—'
  if (years === 0) return '0 years'
  return years === 1 ? '1 year' : `${years} years`
}
