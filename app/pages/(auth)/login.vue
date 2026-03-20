<template>
  <div class="flex bg-white w-full h-screen overflow-hidden">

    <!-- Left Column: Form -->
    <div class="flex flex-col bg-white w-full lg:w-[52%] overflow-y-auto">
      <div class="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 min-h-full">
        <div class="mx-auto w-full max-w-md">

          <!-- Logo -->
          <AuthLogo class="mb-10" />

          <!-- Heading -->
          <h1 class="mb-6 font-bold text-[26px] text-gray-900 tracking-tight">
            Welcome back!
          </h1>

          <!-- Social Login Buttons -->
          <div class="space-y-3 mb-6">
            <AuthSocialButton 
              provider="google" 
              :disabled="isSubmitting"
              :loading="socialProvider === 'google'"
              @click="handleSocialLogin('google')"
            >
              Continue with Google
            </AuthSocialButton>

            <AuthSocialButton 
              provider="facebook" 
              :disabled="isSubmitting"
              :loading="socialProvider === 'facebook'"
              @click="handleSocialLogin('facebook')"
            >
              Continue with Facebook
            </AuthSocialButton>
          </div>

          <!-- Divider -->
          <AuthDivider class="mb-6" />

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
            <UAlert
              v-if="error"
              color="error"
              variant="soft"
              :title="error"
              icon="i-hugeicons-alert-circle"
            />

            <!-- Submit -->
            <UButton
              type="submit"
              size="lg"
              color="primary"
              block
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              Log in
            </UButton>

          </UForm>

          <!-- Forgot password -->
          <NuxtLink
            to="/forgot-password"
            class="block mt-4 text-primary-600 hover:text-primary-700 text-sm hover:underline"
          >
            Forgot your password?
          </NuxtLink>

          <!-- Terms -->
          <p class="mt-6 text-gray-500 text-sm leading-relaxed">
            By continuing with Google, Apple, or Email, you agree to LexConnect's
            <NuxtLink to="/terms" class="text-gray-700 hover:text-gray-900 underline">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/privacy" class="text-gray-700 hover:text-gray-900 underline">Privacy Policy</NuxtLink>.
          </p>

          <!-- Sign up -->
          <p class="mt-6 text-gray-500 text-sm text-center">
            Don't have an account?
            <NuxtLink to="/register" class="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
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
        <AuthLegalIllustration />
      </div>

      <!-- Bottom strip -->
      <div class="flex justify-between items-center gap-4 pt-6 border-black/10 border-t w-full">
        <div>
          <p class="mb-1 font-semibold text-gray-800 text-sm">Take LexConnect with you</p>
          <p class="text-gray-600 text-sm leading-relaxed">
            Find verified lawyers on our mobile app<br>for iOS and Android.
          </p>
        </div>
        <AuthQRCode />
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
const socialProvider = ref<'google' | 'facebook' | null>(null)
const error = ref('')

const handleSocialLogin = async (provider: 'google' | 'facebook') => {
  socialProvider.value = provider
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
    socialProvider.value = null
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