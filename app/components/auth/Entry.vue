<!-- components/auth/AuthEntry.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

declare global {
  interface Window {
    google?: any;
  }
}

const emit = defineEmits<{ push: [view: string] }>()
const { identifier } = useAuthModal()

const country = ref('+234')
const phone = ref('')
const loading = ref(false)
const errorMessage = ref('')
const config = useRuntimeConfig()

const countries = [
  { label: '🇳🇬 Nigeria (+234)', value: '+234' },
  { label: '🇺🇸 United States (+1)', value: '+1' },
  { label: '🇬🇧 United Kingdom (+44)', value: '+44' },
  { label: '🇨🇦 Canada (+1)', value: '+1' },
  { label: '🇦🇺 Australia (+61)', value: '+61' },
  { label: '🇿🇦 South Africa (+27)', value: '+27' },
  { label: '🇰🇪 Kenya (+254)', value: '+254' },
  { label: '🇬🇭 Ghana (+233)', value: '+233' },
]

onMounted(() => {
  if (!import.meta.client) return

  const checkGoogleLoaded = setInterval(() => {
    if (window.google) {
      clearInterval(checkGoogleLoaded)
      window.google.accounts.id.initialize({
        client_id: config.public.googleClientId,
        callback: handleGoogleCredentialResponse,
        context: 'signin',
      })
    }
  }, 100)

  setTimeout(() => clearInterval(checkGoogleLoaded), 5000)
})

function handleGoogleCredentialResponse(response: any) {
  const idToken = response.credential
  // TODO: Send token to backend
  console.log('Google auth token:', idToken)
}

async function onSubmit() {
  errorMessage.value = ''

  if (!country.value) {
    errorMessage.value = 'Please select a country'
    return
  }

  if (!phone.value || phone.value.length < 5) {
    errorMessage.value = 'Please enter a valid phone number'
    return
  }

  if (!/^\d+$/.test(phone.value)) {
    errorMessage.value = 'Phone number must contain only digits'
    return
  }

  loading.value = true

  try {
    const api = useApi()
    const phoneNumber = `${country.value}${phone.value}`
    identifier.value = phoneNumber

    type AccountExistenceResponse = {
      status: string
      status_code: string
      message: string
      data: {
        exists: boolean
        name?: string
        email?: string | null
        phone?: string
      }
      timestamp: string
    }

    const existenceResponse = await api.fetchPost<AccountExistenceResponse>(
      '/auth/check-account-existence',
      { phone_number: phoneNumber },
      { requiresAuth: false }
    )

    if (existenceResponse.data.exists) {
      console.log('Phone exists, navigating to password page')
      emit("push", "password")
    } else {
      emit("push", "signup")
    }
  } catch (error: any) {
    console.error('Phone verification failed:', error)
    errorMessage.value = error.data?.message || 'Failed to send verification code. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  if (!window.google) {
    errorMessage.value = 'Google Sign-In is not loaded. Please refresh and try again.'
    return
  }
  window.google.accounts.id.prompt()
}

async function handleFacebookLogin() {
  console.log('Facebook login not implemented yet')
  errorMessage.value = 'Facebook login is not yet available. Please use email or phone.'
}

async function handleAppleLogin() {
  console.log('Apple login not implemented yet')
  errorMessage.value = 'Apple login is not yet available. Please use email or phone.'
}
</script>

