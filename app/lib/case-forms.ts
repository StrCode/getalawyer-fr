import * as z from 'zod'
import { CASE_MESSAGE_MAX, type CasePriority, type CaseRow } from '~/lib/case-view'

/**
 * The forms on a case: a message, the case's own details, a note when it is
 * closed or reopened, and a task. For each, what a field may hold, the values
 * the form starts from, and what is sent. Limits follow the API's own
 * (Law-Backend `case.validator.ts`).
 */

const dateText = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, { error: 'Choose a date.' })

export const CASE_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const satisfies readonly CasePriority[]
export const PRIORITY_LABEL: Record<CasePriority, string> = { low: 'Low', medium: 'Normal', high: 'High', urgent: 'Urgent' }

export const caseMessageSchema = z.object({
  text: z.string().trim().min(1, { error: 'Write a message first.' }).max(CASE_MESSAGE_MAX, { error: 'Keep the message to 5,000 characters.' }),
})
export type CaseMessageValues = z.input<typeof caseMessageSchema>

export const caseEditSchema = z.object({
  title: z.string().trim().min(3, { error: 'Give the case a title of at least 3 characters.' }).max(255, { error: 'Keep the title to 255 characters.' }),
  description: z.string().trim().max(5000, { error: 'Keep the description to 5,000 characters.' }),
  priority: z.enum(CASE_PRIORITIES),
  due: dateText,
})
export type CaseEditValues = z.input<typeof caseEditSchema>

export function caseEditValues(saved?: Pick<CaseRow, 'caseTitle' | 'description' | 'priority' | 'dueDate'> | null): CaseEditValues {
  return {
    title: saved?.caseTitle ?? '',
    description: saved?.description ?? '',
    priority: saved?.priority ?? 'medium',
    due: saved?.dueDate?.slice(0, 10) ?? '',
  }
}

/** The lawyer also sets the priority and the due date; the client's route does not take them. */
export function caseEditPayload(values: CaseEditValues, isLawyer: boolean) {
  return {
    caseTitle: values.title.trim(),
    description: values.description.trim(),
    ...(isLawyer ? { priority: values.priority, dueDate: values.due || null } : {}),
  }
}

export const caseMoveSchema = z.object({
  reason: z.string().trim().max(500, { error: 'Keep the note to 500 characters.' }),
})
export type CaseMoveValues = z.input<typeof caseMoveSchema>

export const caseTaskSchema = z.object({
  title: z.string().trim().min(3, { error: 'Say what needs doing, in at least 3 characters.' }).max(255, { error: 'Keep this to 255 characters.' }),
  forWhom: z.string().min(1, { error: 'Choose who it is for.' }),
  due: dateText,
  note: z.string().trim().max(1000, { error: 'Keep the details to 1,000 characters.' }),
})
export type CaseTaskValues = z.input<typeof caseTaskSchema>

export function blankTask(forWhom: string): CaseTaskValues {
  return { title: '', forWhom, due: '', note: '' }
}
export function caseTaskPayload(values: CaseTaskValues) {
  return {
    taskTitle: values.title.trim(),
    taskDescription: values.note.trim() || undefined,
    assignedTo: values.forWhom,
    dueDate: values.due || undefined,
  }
}
