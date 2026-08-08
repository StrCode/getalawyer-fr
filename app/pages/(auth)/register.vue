<template>
  <div class="w-full font-sans">
    <div class="snapshot-rise">
      <Transition name="slide-fade" mode="out-in">
            <!-- Step 1: Role selection -->
            <div v-if="step === 'role'" key="role" class="flex w-full flex-col">
              <header class="mb-8 text-center">
                <h1
                  class="text-2xl font-medium leading-tight text-foreground sm:text-3xl"
                >
                  How would you like to use GetaLawyer?
                </h1>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Select the option that best describes you.
                </p>
              </header>

              <RadioGroup
                v-model="selectedRole"
                class="grid w-full grid-cols-1 gap-3 sm:gap-4"
              >
                <Label
                  :for="clientRoleId"
                  :class="roleCardClass('client')"
                  class="cursor-pointer"
                >
                  <RadioGroupItem
                    :id="clientRoleId"
                    value="client"
                    class="sr-only"
                  />
                  <div class="flex items-start gap-4 p-4 sm:p-5">
                    <div
                      class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
                    >
                      <HugeiconsIcon :icon="UserIcon"
                        class="size-5 text-foreground/70"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <h2 class="text-base font-medium leading-tight text-foreground sm:text-lg">
                        I need a lawyer
                      </h2>
                      <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Find and book a verified Nigerian lawyer for legal assistance.
                      </p>
                    </div>
                    <span
                      class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                      :class="
                        selectedRole === 'client'
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      "
                    >
                      <HugeiconsIcon :icon="Tick01Icon" v-if="selectedRole === 'client'" class="size-3 text-white" />
                    </span>
                  </div>
                </Label>

                <Label
                  :for="lawyerRoleId"
                  :class="roleCardClass('lawyer')"
                  class="cursor-pointer"
                >
                  <RadioGroupItem
                    :id="lawyerRoleId"
                    value="lawyer"
                    class="sr-only"
                  />
                  <div class="flex items-start gap-4 p-4 sm:p-5">
                    <div
                      class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
                    >
                      <HugeiconsIcon :icon="Briefcase01Icon"
                        class="size-5 text-foreground/70"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <h2 class="text-base font-medium leading-tight text-foreground sm:text-lg">
                        I am a lawyer
                      </h2>
                      <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
                        List your services and grow your client base on our network.
                      </p>
                    </div>
                    <span
                      class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                      :class="
                        selectedRole === 'lawyer'
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      "
                    >
                      <HugeiconsIcon :icon="Tick01Icon" v-if="selectedRole === 'lawyer'" class="size-3 text-white" />
                    </span>
                  </div>
                </Label>
              </RadioGroup>

              <div class="mt-8 flex flex-col gap-4">
                <Button
                  type="button"
                  class="w-full"
                  :disabled="!selectedRole"
                  @click="step = 'form'"
                >
                  Continue
                </Button>
                <p class="text-center text-sm text-muted-foreground sm:hidden">
                  Already have an account?
                  <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
                    Sign in
                  </NuxtLink>
                </p>
              </div>
            </div>

            <!-- Step 2: Registration form (email or phone tabs) -->
            <div v-else-if="step === 'form'" key="form" class="flex w-full flex-col">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="mb-6 inline-flex w-fit gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                @click="step = 'role'"
              >
                <HugeiconsIcon :icon="ArrowLeft01Icon" class="size-4" />
                Change selection
              </Button>

              <header class="mb-6 text-center">
                <h1 class="text-2xl font-medium leading-tight text-foreground sm:text-3xl">
                  {{ selectedRole === 'lawyer' ? 'Apply as a Lawyer' : 'Create your account' }}
                </h1>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {{
                    selectedRole === 'lawyer'
                      ? 'Join Nigeria\'s most trusted legal network.'
                      : 'Get started with GetaLawyer today.'
                  }}
                </p>
              </header>

              <div class="rounded-xl border border-foreground/15 bg-card p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-8">
                <template v-if="selectedRole === 'client'">
                  <Button
                    type="button"
                    variant="outline"
                    class="w-full"
                    :disabled="isSubmitting"
                    @click="handleSocialSignup('google')"
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
                  <div class="relative my-6 flex items-center gap-4">
                    <div class="h-px flex-1 bg-border" />
                    <span class="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Or continue with
                    </span>
                    <div class="h-px flex-1 bg-border" />
                  </div>
                </template>
                <form @submit.prevent="form.handleSubmit">
                  <FieldGroup class="gap-4 sm:gap-5">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                      <form.Field v-slot="{ field }" name="firstName">
                        <Field :data-invalid="isInvalid(field)">
                          <FieldLabel :for="field.name">First name</FieldLabel>
                          <Input
                            :id="field.name"
                            :name="field.name"
                            :model-value="field.state.value"
                            placeholder="Alex"
                            autocomplete="given-name"
                            :aria-invalid="isInvalid(field)"
                            :disabled="isSubmitting"
                            @blur="field.handleBlur"
                            @update:model-value="(v) => field.handleChange(v as any)"
                          />
                          <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                        </Field>
                      </form.Field>

                      <form.Field v-slot="{ field }" name="lastName">
                        <Field :data-invalid="isInvalid(field)">
                          <FieldLabel :for="field.name">Last name</FieldLabel>
                          <Input
                            :id="field.name"
                            :name="field.name"
                            :model-value="field.state.value"
                            placeholder="Smith"
                            autocomplete="family-name"
                            :aria-invalid="isInvalid(field)"
                            :disabled="isSubmitting"
                            @blur="field.handleBlur"
                            @update:model-value="(v) => field.handleChange(v as any)"
                          />
                          <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                        </Field>
                      </form.Field>
                    </div>

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
                        <FieldLabel :for="field.name">Password</FieldLabel>
                        <div class="relative">
                          <Input
                            :id="field.name"
                            :name="field.name"
                            :model-value="field.state.value"
                            :type="passwordVisible ? 'text' : 'password'"
                            placeholder="••••••••"
                            autocomplete="new-password"
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
                      <HugeiconsIcon :icon="Loading03Icon" v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
                      <span>
                        {{
                          isSubmitting
                            ? (authMethod === 'phone' ? 'Sending code…' : 'Creating account…')
                            : authMethod === 'phone'
                              ? 'Send verification code'
                              : selectedRole === 'lawyer'
                                ? 'Apply as Lawyer'
                                : 'Create account'
                        }}
                      </span>
                    </Button>
                  </FieldGroup>
                </form>
              </div>

              <p class="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
                By continuing, you agree to our
                <NuxtLink to="/terms" class="text-foreground underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </NuxtLink>
                and
                <NuxtLink to="/privacy" class="text-foreground underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </NuxtLink>.
              </p>
            </div>

            <!-- Step 3: Phone OTP verify -->
            <div v-else key="verify" class="flex w-full flex-col">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="mb-6 inline-flex w-fit gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                @click="step = 'form'"
              >
                <HugeiconsIcon :icon="ArrowLeft01Icon" class="size-4" />
                Back
              </Button>

              <header class="mb-6 text-center">
                <h1 class="text-2xl font-medium leading-tight text-foreground sm:text-3xl">Verify your phone</h1>
                <p class="mt-2 text-sm text-muted-foreground">
                  Enter the code sent to <strong class="text-foreground">{{ pendingPhone }}</strong>
                </p>
              </header>

              <div class="flex flex-col gap-4 rounded-xl border border-foreground/15 bg-card p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-8">
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
                <div v-if="isDev && !otpBlocked" class="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary/80">
                  <p class="font-medium">Development Mode</p>
                  <p class="mt-1">Check your terminal or browser console for the verification code.</p>
                </div>

                <p v-if="apiError" class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <HugeiconsIcon :icon="AlertCircleIcon" class="h-4 w-4 shrink-0" />
                  {{ apiError }}
                </p>

                <Button
                  type="button"
                  class="mt-2 w-full"
                  :disabled="isSubmitting || phoneOtp.length < 6"
                  @click="completePhoneRegistration"
                >
                  <HugeiconsIcon :icon="Loading03Icon" v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
                  Create account
                </Button>
              </div>
            </div>
          </Transition>
    </div>

    <div class="mt-6 flex items-center justify-center gap-2 border-t border-foreground/10 pt-5">
      <span class="text-sm text-muted-foreground">Already have an account?</span>
      <NuxtLink
        to="/login"
        class="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Sign in
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft01Icon, Briefcase01Icon, Loading03Icon, Tick01Icon, UserIcon, AlertCircleIcon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'
import { authPasswordSchema } from '~/lib/auth-password'
import { authClient } from '~/lib/auth-client'
import { isValidNgPhone, normalizeNgPhone, toE164Plus, formatNgPhoneDisplay } from '~/lib/phone'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

