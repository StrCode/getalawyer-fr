import type { ClientProfile } from '~/lib/api'

export interface ClientCompletenessItem {
  label: string
  done: boolean
  optional?: boolean
}

export function computeClientProfileCompleteness(
  profile: ClientProfile | null | undefined,
): { items: ClientCompletenessItem[]; percent: number } {
  const items: ClientCompletenessItem[] = [
    { label: 'Profile photo', done: Boolean(profile?.image) },
    { label: 'Full name', done: Boolean(profile?.name?.trim()) },
    { label: 'State or region', done: Boolean(profile?.state) },
    { label: 'Short bio', done: Boolean(profile?.bio?.trim()), optional: true },
    { label: 'Phone number', done: Boolean(profile?.phoneNumber?.trim()), optional: true },
    { label: 'Legal interests', done: (profile?.specializations?.length ?? 0) > 0, optional: true },
  ]

  const required = items.filter((item) => !item.optional)
  const done = required.filter((item) => item.done).length
  const percent = required.length > 0 ? Math.round((done / required.length) * 100) : 0

  return { items, percent }
}
