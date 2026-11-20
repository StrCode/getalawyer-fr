import { describe, expect, it } from 'vitest'
import { isWorkspaceLinkActive, workspaceNavFor, workspaceTabs } from '../app/lib/workspace-nav'

describe('workspaceNavFor', () => {
  it('gives a lawyer a Practice menu and Membership in the account menu', () => {
    const nav = workspaceNavFor('lawyer')
    expect(nav.bar.map(l => l.label)).toEqual(['Overview', 'Appointments', 'Messages', 'Cases'])
    expect(nav.practice.map(l => l.label)).toEqual(['Profile', 'Consultation types', 'Availability'])
    expect(nav.account.map(l => l.label)).toEqual(['Membership', 'Settings'])
  })

  it('gives a client no Practice menu and no Membership', () => {
    const nav = workspaceNavFor('client')
    expect(nav.practice).toEqual([])
    expect(nav.account.map(l => l.label)).toEqual(['Profile', 'Settings'])
    expect([...nav.bar, ...nav.account].some(l => l.label === 'Membership')).toBe(false)
  })

  it('is empty until the account type is known', () => {
    expect(workspaceNavFor(undefined)).toEqual({ bar: [], practice: [], account: [] })
  })
})

describe('isWorkspaceLinkActive', () => {
  it('lights the overview only on the overview', () => {
    const overview = { to: '/dashboard', exact: true }
    expect(isWorkspaceLinkActive('/dashboard', overview)).toBe(true)
    expect(isWorkspaceLinkActive('/dashboard/', overview)).toBe(true)
    expect(isWorkspaceLinkActive('/dashboard/messages', overview)).toBe(false)
  })

  it('lights a section on its own page and the pages under it', () => {
    const messages = { to: '/dashboard/messages' }
    expect(isWorkspaceLinkActive('/dashboard/messages', messages)).toBe(true)
    expect(isWorkspaceLinkActive('/dashboard/messages/abc', messages)).toBe(true)
    expect(isWorkspaceLinkActive('/dashboard/messages-archive', messages)).toBe(false)
  })
})

describe('workspaceTabs', () => {
  it('gives a lawyer four tabs and a More sheet with Practice and account pages', () => {
    const { tabs, more } = workspaceTabs(workspaceNavFor('lawyer'))
    expect(tabs.map(l => l.label)).toEqual(['Overview', 'Appointments', 'Messages', 'Cases'])
    expect(more.map(l => l.label)).toEqual(['Profile', 'Consultation types', 'Availability', 'Membership', 'Settings'])
  })

  it('gives a client five tabs and no More', () => {
    const { tabs, more } = workspaceTabs(workspaceNavFor('client'))
    expect(tabs).toHaveLength(5)
    expect(more).toEqual([])
  })
})
