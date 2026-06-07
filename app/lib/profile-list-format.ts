import type {
  LawyerProfileEducation,
  LawyerProfileExperience,
  LawyerProfileLicense,
} from '~/types/lawyer-profile-editor'

function formatMonthLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(trimmed)
  if (monthMatch) {
    const date = new Date(Number(monthMatch[1]), Number(monthMatch[2]) - 1, 1)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    }
  }
  return trimmed
}

export function formatExperienceRange(item: LawyerProfileExperience): string | null {
  const start = formatMonthLabel(item.startDate)
  const end = item.isCurrent ? 'Present' : formatMonthLabel(item.endDate)
  if (!start && !end) return null
  if (start && end) return `${start} – ${end}`
  return start ?? end
}

export function formatEducationYears(item: LawyerProfileEducation): string | null {
  const { startYear, endYear } = item
  if (startYear && endYear) return `${startYear} – ${endYear}`
  if (startYear) return `From ${startYear}`
  if (endYear) return `Until ${endYear}`
  return null
}

export function formatEducationSubtitle(item: LawyerProfileEducation): string | null {
  const parts = [item.degree, item.fieldOfStudy].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : null
}

export function formatLicenseDates(item: LawyerProfileLicense): string | null {
  const issue = formatMonthLabel(item.issueDate)
  const expiry = formatMonthLabel(item.expirationDate)
  if (issue && expiry) return `Issued ${issue} · Expires ${expiry}`
  if (issue) return `Issued ${issue}`
  if (expiry) return `Expires ${expiry}`
  return null
}
