<template>
  <AuthFormShell
    :title="showPhoneOtpStep ? 'Verify your phone' : 'Welcome back'"
    :description="showPhoneOtpStep ? undefined : 'Sign in to message lawyers and manage your bookings.'"
  >
    <template v-if="showPhoneOtpStep" #description>
      We sent a code to <b class="text-foreground">{{ pendingPhone }}</b>. Enter it below to finish signing in.
    </template>

    <!-- A phone number that was never verified: confirm it with a code, then sign in. -->
    <div v-if="showPhoneOtpStep" class="grid gap-[1.1rem]">
      <AuthOtpStep
        v-model="phoneOtp"
        :error="otpError"
        :blocked="otpBlocked"
        :is-submitting="isSubmitting"
        :is-resending="isResending"
        :resend-cooldown="resendCooldown"
        @resend="handleOtpResend"
        @request-new-code="handleOtpRequestNew"
      />
      <AuthDevOtpHint v-if="!otpBlocked" />
      <AuthFormError :message="apiError" />
      <button type="button" :class="authBack" class="justify-self-start" @click="cancelPhoneOtp">
        ← Back to password sign-in
      </button>
    </div>

    <template v-else>
      <AuthGoogleButton
        :loading="socialProvider === 'google'"
        :disabled="isSubmitting"
        @click="handleSocialLogin('google')"
      />

      <div class="my-[1.3rem] flex items-center gap-[0.9rem] text-[0.85rem] text-muted-foreground">
        <span class="h-px flex-1 bg-border" />or<span class="h-px flex-1 bg-border" />
      </div>

      <form novalidate @submit.prevent="form.handleSubmit">
        <FieldGroup class="gap-[1.1rem]">
          <!-- One method at a time with a quiet switch link, not tabs. The
               inactive method is never validated (see loginSchema.superRefine).
               Both fields share one grid cell, so they crossfade in place
               without the leaving field pulling the password field up. -->
          <div class="grid">
            <Transition
              enter-active-class="transition-opacity duration-200 ease-out motion-reduce:transition-none"
              enter-from-class="opacity-0"
              leave-active-class="transition-opacity duration-150 ease-in motion-reduce:transition-none"
              leave-to-class="opacity-0"
            >
              <div v-if="authMethod === 'email'" key="email" class="col-start-1 row-start-1">
                <form.Field v-slot="{ field }" name="email">
                  <Field :data-invalid="isInvalid(field)">
                    <div class="flex w-full items-baseline justify-between gap-4 text-[0.9rem]">
                      <FieldLabel :for="field.name" class="w-auto font-semibold">Email address</FieldLabel>
                      <button type="button" :class="authLink" :disabled="isSubmitting" @click="authMethod = 'phone'">
                        Use phone instead
                      </button>
                    </div>
                    <Input
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      type="email"
                      inputmode="email"
                      placeholder="alex@example.com"
                      autocomplete="email"
                      :class="authInput"
                      :aria-invalid="isInvalid(field)"
                      :disabled="isSubmitting"
                      @blur="field.handleBlur"
                      @update:model-value="(v) => field.handleChange(v as any)"
                    />
                    <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                  </Field>
                </form.Field>
              </div>

              <div v-else key="phone" class="col-start-1 row-start-1">
                <form.Field v-slot="{ field }" name="phone">
                  <Field :data-invalid="isInvalid(field)">
                    <div class="flex w-full items-baseline justify-between gap-4 text-[0.9rem]">
                      <span class="font-semibold">Phone number</span>
                      <button type="button" :class="authLink" :disabled="isSubmitting" @click="authMethod = 'email'">
                        Use email instead
                      </button>
                    </div>
                    <AuthPhoneInput
                      label=""
                      :model-value="field.state.value"
                      :invalid="isInvalid(field)"
                      :disabled="isSubmitting"
                      @update:model-value="(v) => field.handleChange(v)"
                      @blur="field.handleBlur"
                    />
                    <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                  </Field>
                </form.Field>
              </div>
            </Transition>
          </div>

          <form.Field v-slot="{ field }" name="password">
            <Field :data-invalid="isInvalid(field)">
              <div class="flex w-full items-baseline justify-between gap-4 text-[0.9rem]">
                <FieldLabel :for="field.name" class="w-auto font-semibold">Password</FieldLabel>
                <NuxtLink :to="forgotPasswordLink" :class="authLink">Forgot password?</NuxtLink>
              </div>
              <AuthPasswordInput
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                placeholder="••••••••"
                autocomplete="current-password"
                :aria-invalid="isInvalid(field)"
                :disabled="isSubmitting"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(v as any)"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <AuthFormError :message="apiError" />

          <AuthSubmit :loading="isSubmitting" class="mt-[0.3rem]">
            {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
          </AuthSubmit>
        </FieldGroup>
      </form>
    </template>

    <template v-if="!showPhoneOtpStep" #after>
      New to getalawyer? <NuxtLink to="/register" :class="authLink">Create an account</NuxtLink>
    </template>
  </AuthFormShell>
</template>

<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { authClient } from '~/lib/auth-client'
import { isValidNgPhone } from '~/lib/phone'
import { isOnboardingIncomplete, type SessionUserWithOnboarding } from '~/lib/session-user'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Sign in' })

function sanitizeRedirect(raw: unknown): string {
  if (typeof raw !== 'string') return '/dashboard'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

const { refetchSession } = useAuth()
const route = useRoute()
const redirectAfterLogin = computed(() => sanitizeRedirect(route.query.redirect))

const authMethod = ref<'email' | 'phone'>('email')

// Phone OTP state
const showPhoneOtpStep = ref(false)
const pendingPhone = ref('')
const phoneOtp = ref('')
const otpError = ref('')
const otpBlocked = ref(false)
const isResending = ref(false)
const resendCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const {
  signInWithPhone,
  verifyPhoneOtp,
  sendPhoneOtp,
  isPhoneNotVerifiedError,
  isTooManyAttemptsError,
} = usePhoneAuth()

const loginSchema = z.object({
  email: z.string(),
  phone: z.string(),
  password: z
    .string({ error: 'Password is required.' })
    .min(8, { error: 'Password must be at least 8 characters.' }),
}).superRefine((data, ctx) => {
  if (authMethod.value === 'email') {
    const emailResult = z.email().safeParse(data.email)
    if (!emailResult.success) {
      ctx.addIssue({ code: 'custom', message: 'Please enter a valid email address.', path: ['email'] })
    }
  } else if (!isValidNgPhone(data.phone)) {
    ctx.addIssue({ code: 'custom', message: 'Please enter a valid Nigerian phone number.', path: ['phone'] })
  }
})

const isSubmitting = ref(false)
const socialProvider = ref<'google' | null>(null)
const apiError = ref('')

const form = useForm({
  defaultValues: {
    email: '',
    phone: '',
    password: '',
  },
  validators: {
    onChange: loginSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    apiError.value = ''
    isSubmitting.value = true

    try {
      if (authMethod.value === 'email') {
        const { error: signInError } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        })
        if (signInError) {
          apiError.value = signInError.message || 'The email or password is incorrect. Please try again.'
          return
        }
      } else {
        const { error: signInError } = await signInWithPhone(value.phone, value.password)
        if (signInError) {
          if (isPhoneNotVerifiedError(signInError)) {
            pendingPhone.value = value.phone
            showPhoneOtpStep.value = true
            return
          }
          apiError.value = signInError.message || 'The phone number or password is incorrect.'
          return
        }
      }

      await navigateAfterLogin()
    }
    catch (err: unknown) {
      apiError.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
    }
    finally {
      isSubmitting.value = false
    }
  },
})

