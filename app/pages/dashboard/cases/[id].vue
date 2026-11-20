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
import { Textarea } from '@/components/ui/textarea'
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
  type CasePriority,
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
useSeoMeta({ robots: 'noindex, nofollow' })

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
const draft = ref('')
const thread = ref<HTMLElement | null>(null)

function toEnd() {
  void nextTick(() => { thread.value?.scrollTo({ top: thread.value.scrollHeight }) })
}
watch(() => messages.value?.length, toEnd)

function sendMessage() {
  const text = draft.value.trim()
  if (!text || send.isPending.value) return
  send.mutate(text, {
    onSuccess: () => { draft.value = '' },
    onError: fail('Message not sent'),
  })
}

// ───────── tasks ─────────
const taskOpen = ref(false)
const task = reactive({ title: '', note: '', forWhom: '', due: '' })

function startTask() {
  task.title = ''
  task.note = ''
  task.due = ''
  // A task is usually something the client has to do.
  task.forWhom = item.value?.client?.userId ?? me.value ?? ''
  taskOpen.value = true
}

function createTask() {
  const title = task.title.trim()
  if (title.length < 3 || !task.forWhom) return
  addTask.mutate(
    { taskTitle: title, taskDescription: task.note.trim() || undefined, assignedTo: task.forWhom, dueDate: task.due || undefined },
    {
      onSuccess: () => {
        toast.success('Task added')
        taskOpen.value = false
      },
      onError: fail('Task not added'),
    },
  )
}

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
const edit = reactive({ title: '', description: '', priority: 'medium' as CasePriority, due: '' })

function startEdit() {
  if (!item.value) return
  edit.title = item.value.caseTitle
  edit.description = item.value.description ?? ''
  edit.priority = item.value.priority
  edit.due = item.value.dueDate?.slice(0, 10) ?? ''
  editOpen.value = true
}

function saveEdit() {
  const title = edit.title.trim()
  if (title.length < 3) return
  save.mutate(
    {
      caseTitle: title,
      description: edit.description.trim(),
      // Priority and the due date are the lawyer's to set; the client's route does not take them.
      ...(isLawyer.value ? { priority: edit.priority, dueDate: edit.due || null } : {}),
    },
    {
      onSuccess: () => {
        toast.success('Case updated')
        editOpen.value = false
      },
      onError: fail('Case not updated'),
    },
  )
}

// ───────── closing, reopening, archiving (the lawyer's) ─────────
const moves = computed(() => item.value && isLawyer.value ? statusMoves(item.value.status) : [])
const move = ref<StatusMove | null>(null)
const moveOpen = ref(false)
const reason = ref('')

function startMove(chosen: StatusMove) {
  move.value = chosen
  reason.value = ''
  moveOpen.value = true
}

function confirmMove() {
  if (!move.value) return
  const chosen = move.value
  setStatus.mutate(
    { status: chosen.to, reason: reason.value.trim() || undefined },
    {
      onSuccess: () => {
        toast.success(chosen.done)
        moveOpen.value = false
      },
      onError: fail('Case not changed'),
    },
  )
}

// Class lists shared across the page (full strings, so Tailwind sees them).
const sectionTitle = 'font-display text-[1.3rem] font-[650] tracking-[-0.02em]'
const panel = 'rounded-card border border-border bg-card'
const pill = 'rounded-full px-[0.7rem] py-[0.15rem] text-[0.78rem] font-bold tracking-normal whitespace-nowrap normal-case'
const quiet = 'shadow-none hover:translate-y-0'
const field = 'rounded-[1rem] bg-card'
const dialog = 'gap-[1.1rem] rounded-[1.75rem] border-border bg-card p-[clamp(1.4rem,4vw,2rem)] sm:max-w-[32rem]'
const dialogTitle = 'font-display text-[1.5rem] leading-[1.1] font-[650] tracking-[-0.03em]'
</script>

