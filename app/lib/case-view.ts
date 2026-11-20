/**
 * Cases as the backend returns them, and how the cases pages word them. Kept
 * free of Nuxt and network code so it can be unit-tested.
 *
 * A case is the work a lawyer does for a client after a consultation: it is
 * opened when the lawyer records that the client hired them. It holds its own
 * messages, the tasks each side has, and a log of what happened.
 *
 * Two kinds of id appear and must not be mixed up: a party's PROFILE id (on
 * the case itself) and their ACCOUNT id (on messages, tasks and activities).
 */

export type CaseStatus = 'active' | 'reopened' | 'closed' | 'archived'
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent'

export interface CaseParty {
  /** Profile id, as held on the case. */
  id: string
  /** Account id, as it appears on messages, tasks and activities. */
  userId: string
  name: string
  image: string | null
}

export interface CaseRow {
  id: string
  caseNumber: string
  caseTitle: string
  description: string | null
  clientId: string
  lawyerId: string
  agreedFee: string | number | null
  feeStructure: string | null
  paymentNotes: string | null
  status: CaseStatus
  priority: CasePriority
  startDate: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
  lastActivityAt: string | null
  client: CaseParty | null
  lawyer: CaseParty | null
}

export interface CaseTaskRow {
  id: string
  caseId: string
  taskTitle: string
  taskDescription: string | null
  /** Account id of the person the task is for. */
  assignedTo: string
  dueDate: string | null
  priority: string | null
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: string
  completedAt: string | null
}

export interface CaseActivityRow {
  id: string
  caseId: string
  activityType: string
  description: string
  /** Account id of who did it. */
  performedBy: string
  createdAt: string
}

export interface CaseMessageRow {
  id: string
  caseId: string
  senderId: string
  senderType: 'client' | 'lawyer'
  messageContent: string
  isRead: boolean
  readAt: string | null
  createdAt: string
}

/** The longest message the backend accepts. */
export const CASE_MESSAGE_MAX = 5000

// ───────── the list ─────────

export type CaseTab = 'open' | 'closed' | 'archived'

export const CASE_TABS: Array<{ key: CaseTab, label: string }> = [
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
  { key: 'archived', label: 'Archived' },
]

export function isCaseTab(value: unknown): value is CaseTab {
  return typeof value === 'string' && CASE_TABS.some(tab => tab.key === value)
}

/** Which list a case belongs in: a reopened case is open again. */
export function caseTabOf(status: CaseStatus): CaseTab {
  if (status === 'closed') return 'closed'
  if (status === 'archived') return 'archived'
  return 'open'
}

/** The other person on the case: the client for a lawyer, the lawyer for a client. */
export function otherParty(row: Pick<CaseRow, 'client' | 'lawyer'>, role: string | undefined): CaseParty | null {
  return role === 'lawyer' ? row.client : row.lawyer
}

/** The cases for a tab that match a search, most recently active first. */
export function filterCases(cases: readonly CaseRow[], tab: CaseTab, search: string, role: string | undefined): CaseRow[] {
  const wanted = search.trim().toLowerCase()
  return cases
    .filter(row => caseTabOf(row.status) === tab)
    .filter((row) => {
      if (!wanted) return true
      return [row.caseTitle, row.caseNumber, otherParty(row, role)?.name]
        .some(text => text?.toLowerCase().includes(wanted))
    })
    .sort((a, b) => new Date(b.lastActivityAt ?? b.updatedAt).getTime() - new Date(a.lastActivityAt ?? a.updatedAt).getTime())
}

export const CASE_PILL: Record<CaseStatus, { label: string, class: string }> = {
  active: { label: 'Open', class: 'bg-mint text-deep' },
  reopened: { label: 'Reopened', class: 'bg-mint text-deep' },
  closed: { label: 'Closed', class: 'bg-muted text-foreground' },
  archived: { label: 'Archived', class: 'bg-muted text-foreground' },
}

/** A priority worth a pill: the ordinary ones are left unsaid. */
export function priorityPill(priority: string | null | undefined): string | null {
  if (priority === 'urgent') return 'Urgent'
  if (priority === 'high') return 'High priority'
  return null
}

// ───────── dates ─────────

function dayStart(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** A date-only value ("2026-12-14" or an ISO timestamp at midnight UTC) as a local day. */
function asDay(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

const long = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const short = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })

/** "14 December 2026" for a date-only value; null when there is none. */
export function dayLabel(value: string | null | undefined): string | null {
  const day = value ? asDay(value) : null
  return day ? long(day) : null
}

