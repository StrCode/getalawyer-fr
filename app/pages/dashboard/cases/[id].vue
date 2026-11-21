<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  blankTask,
  CASE_PRIORITIES,
  caseEditPayload,
  caseEditSchema,
  caseEditValues,
  caseMessageSchema,
  caseMoveSchema,
  caseTaskPayload,
  caseTaskSchema,
  PRIORITY_LABEL,
} from '~/lib/case-forms'
import { ApiError } from '~/lib/api/client'
import {
  agoLabel,
  CASE_MESSAGE_MAX,
  CASE_PILL,
  caseTabOf,
  dayLabel,
  dueLine,
  feeLine,
  messageTime,
  nameOf,
  otherParty,
  priorityPill,
  sortTasks,
  statusMoves,
  taskSummary,
  type CaseTaskRow,
  type StatusMove,
} from '~/lib/case-view'
import { initials } from '~/lib/client-overview'
import { getSessionUserType } from '~/lib/session-user'

/**
 * One case: what it is about, who it is between, the fee agreed, and its
 * three working parts: messages, the tasks each side has, and a log.
 *
 * The lawyer runs the case (edits it, closes or reopens it, sets tasks). The
 * client reads it, writes messages and ticks their tasks off. Wording and
 * rules are in `lib/case-view`; the calls are in `useCaseWork`.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

const route = useRoute()
const caseId = computed(() => String(route.params.id ?? ''))
const { session } = useAuth()
const me = computed(() => session.value?.user.id ?? null)
const role = computed(() => getSessionUserType(session.value?.user))
const isLawyer = computed(() => role.value === 'lawyer')

const { data: file, isPending, error, refetch, isFetching } = useCaseFile(caseId)
const missing = computed(() => error.value instanceof ApiError && (error.value.status === 404 || error.value.status === 403))
const item = computed(() => file.value?.case ?? null)
const other = computed(() => item.value ? otherParty(item.value, role.value) : null)

useHead({ title: () => item.value?.caseTitle ?? 'Case' })

// The time is read in the browser only, so "today" is the reader's own day.
const now = ref<Date | null>(null)
onMounted(() => { now.value = new Date() })
const loading = computed(() => !now.value || isPending.value)

const open = computed(() => item.value ? caseTabOf(item.value.status) === 'open' : false)
const due = computed(() => item.value && now.value ? dueLine(item.value.dueDate, now.value, !open.value) : null)
const fee = computed(() => item.value ? feeLine(item.value.agreedFee, item.value.feeStructure) : null)

const { save, setStatus, send, addTask, completeTask, reopenTask, deleteTask } = useCaseActions(caseId)
const fail = (title: string) => (problem: Error) => {
  toast.error(title, { description: problem.message || 'Something went wrong. Try again.' })
}

// ───────── the three parts ─────────
type Part = 'messages' | 'tasks' | 'log'
const part = ref<Part>('messages')
const tasks = computed(() => sortTasks(file.value?.tasks ?? []))
const openTasks = computed(() => tasks.value.filter(task => task.status !== 'completed').length)
const PARTS = computed(() => [
  { key: 'messages' as const, label: 'Messages', count: 0 },
  { key: 'tasks' as const, label: 'Tasks', count: openTasks.value },
  { key: 'log' as const, label: 'Activity', count: 0 },
])

// ───────── messages ─────────
// Loaded only while the thread is on screen: loading them marks the other person's as read.
const { data: messages, isPending: threadPending, isError: threadFailed } = useCaseThread(caseId, { enabled: computed(() => part.value === 'messages' && Boolean(item.value)) })
const thread = ref<HTMLElement | null>(null)

function toEnd() {
  void nextTick(() => { thread.value?.scrollTo({ top: thread.value.scrollHeight }) })
}
watch(() => messages.value?.length, toEnd)

const messageForm = useForm({
  defaultValues: { text: '' },
  validators: {
    onSubmit: caseMessageSchema,
  },
  onSubmit: async ({ value }) => {
    if (send.isPending.value) return
    try {
      await send.mutateAsync(caseMessageSchema.parse(value).text)
      messageForm.reset({ text: '' })
    }
    catch (problem) {
      fail('Message not sent')(problem as Error)
    }
  },
})
const draft = messageForm.useStore(state => state.values.text)

// ───────── tasks ─────────
const taskOpen = ref(false)
const taskFormId = useId()
const taskForm = useForm({
  defaultValues: blankTask(''),
  validators: {
    onChange: caseTaskSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    try {
      await addTask.mutateAsync(caseTaskPayload(caseTaskSchema.parse(value)))
      toast.success('Task added')
      taskOpen.value = false
    }
    catch (problem) {
      fail('Task not added')(problem as Error)
    }
  },
})
const { isInvalid: taskInvalid } = useAuthFieldInvalid(taskForm)

function startTask() {
  // A task is usually something the client has to do.
  taskForm.reset(blankTask(item.value?.client?.userId ?? me.value ?? ''))
  taskOpen.value = true
}

const taskPeople = computed(() => [
  { id: item.value?.client?.userId ?? '', name: item.value?.client?.name ?? 'The client' },
  { id: me.value ?? '', name: 'Me' },
])

const busyTask = ref<string | null>(null)
function toggleTask(row: CaseTaskRow) {
  if (busyTask.value) return
  // Either side ticks a task off; only the lawyer can put one back.
  if (row.status === 'completed' && !isLawyer.value) return
  busyTask.value = row.id
  const done = () => { busyTask.value = null }
  if (row.status === 'completed') reopenTask.mutate(row.id, { onError: fail('Task not changed'), onSettled: done })
  else completeTask.mutate(row.id, { onError: fail('Task not changed'), onSettled: done })
}

function removeTask(row: CaseTaskRow) {
  if (busyTask.value) return
  busyTask.value = row.id
  deleteTask.mutate(row.id, {
    onSuccess: () => toast.success('Task removed'),
    onError: fail('Task not removed'),
    onSettled: () => { busyTask.value = null },
  })
}

// ───────── editing the case ─────────
const editOpen = ref(false)
const editFormId = useId()
const editForm = useForm({
  defaultValues: caseEditValues(null),
  validators: {
    onChange: caseEditSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    try {
      // Priority and the due date are the lawyer's to set; the client's route does not take them.
      await save.mutateAsync(caseEditPayload(caseEditSchema.parse(value), isLawyer.value))
      toast.success('Case updated')
      editOpen.value = false
    }
    catch (problem) {
      fail('Case not updated')(problem as Error)
    }
  },
})
const { isInvalid: editInvalid } = useAuthFieldInvalid(editForm)

function startEdit() {
  if (!item.value) return
  editForm.reset(caseEditValues(item.value))
  editOpen.value = true
}

// ───────── closing, reopening, archiving (the lawyer's) ─────────
const moves = computed(() => item.value && isLawyer.value ? statusMoves(item.value.status) : [])
const move = ref<StatusMove | null>(null)
const moveOpen = ref(false)
const moveFormId = useId()
const moveForm = useForm({
  defaultValues: { reason: '' },
  validators: {
    onChange: caseMoveSchema,
  },
  onSubmit: async ({ value }) => {
    if (!move.value) return
    const chosen = move.value
    try {
      await setStatus.mutateAsync({ status: chosen.to, reason: caseMoveSchema.parse(value).reason || undefined })
      toast.success(chosen.done)
      moveOpen.value = false
    }
    catch (problem) {
      fail('Case not changed')(problem as Error)
    }
  },
})
const { isInvalid: moveInvalid } = useAuthFieldInvalid(moveForm)

function startMove(chosen: StatusMove) {
  move.value = chosen
  moveForm.reset({ reason: '' })
  moveOpen.value = true
}

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-base font-normal tracking-tight'
const panel = 'rounded-card border border-border bg-card'
const pill = 'rounded-full px-2.75 py-0.5 text-xs font-medium tracking-normal whitespace-nowrap normal-case'
const quiet = 'shadow-none hover:translate-y-0'
const dialog = 'gap-0 overflow-hidden rounded-2xl border-border bg-card p-0 sm:max-w-128'
const dialogHead = 'gap-1.5 border-b border-border px-4.75 md:px-7 py-4.5 text-left'
const dialogBody = 'max-h-[min(62svh,34rem)] overflow-y-auto px-4.75 md:px-7 py-4.75'
const dialogFoot = 'gap-2.5 border-t border-border px-4.75 md:px-7 py-4'
const dialogTitle = 'font-display text-xl leading-none font-normal tracking-tight'
</script>

<template>
  <div class="mx-auto grid w-full max-w-248 grid-cols-1 gap-4 lg:gap-5 xl:gap-6">
    <NuxtLink
      to="/dashboard/cases"
      class="inline-flex min-h-11 w-fit items-center gap-2 rounded-full pr-2.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <CanopyGlyph name="arrow" :size="17" class="rotate-180" />Cases
    </NuxtLink>

    <!-- ───────── loading / not found / could not load ───────── -->
    <LoadingDetail v-if="loading && !error" label="Loading the case" :side="false" />

    <section v-else-if="missing" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 class="font-display text-xl leading-none font-normal tracking-tight">There is no case here.</h1>
      <p class="mt-2 text-muted-foreground">It may have been removed, or the link is not one of yours.</p>
      <Button as-child variant="canopy" size="pill" class="mt-5"><NuxtLink to="/dashboard/cases">Back to cases</NuxtLink></Button>
    </section>

    <section v-else-if="!item" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
      <h1 class="font-display text-xl leading-none font-normal tracking-tight">We could not load this case.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" @click="() => refetch()">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── what the case is, who it is between, the fee ───────── -->
      <section
        aria-labelledby="case-title"
        class="flex flex-wrap items-start gap-x-6 md:gap-x-7.75 lg:gap-x-10.25 xl:gap-x-12 gap-y-6 rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-11 max-sm:rounded-2xl"
      >
        <div class="min-w-0 grow-999 basis-88">
          <p class="flex flex-wrap items-center gap-x-2.75 gap-y-1 text-xs font-medium tracking-widest text-brand uppercase">
            Case · {{ item.caseNumber }}
            <span :class="[pill, CASE_PILL[item.status].class]">{{ CASE_PILL[item.status].label }}</span>
            <span v-if="priorityPill(item.priority)" :class="[pill, 'bg-warning/15 text-warning-subtle-foreground']">{{ priorityPill(item.priority) }}</span>
          </p>
          <h1 id="case-title" class="mt-3.25 text-2xl md:text-3xl leading-none font-normal tracking-tight text-balance">{{ item.caseTitle }}</h1>

          <p class="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span aria-hidden="true" class="grid size-8.75 flex-none place-items-center overflow-hidden rounded-md bg-mint font-display text-sm font-medium text-deep">
              <img v-if="other?.image" :src="other.image" alt="" class="size-full object-cover">
              <template v-else>{{ initials(other?.name) || '·' }}</template>
            </span>
            <span><span class="text-muted-foreground">{{ isLawyer ? 'For' : 'With' }}</span> <b class="font-medium">{{ other?.name ?? (isLawyer ? 'a client' : 'your lawyer') }}</b></span>
          </p>
          <p class="mt-2 text-sm text-muted-foreground">
            Opened {{ dayLabel(item.startDate ?? item.createdAt) ?? agoLabel(item.createdAt, now!) }}<template v-if="due">
              · <span :class="due.overdue ? 'font-medium text-destructive' : ''">{{ due.text }}</span>
            </template>
          </p>
          <p v-if="item.description" class="mt-3.5 max-w-160 whitespace-pre-line">{{ item.description }}</p>

          <div class="mt-5.25 flex flex-wrap gap-2.25">
            <Button variant="line" size="pill" @click="startEdit">{{ isLawyer ? 'Edit the case' : 'Edit the title or description' }}</Button>
            <Button v-for="option in moves" :key="option.to" variant="line" size="pill" @click="startMove(option)">{{ option.label }}</Button>
          </div>
        </div>

        <div v-if="fee || item.paymentNotes" class="min-w-0 grow basis-68 rounded-card bg-mint p-5 text-deep">
          <h2 class="flex items-center gap-2 font-display text-lg font-normal tracking-tight"><CanopyGlyph name="card" :size="19" />Agreed fee</h2>
          <p v-if="fee" class="mt-2 font-display text-xl leading-tight font-normal tracking-tight">{{ fee }}</p>
          <p v-if="item.paymentNotes" class="mt-2 whitespace-pre-line">{{ item.paymentNotes }}</p>
          <p class="mt-2.75 text-sm opacity-80">As recorded when the case opened. Payment for the work is between you and {{ isLawyer ? 'your client' : 'your lawyer' }}.</p>
        </div>
      </section>

      <!-- ───────── messages, tasks, activity ───────── -->
      <div role="group" aria-label="Part of the case" class="-mx-1 flex max-w-[calc(100%+0.5rem)] min-w-0 gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
        <button
          v-for="entry in PARTS"
          :key="entry.key"
          type="button"
          :aria-pressed="part === entry.key"
          class="inline-flex min-h-11 flex-none cursor-pointer items-center gap-1.75 rounded-full border px-4 font-medium whitespace-nowrap transition-colors duration-200 ease-canopy"
          :class="part === entry.key ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground'"
          @click="part = entry.key"
        >
          {{ entry.label }}
          <span v-if="entry.count > 0" class="rounded-full px-1.75 text-xs font-medium" :class="part === entry.key ? 'bg-white/20' : 'bg-muted text-foreground'">{{ entry.count }}</span>
        </button>
      </div>

      <!-- messages -->
      <section v-if="part === 'messages'" aria-labelledby="messages-title" :class="[panel, 'flex flex-col overflow-hidden']">
        <h2 id="messages-title" :class="[sectionTitle, 'px-4.5 lg:px-5.75 xl:px-6 pt-4.75']">Messages about this case</h2>
        <div ref="thread" class="max-h-112 min-h-40 overflow-y-auto px-4.5 lg:px-5.75 xl:px-6 py-4" aria-live="polite">
          <LoadingRegion v-if="threadPending" label="Loading messages" class="grid grid-cols-1 gap-2.5">
            <Skeleton class="h-11 w-3/5 rounded-lg rounded-bl-sm" />
            <Skeleton class="ml-auto h-11 w-1/2 rounded-lg rounded-br-sm" />
            <Skeleton class="h-11 w-2/5 rounded-lg rounded-bl-sm" />
          </LoadingRegion>
          <p v-else-if="threadFailed" class="text-muted-foreground">We could not load the messages. They will be tried again shortly.</p>
          <p v-else-if="!messages?.length" class="text-muted-foreground">No messages on this case yet. Write the first one below.</p>
          <ol v-else class="grid gap-2.5">
            <li v-for="message in messages" :key="message.id" class="flex" :class="message.senderId === me ? 'justify-end' : 'justify-start'">
              <div class="max-w-[min(34rem,85%)]">
                <p class="whitespace-pre-line rounded-lg px-3.5 py-2.5" :class="message.senderId === me ? 'rounded-br-sm bg-forest text-white' : 'rounded-bl-sm bg-muted'">{{ message.messageContent }}</p>
                <p class="mt-0.75 text-xs text-muted-foreground" :class="message.senderId === me ? 'text-right' : ''">
                  {{ nameOf(message.senderId, item, me) }} · {{ messageTime(message.createdAt, now!) }}
                </p>
              </div>
            </li>
          </ol>
        </div>
        <form novalidate class="flex flex-wrap items-end gap-2.5 border-t border-border p-3.5 md:p-3.75 lg:p-4.75" @submit.prevent="messageForm.handleSubmit">
          <messageForm.Field v-slot="{ field }" name="text">
            <Field class="min-w-0 grow basis-64">
              <FieldLabel :for="field.name" class="sr-only">Write a message</FieldLabel>
              <Textarea
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                rows="2"
                :maxlength="CASE_MESSAGE_MAX"
                :placeholder="`Write to ${other?.name?.split(' ')[0] ?? (isLawyer ? 'your client' : 'your lawyer')} about this case`"
                :class="[canopyTextarea, 'min-h-12']"
                :disabled="send.isPending.value"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                @keydown.enter.exact.prevent="messageForm.handleSubmit()"
              />
            </Field>
          </messageForm.Field>
          <Button type="submit" variant="canopy" size="pill" :class="quiet" :disabled="!draft.trim() || send.isPending.value" :aria-busy="send.isPending.value">
            {{ send.isPending.value ? 'Sending…' : 'Send' }}
          </Button>
        </form>
      </section>

      <!-- tasks -->
      <section v-else-if="part === 'tasks'" aria-labelledby="tasks-title" :class="[panel, 'p-4.5 lg:p-5.75 xl:p-6']">
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div>
            <h2 id="tasks-title" :class="sectionTitle">Tasks</h2>
            <p class="text-sm text-muted-foreground">{{ taskSummary(tasks) }}</p>
          </div>
          <Button v-if="isLawyer" variant="canopy" size="pill-sm" :class="quiet" @click="startTask">Add a task</Button>
        </div>

        <p v-if="tasks.length === 0" class="mt-3.5 text-muted-foreground">
          {{ isLawyer ? 'Use tasks for what each of you has to do next: a document to send, a form to sign, a filing to make.' : 'Your lawyer will add what each of you has to do next. You can tick yours off here.' }}
        </p>

        <ul v-else class="mt-3.5 divide-y divide-border">
          <li v-for="row in tasks" :key="row.id" class="flex flex-wrap items-start gap-x-3.25 gap-y-1.5 py-3.25">
            <button
              type="button"
              role="checkbox"
              :aria-checked="row.status === 'completed'"
              :aria-label="row.status === 'completed' ? `Put back: ${row.taskTitle}` : `Mark done: ${row.taskTitle}`"
              :disabled="busyTask === row.id || (row.status === 'completed' && !isLawyer)"
              class="mt-0.5 grid size-7 flex-none cursor-pointer place-items-center rounded-lg border-2 transition-colors duration-200 disabled:cursor-default"
              :class="row.status === 'completed' ? 'border-brand bg-brand text-white dark:text-night' : 'border-border bg-card hover:border-brand'"
              @click="toggleTask(row)"
            >
              <CanopyGlyph v-if="row.status === 'completed'" name="tick" :size="15" :stroke="3" />
            </button>
            <div class="min-w-0 grow basis-56">
              <b class="block font-medium" :class="row.status === 'completed' ? 'text-muted-foreground line-through' : ''">{{ row.taskTitle }}</b>
              <p v-if="row.taskDescription" class="mt-0.5 whitespace-pre-line text-sm text-muted-foreground">{{ row.taskDescription }}</p>
              <p class="mt-0.5 text-sm text-muted-foreground">
                For {{ nameOf(row.assignedTo, item, me).replace(/^You$/, 'you') }}<template v-if="row.status === 'completed'"> · Done {{ agoLabel(row.completedAt, now!) }}</template><template v-else-if="dueLine(row.dueDate, now!)">
                  · <span :class="dueLine(row.dueDate, now!)?.overdue ? 'font-medium text-destructive' : ''">{{ dueLine(row.dueDate, now!)?.text }}</span>
                </template>
              </p>
            </div>
            <Button v-if="isLawyer" variant="line" size="pill-sm" :disabled="busyTask === row.id" :aria-label="`Remove the task: ${row.taskTitle}`" @click="removeTask(row)">Remove</Button>
          </li>
        </ul>
      </section>

      <!-- activity -->
      <section v-else aria-labelledby="log-title" :class="[panel, 'p-4.5 lg:p-5.75 xl:p-6']">
        <h2 id="log-title" :class="sectionTitle">Activity</h2>
        <p class="text-sm text-muted-foreground">What has happened on this case, most recent first.</p>
        <p v-if="!file?.activities.length" class="mt-3.5 text-muted-foreground">Nothing recorded yet.</p>
        <ol v-else class="mt-3.5 grid gap-2.75">
          <li v-for="entry in file.activities" :key="entry.id" class="grid grid-cols-[0.6rem_minmax(0,1fr)] gap-x-3.25">
            <span aria-hidden="true" class="mt-2.25 size-2.5 rounded-full bg-brand" />
            <div class="min-w-0">
              <p>{{ entry.description }}</p>
              <p class="text-sm text-muted-foreground">{{ nameOf(entry.performedBy, item, me) }} · {{ agoLabel(entry.createdAt, now!) }}</p>
            </div>
          </li>
        </ol>
      </section>
    </template>

    <!-- ───────── edit the case ───────── -->
    <Dialog v-model:open="editOpen">
      <DialogContent :class="dialog">
        <DialogHeader :class="dialogHead">
          <DialogTitle :class="dialogTitle">{{ isLawyer ? 'Edit the case' : 'Edit the title or description' }}</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">{{ other?.name ?? 'The other person' }} sees the same title and description.</DialogDescription>
        </DialogHeader>
        <div :class="dialogBody">
          <form :id="editFormId" novalidate @submit.prevent="editForm.handleSubmit">
            <FieldGroup class="gap-4.5">
              <editForm.Field v-slot="{ field }" name="title">
                <Field :class="canopyField" :data-invalid="editInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">Title</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :class="authInput"
                    maxlength="255"
                    :aria-invalid="editInvalid(field)"
                    :disabled="save.isPending.value"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                  <FieldError v-if="editInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </editForm.Field>
              <editForm.Field v-slot="{ field }" name="description">
                <Field :class="canopyField" :data-invalid="editInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">Description</FieldLabel>
                  <Textarea
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :class="canopyTextarea"
                    rows="4"
                    maxlength="5000"
                    :aria-invalid="editInvalid(field)"
                    :disabled="save.isPending.value"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                  <FieldError v-if="editInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </editForm.Field>
              <div v-if="isLawyer" class="grid gap-4.5 sm:grid-cols-2">
                <editForm.Field v-slot="{ field }" name="priority">
                  <Field :class="canopyField" :data-invalid="editInvalid(field)">
                    <FieldLabel :for="field.name" :class="canopyLabel">Priority</FieldLabel>
                    <Select
                      :model-value="field.state.value"
                      :disabled="save.isPending.value"
                      @update:model-value="(v) => {
                        field.handleChange(v as (typeof CASE_PRIORITIES)[number])
                        field.handleBlur()
                      }"
                    >
                      <SelectTrigger :id="field.name" :class="canopySelect" :aria-invalid="editInvalid(field)">
                        <SelectValue placeholder="Choose" />
                      </SelectTrigger>
                      <SelectContent :class="canopyPanel">
                        <SelectItem v-for="level in CASE_PRIORITIES" :key="level" :value="level">{{ PRIORITY_LABEL[level] }}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError v-if="editInvalid(field)" :errors="field.state.meta.errors" />
                  </Field>
                </editForm.Field>
                <editForm.Field v-slot="{ field }" name="due">
                  <Field :class="canopyField" :data-invalid="editInvalid(field)">
                    <FieldLabel :for="field.name" :class="canopyLabel">Due date <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                    <Input
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      type="date"
                      :class="authInput"
                      :aria-invalid="editInvalid(field)"
                      :disabled="save.isPending.value"
                      @blur="field.handleBlur"
                      @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                    />
                    <FieldError v-if="editInvalid(field)" :errors="field.state.meta.errors" />
                  </Field>
                </editForm.Field>
              </div>
            </FieldGroup>
          </form>
        </div>
        <DialogFooter :class="dialogFoot">
          <Button type="button" variant="line" size="pill" :disabled="save.isPending.value" @click="editOpen = false">Cancel</Button>
          <Button type="submit" :form="editFormId" variant="canopy" size="pill" :class="quiet" :disabled="save.isPending.value" :aria-busy="save.isPending.value">
            {{ save.isPending.value ? 'Saving…' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ───────── close, reopen or archive ───────── -->
    <Dialog v-model:open="moveOpen">
      <DialogContent :class="dialog">
        <DialogHeader :class="dialogHead">
          <DialogTitle :class="dialogTitle">{{ move?.label }}</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">{{ move?.explain }}</DialogDescription>
        </DialogHeader>
        <div :class="dialogBody">
          <form :id="moveFormId" novalidate @submit.prevent="moveForm.handleSubmit">
            <moveForm.Field v-slot="{ field }" name="reason">
              <Field :class="canopyField" :data-invalid="moveInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">Note for the log <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                <Textarea
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :class="canopyTextarea"
                  rows="3"
                  maxlength="500"
                  placeholder="For example: judgment delivered, matter concluded."
                  :aria-invalid="moveInvalid(field)"
                  :disabled="setStatus.isPending.value"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="moveInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </moveForm.Field>
          </form>
        </div>
        <DialogFooter :class="dialogFoot">
          <Button type="button" variant="line" size="pill" :disabled="setStatus.isPending.value" @click="moveOpen = false">Cancel</Button>
          <Button type="submit" :form="moveFormId" variant="canopy" size="pill" :class="quiet" :disabled="setStatus.isPending.value" :aria-busy="setStatus.isPending.value">
            {{ setStatus.isPending.value ? 'Saving…' : move?.label }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ───────── add a task (the lawyer's) ───────── -->
    <Dialog v-model:open="taskOpen">
      <DialogContent :class="dialog">
        <DialogHeader :class="dialogHead">
          <DialogTitle :class="dialogTitle">Add a task</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">Something one of you has to do next. Both of you see it.</DialogDescription>
        </DialogHeader>
        <div :class="dialogBody">
          <form :id="taskFormId" novalidate @submit.prevent="taskForm.handleSubmit">
            <FieldGroup class="gap-4.5">
              <taskForm.Field v-slot="{ field }" name="title">
                <Field :class="canopyField" :data-invalid="taskInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">What needs doing</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :class="authInput"
                    maxlength="255"
                    placeholder="For example: send the signed tenancy agreement"
                    :aria-invalid="taskInvalid(field)"
                    :disabled="addTask.isPending.value"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                  <FieldError v-if="taskInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </taskForm.Field>

              <taskForm.Field v-slot="{ field }" name="forWhom">
                <FieldSet :class="canopyField" :data-invalid="taskInvalid(field)">
                  <FieldLegend variant="label" :class="canopyLabel">Who is it for</FieldLegend>
                  <RadioGroup
                    :name="field.name"
                    :model-value="field.state.value"
                    :disabled="addTask.isPending.value"
                    class="grid grid-cols-2 gap-2"
                    @update:model-value="(v) => {
                      field.handleChange(String(v ?? ''))
                      field.handleBlur()
                    }"
                  >
                    <FieldLabel
                      v-for="person in taskPeople"
                      :key="person.name"
                      :for="`${taskFormId}-${person.name}`"
                      :class="[canopyChoice, 'items-center', person.id ? '' : 'pointer-events-none opacity-50']"
                    >
                      <Field orientation="horizontal" class="items-center">
                        <RadioGroupItem :id="`${taskFormId}-${person.name}`" :value="person.id" :disabled="!person.id" :aria-invalid="taskInvalid(field)" />
                        <span class="truncate text-sm font-medium">{{ person.name }}</span>
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                  <FieldError v-if="taskInvalid(field)" :errors="field.state.meta.errors" />
                </FieldSet>
              </taskForm.Field>

              <taskForm.Field v-slot="{ field }" name="due">
                <Field :class="[canopyField, 'sm:max-w-64']" :data-invalid="taskInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">Due date <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    type="date"
                    :class="authInput"
                    :aria-invalid="taskInvalid(field)"
                    :disabled="addTask.isPending.value"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                  <FieldError v-if="taskInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </taskForm.Field>

              <taskForm.Field v-slot="{ field }" name="note">
                <Field :class="canopyField" :data-invalid="taskInvalid(field)">
                  <FieldLabel :for="field.name" :class="canopyLabel">Details <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                  <Textarea
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :class="canopyTextarea"
                    rows="3"
                    maxlength="1000"
                    :aria-invalid="taskInvalid(field)"
                    :disabled="addTask.isPending.value"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                  />
                  <FieldError v-if="taskInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </taskForm.Field>
            </FieldGroup>
          </form>
        </div>
        <DialogFooter :class="dialogFoot">
          <Button type="button" variant="line" size="pill" :disabled="addTask.isPending.value" @click="taskOpen = false">Cancel</Button>
          <Button type="submit" :form="taskFormId" variant="canopy" size="pill" :class="quiet" :disabled="addTask.isPending.value" :aria-busy="addTask.isPending.value">
            {{ addTask.isPending.value ? 'Adding…' : 'Add the task' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
