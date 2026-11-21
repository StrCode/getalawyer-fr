<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  dateKeysBetween,
  EXCEPTION_PILL,
  exceptionDateLabel,
  exceptionHours,
  exceptionKind,
} from '~/lib/availability-view'
import type { AvailabilityException } from '~/types'
import { localDateKey } from '~/utils/date'

/**
 * The dates that differ from the weekly hours: a day or some hours off, or
 * extra hours on a day that is normally closed. One date is added at a time,
 * or a run of days off (a holiday) in one go.
 */

// The API refuses these for a lawyer whose membership is not on; stop before any form opens.
const { membershipBlocks } = useMembershipAccess()

const {
  useAvailabilityExceptions,
  useCreateAvailabilityException,
  useBulkCreateExceptions,
  useDeleteAvailabilityException,
} = useAvailability()

const showPast = ref(false)
const { data: exceptions, isPending, isError, isFetching, refetch } = useAvailabilityExceptions(
  computed(() => ({ futureOnly: !showPast.value })),
)
const rows = computed(() => exceptions.value ?? [])

const createOne = useCreateAvailabilityException()
const createMany = useBulkCreateExceptions()
const removeOne = useDeleteAvailabilityException()

const minDate = localDateKey()

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

// ───────── one date ─────────
const dateOpen = ref(false)
const dateForm = ref({ date: '', open: false, allDay: true, startTime: '09:00', endTime: '17:00', reason: '' })

function openDate() {
  if (membershipBlocks('change your availability')) return
  dateForm.value = { date: '', open: false, allDay: true, startTime: '09:00', endTime: '17:00', reason: '' }
  dateOpen.value = true
}

const dateProblem = computed(() => {
  const form = dateForm.value
  if (!form.date) return 'Choose a date.'
  if (!form.allDay) {
    if (!form.startTime || !form.endTime) return 'Set both a start and an end time.'
    if (form.startTime >= form.endTime) return 'The end time must be after the start time.'
  }
  return null
})

async function saveDate() {
  if (dateProblem.value || createOne.isPending.value) return
  if (membershipBlocks('change your availability')) return
  const form = dateForm.value
  try {
    await createOne.mutateAsync({
      date: form.date,
      startTime: form.allDay ? undefined : `${form.startTime}:00`,
      endTime: form.allDay ? undefined : `${form.endTime}:00`,
      isAvailable: form.open,
      reason: form.reason.trim() || undefined,
    })
    toast.success(`${exceptionDateLabel(form.date)} added.`)
    dateOpen.value = false
  }
  catch (error: unknown) {
    toast.error(messageOf(error, 'We could not add that date. Nothing has changed.'))
  }
}

// ───────── a run of days off ─────────
const rangeOpen = ref(false)
const rangeForm = ref({ startDate: '', endDate: '', reason: '' })

function openRange() {
  if (membershipBlocks('change your availability')) return
  rangeForm.value = { startDate: '', endDate: '', reason: '' }
  rangeOpen.value = true
}

const rangeDays = computed(() => dateKeysBetween(rangeForm.value.startDate, rangeForm.value.endDate))
const rangeProblem = computed(() => {
  if (!rangeForm.value.startDate || !rangeForm.value.endDate) return 'Choose the first and the last day.'
  if (rangeDays.value.length === 0) return 'The last day must be on or after the first.'
  return null
})

async function saveRange() {
  if (rangeProblem.value || createMany.isPending.value) return
  if (membershipBlocks('change your availability')) return
  const count = rangeDays.value.length
  try {
    await createMany.mutateAsync({
      dates: rangeDays.value,
      isAvailable: false,
      reason: rangeForm.value.reason.trim() || undefined,
    })
    toast.success(count === 1 ? '1 day taken off.' : `${count} days taken off.`)
    rangeOpen.value = false
  }
  catch (error: unknown) {
    toast.error(messageOf(error, 'We could not take those days off. Nothing has changed.'))
  }
}

// ───────── removing one ─────────
const pendingRemove = ref<AvailabilityException | null>(null)
const removing = computed(() => removeOne.isPending.value)

function askRemove(row: AvailabilityException) {
  if (membershipBlocks('change your availability')) return
  pendingRemove.value = row
}

async function confirmRemove() {
  const row = pendingRemove.value
  if (!row || removing.value) return
  try {
    await removeOne.mutateAsync(row.id)
    toast.success(`${exceptionDateLabel(row.date)} is back to your weekly hours.`)
    pendingRemove.value = null
  }
  catch (error: unknown) {
    toast.error(messageOf(error, 'We could not remove that date. Nothing has changed.'))
  }
}

