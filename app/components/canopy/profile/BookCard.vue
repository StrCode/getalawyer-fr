<script setup lang="ts">
import { today } from '@internationalized/date'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { buildSlotsByDate, formatTimeLabel } from '~/lib/booking-calendar'
import type { PublicConsultationType, LawyerPracticeInfo } from '~/types/lawyer'

/**
 * Booking card on a lawyer's profile. The visitor picks a consultation type,
 * one of the next open days and a time; the button carries all three to the
 * booking page, where they sign in and confirm. Open times come from the public
 * available-slots endpoint, so nothing here is a guess.
 */
const props = defineProps<{
  lawyerId: string
  /** Active consultation types only. */
  types: PublicConsultationType[]
  practiceInfo: LawyerPracticeInfo | null
  isAuthenticated: boolean
  isOwnProfile: boolean
}>()

const emit = defineEmits<{ ask: [] }>()

const TIMEZONE = 'Africa/Lagos'
/** How far ahead the card looks for open days, and how much of that it shows. */
const DAYS_AHEAD = 13
const DAYS_SHOWN = 4
const TIMES_SHOWN = 6

const MEETING: Record<PublicConsultationType['meetingType'], string> = {
  video: 'Video',
  phone: 'Phone',
  in_person: 'In person',
  any: 'Video, phone or in person',
}

const typeId = ref(props.types[0]?.id ?? '')
watch(() => props.types, (types) => {
  if (!types.some(type => type.id === typeId.value)) typeId.value = types[0]?.id ?? ''
})
const chosenType = computed(() => props.types.find(type => type.id === typeId.value) ?? null)

function priceLabel(type: PublicConsultationType) {
  const price = Number(type.price)
  return price > 0 ? formatNairaAmount(price) : 'Free'
}

// ---- open days and times for the chosen type ----
const start = today(TIMEZONE)
const { useAvailableSlotsRange } = useClientBooking()
const { data: range, isPending, isError } = useAvailableSlotsRange(
  computed(() => props.lawyerId),
  ref(start.toString()),
  ref(start.add({ days: DAYS_AHEAD }).toString()),
  typeId,
  ref(TIMEZONE),
)

const slotsByDate = computed(() => buildSlotsByDate(range.value?.results))
const openDays = computed(() => [...slotsByDate.value.keys()].sort().slice(0, DAYS_SHOWN))

const day = ref<string | null>(null)
const time = ref<string | null>(null)
const times = computed(() => (day.value ? slotsByDate.value.get(day.value) ?? [] : []))

// Keep the picks valid as the type changes and new times load: first open day,
// first time of that day.
watch(openDays, (days) => {
  if (!day.value || !days.includes(day.value)) day.value = days[0] ?? null
}, { immediate: true })
watch(times, (list) => {
  if (!time.value || !list.some(slot => slot.startTime === time.value)) time.value = list[0]?.startTime ?? null
}, { immediate: true })

function dayParts(date: string) {
  const [year = 0, month = 1, dayOfMonth = 1] = date.split('-').map(Number)
  const local = new Date(year, month - 1, dayOfMonth)
  return {
    weekday: local.toLocaleDateString('en-GB', { weekday: 'short' }),
    number: dayOfMonth,
    full: local.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
  }
}

const showPicker = computed(() => Boolean(chosenType.value) && !isError.value)
const noOpenDays = computed(() => showPicker.value && !isPending.value && openDays.value.length === 0)

const bookLink = computed(() => ({
  path: `/lawyers/${props.lawyerId}/book`,
  query: {
    ...(typeId.value ? { type: typeId.value } : {}),
    ...(day.value && time.value ? { date: day.value, time: time.value } : {}),
  },
}))

const bookLabel = computed(() => {
  if (day.value && time.value) {
    const parts = dayParts(day.value)
    return `Book for ${parts.weekday} ${parts.number}, ${formatTimeLabel(time.value)}`
  }
  return noOpenDays.value ? 'See the full calendar' : 'Book a consultation'
})

const office = computed(() => {
  const info = props.practiceInfo
  if (!info) return ''
  const place = [info.officeCity, info.officeState].filter(Boolean)
  // One-city states come back as "Rivers, Rivers".
  const unique = place.filter((part, index) => place.indexOf(part) === index).join(', ')
  return props.isAuthenticated && info.officeStreet ? `${info.officeStreet}, ${unique}` : unique
})
const licensedIn = computed(() => (props.practiceInfo?.statesOfPractice ?? []).join(', '))

const choice = 'cursor-pointer transition-colors duration-200'
</script>

