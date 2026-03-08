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

    <!-- Right Column: Registration Form -->
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
              <h2 class="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create your account</h2>
              <p class="text-gray-500">
                Join our platform in seconds.
              </p>
            </div>

            <!-- Role Segmented Control -->
            <div class="flex p-1 space-x-1 bg-gray-100/80 rounded-xl mb-8 border border-gray-200/50">
              <button 
                :class="[
                  'flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200', 
                  role === 'client' 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                    : 'text-gray-500 hover:text-gray-700'
                ]" 
                @click="role = 'client'"
              >
                <Icon name="i-hugeicons-user" class="w-4 h-4" />
                I need a lawyer
              </button>
              <button 
                :class="[
                  'flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200', 
                  role === 'lawyer' 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                    : 'text-gray-500 hover:text-gray-700'
                ]" 
                @click="role = 'lawyer'"
              >
                <Icon name="i-hugeicons-briefcase-01" class="w-4 h-4" />
                I am a lawyer
              </button>
            </div>

            <!-- Form -->
            <UForm :state="formData" class="space-y-5" @submit="handleSubmit">
              <UFormField label="Full Name" name="name" required>
                <UInput
                  v-model="formData.name"
                  placeholder="Alex Smith"
                  size="lg"
                  :disabled="isSubmitting"
                  class="font-medium"
                />
              </UFormField>

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

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <UFormField label="Password" name="password" required>
                  <UInput
                    v-model="formData.password"
                    type="password"
                    placeholder="••••••••"
                    size="lg"
                    :disabled="isSubmitting"
                  />
                </UFormField>

                <UFormField label="Confirm Password" name="confirmPassword" required>
                  <UInput
                    v-model="formData.confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    size="lg"
                    :disabled="isSubmitting"
                  />
                </UFormField>
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
                {{ role === 'lawyer' ? 'Apply as Lawyer' : 'Create Client Account' }}
              </UButton>

              <div class="text-center mt-6">
                <p class="text-sm text-gray-500">
                  Already have an account?
                  <NuxtLink to="/login" class="text-gray-900 font-semibold hover:underline">
                    Log in
                  </NuxtLink>
                </p>
              </div>

              <div class="mt-8 text-center">
                <p class="text-xs text-gray-400">
                  By clicking continue, you agree to our 
                  <NuxtLink to="/terms" class="underline hover:text-gray-600">Terms of Service</NuxtLink> and 
                  <NuxtLink to="/privacy" class="underline hover:text-gray-600">Privacy Policy</NuxtLink>.
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
  middleware: ['guest']
})

const route = useRoute()
const router = useRouter()

// Get role from query parameter, default to client
const roleInfo = route.query.role as string
const role = ref<'client'|'lawyer'>(roleInfo === 'lawyer' ? 'lawyer' : 'client')

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
      userType: role.value === 'lawyer' ? 'lawyer' : 'user',
      onboarding_completed: false,
      callbackURL: role.value === 'lawyer' ? '/register/step2' : '/onboarding/client/location'
    })

    if (signUpError) {
      error.value = signUpError.message || 'Failed to create account. Please try again.'
      isSubmitting.value = false
      return
    }

    // Success - redirect will be handled by middleware based on role
    // Redirect to the onboarding flow base
    navigateTo('/onboarding/lawyer')
    
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
    isSubmitting.value = false
  }
}
</script>
```
