<template>
  <div class="flex bg-white w-full h-screen overflow-hidden">

    <!-- Left Column: Form -->
    <div class="flex flex-col bg-white w-full lg:w-[52%] overflow-y-auto">
      <div class="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 min-h-full">
        <div class="mx-auto w-full max-w-lg">

          <!-- Logo -->
          <AuthLogo class="mb-10" />

          <!-- STEP 1: Role Selection -->
          <div v-if="step === 'role'" key="role">
              <h1 class="mb-2 font-bold text-[26px] text-gray-900 tracking-tight">
                Create your account
              </h1>
              <p class="mb-8 text-gray-500 text-sm">I am joining as a...</p>

              <!-- Role Cards -->
              <div class="gap-4 grid grid-cols-2 mb-8">

                <!-- Client Card -->
                <button
                  type="button"
                  class="group border rounded-lg overflow-hidden text-left transition-all duration-200 cursor-pointer"
                  :class="role === 'client'
                    ? 'border-primary-400 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
                    : 'border-slate-200 hover:border-slate-300'"
                  @click="role = 'client'"
                >
                  <!-- Illustrated top -->
                  <div
                    class="relative flex justify-center items-center w-full h-[140px] transition-colors duration-200"
                    :class="role === 'client' ? 'bg-primary-50' : 'bg-slate-50'"
                  >
                    <!-- Decorative elements -->
                    <div class="top-4 left-4 absolute">
                      <div class="bg-blue-200 opacity-20 rounded-full w-8 h-8" />
                    </div>
                    <div class="top-6 right-5 absolute">
                      <div class="bg-indigo-300 opacity-15 rounded-full w-6 h-6" />
                    </div>
                    <div class="right-4 bottom-4 absolute">
                      <div class="bg-blue-200 opacity-10 rounded-full w-5 h-5" />
                    </div>

                    <!-- Icon container with ring -->
                    <div class="relative">
                      <div
                        class="absolute inset-0 rounded-full transition-all duration-200"
                        :class="role === 'client' ? 'bg-primary-600 opacity-10 scale-110' : 'bg-slate-300 opacity-0'"
                      />
                      <div
                        class="relative flex justify-center items-center shadow-sm rounded-full w-20 h-20 transition-all duration-200"
                        :class="role === 'client' ? 'bg-white ring-2 ring-primary-600 ring-offset-2' : 'bg-white'"
                      >
                        <Icon 
                          name="i-hugeicons-user" 
                          class="transition-all duration-200"
                          :class="role === 'client' ? 'w-9 h-9 text-primary-600' : 'w-8 h-8 text-slate-400'"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Card body -->
                  <div class="px-4 py-4">
                    <p class="mb-1.5 font-bold text-slate-900 text-base">Client</p>
                    <p class="mb-3 text-slate-600 text-sm leading-relaxed">
                      Find and connect with verified lawyers for your legal needs
                    </p>
                    <div 
                      class="flex items-center gap-2 transition-colors duration-200" 
                      :class="role === 'client' ? 'text-primary-600' : 'text-slate-400'"
                    >
                      <Icon name="i-hugeicons-clock-01" class="w-4 h-4" />
                      <span class="font-medium text-xs">Book consultations</span>
                    </div>
                  </div>
                </button>

                <!-- Lawyer Card -->
                <button
                  type="button"
                  class="group border rounded-lg overflow-hidden text-left transition-all duration-200 cursor-pointer"
                  :class="role === 'lawyer'
                    ? 'border-primary-400 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
                    : 'border-slate-200 hover:border-slate-300'"
                  @click="role = 'lawyer'"
                >
                  <!-- Illustrated top -->
                  <div
                    class="relative flex justify-center items-center w-full h-[140px] transition-colors duration-200"
                    :class="role === 'lawyer' ? 'bg-primary-50' : 'bg-slate-50'"
                  >
                    <!-- Decorative elements -->
                    <div class="top-4 left-4 absolute">
                      <div class="bg-amber-200 opacity-20 rounded-full w-8 h-8" />
                    </div>
                    <div class="top-6 right-5 absolute">
                      <div class="bg-orange-300 opacity-15 rounded-full w-6 h-6" />
                    </div>
                    <div class="right-4 bottom-4 absolute">
                      <div class="bg-amber-200 opacity-10 rounded-full w-5 h-5" />
                    </div>

                    <!-- Icon container with ring -->
                    <div class="relative">
                      <div
                        class="absolute inset-0 rounded-full transition-all duration-200"
                        :class="role === 'lawyer' ? 'bg-primary-600 opacity-10 scale-110' : 'bg-slate-300 opacity-0'"
                      />
                      <div
                        class="relative flex justify-center items-center shadow-sm rounded-full w-20 h-20 transition-all duration-200"
                        :class="role === 'lawyer' ? 'bg-white ring-2 ring-primary-600 ring-offset-2' : 'bg-white'"
                      >
                        <Icon 
                          name="i-hugeicons-briefcase-01" 
                          class="transition-all duration-200"
                          :class="role === 'lawyer' ? 'w-9 h-9 text-primary-600' : 'w-8 h-8 text-slate-400'"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Card body -->
                  <div class="px-4 py-4">
                    <p class="mb-1.5 font-bold text-slate-900 text-base">Lawyer</p>
                    <p class="mb-3 text-slate-600 text-sm leading-relaxed">
                      Join our platform and offer your legal expertise to clients
                    </p>
                    <div 
                      class="flex items-center gap-2 transition-colors duration-200" 
                      :class="role === 'lawyer' ? 'text-primary-600' : 'text-slate-400'"
                    >
                      <Icon name="i-hugeicons-briefcase-01" class="w-4 h-4" />
                      <span class="font-medium text-xs">Start your practice</span>
                    </div>
                  </div>
                </button>

              </div>

              <button
                type="button"
                :disabled="!role"
                class="py-3 rounded w-full font-semibold text-sm transition-all duration-200"
                :class="role
                  ? 'bg-primary-600 text-white hover:bg-primary-700 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                @click="step = 'form'"
              >
                {{ role ? `Continue as ${role === 'lawyer' ? 'Lawyer' : 'Client'}` : 'Select a role to continue' }}
              </button>

              <p class="mt-6 text-gray-500 text-sm text-center">
                Already have an account?
                <NuxtLink to="/login" class="font-semibold text-primary-600 hover:text-primary-700 hover:underline">Log in</NuxtLink>
              </p>
            </div>

          <!-- STEP 2: Registration Form -->
          <div v-if="step === 'form'" key="form">

              <!-- Back + role badge -->
              <div class="flex items-center gap-3 mb-8">
                <button
                  type="button"
                  class="flex justify-center items-center hover:bg-gray-50 border border-gray-200 rounded-lg w-8 h-8 transition-colors cursor-pointer"
                  @click="step = 'role'"
                >
                  <Icon name="i-hugeicons-arrow-left-01" class="w-4 h-4 text-gray-500" />
                </button>
                <div class="flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 border border-primary-200 rounded-lg">
                  <Icon
                    :name="role === 'lawyer' ? 'i-hugeicons-briefcase-01' : 'i-hugeicons-user'"
                    class="w-3.5 h-3.5 text-primary-600"
                  />
                  <span class="font-semibold text-primary-600 text-xs capitalize">{{ role }}</span>
                </div>
              </div>

              <h1 class="mb-2 font-bold text-[26px] text-gray-900 tracking-tight">
                {{ role === 'lawyer' ? 'Apply as a Lawyer' : 'Create your account' }}
              </h1>
              <p class="mb-8 text-gray-500 text-sm">
                {{ role === 'lawyer' ? 'Fill in your details to get verified.' : 'Join in seconds.' }}
              </p>

              <UForm :state="formData" class="space-y-5" @submit="handleSubmit">

                <div class="gap-3 grid grid-cols-2">
                  <UFormField label="First name" name="firstName">
                    <UInput
                      v-model="formData.firstName"
                      placeholder="Alex"
                      size="lg"
                      :disabled="isSubmitting"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Last name" name="lastName">
                    <UInput
                      v-model="formData.lastName"
                      placeholder="Smith"
                      size="lg"
                      :disabled="isSubmitting"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <UFormField label="Email address" name="email">
                  <UInput
                    v-model="formData.email"
                    type="email"
                    placeholder="alex@example.com"
                    size="lg"
                    :disabled="isSubmitting"
                    class="w-full"
                  />
                </UFormField>

                <div class="gap-3 grid grid-cols-2">
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
                  <UFormField label="Confirm password" name="confirmPassword">
                    <UInput
                      v-model="formData.confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      size="lg"
                      :disabled="isSubmitting"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <!-- Error -->
                <UAlert
                  v-if="error"
                  color="error"
                  variant="soft"
                  :title="error"
                  icon="i-hugeicons-alert-circle"
                />

                <UButton
                  type="submit"
                  size="lg"
                  color="primary"
                  block
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                >
                  {{ role === 'lawyer' ? 'Apply as Lawyer' : 'Create Account' }}
                </UButton>

              </UForm>

              <p class="mt-6 text-gray-500 text-sm text-center">
                Already have an account?
                <NuxtLink to="/login" class="font-semibold text-primary-600 hover:text-primary-700 hover:underline">Log in</NuxtLink>
              </p>

              <p class="mt-5 text-gray-500 text-xs text-center leading-relaxed">
                By continuing, you agree to our
                <NuxtLink to="/terms" class="text-gray-600 hover:text-gray-900 underline">Terms of Service</NuxtLink>
                and
                <NuxtLink to="/privacy" class="text-gray-600 hover:text-gray-900 underline">Privacy Policy</NuxtLink>.
              </p>

            </div>

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
          <p class="mb-1 font-semibold text-gray-800 text-sm">Take GetaLawyer with you</p>
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
  middleware: ['guest'],
})

const route = useRoute()

const roleFromQuery = route.query.role as string
const role = ref<'client' | 'lawyer' | null>(
  roleFromQuery === 'lawyer' ? 'lawyer' : roleFromQuery === 'client' ? 'client' : 'client'
)
const step = ref<'role' | 'form'>('role')

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''

  if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
    error.value = 'Please fill in all fields.'
    return
  }
  if (formData.password !== formData.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }
  if (formData.password.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  isSubmitting.value = true

  try {
    // Combine first and last name
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()

    const { error: signUpError } = await authClient.signUp.email({
      name: fullName,
      email: formData.email,
      password: formData.password,
      userType: role.value || 'client',
      onboarding_completed: false,
      callbackURL: role.value === 'lawyer' ? '/onboarding/lawyer' : '/onboarding/client/location',
    })

    if (signUpError) {
      error.value = signUpError.message || 'Failed to create account. Please try again.'
      return
    }

    await navigateTo(role.value === 'lawyer' ? '/onboarding/lawyer' : '/onboarding/client/location')
  } catch (err: any) {
    error.value = err?.message || 'An unexpected error occurred.'
  } finally {
    isSubmitting.value = false
  }
}
</script>