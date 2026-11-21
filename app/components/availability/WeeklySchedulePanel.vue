<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  DAY_NAMES,
  emptyWeek,
  openDayCount,
  presetWeek,
  sameWeek,
  schedulesToSave,
  weekFormValues,
  weekFromForm,
  weekFromSchedules,
  weekSchema,
  type WeekPreset,
} from '~/lib/availability-view'
import type { DayOfWeek } from '~/types/availability'

/**
 * The hours a lawyer can be booked each week. The whole week is one form, a
 * row per day, with one Save: a common week can be filled in to start from,
 * and nothing reaches clients until Save is pressed.
 */

// The API refuses these for a lawyer whose membership is not on; stop before anything is sent.
const { membershipBlocks } = useMembershipAccess()

const { useAvailabilitySchedule, useBulkSetSchedule, useDeleteSchedule } = useAvailability()
const { data: schedules, isPending, isError, isFetching, refetch } = useAvailabilitySchedule()
const bulkSet = useBulkSetSchedule()
const removeDay = useDeleteSchedule()

const saved = computed(() => weekFromSchedules(schedules.value))
const saving = ref(false)
const formId = useId()

const form = useForm({
  defaultValues: weekFormValues(emptyWeek()),
  validators: {
    onChange: weekSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    if (membershipBlocks('change your availability')) return
    const week = weekFromForm(weekSchema.parse(value))
    saving.value = true
    try {
      const open = schedulesToSave(week)
      if (open.length > 0) {
        // Saving the open days replaces the whole week, so days switched off go with it.
        await bulkSet.mutateAsync({ schedules: open })
      }
      else {
        // The API will not take an empty week, so each saved day is removed instead.
        for (const row of schedules.value ?? []) await removeDay.mutateAsync(row.id)
      }
      toast.success(open.length > 0 ? 'Weekly hours saved.' : 'Weekly hours saved. No days are open.')
    }
    catch (error: unknown) {
      toast.error(error instanceof Error && error.message ? error.message : 'We could not save your hours. Nothing has changed.')
    }
    finally {
      saving.value = false
    }
  },
})

const { isInvalid } = useAuthFieldInvalid(form)

/**
 * A day's problem, shown on its own line under the day rather than inside the
 * narrow time boxes: the first error on either time, once that time has been
 * left or a save was tried.
 */
const fieldMeta = form.useStore(state => state.fieldMeta)
const submissionAttempts = form.useStore(state => state.submissionAttempts)
function dayProblems(index: number) {
  for (const name of [`days[${index}].startTime`, `days[${index}].endTime`] as const) {
    const meta = fieldMeta.value[name]
    if (meta && !meta.isValid && (meta.isBlurred || submissionAttempts.value > 0)) return meta.errors
  }
  return []
}

const values = form.useStore(state => state.values)
const week = computed(() => weekFromForm(values.value))
const dirty = computed(() => !sameWeek(week.value, saved.value))

// The form follows what is saved, whenever that changes (first load, and after a save).
watch(saved, value => form.reset(weekFormValues(value)), { immediate: true })

function fill(preset: WeekPreset) {
  form.setFieldValue('days', weekFormValues(presetWeek(preset)).days)
}
function discard() {
  form.reset(weekFormValues(saved.value))
}

const sectionTitle = 'font-display text-base font-normal tracking-tight'
const panel = 'overflow-hidden rounded-card border border-border bg-card'
const pad = 'px-4.5 lg:px-5.75 xl:px-6'
const time = 'h-11 w-34 rounded-md max-sm:w-auto max-sm:min-w-0 max-sm:flex-1'
</script>

