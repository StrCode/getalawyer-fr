<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { getTier1IncompleteItems } from '~/lib/profile-check-catalog'
import { APPLICATION_HOME } from '~/lib/setup-paths'
import {
  agendaTag,
  casesTile,
  channelLabel,
  clockLabel,
  emptyDayLine,
  nextSevenDays,
  overviewHeadline,
  overviewTodos,
  profileTile,
  sortDiary,
  type OverviewTodo,
} from '~/lib/lawyer-overview'
import { longDate, membershipMode, membershipTile } from '~/lib/membership-view'
import { useAvailability } from '~/composables/useAvailability'
import { useSubscriptionStatus } from '~/composables/useSubscription'

/**
 * A lawyer's overview: the one thing that needs them now, the next seven days,
 * everything else to do in order of urgency, and where cases, profile and
 * membership stand. What it says in each state is decided in
 * `lib/lawyer-overview`; this component loads the data and lays it out.
 *
 * Requests are answered on the booking's own page, where the client's notes
 * are, so the overview links there and decides nothing itself.
 */
const { session } = useAuth()
const userId = computed(() => session.value?.user.id ?? null)
const firstName = computed(() => session.value?.user.name?.trim().split(/\s+/)[0] ?? '')

// A rejected application has no dashboard: back to the application.
const applicationStatus = computed(() => (session.value?.user as { applicationStatus?: string } | undefined)?.applicationStatus)
watch(applicationStatus, (status) => {
  if (status === 'rejected') void navigateTo(APPLICATION_HOME)
}, { immediate: true })
const isApproved = computed(() => applicationStatus.value === 'approved')

// ───────── data (the same queries the top bar's counts use) ─────────
const { useLawyerBookings } = useBookings()
const { data: bookings, isPending: bookingsPending, isError: bookingsFailed, refetch: refetchBookings } = useLawyerBookings()

const { useConversations } = useMessaging()
const { data: conversations } = useConversations()

const { useCasesList } = useCases()
const { data: casesData, isPending: casesPending } = useCasesList()

const { data: membership, isPending: membershipPending } = useSubscriptionStatus()
const { profileStrength, directoryEligibility } = useLawyerProfileEditor()

const { useConsultationTypesList } = useConsultationTypes()
const { data: consultationTypes, isFetched: typesFetched } = useConsultationTypesList(false)

const { useAvailabilitySchedule, useAvailabilityExceptions } = useAvailability()
const { data: schedule, isFetched: scheduleFetched } = useAvailabilitySchedule()
const { data: exceptions } = useAvailabilityExceptions(ref({ futureOnly: true }))

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
const diary = computed(() => sortDiary(bookings.value ?? [], now.value ?? new Date()))

const unread = computed(() => (conversations.value ?? []).filter(conversation => (conversation.unreadCount ?? 0) > 0))
const unreadMessages = computed(() => unread.value.reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0))
const unreadFrom = computed(() => unread.value.map((conversation) => {
  const other = conversation.participants.find(person => person.userId !== userId.value) ?? conversation.participants[0]
  return other?.name ?? ''
}))

const noHours = computed(() => scheduleFetched.value ? !(schedule.value ?? []).some(row => row.isAvailable) : undefined)
const noConsultationTypes = computed(() => typesFetched.value ? (consultationTypes.value ?? []).length === 0 : undefined)
const bookable = computed(() => {
  if (noHours.value === undefined || noConsultationTypes.value === undefined) return null
  return !noHours.value && !noConsultationTypes.value
})

const profileMissing = computed(() => getTier1IncompleteItems(profileStrength.value).map(item => item.label))
const profileBlocksListing = computed(() => isApproved.value && directoryEligibility.value?.blockers.includes('profile') === true)

const headline = computed(() => overviewHeadline(
  { diary: diary.value, unreadMessages: unreadMessages.value, bookable: bookable.value },
  now.value ?? new Date(),
))

const todos = computed(() => overviewTodos({
  diary: diary.value,
  unreadMessages: unreadMessages.value,
  unreadFrom: unreadFrom.value,
  emailUnconfirmed: needsVerifyEmail.value,
  noHours: noHours.value,
  noConsultationTypes: noConsultationTypes.value,
  profileBlocksListing: profileBlocksListing.value,
  profileMissing: profileMissing.value,
}))

// A to-do row is a link, except the few the page handles itself.
const RowLink = resolveComponent('NuxtLink')
function runTodo(todo: OverviewTodo) {
  if (todo.id === 'confirm-email') openEmailDialog()
}

const eyebrow = computed(() => {
  if (!now.value) return ''
  const hour = now.value.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const date = now.value.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  return `${date} · ${greeting}${firstName.value ? `, ${firstName.value}` : ''}`
})

// ───────── the next seven days ─────────
const days = computed(() => nextSevenDays({
  bookings: bookings.value ?? [],
  hours: scheduleFetched.value ? (schedule.value ?? []) : undefined,
  exceptions: exceptions.value,
  now: now.value ?? new Date(),
}))
const pickedKey = ref<string | null>(null)
const pickedDay = computed(() => days.value.find(day => day.key === pickedKey.value) ?? days.value[0] ?? null)