const { refetchSession } = useAuth()
const route = useRoute()

const clientRoleId = useId()
const lawyerRoleId = useId()

const roleFromQuery = route.query.role as string
const selectedRole = ref<'client' | 'lawyer' | undefined>(
  roleFromQuery === 'lawyer'
    ? 'lawyer'
    : roleFromQuery === 'client'
      ? 'client'
      : undefined,
)
const step = ref<'role' | 'form' | 'verify'>('role')
const authMethod = ref<'email' | 'phone'>('email')
const passwordVisible = ref(false)

const pendingPhone = ref('')
const pendingPassword = ref('')
const pendingName = ref('')
const phoneOtp = ref('')
const otpError = ref('')
const otpBlocked = ref(false)
// Bound in setup: `process.dev` is not reachable from templates in production builds.
const isDev = import.meta.dev
const isResending = ref(false)
const resendCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const {
  sendPhoneOtp,
  verifyPhoneAndRegister,
  completePhoneRegistrationPassword,
  isTooManyAttemptsError,
} = usePhoneAuth()

function roleCardClass(value: 'client' | 'lawyer') {
  return cn(
    'w-full overflow-hidden rounded-xl border bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    selectedRole.value === value
      ? 'border-primary bg-primary/5'
      : 'border-border hover:border-foreground/20',
  )
}

