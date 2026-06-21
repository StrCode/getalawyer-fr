<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLawyerFilters } from '~/composables/useLawyerFilters'
import { watchPersistRecentLawyerDirectorySearch } from '~/composables/useRecentLawyerDirectorySearches'
import { useLawyers } from '~/composables/useLawyers'
import { useSpecializations } from '~/composables/useSpecializations'
import { NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'
import type { Specialization } from '~/lib/api'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Checkbox } from '~/components/ui/checkbox'
import Input from '~/components/ui/input/Input.vue'
import { PhBriefcase, PhCaretDown, PhFaders, PhMagnifyingGlass, PhMapPin, PhRows, PhSquaresFour, PhUser, PhX } from '@phosphor-icons/vue'
import type { LocationQuery } from 'vue-router'

/** `/find-lawyers` — directory listing with landing layout (same nav/footer as homepage). */

const FIND_LAWYERS_LAYOUT_KEY = 'getalawyer-fr:find-lawyers-layout'

function parseViewQuery(v: unknown): 'grid' | 'list' | undefined {
  if (v === undefined || v === null) return undefined
  const s = Array.isArray(v) ? v[0] : v
  if (typeof s !== 'string') return undefined
  if (s === 'list') return 'list'
  if (s === 'grid') return 'grid'
  return undefined
}

function readStoredResultsLayout(): 'grid' | 'list' | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(FIND_LAWYERS_LAYOUT_KEY)
    return raw === 'list' || raw === 'grid' ? raw : null
  }
  catch {
    return null
  }
}

function writeStoredResultsLayout(v: 'grid' | 'list') {
  if (!import.meta.client) return
  try {
    localStorage.setItem(FIND_LAWYERS_LAYOUT_KEY, v)
  }
  catch {
    /* ignore quota */
  }
}

const STATE_DIRECTORY_OPTIONS = NIGERIA_STATE_NAMES.map(name => ({
  code: name,
  label: name,
}))

/** One token (code, name, or legacy slug-style) → canonical state code. */
function normalizeSingleStateCode(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  const upper = t.toUpperCase()
  if (STATE_DIRECTORY_OPTIONS.some(s => s.code === upper))
    return upper
  const byName = STATE_DIRECTORY_OPTIONS.find(
    s => s.label.toLowerCase() === t.toLowerCase(),
  )
  return byName?.code ?? upper
}

/** `filters.location` stores comma-separated state codes (e.g. `LA,FC`). */
function parseStateCodesFromLocation(location: string): string[] {
  if (!location.trim()) return []
  const parts = location.split(',').map(s => s.trim()).filter(Boolean)
  const codes = parts.map(p => normalizeSingleStateCode(p)).filter(Boolean)
  return [...new Set(codes)]
}

function serializeStateCodesForLocation(codes: string[]): string {
  const normalized = [...new Set(codes.map(c => normalizeSingleStateCode(c)).filter(Boolean))]
  normalized.sort((a, b) => a.localeCompare(b))
  return normalized.join(',')
}

function normalizeLocationQueryField(raw: string): string {
  return serializeStateCodesForLocation(parseStateCodesFromLocation(raw))
}

function specializationSlugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/** Map `areas` query tokens to API specialization ids when possible. */
function resolvePracticeAreaToken(specs: Specialization[], token: string): string {
  const t = token.trim()
  if (!t) return t
  if (specs.some(s => s.id === t)) return t
  const bySlug = specs.find(s => specializationSlugFromName(s.name) === t.toLowerCase())
  return bySlug?.id ?? t
}

definePageMeta({
  layout: 'landing',
  middleware: ['client-directory'],
})

useHead({
  title: 'Lawyers · GetaLawyer',
  meta: [
    { name: 'description', content: 'Search and find qualified lawyers by practice area, location, and consultation type.' },
    { name: 'robots', content: 'noindex' }
  ]
})

const route = useRoute()
const router = useRouter()
const { useLawyersInfiniteList } = useLawyers()

const ITEMS_PER_PAGE = 12

