/**
 * TaskManager Component Tests
 * Feature: case-management-system
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskManager from '../TaskManager.vue'

// Mock composables
vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    session: {
      value: {
        user: {
          id: 'test-user-id',
          userType: 'lawyer'
        }
      }
    }
  })
}))

vi.mock('~/composables/useTasks', () => ({
  useTasks: () => ({
    tasks: { value: [] },
    loading: { value: false },
    error: { value: null },
    taskStats: {
      value: {
        total: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0
      }
    },
    fetchCaseTasks: vi.fn().mockResolvedValue({ tasks: [], total: 0 }),
    createTask: vi.fn().mockResolvedValue({
      id: 'test-task-id',
      title: 'Test Task',
      status: 'pending',
      priority: 'medium'
    }),
    clearError: vi.fn()
  })
}))

// Mock Nuxt UI components
vi.mock('#components', () => ({
  UCard: { template: '<div><slot name="header" /><slot /></div>' },
  UButton: { template: '<button><slot /></button>' },
  UInput: { template: '<input />' },
  UTextarea: { template: '<textarea />' },
  USelectMenu: { template: '<select />' },
  UFormGroup: { template: '<div><slot /></div>' },
  UIcon: { template: '<span />' }
}))

describe('TaskManager', () => {
  it('renders task manager interface for lawyers', () => {
    const wrapper = mount(TaskManager, {
      props: {
        caseId: 'test-case-id',
        clientId: 'test-client-id'
      },
      global: {
        stubs: {
          UCard: true,
          UButton: true,
          UInput: true,
          UTextarea: true,
          USelectMenu: true,
          UFormGroup: true,
          UIcon: true,
          TaskList: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays task statistics', () => {
    const wrapper = mount(TaskManager, {
      props: {
        caseId: 'test-case-id',
        clientId: 'test-client-id'
      },
      global: {
        stubs: {
          UCard: true,
          UButton: true,
          UInput: true,
          UTextarea: true,
          USelectMenu: true,
          UFormGroup: true,
          UIcon: true,
          TaskList: true
        }
      }
    })

    expect(wrapper.html()).toContain('Total Tasks')
    expect(wrapper.html()).toContain('Completed')
    expect(wrapper.html()).toContain('In Progress')
    expect(wrapper.html()).toContain('Overdue')
  })
})
