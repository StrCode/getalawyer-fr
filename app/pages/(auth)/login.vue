<template>
  <div class="h-screen w-full flex overflow-hidden bg-white">
    <!-- Left Column: Hero Image -->
    <div class="hidden lg:flex lg:w-1/2 relative">
      <!-- Image Background -->
      <div 
        class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style="background-image: url('/images/legal_hero.png');"
      ></div>
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
      
      <!-- Content Overlay -->
      <div class="relative z-10 p-12 flex flex-col justify-end w-full">
        <!-- Logo -->
        <NuxtLink to="/" class="absolute top-12 left-12 inline-flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Icon name="i-hugeicons-legal-document-02" class="w-5 h-5 text-white" />
          </div>
          <span class="text-xl font-semibold text-white tracking-tight">GetALawyer</span>
        </NuxtLink>

        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Join the future of <br/>legal services.
        </h1>
        <p class="text-lg text-white/80 max-w-md">
          Whether you're looking for expert legal counsel or growing your law practice, GetALawyer provides the tools and connections you need.
        </p>

        <!-- Testimonial/Trust Badge -->
        <div class="mt-8 flex items-center gap-4">
          <div class="flex -space-x-3">
            <div class="w-10 h-10 rounded-full bg-gray-300 border-2 border-black/80"></div>
            <div class="w-10 h-10 rounded-full bg-gray-400 border-2 border-black/80"></div>
            <div class="w-10 h-10 rounded-full bg-gray-500 border-2 border-black/80 flex items-center justify-center text-xs text-white font-medium">+2k</div>
          </div>
          <div class="text-sm text-white/70">
            Trusted by thousands of users<br/>and certified attorneys.
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Login Form -->
    <div class="w-full lg:w-1/2 flex flex-col h-full bg-white relative">
      
      <!-- Mobile Logo (hidden on lg) -->
      <div class="lg:hidden p-6 absolute top-0 left-0 w-full flex justify-between items-center z-10">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="i-hugeicons-legal-document-02" class="w-4 h-4 text-white" />
          </div>
          <span class="text-lg font-bold text-gray-900 tracking-tight">GetALawyer</span>
        </NuxtLink>
      </div>

      <!-- Form Container -->
      <div class="flex-1 overflow-y-auto w-full pt-24 lg:pt-0">
        <div class="min-h-full flex items-center justify-center p-6 sm:p-12">
          <div class="w-full max-w-md mx-auto">
            
            <div class="text-center mb-8">
              <h2 class="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
              <p class="text-gray-500">
                Log in to your account.
              </p>
            </div>

            <!-- Form -->
            <UForm :state="formData" class="space-y-5" @submit="handleSubmit">
              <UFormField label="Email Address" name="email" required>
                <UInput
                  v-model="formData.email"
                  type="email"
                  placeholder="alex@example.com"
                  size="lg"
                  :disabled="isSubmitting"
                  class="font-medium"
                />
              </UFormField>

              <UFormField label="Password" name="password" required>
                <UInput
                  v-model="formData.password"
                  type="password"
                  placeholder="••••••••"
                  size="lg"
                  :disabled="isSubmitting"
                />
              </UFormField>

              <div class="flex items-center justify-between !mt-2">
                <UCheckbox v-model="formData.rememberMe" label="Remember me" :disabled="isSubmitting" />
                <NuxtLink to="/forgot-password" class="text-sm font-medium text-gray-900 hover:underline">
                  Forgot password?
                </NuxtLink>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="p-3 mt-4 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm flex items-start gap-2">
                <Icon name="i-hugeicons-alert-circle" class="w-5 h-5 shrink-0" />
                <span>{{ error }}</span>
              </div>

              <!-- Submit Button -->
              <UButton
                type="submit"
                color="neutral"
                size="lg"
                block
                class="mt-6 font-semibold"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                Log In
              </UButton>

              <div class="text-center mt-6">
                <p class="text-sm text-gray-500">
                  Don't have an account?
                  <NuxtLink to="/register" class="text-gray-900 font-semibold hover:underline">
                    Sign up
                  </NuxtLink>
                </p>
              </div>
            </UForm>
          </div>
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
  rememberMe: false
})

const isSubmitting = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''

  if (!formData.email || !formData.password) {
    error.value = 'Please fill in all fields'
    return
  }

  isSubmitting.value = true

  try {
    const { data, error: signInError } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    })

    if (signInError) {
      error.value = signInError.message || 'The email or password is incorrect. Please try again.'
      isSubmitting.value = false
      return
    }

    // Success - redirect to dashboard
    window.location.href = '/dashboard'
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'An unexpected error occurred'
    isSubmitting.value = false
  }
}
</script>