<template>
  <div v-if="isPending" role="status" aria-label="Loading your weekly hours" class="h-128 animate-pulse rounded-card bg-muted" />

  <section v-else-if="isError" :class="[panel, 'p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center']">
    <h2 :class="sectionTitle">We could not load your hours.</h2>
    <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
    <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" :aria-busy="isFetching" @click="() => refetch()">{{ isFetching ? 'Trying…' : 'Try again' }}</Button>
  </section>

  <section v-else :class="panel" aria-labelledby="weekly-title">
    <header :class="[pad, 'flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-border py-4.5']">
      <div class="min-w-0">
        <h2 id="weekly-title" :class="sectionTitle">Weekly hours</h2>
        <p class="mt-0.75 max-w-160 text-sm text-muted-foreground">Switch on the days you work and set when clients can book you.</p>
      </div>
      <div class="flex flex-none flex-wrap items-center gap-2">
        <Button v-if="dirty" type="button" variant="line" size="pill-sm" :disabled="saving" @click="discard">Discard</Button>
        <Button type="submit" :form="formId" variant="canopy" size="pill-sm" :disabled="!dirty || saving" :aria-busy="saving">{{ saving ? 'Saving…' : 'Save hours' }}</Button>
      </div>
    </header>

    <div :class="[pad, 'flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-border bg-background/60 py-3.5']">
      <p class="text-sm text-muted-foreground">Start from a common week:</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="preset in ([{ key: 'weekdays', label: 'Monday to Friday, 9 to 5' }, { key: 'weekdays-sat', label: 'Plus Saturday until 2' }] as const)"
          :key="preset.key"
          type="button"
          class="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-border bg-card px-3.75 text-sm font-medium transition-[border-color,color,scale] duration-200 ease-canopy hover:border-brand/45 hover:text-brand active:scale-97"
          @click="fill(preset.key)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <form :id="formId" novalidate @submit.prevent="form.handleSubmit">
      <ul class="divide-y divide-border">
        <li v-for="(row, index) in values.days" :key="row.day" :class="[pad, 'py-3.5']">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <form.Field v-slot="{ field }" :name="`days[${index}].enabled`">
              <Field orientation="horizontal" class="min-h-11 w-auto items-center gap-3 max-sm:flex-1 sm:w-44 sm:flex-none">
                <Switch
                  :id="`${formId}-${row.day}`"
                  :model-value="field.state.value"
                  :disabled="saving"
                  @update:model-value="(v) => field.handleChange(v === true)"
                />
                <FieldLabel :for="`${formId}-${row.day}`" class="cursor-pointer text-base font-medium" :class="row.enabled ? '' : 'text-muted-foreground'">{{ DAY_NAMES[row.day as DayOfWeek] }}</FieldLabel>
              </Field>
            </form.Field>

            <div v-if="row.enabled" class="flex min-w-0 flex-1 items-center gap-2.5 max-sm:basis-full">
              <form.Field v-slot="{ field }" :name="`days[${index}].startTime`">
                <Field class="w-auto max-sm:min-w-0 max-sm:flex-1" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" class="sr-only">{{ DAY_NAMES[row.day as DayOfWeek] }} from</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    type="time"
                    :class="[authInput, time]"
                    :aria-invalid="isInvalid(field)"
                    :disabled="saving"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                </Field>
              </form.Field>
              <span class="text-muted-foreground">to</span>
              <form.Field v-slot="{ field }" :name="`days[${index}].endTime`">
                <Field class="w-auto max-sm:min-w-0 max-sm:flex-1" :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" class="sr-only">{{ DAY_NAMES[row.day as DayOfWeek] }} until</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    type="time"
                    :class="[authInput, time]"
                    :aria-invalid="isInvalid(field)"
                    :disabled="saving"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                </Field>
              </form.Field>
            </div>
            <p v-else class="self-center text-muted-foreground max-sm:flex-none">Closed</p>
          </div>
          <FieldError v-if="row.enabled && dayProblems(index).length > 0" :errors="dayProblems(index)" class="mt-1.5 text-sm font-medium sm:pl-48" />
        </li>
      </ul>
    </form>

    <footer :class="[pad, 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border bg-background/60 py-3.75 text-sm text-muted-foreground']">
      <p>
        <template v-if="dirty">You have changes that are not saved yet.</template>
        <template v-else-if="openDayCount(week) === 0">No days are open, so clients cannot book you.</template>
        <template v-else>These hours repeat every week.</template>
      </p>
      <NuxtLink to="/dashboard/availability?tab=exceptions" class="font-medium text-brand underline-offset-4 hover:underline">A day off, or different hours on one date</NuxtLink>
    </footer>
  </section>
</template>
