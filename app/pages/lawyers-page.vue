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
import Select from '~/components/ui/select/Select.vue'
import { PhCaretDown } from '@phosphor-icons/vue'
import SelectContent from '~/components/ui/select/SelectContent.vue'
import SelectItem from '~/components/ui/select/SelectItem.vue'
import SelectTrigger from '~/components/ui/select/SelectTrigger.vue'
import SelectValue from '~/components/ui/select/SelectValue.vue'

/** `/lawyers-page` — directory listing with home layout (same shell as marketing pages). */

const STATE_DIRECTORY_OPTIONS = [...NIGERIA_STATES]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(s => ({ code: s.code, label: s.name }))

const ANY_STATE_VALUE = '__any__' as const

function normalizeLocationToStateCode(raw: string): string {
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

/** Same shell as homepage: `AppHeader` + wordmark + marketing nav + `AuthModal`. */
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

const { filters, resetFilters, filtersFromQuery, filtersToQuery } = useLawyerFilters()

filters.value = {
  ...filters.value,
  location: normalizeLocationToStateCode(filters.value.location),
}

watchPersistRecentLawyerDirectorySearch(filters)
const route = useRoute()
const router = useRouter()
const { useLawyersList } = useLawyers()

const totalItems = ref(0)

const { currentPage, itemsPerPage } = usePagination({
  itemsPerPage: 12,
  totalItems
})

function onDirectoryStateChange(value: unknown) {
  const next
    = value == null || value === '' || value === ANY_STATE_VALUE ? '' : String(value)
  filters.value = { ...filters.value, location: next }
}

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

onMounted(() => {
  const fromRoute = filtersFromQuery(route.query)
  filters.value = {
    ...fromRoute,
    location: normalizeLocationToStateCode(fromRoute.location),
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

watch([filters, currentPage], () => {
  const query = filtersToQuery(filters.value)
  router.push({ query })
}, { deep: true })

const activeFilterCount = computed(() => {
  const f = filters.value
  let count = 0
  if (f.keywords) count++
  if (f.lawyerName) count++
  if (f.practiceAreas.length > 0) count++
  if (f.location) count++
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
  <div class="min-h-screen bg-neutral-100 font-sans text-foreground dark:bg-background">
    <header
      class="border-b border-border/80 bg-muted/35 bg-[radial-gradient(ellipse_120%_80%_at_0%_0%,oklch(0.7_0.12_152/0.15),transparent_55%)] pt-26 sm:pt-28 dark:bg-muted/20"
    >
      <div
        class="box-border mx-auto w-full max-w-7xl px-4 pb-8 pt-11 shadow-[inset_3px_0_0_rgb(34_139_84/0.2)] sm:px-6 sm:pb-10 sm:pt-14 lg:px-8"
      >
        <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Directory
        </p>
        <h1 class="mb-3 text-[clamp(2rem,5vw,3rem)] font-bold leading-tight tracking-tight text-foreground">
          Find a lawyer
        </h1>
        <p class="mb-7 max-w-[38rem] text-[1.0625rem] leading-[1.55] text-muted-foreground">
          Search by topic, Nigerian state, and one or more specializations from our directory.
        </p>

        <div
          role="search"
          aria-label="Search lawyers"
          class="flex w-full flex-col gap-4 md:flex-row md:items-end md:gap-x-5 md:gap-y-4"
        >
          <label class="flex min-w-0 w-full flex-1 basis-0 flex-col gap-1.5 md:min-w-[12rem]">
            <span class="ps-px text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Topic or keywords
            </span>
            <span
              class="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 py-2 transition-colors focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgb(34_139_84/0.12)] dark:bg-card"
            >
              <PhIcon name="i-heroicons-magnifying-glass" class="size-[1.125rem] shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                v-model="filters.keywords"
                type="search"
                enterkeyhint="search"
                autocomplete="off"
                class="min-w-0 flex-1 border-0 bg-transparent text-[0.9375rem] text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Search by topic or keyword"
              >
            </span>
          </label>

          <div class="flex w-full shrink-0 flex-col gap-1.5 md:w-[14rem]">
            <span class="ps-px text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              State / region
            </span>
            <Select
              :model-value="filters.location ? filters.location : ANY_STATE_VALUE"
              @update:model-value="onDirectoryStateChange"
            >
              <SelectTrigger
                class="h-11 w-full rounded-lg border-input bg-background text-[0.9375rem] dark:bg-input/30"
                aria-label="State or region"
              >
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="ANY_STATE_VALUE">
                  All states
                </SelectItem>
                <SelectItem
                  v-for="s in STATE_DIRECTORY_OPTIONS"
                  :key="s.code"
                  :value="s.code"
                >
                  {{ s.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex min-w-0 w-full flex-[1.75] basis-0 flex-col gap-1.5 md:min-w-[14rem]">
            <span class="ps-px text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Specializations
            </span>
            <div
              v-if="specsLoading"
              class="flex h-11 w-full min-w-0 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm text-muted-foreground"
              aria-busy="true"
            >
              Loading specializations…
            </div>
            <div v-else class="w-full min-w-0">
              <Popover v-model:open="specPopoverOpen">
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-[0.9375rem] text-foreground transition-colors hover:bg-muted/50 focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_rgb(34_139_84/0.12)] focus-visible:outline-none dark:bg-input/30"
                    aria-haspopup="dialog"
                    :aria-expanded="specPopoverOpen"
                  >
                    <span class="flex min-w-0 flex-1 items-center gap-2">
                      <PhIcon name="i-heroicons-briefcase" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span class="truncate">{{ specializationTriggerLabel }}</span>
                    </span>
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
                    class="h-9"
                  />
                </div>
                <div class="max-h-64 overflow-y-auto overscroll-contain p-2">
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

    <div class="box-border mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 md:py-7 lg:px-8">
      <main class="w-full min-w-0">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div class="flex flex-wrap items-center gap-2.5">
            <button
              v-if="activeFilterCount > 0"
              type="button"
              class="shrink-0 cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 text-[0.8125rem] font-semibold text-muted-foreground transition-colors hover:border-brand/35 hover:text-[#0f3d28] dark:bg-card dark:hover:text-brand"
              @click="clearAllFilters"
            >
              Clear all
            </button>

            <div v-if="pagination" class="text-[0.8125rem] font-semibold text-muted-foreground">
              Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} lawyers
            </div>

            <div v-if="filters.keywords" class="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-[13px] font-medium text-foreground dark:bg-muted/80">
              Keyword Search: {{ filters.keywords }}
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-lg leading-none text-muted-foreground hover:text-foreground" @click="filters.keywords = ''">
                &times;
              </button>
            </div>

            <div
              v-for="sid in filters.practiceAreas"
              :key="sid"
              class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-[13px] font-medium text-foreground dark:bg-muted/80"
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

          <span class="hidden text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:inline md:block" aria-hidden="true">{{
            searchParams.sortBy === 'relevance' ? 'Sorted by relevance' : 'Sorted by experience'
          }}</span>
        </div>

        <div
          v-if="isLoading"
          class="grid gap-[clamp(14px,2vw,20px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]"
        >
          <div v-for="i in 6" :key="i" class="min-h-[220px] rounded-xl border border-border bg-muted animate-pulse dark:bg-muted/80" />
        </div>

        <div v-else-if="error" class="rounded-xl border border-border bg-background px-6 py-12 text-center sm:px-8 dark:bg-card">
          <EmptyState
            title="Error loading lawyers"
            description="There was an error loading the lawyers list. Please try again."
            action-text="Retry"
            @action="() => {}"
          />
        </div>

        <div v-else-if="lawyers.length === 0" class="rounded-xl border border-border bg-background px-6 py-12 text-center sm:px-8 dark:bg-card">
          <EmptyState
            title="No lawyers found"
            description="Try adjusting your filters to find more results."
            action-text="Reset Filters"
            @action="clearAllFilters"
          />
        </div>

        <div
          v-else
          class="lawyers-catalog-grid grid gap-[clamp(14px,2vw,20px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]"
        >
          <LawyerSearchCard
            v-for="lawyer in lawyers"
            :key="lawyer.id"
            :lawyer="lawyer"
          />
        </div>

        <nav
          v-if="pagination && pagination.totalPages > 1"
          class="mt-8 flex flex-wrap items-center justify-center gap-4 pb-8 sm:gap-4"
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

          <div class="order-3 flex w-full basis-full flex-wrap justify-center gap-2 max-sm:flex sm:order-none sm:w-auto sm:basis-auto">
            <button
              v-for="page in Math.min(pagination.totalPages, 5)"
              :key="page"
              type="button"
              class="h-10 min-w-10 cursor-pointer rounded-lg border border-border bg-background font-sans text-sm font-semibold transition-colors hover:border-brand hover:bg-muted/60 dark:bg-card aria-[current=page]:border-brand aria-[current=page]:bg-brand aria-[current=page]:text-white"
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
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 0.75rem;
  border-color: rgb(23 23 23 / 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.dark .lawyers-catalog-grid :deep(.lawyer-search-card) {
  border-color: rgb(255 255 255 / 0.08);
}

.lawyers-catalog-grid :deep(.lawyer-search-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.06);
}

.dark .lawyers-catalog-grid :deep(.lawyer-search-card:hover) {
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.25);
}

.lawyers-catalog-grid :deep(.card-header) {
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.lawyers-catalog-grid :deep(.bar-badge) {
  flex-direction: row;
  gap: 0.35rem;
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgb(255 255 255 / 0.92);
  padding: 0.25rem 0.45rem;
  border-radius: 9999px;
  border: 1px solid rgb(23 23 23 / 0.06);
}

.dark .lawyers-catalog-grid :deep(.bar-badge) {
  background: rgb(23 23 23 / 0.92);
  border-color: rgb(255 255 255 / 0.12);
}

.lawyers-catalog-grid :deep(.badge-text) {
  font-size: 10px;
}

.lawyers-catalog-grid :deep(.lawyer-name) {
  font-size: 1.0625rem;
}

.lawyers-catalog-grid :deep(.experience-desc) {
  display: -webkit-box;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
  font-size: 0.8125rem;
}

.lawyers-catalog-grid :deep(.specializations) {
  justify-content: center;
}

.lawyers-catalog-grid :deep(.card-footer) {
  margin-top: auto;
  flex-direction: column;
  gap: 0.75rem;
}

.lawyers-catalog-grid :deep(.bar-info) {
  justify-content: center;
  text-align: center;
}

.lawyers-catalog-grid :deep(.bar-info span) {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
