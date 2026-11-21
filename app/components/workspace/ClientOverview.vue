<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  bookingsGlance,
  clientHeadline,
  clientTodos,
  initials,
  sortClientDiary,
  todoSummary,
  type ClientTodo,
} from '~/lib/client-overview'
import { deriveClientLawyers } from '~/lib/client-derived-lawyers'

/**
 * A client's overview: the one thing worth knowing now, their bookings at a
 * glance, what they can do and what is with a lawyer, and the lawyers they
 * already have. What it says in each state is decided in `lib/client-overview`;
 * this component loads the data and lays it out.
 */
const { session } = useAuth()
const userId = computed(() => session.value?.user.id ?? null)
const firstName = computed(() => session.value?.user.name?.trim().split(/\s+/)[0] ?? '')

// ───────── data (the same queries the top bar's counts use) ─────────
const { useClientBookings } = useBookings()
const { data: bookings, isPending: bookingsPending, isError: bookingsFailed, refetch: refetchBookings } = useClientBookings()

const { useConversations, useNotifications } = useMessaging()
const { data: conversations } = useConversations()
const { data: notifications } = useNotifications()

const { useCasesList } = useCases()
const { data: casesData } = useCasesList()

// Only its suggestions are used, and only for someone with no lawyer yet.
const { data: dashboard } = useClientDashboard()

const { needsVerifyEmail } = useEmailVerificationPrompt()
const { openDialog: openEmailDialog } = useEmailVerificationDialog()

// The time is read in the browser only, so the server and the page never
// disagree about the date or the greeting, and it moves on while the page is open.
const now = ref<Date | null>(null)
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = new Date()
  clock = setInterval(() => { now.value = new Date() }, 60_000)
})
onBeforeUnmount(() => clearInterval(clock))

const loading = computed(() => !now.value || bookingsPending.value)

// ───────── what the page says ─────────
const diary = computed(() => sortClientDiary(bookings.value ?? [], now.value ?? new Date()))

const unread = computed(() => (conversations.value ?? []).filter(conversation => (conversation.unreadCount ?? 0) > 0))
const unreadMessages = computed(() => unread.value.reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0))
const unreadFrom = computed(() => unread.value.map((conversation) => {
  const other = conversation.participants.find(person => person.userId !== userId.value) ?? conversation.participants[0]
  return other?.name ?? ''
}))

const feeRequests = computed(() => (notifications.value ?? [])
  .filter(notification => !notification.read && notification.type === 'consultation_fee_request')
  .map(notification => ({ id: notification.id, conversationId: notification.conversationId, text: notification.body || notification.title })))

const lawyers = computed(() => deriveClientLawyers(bookings.value ?? [], conversations.value ?? [], userId.value))

const headline = computed(() => clientHeadline({
  diary: diary.value,
  unreadMessages: unreadMessages.value,
  unreadFrom: unreadFrom.value,
  feeRequests: feeRequests.value.length,
  hasLawyers: lawyers.value.length > 0,
}, now.value ?? new Date()))

const glance = computed(() => bookingsGlance(diary.value, now.value ?? new Date()))

const todos = computed(() => clientTodos({
  diary: diary.value,
  unreadMessages: unreadMessages.value,
  unreadFrom: unreadFrom.value,
  feeRequests: feeRequests.value,
  emailUnconfirmed: needsVerifyEmail.value,
}))

// A to-do row is a link, except the few the page handles itself.
const RowLink = resolveComponent('NuxtLink')
function runTodo(todo: ClientTodo) {
  if (todo.id === 'confirm-email') openEmailDialog()
}

const eyebrow = computed(() => {
  if (!now.value) return ''
  const hour = now.value.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const date = now.value.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  return `${date} · ${greeting}${firstName.value ? `, ${firstName.value}` : ''}`
})

const activeCases = computed(() => (casesData.value?.cases ?? [])
  .filter(item => item.status === 'active' || item.status === 'reopened')
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))

/** For someone with no lawyer yet: a few who match what they said they need. */
const suggestions = computed(() => lawyers.value.length ? [] : (dashboard.value?.recommendedLawyers ?? []).slice(0, 3))

// Someone with no lawyer and nothing suggested starts from the kind of help
// they need: the same areas, in the same order, as the public practice areas page.
const starting = computed(() => lawyers.value.length === 0 && suggestions.value.length === 0)
const { data: specializations } = useSpecializations()
const areas = computed(() => [...(specializations.value ?? [])]
  .sort((a, b) => (a.isFeatured !== b.isFeatured ? (a.isFeatured ? -1 : 1) : a.name.localeCompare(b.name)))
  .slice(0, 6))

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-xl leading-none font-normal tracking-tight'
const card = 'rounded-card border border-border bg-card p-4.5 lg:p-5 xl:p-5.5'
const face = 'grid size-12 flex-none place-items-center overflow-hidden rounded-lg bg-mint font-display font-medium text-deep'
</script>

