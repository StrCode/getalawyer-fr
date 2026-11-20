import { describe, expect, it } from 'vitest'
import {
  agoLabel,
  caseTabOf,
  dayLabel,
  dueLine,
  feeLine,
  filterCases,
  nameOf,
  otherParty,
  priorityPill,
  sortTasks,
  statusMoves,
  taskSummary,
  type CaseRow,
  type CaseTaskRow,
} from '../app/lib/case-view'

// Friday 20 November 2026, 9:00 in the morning.
const now = new Date(2026, 10, 20, 9, 0)

const client = { id: 'client-profile', userId: 'user-client', name: 'Tunde Bakare', image: null }
const lawyer = { id: 'lawyer-profile', userId: 'user-lawyer', name: 'Adaeze Okonkwo', image: null }

function row(over: Partial<CaseRow> = {}): CaseRow {
  return {
    id: 'c1', caseNumber: 'THK-001-A3K9M-2026', caseTitle: 'Tenancy deposit dispute', description: null,
    clientId: client.id, lawyerId: lawyer.id, agreedFee: '150000.00', feeStructure: 'flat_fee', paymentNotes: null,
    status: 'active', priority: 'medium', startDate: null, dueDate: null,
    createdAt: '2026-11-10T10:00:00Z', updatedAt: '2026-11-10T10:00:00Z', lastActivityAt: '2026-11-18T10:00:00Z',
    client, lawyer, ...over,
  }
}

function task(over: Partial<CaseTaskRow> = {}): CaseTaskRow {
  return {
    id: 't', caseId: 'c1', taskTitle: 'Send the tenancy agreement', taskDescription: null, assignedTo: client.userId,
    dueDate: null, priority: 'medium', status: 'pending', createdAt: '2026-11-11T10:00:00Z', completedAt: null, ...over,
  }
}

describe('the list', () => {
  it('puts a reopened case with the open ones', () => {
    expect(caseTabOf('active')).toBe('open')
    expect(caseTabOf('reopened')).toBe('open')
    expect(caseTabOf('closed')).toBe('closed')
    expect(caseTabOf('archived')).toBe('archived')
  })

  it('names the other person: the client for a lawyer, the lawyer for a client', () => {
    expect(otherParty(row(), 'lawyer')?.name).toBe('Tunde Bakare')
    expect(otherParty(row(), 'client')?.name).toBe('Adaeze Okonkwo')
  })

  it('filters by tab and searches the title, the number and the other person, most recently active first', () => {
    const list = [
      row({ id: 'old', lastActivityAt: '2026-11-01T10:00:00Z' }),
      row({ id: 'new', caseTitle: 'Unpaid salary', lastActivityAt: '2026-11-19T10:00:00Z' }),
      row({ id: 'shut', status: 'closed' }),
    ]
    expect(filterCases(list, 'open', '', 'lawyer').map(c => c.id)).toEqual(['new', 'old'])
    expect(filterCases(list, 'closed', '', 'lawyer').map(c => c.id)).toEqual(['shut'])
    expect(filterCases(list, 'open', 'salary', 'lawyer').map(c => c.id)).toEqual(['new'])
    expect(filterCases(list, 'open', 'thk-001', 'lawyer')).toHaveLength(2)
    // a lawyer searches by client; a client by lawyer
    expect(filterCases(list, 'open', 'tunde', 'lawyer')).toHaveLength(2)
    expect(filterCases(list, 'open', 'tunde', 'client')).toHaveLength(0)
    expect(filterCases(list, 'open', 'adaeze', 'client')).toHaveLength(2)
  })

  it('only gives a pill to a priority worth saying', () => {
    expect(priorityPill('urgent')).toBe('Urgent')
    expect(priorityPill('high')).toBe('High priority')
    expect(priorityPill('medium')).toBeNull()
    expect(priorityPill(null)).toBeNull()
  })
})

describe('dates', () => {
  it('reads a date-only value as that day, whatever the timezone', () => {
    expect(dayLabel('2026-12-14')).toBe('14 December 2026')
    expect(dayLabel('2026-12-14T00:00:00.000Z')).toBe('14 December 2026')
    expect(dayLabel(null)).toBeNull()
  })

  it('says when something is due, and when it is late', () => {
    expect(dueLine('2026-12-14', now)).toEqual({ text: 'Due 14 December', overdue: false })
    expect(dueLine('2026-11-20', now)).toEqual({ text: 'Due today', overdue: false })
    expect(dueLine('2026-11-21', now)).toEqual({ text: 'Due tomorrow', overdue: false })
    expect(dueLine('2026-11-03', now)).toEqual({ text: 'Overdue since 3 November', overdue: true })
    expect(dueLine(null, now)).toBeNull()
    // a finished task is never overdue
    expect(dueLine('2026-11-03', now, true)).toBeNull()
  })

  it('says how long ago', () => {
    expect(agoLabel('2026-11-20T07:00:00', now)).toBe('today')
    expect(agoLabel('2026-11-19T07:00:00', now)).toBe('yesterday')
    expect(agoLabel('2026-11-17T07:00:00', now)).toBe('3 days ago')
    expect(agoLabel('2026-11-02T07:00:00', now)).toBe('on 2 November 2026')
    expect(agoLabel(null, now)).toBe('')
  })
})

describe('the fee and the people', () => {
  it('writes the agreed fee with how it is charged', () => {
    expect(feeLine('150000.00', 'flat_fee')).toBe('₦150,000, flat fee')
    expect(feeLine(25000, 'hourly')).toBe('₦25,000, hourly')
    expect(feeLine('150000', null)).toBe('₦150,000')
    expect(feeLine(null, 'flat_fee')).toBeNull()
    expect(feeLine('0', 'flat_fee')).toBeNull()
  })

  it('names an account as You, or as the other person', () => {
    expect(nameOf('user-lawyer', row(), 'user-lawyer')).toBe('You')
    expect(nameOf('user-client', row(), 'user-lawyer')).toBe('Tunde Bakare')
    expect(nameOf('user-lawyer', row(), 'user-client')).toBe('Adaeze Okonkwo')
    // a profile id is not an account id: it names nobody
    expect(nameOf('client-profile', row(), 'user-lawyer')).toBe('Someone')
  })
})

describe('what a lawyer can do with a case', () => {
  it('depends on where it stands', () => {
    expect(statusMoves('active').map(move => move.to)).toEqual(['closed', 'archived'])
    expect(statusMoves('reopened').map(move => move.to)).toEqual(['closed', 'archived'])
    expect(statusMoves('closed').map(move => move.to)).toEqual(['reopened', 'archived'])
    expect(statusMoves('archived').map(move => move.to)).toEqual(['reopened'])
  })
})

describe('tasks', () => {
  it('lists open ones first, soonest due first, then finished ones', () => {
    const list = [
      task({ id: 'done', status: 'completed', completedAt: '2026-11-15T10:00:00Z' }),
      task({ id: 'undated' }),
      task({ id: 'later', dueDate: '2026-12-10' }),
      task({ id: 'soon', dueDate: '2026-11-25' }),
    ]
    expect(sortTasks(list).map(t => t.id)).toEqual(['soon', 'later', 'undated', 'done'])
  })

  it('sums them up', () => {
    expect(taskSummary([])).toBe('No tasks yet')
    expect(taskSummary([task(), task({ status: 'completed' })])).toBe('1 of 2 done')
  })
})