// ───────── the tiles ─────────
const activeCases = computed(() => (casesData.value?.cases ?? [])
  .filter(item => item.status === 'active' || item.status === 'reopened')
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
const cases = computed(() => casesTile(activeCases.value))

const profile = computed(() => profileTile({
  percent: profileStrength.value?.percent,
  missing: profileMissing.value,
  visible: directoryEligibility.value ? directoryEligibility.value.isDirectoryVisible : null,
}))
const profilePercent = computed(() => Math.max(0, Math.min(100, Math.round(profileStrength.value?.percent ?? 0))))

const subscription = computed(() => membership.value?.subscription ?? null)
const member = computed(() => membershipTile(
  membershipMode(subscription.value, membership.value?.hasActiveSubscription === true),
  {
    planName: subscription.value?.plan?.name,
    endLabel: longDate(subscription.value?.subscriptionEndDate),
    autoRenew: subscription.value?.autoRenewEnabled,
  },
))

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-xl leading-none font-normal tracking-tight'
const tile = 'flex min-w-0 flex-col rounded-card p-4.75 lg:p-5.75 xl:p-6'
const tileTitle = 'font-display text-lg font-normal tracking-tight'
const tileLink = 'mt-auto inline-flex min-h-11 w-fit items-center pt-1.5 font-medium underline underline-offset-3 transition-colors hover:text-brand'
</script>

<template>
  <div class="grid gap-5 lg:gap-6.25 xl:gap-7.75">
    <!-- ───────── loading / could not load ───────── -->
    <div v-if="loading && !bookingsFailed" role="status" aria-label="Loading your overview" class="grid gap-4">
      <div class="h-88 animate-pulse rounded-panel bg-muted max-sm:rounded-2xl" />
      <div class="h-18.5 animate-pulse rounded-card bg-muted" />
      <div class="h-18.5 animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="bookingsFailed" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 :class="sectionTitle">We could not load your diary.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed on your account. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" @click="() => refetchBookings()">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── now, and the next seven days ───────── -->
      <!-- compact on purpose: the greeting, the week and the first things to do fit on the first screen -->
      <section aria-labelledby="overview-title" class="rounded-panel border border-border bg-card p-4.75 md:p-5 lg:p-6.75 xl:p-8 max-sm:rounded-2xl">
        <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div class="min-w-0 grow basis-104">
            <p class="text-xs font-medium tracking-widest text-brand uppercase">{{ eyebrow }}</p>
            <h1 id="overview-title" class="mt-2 max-w-160 text-2xl md:text-3xl leading-none font-normal tracking-tight text-balance">
              {{ headline.lead }} <em class="text-brand not-italic">{{ headline.accent }}</em>
            </h1>
            <p class="mt-1.75 max-w-152 text-muted-foreground">{{ headline.detail }}</p>
          </div>

          <div class="flex flex-none flex-wrap gap-2">
            <Button v-if="headline.primary" as-child variant="canopy" size="pill-sm">
              <a v-if="headline.primary.to.startsWith('#')" :href="headline.primary.to">{{ headline.primary.label }}<CanopyArrowChip /></a>
              <NuxtLink v-else :to="headline.primary.to">{{ headline.primary.label }}<CanopyArrowChip /></NuxtLink>
            </Button>
            <Button as-child variant="line" size="pill-sm">
              <NuxtLink to="/dashboard/appointments">All appointments</NuxtLink>
            </Button>
          </div>
        </div>

        <div class="mt-4 md:mt-4.25 lg:mt-5.75 xl:mt-6 grid items-start gap-4 lg:gap-5 xl:gap-6 border-t border-border pt-4 md:pt-4.25 lg:pt-5.5 tab:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
          <div class="min-w-0">
            <div class="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 id="week-title" class="font-display text-base font-normal tracking-tight">Next 7 days</h2>
              <p class="text-sm text-muted-foreground">Choose a day to see what is in it.</p>
            </div>
            <WorkspaceWeekStrip
              v-model="pickedKey"
              :days="days"
              aria-labelledby="week-title"
              class="mt-2.75"
            />
          </div>

          <!-- the chosen day -->
          <div v-if="pickedDay" aria-live="polite" class="min-w-0 rounded-card bg-mint p-4 text-deep">
            <h3 class="font-display text-base font-normal tracking-tight">
              {{ pickedDay.isToday ? 'Today' : pickedDay.label }}
            </h3>
            <ol v-if="pickedDay.bookings.length" class="mt-2.75 grid gap-1.75">
              <li v-for="booking in pickedDay.bookings" :key="booking.id">
                <NuxtLink
                  :to="`/dashboard/appointments/${booking.id}`"
                  class="grid grid-cols-[4.7rem_minmax(0,1fr)] items-start gap-2.75 rounded-lg bg-card/70 px-3.25 py-2.5 text-foreground transition-colors hover:bg-card"
                >
                  <b class="pt-0.25 text-sm font-medium">{{ clockLabel(booking.scheduledStartTime) }}</b>
                  <span class="min-w-0">
                    <b class="block truncate font-medium">{{ booking.client?.name ?? 'Client' }}</b>
                    <span class="block text-sm text-muted-foreground">{{ booking.consultationType?.name ?? 'Consultation' }} · {{ channelLabel(booking.meetingType) }}</span>
                    <span v-if="agendaTag(booking)" class="mt-1.25 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" :class="booking.status === 'pending' ? 'bg-warning/15 text-warning-subtle-foreground' : 'bg-muted text-foreground'">{{ agendaTag(booking) }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ol>
            <p v-else class="mt-2">{{ emptyDayLine(pickedDay) }}</p>
            <NuxtLink
              v-if="pickedDay.state === 'closed' || pickedDay.state === 'unknown' || noHours"
              to="/dashboard/availability"
              class="mt-2.5 inline-flex min-h-11 items-center font-medium underline underline-offset-3"
            >{{ noHours ? 'Set your working hours' : 'Change working hours' }}</NuxtLink>
          </div>
        </div>
      </section>

      <!-- ───────── to do, most urgent first ───────── -->
      <section v-if="todos.length" id="to-do" aria-labelledby="todo-title" class="scroll-mt-24">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="todo-title" :class="sectionTitle">To do</h2>
          <p class="text-sm text-muted-foreground">{{ todos.length === 1 ? '1 thing' : `${todos.length} things, most urgent first` }}</p>
        </div>
        <ol class="mt-2.75 grid gap-1.75">
          <li v-for="(todo, index) in todos" :key="todo.id">
            <component
              :is="todo.to ? RowLink : 'button'"
              :to="todo.to"
              :type="todo.to ? undefined : 'button'"
              class="group flex w-full cursor-pointer flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-card border border-border bg-card px-4 py-3 text-left transition-colors duration-200 ease-canopy hover:border-brand/45 active:translate-y-px"
              @click="todo.to ? undefined : runTodo(todo)"
            >
              <span aria-hidden="true" class="grid size-9.25 flex-none place-items-center rounded-md bg-background font-display font-medium">{{ index + 1 }}</span>
              <span class="min-w-0 grow basis-64">
                <b class="block font-display text-sm font-normal tracking-tight">{{ todo.title }}</b>
                <span class="block text-sm text-muted-foreground">{{ todo.note }}</span>
              </span>
              <span class="inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-brand max-sm:pl-14">
                {{ todo.action }}<CanopyGlyph name="arrow" :size="15" class="transition-transform duration-200 ease-canopy group-hover:translate-x-0.75" />
              </span>
            </component>
          </li>
        </ol>
      </section>

      <!-- ───────── where things stand ───────── -->
      <div class="grid gap-3 sm:grid-cols-2 tab:grid-cols-3">
        <section aria-labelledby="cases-title" :class="[tile, 'bg-stone']">
          <h2 id="cases-title" :class="tileTitle">Cases</h2>
          <div v-if="casesPending" aria-busy="true" class="mt-2.5 h-11.5 animate-pulse rounded-lg bg-foreground/8" />
          <p v-else class="mt-2"><b class="font-medium">{{ cases.lead }}</b> {{ cases.detail }}</p>
          <NuxtLink to="/dashboard/cases" :class="tileLink">Open cases</NuxtLink>
        </section>

        <section aria-labelledby="profile-title" :class="[tile, 'border border-border bg-card']">
          <h2 id="profile-title" :class="tileTitle">Profile</h2>
          <div v-if="!profileStrength" aria-busy="true" class="mt-2.5 h-11.5 animate-pulse rounded-lg bg-muted" />
          <template v-else>
            <p class="mt-2"><b class="font-medium">{{ profile.lead }}</b> {{ profile.detail }}</p>
            <div role="img" :aria-label="`${profilePercent} percent complete`" class="mt-2.75 h-2 overflow-hidden rounded-full bg-border">
              <div class="h-full rounded-full bg-brand" :style="{ width: `${profilePercent}%` }" />
            </div>
          </template>
          <NuxtLink to="/dashboard/profile" :class="tileLink">{{ profileStrength ? profile.action : 'Open your profile' }}</NuxtLink>
        </section>

        <section aria-labelledby="member-title" :class="[tile, 'bg-sand sm:max-tab:col-span-2']">
          <h2 id="member-title" :class="tileTitle">Membership</h2>
          <div v-if="membershipPending" aria-busy="true" class="mt-2.5 h-11.5 animate-pulse rounded-lg bg-foreground/8" />
          <p v-else class="mt-2"><b class="font-medium">{{ member.lead }}</b> {{ member.detail }}</p>
          <NuxtLink to="/dashboard/subscription" :class="tileLink">{{ membershipPending ? 'Open membership' : member.action }}</NuxtLink>
        </section>
      </div>
    </template>
  </div>
</template>