const registerSchema = z.object({
  firstName: z
    .string('First name is required.')
    .min(2, 'First name must be at least 2 characters.'),
  lastName: z
    .string('Last name is required.')
    .min(2, 'Last name must be at least 2 characters.'),
  email: z.string(),
  phone: z.string(),
  password: authPasswordSchema,
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
const apiError = ref('')
const socialProvider = ref<'google' | null>(null)

// Same Better Auth social flow as login: signIn.social creates the account
// on first use; role/type is settled by onboarding, exactly as it is for
// Google users arriving via the login page.
const handleSocialSignup = async (provider: 'google') => {
  socialProvider.value = provider
  isSubmitting.value = true
  apiError.value = ''
  try {
    await authClient.signIn.social({
      provider,
      callbackURL: '/dashboard',
    })
  }
  catch (err: unknown) {
    apiError.value =
      err instanceof Error ? err.message : `Failed to continue with ${provider}.`
  }
  finally {
    isSubmitting.value = false
    socialProvider.value = null
  }
}

const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  },
  validators: {
    onSubmit: registerSchema,
    onBlur: registerSchema,
  },
  onSubmit: async ({ value }) => {
    apiError.value = ''
    isSubmitting.value = true

    try {
      const fullName = `${value.firstName} ${value.lastName}`.trim()

      if (authMethod.value === 'email') {
        const { error: signUpError } = await authClient.signUp.email({
          name: fullName,
          email: value.email,
          password: value.password,
          userType: selectedRole.value || 'client',
          callbackURL: '/onboarding',
        })

        if (signUpError) {
          apiError.value = signUpError.message || 'Failed to create account. Please try again.'
          return
        }

        await refetchSession()
        await navigateTo('/onboarding')
        return
      }

      pendingPhone.value = value.phone
      pendingPassword.value = value.password
      pendingName.value = fullName

      const { error: otpError } = await sendPhoneOtp(value.phone)
      if (otpError) {
        apiError.value = otpError.message || 'Failed to send verification code.'
        return
      }

      step.value = 'verify'
      startCooldown()
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

async function completePhoneRegistration() {
  if (phoneOtp.value.length < 6) {
    otpError.value = 'Please enter the full 6-digit code.'
    return
  }

  apiError.value = ''
  otpError.value = ''
  isSubmitting.value = true

  try {
    const { error: verifyError } = await verifyPhoneAndRegister({
      phone: pendingPhone.value,
      code: phoneOtp.value,
      name: pendingName.value,
      userType: selectedRole.value || 'client',
    })

    if (verifyError) {
      if (isTooManyAttemptsError(verifyError)) {
        otpBlocked.value = true
      } else {
        otpError.value = verifyError.message || 'Invalid verification code.'
      }
      return
    }

    const { error: pwdError } = await completePhoneRegistrationPassword({
      phone: pendingPhone.value,
      code: phoneOtp.value,
      password: pendingPassword.value,
    })

    if (pwdError) {
      apiError.value = pwdError.message || 'Failed to set password.'
      return
    }

    await refetchSession()
    await navigateTo('/onboarding')
  } catch (err: unknown) {
    apiError.value = err instanceof Error ? err.message : 'Registration failed.'
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

watch(phoneOtp, (v) => {
  if (v.length === 6 && step.value === 'verify' && !isSubmitting.value) {
    completePhoneRegistration()
  }
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

onMounted(() => {
  if (selectedRole.value) {
    step.value = 'form'
  }
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
