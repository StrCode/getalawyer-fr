<template>
  <div class="flex bg-white w-full h-screen overflow-hidden">

    <!-- Left Column: Form -->
    <div class="flex flex-col bg-white w-full lg:w-[52%] overflow-y-auto">
      <div class="flex flex-col justify-center px-10 sm:px-16 py-12 min-h-full">
        <div class="mx-auto w-full max-w-md">

          <!-- Logo -->
          <NuxtLink to="/" class="inline-flex items-center gap-2.5 mb-16">
            <div class="flex flex-shrink-0 justify-center items-center bg-[#1d6b44] rounded-lg w-8 h-8">
              <Icon name="i-hugeicons-legal-document-02" class="w-4 h-4 text-white" />
            </div>
            <span class="font-bold text-[18px] text-gray-900 tracking-tight">
              Lex<span class="text-[#1d6b44]">Connect</span>
            </span>
          </NuxtLink>

          <!-- Success state -->
          <Transition name="fade">
            <div v-if="submitted" key="success">
              <div class="flex flex-col items-center py-8 text-center">
                <div class="flex justify-center items-center bg-[#f0faf4] mb-5 rounded-full w-16 h-16">
                  <Icon name="i-hugeicons-checkmark-circle-02" class="w-8 h-8 text-[#1d6b44]" />
                </div>
                <h1 class="mb-2 font-bold text-[22px] text-gray-900">Password updated</h1>
                <p class="mb-8 max-w-xs text-gray-500 text-sm leading-relaxed">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <NuxtLink
                  to="/login"
                  class="inline-flex justify-center items-center bg-[#1d6b44] hover:bg-[#175537] py-3 rounded w-full font-semibold text-white text-sm transition-colors"
                >
                  Go to login
                </NuxtLink>
              </div>
            </div>
          </Transition>

          <!-- Form -->
          <Transition name="fade">
            <div v-if="!submitted" key="form">
              <h1 class="mb-3 font-bold text-[26px] text-gray-900 tracking-tight">
                Password reset
              </h1>
              <p class="mb-1 text-gray-500 text-sm leading-relaxed">
                Please enter a new password for your GetaLawyer account.
              </p>
              <p class="mb-6 text-gray-400 text-sm leading-relaxed">
                This will end all active sessions for your account.
              </p>

              <UForm :state="formData" class="space-y-4" @submit="handleSubmit">

                <UFormField label="Enter a new password" name="password">
                  <UInput
                    v-model="formData.password"
                    type="password"
                    placeholder="••••••••"
                    size="lg"
                    :disabled="isSubmitting"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Confirm your new password" name="confirmPassword">
                  <UInput
                    v-model="formData.confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    size="lg"
                    :disabled="isSubmitting"
                    class="w-full"
                  />
                </UFormField>

                <p class="text-gray-400 text-xs leading-relaxed">
                  Your password must be at least 8 characters long. Avoid common words or patterns.
                </p>

                <!-- Error -->
                <div
                  v-if="error"
                  class="flex items-start gap-2 bg-red-50 p-3 border border-red-100 rounded-lg text-red-600 text-sm"
                >
                  <Icon name="i-hugeicons-alert-circle" class="mt-0.5 w-4 h-4 shrink-0" />
                  <span>{{ error }}</span>
                </div>

                <UButton
                  type="submit"
                  size="lg"
                  block
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                  class="!bg-[#1d6b44] hover:!bg-[#175537] font-semibold !text-white"
                >
                  Reset my password
                </UButton>

              </UForm>

              <!-- Divider -->
              <div class="my-5 border-gray-100 border-t" />

              <p class="text-gray-400 text-sm text-center">
                Need additional help?
                <NuxtLink to="/contact" class="font-medium text-[#1d6b44] hover:underline">
                  Contact us
                </NuxtLink>
              </p>
            </div>
          </Transition>

        </div>
      </div>
    </div>

    <!-- Right Column: Decorative (same illustration) -->
    <div class="hidden lg:flex flex-col justify-between items-center bg-[#f5f0e8] px-10 py-10 lg:w-[48%]">

      <div class="flex flex-1 justify-center items-center w-full">
        <svg viewBox="0 0 320 280" width="300" height="260" xmlns="http://www.w3.org/2000/svg">
          <!-- Monitor -->
          <rect x="90" y="80" width="160" height="110" rx="8" fill="#c8ddd0" stroke="#a8c4b4" stroke-width="1.5"/>
          <rect x="98" y="88" width="144" height="88" rx="4" fill="#e8f5ee"/>
          <!-- Monitor dots (password dots) -->
          <circle cx="136" cy="132" r="6" fill="#9ec8b4"/>
          <circle cx="154" cy="132" r="6" fill="#9ec8b4"/>
          <circle cx="172" cy="132" r="6" fill="#9ec8b4"/>
          <circle cx="190" cy="132" r="6" fill="#9ec8b4"/>
          <circle cx="208" cy="132" r="6" fill="#9ec8b4"/>
          <!-- Monitor stand -->
          <rect x="157" y="190" width="26" height="18" rx="2" fill="#a8c4b4"/>
          <rect x="143" y="206" width="54" height="6" rx="3" fill="#a8c4b4"/>

          <!-- Padlock -->
          <rect x="148" y="38" width="44" height="38" rx="6" fill="#f0c040"/>
          <rect x="152" y="42" width="36" height="30" rx="4" fill="#e8b020"/>
          <!-- Lock shackle -->
          <path d="M163 38 Q163 20 170 20 Q177 20 177 38" fill="none" stroke="#b8c8d8" stroke-width="5" stroke-linecap="round"/>
          <!-- Keyhole -->
          <circle cx="170" cy="54" r="6" fill="#c89010"/>
          <rect x="167" y="57" width="6" height="8" rx="2" fill="#c89010"/>

          <!-- Document / tablet left -->
          <rect x="60" y="155" width="70" height="85" rx="6" fill="#f9d9a8" stroke="#e8c080" stroke-width="1"/>
          <rect x="68" y="165" width="54" height="4" rx="2" fill="#e8c080"/>
          <rect x="68" y="174" width="46" height="3" rx="1.5" fill="#f0d090"/>
          <rect x="68" y="181" width="50" height="3" rx="1.5" fill="#f0d090"/>
          <rect x="68" y="188" width="42" height="3" rx="1.5" fill="#f0d090"/>

          <!-- Phone right -->
          <rect x="208" y="148" width="48" height="82" rx="8" fill="#80b8c8" stroke="#60a0b0" stroke-width="1"/>
          <rect x="214" y="156" width="36" height="58" rx="4" fill="#b8d8e8"/>
          <rect x="218" y="162" width="28" height="3" rx="1.5" fill="#80b8c8"/>
          <rect x="218" y="169" width="22" height="3" rx="1.5" fill="#80b8c8"/>
          <rect x="218" y="176" width="26" height="3" rx="1.5" fill="#80b8c8"/>
          <rect x="226" y="220" width="12" height="3" rx="1.5" fill="#60a0b0"/>

          <!-- Floor shadow -->
          <ellipse cx="170" cy="242" rx="110" ry="10" fill="#e0d9ce" opacity="0.5"/>
        </svg>
      </div>

      <div class="flex justify-between items-center gap-4 pt-5 border-black/10 border-t w-full">
        <div>
          <p class="mb-0.5 font-semibold text-gray-800 text-sm">Take GetaLawyer with you</p>
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
  middleware: ['guest'],
})

const route = useRoute()
const router = useRouter()

const email = computed(() => route.query.email as string || '')
const otp = computed(() => route.query.otp as string || '')

// Redirect if no email or OTP provided
if (!email.value || !otp.value) {
  router.push('/forgot-password')
}

const formData = reactive({
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const submitted = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''

  if (!formData.password || !formData.confirmPassword) {
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
    // Reset password using Better Auth with OTP
    await authClient.emailOtp.resetPassword({
      email: email.value,
      otp: otp.value,
      password: formData.password,
    })
    submitted.value = true
  } catch (err: any) {
    if (err?.message?.includes('Invalid') || err?.message?.includes('expired')) {
      error.value = 'Invalid or expired verification code. Please request a new one.'
    } else {
      error.value = err?.message || 'Something went wrong. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>