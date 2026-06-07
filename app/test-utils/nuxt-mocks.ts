// Mock Nuxt composables for testing
export const useNuxtApp = () => ({
  $fetch: vi.fn()
})

import { DEV_API_URL, DEV_BETTER_AUTH_URL } from '~/lib/api-config'

export const useRuntimeConfig = () => ({
  public: {
    apiUrl: DEV_API_URL,
    betterAuthUrl: DEV_BETTER_AUTH_URL,
  }
})

export const useAuth = () => ({
  session: ref({
    user: {
      id: 'test-user-id',
      userType: 'lawyer',
      name: 'Test User'
    }
  })
})

export const useApiErrorHandler = () => ({
  handleApiError: vi.fn()
})

const toastFn = vi.fn()
export const toast = Object.assign(toastFn, {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  promise: vi.fn(),
  dismiss: vi.fn()
})

export const useRouter = () => ({
  push: vi.fn()
})

export const navigateTo = vi.fn()
