<!-- components/auth/AuthOtp.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ push: [view: string] }>()
const { identifier, resetToken, close } = useAuthModal()
const { getSession } = useAuth()

const props = defineProps<{
  type?: 'phone' | 'email' | 'password-reset'
}>()

const otp = ref(['', '', '', '', '', ''])
const loading = ref(false)
const errorMessage = ref('')
const resending = ref(false)

const content = computed(() => {
  switch (props.type) {
    case 'phone':
      return {
        title: 'Confirm your number',
        description: `Enter the 6-digit code we sent to ${identifier.value}`,
        verifyEndpoint: '/auth/verify',
        resendEndpoint: '/auth/resend-verification-token',
        nextView: 'success',
      }
    case 'password-reset':
      return {
        title: 'Enter reset code',
        description: `Enter the 6-digit code we sent to ${identifier.value}`,
        verifyEndpoint: '/auth/verify-password-reset-token',
        resendEndpoint: '/auth/resend-password-reset-token',
        nextView: 'newpassword',
      }
    case 'email':
    default:
      return {
        title: 'Verify your email',
        description: `Enter the 6-digit code we sent to ${identifier.value}`,
        verifyEndpoint: '/auth/verify',
        resendEndpoint: '/auth/resend-verification-token',
        nextView: 'success',
      }
  }
})

const otpValue = computed(() => otp.value.join(''))
const isComplete = computed(() => otp.value.every(digit => digit !== ''))

function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (value.length > 1) {
    input.value = value.slice(-1)
  }

  otp.value[index] = input.value

  if (input.value && index < 5) {
    const nextInput = input.nextElementSibling as HTMLInputElement
    nextInput?.focus()
  }

  if (isComplete.value) {
    verify()
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    const prevInput = (event.target as HTMLInputElement).previousElementSibling as HTMLInputElement
    prevInput?.focus()
  }
}

async function verify() {
  loading.value = true
  errorMessage.value = ''

  try {
    const api = useApi()
    const code = otpValue.value

    type VerifyOTPResponse = {
      status: string
      status_code: string
      message: string
      auth_token?: string
      data?: any
      timestamp: string
    }

    const requestBody = props.type === 'phone' 
      ? { phone_number: identifier.value, token: code }
      : { email: identifier.value, token: code }

    const response = await api.fetchPost<VerifyOTPResponse>(
      content.value.verifyEndpoint,
      requestBody,
      { requiresAuth: false }
    )

    if (response.status === 'success') {
      console.log('OTP verification successful:', response.message)
      
      if (props.type === 'password-reset') {
        resetToken.value = code
        emit('push', content.value.nextView)
        return
      }
      
      if (response.auth_token) {
        console.log('Auth token received, logging user in...')
        
        const { rawToken } = useAuthState()
        rawToken.value = response.auth_token
        await getSession()

        emit('push', 'success')
        
        setTimeout(() => {
          close()
          navigateTo('/account')
        }, 1500)
      } else {
        console.log('Verification successful but no auth token provided')
        emit('push', 'success')
      }
    }
  } catch (error: any) {
    console.error('OTP verification failed:', error)
    errorMessage.value = error.data?.message || 'Invalid code. Please check and try again.'
    otp.value = ['', '', '', '', '', '']
  } finally {
    loading.value = false
  }
}

async function resendCode() {
  resending.value = true
  errorMessage.value = ''

  try {
    const api = useApi()

    type ResendOTPResponse = {
      status: string
      status_code: string
      message: string
      timestamp: string
    }

    let requestBody: Record<string, string>
    
    if (props.type === 'password-reset') {
      requestBody = { email: identifier.value }
    } else if (props.type === 'phone') {
      requestBody = { phone_number: identifier.value }
    } else {
      requestBody = { email: identifier.value }
    }

    const response = await api.fetchPost<ResendOTPResponse>(
      content.value.resendEndpoint,
      requestBody,
      { requiresAuth: false }
    )

    if (response.status === 'success') {
      console.log('OTP resent:', response.message)
      otp.value = ['', '', '', '', '', '']
    }
  } catch (error: any) {
    console.error('Resend OTP failed:', error)
    errorMessage.value = error.data?.message || 'Failed to resend code. Please try again.'
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="px-6 pb-6 pt-2">
    <h2 class="text-[22px] font-bold text-gray-900 tracking-tight mb-1">
      {{ content.title }}
    </h2>
    <p class="text-sm text-gray-500 mb-6">
      {{ content.description }}
    </p>

    <UAlert
      v-if="errorMessage"
      color="red"
      variant="soft"
      :title="errorMessage"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link' }"
      class="mb-4"
      @close="errorMessage = ''"
    />

    <div class="flex gap-2 mb-6">
      <input
        v-for="(digit, index) in otp"
        :key="index"
        v-model="otp[index]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        class="flex-1 h-12 border border-gray-300 rounded-xl text-center text-xl font-bold focus:border-gray-900 focus:ring-2 focus:ring-black/8 transition-all outline-none"
        @input="handleInput(index, $event)"
        @keydown="handleKeydown(index, $event)"
      />
    </div>

    <UButton
      type="button"
      :loading="loading"
      :disabled="!isComplete"
      block
      size="lg"
      class="bg-[#1d6b44] hover:bg-[#154a2f] rounded-xl mb-3"
      @click="verify"
    >
      {{ loading ? 'Verifying...' : 'Verify' }}
    </UButton>

    <UButton
      variant="ghost"
      color="gray"
      :disabled="resending"
      block
      class="text-sm"
      @click="resendCode"
    >
      {{ resending ? 'Sending...' : 'Resend code' }}
    </UButton>
  </div>
</template>
