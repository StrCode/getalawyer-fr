<script setup lang="ts">
import { Add01Icon, Calendar01Icon, CalendarRemove01Icon, Clock01Icon, Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import ButtonBusy from '@/components/ButtonBusy.vue'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { AvailabilityException } from '~/types/availability'
import { localDateKey } from '~/utils/date'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

useHead({
  title: 'Availability exceptions - GetALawyer',
})

const {
  useAvailabilityExceptions,
  useCreateAvailabilityException,
  useBulkCreateExceptions,
  useDeleteAvailabilityException,
} = useAvailability()

const showPast = ref(false)
const { data: exceptions, isPending, refetch } = useAvailabilityExceptions(
  computed(() => ({ futureOnly: !showPast.value })),
)

const createMutation = useCreateAvailabilityException()
const bulkCreateMutation = useBulkCreateExceptions()
const deleteMutation = useDeleteAvailabilityException()

const isAddModalOpen = ref(false)
const isVacationModalOpen = ref(false)
const pendingDelete = ref<AvailabilityException | null>(null)
// Id of the exception currently being deleted, so only that row shows a spinner.
const deletingId = computed(() => (deleteMutation.isPending.value ? deleteMutation.variables.value : null))

const exceptionForm = ref({
  date: '',
  startTime: '',
  endTime: '',
  isAvailable: false,
  reason: '',
  isAllDay: true,
})

const vacationForm = ref({
  startDate: '',
  endDate: '',
  reason: '',
})

const exceptionTypeModel = computed({
  get: () => (exceptionForm.value.isAvailable ? 'available' : 'blocked'),
  set: (value: string) => {
    exceptionForm.value.isAvailable = value === 'available'
  },
})

const resetExceptionForm = () => {
  exceptionForm.value = {
    date: '',
    startTime: '',
    endTime: '',
    isAvailable: false,
    reason: '',
    isAllDay: true,
  }
}

const resetVacationForm = () => {
  vacationForm.value = {
    startDate: '',
    endDate: '',
    reason: '',
  }
}

const handleAddException = async () => {
  const form = exceptionForm.value

  if (!form.date) {
    toast.error('Error', { description: 'Please select a date' })
    return
  }

  try {
    await createMutation.mutateAsync({
      date: form.date,
      startTime: form.isAllDay ? undefined : (form.startTime ? `${form.startTime}:00` : undefined),
      endTime: form.isAllDay ? undefined : (form.endTime ? `${form.endTime}:00` : undefined),
      isAvailable: form.isAvailable,
      reason: form.reason || undefined,
    })

    toast.success('Success', { description: 'Exception added successfully' })
    isAddModalOpen.value = false
    resetExceptionForm()
    refetch()
  }
  catch (error: any) {
    toast.error('Error', { description: error.message || 'Failed to add exception' })
  }
}

const generateDateRange = (start: string, end: string): string[] => {
  const dates: string[] = []
  // Parse as local midnight so day stepping and keys stay in local time.
  const current = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)

  while (current <= endDate) {
    const dateStr = localDateKey(current)
    if (dateStr) {
      dates.push(dateStr)
    }
    current.setDate(current.getDate() + 1)
  }

  return dates
}

const handleBlockVacation = async () => {
  const form = vacationForm.value

  if (!form.startDate || !form.endDate) {
    toast.error('Error', { description: 'Please select start and end dates' })
    return
  }

  const dates = generateDateRange(form.startDate, form.endDate)

  if (dates.length === 0) {
    toast.error('Error', { description: 'Invalid date range' })
    return
  }

  try {
    await bulkCreateMutation.mutateAsync({
      dates,
      isAvailable: false,
      reason: form.reason || 'Vacation',
    })

    toast.success('Success', { description: `${dates.length} day(s) blocked successfully` })
    isVacationModalOpen.value = false
    resetVacationForm()
    refetch()
  }
  catch (error: any) {
    toast.error('Error', { description: error.message || 'Failed to block vacation' })
  }
}

const handleDelete = (exception: AvailabilityException) => {
  pendingDelete.value = exception
}

