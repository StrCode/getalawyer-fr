<template>
  <AuthFormShell :title="isPhoneMethod ? 'Check your phone' : 'Check your email'">
    <template #back>
      <NuxtLink :to="forgotPasswordLink" :class="authBack">← Back</NuxtLink>
    </template>
    <template #description>
      We sent a 6-digit code to <b class="text-foreground">{{ identifier }}</b>.
      <NuxtLink :to="forgotPasswordLink" :class="authLink" class="text-sm">Wrong {{ isPhoneMethod ? 'number' : 'email' }}?</NuxtLink>
    </template>

    <form novalidate @submit.prevent="handleSubmit">
      <FieldGroup class="gap-4.5">
        <AuthOtpStep
          v-model="otp"
          :error="fieldError"
          :blocked="otpBlocked"
          :is-submitting="isSubmitting"
          :is-resending="isResending"
          :resend-cooldown="resendCooldown"
          @resend="handleResend"
          @request-new-code="handleRequestNew"
        />

        <AuthDevOtpHint />
        <AuthFormError :message="apiError" />

        <AuthSubmit :loading="isSubmitting" :disabled="otp.length < 6" class="mt-1.25">
          {{ isSubmitting ? 'Verifying…' : 'Verify code' }}
        </AuthSubmit>
      </FieldGroup>
    </form>
  </AuthFormShell>
</template>

<script setup lang="ts">
import { FieldGroup } from '@/components/ui/field'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
  authTitle: 'Verify your identity.',
  authDescription: 'Enter the code we sent to continue resetting your password securely.',
})

useHead({ title: 'Enter your code' })

const route = useRoute()
const router = useRouter()
const { requestPhonePasswordReset } = usePhoneAuth()

const isPhoneMethod = computed(() => route.query.method === 'phone')
const identifier = computed(() =>
  isPhoneMethod.value
    ? (route.query.phone as string) || ''
    : (route.query.email as string) || '',
)

const forgotPasswordLink = computed(() => {
  if (isPhoneMethod.value && identifier.value) {
    return { path: '/forgot-password', query: { method: 'phone', phone: identifier.value } }
  }
  return '/forgot-password'
})

const otp = ref('')
const fieldError = ref('')
const otpBlocked = ref(false)
const isSubmitting = ref(false)
const isResending = ref(false)
const resendCooldown = ref(0)
const apiError = ref('')
let cooldownTimer: ReturnType<typeof setInterval> | null = null

function startCooldown(seconds = 60) {
  resendCooldown.value = seconds
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function handleSubmit() {
  if (otp.value.length < 6) {
    fieldError.value = 'Please enter the full 6-digit code.'
    return
  }

  apiError.value = ''
  fieldError.value = ''
  isSubmitting.value = true

  try {
    if (isPhoneMethod.value) {
      await router.push({
        path: '/reset-password',
        query: {
          method: 'phone',
          phone: identifier.value,
          otp: otp.value,
        },
      })
      return
    }

    const result = await authClient.emailOtp.checkVerificationOtp({
      email: identifier.value,
      type: 'forget-password',
      otp: otp.value,
    })

    if (result.error) {
      throw new Error(result.error.message || 'Invalid verification code')
    }

    await router.push({
      path: '/reset-password',
      query: {
        method: 'email',
        email: identifier.value,
        otp: otp.value,
      },
    })
  }
  catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.toLowerCase().includes('too many attempts')) {
      otpBlocked.value = true
    } else if (msg.includes('expired')) {
      fieldError.value = 'This code has expired. Please request a new one.'
    } else {
      fieldError.value = msg || 'Invalid verification code. Please try again.'
    }
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleResend() {
  if (resendCooldown.value > 0 || isResending.value) return
  isResending.value = true
  fieldError.value = ''
  otpBlocked.value = false
  try {
    if (isPhoneMethod.value) {
      const { error } = await requestPhonePasswordReset(identifier.value)
      if (error) throw new Error(error.message)
    } else {
      await authClient.emailOtp.requestPasswordReset({ email: identifier.value })
    }
    otp.value = ''
    startCooldown()
  }
  catch (err: unknown) {
    apiError.value = err instanceof Error ? err.message : 'Failed to resend code.'
  }
  finally {
    isResending.value = false
  }
}

async function handleRequestNew() {
  otpBlocked.value = false
  otp.value = ''
  await handleResend()
}

watch(otp, (v) => {
  if (v.length === 6 && !isSubmitting.value) {
    handleSubmit()
  }
})

onMounted(() => {
  if (!identifier.value) {
    router.replace('/forgot-password')
    return
  }
  nextTick(() => {
    const first = document.querySelector<HTMLInputElement>('[data-slot="input-otp"] input')
    first?.focus()
  })
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>
