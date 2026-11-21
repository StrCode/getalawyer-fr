import { describe, expect, it } from 'vitest'
import {
  blankTask,
  caseEditPayload,
  caseEditSchema,
  caseEditValues,
  caseMessageSchema,
  caseTaskPayload,
  caseTaskSchema,
} from '../app/lib/case-forms'
import {
  bioPayload,
  contactSchema,
  interestsSchema,
  locationPayload,
  locationSchema,
  personalPayload,
  personalSchema,
  personalValues,
  phoneToVerifySchema,
} from '../app/lib/client-profile-forms'

describe('client profile forms', () => {
  it('wants a name, and sends no company when it is empty', () => {
    expect(personalSchema.safeParse({ name: ' ', company: '' }).success).toBe(false)
    expect(personalPayload({ name: ' Ada Obi ', company: ' ' })).toEqual({ name: 'Ada Obi', company: undefined })
    expect(personalValues(null)).toEqual({ name: '', company: '' })
  })

  it('wants a state, and always sends Nigeria', () => {
    expect(locationSchema.safeParse({ state: '', city: '' }).success).toBe(false)
    expect(locationPayload({ state: 'LA', city: ' Ikeja ' })).toEqual({ country: 'NG', state: 'LA', city: 'Ikeja' })
  })

  it('takes an empty note as nothing', () => {
    expect(bioPayload({ bio: '   ' })).toEqual({ bio: undefined })
  })

  it('takes a Nigerian number or none', () => {
    expect(contactSchema.safeParse({ phoneNumber: '' }).success).toBe(true)
    expect(contactSchema.safeParse({ phoneNumber: '0803 123 4567' }).success).toBe(true)
    expect(contactSchema.safeParse({ phoneNumber: '12345' }).success).toBe(false)
    expect(phoneToVerifySchema.safeParse({ phone: '' }).success).toBe(false)
  })

  it('wants one to three interests', () => {
    expect(interestsSchema.safeParse({ ids: [] }).success).toBe(false)
    expect(interestsSchema.safeParse({ ids: ['a', 'b', 'c'] }).success).toBe(true)
    expect(interestsSchema.safeParse({ ids: ['a', 'b', 'c', 'd'] }).success).toBe(false)
  })
})

describe('case forms', () => {
  it('wants a message with words in it', () => {
    expect(caseMessageSchema.safeParse({ text: '   ' }).success).toBe(false)
    expect(caseMessageSchema.safeParse({ text: 'Hello' }).success).toBe(true)
  })

  it('reads the case, and holds the title to 3 to 255 characters', () => {
    expect(caseEditValues({ caseTitle: 'Tenancy', description: null, priority: 'high', dueDate: '2026-12-01T00:00:00Z' }))
      .toEqual({ title: 'Tenancy', description: '', priority: 'high', due: '2026-12-01' })
    expect(caseEditSchema.safeParse({ title: 'Ab', description: '', priority: 'medium', due: '' }).success).toBe(false)
  })

  it('sends the priority and due date only for the lawyer', () => {
    const values = { title: ' Tenancy dispute ', description: ' ', priority: 'urgent' as const, due: '' }
    expect(caseEditPayload(values, true)).toEqual({ caseTitle: 'Tenancy dispute', description: '', priority: 'urgent', dueDate: null })
    expect(caseEditPayload(values, false)).toEqual({ caseTitle: 'Tenancy dispute', description: '' })
  })

  it('wants a task with a title and someone to do it', () => {
    expect(caseTaskSchema.safeParse(blankTask('')).success).toBe(false)
    expect(caseTaskSchema.safeParse({ ...blankTask('u1'), title: 'Send the lease' }).success).toBe(true)
    expect(caseTaskPayload({ title: ' Send the lease ', forWhom: 'u1', due: '', note: '' }))
      .toEqual({ taskTitle: 'Send the lease', taskDescription: undefined, assignedTo: 'u1', dueDate: undefined })
  })
})
