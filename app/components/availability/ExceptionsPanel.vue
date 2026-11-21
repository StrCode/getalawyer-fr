<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  blankDateForm,
  blankRangeForm,
  dateFormPayload,
  dateFormSchema,
  dateKeysBetween,
  EXCEPTION_PILL,
  exceptionDateLabel,
  exceptionHours,
  exceptionKind,
  rangeFormPayload,
  rangeFormSchema,
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
const dateFormId = useId()
const rangeFormId = useId()

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

// ───────── one date ─────────
const dateOpen = ref(false)

const dateForm = useForm({
  defaultValues: blankDateForm(),
  validators: {
    onChange: dateFormSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    if (membershipBlocks('change your availability')) return
    const payload = dateFormPayload(dateFormSchema.parse(value))
    try {
      await createOne.mutateAsync(payload)
      toast.success(`${exceptionDateLabel(payload.date)} added.`)
      dateOpen.value = false
    }
    catch (error: unknown) {
      toast.error(messageOf(error, 'We could not add that date. Nothing has changed.'))
    }
  },
})
const { isInvalid: dateInvalid } = useAuthFieldInvalid(dateForm)
const allDay = dateForm.useStore(state => state.values.allDay)

function openDate() {
  if (membershipBlocks('change your availability')) return
  dateForm.reset(blankDateForm())
  dateOpen.value = true
}

// ───────── a run of days off ─────────
const rangeOpen = ref(false)

const rangeForm = useForm({
  defaultValues: blankRangeForm(),
  validators: {
    onChange: rangeFormSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    if (membershipBlocks('change your availability')) return
    const payload = rangeFormPayload(rangeFormSchema.parse(value))
    const count = payload.dates.length
    try {
      await createMany.mutateAsync(payload)
      toast.success(count === 1 ? '1 day taken off.' : `${count} days taken off.`)
      rangeOpen.value = false
    }
    catch (error: unknown) {
      toast.error(messageOf(error, 'We could not take those days off. Nothing has changed.'))
    }
  },
})
const { isInvalid: rangeInvalid } = useAuthFieldInvalid(rangeForm)
const rangeValues = rangeForm.useStore(state => state.values)
const rangeDays = computed(() => dateKeysBetween(rangeValues.value.startDate, rangeValues.value.endDate).length)

