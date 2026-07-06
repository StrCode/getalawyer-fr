<template>
  <component :is="embedded ? 'div' : Card" :class="embedded ? 'space-y-5' : cardClass">
    <header
      v-if="!embedded"
      class="mb-6 text-center"
    >
     <h2 class="text-xl font-semibold text-sidebar sm:text-2xl">
        Link your email
      </h2>
      <p class="mt-2 text-sm text-muted-foreground sm:text-base">
        Add a real email address to receive notifications and recover your account.
      </p>
    </header>

    <form
      v-if="!verified"
      class="space-y-4"
      @submit.prevent="onSubmit"
    >
      <div
        v-if="!codeSent"
        class="space-y-2 text-left"
      >
        <Label for="link-email">Email address</Label>
        <Input
          id="link-email"
          v-model="email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          class="h-11"
          :disabled="isSubmitting"
        />
      </div>

      <div
        v-else
        class="space-y-4 text-center"
      >
        <p class="text-sm text-muted-foreground">
          Enter the 6-digit code sent to
          <strong class="text-foreground">{{ email }}</strong>
        </p>
        <AuthOtpStep
          v-model="otp"
          :error="otpError"
          :blocked="otpBlocked"
          :is-submitting="isSubmitting"
          :is-resending="isResending"
          :resend-cooldown="resendCooldown"
          @resend="handleResend"
          @request-new-code="handleRequestNewCode"
        />
        <AuthDevOtpHint />
      </div>

      <AuthFormError :message="apiError" />

      <Button
        type="submit"
        class="h-11 w-full cursor-pointer"
        :disabled="isSubmitting"
      >
        <HugeiconsIcon
          v-if="isSubmitting"
          :icon="Loading03Icon"
          class="mr-2 size-4 animate-spin"
        />
        {{ codeSent ? 'Verify email' : 'Send verification code' }}
      </Button>
    </form>

    <div
      v-else
      class="space-y-4 text-center"
    >
      <HugeiconsIcon
        :icon="CheckmarkCircle01Icon"
        class="mx-auto size-12 text-primary"
      />
      <p class="text-base text-muted-foreground">
        Your email has been linked successfully.
      </p>
      <Button
        class="cursor-pointer"
        @click="$emit('completed')"
      >
        Continue
      </Button>
    </div>
  </component>
</template>

<script setup lang="ts">
import { CheckmarkCircle01Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

defineProps<{
  embedded?: boolean
}>()

const emit = defineEmits<{ completed: [] }>()

const cardClass = 'w-full gap-0 overflow-hidden rounded-2xl border border-border/50 bg-white/70 p-6 shadow-lg backdrop-blur-xl sm:rounded-3xl sm:p-8'

const { requestLinkEmail, verifyLinkEmail } = useAccountLinking()
const { refetchSession } = useAuth()

const email = ref('')
const otp = ref('')
const codeSent = ref(false)
const verified = ref(false)
const isSubmitting = ref(false)
const isResending = ref(false)
const resendCooldown = ref(0)
const apiError = ref('')
const otpError = ref('')
const otpBlocked = ref(false)

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

async function sendCode() {
  apiError.value = ''
  isSubmitting.value = true
  try {
    const res = await requestLinkEmail(email.value)
    if (!res.success) throw new Error(res.error || 'Failed to send code')
    codeSent.value = true
    startCooldown()
  } catch (e) {
    apiError.value = e instanceof Error ? e.message : 'Failed to send code'
  } finally {
    isSubmitting.value = false
  }
}

async function verifyCode() {
  apiError.value = ''
  otpError.value = ''
  isSubmitting.value = true
  try {
    const res = await verifyLinkEmail(email.value, otp.value)
    if (!res.success) throw new Error(res.error || 'Invalid code')
    verified.value = true
    await refetchSession()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Verification failed'
    if (msg.toLowerCase().includes('too many attempts')) {
      otpBlocked.value = true
    } else {
      otpError.value = msg
    }
  } finally {
    isSubmitting.value = false
  }
}

async function onSubmit() {
  if (!codeSent.value) {
    await sendCode()
    return
  }
  if (otp.value.length < 6) {
    otpError.value = 'Please enter the full 6-digit code.'
    return
  }
  await verifyCode()
}

async function handleResend() {
  if (resendCooldown.value > 0 || isResending.value) return
  isResending.value = true
  otp.value = ''
  otpError.value = ''
  otpBlocked.value = false
  try {
    await sendCode()
  } finally {
    isResending.value = false
  }
}

async function handleRequestNewCode() {
  otpBlocked.value = false
  otp.value = ''
  await handleResend()
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

watch(otp, (v) => {
  if (v.length === 6 && codeSent.value && !isSubmitting.value && !verified.value) {
    verifyCode()
  }
})
</script>
