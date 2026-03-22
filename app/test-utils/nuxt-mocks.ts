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

export const useToast = () => ({
  add: vi.fn()
})

export const useRouter = () => ({
  push: vi.fn()
})

export const navigateTo = vi.fn()