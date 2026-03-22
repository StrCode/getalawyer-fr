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

          <!-- Heading -->
          <h1 class="mb-3 font-bold text-[26px] text-gray-900 tracking-tight">
            Enter verification code
          </h1>
          <p class="mb-6 text-gray-500 text-sm leading-relaxed">
            We've sent a 6-digit code to <strong>{{ email }}</strong>. Please enter it below.
          </p>

          <!-- Form -->
          <UForm :state="formData" class="space-y-4" @submit="handleSubmit">

            <UFormField label="Verification Code" name="otp">
              <UInput
                v-model="formData.otp"
                type="text"
                placeholder="000000"
                size="lg"
                maxlength="6"
                :disabled="isSubmitting"
                class="w-full font-mono text-2xl text-center tracking-widest"
                @input="handleOTPInput"
              />
            </UFormField>

            <p class="text-gray-400 text-xs leading-relaxed">
              The code will expire in 5 minutes. Didn't receive it?
              <button
                type="button"
                class="font-medium text-[#1d6b44] hover:underline"
                :disabled="isResending"
                @click="handleResend"
              >
                {{ isResending ? 'Sending...' : 'Resend code' }}
              </button>
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
              :disabled="isSubmitting || formData.otp.length !== 6"
              class="!bg-[#1d6b44] hover:!bg-[#175537] font-semibold !text-white"
            >
              Verify code
            </UButton>

          </UForm>

          <!-- Divider -->
          <div class="my-5 border-gray-100 border-t" />

          <!-- Back to forgot password -->
          <p class="text-sm text-center">
            <NuxtLink to="/forgot-password" class="font-medium text-[#1d6b44] hover:underline">
              Back to forgot password
            </NuxtLink>
          </p>

        </div>
      </div>
    </div>

    <!-- Right Column: Decorative -->
    <div class="hidden lg:flex flex-col justify-between items-center bg-[#f5f0e8] px-10 py-10 lg:w-[48%]">

      <div class="flex flex-1 justify-center items-center w-full">
        <svg viewBox="0 0 320 280" width="300" height="260" xmlns="http://www.w3.org/2000/svg">
          <!-- Envelope -->
          <rect x="80" y="90" width="160" height="110" rx="8" fill="#c8ddd0" stroke="#a8c4b4" stroke-width="1.5"/>
          <path d="M80 100 L160 150 L240 100" fill="none" stroke="#a8c4b4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M80 100 L160 150 L240 100" fill="#e8f5ee" opacity="0.5"/>
          
          <!-- Code display -->
          <rect x="110" y="130" width="100" height="40" rx="6" fill="#f0c040"/>
          <text x="160" y="157" font-family="monospace" font-size="20" font-weight="bold" fill="#1d6b44" text-anchor="middle">123456</text>
          
          <!-- Checkmark badge -->
          <circle cx="220" cy="110" r="18" fill="#1d6b44"/>
          <path d="M213 110 L218 115 L227 106" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

          <!-- Phone left -->
          <rect x="40" y="155" width="48" height="82" rx="8" fill="#80b8c8" stroke="#60a0b0" stroke-width="1"/>
          <rect x="46" y="163" width="36" height="58" rx="4" fill="#b8d8e8"/>
          <rect x="58" y="227" width="12" height="3" rx="1.5" fill="#60a0b0"/>

          <!-- Document right -->
          <rect x="232" y="155" width="60" height="75" rx="6" fill="#f9d9a8" stroke="#e8c080" stroke-width="1"/>
          <rect x="240" y="165" width="44" height="4" rx="2" fill="#e8c080"/>
          <rect x="240" y="174" width="36" height="3" rx="1.5" fill="#f0d090"/>
          <rect x="240" y="181" width="40" height="3" rx="1.5" fill="#f0d090"/>
          <rect x="240" y="188" width="32" height="3" rx="1.5" fill="#f0d090"/>

          <!-- Floor shadow -->
          <ellipse cx="160" cy="242" rx="110" ry="10" fill="#e0d9ce" opacity="0.5"/>
        </svg>
      </div>

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
  middleware: ['guest'],
})

const route = useRoute()
const router = useRouter()

const email = computed(() => route.query.email as string || '')
const type = computed(() => route.query.type as string || 'password-reset')

// Redirect if no email provided
if (!email.value) {
  router.push('/forgot-password')
}

const formData = reactive({ otp: '' })
const isSubmitting = ref(false)
const isResending = ref(false)
const error = ref('')

// Auto-format OTP input (numbers only)
const handleOTPInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  formData.otp = input.value.replace(/\D/g, '').slice(0, 6)
}

const handleSubmit = async () => {
  error.value = ''

  if (formData.otp.length !== 6) {
    error.value = 'Please enter a valid 6-digit code.'
    return
  }

  isSubmitting.value = true

  try {
    // Optional: Check if OTP is valid before redirecting
    const result = await authClient.emailOtp.checkVerificationOtp({
      email: email.value,
      type: 'forget-password',
      otp: formData.otp,
    })

    if (result.error) {
      throw new Error(result.error.message || 'Invalid verification code')
    }

    // OTP is valid, redirect to reset password page
    router.push({
      path: '/reset-password',
      query: { 
        email: email.value,
        otp: formData.otp
      }
    })
  } catch (err: any) {
    if (err?.message?.includes('TOO_MANY_ATTEMPTS')) {
      error.value = 'Too many attempts. Please request a new code.'
    } else if (err?.message?.includes('expired')) {
      error.value = 'This code has expired. Please request a new one.'
    } else {
      error.value = err?.message || 'Invalid verification code. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleResend = async () => {
  error.value = ''
  isResending.value = true

  try {
    await authClient.emailOtp.requestPasswordReset({
      email: email.value,
    })
    
    // Show success message
    error.value = ''
    formData.otp = ''
    
    // You could add a toast notification here
    console.log('New code sent successfully')
  } catch (err: any) {
    error.value = err?.message || 'Failed to resend code. Please try again.'
  } finally {
    isResending.value = false
  }
}
</script>