const { isInvalid } = useAuthFieldInvalid(form)

const forgotPasswordLink = computed(() => {
  if (authMethod.value === 'phone' && form.state.values.phone) {
    return { path: '/forgot-password', query: { method: 'phone', phone: form.state.values.phone } }
  }
  return '/forgot-password'
})


async function navigateAfterLogin() {
  const freshSession = await refetchSession()
  if (isOnboardingIncomplete(freshSession?.user as SessionUserWithOnboarding)) {
    await navigateTo('/onboarding', { replace: true })
  } else {
    await navigateTo(redirectAfterLogin.value)
  }
}

// OTP logic
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

async function completePhoneOtpVerify() {
  if (phoneOtp.value.length < 6) {
    otpError.value = 'Please enter the full 6-digit code.'
    return
  }
  otpError.value = ''
  apiError.value = ''
  isSubmitting.value = true
  try {
    const { error } = await verifyPhoneOtp({ phone: pendingPhone.value, code: phoneOtp.value })
    if (error) {
      if (isTooManyAttemptsError(error)) {
        otpBlocked.value = true
      } else {
        otpError.value = error.message || 'Invalid verification code.'
      }
      return
    }
    showPhoneOtpStep.value = false
    phoneOtp.value = ''
    await navigateAfterLogin()
  } finally {
    isSubmitting.value = false
  }
}

async function handleOtpResend() {
  if (resendCooldown.value > 0 || isResending.value) return
  isResending.value = true
  otpError.value = ''
  otpBlocked.value = false
  try {
    const { error } = await sendPhoneOtp(pendingPhone.value)
    if (error) {
      apiError.value = error.message || 'Failed to resend code.'
      return
    }
    phoneOtp.value = ''
    startCooldown()
  } finally {
    isResending.value = false
  }
}

async function handleOtpRequestNew() {
  otpBlocked.value = false
  phoneOtp.value = ''
  await handleOtpResend()
}

function cancelPhoneOtp() {
  showPhoneOtpStep.value = false
  phoneOtp.value = ''
  otpError.value = ''
  otpBlocked.value = false
  apiError.value = ''
}

watch(phoneOtp, (v) => {
  if (v.length === 6 && showPhoneOtpStep.value && !isSubmitting.value) {
    completePhoneOtpVerify()
  }
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

const handleSocialLogin = async (provider: 'google') => {
  socialProvider.value = provider
  isSubmitting.value = true
  apiError.value = ''

  try {
    await authClient.signIn.social({
      provider,
      callbackURL: redirectAfterLogin.value,
    })
  }
  catch (err: unknown) {
    apiError.value =
      err instanceof Error ? err.message : `Failed to sign in with ${provider}.`
  }
  finally {
    isSubmitting.value = false
    socialProvider.value = null
  }
}
</script>