function directoryQueryMerge(base: LocationQuery): LocationQuery {
  const q: LocationQuery = { ...base }
  if (resultsLayout.value === 'list')
    q.view = 'list'
  else
    delete q.view
  delete q.page
  return q
}

const resultsLayout = ref<'grid' | 'list'>(parseViewQuery(route.query.view) ?? 'grid')

const { filters, resetFilters, filtersFromQuery, filtersToQuery } = useLawyerFilters({
  mergeQuery: directoryQueryMerge,
})

filters.value = {
  ...filters.value,
  location: normalizeLocationQueryField(filters.value.location),
}

watchPersistRecentLawyerDirectorySearch(filters)

const { data: specData, isPending: specsLoading } = useSpecializations()

const specializationsList = computed(() => specData.value ?? [])

const specPopoverOpen = ref(false)
const specSearchQuery = ref('')

const filteredSpecializations = computed(() => {
  const q = specSearchQuery.value.trim().toLowerCase()
  const list = specializationsList.value
  if (!q) return list
  return list.filter(
    s =>
      s.name.toLowerCase().includes(q)
      || s.description?.toLowerCase().includes(q),
  )
})

const specializationTriggerLabel = computed(() => {
  const ids = filters.value.practiceAreas
  const specs = specializationsList.value
  if (ids.length === 0) return 'All specializations'
  if (ids.length === 1) {
    const n = specs.find(s => s.id === ids[0])?.name
    return n ?? '1 selected'
  }
  return `${ids.length} selected`
})

function specializationNameById(id: string): string {
  return specializationsList.value.find(s => s.id === id)?.name ?? id
}

function toggleSpecialization(id: string, checked: boolean) {
  const next = new Set(filters.value.practiceAreas)
  if (checked) next.add(id)
  else next.delete(id)
  filters.value = { ...filters.value, practiceAreas: [...next] }
}

function removeSpecialization(id: string) {
  toggleSpecialization(id, false)
}

watch(
  () => specData.value,
  (specs) => {
    if (!specs?.length) return
    const raw = filters.value.practiceAreas
    const next = [...new Set(raw.map(t => resolvePracticeAreaToken(specs, t)))]
    const same = raw.length === next.length && raw.every((v, i) => v === next[i])
    if (!same)
      filters.value = { ...filters.value, practiceAreas: next }
  },
)

watch(specPopoverOpen, (open) => {
  if (!open)
    specSearchQuery.value = ''
})

const statePopoverOpen = ref(false)
const stateSearchQuery = ref('')

const selectedStateCodes = computed(() => parseStateCodesFromLocation(filters.value.location))

const filteredStates = computed(() => {
  const q = stateSearchQuery.value.trim().toLowerCase()
  if (!q) return STATE_DIRECTORY_OPTIONS
  return STATE_DIRECTORY_OPTIONS.filter(
    s =>
      s.label.toLowerCase().includes(q)
      || s.code.toLowerCase().includes(q),
  )
})

const statesTriggerLabel = computed(() => {
  const codes = selectedStateCodes.value
  if (codes.length === 0) return 'All states'
  if (codes.length === 1) {
    return STATE_DIRECTORY_OPTIONS.find(s => s.code === codes[0])?.label ?? codes[0]
  }
  return `${codes.length} states`
})

function stateLabel(code: string): string {
  return STATE_DIRECTORY_OPTIONS.find(s => s.code === code)?.label ?? code
}

function toggleStateCode(code: string, checked: boolean) {
  const norm = normalizeSingleStateCode(code)
  const next = new Set(selectedStateCodes.value)
  if (checked) next.add(norm)
  else next.delete(norm)
  filters.value = {
    ...filters.value,
    location: serializeStateCodesForLocation([...next]),
  }
}

function removeStateCode(code: string) {
  toggleStateCode(code, false)
}

function clearStatesFilter() {
  filters.value = { ...filters.value, location: '' }
  statePopoverOpen.value = false
}

