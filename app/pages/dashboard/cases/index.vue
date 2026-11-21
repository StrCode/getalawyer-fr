<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  agoLabel,
  CASE_PILL,
  CASE_TABS,
  caseTabOf,
  dueLine,
  filterCases,
  isCaseTab,
  otherParty,
  priorityPill,
  type CaseTab,
} from '~/lib/case-view'
import { initials } from '~/lib/client-overview'
import { getSessionUserType } from '~/lib/session-user'

/**
 * Cases: the work a lawyer is doing for a client. A case is opened when a
 * lawyer records, after a consultation, that the client hired them; nobody
 * creates one by hand. Open, closed and archived cases are separate lists,
 * narrowed by a search over the title, the case number and the other person.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

useHead({ title: 'Cases' })
useSeoMeta({ description: 'Your cases.', robots: 'noindex, nofollow' })

const route = useRoute()
const router = useRouter()
const { session } = useAuth()
const role = computed(() => getSessionUserType(session.value?.user))
const isLawyer = computed(() => role.value === 'lawyer')

const { data: cases, isPending, isError, isFetching, refetch } = useCaseList()
const all = computed(() => cases.value ?? [])

// The time is read in the browser only, so "2 days ago" is the reader's own day.
const now = ref<Date | null>(null)
onMounted(() => { now.value = new Date() })
const loading = computed(() => !now.value || isPending.value)

// ───────── which list, and the search ─────────
const DEFAULT_TAB: CaseTab = 'open'
const tab = computed<CaseTab>(() => {
  const value = Array.isArray(route.query.show) ? route.query.show[0] : route.query.show
  return isCaseTab(value) ? value : DEFAULT_TAB
})
function showTab(key: CaseTab) {
  const query = { ...route.query }
  if (key === DEFAULT_TAB) delete query.show
  else query.show = key
  void router.replace({ query })
}

const counts = computed(() => {
  const tally: Record<CaseTab, number> = { open: 0, closed: 0, archived: 0 }
  for (const item of all.value) tally[caseTabOf(item.status)] += 1
  return tally
})
/** Archived is only offered once something has been archived (or while it is the list on screen). */
const tabs = computed(() => CASE_TABS.filter(item => item.key !== 'archived' || counts.value.archived > 0 || tab.value === 'archived'))

const search = ref('')
const shown = computed(() => filterCases(all.value, tab.value, search.value, role.value))
const activeLabel = computed(() => CASE_TABS.find(item => item.key === tab.value)?.label ?? '')

const summary = computed(() => {
  if (all.value.length === 0) {
    return isLawyer.value
      ? 'A case opens when you record that a client hired you after a consultation.'
      : 'A case opens when a lawyer you consulted starts working for you.'
  }
  const parts = [`${counts.value.open} open`]
  if (counts.value.closed > 0) parts.push(`${counts.value.closed} closed`)
  return `${parts.join(' · ')}.`
})

const EMPTY: Record<CaseTab, string> = {
  open: 'No open cases.',
  closed: 'No closed cases.',
  archived: 'Nothing archived.',
}

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-[1.3rem] leading-[1.1] font-[650] tracking-[-0.03em]'
const panel = 'rounded-card border border-border bg-card'
const pill = 'rounded-full px-[0.65rem] py-[0.12rem] text-[0.78rem] font-bold whitespace-nowrap'
</script>

