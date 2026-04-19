// Mock Nuxt composables for testing
export const useNuxtApp = () => ({
  $fetch: vi.fn()
})

export const useRuntimeConfig = () => ({
  public: {
    apiUrl: 'http://localhost:3000'
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