<template>
  <div class="mx-auto grid w-full max-w-[62rem] grid-cols-[minmax(0,1fr)] gap-[clamp(1rem,2vw,1.5rem)]">
    <NuxtLink
      to="/dashboard/cases"
      class="inline-flex min-h-[2.75rem] w-fit items-center gap-[0.5rem] rounded-full pr-[0.6rem] font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      <CanopyGlyph name="arrow" :size="17" class="rotate-180" />Cases
    </NuxtLink>

    <!-- ───────── loading / not found / could not load ───────── -->
    <div v-if="loading && !error" role="status" aria-label="Loading the case" class="grid gap-4">
      <div class="h-[18rem] animate-pulse rounded-panel bg-muted max-sm:rounded-[1.75rem]" />
      <div class="h-[16rem] animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="missing" class="rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,3rem)] text-center max-sm:rounded-[1.75rem]">
      <h1 class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]">There is no case here.</h1>
      <p class="mt-2 text-muted-foreground">It may have been removed, or the link is not one of yours.</p>
      <Button as-child variant="canopy" size="pill" class="mt-5"><NuxtLink to="/dashboard/cases">Back to cases</NuxtLink></Button>
    </section>

    <section v-else-if="!item" class="rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,3rem)] text-center max-sm:rounded-[1.75rem]">
      <h1 class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.1] font-[650] tracking-[-0.03em]">We could not load this case.</h1>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" @click="() => refetch()">Try again</Button>
    </section>

    <template v-else>
      <!-- ───────── what the case is, who it is between, the fee ───────── -->
      <section
        aria-labelledby="case-title"
        class="flex flex-wrap items-start gap-x-[clamp(1.5rem,4vw,3rem)] gap-y-6 rounded-panel border border-border bg-card p-[clamp(1.5rem,4vw,2.75rem)] max-sm:rounded-[1.75rem]"
      >
        <div class="min-w-0 flex-[999_1_22rem]">
          <p class="flex flex-wrap items-center gap-x-[0.7rem] gap-y-1 text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">
            Case · {{ item.caseNumber }}
            <span :class="[pill, CASE_PILL[item.status].class]">{{ CASE_PILL[item.status].label }}</span>
            <span v-if="priorityPill(item.priority)" :class="[pill, 'bg-warning/15 text-warning-subtle-foreground']">{{ priorityPill(item.priority) }}</span>
          </p>
          <h1 id="case-title" class="mt-[0.8rem] text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.08] font-[620] tracking-[-0.035em] text-balance">{{ item.caseTitle }}</h1>

          <p class="mt-[0.9rem] flex flex-wrap items-center gap-x-[0.6rem] gap-y-1">
            <span aria-hidden="true" class="grid size-[2.2rem] flex-none place-items-center overflow-hidden rounded-[0.7rem] bg-mint font-display text-[0.85rem] font-bold text-deep">
              <img v-if="other?.image" :src="other.image" alt="" class="size-full object-cover">
              <template v-else>{{ initials(other?.name) || '·' }}</template>
            </span>
            <span><span class="text-muted-foreground">{{ isLawyer ? 'For' : 'With' }}</span> <b class="font-semibold">{{ other?.name ?? (isLawyer ? 'a client' : 'your lawyer') }}</b></span>
          </p>
          <p class="mt-[0.5rem] text-[0.95rem] text-muted-foreground">
            Opened {{ dayLabel(item.startDate ?? item.createdAt) ?? agoLabel(item.createdAt, now!) }}<template v-if="due">
              · <span :class="due.overdue ? 'font-semibold text-destructive' : ''">{{ due.text }}</span>
            </template>
          </p>
          <p v-if="item.description" class="mt-[0.9rem] max-w-[40rem] whitespace-pre-line">{{ item.description }}</p>

          <div class="mt-[1.3rem] flex flex-wrap gap-[0.55rem]">
            <Button variant="line" size="pill" @click="startEdit">{{ isLawyer ? 'Edit the case' : 'Edit the title or description' }}</Button>
            <Button v-for="option in moves" :key="option.to" variant="line" size="pill" @click="startMove(option)">{{ option.label }}</Button>
          </div>
        </div>

        <div v-if="fee || item.paymentNotes" class="min-w-0 flex-[1_1_17rem] rounded-[1.5rem] bg-mint p-[1.25rem] text-deep">
          <h2 class="flex items-center gap-[0.5rem] font-display text-[1.2rem] font-[650] tracking-[-0.02em]"><CanopyGlyph name="card" :size="19" />Agreed fee</h2>
          <p v-if="fee" class="mt-[0.5rem] font-display text-[1.5rem] leading-[1.15] font-[650] tracking-[-0.02em]">{{ fee }}</p>
          <p v-if="item.paymentNotes" class="mt-[0.5rem] whitespace-pre-line">{{ item.paymentNotes }}</p>
          <p class="mt-[0.7rem] text-[0.85rem] opacity-80">As recorded when the case opened. Payment for the work is between you and {{ isLawyer ? 'your client' : 'your lawyer' }}.</p>
        </div>
      </section>

      <!-- ───────── messages, tasks, activity ───────── -->
      <div role="group" aria-label="Part of the case" class="-mx-1 flex max-w-[calc(100%+0.5rem)] min-w-0 gap-[0.35rem] overflow-x-auto px-1 py-1 [scrollbar-width:none]">
        <button
          v-for="entry in PARTS"
          :key="entry.key"
          type="button"
          :aria-pressed="part === entry.key"
          class="inline-flex min-h-[2.75rem] flex-none cursor-pointer items-center gap-[0.45rem] rounded-full border px-[1rem] font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-200 ease-canopy"
          :class="part === entry.key ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground'"
          @click="part = entry.key"
        >
          {{ entry.label }}
          <span v-if="entry.count > 0" class="rounded-full px-[0.45rem] text-[0.78rem] font-bold" :class="part === entry.key ? 'bg-white/20' : 'bg-muted text-foreground'">{{ entry.count }}</span>
        </button>
      </div>

      <!-- messages -->
      <section v-if="part === 'messages'" aria-labelledby="messages-title" :class="[panel, 'flex flex-col overflow-hidden']">
        <h2 id="messages-title" :class="[sectionTitle, 'px-[clamp(1.1rem,2.2vw,1.5rem)] pt-[1.2rem]']">Messages about this case</h2>
        <div ref="thread" class="max-h-[28rem] min-h-[10rem] overflow-y-auto px-[clamp(1.1rem,2.2vw,1.5rem)] py-[1rem]" aria-live="polite">
          <div v-if="threadPending" role="status" aria-label="Loading messages" class="grid gap-2">
            <div class="h-[3rem] w-[60%] animate-pulse rounded-[1rem] bg-muted" />
            <div class="ml-auto h-[3rem] w-[50%] animate-pulse rounded-[1rem] bg-muted" />
          </div>
          <p v-else-if="threadFailed" class="text-muted-foreground">We could not load the messages. They will be tried again shortly.</p>
          <p v-else-if="!messages?.length" class="text-muted-foreground">No messages on this case yet. Write the first one below.</p>
          <ol v-else class="grid gap-[0.6rem]">
            <li v-for="message in messages" :key="message.id" class="flex" :class="message.senderId === me ? 'justify-end' : 'justify-start'">
              <div class="max-w-[min(34rem,85%)]">
                <p class="whitespace-pre-line rounded-[1.1rem] px-[0.9rem] py-[0.6rem]" :class="message.senderId === me ? 'rounded-br-[0.35rem] bg-forest text-white' : 'rounded-bl-[0.35rem] bg-muted'">{{ message.messageContent }}</p>
                <p class="mt-[0.2rem] text-[0.78rem] text-muted-foreground" :class="message.senderId === me ? 'text-right' : ''">
                  {{ nameOf(message.senderId, item, me) }} · {{ messageTime(message.createdAt, now!) }}
                </p>
              </div>
            </li>
          </ol>
        </div>
        <form class="flex flex-wrap items-end gap-[0.6rem] border-t border-border p-[clamp(0.9rem,2vw,1.2rem)]" @submit.prevent="sendMessage">
          <Label for="case-message" class="sr-only">Write a message</Label>
          <Textarea
            id="case-message"
            v-model="draft"
            :rows="2"
            :maxlength="CASE_MESSAGE_MAX"
            :placeholder="`Write to ${other?.name?.split(' ')[0] ?? (isLawyer ? 'your client' : 'your lawyer')} about this case`"
            :class="[field, 'min-w-0 flex-[1_1_16rem]']"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <Button type="submit" variant="canopy" size="pill" :class="quiet" :disabled="!draft.trim() || send.isPending.value" :aria-busy="send.isPending.value">
            {{ send.isPending.value ? 'Sending…' : 'Send' }}
          </Button>
        </form>
      </section>

      <!-- tasks -->
      <section v-else-if="part === 'tasks'" aria-labelledby="tasks-title" :class="[panel, 'p-[clamp(1.1rem,2.2vw,1.5rem)]']">
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div>
            <h2 id="tasks-title" :class="sectionTitle">Tasks</h2>
            <p class="text-[0.92rem] text-muted-foreground">{{ taskSummary(tasks) }}</p>
          </div>
          <Button v-if="isLawyer" variant="canopy" size="pill-sm" :class="quiet" @click="startTask">Add a task</Button>
        </div>

        <p v-if="tasks.length === 0" class="mt-[0.9rem] text-muted-foreground">
          {{ isLawyer ? 'Use tasks for what each of you has to do next: a document to send, a form to sign, a filing to make.' : 'Your lawyer will add what each of you has to do next. You can tick yours off here.' }}
        </p>

        <ul v-else class="mt-[0.9rem] divide-y divide-border">
          <li v-for="row in tasks" :key="row.id" class="flex flex-wrap items-start gap-x-[0.8rem] gap-y-[0.4rem] py-[0.8rem]">
            <button
              type="button"
              role="checkbox"
              :aria-checked="row.status === 'completed'"
              :aria-label="row.status === 'completed' ? `Put back: ${row.taskTitle}` : `Mark done: ${row.taskTitle}`"
              :disabled="busyTask === row.id || (row.status === 'completed' && !isLawyer)"
              class="mt-[0.1rem] grid size-[1.75rem] flex-none cursor-pointer place-items-center rounded-[0.6rem] border-2 transition-colors duration-200 disabled:cursor-default"
              :class="row.status === 'completed' ? 'border-brand bg-brand text-white dark:text-night' : 'border-border bg-card hover:border-brand'"
              @click="toggleTask(row)"
            >
              <CanopyGlyph v-if="row.status === 'completed'" name="tick" :size="15" :stroke="3" />
            </button>
            <div class="min-w-0 flex-[1_1_14rem]">
              <b class="block font-semibold" :class="row.status === 'completed' ? 'text-muted-foreground line-through' : ''">{{ row.taskTitle }}</b>
              <p v-if="row.taskDescription" class="mt-[0.1rem] whitespace-pre-line text-[0.92rem] text-muted-foreground">{{ row.taskDescription }}</p>
              <p class="mt-[0.15rem] text-[0.88rem] text-muted-foreground">
                For {{ nameOf(row.assignedTo, item, me).replace(/^You$/, 'you') }}<template v-if="row.status === 'completed'"> · Done {{ agoLabel(row.completedAt, now!) }}</template><template v-else-if="dueLine(row.dueDate, now!)">
                  · <span :class="dueLine(row.dueDate, now!)?.overdue ? 'font-semibold text-destructive' : ''">{{ dueLine(row.dueDate, now!)?.text }}</span>
                </template>
              </p>
            </div>
            <Button v-if="isLawyer" variant="line" size="pill-sm" :disabled="busyTask === row.id" :aria-label="`Remove the task: ${row.taskTitle}`" @click="removeTask(row)">Remove</Button>
          </li>
        </ul>
      </section>

      <!-- activity -->
      <section v-else aria-labelledby="log-title" :class="[panel, 'p-[clamp(1.1rem,2.2vw,1.5rem)]']">
        <h2 id="log-title" :class="sectionTitle">Activity</h2>
        <p class="text-[0.92rem] text-muted-foreground">What has happened on this case, most recent first.</p>
        <p v-if="!file?.activities.length" class="mt-[0.9rem] text-muted-foreground">Nothing recorded yet.</p>
        <ol v-else class="mt-[0.9rem] grid gap-[0.7rem]">
          <li v-for="entry in file.activities" :key="entry.id" class="grid grid-cols-[0.6rem_minmax(0,1fr)] gap-x-[0.8rem]">
            <span aria-hidden="true" class="mt-[0.55rem] size-[0.6rem] rounded-full bg-brand" />
            <div class="min-w-0">
              <p>{{ entry.description }}</p>
              <p class="text-[0.85rem] text-muted-foreground">{{ nameOf(entry.performedBy, item, me) }} · {{ agoLabel(entry.createdAt, now!) }}</p>
            </div>
          </li>
        </ol>
      </section>
    </template>

    <!-- ───────── edit the case ───────── -->
    <Dialog v-model:open="editOpen">
      <DialogContent :class="dialog">
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle :class="dialogTitle">{{ isLawyer ? 'Edit the case' : 'Edit the title or description' }}</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">{{ other?.name ?? 'The other person' }} sees the same title and description.</DialogDescription>
        </DialogHeader>
        <form class="grid gap-[0.9rem]" @submit.prevent="saveEdit">
          <div class="grid gap-[0.35rem]">
            <Label for="edit-title" class="font-semibold">Title</Label>
            <Input id="edit-title" v-model="edit.title" maxlength="255" :class="[field, 'h-[2.9rem]']" />
          </div>
          <div class="grid gap-[0.35rem]">
            <Label for="edit-description" class="font-semibold">Description</Label>
            <Textarea id="edit-description" v-model="edit.description" :rows="4" maxlength="5000" :class="field" />
          </div>
          <div v-if="isLawyer" class="grid gap-[0.9rem] sm:grid-cols-2">
            <div class="grid gap-[0.35rem]">
              <Label for="edit-priority" class="font-semibold">Priority</Label>
              <select id="edit-priority" v-model="edit.priority" class="h-[2.9rem] rounded-[1rem] border border-border bg-card px-[0.8rem]">
                <option value="low">Low</option>
                <option value="medium">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div class="grid gap-[0.35rem]">
              <Label for="edit-due" class="font-semibold">Due date <span class="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="edit-due" v-model="edit.due" type="date" :class="[field, 'h-[2.9rem]']" />
            </div>
          </div>
          <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
            <Button type="button" variant="line" size="pill" :disabled="save.isPending.value" @click="editOpen = false">Cancel</Button>
            <Button type="submit" variant="canopy" size="pill" :class="quiet" :disabled="edit.title.trim().length < 3 || save.isPending.value" :aria-busy="save.isPending.value">
              {{ save.isPending.value ? 'Saving…' : 'Save' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- ───────── close, reopen or archive ───────── -->
    <Dialog v-model:open="moveOpen">
      <DialogContent :class="dialog">
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle :class="dialogTitle">{{ move?.label }}</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">{{ move?.explain }}</DialogDescription>
        </DialogHeader>
        <div class="grid gap-[0.35rem]">
          <Label for="move-reason" class="font-semibold">Note for the log <span class="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea id="move-reason" v-model="reason" :rows="3" maxlength="500" placeholder="For example: judgment delivered, matter concluded." :class="field" />
        </div>
        <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
          <Button variant="line" size="pill" :disabled="setStatus.isPending.value" @click="moveOpen = false">Cancel</Button>
          <Button variant="canopy" size="pill" :class="quiet" :disabled="setStatus.isPending.value" :aria-busy="setStatus.isPending.value" @click="confirmMove">
            {{ setStatus.isPending.value ? 'Saving…' : move?.label }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ───────── add a task (the lawyer's) ───────── -->
    <Dialog v-model:open="taskOpen">
      <DialogContent :class="dialog">
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle :class="dialogTitle">Add a task</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">Something one of you has to do next. Both of you see it.</DialogDescription>
        </DialogHeader>
        <form class="grid gap-[0.9rem]" @submit.prevent="createTask">
          <div class="grid gap-[0.35rem]">
            <Label for="task-title" class="font-semibold">What needs doing</Label>
            <Input id="task-title" v-model="task.title" maxlength="255" placeholder="For example: send the signed tenancy agreement" :class="[field, 'h-[2.9rem]']" />
          </div>
          <fieldset class="grid gap-[0.35rem]">
            <legend class="mb-[0.35rem] font-semibold">Who is it for</legend>
            <div class="flex flex-wrap gap-[0.45rem]">
              <label
                v-for="person in [{ id: item?.client?.userId, name: item?.client?.name ?? 'The client' }, { id: me, name: 'Me' }]"
                :key="person.name"
                class="inline-flex min-h-[2.75rem] cursor-pointer items-center gap-[0.5rem] rounded-full border px-[1rem] font-semibold transition-colors has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-white has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand dark:has-[:checked]:border-brand"
                :class="person.id ? 'border-border bg-card' : 'pointer-events-none opacity-50'"
              >
                <input v-model="task.forWhom" type="radio" name="task-for" :value="person.id ?? ''" :disabled="!person.id" class="sr-only">{{ person.name }}
              </label>
            </div>
          </fieldset>
          <div class="grid gap-[0.35rem]">
            <Label for="task-due" class="font-semibold">Due date <span class="font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="task-due" v-model="task.due" type="date" :class="[field, 'h-[2.9rem] sm:max-w-[14rem]']" />
          </div>
          <div class="grid gap-[0.35rem]">
            <Label for="task-note" class="font-semibold">Details <span class="font-normal text-muted-foreground">(optional)</span></Label>
            <Textarea id="task-note" v-model="task.note" :rows="3" maxlength="1000" :class="field" />
          </div>
          <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
            <Button type="button" variant="line" size="pill" :disabled="addTask.isPending.value" @click="taskOpen = false">Cancel</Button>
            <Button type="submit" variant="canopy" size="pill" :class="quiet" :disabled="task.title.trim().length < 3 || !task.forWhom || addTask.isPending.value" :aria-busy="addTask.isPending.value">
              {{ addTask.isPending.value ? 'Adding…' : 'Add the task' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