<template>
  <!-- one column that may shrink, so nothing in it can widen the page on a phone -->
  <div class="grid grid-cols-[minmax(0,1fr)] gap-[clamp(1.25rem,2.4vw,2rem)]">
    <header>
      <p class="text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">{{ isLawyer ? 'Your clients\' work' : 'Work your lawyers are doing' }}</p>
      <h1 class="mt-[0.6rem] text-[clamp(1.6rem,2.6vw,2rem)] leading-[1.03] font-[620] tracking-[-0.04em]">Cases</h1>
      <p class="mt-[0.6rem] max-w-[40rem] text-[1.05rem] text-muted-foreground">{{ loading ? 'Loading your cases…' : isError ? 'The work that follows a consultation.' : summary }}</p>
    </header>

    <div class="flex min-w-0 flex-wrap items-center justify-between gap-[0.6rem]">
      <div role="group" aria-label="Show" class="-mx-1 flex max-w-[calc(100%+0.5rem)] min-w-0 gap-[0.35rem] overflow-x-auto px-1 py-1 [scrollbar-width:none]">
        <button
          v-for="item in tabs"
          :key="item.key"
          type="button"
          :aria-pressed="tab === item.key"
          class="inline-flex min-h-[2.75rem] flex-none cursor-pointer items-center gap-[0.45rem] rounded-full border px-[1rem] font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-200 ease-canopy"
          :class="tab === item.key ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground'"
          @click="showTab(item.key)"
        >
          {{ item.label }}
          <span
            v-if="!loading && counts[item.key] > 0"
            class="rounded-full px-[0.45rem] text-[0.78rem] font-bold"
            :class="tab === item.key ? 'bg-white/20' : 'bg-muted text-foreground'"
          >{{ counts[item.key] }}</span>
        </button>
      </div>

      <label v-if="all.length > 0" class="relative block w-full min-w-0 sm:w-[18rem]">
        <span class="sr-only">Search cases</span>
        <CanopyGlyph name="search" :size="17" class="pointer-events-none absolute top-1/2 left-[1rem] -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="search"
          type="search"
          autocomplete="off"
          :placeholder="isLawyer ? 'Title, client or case number' : 'Title, lawyer or case number'"
          class="h-[2.75rem] rounded-full border-border bg-card pr-[1rem] pl-[2.6rem]"
        />
      </label>
    </div>

    <!-- ───────── loading / could not load ───────── -->
    <div v-if="loading && !isError" role="status" aria-label="Loading your cases" class="grid gap-2">
      <div v-for="n in 3" :key="n" class="h-[5.4rem] animate-pulse rounded-[1.25rem] bg-muted" />
    </div>

    <section v-else-if="isError" :class="[panel, 'p-[clamp(1.5rem,4vw,3rem)] text-center']">
      <h2 :class="sectionTitle">We could not load your cases.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" :aria-busy="isFetching" @click="() => refetch()">{{ isFetching ? 'Trying…' : 'Try again' }}</Button>
    </section>

    <!-- ───────── no cases at all: say how one comes about ───────── -->
    <section v-else-if="all.length === 0" :class="[panel, 'px-[1.3rem] py-[clamp(1.8rem,4vw,3rem)] text-center']">
      <h2 :class="sectionTitle">No cases yet.</h2>
      <p class="mx-auto mt-2 max-w-[34rem] text-muted-foreground">
        <template v-if="isLawyer">After a consultation, mark it completed and record that the client hired you. That opens a case here, with its own messages, tasks and log.</template>
        <template v-else>When a lawyer you have consulted starts working for you, the case shows here, with its messages, the tasks each of you has and a log of what has happened.</template>
      </p>
      <Button as-child variant="line" size="pill-sm" class="mt-[1rem]">
        <NuxtLink :to="isLawyer ? '/dashboard/appointments?status=completed' : '/dashboard/bookings'">{{ isLawyer ? 'Completed appointments' : 'Your bookings' }}</NuxtLink>
      </Button>
    </section>

    <section v-else aria-labelledby="list-title">
      <h2 id="list-title" :class="sectionTitle">
        {{ activeLabel }}<span v-if="shown.length > 0" class="ml-[0.5rem] text-muted-foreground">{{ shown.length }}</span>
      </h2>

      <div v-if="shown.length === 0" :class="[panel, 'mt-[0.9rem] px-[1.3rem] py-[clamp(1.6rem,4vw,2.6rem)] text-center']">
        <p class="text-muted-foreground">{{ search.trim() ? `No ${activeLabel.toLowerCase()} cases match "${search.trim()}".` : EMPTY[tab] }}</p>
        <Button v-if="search.trim()" variant="line" size="pill-sm" class="mt-[0.9rem]" @click="search = ''">Clear the search</Button>
      </div>

      <ul v-else :class="[panel, 'mt-[0.9rem] divide-y divide-border overflow-hidden']">
        <li v-for="item in shown" :key="item.id">
          <NuxtLink
            :to="`/dashboard/cases/${item.id}`"
            class="group flex flex-wrap items-start gap-x-[1rem] gap-y-[0.5rem] px-[clamp(1rem,2.2vw,1.4rem)] py-[1rem] transition-colors duration-200 hover:bg-background/70"
          >
            <span aria-hidden="true" class="grid size-[3rem] flex-none place-items-center overflow-hidden rounded-[1rem] bg-mint font-display font-bold text-deep">
              <img v-if="otherParty(item, role)?.image" :src="otherParty(item, role)!.image!" alt="" class="size-full object-cover">
              <template v-else>{{ initials(otherParty(item, role)?.name) || '·' }}</template>
            </span>
            <span class="min-w-0 flex-[1_1_14rem]">
              <span class="flex flex-wrap items-center gap-x-[0.6rem] gap-y-1">
                <b class="font-display text-[1.12rem] font-[650] tracking-[-0.02em]">{{ item.caseTitle }}</b>
                <span :class="[pill, CASE_PILL[item.status].class]">{{ CASE_PILL[item.status].label }}</span>
                <span v-if="priorityPill(item.priority)" :class="[pill, 'bg-warning/15 text-warning-subtle-foreground']">{{ priorityPill(item.priority) }}</span>
              </span>
              <span class="mt-[0.2rem] flex flex-wrap items-center gap-x-[0.45rem] text-[0.92rem] text-muted-foreground">
                <span>{{ isLawyer ? 'For' : 'With' }} {{ otherParty(item, role)?.name ?? (isLawyer ? 'a client' : 'your lawyer') }}</span>
                <span aria-hidden="true">·</span><span>{{ item.caseNumber }}</span>
                <template v-if="now && agoLabel(item.lastActivityAt ?? item.updatedAt, now)">
                  <span aria-hidden="true">·</span><span>Last activity {{ agoLabel(item.lastActivityAt ?? item.updatedAt, now) }}</span>
                </template>
                <template v-if="now && dueLine(item.dueDate, now, caseTabOf(item.status) !== 'open')">
                  <span aria-hidden="true">·</span>
                  <span :class="dueLine(item.dueDate, now, false)?.overdue ? 'font-semibold text-destructive' : ''">{{ dueLine(item.dueDate, now, false)?.text }}</span>
                </template>
              </span>
            </span>
            <CanopyGlyph name="arrow" :size="16" class="mt-[0.9rem] flex-none text-muted-foreground transition-[translate] duration-200 ease-canopy group-hover:translate-x-[3px] group-hover:text-brand max-sm:hidden" />
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