const confirmDelete = async () => {
  const exception = pendingDelete.value
  pendingDelete.value = null
  if (!exception) return

  try {
    await deleteMutation.mutateAsync(exception.id)
    toast.success('Success', { description: 'Exception deleted successfully' })
    refetch()
  }
  catch (error: any) {
    toast.error('Error', { description: error.message || 'Failed to delete exception' })
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (timeStr: string | null) => {
  if (!timeStr) return null
  return timeStr.substring(0, 5)
}

const getExceptionTypeLabel = (exception: AvailabilityException) => {
  if (exception.startTime && exception.endTime) {
    return exception.isAvailable ? 'Special hours' : 'Time block'
  }
  return exception.isAvailable ? 'Extra availability' : 'Day off'
}

function exceptionStatusBadge(exception: AvailabilityException) {
  if (exception.isAvailable) {
    return {
      variant: 'secondary' as const,
      class: 'border-transparent bg-primary/10 text-primary',
    }
  }
  if (exception.startTime) {
    return {
      variant: 'warning' as const,
      class: '',
    }
  }
  return { variant: 'destructive' as const, class: '' }
}

const minDate = localDateKey()
</script>

<template>
  <div class="space-y-6">
    <DashboardPageHeader
      title="Availability exceptions"
      description="Override your weekly schedule for specific dates"
    >
      <template #actions>
        <Button
          variant="outline"
          as-child
        >
          <NuxtLink
            to="/dashboard/availability"
            class="gap-2"
          >
            <HugeiconsIcon :icon="Calendar01Icon" class="size-4" />
            Weekly schedule
          </NuxtLink>
        </Button>
      </template>
    </DashboardPageHeader>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <Switch
          id="show-past"
          :model-value="showPast"
          @update:model-value="showPast = $event"
        />
        <Label
          for="show-past"
          class="text-sm font-normal text-muted-foreground"
        >
          Show past exceptions
        </Label>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button
          class="gap-2"
          @click="isAddModalOpen = true"
        >
          <HugeiconsIcon :icon="Add01Icon" class="size-4" />
          Add exception
        </Button>
        <Button
          variant="outline"
          class="gap-2"
          @click="isVacationModalOpen = true"
        >
          <HugeiconsIcon :icon="CalendarRemove01Icon" class="size-4" />
          Block vacation
        </Button>
      </div>
    </div>

    <div
      v-if="isPending"
      class="space-y-3"
      aria-busy="true"
      aria-label="Loading exceptions"
    >
      <Skeleton
        v-for="i in 4"
        :key="i"
        class="h-20 w-full rounded-xl"
      />
    </div>

    <EmptyState
      v-else-if="!exceptions || exceptions.length === 0"
      :icon="Calendar01Icon"
      title="No exceptions yet"
      description="Add exceptions to override your weekly schedule for specific dates"
    >
      <template #actions>
        <Button @click="isAddModalOpen = true">
          Add first exception
        </Button>
      </template>
    </EmptyState>

    <div
      v-else
      class="space-y-4"
    >
      <Card
        v-for="exception in exceptions"
        :key="exception.id"
        
      >
        <CardContent class="flex items-start justify-between gap-4 pt-6">
          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-3">
             <h3 class="text-lg font-semibold text-foreground">
                {{ formatDate(exception.date) }}
              </h3>
              <Badge v-bind="exceptionStatusBadge(exception)">
                {{ getExceptionTypeLabel(exception) }}
              </Badge>
            </div>

            <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div
                v-if="exception.startTime && exception.endTime"
                class="flex items-center gap-2"
              >
                <HugeiconsIcon :icon="Clock01Icon" class="size-4" />
                <span>{{ formatTime(exception.startTime) }} – {{ formatTime(exception.endTime) }}</span>
              </div>
              <div
                v-else
                class="flex items-center gap-2"
              >
                <HugeiconsIcon :icon="CalendarRemove01Icon" class="size-4" />
                <span>All day</span>
              </div>
            </div>

            <p
              v-if="exception.reason"
              class="text-sm text-muted-foreground"
            >
              {{ exception.reason }}
            </p>
          </div>

          <ButtonBusy
            variant="ghost"
            size="icon"
            class="text-destructive hover:text-destructive"
            :loading="deletingId === exception.id"
            aria-label="Delete exception"
            @click="handleDelete(exception)"
          >
            <HugeiconsIcon :icon="Delete01Icon" class="size-4" />
          </ButtonBusy>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="isAddModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add exception</DialogTitle>
        </DialogHeader>
        <FieldGroup class="space-y-4">
          <Field>
            <FieldLabel for="ex-date">
              Date
            </FieldLabel>
            <Input
              id="ex-date"
              v-model="exceptionForm.date"
              type="date"
              :min="minDate"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Type</FieldLabel>
            <RadioGroup
              v-model="exceptionTypeModel"
              class="grid gap-2"
            >
              <div class="flex items-center gap-2">
                <RadioGroupItem
                  id="ex-blocked"
                  value="blocked"
                />
                <Label for="ex-blocked">
                  Block time (unavailable)
                </Label>
              </div>
              <div class="flex items-center gap-2">
                <RadioGroupItem
                  id="ex-available"
                  value="available"
                />
                <Label for="ex-available">
                  Add special availability
                </Label>
              </div>
            </RadioGroup>
          </Field>

          <Field>
            <div class="flex items-center gap-3">
              <Switch
                id="ex-all-day"
                :model-value="exceptionForm.isAllDay"
                @update:model-value="exceptionForm.isAllDay = $event"
              />
              <FieldLabel
                for="ex-all-day"
                class="font-normal"
              >
                All day
              </FieldLabel>
            </div>
          </Field>

          <div
            v-if="!exceptionForm.isAllDay"
            class="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <Field>
              <FieldLabel for="ex-start">
                Start time
              </FieldLabel>
              <Input
                id="ex-start"
                v-model="exceptionForm.startTime"
                type="time"
                required
              />
            </Field>
            <Field>
              <FieldLabel for="ex-end">
                End time
              </FieldLabel>
              <Input
                id="ex-end"
                v-model="exceptionForm.endTime"
                type="time"
                required
              />
            </Field>
          </div>

          <Field>
            <FieldLabel for="ex-reason">
              Reason (optional)
            </FieldLabel>
            <Textarea
              id="ex-reason"
              v-model="exceptionForm.reason"
              placeholder="e.g., Lunch meeting, Court appearance"
              :rows="3"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            variant="outline"
            @click="isAddModalOpen = false"
          >
            Cancel
          </Button>
          <ButtonBusy
            :loading="createMutation.isPending.value"
            @click="handleAddException"
          >
            Add exception
          </ButtonBusy>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isVacationModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Block vacation period</DialogTitle>
        </DialogHeader>
        <FieldGroup class="space-y-4">
          <Field>
            <FieldLabel for="vac-start">
              Start date
            </FieldLabel>
            <Input
              id="vac-start"
              v-model="vacationForm.startDate"
              type="date"
              :min="minDate"
              required
            />
          </Field>
          <Field>
            <FieldLabel for="vac-end">
              End date
            </FieldLabel>
            <Input
              id="vac-end"
              v-model="vacationForm.endDate"
              type="date"
              :min="vacationForm.startDate || minDate"
              required
            />
          </Field>
          <Field>
            <FieldLabel for="vac-reason">
              Reason (optional)
            </FieldLabel>
            <Input
              id="vac-reason"
              v-model="vacationForm.reason"
              placeholder="e.g., Summer vacation, Conference"
            />
          </Field>
          <div
            v-if="vacationForm.startDate && vacationForm.endDate"
            class="rounded-lg border border-foreground/15 bg-background p-4"
          >
            <p class="text-sm text-foreground">
              This will block {{ generateDateRange(vacationForm.startDate, vacationForm.endDate).length }} day(s)
            </p>
          </div>
        </FieldGroup>
        <DialogFooter>
          <Button
            variant="outline"
            @click="isVacationModalOpen = false"
          >
            Cancel
          </Button>
          <ButtonBusy
            variant="destructive"
            :loading="bulkCreateMutation.isPending.value"
            @click="handleBlockVacation"
          >
            Block dates
          </ButtonBusy>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog
      :open="pendingDelete !== null"
      @update:open="(open) => { if (!open) pendingDelete = null }"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this exception?</AlertDialogTitle>
          <AlertDialogDescription>
            {{ pendingDelete ? formatDate(pendingDelete.date) : '' }} will fall back to your weekly schedule. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