<template>
  <div class="p-6">
    <!-- Logo -->
    <div class="flex justify-center mb-6">
      <img src="/getalawyer-logo.svg" alt="GetALawyer" class="h-10 w-auto" />
    </div>

    <h2 class="mb-2 font-bold text-[24px] text-gray-900 tracking-tight text-center">
      Welcome to GetALawyer
    </h2>
    <p class="mb-6 text-gray-500 text-sm text-center">
      Connect with qualified legal professionals across Nigeria
    </p>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      :title="errorMessage"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'error', variant: 'link' }"
      class="mb-4"
      @close="errorMessage = ''"
    />

    <form @submit.prevent="onSubmit">
      <div class="mb-3 flex gap-2">
        <USelectMenu
          v-model="country"
          :items="countries"
          size="xl"
          class="w-44"
        />
        <UInput
          v-model="phone"
          type="tel"
          placeholder="Phone number"
          size="xl"
          class="flex-1"
          @keyup.enter="onSubmit"
        />
      </div>

      <p class="mb-4 text-gray-500 text-xs leading-relaxed">
        We'll call or text you to confirm your number. Standard message and data rates apply.
        <a href="#" class="text-gray-700 underline hover:text-gray-900">Privacy Policy</a>
      </p>

      <UButton
        type="submit"
        :loading="loading"
        block
        size="xl"
        color="primary"
        class="mb-5 rounded-xl font-semibold"
      >
        {{ loading ? 'Checking...' : 'Continue' }}
      </UButton>
    </form>

    <!-- Divider -->
    <div class="flex items-center gap-3 mb-5 text-gray-400 text-sm">
      <div class="flex-1 bg-gray-200 h-px" />
      <span>or</span>
      <div class="flex-1 bg-gray-200 h-px" />
    </div>

    <!-- Social buttons -->
    <div class="flex flex-col gap-3">
      <button
        class="flex items-center gap-3 hover:bg-gray-50 px-4 py-3.5 border border-gray-300 hover:border-gray-400 rounded-xl w-full font-semibold text-gray-900 text-sm transition-all"
        @click="emit('push', 'email')"
      >
        <UIcon name="i-heroicons-envelope" class="w-5 h-5 shrink-0 text-gray-600" />
        <span class="flex-1 text-center">Continue with email</span>
        <span class="w-5" />
      </button>

      <button 
        class="flex items-center gap-3 hover:bg-gray-50 px-4 py-3.5 border border-gray-300 hover:border-gray-400 rounded-xl w-full font-semibold text-gray-900 text-sm transition-all"
        @click="handleGoogleLogin"
      >
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 32 32">
          <g fill="none">
            <path d="m30.7 16.34c0-1.06-.1-2.09-.27-3.07h-14.13v5.8h8.07c-.35 1.87-1.4 3.46-2.99 4.53v3.76h4.85c2.84-2.61 4.47-6.46 4.47-11.02z" fill="#4285f4" />
            <path d="m16.3 31c4.05 0 7.45-1.34 9.93-3.63l-4.85-3.76c-1.34.9-3.06 1.43-5.08 1.43-3.91 0-7.21-2.64-8.39-6.18h-5.01v3.89c2.47 4.9 7.54 8.26 13.4 8.26z" fill="#34a853" />
            <path d="m7.91 18.85c-.3-.9-.47-1.86-.47-2.85s.17-1.95.47-2.85v-3.89h-5.01c-1.02 2.02-1.6 4.32-1.6 6.74s.58 4.71 1.6 6.74z" fill="#fbbc04" />
            <path d="m16.3 6.97c2.2 0 4.18.76 5.73 2.24l4.3-4.3c-2.6-2.42-5.99-3.91-10.03-3.91-5.86 0-10.93 3.36-13.4 8.26l5.01 3.89c1.18-3.55 4.49-6.18 8.39-6.18z" fill="#e94235" />
          </g>
        </svg>
        <span class="flex-1 text-center">Continue with Google</span>
        <span class="w-5" />
      </button>

      <button 
        class="flex items-center gap-3 hover:bg-gray-50 px-4 py-3.5 border border-gray-300 hover:border-gray-400 rounded-xl w-full font-semibold text-gray-900 text-sm transition-all"
        @click="handleAppleLogin"
      >
        <UIcon name="i-lucide-apple" class="w-5 h-5 shrink-0 text-gray-900" />
        <span class="flex-1 text-center">Continue with Apple</span>
        <span class="w-5" />
      </button>

      <button 
        class="flex items-center gap-3 hover:bg-gray-50 px-4 py-3.5 border border-gray-300 hover:border-gray-400 rounded-xl w-full font-semibold text-gray-900 text-sm transition-all"
        @click="handleFacebookLogin"
      >
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 32 32">
          <g fill="none" fill-rule="nonzero">
            <path d="m31.94 16c0-8.82-7.15-15.97-15.97-15.97-8.82 0-15.97 7.15-15.97 15.97 0 7.49 5.16 13.77 12.11 15.5v-10.62h-3.29v-4.88h3.29v-2.1c0-5.43 2.46-7.95 7.8-7.95 1.01 0 2.76.2 3.47.4v4.42c-.38-.04-1.03-.06-1.84-.06-2.62 0-3.63.99-3.63 3.57v1.73h5.22l-.9 4.88h-4.32v10.97c7.91-.95 14.03-7.69 14.03-15.85z" fill="#0866ff" />
            <path d="m22.22 20.85.9-4.88h-5.22v-1.73c0-2.58 1.01-3.57 3.63-3.57.81 0 1.46.02 1.84.06v-4.42c-.71-.2-2.46-.4-3.47-.4-5.34 0-7.8 2.52-7.8 7.95v2.1h-3.29v4.88h3.29v10.62c1.24.31 2.53.47 3.86.47.65 0 1.3-.04 1.93-.12v-10.97h4.32z" fill="#fff" />
          </g>
        </svg>
        <span class="flex-1 text-center">Continue with Facebook</span>
        <span class="w-5" />
      </button>
    </div>
  </div>
</template>