<template>
  <div class="grid gap-5 lg:gap-6.25 xl:gap-7.75">
    <!-- ───────── loading / could not load ───────── -->
    <div v-if="loading && !bookingsFailed" role="status" aria-label="Loading your overview" class="grid gap-4">
      <div class="h-88 animate-pulse rounded-panel bg-muted max-sm:rounded-2xl" />
      <div class="h-18.5 animate-pulse rounded-card bg-muted" />
      <div class="h-36 animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="bookingsFailed" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 :class="sectionTitle">We could not load your bookings.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed on your account. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" @click="() => refetchBookings()">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── now, and what is booked ───────── -->
      <section
        aria-labelledby="overview-title"
        class="flex flex-wrap items-center gap-x-5 md:gap-x-5.75 lg:gap-x-7.75 xl:gap-x-9 gap-y-5 rounded-panel border border-border bg-card p-4.75 md:p-5 lg:p-6.75 xl:p-8 max-sm:rounded-2xl"
      >
        <div class="min-w-0 grow-999 basis-96">
          <p class="text-xs font-medium tracking-widest text-brand uppercase">{{ eyebrow }}</p>
          <h1 id="overview-title" class="mt-2 text-2xl md:text-3xl leading-none font-normal tracking-tight text-balance">
            {{ headline.lead }} <em class="text-brand not-italic">{{ headline.accent }}</em>
          </h1>
          <p class="mt-1.75 max-w-144 text-muted-foreground">{{ headline.detail }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <Button v-if="headline.primary" as-child variant="canopy" size="pill-sm">
              <a v-if="headline.primary.to.startsWith('#')" :href="headline.primary.to">{{ headline.primary.label }}<CanopyArrowChip /></a>
              <NuxtLink v-else :to="headline.primary.to">{{ headline.primary.label }}<CanopyArrowChip /></NuxtLink>
            </Button>
            <Button v-if="headline.secondary" as-child variant="line" size="pill-sm">
              <NuxtLink :to="headline.secondary.to">{{ headline.secondary.label }}</NuxtLink>
            </Button>
          </div>
        </div>

        <div class="min-w-0 grow basis-84 rounded-card bg-mint p-4 text-deep">
          <h2 class="font-display text-base font-normal tracking-tight">Your bookings</h2>
          <ul v-if="glance.length" class="mt-2.75 grid gap-1.75">
            <li v-for="booking in glance" :key="booking.id">
              <NuxtLink :to="booking.to" class="block rounded-lg bg-card/70 px-3.5 py-2.5 text-foreground transition-colors hover:bg-card">
                <span class="flex items-center justify-between gap-3">
                  <b class="min-w-0 text-sm font-medium">{{ booking.when }}</b>
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap" :class="booking.status === 'Confirmed' ? 'bg-mint text-deep' : 'bg-muted text-foreground'">{{ booking.status }}</span>
                </span>
                <span class="block truncate text-sm text-muted-foreground">{{ booking.detail }}</span>
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="mt-2">Nothing booked. When you book a consultation it shows here, with whether the lawyer has confirmed.</p>
          <NuxtLink v-if="diary.hasBooked" to="/dashboard/bookings" class="mt-2 inline-flex min-h-11 items-center font-medium underline underline-offset-3">All bookings</NuxtLink>
        </div>
      </section>

      <!-- ───────── to do: yours first, then what is with a lawyer ───────── -->
      <section v-if="todos.length" id="to-do" aria-labelledby="todo-title" class="scroll-mt-24">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="todo-title" :class="sectionTitle">To do</h2>
          <p class="text-sm text-muted-foreground">{{ todoSummary(todos) }}</p>
        </div>
        <ol class="mt-4 grid gap-2.25">
          <li v-for="(todo, index) in todos" :key="todo.id">
            <component
              :is="todo.to ? RowLink : 'button'"
              :to="todo.to"
              :type="todo.to ? undefined : 'button'"
              class="group flex w-full cursor-pointer flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-card border border-border bg-card px-4.5 py-3.5 text-left transition-colors duration-200 ease-canopy hover:border-brand/45 active:translate-y-px"
              @click="todo.to ? undefined : runTodo(todo)"
            >
              <span aria-hidden="true" class="grid size-10.5 flex-none place-items-center rounded-md bg-background font-display font-medium">{{ index + 1 }}</span>
              <span class="min-w-0 grow basis-64">
                <b class="block font-display text-base font-normal tracking-tight">{{ todo.title }}</b>
                <span class="block text-sm text-muted-foreground">{{ todo.note }}</span>
              </span>
              <span v-if="todo.waiting" class="rounded-full bg-muted px-3 py-0.75 text-xs font-medium whitespace-nowrap max-sm:ml-14">{{ todo.action }}</span>
              <span v-else class="inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-brand max-sm:pl-14">
                {{ todo.action }}<CanopyGlyph name="arrow" :size="15" class="transition-transform duration-200 ease-canopy group-hover:translate-x-0.75" />
              </span>
            </component>
          </li>
        </ol>
      </section>

      <!-- ───────── the lawyers they already have, and finding another ───────── -->
      <!-- someone with no lawyer and no suggestions has the headline's "Find a lawyer": nothing to add here -->
      <section v-if="lawyers.length || suggestions.length" aria-labelledby="lawyers-title">
        <h2 id="lawyers-title" :class="sectionTitle">{{ lawyers.length ? 'Your lawyers' : 'Lawyers who match what you need' }}</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 tab:grid-cols-3">
          <WorkspaceLawyerContactCard v-for="lawyer in lawyers.slice(0, 5)" :key="lawyer.userId ?? lawyer.lawyerProfileId ?? lawyer.name" :lawyer="lawyer" />

          <article v-for="lawyer in suggestions" :key="lawyer.id" :class="[card, 'flex flex-col']">
            <div class="flex items-center gap-3.25">
              <span :class="face">
                <img v-if="lawyer.image" :src="lawyer.image" alt="" class="size-full object-cover">
                <template v-else>{{ initials(lawyer.name) }}</template>
              </span>
              <span class="min-w-0">
                <b class="block truncate font-display text-base font-normal tracking-tight">{{ lawyer.name }}</b>
                <span class="block truncate text-sm text-muted-foreground">{{ [lawyer.specializations?.[0]?.name, lawyer.state].filter(Boolean).join(' · ') }}</span>
              </span>
            </div>
            <Button as-child variant="line" size="pill-sm" class="mt-3.5 w-full">
              <NuxtLink :to="`/lawyers/${lawyer.id}`">View profile</NuxtLink>
            </Button>
          </article>

          <NuxtLink to="/find-lawyers" class="group flex flex-col justify-between gap-3.5 rounded-card bg-stone p-4.5 lg:p-5 xl:p-5.5 transition-colors">
            <span>
              <b class="block font-display text-base font-normal tracking-tight">{{ lawyers.length ? 'Need help with something else?' : 'Search the directory' }}</b>
              <span class="mt-0.75 block text-sm text-muted-foreground">Search verified lawyers by practice area and state. Searching and asking are free.</span>
            </span>
            <span class="inline-flex min-h-11 items-center gap-1.5 font-medium underline underline-offset-3">
              Find a lawyer<CanopyGlyph name="arrow" :size="15" class="transition-transform duration-200 ease-canopy group-hover:translate-x-0.75" />
            </span>
          </NuxtLink>
        </div>
        <NuxtLink v-if="lawyers.length > 5" to="/dashboard/my-lawyers" class="mt-1.5 inline-flex min-h-11 items-center font-medium underline underline-offset-3">
          All {{ lawyers.length }} lawyers
        </NuxtLink>
      </section>

      <!-- ───────── no lawyer yet: start from the kind of help needed ───────── -->
      <section v-if="starting && areas.length" aria-labelledby="areas-title">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="areas-title" :class="sectionTitle">Choose the kind of help you need</h2>
          <NuxtLink to="/practice-areas" class="inline-flex min-h-11 items-center font-medium text-brand underline underline-offset-3">All areas</NuxtLink>
        </div>
        <ul class="mt-2.5 grid gap-2.5 sm:grid-cols-2 tab:grid-cols-3">
          <li v-for="area in areas" :key="area.id">
            <NuxtLink
              :to="{ path: '/find-lawyers', query: { areas: area.id } }"
              class="group flex h-full items-start gap-4 rounded-card border border-border bg-card px-4.5 py-4 transition-colors duration-200 hover:border-primary hover:bg-mint"
            >
              <span class="min-w-0 flex-1">
                <b class="block font-display text-base leading-tight font-normal tracking-tight">{{ area.name }}</b>
                <span v-if="area.description" class="mt-1 block text-sm leading-normal text-muted-foreground">{{ area.description }}</span>
              </span>
              <CanopyGlyph name="arrow" :stroke="2.2" class="mt-1 flex-none text-brand transition-transform duration-200 ease-canopy group-hover:translate-x-0.75" />
            </NuxtLink>
          </li>
        </ul>
      </section>

      <!-- ───────── work a lawyer is doing for them ───────── -->
      <section v-if="activeCases.length" aria-labelledby="cases-title">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="cases-title" :class="sectionTitle">Your cases</h2>
          <NuxtLink to="/dashboard/cases" class="inline-flex min-h-11 items-center font-medium text-brand underline underline-offset-3">All cases</NuxtLink>
        </div>
        <ul class="mt-2.5 divide-y divide-border rounded-card border border-border bg-card">
          <li v-for="item in activeCases.slice(0, 3)" :key="item.id">
            <NuxtLink :to="`/dashboard/cases/${item.id}`" class="group flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4.75 py-3.5">
              <span class="min-w-0 grow basis-64">
                <b class="block font-medium">{{ item.title }}</b>
                <span v-if="item.lawyer?.name" class="block text-sm text-muted-foreground">With {{ item.lawyer.name }}</span>
              </span>
              <span class="inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-brand">
                Open the case<CanopyGlyph name="arrow" :size="15" class="transition-transform duration-200 ease-canopy group-hover:translate-x-0.75" />
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