const sectionTitle = 'font-display text-[1.15rem] font-[650] tracking-[-0.02em]'
const panel = 'overflow-hidden rounded-card border border-border bg-card'
const pad = 'px-[clamp(1.1rem,2.2vw,1.5rem)]'
const pill = 'rounded-full px-[0.65rem] py-[0.12rem] text-[0.78rem] font-bold whitespace-nowrap'
const dialog = 'gap-[1.1rem] rounded-[1.75rem] border-border bg-card p-[clamp(1.4rem,4vw,2rem)] sm:max-w-[30rem]'
const dialogTitle = 'font-display text-[1.5rem] leading-[1.1] font-[650] tracking-[-0.03em]'
const field = 'h-[2.75rem] rounded-[0.9rem] bg-card'
const choice = 'inline-flex min-h-[2.75rem] flex-1 cursor-pointer items-center justify-center rounded-full border px-[1rem] font-semibold transition-[background-color,border-color,color] duration-200 ease-canopy'
</script>

<template>
  <section :class="panel" aria-labelledby="exceptions-title">
    <header :class="[pad, 'flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-border py-[1.1rem]']">
      <div class="min-w-0">
        <h2 id="exceptions-title" :class="sectionTitle">Time off and extra hours</h2>
        <p class="mt-[0.2rem] max-w-[40rem] text-[0.95rem] text-muted-foreground">Dates when your weekly hours do not apply: a day off, a few hours away, or extra hours you are opening.</p>
      </div>
      <div class="flex flex-none flex-wrap items-center gap-[0.5rem]">
        <Button variant="line" size="pill-sm" @click="openRange">Take days off</Button>
        <Button variant="canopy" size="pill-sm" @click="openDate">Add a date</Button>
      </div>
    </header>

    <div :class="[pad, 'flex min-h-[3.25rem] items-center border-b border-border bg-background/60 py-[0.5rem]']">
      <label class="flex min-h-[2.75rem] cursor-pointer items-center gap-[0.7rem] text-[0.95rem] text-muted-foreground">
        <Switch :model-value="showPast" @update:model-value="showPast = $event" />
        Show past dates too
      </label>
    </div>

    <div v-if="isPending" role="status" aria-label="Loading your dates" :class="[pad, 'grid gap-2 py-[1rem]']">
      <div v-for="n in 3" :key="n" class="h-[4rem] animate-pulse rounded-[1rem] bg-muted" />
    </div>

    <div v-else-if="isError" :class="[pad, 'py-[clamp(1.6rem,4vw,2.6rem)] text-center']">
      <h3 :class="sectionTitle">We could not load your dates.</h3>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" :aria-busy="isFetching" @click="() => refetch()">{{ isFetching ? 'Trying…' : 'Try again' }}</Button>
    </div>

    <div v-else-if="rows.length === 0" :class="[pad, 'py-[clamp(1.8rem,4vw,3rem)] text-center']">
      <h3 :class="sectionTitle">{{ showPast ? 'No dates on record.' : 'Nothing coming up.' }}</h3>
      <p class="mx-auto mt-2 max-w-[32rem] text-muted-foreground">Clients can book you on your weekly hours every week. Add a date when one is different, for example a court day or a public holiday.</p>
    </div>

    <ul v-else class="divide-y divide-border">
      <li
        v-for="row in rows"
        :key="row.id"
        :class="[pad, 'flex flex-wrap items-center gap-x-[1rem] gap-y-[0.5rem] py-[0.95rem]']"
      >
        <div class="min-w-0 flex-[1_1_14rem]">
          <p class="flex flex-wrap items-center gap-x-[0.6rem] gap-y-1">
            <b class="font-display text-[1.12rem] font-[650] tracking-[-0.02em]">{{ exceptionDateLabel(row.date) }}</b>
            <span :class="[pill, EXCEPTION_PILL[exceptionKind(row)].class]">{{ EXCEPTION_PILL[exceptionKind(row)].label }}</span>
          </p>
          <p class="mt-[0.2rem] flex flex-wrap items-center gap-x-[0.45rem] text-[0.92rem] text-muted-foreground">
            <span>{{ exceptionHours(row) }}</span>
            <template v-if="row.reason"><span aria-hidden="true">·</span><span class="min-w-0 break-words">{{ row.reason }}</span></template>
          </p>
        </div>
        <Button variant="line" size="pill-sm" class="h-[2.5rem] px-[0.95rem] text-[0.95rem]" :aria-label="`Remove ${exceptionDateLabel(row.date)}`" @click="askRemove(row)">Remove</Button>
      </li>
    </ul>

    <!-- ───────── one date ───────── -->
    <Dialog v-model:open="dateOpen">
      <DialogContent :class="dialog">
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle :class="dialogTitle">Add a date</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">On this date, this replaces your weekly hours.</DialogDescription>
        </DialogHeader>

        <form class="grid gap-[1rem]" @submit.prevent="saveDate">
          <div class="grid gap-[0.4rem]">
            <Label for="ex-date" class="font-semibold">Date</Label>
            <Input id="ex-date" v-model="dateForm.date" type="date" :min="minDate" required :class="field" />
          </div>

          <div class="grid gap-[0.4rem]">
            <span id="ex-kind" class="font-semibold">On this date I am</span>
            <div role="group" aria-labelledby="ex-kind" class="flex gap-[0.4rem]">
              <button
                v-for="option in [{ open: false, label: 'Not available' }, { open: true, label: 'Available' }]"
                :key="option.label"
                type="button"
                :aria-pressed="dateForm.open === option.open"
                :class="[choice, dateForm.open === option.open ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground']"
                @click="dateForm.open = option.open"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <label class="flex min-h-[2.75rem] cursor-pointer items-center gap-[0.7rem]">
            <Switch :model-value="dateForm.allDay" @update:model-value="dateForm.allDay = $event" />
            <span class="font-semibold">All day</span>
          </label>

          <div v-if="!dateForm.allDay" class="grid grid-cols-2 gap-[0.75rem]">
            <div class="grid gap-[0.4rem]">
              <Label for="ex-start" class="font-semibold">From</Label>
              <Input id="ex-start" v-model="dateForm.startTime" type="time" required :class="field" />
            </div>
            <div class="grid gap-[0.4rem]">
              <Label for="ex-end" class="font-semibold">Until</Label>
              <Input id="ex-end" v-model="dateForm.endTime" type="time" required :class="field" />
            </div>
          </div>

          <div class="grid gap-[0.4rem]">
            <Label for="ex-reason" class="font-semibold">Note for yourself <span class="font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="ex-reason" v-model="dateForm.reason" maxlength="200" placeholder="For example: in court" :class="field" />
          </div>

          <p v-if="dateForm.date && dateProblem" role="alert" class="text-[0.92rem] font-semibold text-destructive">{{ dateProblem }}</p>

          <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
            <Button type="button" variant="line" size="pill" :disabled="createOne.isPending.value" @click="dateOpen = false">Cancel</Button>
            <Button type="submit" variant="canopy" size="pill" :disabled="!!dateProblem || createOne.isPending.value" :aria-busy="createOne.isPending.value">{{ createOne.isPending.value ? 'Adding…' : 'Add the date' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- ───────── a run of days off ───────── -->
    <Dialog v-model:open="rangeOpen">
      <DialogContent :class="dialog">
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle :class="dialogTitle">Take days off</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">Clients cannot book you on any of these days. Appointments already booked stay as they are.</DialogDescription>
        </DialogHeader>

        <form class="grid gap-[1rem]" @submit.prevent="saveRange">
          <div class="grid grid-cols-1 gap-[0.75rem] sm:grid-cols-2">
            <div class="grid gap-[0.4rem]">
              <Label for="range-start" class="font-semibold">First day</Label>
              <Input id="range-start" v-model="rangeForm.startDate" type="date" :min="minDate" required :class="field" />
            </div>
            <div class="grid gap-[0.4rem]">
              <Label for="range-end" class="font-semibold">Last day</Label>
              <Input id="range-end" v-model="rangeForm.endDate" type="date" :min="rangeForm.startDate || minDate" required :class="field" />
            </div>
          </div>

          <div class="grid gap-[0.4rem]">
            <Label for="range-reason" class="font-semibold">Note for yourself <span class="font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="range-reason" v-model="rangeForm.reason" maxlength="200" placeholder="For example: annual leave" :class="field" />
          </div>

          <p v-if="rangeForm.startDate && rangeForm.endDate" :role="rangeProblem ? 'alert' : undefined" class="text-[0.95rem]" :class="rangeProblem ? 'font-semibold text-destructive' : 'text-muted-foreground'">
            {{ rangeProblem ?? (rangeDays.length === 1 ? 'This takes 1 day off.' : `This takes ${rangeDays.length} days off.`) }}
          </p>

          <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
            <Button type="button" variant="line" size="pill" :disabled="createMany.isPending.value" @click="rangeOpen = false">Cancel</Button>
            <Button type="submit" variant="canopy" size="pill" :disabled="!!rangeProblem || createMany.isPending.value" :aria-busy="createMany.isPending.value">{{ createMany.isPending.value ? 'Saving…' : 'Take the days off' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- ───────── removing one ───────── -->
    <Dialog :open="pendingRemove !== null" @update:open="(open: boolean) => { if (!open && !removing) pendingRemove = null }">
      <DialogContent :class="dialog">
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle :class="dialogTitle">Remove this date?</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">
            {{ pendingRemove ? exceptionDateLabel(pendingRemove.date) : 'This date' }} goes back to your weekly hours.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
          <Button variant="line" size="pill" :disabled="removing" @click="pendingRemove = null">Keep it</Button>
          <Button variant="canopy" size="pill" :disabled="removing" :aria-busy="removing" @click="confirmRemove">{{ removing ? 'Removing…' : 'Remove the date' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>
