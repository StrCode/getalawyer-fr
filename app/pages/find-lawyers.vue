<script setup lang="ts">
import type { LocationQuery } from 'vue-router'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { useLawyerFilters } from '~/composables/useLawyerFilters'
import { watchPersistRecentLawyerDirectorySearch } from '~/composables/useRecentLawyerDirectorySearches'
import { NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'
import type { Specialization } from '~/lib/api'

/**
 * `/find-lawyers` — the directory.
 *
 * Search by need and state, narrow by practice area and experience, sort, then
 * load more. Every control maps to a parameter the search endpoint supports
 * (q, state, specializations, minExperience, sortBy); the URL carries the same
 * state (`keywords`, `location`, `areas`, `experience`, `sort`) so a search can
 * be shared or reopened.
 */
definePageMeta({
  layout: 'site',
  middleware: ['client-directory'],
})

useHead({
  title: 'Find a lawyer',
  meta: [
    { name: 'description', content: 'Search verified Nigerian lawyers by practice area and state, and message one free.' },
    { name: 'robots', content: 'noindex' },
  ],
})

type Sort = 'relevance' | 'experience' | 'recent'
const SORTS: Array<{ value: Sort, label: string }> = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'recent', label: 'Recently joined' },
]
const EXPERIENCE = [
  { value: '', label: 'Any' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
]
const PAGE_SIZE = 12

const route = useRoute()

function parseSort(value: unknown): Sort | null {
  const s = Array.isArray(value) ? value[0] : value
  return s === 'relevance' || s === 'experience' || s === 'recent' ? s : null
}

/** A sort the visitor picked; `null` follows the search (relevance with a keyword, else experience). */
const chosenSort = ref<Sort | null>(parseSort(route.query.sort))

const { filters, resetFilters } = useLawyerFilters({
  mergeQuery(query: LocationQuery) {
    const next = { ...query }
    if (chosenSort.value) next.sort = chosenSort.value
    else delete next.sort
    return next
  },
})
watchPersistRecentLawyerDirectorySearch(filters)

/** The directory filters by one state; older links may carry a comma-separated list. */
function singleState(location: string): string {
  const first = location.split(',').map(s => s.trim()).find(Boolean) ?? ''
  return NIGERIA_STATE_NAMES.find(name => name.toLowerCase() === first.toLowerCase()) ?? ''
}

// ---- practice areas ----
const { data: specializations, suspense: specializationsReady } = useSpecializations()
const areas = computed<Specialization[]>(() => specializations.value ?? [])

function slug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
/** `areas` in a link may be ids or name slugs ("family-law"); resolve both to ids. */
const chosenAreas = computed(() =>
  filters.value.practiceAreas
    .map(token => areas.value.find(a => a.id === token || slug(a.name) === token.toLowerCase())?.id)
    .filter((id): id is string => Boolean(id)),
)
function toggleArea(id: string | null) {
  if (id === null) {
    filters.value = { ...filters.value, practiceAreas: [] }
    return
  }
  const next = new Set(chosenAreas.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  filters.value = { ...filters.value, practiceAreas: [...next] }
}

// ---- search rail (applied on submit, not per keystroke) ----
const need = ref(filters.value.keywords)
const where = ref(singleState(filters.value.location))
watch(() => filters.value.keywords, (value) => { need.value = value })
watch(() => filters.value.location, (value) => { where.value = singleState(value) })
watch(where, (value) => {
  if (value !== singleState(filters.value.location)) filters.value = { ...filters.value, location: value }
})

function submitSearch() {
  const text = need.value.trim()
  // If the text is exactly a practice area ("Family law"), select that area's
  // chip. Anything else goes to keyword search, which matches names, firms,
  // practice areas and their everyday keywords ("tenancy dispute").
  const area = text ? areas.value.find(a => a.name.toLowerCase() === text.toLowerCase() || slug(a.name) === slug(text)) : undefined
  if (area) {
    need.value = ''
    filters.value = { ...filters.value, keywords: '', practiceAreas: [...new Set([...chosenAreas.value, area.id])], location: where.value }
    return
  }
  filters.value = { ...filters.value, keywords: text, location: where.value }
}

// ---- experience and sort ----
const experience = computed({
  get: () => (filters.value.minExperience ? String(filters.value.minExperience) : ''),
  set: (value: string) => { filters.value = { ...filters.value, minExperience: value ? Number(value) : null } },
})
const sort = computed<Sort>({
  get: () => chosenSort.value ?? (filters.value.keywords ? 'relevance' : 'experience'),
  set: (value) => {
    chosenSort.value = value
    filters.value = { ...filters.value }
  },
})

// ---- results ----
const searchParams = computed(() => ({
  ...(filters.value.keywords ? { q: filters.value.keywords } : {}),
  ...(singleState(filters.value.location) ? { state: singleState(filters.value.location) } : {}),
  ...(chosenAreas.value.length ? { specializations: chosenAreas.value } : {}),
  ...(filters.value.minExperience ? { minExperience: filters.value.minExperience } : {}),
  limit: PAGE_SIZE,
  sortBy: sort.value,
}))

const { useLawyersInfiniteList } = useLawyers()
const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error, refetch, suspense } = useLawyersInfiniteList(searchParams)
// Fetch during server render too, so the first results are in the HTML.
onServerPrefetch(async () => {
  await Promise.all([specializationsReady().catch(() => {}), suspense().catch(() => {})])
})

const lawyers = computed(() => data.value?.pages.flatMap(page => page.results) ?? [])

const isFiltered = computed(() =>
  Boolean(filters.value.keywords || singleState(filters.value.location) || chosenAreas.value.length || filters.value.minExperience),
)
/** "in Family Law, Tax Law · Lagos · 10+ years · “okafor”", or "in all practice areas · all states" */
const context = computed(() => {
  const names = chosenAreas.value.map(id => areas.value.find(a => a.id === id)?.name).filter(Boolean)
  const state = singleState(filters.value.location)
  const parts = [`in ${names.length ? names.join(', ') : 'all practice areas'}`, state || 'all states']
  if (filters.value.minExperience) parts.push(`${filters.value.minExperience}+ years`)
  if (filters.value.keywords) parts.push(`“${filters.value.keywords}”`)
  return parts.join(' · ')
})
/** "38 lawyers". Backends that do not report a total yet get "12+" until the last page. */
const countLabel = computed(() => {
  const total = data.value?.pages[0]?.pagination.total
  if (typeof total === 'number') return `${total.toLocaleString('en-NG')} ${total === 1 ? 'lawyer' : 'lawyers'}`
  const n = lawyers.value.length
  return `${n}${hasNextPage.value ? '+' : ''} ${n === 1 && !hasNextPage.value ? 'lawyer' : 'lawyers'}`
})

function clearFilters() {
  chosenSort.value = null
  need.value = ''
  where.value = ''
  resetFilters()
}

const chip = 'min-h-11 cursor-pointer rounded-full border px-4.5 text-base font-medium whitespace-nowrap transition-colors duration-200'
const chipOff = 'border-border bg-card text-foreground hover:border-brand'
const chipOn = 'border-foreground bg-foreground text-card'
const control = 'h-11 rounded-full border-border bg-card pr-9 pl-4 text-base font-medium text-foreground shadow-none'
</script>

<template>
  <div>
    <section data-surface="forest" class="rounded-panel bg-forest px-5 md:px-8.75 lg:px-11.5 xl:px-14.5 py-6 md:py-6.25 lg:py-8.25 xl:py-10.25 text-white max-sm:rounded-2xl">
      <nav aria-label="Breadcrumb" class="flex gap-2 text-sm font-medium text-on-forest">
        <NuxtLink to="/" class="underline underline-offset-3">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Find a lawyer</span>
      </nav>
      <h1 class="mt-3.5 text-4xl md:text-5xl leading-none font-normal tracking-tighter">Find a lawyer</h1>
      <p class="mt-3.25 max-w-136 text-lg text-on-forest">Every lawyer listed has passed identity and enrolment checks. Message any of them free.</p>
      <CanopySearchRail
        v-model:need="need"
        v-model:where="where"
        id-prefix="directory"
        placeholder="Tenancy dispute, divorce, unpaid salary, or a name…"
        action="Search"
        class="mt-6.5"
        @submit="submitSearch"
      />
    </section>

    <div
      v-if="areas.length"
      role="group"
      aria-label="Practice area"
      class="mt-5.5 flex flex-wrap gap-2 [scrollbar-width:thin] max-sm:-mx-4 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-4 max-sm:pb-1.5"
    >
      <button type="button" :class="[chip, chosenAreas.length ? chipOff : chipOn]" :aria-pressed="chosenAreas.length === 0" @click="toggleArea(null)">All areas</button>
      <button
        v-for="area in areas"
        :key="area.id"
        type="button"
        :class="[chip, chosenAreas.includes(area.id) ? chipOn : chipOff]"
        :aria-pressed="chosenAreas.includes(area.id)"
        @click="toggleArea(area.id)"
      >
        {{ area.name }}
      </button>
    </div>

    <div class="mt-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3.5 border-b border-border pb-4">
      <p aria-live="polite" class="flex flex-wrap items-baseline gap-x-2.75 gap-y-0.75 text-muted-foreground">
        <b class="font-display text-2xl font-normal tracking-tight text-foreground">{{ isLoading ? 'Searching…' : countLabel }}</b>
        <span>{{ context }}</span>
      </p>
      <div class="flex flex-wrap items-center gap-x-4.5 gap-y-2.5">
        <label for="directory-experience" class="inline-flex items-center gap-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground">
          Experience
          <NativeSelect id="directory-experience" v-model="experience" :class="control">
            <NativeSelectOption v-for="option in EXPERIENCE" :key="option.value" :value="option.value">{{ option.label }}</NativeSelectOption>
          </NativeSelect>
        </label>
        <label for="directory-sort" class="inline-flex items-center gap-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground">
          Sort by
          <NativeSelect id="directory-sort" v-model="sort" :class="control">
            <NativeSelectOption v-for="option in SORTS" :key="option.value" :value="option.value">{{ option.label }}</NativeSelectOption>
          </NativeSelect>
        </label>
        <button
          v-if="isFiltered"
          type="button"
          class="min-h-11 cursor-pointer px-1.5 text-base font-medium text-brand underline underline-offset-3"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
    </div>

    <!-- loading -->
    <div v-if="isLoading" class="mt-5.5 grid grid-cols-2 gap-4.5 max-tab:grid-cols-1" aria-busy="true" aria-label="Loading lawyers">
      <div v-for="n in 6" :key="n" class="flex gap-4.5 rounded-card border border-border bg-card p-4.5">
        <Skeleton class="size-26 flex-none rounded-card max-sm:size-18" />
        <div class="flex-1 space-y-3 py-1">
          <Skeleton class="h-3 w-24 rounded-full" />
          <Skeleton class="h-6 w-2/3 rounded-full" />
          <Skeleton class="h-4 w-1/2 rounded-full" />
          <Skeleton class="h-9 w-full rounded-full" />
        </div>
      </div>
    </div>

    <!-- could not load -->
    <div v-else-if="error" role="alert" class="mt-5.5 grid justify-items-center gap-3.25 rounded-card border border-dashed border-border px-6 py-8 md:py-9.5 lg:py-12.75 xl:py-14 text-center">
      <h2 class="text-xl md:text-2xl lg:text-3xl leading-none font-normal tracking-tight">We could not load the directory.</h2>
      <p class="max-w-120 text-muted-foreground">Check your connection and try again.</p>
      <Button variant="line" size="pill" @click="refetch()">Try again</Button>
    </div>

    <!-- nothing matches -->
    <div v-else-if="lawyers.length === 0" aria-live="polite" class="mt-5.5 grid justify-items-center gap-3.25 rounded-card border border-dashed border-border px-6 py-8 md:py-9.5 lg:py-12.75 xl:py-14 text-center">
      <h2 class="text-xl md:text-2xl lg:text-3xl leading-none font-normal tracking-tight">
        {{ isFiltered ? 'No lawyers match that search yet.' : 'No lawyers are listed yet.' }}
      </h2>
      <p class="max-w-120 text-muted-foreground">
        {{ isFiltered ? 'Try a different practice area or state, or clear the filters to see everyone.' : 'Lawyers appear here once their verification is complete. Check back soon.' }}
      </p>
      <Button v-if="isFiltered" variant="line" size="pill" @click="clearFilters">Clear filters</Button>
    </div>

    <template v-else>
      <div class="mt-5.5 grid grid-cols-2 gap-4.5 max-tab:grid-cols-1">
        <CanopyDirectoryCard v-for="lawyer in lawyers" :key="lawyer.id" :lawyer="lawyer" />
      </div>
      <div v-if="hasNextPage" class="mt-6.5 grid justify-items-center">
        <ButtonBusy variant="line" size="pill" :loading="isFetchingNextPage" @click="fetchNextPage()">Load more lawyers</ButtonBusy>
      </div>
    </template>
  </div>
</template>
