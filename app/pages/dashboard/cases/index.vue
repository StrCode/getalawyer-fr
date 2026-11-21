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
const sectionTitle = 'font-display text-xl leading-none font-normal tracking-tight'
const panel = 'rounded-card border border-border bg-card'
const pill = 'rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'
</script>

<template>
  <!-- one column that may shrink, so nothing in it can widen the page on a phone -->
  <div class="grid grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <header>
      <p class="text-xs font-medium tracking-widest text-brand uppercase">{{ isLawyer ? 'Your clients\' work' : 'Work your lawyers are doing' }}</p>
      <h1 class="mt-2.5 text-2xl md:text-3xl leading-none font-normal tracking-tighter">Cases</h1>
      <p class="mt-2.5 max-w-160 text-base text-muted-foreground">{{ loading ? 'Loading your cases…' : isError ? 'The work that follows a consultation.' : summary }}</p>
    </header>

    <div class="flex min-w-0 flex-wrap items-center justify-between gap-2.5">
      <div role="group" aria-label="Show" class="-mx-1 flex max-w-[calc(100%+0.5rem)] min-w-0 gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
        <button
          v-for="item in tabs"
          :key="item.key"
          type="button"
          :aria-pressed="tab === item.key"
          class="inline-flex min-h-11 flex-none cursor-pointer items-center gap-1.75 rounded-full border px-4 font-medium whitespace-nowrap transition-colors duration-200 ease-canopy"
          :class="tab === item.key ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground'"
          @click="showTab(item.key)"
        >
          {{ item.label }}
          <span
            v-if="!loading && counts[item.key] > 0"
            class="rounded-full px-1.75 text-xs font-medium"
            :class="tab === item.key ? 'bg-white/20' : 'bg-muted text-foreground'"
          >{{ counts[item.key] }}</span>
        </button>
      </div>

      <label v-if="all.length > 0" class="relative block w-full min-w-0 sm:w-72">
        <span class="sr-only">Search cases</span>
        <CanopyGlyph name="search" :size="17" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="search"
          type="search"
          autocomplete="off"
          :placeholder="isLawyer ? 'Title, client or case number' : 'Title, lawyer or case number'"
          class="h-11 rounded-full border-border bg-card pr-4 pl-10.5"
        />
      </label>
    </div>

    <!-- ───────── loading / could not load ───────── -->
    <LoadingRegion v-if="loading && !isError" label="Loading your cases">
      <LoadingList heading lead="avatar" />
    </LoadingRegion>

    <section v-else-if="isError" :class="[panel, 'p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center']">
      <h2 :class="sectionTitle">We could not load your cases.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" :aria-busy="isFetching" @click="() => refetch()">{{ isFetching ? 'Trying…' : 'Try again' }}</Button>
    </section>

    <!-- ───────── no cases at all: say how one comes about ───────── -->
    <section v-else-if="all.length === 0" :class="[panel, 'px-5.25 py-7.25 md:py-7.75 lg:py-10.25 xl:py-12 text-center']">
      <h2 :class="sectionTitle">No cases yet.</h2>
      <p class="mx-auto mt-2 max-w-136 text-muted-foreground">
        <template v-if="isLawyer">After a consultation, mark it completed and record that the client hired you. That opens a case here, with its own messages, tasks and log.</template>
        <template v-else>When a lawyer you have consulted starts working for you, the case shows here, with its messages, the tasks each of you has and a log of what has happened.</template>
      </p>
      <Button as-child variant="line" size="pill-sm" class="mt-4">
        <NuxtLink :to="isLawyer ? '/dashboard/appointments?status=completed' : '/dashboard/bookings'">{{ isLawyer ? 'Completed appointments' : 'Your bookings' }}</NuxtLink>
      </Button>
    </section>

    <section v-else aria-labelledby="list-title">
      <h2 id="list-title" :class="sectionTitle">
        {{ activeLabel }}<span v-if="shown.length > 0" class="ml-2 text-muted-foreground">{{ shown.length }}</span>
      </h2>

      <div v-if="shown.length === 0" :class="[panel, 'mt-3.5 px-5.25 py-6.5 md:py-7.75 lg:py-10.25 xl:py-10.5 text-center']">
        <p class="text-muted-foreground">{{ search.trim() ? `No ${activeLabel.toLowerCase()} cases match "${search.trim()}".` : EMPTY[tab] }}</p>
        <Button v-if="search.trim()" variant="line" size="pill-sm" class="mt-3.5" @click="search = ''">Clear the search</Button>
      </div>

      <ul v-else :class="[panel, 'mt-3.5 divide-y divide-border overflow-hidden']">
        <li v-for="item in shown" :key="item.id">
          <NuxtLink
            :to="`/dashboard/cases/${item.id}`"
            class="group flex flex-wrap items-start gap-x-4 gap-y-2 px-4 md:px-4.25 lg:px-5.5 py-4 transition-colors duration-200 hover:bg-background/70"
          >
            <span aria-hidden="true" class="grid size-12 flex-none place-items-center overflow-hidden rounded-lg bg-mint font-display font-medium text-deep">
              <img v-if="otherParty(item, role)?.image" :src="otherParty(item, role)!.image!" alt="" class="size-full object-cover">
              <template v-else>{{ initials(otherParty(item, role)?.name) || '·' }}</template>
            </span>
            <span class="min-w-0 grow basis-56">
              <span class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <b class="font-display text-base font-normal tracking-tight">{{ item.caseTitle }}</b>
                <span :class="[pill, CASE_PILL[item.status].class]">{{ CASE_PILL[item.status].label }}</span>
                <span v-if="priorityPill(item.priority)" :class="[pill, 'bg-warning/15 text-warning-subtle-foreground']">{{ priorityPill(item.priority) }}</span>
              </span>
              <span class="mt-0.75 flex flex-wrap items-center gap-x-1.75 text-sm text-muted-foreground">
                <span>{{ isLawyer ? 'For' : 'With' }} {{ otherParty(item, role)?.name ?? (isLawyer ? 'a client' : 'your lawyer') }}</span>
                <span aria-hidden="true">·</span><span>{{ item.caseNumber }}</span>
                <template v-if="now && agoLabel(item.lastActivityAt ?? item.updatedAt, now)">
                  <span aria-hidden="true">·</span><span>Last activity {{ agoLabel(item.lastActivityAt ?? item.updatedAt, now) }}</span>
                </template>
                <template v-if="now && dueLine(item.dueDate, now, caseTabOf(item.status) !== 'open')">
                  <span aria-hidden="true">·</span>
                  <span :class="dueLine(item.dueDate, now, false)?.overdue ? 'font-medium text-destructive' : ''">{{ dueLine(item.dueDate, now, false)?.text }}</span>
                </template>
              </span>
            </span>
            <CanopyGlyph name="arrow" :size="16" class="mt-3.5 flex-none text-muted-foreground transition-transform duration-200 ease-canopy group-hover:translate-x-0.75 group-hover:text-brand max-sm:hidden" />
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
