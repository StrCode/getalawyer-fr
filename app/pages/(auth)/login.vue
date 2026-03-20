<template>
  <div class="flex bg-white w-full h-screen overflow-hidden">

    <!-- Left Column: Form -->
    <div class="flex flex-col bg-white w-full lg:w-[52%] overflow-y-auto">
      <div class="flex flex-col justify-center px-10 sm:px-16 py-12 min-h-full">
        <div class="mx-auto w-full max-w-md">

          <!-- Logo -->
          <NuxtLink to="/" class="inline-flex items-center gap-2.5 mb-10">
            <div class="flex flex-shrink-0 justify-center items-center bg-[#1d6b44] rounded-lg w-8 h-8">
              <Icon name="i-hugeicons-legal-document-02" class="w-4 h-4 text-white" />
            </div>
            <span class="font-bold text-[18px] text-gray-900 tracking-tight">
              Lex<span class="text-[#1d6b44]">Connect</span>
            </span>
          </NuxtLink>

          <!-- Heading -->
          <h1 class="mb-6 font-bold text-[26px] text-gray-900 tracking-tight">
            Welcome back!
          </h1>

          <!-- Social Login Buttons -->
          <div class="space-y-3 mb-5">

            <!-- Google -->
            <button
              type="button"
              :disabled="isSubmitting"
              class="flex justify-center items-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2.5 border border-gray-200 rounded-lg w-full font-medium text-gray-700 text-sm transition-colors cursor-pointer"
              @click="handleSocialLogin('google')"
            >
              <svg class="flex-shrink-0 w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <!-- Facebook -->
            <button
              type="button"
              :disabled="isSubmitting"
              class="flex justify-center items-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2.5 border border-gray-200 rounded-lg w-full font-medium text-gray-700 text-sm transition-colors cursor-pointer"
              @click="handleSocialLogin('facebook')"
            >
              <svg class="flex-shrink-0 w-5 h-5" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" fill="#1877F2"/>
              </svg>
              Continue with Facebook
            </button>

          </div>

          <!-- Divider -->
          <div class="relative flex items-center gap-3 mb-5">
            <div class="flex-1 bg-gray-200 h-px" />
            <span class="flex-shrink-0 text-gray-400 text-xs">or</span>
            <div class="flex-1 bg-gray-200 h-px" />
          </div>

          <!-- Email/Password Form -->
          <UForm :state="formData" class="space-y-4" @submit="handleSubmit">

            <UFormField label="Email" name="email">
              <UInput
                v-model="formData.email"
                type="email"
                placeholder="alex@example.com"
                size="lg"
                :disabled="isSubmitting"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Password" name="password">
              <UInput
                v-model="formData.password"
                type="password"
                placeholder="••••••••"
                size="lg"
                :disabled="isSubmitting"
                class="w-full"
              />
            </UFormField>

            <!-- Error -->
            <div
              v-if="error"
              class="flex items-start gap-2 bg-red-50 p-3 border border-red-100 rounded-lg text-red-600 text-sm"
            >
              <Icon name="i-hugeicons-alert-circle" class="mt-0.5 w-4 h-4 shrink-0" />
              <span>{{ error }}</span>
            </div>

            <!-- Submit -->
            <UButton
              type="submit"
              size="lg"
              block
              :loading="isSubmitting"
              :disabled="isSubmitting"
              class="flex justify-center items-center gap-3 !bg-[#1d6b44] bg-white hover:!bg-[#175537] hover:bg-gray-50 disabled:opacity-50 mt-2 px-4 py-2.5 border border-gray-200 rounded-lg w-full font-medium font-semibold !text-white text-gray-700 text-sm transition-colors cursor-pointer"
            >
              Log in
            </UButton>

          </UForm>

          <!-- Forgot password -->
          <NuxtLink
            to="/forgot-password"
            class="block mt-4 text-[#1d6b44] text-sm hover:underline"
          >
            Forgot your password?
          </NuxtLink>

          <!-- Terms -->
          <p class="mt-4 text-gray-400 text-xs leading-relaxed">
            By continuing with Google, Apple, or Email, you agree to LexConnect's
            <NuxtLink to="/terms" class="text-gray-500 underline">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/privacy" class="text-gray-500 underline">Privacy Policy</NuxtLink>.
          </p>

          <!-- Sign up -->
          <p class="mt-6 text-gray-500 text-sm text-center">
            Don't have an account?
            <NuxtLink to="/register" class="font-semibold text-[#1d6b44] hover:underline">
              Sign up
            </NuxtLink>
          </p>

        </div>
      </div>
    </div>

    <!-- Right Column: Decorative -->
    <div class="hidden lg:flex flex-col justify-between items-center bg-[#f5f0e8] px-10 py-10 lg:w-[48%]">

      <!-- Illustration -->
      <div class="flex flex-1 justify-center items-center w-full">
        <svg viewBox="0 0 320 280" width="300" height="260" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="160" cy="232" rx="130" ry="16" fill="#e0d9ce" opacity="0.5"/>
          <rect x="58" y="188" width="62" height="10" rx="2" fill="#c8b89a"/>
          <rect x="61" y="178" width="58" height="11" rx="2" fill="#b8a88a"/>
          <rect x="64" y="168" width="54" height="11" rx="2" fill="#d4c4a8"/>
          <rect x="108" y="118" width="104" height="112" rx="6" fill="#ffffff" stroke="#e0d9ce" stroke-width="1"/>
          <rect x="118" y="132" width="64" height="5" rx="2" fill="#ddd"/>
          <rect x="118" y="142" width="84" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="149" width="78" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="156" width="84" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="163" width="68" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="173" width="84" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="180" width="72" height="3" rx="1.5" fill="#ece7de"/>
          <circle cx="153" cy="208" r="13" fill="#e8f5ee" stroke="#1d6b44" stroke-width="1.2"/>
          <text x="153" y="212" text-anchor="middle" font-size="8" fill="#1d6b44" font-family="sans-serif" font-weight="700">NBA</text>
          <rect x="196" y="144" width="40" height="15" rx="4" fill="#8B6914" transform="rotate(-35 212 151)"/>
          <rect x="202" y="160" width="7" height="44" rx="3" fill="#a07820" transform="rotate(-35 205 182)"/>
          <line x1="80" y1="98" x2="80" y2="165" stroke="#aaa" stroke-width="1.5"/>
          <line x1="54" y1="116" x2="106" y2="116" stroke="#aaa" stroke-width="1.5"/>
          <line x1="54" y1="116" x2="54" y2="130" stroke="#bbb" stroke-width="1"/>
          <line x1="66" y1="116" x2="66" y2="130" stroke="#bbb" stroke-width="1"/>
          <path d="M50 130 Q50 140 60 142 Q70 140 70 130 Z" fill="#ccc" opacity="0.8"/>
          <line x1="94" y1="116" x2="94" y2="125" stroke="#bbb" stroke-width="1"/>
          <line x1="106" y1="116" x2="106" y2="125" stroke="#bbb" stroke-width="1"/>
          <path d="M90 125 Q90 136 100 138 Q110 136 110 125 Z" fill="#ccc" opacity="0.8"/>
          <rect x="73" y="164" width="14" height="4" rx="2" fill="#aaa"/>
          <rect x="67" y="167" width="26" height="4" rx="2" fill="#bbb"/>
          <circle cx="248" cy="93" r="19" fill="#d4c4a8"/>
          <path d="M226 148 Q226 120 248 118 Q270 120 270 148" fill="#2d4a3e"/>
          <path d="M241 118 L248 130 L255 118" fill="#1d6b44" opacity="0.85"/>
          <rect x="258" y="136" width="24" height="17" rx="3" fill="#8B6914"/>
          <rect x="263" y="133" width="14" height="5" rx="2" fill="none" stroke="#8B6914" stroke-width="1.5"/>
          <line x1="258" y1="144" x2="282" y2="144" stroke="#a07820" stroke-width="1"/>
          <path d="M292 58 L294 52 L296 58 L302 60 L296 62 L294 68 L292 62 L286 60 Z" fill="#f0c040" opacity="0.65"/>
          <path d="M42 72 L43.5 67 L45 72 L50 73.5 L45 75 L43.5 80 L42 75 L37 73.5 Z" fill="#f0c040" opacity="0.5"/>
          <circle cx="296" cy="100" r="3" fill="#f0c040" opacity="0.35"/>
          <circle cx="38" cy="115" r="2" fill="#f0c040" opacity="0.35"/>
          <circle cx="292" cy="148" r="11" fill="#e8f5ee"/>
          <path d="M287 148 L291 152 L297 143" stroke="#1d6b44" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="40" cy="158" r="9" fill="#e8f5ee"/>
          <path d="M36 158 L39 161 L44 154" stroke="#1d6b44" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Bottom strip -->
      <div class="flex justify-between items-center gap-4 pt-5 border-black/10 border-t w-full">
        <div>
          <p class="mb-0.5 font-semibold text-gray-800 text-sm">Take LexConnect with you</p>
          <p class="text-gray-500 text-xs leading-relaxed">
            Find verified lawyers on our mobile app<br>for iOS and Android.
          </p>
        </div>
        <div class="flex flex-shrink-0 justify-center items-center bg-white p-1.5 rounded-lg w-[52px] h-[52px]">
          <svg viewBox="0 0 44 44" width="40" height="40">
            <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="#222" stroke-width="2"/>
            <rect x="6" y="6" width="8" height="8" fill="#222"/>
            <rect x="26" y="2" width="16" height="16" rx="2" fill="none" stroke="#222" stroke-width="2"/>
            <rect x="30" y="6" width="8" height="8" fill="#222"/>
            <rect x="2" y="26" width="16" height="16" rx="2" fill="none" stroke="#222" stroke-width="2"/>
            <rect x="6" y="30" width="8" height="8" fill="#222"/>
            <rect x="26" y="26" width="4" height="4" fill="#222"/>
            <rect x="32" y="26" width="4" height="4" fill="#222"/>
            <rect x="38" y="26" width="4" height="4" fill="#222"/>
            <rect x="26" y="32" width="4" height="4" fill="#222"/>
            <rect x="32" y="38" width="4" height="4" fill="#222"/>
            <rect x="38" y="32" width="4" height="4" fill="#222"/>
            <rect x="38" y="38" width="4" height="4" fill="#222"/>
          </svg>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const formData = reactive({
  email: '',
  password: '',
})

const isSubmitting = ref(false)
const error = ref('')

const handleSocialLogin = async (provider: 'google' | 'facebook') => {
  isSubmitting.value = true
  error.value = ''
  try {
    await authClient.signIn.social({ 
      provider,
      callbackURL: '/dashboard'
    })
  } catch (err: any) {
    error.value = err?.message || `Failed to sign in with ${provider}.`
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  error.value = ''

  if (!formData.email || !formData.password) {
    error.value = 'Please fill in all fields.'
    return
  }

  isSubmitting.value = true

  try {
    const { data, error: signInError } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
    })

    if (signInError) {
      error.value = signInError.message || 'The email or password is incorrect. Please try again.'
      isSubmitting.value = false
      return
    }

    // Wait a moment for the session to be set
    await new Promise(resolve => setTimeout(resolve, 100))
    
    await navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err?.message || 'An unexpected error occurred.'
  } finally {
    isSubmitting.value = false
  }
}
</script>