function clearSpecializationsFilter() {
  filters.value = { ...filters.value, practiceAreas: [] }
  specPopoverOpen.value = false
}

watch(statePopoverOpen, (open) => {
  if (!open)
    stateSearchQuery.value = ''
})

onMounted(() => {
  const fromRoute = filtersFromQuery(route.query)
  filters.value = {
    ...fromRoute,
    location: normalizeLocationQueryField(fromRoute.location),
  }

  const viewFromUrl = parseViewQuery(route.query.view)
  if (viewFromUrl !== undefined) {
    resultsLayout.value = viewFromUrl
    writeStoredResultsLayout(viewFromUrl)
  }
  else {
    const saved = readStoredResultsLayout()
    if (saved !== null)
      resultsLayout.value = saved
  }
})

const searchParams = computed(() => {
  const params: Record<string, unknown> = {}

  if (filters.value.keywords) params.q = filters.value.keywords
  if (filters.value.lawyerName) params.name = filters.value.lawyerName
  if (filters.value.location) params.state = filters.value.location
  if (filters.value.practiceAreas.length > 0) params.specializations = filters.value.practiceAreas
  if (filters.value.minExperience) params.minExperience = filters.value.minExperience
  if (filters.value.priceRange.max) params.maxExperience = filters.value.priceRange.max
  params.limit = ITEMS_PER_PAGE

  if (filters.value.keywords || filters.value.lawyerName) {
    params.sortBy = 'relevance'
  }
  else {
    params.sortBy = 'experience'
  }

  return params
})

const {
  data: lawyersData,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  error,
  refetch,
} = useLawyersInfiniteList(searchParams)

const lawyers = computed(() => {
  if (!lawyersData.value?.pages) return []
  return lawyersData.value.pages.flatMap(page => page.results)
})

watch(resultsLayout, (v) => {
  writeStoredResultsLayout(v)
  router.replace({
    query: directoryQueryMerge(filtersToQuery(filters.value)),
  })
})

watch(
  () => route.query.view,
  () => {
    const p = parseViewQuery(route.query.view)
    if (p !== undefined && p !== resultsLayout.value) {
      resultsLayout.value = p
      writeStoredResultsLayout(p)
    }
  },
)

const activeFilterCount = computed(() => {
  const f = filters.value
  let count = 0
  if (f.keywords) count++
  if (f.lawyerName) count++
  if (f.practiceAreas.length > 0) count++
  if (parseStateCodesFromLocation(f.location).length > 0) count++
  if (f.consultationTypes.length > 0) count++
  if (f.minRating) count++
  if (f.minExperience) count++
  if (f.priceRange.min || f.priceRange.max) count++
  if (f.certifications.length > 0) count++
  if (f.languages.length > 0) count++
  return count
})

function clearAllFilters(): void {
  resetFilters()
}

const showMobileFilters = ref(false)
</script>

