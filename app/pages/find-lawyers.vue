<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLawyerFilters } from '~/composables/useLawyerFilters'
import { usePagination } from '~/composables/usePagination'
import { watchPersistRecentLawyerDirectorySearch } from '~/composables/useRecentLawyerDirectorySearches'
import { useLawyers } from '~/composables/useLawyers'
import { useSpecializations } from '~/composables/useSpecializations'
import { NIGERIA_STATES } from '~/constants/nigeria-states-lgas'
import type { Specialization } from '~/lib/api'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Checkbox } from '~/components/ui/checkbox'
import Input from '~/components/ui/input/Input.vue'
import { PhCaretDown, PhRows, PhSquaresFour } from '@phosphor-icons/vue'
import type { LocationQuery } from 'vue-router'

/** `/find-lawyers` — directory listing with home layout (same shell as marketing pages). */

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

const STATE_DIRECTORY_OPTIONS = [...NIGERIA_STATES]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(s => ({ code: s.code, label: s.name }))

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

/** Same shell as homepage: `AppHeader` + wordmark + marketing nav. */
definePageMeta({
  layout: 'home'
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
const { useLawyersList } = useLawyers()

const totalItems = ref(0)

const { currentPage, itemsPerPage } = usePagination({
  itemsPerPage: 12,
  totalItems,
})

const resultsLayout = ref<'grid' | 'list'>(parseViewQuery(route.query.view) ?? 'grid')

function directoryQueryMerge(base: LocationQuery): LocationQuery {
  const q: LocationQuery = { ...base }
  if (resultsLayout.value === 'list')
    q.view = 'list'
  else
    delete q.view
  if (currentPage.value > 1)
    q.page = String(currentPage.value)
  else
    delete q.page
  return q
}

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
  currentPage.value = 1
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
  currentPage.value = 1
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
  currentPage.value = 1
  filters.value = { ...filters.value, location: '' }
  statePopoverOpen.value = false
}

function clearSpecializationsFilter() {
  currentPage.value = 1
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
  if (filters.value.location) params.state = filters.value.location
  if (filters.value.practiceAreas.length > 0) params.specializations = filters.value.practiceAreas
  if (filters.value.minExperience) params.minExperience = filters.value.minExperience
  if (filters.value.priceRange.max) params.maxExperience = filters.value.priceRange.max
  if (currentPage.value > 1) params.page = currentPage.value
  params.limit = itemsPerPage.value

  if (filters.value.keywords) {
    params.sortBy = 'relevance'
  }
  else {
    params.sortBy = 'experience'
  }

  return params
})

const { data: lawyersData, isLoading, error } = useLawyersList(searchParams)

const lawyers = computed(() => {
  if (!lawyersData.value?.results) return []
  return lawyersData.value.results
})

const pagination = computed(() => lawyersData.value?.pagination)

watch(pagination, (newPagination) => {
  if (newPagination) {
    totalItems.value = newPagination.total
  }
}, { immediate: true })

