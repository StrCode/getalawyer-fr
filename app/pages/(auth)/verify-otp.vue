<template>
  <div>

    <AuthLogo class="mb-10 lg:hidden" />

    <header class="mb-8">
      <h1 class="mb-1 text-2xl font-semibold leading-tight tracking-tight text-foreground">
        Check your email
      </h1>
      <p class="text-base leading-relaxed text-muted-foreground">
        We sent a 6-digit code to
        <strong class="font-medium text-foreground">{{ emailParam }}</strong>.
        <NuxtLink
          to="/forgot-password"
          class="ms-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Wrong email?
        </NuxtLink>
      </p>
    </header>

    <form @submit.prevent="form.handleSubmit">
      <FieldGroup class="space-y-6">
        <form.Field v-slot="{ field }" name="otp">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel class="sr-only">Verification code</FieldLabel>
            <InputOTP
              :model-value="field.state.value"
              :maxlength="6"
              :disabled="isSubmitting"
              class="gap-2 justify-center w-full"
              @update:model-value="(v) => onOtpChange(v as string, field)"
            >
              <InputOTPGroup>
                <InputOTPSlot
                  v-for="i in 3"
                  :key="i"
                  :index="i - 1"
                  class="h-12 w-10 text-lg"
                  :class="isInvalid(field) ? 'border-destructive' : ''"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot
                  v-for="i in 3"
                  :key="i + 3"
                  :index="i + 2"
                  class="h-12 w-10 text-lg"
                  :class="isInvalid(field) ? 'border-destructive' : ''"
                />
              </InputOTPGroup>
            </InputOTP>
            <p v-if="isInvalid(field)" class="flex items-center justify-center gap-1.5 text-destructive text-sm mt-2">
              <PhWarningCircle class="w-3.5 h-3.5 shrink-0" />
              {{ field.state.meta.errors[0] }}
            </p>
          </Field>
        </form.Field>

        <p class="text-muted-foreground text-base text-center leading-relaxed">
          Code expires in a few minutes.
          <Button
            type="button"
            variant="link"
            class="h-auto p-0 font-medium"
            :disabled="isResending || resendCooldown > 0"
            @click="handleResend"
          >
            <template v-if="isResending">Sending…</template>
            <template v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</template>
            <template v-else>Resend code</template>
          </Button>
        </p>

        <AuthFormError :message="apiError" />

        <Button
          type="submit"
          class="w-full h-12 gap-2"
          size="lg"
          :disabled="isSubmitting"
        >
          <PhCircleNotch v-if="isSubmitting" class="w-4 h-4 animate-spin shrink-0" />
          <span>{{ isSubmitting ? 'Verifying…' : 'Verify code' }}</span>
        </Button>
      </FieldGroup>
    </form>

    <Separator class="my-6" />

    <p class="text-center text-base">
      <NuxtLink
        to="/forgot-password"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to forgot password
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { PhCircleNotch, PhWarningCircle } from '@phosphor-icons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
  authTitle: 'Verify your identity.',
  authDescription: 'Enter the code we sent to your email to continue resetting your password securely.',
})

const route = useRoute()
const router = useRouter()

const emailParam = computed(() => (route.query.email as string) || '')

const otpSchema = z.object({
  otp: z
    .string('Verification code is required.')
    .length(6, 'Please enter the full 6-digit code.'),
})

const isSubmitting = ref(false)
const isResending = ref(false)
const resendCooldown = ref(0)
const apiError = ref('')
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const form = useForm({
  defaultValues: {
    otp: '',
  },
  validators: {
    onSubmit: otpSchema,
    onBlur: otpSchema,
  },
  onSubmit: async ({ value }) => {
    apiError.value = ''
    isSubmitting.value = true

    try {
      const result = await authClient.emailOtp.checkVerificationOtp({
        email: emailParam.value,
        type: 'forget-password',
        otp: value.otp,
      })

      if (result.error) {
        throw new Error(result.error.message || 'Invalid verification code')
      }

      await router.push({
        path: '/reset-password',
        query: {
          email: emailParam.value,
          otp: value.otp,
        },
      })
    }
    catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('TOO_MANY_ATTEMPTS')) {
        apiError.value = 'Too many attempts. Please request a new code.'
      }
      else if (msg.includes('expired')) {
        apiError.value = 'This code has expired. Please request a new one.'
      }
      else {
        apiError.value = msg || 'Invalid verification code. Please try again.'
      }
    }
    finally {
      isSubmitting.value = false
    }
  },
})

const { isInvalid } = useAuthFieldInvalid()

function onOtpChange(value: string, field: { handleChange: (v: string) => void }) {
  field.handleChange(value)
  if (value.length === 6 && !isSubmitting.value) {
    form.handleSubmit()
  }
}

function startResendCooldown(seconds = 60) {
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

onMounted(() => {
  if (!emailParam.value) {
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

const handleResend = async () => {
  if (resendCooldown.value > 0 || isResending.value) return

  apiError.value = ''
  isResending.value = true

  try {
    await authClient.emailOtp.requestPasswordReset({
      email: emailParam.value,
    })
    form.setFieldValue('otp', '')
    startResendCooldown()
  }
  catch (err: unknown) {
    apiError.value =
      err instanceof Error ? err.message : 'Failed to resend code. Please try again.'
  }
  finally {
    isResending.value = false
  }
}
</script>