function openRange() {
  if (membershipBlocks('change your availability')) return
  rangeForm.reset(blankRangeForm())
  rangeOpen.value = true
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
const dialog = 'gap-0 overflow-hidden rounded-[1.75rem] border-border bg-card p-0 sm:max-w-[32rem]'
const dialogHead = 'gap-[0.4rem] border-b border-border px-[clamp(1.2rem,4vw,1.75rem)] py-[1.1rem] text-left'
const dialogTitle = 'font-display text-[1.5rem] leading-[1.1] font-[650] tracking-[-0.03em]'
const dialogBody = 'max-h-[min(62svh,34rem)] overflow-y-auto px-[clamp(1.2rem,4vw,1.75rem)] py-[1.2rem]'
const dialogFoot = 'gap-[0.6rem] border-t border-border px-[clamp(1.2rem,4vw,1.75rem)] py-[1rem]'
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
        <DialogHeader :class="dialogHead">
          <DialogTitle :class="dialogTitle">Add a date</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">On this date, this replaces your weekly hours.</DialogDescription>
        </DialogHeader>

        <div :class="dialogBody">
          <form :id="dateFormId" novalidate @submit.prevent="dateForm.handleSubmit">
            <FieldGroup class="gap-[1.1rem]">
              <dateForm.Field v-slot="{ field }" name="date">
                <Field :class="canopyField" :data-invalid="dateInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">Date</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :class="authInput"
                    type="date"
                    :min="minDate"
                    :aria-invalid="dateInvalid(field)"
                    :disabled="createOne.isPending.value"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                  <FieldError v-if="dateInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </dateForm.Field>

              <dateForm.Field v-slot="{ field }" name="available">
                <FieldSet :class="canopyField">
                  <FieldLegend variant="label" :class="canopyLabel">On this date I am</FieldLegend>
                  <RadioGroup
                    :name="field.name"
                    :model-value="field.state.value ? 'open' : 'off'"
                    :disabled="createOne.isPending.value"
                    class="grid grid-cols-2 gap-[0.5rem]"
                    @update:model-value="(v) => {
                      field.handleChange(v === 'open')
                      field.handleBlur()
                    }"
                  >
                    <FieldLabel v-for="option in [{ value: 'off', label: 'Not available' }, { value: 'open', label: 'Available' }]" :key="option.value" :for="`${dateFormId}-${option.value}`" :class="[canopyChoice, 'items-center']">
                      <Field orientation="horizontal" class="items-center">
                        <RadioGroupItem :id="`${dateFormId}-${option.value}`" :value="option.value" />
                        <span class="text-[0.95rem] font-semibold">{{ option.label }}</span>
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                </FieldSet>
              </dateForm.Field>

              <dateForm.Field v-slot="{ field }" name="allDay">
                <Field orientation="horizontal" class="items-center gap-[0.8rem]">
                  <Switch
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :disabled="createOne.isPending.value"
                    @update:model-value="(v) => field.handleChange(v === true)"
                  />
                  <FieldContent class="gap-0">
                    <FieldLabel :for="field.name" class="font-semibold">All day</FieldLabel>
                  </FieldContent>
                </Field>
              </dateForm.Field>

              <div v-if="!allDay" class="grid grid-cols-2 gap-[0.75rem]">
                <dateForm.Field v-slot="{ field }" name="startTime">
                  <Field :class="canopyField" :data-invalid="dateInvalid(field)">
                    <FieldLabel :for="field.name" :class="canopyLabel">From</FieldLabel>
                    <Input
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      :class="authInput"
                      type="time"
                      :aria-invalid="dateInvalid(field)"
                      :disabled="createOne.isPending.value"
                      @blur="field.handleBlur"
                      @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                    />
                    <FieldError v-if="dateInvalid(field)" :errors="field.state.meta.errors" />
                  </Field>
                </dateForm.Field>
                <dateForm.Field v-slot="{ field }" name="endTime">
                  <Field :class="canopyField" :data-invalid="dateInvalid(field)">
                    <FieldLabel :for="field.name" :class="canopyLabel">Until</FieldLabel>
                    <Input
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      :class="authInput"
                      type="time"
                      :aria-invalid="dateInvalid(field)"
                      :disabled="createOne.isPending.value"
                      @blur="field.handleBlur"
                      @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                    />
                    <FieldError v-if="dateInvalid(field)" :errors="field.state.meta.errors" />
                  </Field>
                </dateForm.Field>
              </div>

              <dateForm.Field v-slot="{ field }" name="reason">
                <Field :class="canopyField" :data-invalid="dateInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">
                    Note for yourself
                    <span class="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :class="authInput"
                    maxlength="200"
                    placeholder="For example: in court"
                    :aria-invalid="dateInvalid(field)"
                    :disabled="createOne.isPending.value"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                  <FieldError v-if="dateInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </dateForm.Field>
            </FieldGroup>
          </form>
        </div>

        <DialogFooter :class="dialogFoot">
          <Button type="button" variant="line" size="pill" :disabled="createOne.isPending.value" @click="dateOpen = false">Cancel</Button>
          <Button type="submit" :form="dateFormId" variant="canopy" size="pill" :disabled="createOne.isPending.value" :aria-busy="createOne.isPending.value">{{ createOne.isPending.value ? 'Adding…' : 'Add the date' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ───────── a run of days off ───────── -->
    <Dialog v-model:open="rangeOpen">
      <DialogContent :class="dialog">
        <DialogHeader :class="dialogHead">
          <DialogTitle :class="dialogTitle">Take days off</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">Clients cannot book you on any of these days. Appointments already booked stay as they are.</DialogDescription>
        </DialogHeader>

        <div :class="dialogBody">
          <form :id="rangeFormId" novalidate @submit.prevent="rangeForm.handleSubmit">
            <FieldGroup class="gap-[1.1rem]">
              <div class="grid grid-cols-1 gap-[0.75rem] sm:grid-cols-2">
                <rangeForm.Field v-slot="{ field }" name="startDate">
                  <Field :class="canopyField" :data-invalid="rangeInvalid(field)">
                    <FieldLabel :for="field.name" :class="canopyLabel">First day</FieldLabel>
                    <Input
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      :class="authInput"
                      type="date"
                      :min="minDate"
                      :aria-invalid="rangeInvalid(field)"
                      :disabled="createMany.isPending.value"
                      @blur="field.handleBlur"
                      @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                    />
                    <FieldError v-if="rangeInvalid(field)" :errors="field.state.meta.errors" />
                  </Field>
                </rangeForm.Field>
                <rangeForm.Field v-slot="{ field }" name="endDate">
                  <Field :class="canopyField" :data-invalid="rangeInvalid(field)">
                    <FieldLabel :for="field.name" :class="canopyLabel">Last day</FieldLabel>
                    <Input
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      :class="authInput"
                      type="date"
                      :min="rangeValues.startDate || minDate"
                      :aria-invalid="rangeInvalid(field)"
                      :disabled="createMany.isPending.value"
                      @blur="field.handleBlur"
                      @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                    />
                    <FieldError v-if="rangeInvalid(field)" :errors="field.state.meta.errors" />
                  </Field>
                </rangeForm.Field>
              </div>

              <rangeForm.Field v-slot="{ field }" name="reason">
                <Field :class="canopyField" :data-invalid="rangeInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">
                    Note for yourself
                    <span class="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :class="authInput"
                    maxlength="200"
                    placeholder="For example: annual leave"
                    :aria-invalid="rangeInvalid(field)"
                    :disabled="createMany.isPending.value"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                  <FieldError v-if="rangeInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </rangeForm.Field>

              <FieldDescription v-if="rangeDays > 0" :class="canopyHint">
                {{ rangeDays === 1 ? 'This takes 1 day off.' : `This takes ${rangeDays} days off.` }}
              </FieldDescription>
            </FieldGroup>
          </form>
        </div>

        <DialogFooter :class="dialogFoot">
          <Button type="button" variant="line" size="pill" :disabled="createMany.isPending.value" @click="rangeOpen = false">Cancel</Button>
          <Button type="submit" :form="rangeFormId" variant="canopy" size="pill" :disabled="createMany.isPending.value" :aria-busy="createMany.isPending.value">{{ createMany.isPending.value ? 'Saving…' : 'Take the days off' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ───────── removing one ───────── -->
    <Dialog :open="pendingRemove !== null" @update:open="(open: boolean) => { if (!open && !removing) pendingRemove = null }">
      <DialogContent class="gap-[1.1rem] rounded-[1.75rem] border-border bg-card p-[clamp(1.4rem,4vw,2rem)] sm:max-w-[30rem]">
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