/** Pagination changes don't go through filter debounce — mirror query here. */
watch(currentPage, () => {
  router.replace({
    query: directoryQueryMerge(filtersToQuery(filters.value)),
  })
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
  currentPage.value = 1
  resetFilters()
}
</script>

<template>
  <div class="min-h-screen bg-neutral-100 pb-24 font-sans text-foreground sm:pb-32 lg:pb-40 dark:bg-background">
    <header
      class="border-border/80 border-b bg-[radial-gradient(ellipse_120%_80%_at_0%_0%,oklch(0.7_0.12_152/0.15),transparent_55%)] bg-muted/35 pt-20 sm:pt-24 dark:bg-muted/20"
    >
      <div class="mx-auto box-border w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8 sm:pb-8">
        <div class="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p class="mb-4 font-semibold text-3 uppercase tracking-[0.22em] text-muted-foreground">
            Directory
          </p>
          <h1 class="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl sm:leading-[1.08] lg:text-6xl">
            Find a lawyer
          </h1>
          <p class="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            Search by topic, one or more states, and one or more specializations from our directory.
          </p>
        </div>

        <div
          role="search"
          aria-label="Search lawyers"
          class="flex w-full flex-col gap-4 md:flex-row md:items-end md:gap-x-5 md:gap-y-4"
        >
          <label class="flex min-w-0 w-full basis-0 flex-col gap-1.5 md:min-w-[12rem] md:flex-1">
            <span class="ps-px font-semibold text-2.5 uppercase tracking-[0.14em] text-muted-foreground">
              Topic or keywords
            </span>
            <span
              class="flex items-center rounded-lg border border-dotted border-muted-foreground/35 bg-background px-3.5 py-2 transition-colors focus-within:border-brand focus-within:border-solid focus-within:shadow-[0_0_0_3px_rgb(34_139_84/0.12)] dark:bg-card dark:border-muted-foreground/30"
            >
              <input
                v-model="filters.keywords"
                type="search"
                enterkeyhint="search"
                autocomplete="off"
                aria-label="Topic or keywords"
                class="min-w-0 flex-1 border-0 bg-transparent text-[0.9375rem] text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Search by topic or keyword"
              >
            </span>
          </label>

          <div class="flex min-w-0 w-full basis-0 flex-col gap-1.5 md:min-w-[12rem] md:flex-1">
            <span class="ps-px font-semibold text-2.5 uppercase tracking-[0.14em] text-muted-foreground">
              States
            </span>
            <div class="min-w-0 w-full">
              <Popover v-model:open="statePopoverOpen">
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="flex h-11 min-w-0 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-dotted border-muted-foreground/35 bg-background px-3 text-left text-[0.9375rem] text-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/40 focus-visible:border-brand focus-visible:border-solid focus-visible:shadow-[0_0_0_3px_rgb(34_139_84/0.12)] focus-visible:outline-none dark:bg-input/30 dark:border-muted-foreground/30"
                    aria-haspopup="dialog"
                    aria-label="States"
                    :aria-expanded="statePopoverOpen"
                  >
                    <span class="min-w-0 flex-1 truncate">{{ statesTriggerLabel }}</span>
                    <PhCaretDown class="size-4 shrink-0 text-muted-foreground" weight="bold" aria-hidden="true" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" class="w-[min(22rem,calc(100vw-2rem))] max-w-none p-0 sm:w-[var(--reka-popover-trigger-width)]">
                  <div class="border-b border-border p-2">
                    <Input
                      v-model="stateSearchQuery"
                      type="search"
                      autocomplete="off"
                      placeholder="Filter states…"
                      class="h-9 border-dotted bg-transparent"
                    />
                  </div>
                  <div class="max-h-64 overflow-y-auto overscroll-contain p-2">
                    <button
                      type="button"
                      class="mb-3 w-full rounded-md border border-dotted border-muted-foreground/40 bg-muted/5 px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:bg-muted/25 hover:text-foreground dark:bg-transparent dark:hover:bg-muted/20"
                      @click="clearStatesFilter"
                    >
                      No filters
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
                      class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-muted/80"
                    >
                      <Checkbox
                        :checked="selectedStateCodes.includes(s.code)"
                        @update:checked="(v: boolean | 'indeterminate') => toggleStateCode(s.code, v === true)"
                      />
                      <span class="min-w-0 leading-snug">{{ s.label }}</span>
                      <span class="ml-auto shrink-0 tabular-nums text-3 font-medium text-muted-foreground">{{ s.code }}</span>
                    </label>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div class="flex min-w-0 w-full basis-0 flex-col gap-1.5 md:min-w-[14rem] md:flex-[1.75]">
            <span class="ps-px font-semibold text-2.5 uppercase tracking-[0.14em] text-muted-foreground">
              Specializations
            </span>
            <div
              v-if="specsLoading"
              class="flex h-11 min-w-0 w-full items-center rounded-lg border border-dotted border-muted-foreground/35 bg-muted/25 px-3 text-sm text-muted-foreground"
              aria-busy="true"
            >
              Loading specializations…
            </div>
            <div v-else class="min-w-0 w-full">
              <Popover v-model:open="specPopoverOpen">
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="flex h-11 min-w-0 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-dotted border-muted-foreground/35 bg-background px-3 text-left text-[0.9375rem] text-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/40 focus-visible:border-brand focus-visible:border-solid focus-visible:shadow-[0_0_0_3px_rgb(34_139_84/0.12)] focus-visible:outline-none dark:bg-input/30 dark:border-muted-foreground/30"
                    aria-haspopup="dialog"
                    aria-label="Specializations"
                    :aria-expanded="specPopoverOpen"
                  >
                    <span class="min-w-0 flex-1 truncate">{{ specializationTriggerLabel }}</span>
                    <PhCaretDown class="size-4 shrink-0 text-muted-foreground" weight="bold" aria-hidden="true" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" class="w-[min(22rem,calc(100vw-2rem))] max-w-none p-0 sm:w-[var(--reka-popover-trigger-width)]">
                  <div class="border-b border-border p-2">
                    <Input
                      v-model="specSearchQuery"
                      type="search"
                      autocomplete="off"
                      placeholder="Filter specializations…"
                      class="h-9 border-dotted bg-transparent"
                    />
                  </div>
                  <div class="max-h-64 overflow-y-auto overscroll-contain p-2">
                    <button
                      type="button"
                      class="mb-3 w-full rounded-md border border-dotted border-muted-foreground/40 bg-muted/5 px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:bg-muted/25 hover:text-foreground dark:bg-transparent dark:hover:bg-muted/20"
                      @click="clearSpecializationsFilter"
                    >
                      No filters
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
                      class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-muted/80"
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
        </div>
      </div>
    </header>

    <div class="mx-auto box-border w-full max-w-7xl px-4 py-7 md:py-7 sm:px-6 lg:px-8">
      <main class="w-full min-w-0">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div class="flex flex-wrap items-center gap-2.5">
            <button
              v-if="activeFilterCount > 0"
              type="button"
              class="shrink-0 cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 font-semibold text-[0.8125rem] text-muted-foreground transition-colors hover:border-brand/35 hover:text-[#0f3d28] dark:bg-card dark:hover:text-brand"
              @click="clearAllFilters"
            >
              Clear all
            </button>

            <div v-if="pagination" class="font-semibold text-[0.8125rem] text-muted-foreground">
              Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} lawyers
            </div>

            <div v-if="filters.keywords" class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 font-medium text-sm text-foreground dark:bg-muted/80">
              Keyword Search: {{ filters.keywords }}
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-lg leading-none text-muted-foreground hover:text-foreground" @click="filters.keywords = ''">
                &times;
              </button>
            </div>

            <div
              v-for="code in selectedStateCodes"
              :key="code"
              class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 font-medium text-sm text-foreground dark:bg-muted/80"
            >
              <span class="truncate">{{ stateLabel(code) }}</span>
              <button
                type="button"
                class="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-lg leading-none text-muted-foreground hover:text-foreground"
                :aria-label="`Remove ${stateLabel(code)}`"
                @click="removeStateCode(code)"
              >
                &times;
              </button>
            </div>

            <div
              v-for="sid in filters.practiceAreas"
              :key="sid"
              class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 font-medium text-sm text-foreground dark:bg-muted/80"
            >
              <span class="truncate">{{ specializationNameById(sid) }}</span>
              <button
                type="button"
                class="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-lg leading-none text-muted-foreground hover:text-foreground"
                :aria-label="`Remove ${specializationNameById(sid)}`"
                @click="removeSpecialization(sid)"
              >
                &times;
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <div
              class="inline-flex items-center rounded-lg border border-border/80 bg-background p-0.5 shadow-xs dark:bg-card"
              role="toolbar"
              aria-label="Layout"
            >
              <button
                type="button"
                class="inline-flex size-9 items-center justify-center rounded-md transition-colors sm:size-10"
                :class="
                  resultsLayout === 'grid'
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                "
                :aria-pressed="resultsLayout === 'grid'"
                title="Grid"
                @click="resultsLayout = 'grid'"
              >
                <PhSquaresFour class="size-5" weight="regular" aria-hidden="true" />
                <span class="sr-only">Grid layout</span>
              </button>
              <button
                type="button"
                class="inline-flex size-9 items-center justify-center rounded-md transition-colors sm:size-10"
                :class="
                  resultsLayout === 'list'
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                "
                :aria-pressed="resultsLayout === 'list'"
                title="List"
                @click="resultsLayout = 'list'"
              >
                <PhRows class="size-5" weight="regular" aria-hidden="true" />
                <span class="sr-only">List layout</span>
              </button>
            </div>
            <span
              class="hidden text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground md:inline"
              aria-hidden="true"
            >{{
              searchParams.sortBy === 'relevance' ? 'Sorted by relevance' : 'Sorted by experience'
            }}</span>
          </div>
        </div>

        <div
          v-if="isLoading"
          aria-busy="true"
          aria-label="Loading lawyer results"
          :class="
            resultsLayout === 'grid'
              ? 'gap-[clamp(14px,2vw,20px)] grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]'
              : 'lawyers-catalog-list flex flex-col gap-4'
          "
        >
          <LawyerSearchCardSkeleton
            v-for="i in resultsLayout === 'grid' ? 8 : 6"
            :key="i"
            :layout="resultsLayout"
          />
        </div>

        <div v-else-if="error" class="bg-background dark:bg-card px-6 sm:px-8 py-12 border border-border rounded-xl text-center">
          <EmptyState
            title="Error loading lawyers"
            description="There was an error loading the lawyers list. Please try again."
            action-text="Retry"
            @action="() => {}"
          />
        </div>

        <div
          v-else-if="lawyers.length === 0"
          class="rounded-xl border border-dotted border-border bg-background px-4 py-10 dark:bg-card sm:px-8 sm:py-12"
        >
          <LawyerDirectoryEmpty
            :active-filter-count="activeFilterCount"
            :keyword="filters.keywords"
            @reset="clearAllFilters"
          />
        </div>

        <div
          v-else
          :class="
            resultsLayout === 'grid'
              ? 'gap-[clamp(14px,2vw,20px)] grid lawyers-catalog-grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]'
              : 'lawyers-catalog-list flex w-full flex-col gap-4'
          "
        >
          <LawyerSearchCard
            v-for="lawyer in lawyers"
            :key="lawyer.id"
            :density="resultsLayout === 'grid' ? 'grid' : 'row'"
            :lawyer="lawyer"
          />
        </div>

        <nav
          v-if="pagination && pagination.totalPages > 1"
          class="flex flex-wrap justify-center items-center gap-4 sm:gap-4 mt-8 pb-8"
          aria-label="Pagination"
        >
          <Button
            color="neutral"
            variant="outline"
            icon="i-heroicons-chevron-left"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </Button>

          <div class="flex max-sm:flex flex-wrap justify-center gap-2 order-3 sm:order-none w-full sm:w-auto basis-full sm:basis-auto">
            <button
              v-for="page in Math.min(pagination.totalPages, 5)"
              :key="page"
              type="button"
              class="bg-background aria-[current=page]:bg-brand hover:bg-muted/60 dark:bg-card border border-border aria-[current=page]:border-brand hover:border-brand rounded-lg min-w-10 h-10 font-sans font-semibold aria-[current=page]:text-white text-sm transition-colors cursor-pointer"
              :aria-current="page === currentPage ? 'page' : undefined"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <span v-if="pagination.totalPages > 5" class="px-2 font-semibold text-muted-foreground">…</span>
          </div>

          <Button
            color="neutral"
            variant="outline"
            trailing-icon="i-heroicons-chevron-right"
            :disabled="!pagination.hasMore"
            @click="currentPage++"
          >
            Next
          </Button>
        </nav>
      </main>
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