<template>
  <aside
    id="book"
    aria-label="Book a consultation"
    class="scroll-mt-24 rounded-2xl border border-border bg-card p-5.25 shadow-pill tab:sticky tab:top-24"
  >
    <h2 class="text-xl font-normal tracking-tight">{{ types.length ? 'Book a consultation' : 'Get in touch' }}</h2>

    <template v-if="types.length">
      <div role="group" aria-label="Consultation type" class="mt-3.5 grid gap-1.75">
        <button
          v-for="type in types"
          :key="type.id"
          type="button"
          :aria-pressed="type.id === typeId"
          :class="choice"
          class="flex w-full items-center justify-between gap-3.25 rounded-lg border border-border px-3.75 py-3 text-left hover:border-brand aria-pressed:border-brand aria-pressed:bg-mint aria-pressed:text-deep"
          @click="typeId = type.id"
        >
          <span class="min-w-0">
            <b class="block text-base">{{ type.name }}</b>
            <small class="text-sm opacity-75">{{ type.durationMinutes }} min · {{ MEETING[type.meetingType] }}</small>
          </span>
          <em class="flex-none font-display font-normal not-italic">{{ priceLabel(type) }}</em>
        </button>
      </div>

      <template v-if="showPicker">
        <!-- times are fetched in the browser; hold the space while they load -->
        <div v-if="isPending" class="mt-4 grid gap-2.5" aria-busy="true" aria-label="Loading open times">
          <div class="grid grid-cols-4 gap-1.5">
            <Skeleton v-for="n in DAYS_SHOWN" :key="n" class="h-13.5 rounded-md" />
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <Skeleton v-for="n in 4" :key="n" class="h-11 rounded-md" />
          </div>
        </div>

        <p v-else-if="noOpenDays" class="mt-4 rounded-lg bg-background px-4 py-3.5 text-base text-muted-foreground">
          No open times in the next two weeks. Check the full calendar, or send a message and ask.
        </p>

        <template v-else>
          <div role="group" aria-label="Day" class="mt-4 grid grid-cols-4 gap-1.5">
            <button
              v-for="date in openDays"
              :key="date"
              type="button"
              :aria-pressed="date === day"
              :aria-label="dayParts(date).full"
              :class="choice"
              class="group/day min-h-13.5 rounded-md bg-background font-display text-lg font-normal aria-pressed:bg-foreground aria-pressed:text-background"
              @click="day = date"
            >
              <small class="block font-sans text-xs font-medium text-muted-foreground group-aria-pressed/day:text-inherit group-aria-pressed/day:opacity-75">{{ dayParts(date).weekday }}</small>{{ dayParts(date).number }}
            </button>
          </div>
          <div role="group" aria-label="Time" class="mt-2.5 grid grid-cols-2 gap-1.5">
            <button
              v-for="slot in times.slice(0, TIMES_SHOWN)"
              :key="slot.startTime"
              type="button"
              :aria-pressed="slot.startTime === time"
              :class="choice"
              class="min-h-11 rounded-md bg-background px-1.5 text-sm font-medium tabular-nums aria-pressed:bg-primary aria-pressed:text-white"
              @click="time = slot.startTime"
            >
              {{ formatTimeLabel(slot.startTime) }}
            </button>
          </div>
          <p class="mt-2.25 flex flex-wrap justify-between gap-x-3 text-sm text-muted-foreground">
            <span>Nigerian time (WAT)</span>
            <NuxtLink :to="{ path: bookLink.path, query: { type: typeId } }" class="font-medium text-foreground underline underline-offset-3 hover:text-brand">More days and times</NuxtLink>
          </p>
        </template>
      </template>
    </template>

    <p v-else class="mt-2.5 text-base text-muted-foreground">
      This lawyer has not set up consultations to book online yet. Send a message; it is free.
    </p>

    <template v-if="isOwnProfile">
      <Button as-child variant="line" size="pill" class="mt-3.5 w-full">
        <NuxtLink to="/dashboard/profile">Edit your profile</NuxtLink>
      </Button>
    </template>
    <template v-else>
      <Button v-if="types.length" as-child variant="canopy" size="pill" class="group/btn mt-3.5 w-full justify-between pr-2 pl-5.25">
        <NuxtLink :to="bookLink">{{ bookLabel }}<CanopyArrowChip /></NuxtLink>
      </Button>
      <Button
        :variant="types.length ? 'line' : 'canopy'"
        size="pill"
        class="w-full"
        :class="types.length ? 'mt-2' : 'mt-3.5'"
        @click="emit('ask')"
      >
        Ask a question, free
      </Button>
    </template>

    <p class="mt-3.5 text-sm text-muted-foreground">
      <template v-if="chosenType">
        <span aria-live="polite" class="font-medium text-foreground">{{ chosenType.name }} · {{ priceLabel(chosenType) }}.</span>
        You sign in to confirm, and the lawyer accepts the request.
      </template>
      Fees are agreed and paid directly between you and the lawyer; getalawyer takes no commission.
    </p>

    <dl v-if="office || licensedIn" class="mt-3.5 grid gap-1.5 border-t border-border pt-3.5 text-sm">
      <div v-if="office" class="flex justify-between gap-4">
        <dt class="text-muted-foreground">Office</dt>
        <dd class="text-right font-medium">{{ office }}</dd>
      </div>
      <div v-if="licensedIn" class="flex justify-between gap-4">
        <dt class="flex-none text-muted-foreground">Licensed in</dt>
        <dd class="text-right font-medium">{{ licensedIn }}</dd>
      </div>
    </dl>
  </aside>
</template>
