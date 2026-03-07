import { vi } from 'vitest'

// Mock Nuxt composables for testing
export const useHead = vi.fn()
export const navigateTo = vi.fn()
export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}))
export const useRoute = vi.fn(() => ({
  path: '/',
  query: {},
  params: {},
}))