/**
 * "Due 14 December", "Due today", "Overdue since 3 November"; null when there
 * is no due date or the thing is finished.
 */
export function dueLine(dueDate: string | null | undefined, now: Date, done = false): { text: string, overdue: boolean } | null {
  const day = dueDate ? asDay(dueDate) : null
  if (!day || done) return null
  const diff = Math.round((dayStart(day) - dayStart(now)) / 86_400_000)
  if (diff < 0) return { text: `Overdue since ${short(day)}`, overdue: true }
  if (diff === 0) return { text: 'Due today', overdue: false }
  if (diff === 1) return { text: 'Due tomorrow', overdue: false }
  return { text: `Due ${short(day)}`, overdue: false }
}

/** "today", "yesterday", "3 days ago", or "on 2 November 2026". */
export function agoLabel(iso: string | null | undefined, now: Date): string {
  const date = iso ? new Date(iso) : null
  if (!date || Number.isNaN(date.getTime())) return ''
  const days = Math.round((dayStart(now) - dayStart(date)) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return `on ${long(date)}`
}

/** "2:30 PM" today, "Mon 2:30 PM" this week, "2 Nov, 2:30 PM" before that. */
export function messageTime(iso: string, now: Date): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const time = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?(am|pm)/i, match => ` ${match.trim().toUpperCase()}`)
  const days = Math.round((dayStart(now) - dayStart(date)) / 86_400_000)
  if (days <= 0) return time
  if (days < 7) return `${date.toLocaleDateString('en-GB', { weekday: 'short' })} ${time}`
  return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${time}`
}

// ───────── the fee ─────────

const FEE_STRUCTURE: Record<string, string> = {
  flat_fee: 'flat fee',
  hourly: 'hourly',
  contingency: 'contingency',
  retainer: 'retainer',
  hybrid: 'mixed',
}

/** "₦150,000, flat fee"; null when no fee was recorded. */
export function feeLine(agreedFee: string | number | null | undefined, feeStructure: string | null | undefined): string | null {
  const amount = Number(agreedFee)
  if (!agreedFee || !Number.isFinite(amount) || amount <= 0) return null
  const money = `₦${Math.round(amount).toLocaleString('en-NG')}`
  const kind = feeStructure ? FEE_STRUCTURE[feeStructure] ?? feeStructure.replace(/_/g, ' ') : null
  return kind ? `${money}, ${kind}` : money
}

// ───────── people ─────────

/** Whose account an id is, in the reader's terms: "You", or the other person's name. */
export function nameOf(userId: string | null | undefined, row: Pick<CaseRow, 'client' | 'lawyer'>, myUserId: string | null | undefined): string {
  if (userId && userId === myUserId) return 'You'
  if (userId && userId === row.client?.userId) return row.client.name
  if (userId && userId === row.lawyer?.userId) return row.lawyer.name
  return 'Someone'
}

// ───────── status changes (the lawyer's) ─────────

export interface StatusMove { to: CaseStatus, label: string, done: string, explain: string }

/** What a lawyer can do with a case from each status. */
export function statusMoves(status: CaseStatus): StatusMove[] {
  const close: StatusMove = { to: 'closed', label: 'Close the case', done: 'Case closed', explain: 'The work is finished. The case stays readable for both of you and can be reopened.' }
  const reopen: StatusMove = { to: 'reopened', label: 'Reopen the case', done: 'Case reopened', explain: 'The case goes back to your open cases.' }
  const archive: StatusMove = { to: 'archived', label: 'Archive', done: 'Case archived', explain: 'It moves out of both your lists into Archived. Nothing is deleted.' }
  if (status === 'closed') return [reopen, archive]
  if (status === 'archived') return [reopen]
  return [close, archive]
}

// ───────── tasks ─────────

/** Open tasks first (soonest due first, undated last), then finished ones, most recently finished first. */
export function sortTasks(tasks: readonly CaseTaskRow[]): CaseTaskRow[] {
  const open = tasks.filter(task => task.status !== 'completed').sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return a.createdAt.localeCompare(b.createdAt)
  })
  const done = tasks.filter(task => task.status === 'completed').sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
  return [...open, ...done]
}

/** "2 of 5 done", "No tasks yet". */
export function taskSummary(tasks: readonly CaseTaskRow[]): string {
  if (tasks.length === 0) return 'No tasks yet'
  const done = tasks.filter(task => task.status === 'completed').length
  return `${done} of ${tasks.length} done`
}
