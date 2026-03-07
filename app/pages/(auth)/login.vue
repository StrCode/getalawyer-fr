<template>
  <div class="min-h-screen bg-white flex flex-col">

    <!-- Navbar -->
    <header class="flex items-center justify-between px-8 py-5">
      <div class="flex items-center gap-1">
        <div class="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
          <div class="w-2.5 h-2.5 rounded-full bg-white" />
        </div>
        <span class="text-gray-900 font-bold text-lg leading-none">.</span>
      </div>
      <NuxtLink
        to="/register"
        class="text-xs font-bold tracking-widest text-gray-900 hover:text-gray-600 transition-colors uppercase"
      >
        Create Account
      </NuxtLink>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center justify-center px-4 py-12">

      <!-- Heading -->
      <div class="text-center mb-10">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">
          Log into Bio Sites
        </h1>
        <p class="text-sm text-gray-500">
          With your Squarespace Account
        </p>
      </div>

      <!-- Two Column Layout -->
      <div class="w-full max-w-2xl flex gap-0">

        <!-- Left: Email + Password Form -->
        <div class="flex-1 pr-10 border-r border-gray-200">
          <!-- Email -->
          <div class="mb-6">
            <label class="block text-xs font-bold tracking-widest text-gray-700 uppercase mb-2">
              Email Address
            </label>
            <input
              v-model="email"
              type="email"
              class="w-full border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none pb-2 text-sm text-gray-900 bg-transparent transition-colors"
            />
          </div>

          <!-- Password -->
          <div class="mb-3">
            <label class="block text-xs font-bold tracking-widest text-gray-700 uppercase mb-2">
              Password
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none pb-2 text-sm text-gray-900 bg-transparent transition-colors pr-8"
              />
              <button
                type="button"
                class="absolute right-0 top-0 text-gray-400 hover:text-gray-700 transition-colors"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <p v-if="errorMessage" class="text-red-500 text-xs mb-5">
            {{ errorMessage }}
          </p>
          <div v-else class="mb-5" />

          <!-- Log In Button -->
          <button
            class="w-full bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold tracking-widest uppercase py-4 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
            @click="handleLogin"
          >
            {{ loading ? 'Logging in...' : 'Log In' }}
          </button>
        </div>

        <!-- OR Divider -->
        <div class="flex items-center justify-center px-6 text-xs font-semibold text-gray-400 tracking-widest uppercase self-center">
          or
        </div>

        <!-- Right: OAuth Buttons -->
        <div class="flex-1 pl-4 flex flex-col gap-3 justify-center">
          <!-- Google -->
          <button
            class="w-full flex items-center border border-gray-900 py-4 px-5 hover:bg-gray-50 transition-colors cursor-pointer gap-5"
            @click="handleOAuth('google')"
          >
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span class="text-sm font-bold text-gray-900">Continue with Google</span>
          </button>

          <!-- Apple -->
          <button
            class="w-full flex items-center border border-gray-900 py-4 px-5 hover:bg-gray-50 transition-colors cursor-pointer gap-5"
            @click="handleOAuth('apple')"
          >
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span class="text-sm font-bold text-gray-900">Continue with Apple</span>
          </button>

          <!-- Facebook -->
          <button
            class="w-full flex items-center border border-gray-900 py-4 px-5 hover:bg-gray-50 transition-colors cursor-pointer gap-5"
            @click="handleOAuth('facebook')"
          >
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#1877F2"/>
              <path d="M16.5 8H14c-.3 0-.5.2-.5.5V10H16l-.3 2.5H13.5V19h-3v-6.5H9V10h1.5V8.5C10.5 6.6 11.8 5 14 5h2.5v3z" fill="white"/>
            </svg>
            <span class="text-sm font-bold text-gray-900">Continue with Facebook</span>
          </button>
        </div>
      </div>

      <!-- Can't Log In -->
      <div class="mt-10 text-center">
        <p class="text-xs font-bold tracking-widest uppercase text-gray-900 mb-6">
          Can't Log In?
        </p>
        <p class="text-xs text-gray-500">
          Secure Login with reCAPTCHA subject to Google<br />
          <NuxtLink to="/terms" class="underline hover:text-gray-700 transition-colors">Terms</NuxtLink>
          &amp;
          <NuxtLink to="/privacy" class="underline hover:text-gray-700 transition-colors">Privacy</NuxtLink>
        </p>
      </div>

      <!-- Bio Sites from Squarespace -->
      <div class="mt-16">
        <p class="text-xs font-bold tracking-widest uppercase text-gray-400">
          Bio Sites from Squarespace
        </p>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
})

type Schema = z.output<typeof loginSchema>

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  // Validate inputs
  const result = loginSchema.safeParse({
    email: email.value,
    password: password.value,
  })

  if (!result.success) {
    errorMessage.value = result.error.errors[0].message
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await authClient.signIn.email({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
    })

    if (error) {
      errorMessage.value = error.message || 'The username or password is incorrect. Please try again.'
      loading.value = false
      return
    }

    // Success - redirect to dashboard
    window.location.href = '/dashboard'
  } catch (err: any) {
    console.error('Login error:', err)
    errorMessage.value = err.message || 'An error occurred during login'
    loading.value = false
  }
}

const handleOAuth = async (provider: string) => {
  try {
    if (provider === 'google') {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      })
    } else if (provider === 'apple') {
      await authClient.signIn.social({
        provider: 'apple',
        callbackURL: '/dashboard',
      })
    } else if (provider === 'facebook') {
      await authClient.signIn.social({
        provider: 'facebook',
        callbackURL: '/dashboard',
      })
    }
  } catch (error) {
    console.error(`${provider} OAuth error:`, error)
    errorMessage.value = `Failed to sign in with ${provider}`
  }
}
</script>