<template>
  <div class="w-full font-sans">
    <LandingBrandLogo class="mx-auto mb-8 lg:hidden" />

    <header class="mb-8 text-center">
      <h1 class="text-balance text-2xl font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-3xl">
        Welcome back
      </h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Enter your details below to sign in to your account
      </p>
    </header>

    <div class="rounded-xl border border-border/40 bg-card p-5 shadow-none sm:p-7">
      <div class="mb-6">
        <Button
          type="button"
          variant="outline"
          class="w-full"
          :disabled="isSubmitting"
          @click="handleSocialLogin('google')"
        >
          <HugeiconsIcon :icon="Loading03Icon" v-if="socialProvider === 'google'" class="mr-2 h-4 w-4 animate-spin" />
          <svg v-else viewBox="0 0 24 24" class="mr-2 h-5 w-5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>
      </div>

      <div class="relative mb-6 flex items-center gap-4">
        <div class="h-px flex-1 bg-border" />
        <span class="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Or continue with
        </span>
        <div class="h-px flex-1 bg-border" />
      </div>

      <!-- Inline OTP after unverified phone login -->
      <div v-if="showPhoneOtpStep" class="flex flex-col gap-4">
        <header>
          <h2 class="text-lg font-medium text-foreground">
            Verify your phone
          </h2>
          <p class="mt-1 text-sm text-muted-foreground">
            We sent a code to <strong class="text-foreground">{{ pendingPhone }}</strong>.
            Enter it below to complete sign-in.
          </p>
        </header>
        
        <div v-if="otpBlocked" class="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
          <p class="text-sm font-medium text-destructive">Too many attempts</p>
          <p class="mt-1 text-sm text-muted-foreground">Please request a new verification code to continue.</p>
          <Button
            type="button"
            variant="outline"
            class="mt-4"
            :disabled="resendCooldown > 0 || isResending"
            @click="handleOtpRequestNew"
          >
            <template v-if="isResending">Sending…</template>
            <template v-else-if="resendCooldown > 0">Request new code in {{ resendCooldown }}s</template>
            <template v-else>Request new code</template>
          </Button>
        </div>
        <template v-else>
          <InputOTP
            v-model="phoneOtp"
            :maxlength="6"
            :disabled="isSubmitting"
            class="w-full justify-center gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 3" :key="i" :index="i - 1" :class="otpError ? 'border-destructive' : ''" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 3" :key="i + 3" :index="i + 2" :class="otpError ? 'border-destructive' : ''" />
            </InputOTPGroup>
          </InputOTP>

          <p v-if="otpError" class="flex items-center justify-center gap-1.5 text-sm text-destructive">
            <HugeiconsIcon :icon="AlertCircleIcon" class="size-3.5 shrink-0" />
            {{ otpError }}
          </p>

          <p class="text-center text-sm text-muted-foreground">
            Code expires in a few minutes.
            <Button
              type="button"
              variant="link"
              class="h-auto p-0 font-medium"
              :disabled="isResending || resendCooldown > 0"
              @click="handleOtpResend"
            >
              <template v-if="isResending">Sending…</template>
              <template v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</template>
              <template v-else>Resend code</template>
            </Button>
          </p>
        </template>
        
        <!-- Dev Hint -->
        <div v-if="process.dev && !otpBlocked" class="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary/80">
          <p class="font-medium">Development Mode</p>
          <p class="mt-1">Check your terminal or browser console for the verification code.</p>
        </div>

        <p v-if="apiError" class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <HugeiconsIcon :icon="AlertCircleIcon" class="h-4 w-4 shrink-0" />
          {{ apiError }}
        </p>

        <Button
          type="button"
          variant="ghost"
          class="w-full"
          @click="cancelPhoneOtp"
        >
          Back to password sign-in
        </Button>
      </div>

      <form v-else @submit.prevent="form.handleSubmit">
        <FieldGroup class="gap-5">
          <Tabs :model-value="authMethod" @update:model-value="(v) => authMethod = v as 'email' | 'phone'" class="w-full">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="email" :disabled="isSubmitting">Email</TabsTrigger>
              <TabsTrigger value="phone" :disabled="isSubmitting">Phone</TabsTrigger>
            </TabsList>
            <div v-show="authMethod === 'email'" class="mt-4">
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
                    :aria-invalid="isInvalid(field)"
                    :disabled="isSubmitting"
                    @blur="field.handleBlur"
                    @update:model-value="(v) => field.handleChange(v as any)"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>
            </div>
            <div v-show="authMethod === 'phone'" class="mt-4">
              <form.Field v-slot="{ field }" name="phone">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">Phone number</FieldLabel>
                  <div class="flex gap-2">
                    <div
                      class="flex h-10 shrink-0 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-muted-foreground"
                      aria-hidden="true"
                    >
                      +234
                    </div>
                    <Input
                      :id="field.name"
                      :model-value="getPhoneLocalDigits(field.state.value)"
                      type="tel"
                      inputmode="numeric"
                      placeholder="801 234 5678"
                      autocomplete="tel"
                      :disabled="isSubmitting"
                      :aria-invalid="isInvalid(field)"
                      class="flex-1"
                      @update:model-value="(v) => handlePhoneInput(v as string, field.handleChange)"
                      @blur="field.handleBlur"
                    />
                  </div>
                  <p v-if="getPhoneDisplayValue(field.state.value) && !isInvalid(field)" class="mt-1 text-xs text-muted-foreground">
                    {{ getPhoneDisplayValue(field.state.value) }}
                  </p>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>
            </div>
          </Tabs>

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
              <div class="relative">
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :type="passwordVisible ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="pr-10"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(v as any)"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
                  :disabled="isSubmitting"
                  @click="passwordVisible = !passwordVisible"
                >
                  <HugeiconsIcon :icon="ViewOffIcon" v-if="passwordVisible" class="h-4 w-4" />
                  <HugeiconsIcon :icon="ViewIcon" v-else class="h-4 w-4" />
                </button>
              </div>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <p v-if="apiError" class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <HugeiconsIcon :icon="AlertCircleIcon" class="h-4 w-4 shrink-0" />
            {{ apiError }}
          </p>

          <Button
            type="submit"
            class="w-full"
            :disabled="isSubmitting"
          >
            <HugeiconsIcon :icon="Loading03Icon" v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            <span>{{ isSubmitting ? 'Signing in…' : 'Sign in' }}</span>
          </Button>
        </FieldGroup>
      </form>
    </div>

    <div class="mt-6 space-y-5">
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

      <p class="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?
        <NuxtLink
          to="/register"
          class="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircleIcon, Loading03Icon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import LandingBrandLogo from '@/components/landing/LandingBrandLogo.vue'
import { authClient } from '~/lib/auth-client'
import { isValidNgPhone, normalizeNgPhone, toE164Plus, formatNgPhoneDisplay } from '~/lib/phone'
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

const authMethod = ref<'email' | 'phone'>('email')
const passwordVisible = ref(false)

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

// Phone formatting logic
function getPhoneLocalDigits(value: string) {
  const normalized = normalizeNgPhone(value)
  if (!normalized) return value.replace(/\D/g, '').replace(/^234/, '').replace(/^0/, '')
  return normalized.startsWith('234') ? normalized.slice(3) : normalized
}

function getPhoneDisplayValue(value: string) {
  const normalized = normalizeNgPhone(value || `0${getPhoneLocalDigits(value)}`)
  if (!normalized) return ''
  return formatNgPhoneDisplay(normalized)
}

function handlePhoneInput(rawValue: string, handleChange: (v: string) => void) {
  const digits = String(rawValue).replace(/\D/g, '').slice(0, 10)
  const normalized = normalizeNgPhone(digits.length === 10 ? digits : `0${digits}`)
  if (normalized) {
    handleChange(toE164Plus(normalized))
  } else {
    handleChange(digits)
  }
}

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