<template>
  <div class="bg-canvas pb-16 font-sans text-foreground sm:pb-24">
    <!-- Compact hero + unified search -->
    <header class="relative overflow-hidden border-b border-border bg-canvas">
      <div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-linear-to-b from-brass/6 to-transparent" />
      <div class="relative mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center">
          <div class="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface-2 px-3.5 py-2">
            <span class="size-1.5 rounded-full bg-brass" />
            <span class="text-eyebrow text-brass">Verified directory</span>
          </div>
          <h1 class="display-xl text-balance text-foreground">
            Find a verified lawyer
          </h1>
          <p class="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every profile is NIN &amp; SCN verified. Filter by name, topic, state, or specialization.
          </p>
        </div>

        <!-- Unified search bar (Glide / Fiverr pattern) -->
        <div
          role="search"
          aria-label="Search lawyers"
          class="mx-auto mt-8 max-w-3xl rounded-[1.25rem] border border-border bg-card p-2 shadow-lg shadow-ink/4"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label class="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2">
              <PhMagnifyingGlass class="size-4 shrink-0 text-primary" aria-hidden="true" />
              <input
                v-model="filters.keywords"
                type="search"
                enterkeyhint="search"
                autocomplete="off"
                aria-label="Topic or keywords"
                class="min-w-0 flex-1 border-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/70"
                placeholder="Search by topic or keyword…"
              >
            </label>
            <div class="mx-2 hidden h-8 w-px bg-border sm:block" />
            <label class="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 sm:max-w-[14rem]">
              <PhUser class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                v-model="filters.lawyerName"
                type="search"
                enterkeyhint="search"
                autocomplete="off"
                aria-label="Lawyer name"
                class="min-w-0 flex-1 border-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/70"
                placeholder="Or by name…"
              >
            </label>
          </div>
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <!-- Mobile filter toggle -->
      <button
        type="button"
        class="mb-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 lg:hidden"
        :aria-expanded="showMobileFilters"
        @click="showMobileFilters = !showMobileFilters"
      >
        <PhFaders class="size-4" aria-hidden="true" />
        {{ showMobileFilters ? 'Hide filters' : 'Show filters' }}
        <Badge v-if="activeFilterCount > 0" variant="soft" class="ms-1 rounded-full px-2 py-0 text-xs tabular-nums">
          {{ activeFilterCount }}
        </Badge>
      </button>

      <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
        <!-- Sidebar filters (Webflow / Zendesk pattern) -->
        <aside
          class="w-full shrink-0 lg:w-72"
          :class="showMobileFilters ? 'block' : 'hidden lg:block'"
        >
          <div class="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div class="mb-5 flex items-center justify-between gap-3">
              <h2 class="text-sm font-semibold text-foreground">
                Refine search
              </h2>
              <button
                v-if="activeFilterCount > 0"
                type="button"
                class="cursor-pointer text-xs font-medium text-primary hover:text-primary/80"
                @click="clearAllFilters"
              >
                Clear all
              </button>
            </div>

            <div class="flex flex-col gap-5">
              <!-- States -->
              <div class="flex flex-col gap-2">
                <span class="text-eyebrow text-muted-foreground">States</span>
                <Popover v-model:open="statePopoverOpen">
                  <PopoverTrigger as-child>
                    <button
                      type="button"
                      class="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 text-left text-sm text-foreground transition-colors hover:border-foreground/20 focus-visible:border-primary/30 focus-visible:ring-3 focus-visible:ring-primary/10 focus-visible:outline-none"
                      aria-haspopup="dialog"
                      aria-label="States"
                      :aria-expanded="statePopoverOpen"
                    >
                      <PhMapPin class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span class="min-w-0 flex-1 truncate">{{ statesTriggerLabel }}</span>
                      <PhCaretDown class="size-4 shrink-0 text-muted-foreground" weight="bold" aria-hidden="true" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" class="w-(--reka-popover-trigger-width) rounded-xl border-border p-0">
                    <div class="border-b border-border p-2">
                      <Input
                        v-model="stateSearchQuery"
                        type="search"
                        autocomplete="off"
                        placeholder="Filter states…"
                        class="h-9 rounded-xl border-border bg-transparent"
                      />
                    </div>
                    <div class="max-h-64 overflow-y-auto overscroll-contain p-2">
                      <button
                        type="button"
                        class="mb-2 w-full cursor-pointer rounded-lg px-2 py-2 text-left text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                        @click="clearStatesFilter"
                      >
                        All states
                      </button>
                      <p
                        v-if="filteredStates.length === 0"
                        class="px-2 py-6 text-center text-sm text-muted-foreground"
                      >
                        No matches.
                      </p>
                      <label
                        v-for="s in filteredStates"
                        :key="s.code"
                        class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-surface-2"
                      >
                        <Checkbox
                          :checked="selectedStateCodes.includes(s.code)"
                          @update:checked="(v: boolean | 'indeterminate') => toggleStateCode(s.code, v === true)"
                        />
                        <span class="min-w-0 leading-snug">{{ s.label }}</span>
                        <span class="ms-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{{ s.code }}</span>
                      </label>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <!-- Specializations -->
              <div class="flex flex-col gap-2">
                <span class="text-eyebrow text-muted-foreground">Specializations</span>
                <div
                  v-if="specsLoading"
                  class="flex h-11 items-center rounded-xl border border-border bg-surface-2 px-3 text-sm text-muted-foreground"
                  aria-busy="true"
                >
                  Loading…
                </div>
                <Popover v-else v-model:open="specPopoverOpen">
                  <PopoverTrigger as-child>
                    <button
                      type="button"
                      class="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 text-left text-sm text-foreground transition-colors hover:border-foreground/20 focus-visible:border-primary/30 focus-visible:ring-3 focus-visible:ring-primary/10 focus-visible:outline-none"
                      aria-haspopup="dialog"
                      aria-label="Specializations"
                      :aria-expanded="specPopoverOpen"
                    >
                      <PhBriefcase class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span class="min-w-0 flex-1 truncate">{{ specializationTriggerLabel }}</span>
                      <PhCaretDown class="size-4 shrink-0 text-muted-foreground" weight="bold" aria-hidden="true" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" class="w-(--reka-popover-trigger-width) rounded-xl border-border p-0">
                    <div class="border-b border-border p-2">
                      <Input
                        v-model="specSearchQuery"
                        type="search"
                        autocomplete="off"
                        placeholder="Filter specializations…"
                        class="h-9 rounded-xl border-border bg-transparent"
                      />
                    </div>
                    <div class="max-h-64 overflow-y-auto overscroll-contain p-2">
                      <button
                        type="button"
                        class="mb-2 w-full cursor-pointer rounded-lg px-2 py-2 text-left text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                        @click="clearSpecializationsFilter"
                      >
                        All specializations
                      </button>
                      <p
                        v-if="filteredSpecializations.length === 0"
                        class="px-2 py-6 text-center text-sm text-muted-foreground"
                      >
                        No matches.
                      </p>
                      <label
                        v-for="s in filteredSpecializations"
                        :key="s.id"
                        class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-surface-2"
                      >
                        <Checkbox
                          :checked="filters.practiceAreas.includes(s.id)"
                          @update:checked="(v: boolean | 'indeterminate') => toggleSpecialization(s.id, v === true)"
                        />
                        <span class="min-w-0 leading-snug">{{ s.name }}</span>
                      </label>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <!-- Trust callout -->
            <div class="mt-6 rounded-xl border border-brass/20 bg-brass/5 p-4">
              <p class="text-eyebrow text-brass">Verified only</p>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every lawyer in this directory has passed NIN and Supreme Court number verification.
              </p>
            </div>
          </div>
        </aside>

        <!-- Results column -->
        <main class="min-w-0 flex-1">
          <!-- Active filter chips -->
          <div
            v-if="activeFilterCount > 0"
            class="mb-5 flex flex-wrap items-center gap-2"
          >
            <div v-if="filters.lawyerName" class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground">
              {{ filters.lawyerName }}
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-muted-foreground hover:text-foreground" aria-label="Remove name filter" @click="filters.lawyerName = ''">
                <PhX class="size-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="filters.keywords" class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground">
              {{ filters.keywords }}
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-muted-foreground hover:text-foreground" aria-label="Remove keyword filter" @click="filters.keywords = ''">
                <PhX class="size-4" aria-hidden="true" />
              </button>
            </div>
            <div
              v-for="code in selectedStateCodes"
              :key="code"
              class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
            >
              <span class="truncate">{{ stateLabel(code) }}</span>
              <button
                type="button"
                class="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-muted-foreground hover:text-foreground"
                :aria-label="`Remove ${stateLabel(code)}`"
                @click="removeStateCode(code)"
              >
                <PhX class="size-4" aria-hidden="true" />
              </button>
            </div>
            <div
              v-for="sid in filters.practiceAreas"
              :key="sid"
              class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
            >
              <span class="truncate">{{ specializationNameById(sid) }}</span>
              <button
                type="button"
                class="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-muted-foreground hover:text-foreground"
                :aria-label="`Remove ${specializationNameById(sid)}`"
                @click="removeSpecialization(sid)"
              >
                <PhX class="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Results toolbar -->
          <div
            v-if="!isLoading && !error"
            class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-xs"
          >
            <div>
              <p class="text-base font-semibold text-foreground">
                <span class="font-mono tabular-nums">{{ lawyers.length }}</span>
                {{ lawyers.length === 1 ? ' lawyer' : ' lawyers' }}
                <span v-if="hasNextPage && lawyers.length > 0" class="text-muted-foreground">+</span>
              </p>
              <p class="text-eyebrow mt-0.5 text-muted-foreground">
                {{ searchParams.sortBy === 'relevance' ? 'Sorted by relevance' : 'Sorted by experience' }}
              </p>
            </div>

            <div
              class="inline-flex items-center rounded-xl border border-border bg-surface-2 p-0.5"
              role="toolbar"
              aria-label="Layout"
            >
              <button
                type="button"
                class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors"
                :class="resultsLayout === 'grid' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'"
                :aria-pressed="resultsLayout === 'grid'"
                title="Grid"
                @click="resultsLayout = 'grid'"
              >
                <PhSquaresFour class="size-5" weight="regular" aria-hidden="true" />
                <span class="sr-only">Grid layout</span>
              </button>
              <button
                type="button"
                class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors"
                :class="resultsLayout === 'list' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'"
                :aria-pressed="resultsLayout === 'list'"
                title="List"
                @click="resultsLayout = 'list'"
              >
                <PhRows class="size-5" weight="regular" aria-hidden="true" />
                <span class="sr-only">List layout</span>
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div
            v-if="isLoading"
            aria-busy="true"
            aria-label="Loading lawyer results"
            :class="resultsLayout === 'grid'
              ? 'lawyers-catalog-grid grid gap-5 sm:grid-cols-2 xl:grid-cols-3'
              : 'lawyers-catalog-list flex flex-col gap-4'"
          >
            <LawyerSearchCardSkeleton
              v-for="i in resultsLayout === 'grid' ? 6 : 4"
              :key="i"
              :layout="resultsLayout"
            />
          </div>

          <!-- Error -->
          <div v-else-if="error" class="rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-xs sm:px-8">
            <EmptyState
              title="Error loading lawyers"
              description="There was an error loading the lawyers list. Please try again."
              action-text="Retry"
              @action="refetch()"
            />
          </div>

          <!-- Empty -->
          <div
            v-else-if="lawyers.length === 0"
            class="rounded-2xl border border-dashed border-border bg-card px-4 py-10 sm:px-8 sm:py-12"
          >
            <LawyerDirectoryEmpty
              :active-filter-count="activeFilterCount"
              :keyword="filters.keywords"
              @reset="clearAllFilters"
            />
          </div>

          <!-- Results grid / list -->
          <div
            v-else
            :class="resultsLayout === 'grid'
              ? 'lawyers-catalog-grid grid gap-5 sm:grid-cols-2 xl:grid-cols-3'
              : 'lawyers-catalog-list flex w-full flex-col gap-4'"
          >
            <LawyerSearchCard
              v-for="lawyer in lawyers"
              :key="lawyer.id"
              :density="resultsLayout === 'grid' ? 'grid' : 'row'"
              :lawyer="lawyer"
            />
          </div>

          <!-- Load more -->
          <div
            v-if="hasNextPage && lawyers.length > 0"
            class="mt-10 flex justify-center"
          >
            <Button
              variant="outline"
              size="lg"
              class="min-w-[12rem] rounded-full"
              :disabled="isFetchingNextPage"
              @click="fetchNextPage()"
            >
              {{ isFetchingNextPage ? 'Loading…' : 'Load more lawyers' }}
            </Button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lawyers-catalog-grid :deep(.lawyer-search-card) {
  height: 100%;
}

.lawyers-catalog-list :deep(.lawyer-search-card) {
  height: auto;
  width: 100%;
}
</style>
