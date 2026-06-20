<template>
  <div>

    <AuthLogo class="mb-10 lg:hidden" />

    <header class="mb-8">
      <h1 class="mb-1 text-2xl font-semibold leading-tight tracking-tight text-foreground">
        {{ isPhoneMethod ? 'Check your phone' : 'Check your email' }}
      </h1>
      <p class="text-base leading-relaxed text-muted-foreground">
        We sent a 6-digit code to
        <strong class="font-medium text-foreground">{{ identifier }}</strong>.
        <NuxtLink
          :to="forgotPasswordLink"
          class="ms-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Wrong {{ isPhoneMethod ? 'number' : 'email' }}?
        </NuxtLink>
      </p>
    </header>

    <form @submit.prevent="handleSubmit">
      <FieldGroup class="space-y-6">
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

        <Button
          type="submit"
          class="h-12 w-full cursor-pointer gap-2"
          size="lg"
          :disabled="isSubmitting || otp.length < 6"
        >
          <PhCircleNotch v-if="isSubmitting" class="size-4 shrink-0 animate-spin" />
          <span>{{ isSubmitting ? 'Verifying…' : 'Verify code' }}</span>
        </Button>
      </FieldGroup>
    </form>

    <Separator class="my-6" />

    <p class="text-center text-base">
      <NuxtLink
        :to="forgotPasswordLink"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to forgot password
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { PhCircleNotch } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
  authTitle: 'Verify your identity.',
  authDescription: 'Enter the code we sent to continue resetting your password securely.',
})

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
