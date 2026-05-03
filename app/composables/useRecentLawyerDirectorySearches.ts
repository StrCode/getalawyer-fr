import type { Ref } from 'vue'
import type { ConsultationType } from '~/types/lawyer'
import type { FilterState } from '~/types/filter'
import { watchDebounced } from '@vueuse/core'

const STORAGE_KEY = 'getalawyer-fr:recent-lawyer-directory-searches'
const MAX_ENTRIES = 5

/** Round-trip-safe shape for serialization. */
export interface RecentLawyerDirectoryEntry {
  id: string
  keywords: string
  location: string
  consultationTypes: ConsultationType[]
  practiceAreas: string[]
  savedAt: number
}

/** Shown until the user saves real searches (design default data). */
export const RECENT_SEARCH_DEMO_ROWS: RecentLawyerDirectoryEntry[] = [
  {
    id: 'demo-contract-lagos',
    keywords: 'Contract review',
    location: 'Lagos',
    consultationTypes: ['video'],
    practiceAreas: [],
    savedAt: 1_764_902_400_000,
  },
  {
    id: 'demo-immigration-abuja',
    keywords: 'Immigration visa',
    location: 'Abuja',
    consultationTypes: ['phone'],
    practiceAreas: ['immigration-law'],
    savedAt: 1_764_816_000_000,
  },
  {
    id: 'demo-family-mediation',
    keywords: 'Divorce mediation',
    location: '',
    consultationTypes: [],
    practiceAreas: ['family-law'],
    savedAt: 1_764_729_600_000,
  },
]

/** Command palette canned suggestions (not persisted). */
export const DIRECTORY_COMMAND_SUGGESTIONS: Array<Pick<RecentLawyerDirectoryEntry, 'keywords' | 'location' | 'consultationTypes' | 'practiceAreas'> & { id: string; caption: string }> = [
  {
    id: 'suggestion-startup',
    caption: 'Incorporation & founders',
    keywords: 'Startup incorporation',
    location: '',
    consultationTypes: [],
    practiceAreas: ['corporate-law'],
  },
  {
    id: 'suggestion-real-estate',
    caption: 'Property closings',
    keywords: 'Real estate closing',
    location: '',
    consultationTypes: ['in-person'],
    practiceAreas: ['real-estate-law'],
  },
  {
    id: 'suggestion-employment',
    caption: 'Workplace disputes',
    keywords: 'Employment wrongful termination',
    location: '',
    consultationTypes: ['video'],
    practiceAreas: ['employment-law'],
  },
]

function fingerprintEntry(e: RecentLawyerDirectoryEntry): string {
  return [
    e.keywords.trim().toLowerCase(),
    e.location.trim().toLowerCase(),
    [...e.consultationTypes].sort().join('|'),
    [...e.practiceAreas].sort().join('|'),
  ].join('::')
}

function readStored(client: boolean): RecentLawyerDirectoryEntry[] {
  if (!client)
    return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed))
      return []
    return parsed
      .filter((row): row is RecentLawyerDirectoryEntry => !!row && typeof row === 'object' && typeof (row as RecentLawyerDirectoryEntry).keywords === 'string')
      .map(row => ({
        ...row,
        consultationTypes: Array.isArray(row.consultationTypes) ? row.consultationTypes as ConsultationType[] : [],
        practiceAreas: Array.isArray(row.practiceAreas) ? row.practiceAreas : [],
      }))
  }
  catch {
    return []
  }
}

function writeStored(rows: RecentLawyerDirectoryEntry[], client: boolean) {
  if (!client)
    return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, MAX_ENTRIES)))
  }
  catch {
    /* ignore quota / privacy mode */
  }
}

export function useRecentLawyerDirectorySearches() {
  /** True when nothing is in localStorage yet (demos replace list for design). */
  const hasStoredSearches = (): boolean =>
    import.meta.client && readStored(true).length > 0

  /** Persisted-only (no demos). */
  const listStoredOnly = (): RecentLawyerDirectoryEntry[] =>
    readStored(import.meta.client).slice(0, MAX_ENTRIES)

  /** What the UI should render: saved history, or curated demo placeholders. */
  const listDisplay = (): RecentLawyerDirectoryEntry[] => {
    const stored = readStored(import.meta.client)
    if (stored.length > 0)
      return stored.slice(0, MAX_ENTRIES)
    return RECENT_SEARCH_DEMO_ROWS
  }

  function pushRecentLawyerDirectorySearch(entry: Omit<RecentLawyerDirectoryEntry, 'id' | 'savedAt'> & Partial<Pick<RecentLawyerDirectoryEntry, 'id' | 'savedAt'>>): void {
    const client = import.meta.client
    if (!client)
      return

    const row: RecentLawyerDirectoryEntry = {
      id: entry.id ?? `r-${crypto.randomUUID()}`,
      keywords: entry.keywords.trim(),
      location: entry.location.trim(),
      consultationTypes: [...entry.consultationTypes],
      practiceAreas: [...entry.practiceAreas],
      savedAt: entry.savedAt ?? Date.now(),
    }

    if (!row.keywords && !row.location && row.consultationTypes.length === 0 && row.practiceAreas.length === 0)
      return

    const fp = fingerprintEntry(row)
    const prev = readStored(true).filter(existing => fingerprintEntry(existing) !== fp)

    writeStored([row, ...prev], true)
  }

  function pushFromFilterState(filters: FilterState): void {
    pushRecentLawyerDirectorySearch({
      keywords: filters.keywords ?? '',
      location: filters.location ?? '',
      consultationTypes: [...filters.consultationTypes],
      practiceAreas: [...filters.practiceAreas],
    })
  }

  return {
    hasStoredSearches,
    listStoredOnly,
    listDisplay,
    pushRecentLawyerDirectorySearch,
    pushFromFilterState,
  }
}

/**
 * Persist last meaningful filter combinations while browsing `/lawyers` (debounced).
 */
export function watchPersistRecentLawyerDirectorySearch(filters: Ref<FilterState>) {
  if (!import.meta.client)
    return

  const { pushFromFilterState } = useRecentLawyerDirectorySearches()

  /** Serialize so the debounced watcher is not fooled by freshly allocated arrays each tick. */
  const snapshotKey = () => {
    const f = filters.value
    const types = [...f.consultationTypes].sort().join(',')
    const areas = [...f.practiceAreas].sort().join(',')
    return `${f.keywords?.trim()}|${f.location?.trim()}|${types}|${areas}|${f.lawyerName?.trim()}`
  }

  watchDebounced(
    snapshotKey,
    () => {
      const f = filters.value
      if (!f.keywords?.trim()
        && !f.location?.trim()
        && f.consultationTypes.length === 0
        && f.practiceAreas.length === 0
        && !f.lawyerName?.trim()) {
        return
      }
      pushFromFilterState(f)
    },
    { debounce: 900 },
  )
}
