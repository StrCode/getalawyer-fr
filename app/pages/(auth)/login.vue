<template>
  <AuthFormShell
    eyebrow="Sign in"
    title="Welcome back"
    description="Sign in to your GetaLawyer account"
  >
    <div class="mb-6">
      <AuthSocialButton
        provider="google"
        :disabled="isSubmitting"
        :loading="socialProvider === 'google'"
        @click="handleSocialLogin('google')"
      >
        Continue with Google
      </AuthSocialButton>
    </div>

    <AuthDivider class="mb-6" />

    <!-- Inline OTP after unverified phone login -->
    <div v-if="showPhoneOtpStep" class="space-y-6">
      <header>
        <h2 class="text-lg font-semibold text-foreground">
          Verify your phone
        </h2>
        <p class="mt-1 text-sm text-muted-foreground">
          We sent a code to <strong class="text-foreground">{{ pendingPhone }}</strong>.
          Enter it below to complete sign-in.
        </p>
      </header>
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
      <AuthDevOtpHint />
      <AuthFormError :message="apiError" />
      <Button
        type="button"
        variant="ghost"
        class="w-full cursor-pointer"
        @click="cancelPhoneOtp"
      >
        Back to password sign-in
      </Button>
    </div>

    <form v-else @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-5">
        <AuthMethodTabs v-model="authMethod" :disabled="isSubmitting">
          <template #email>
            <form.Field v-slot="{ field }" name="email">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Email address</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  type="email"
                  placeholder="alex@example.com"
                  autocomplete="email"
                  class="h-11 text-base"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(v as any)"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </template>

          <template #phone>
            <form.Field v-slot="{ field }" name="phone">
              <Field :data-invalid="isInvalid(field)">
                <AuthPhoneInput
                  :model-value="field.state.value"
                  :invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(v as any)"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </template>
        </AuthMethodTabs>

        <form.Field v-slot="{ field }" name="password">
          <Field :data-invalid="isInvalid(field)">
            <div class="flex w-full items-center justify-between gap-3">
              <FieldLabel :for="field.name" class="w-auto">
                Password
              </FieldLabel>
              <NuxtLink
                :to="forgotPasswordLink"
                class="shrink-0 text-sm font-medium text-primary hover:text-primary/80"
              >
                Forgot password?
              </NuxtLink>
            </div>
            <AuthPasswordInput
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              placeholder="••••••••"
              autocomplete="current-password"
              input-class="h-11 text-base"
              :aria-invalid="isInvalid(field)"
              :disabled="isSubmitting"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(v as any)"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <AuthFormError :message="apiError" />

        <Button
          type="submit"
          class="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 text-base font-semibold"
          size="lg"
          :disabled="isSubmitting"
        >
          <AppIcon :icon="appIcons.circleNotch" v-if="isSubmitting" class="size-4 shrink-0 animate-spin" />
          <span>{{ isSubmitting ? 'Signing in…' : 'Sign in' }}</span>
        </Button>
      </FieldGroup>
    </form>

    <template #after>
      <p class="text-center text-sm leading-relaxed text-muted-foreground">
        By continuing, you agree to our
        <NuxtLink to="/terms" class="text-foreground underline underline-offset-4 hover:text-primary">
          Terms of Service
        </NuxtLink>
        and
        <NuxtLink to="/privacy" class="text-foreground underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </NuxtLink>.
      </p>

      <p class="text-center text-base text-muted-foreground">
        Don&apos;t have an account?
        <NuxtLink
          to="/register"
          class="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </NuxtLink>
      </p>
    </template>
  </AuthFormShell>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import type { AuthMethod } from '@/components/auth/MethodTabs.vue'
import { authClient } from '~/lib/auth-client'
import { isValidNgPhone } from '~/lib/phone'
import { isOnboardingIncomplete, type SessionUserWithOnboarding } from '~/lib/session-user'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
  authTitle: 'Welcome back to GetaLawyer.',
  authDescription: 'Log in to access your dashboard, manage your cases, and connect with top legal professionals.',
})

function sanitizeRedirect(raw: unknown): string {
  if (typeof raw !== 'string') return '/dashboard'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

const { refetchSession } = useAuth()
const route = useRoute()
const redirectAfterLogin = computed(() => sanitizeRedirect(route.query.redirect))

const authMethod = ref<AuthMethod>('email')
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
    onSubmit: loginSchema,
    onBlur: loginSchema,
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

const { isInvalid } = useAuthFieldInvalid()

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
