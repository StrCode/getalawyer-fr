<template>
  <div class="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6">
          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Icon name="i-hugeicons-legal-document-02" class="w-5 h-5 text-white" />
          </div>
          <span class="text-2xl font-bold text-gray-900">GetALawyer</span>
        </NuxtLink>
        
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Create Your Account
        </h1>
        <p class="text-gray-600">
          Sign up as a {{ roleLabel }}
        </p>
      </div>

      <!-- Registration Form -->
      <UCard>
        <UForm :state="formData" class="space-y-6 p-6" @submit="handleSubmit">
          <!-- Name Field -->
          <UFormField label="Full Name" name="name" required>
            <UInput
              v-model="formData.name"
              placeholder="Enter your full name"
              size="lg"
              :disabled="isSubmitting"
              required
            />
          </UFormField>

          <!-- Email Field -->
          <UFormField label="Email Address" name="email" required>
            <UInput
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              size="lg"
              :disabled="isSubmitting"
              required
            />
          </UFormField>

          <!-- Password Field -->
          <UFormField label="Password" name="password" required>
            <UInput
              v-model="formData.password"
              type="password"
              placeholder="Create a password (min. 8 characters)"
              size="lg"
              :disabled="isSubmitting"
              required
            />
          </UFormField>

          <!-- Confirm Password Field -->
          <UFormField label="Confirm Password" name="confirmPassword" required>
            <UInput
              v-model="formData.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              size="lg"
              :disabled="isSubmitting"
              required
            />
          </UFormField>

          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Submit Button -->
          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            <template v-if="!isSubmitting">
              Create Account
              <Icon name="i-hugeicons-arrow-right-01" class="ml-2" />
            </template>
            <template v-else>
              <Icon name="i-hugeicons-loading-03" class="animate-spin mr-2" />
              Creating Account...
            </template>
          </UButton>
        </UForm>
      </UCard>

      <!-- Already have account -->
      <div class="text-center mt-6">
        <p class="text-gray-600">
          Already have an account?
          <NuxtLink to="/login" class="text-primary font-semibold hover:underline ml-1">
            Sign in
          </NuxtLink>
        </p>
      </div>

      <!-- Back to role selection -->
      <div class="text-center mt-4">
        <NuxtLink to="/register" class="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
          <Icon name="i-hugeicons-arrow-left-01" class="w-4 h-4" />
          Back to role selection
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: false,
  middleware: ['guest']
})

const route = useRoute()
const router = useRouter()

// Get role from query parameter
const role = computed(() => {
  const roleParam = route.query.role as string
  return roleParam === 'lawyer' ? 'lawyer' : 'client'
})

const roleLabel = computed(() => {
  return role.value === 'lawyer' ? 'Lawyer' : 'Client'
})

// Form state
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isSubmitting = ref(false)
const error = ref('')

// Handle form submission
const handleSubmit = async () => {
  error.value = ''

  // Validation
  if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
    error.value = 'Please fill in all fields'
    return
  }

  if (formData.password !== formData.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (formData.password.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }

  isSubmitting.value = true

  try {
    // Sign up with Better Auth
    const { data, error: signUpError } = await authClient.signUp.email({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      userType: role.value,
      onboarding_completed: false,
      callbackURL: role.value === 'lawyer' ? '/register/step2' : '/onboarding/client/location'
    })

    if (signUpError) {
      error.value = signUpError.message || 'Failed to create account'
      isSubmitting.value = false
      return
    }

    // Success - redirect will be handled by middleware based on role
    window.location.href = role.value === 'lawyer' ? '/register/step2' : '/onboarding/client/location'
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
    isSubmitting.value = false
  }
}
</script>
