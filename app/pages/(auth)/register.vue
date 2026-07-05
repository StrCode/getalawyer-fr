<template>
  <div class="relative flex min-h-dvh w-full max-w-full flex-col overflow-x-clip bg-background font-sans">
    <!-- Background: clipped so blur paint cannot extend scroll width -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        class="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-muted/60 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        class="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-muted/40 blur-3xl sm:h-96 sm:w-96"
      />
    </div>

    <header class="relative z-20 flex min-w-0 shrink-0 items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-8 sm:py-6">
      <LandingBrandLogo to="/" />

      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <span class="hidden text-sm font-medium text-muted-foreground sm:inline">
          Already have an account?
        </span>
        <NuxtLink
          to="/login"
          class="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-xs transition-colors hover:bg-muted sm:px-5 sm:py-2.5 sm:text-sm"
        >
          Sign in
        </NuxtLink>
      </div>
    </header>

    <main class="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-start px-2 pt-6 pb-8 sm:justify-start sm:px-8 sm:py-12 lg:py-16">
      <div class="mx-auto w-full min-w-0 sm:max-w-3xl">
        <Transition name="slide-fade" mode="out-in">
          <!-- Step 1: Role selection -->
          <div v-if="step === 'role'" key="role" class="mx-auto flex w-full flex-col items-center gap-6 sm:max-w-none sm:gap-0">
            <div class="w-full text-center sm:mb-10">
              <p class="text-xs font-semibold uppercase tracking-widest mb-2 text-primary sm:mb-3">
                Account type
              </p>
              <h1
                class="font-heading text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground sm:text-4xl"
              >
                How would you like to use GetaLawyer?
              </h1>
              <p class="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:max-w-xl sm:text-base">
                Select the path that matches your needs today.
              </p>
            </div>

            <RadioGroup
              v-model="selectedRole"
              class="grid w-full min-w-0 grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-5"
            >
              <Label
                :for="clientRoleId"
                :class="roleCardClass('client')"
                class="group cursor-pointer"
              >
                <RadioGroupItem
                  :id="clientRoleId"
                  value="client"
                  class="sr-only"
                />
                <div class="relative px-5 py-6 text-center sm:p-7 sm:text-left">
                  <span
                    class="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all sm:top-6 sm:right-6 sm:h-6 sm:w-6"
                    :class="
                      selectedRole === 'client'
                        ? 'scale-100 border-primary bg-primary shadow-md shadow-primary/25'
                        : 'scale-100 border-border bg-background'
                    "
                  >
                    <PhCheck v-if="selectedRole === 'client'" class="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" weight="bold" />
                  </span>
                  <div
                    class="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-muted ring-1 ring-border transition-transform sm:mx-0 sm:mb-6 sm:size-14 sm:rounded-2xl"
                    :class="selectedRole === 'client' ? 'sm:group-hover:scale-105' : ''"
                  >
                    <PhUser
                      class="h-5 w-5 sm:h-7 sm:w-7"
                      :class="selectedRole === 'client' ? 'text-primary' : 'text-primary'"
                      weight="duotone"
                    />
                  </div>
                  <h2 class="mb-1 text-xl font-semibold leading-tight text-foreground sm:mb-2 sm:text-2xl">
                    I am a Client
                  </h2>
                  <p class="text-base font-normal leading-relaxed text-muted-foreground sm:text-base">
                    Find and book a verified Nigerian lawyer for legal assistance.
                  </p>
                </div>
              </Label>

              <Label
                :for="lawyerRoleId"
                :class="roleCardClass('lawyer')"
                class="group cursor-pointer"
              >
                <RadioGroupItem
                  :id="lawyerRoleId"
                  value="lawyer"
                  class="sr-only"
                />
                <div class="relative px-5 py-6 text-center sm:p-7 sm:text-left">
                  <span
                    class="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all sm:top-6 sm:right-6 sm:h-6 sm:w-6"
                    :class="
                      selectedRole === 'lawyer'
                        ? 'scale-100 border-primary bg-primary shadow-md shadow-primary/25'
                        : 'scale-100 border-border bg-background'
                    "
                  >
                    <PhCheck v-if="selectedRole === 'lawyer'" class="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" weight="bold" />
                  </span>
                  <div
                    class="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-muted ring-1 ring-border transition-transform sm:mx-0 sm:mb-6 sm:size-14 sm:rounded-2xl"
                    :class="selectedRole === 'lawyer' ? 'sm:group-hover:scale-105' : ''"
                  >
                    <PhBriefcase
                      class="h-5 w-5 sm:h-7 sm:w-7"
                      :class="selectedRole === 'lawyer' ? 'text-primary' : 'text-primary'"
                      weight="duotone"
                    />
                  </div>
                  <h2 class="mb-1 text-xl font-semibold leading-tight text-foreground sm:mb-2 sm:text-2xl">
                    I am a Lawyer
                  </h2>
                  <p class="text-base font-normal leading-relaxed text-muted-foreground sm:text-base">
                    List your services and grow your client base on our network.
                  </p>
                </div>
              </Label>
            </RadioGroup>

            <div class="flex w-full flex-col items-center gap-4 sm:gap-6">
              <Button
                type="button"
                class="inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold sm:h-11 sm:max-w-xs sm:rounded-2xl sm:text-base"
                size="lg"
                :disabled="!selectedRole"
                @click="step = 'form'"
              >
                Continue
              </Button>
              <p class="text-center text-sm text-muted-foreground sm:hidden">
                Already have an account?
                <NuxtLink to="/login" class="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign in
                </NuxtLink>
              </p>
            </div>
          </div>

          <!-- Step 2: Registration form (email or phone tabs) -->
          <div v-else-if="step === 'form'" key="form" class="mx-auto flex w-full min-w-0 flex-col items-center gap-6 sm:items-stretch sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="inline-flex gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:mb-6 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm sm:self-start"
              @click="step = 'role'"
            >
              <PhArrowLeft class="h-4 w-4" />
              Change selection
            </Button>

            <div class="w-full text-center sm:mb-10">
              <p class="text-xs font-semibold uppercase tracking-widest mb-2 text-primary sm:mb-3">
                Registration
              </p>
              <h1 class="font-heading text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-foreground sm:text-4xl">
                {{ selectedRole === 'lawyer' ? 'Apply as a Lawyer' : 'Create your account' }}
              </h1>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
                {{
                  selectedRole === 'lawyer'
                    ? 'Join Nigeria\'s most trusted legal network.'
                    : 'Get started with GetaLawyer today.'
                }}
              </p>
            </div>

            <Card
              class="relative w-full gap-0 overflow-hidden rounded-2xl border border-border bg-card px-5 py-5 shadow-lg sm:rounded-3xl sm:px-10 sm:py-10 sm:shadow-xl lg:px-12 lg:py-12"
            >
              <div
                class="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-muted/50 blur-3xl"
                aria-hidden="true"
              />

              <form class="relative z-10" @submit.prevent="form.handleSubmit">
                <FieldGroup class="gap-4 sm:gap-6">
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
                          class="h-11 text-base"
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
                          class="h-11 text-base"
                          :aria-invalid="isInvalid(field)"
                          :disabled="isSubmitting"
                          @blur="field.handleBlur"
                          @update:model-value="(v) => field.handleChange(v as any)"
                        />
                        <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                      </Field>
                    </form.Field>
                  </div>

                  <AuthMethodTabs v-model="authMethod" :disabled="isSubmitting">
                    <TabsContent value="email" class="mt-0 space-y-0">
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
                    </TabsContent>

                    <TabsContent value="phone" class="mt-0 space-y-0">
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
                    </TabsContent>
                  </AuthMethodTabs>

                  <form.Field v-slot="{ field }" name="password">
                    <Field :data-invalid="isInvalid(field)">
                      <FieldLabel :for="field.name">Password</FieldLabel>
                      <AuthPasswordInput
                        :id="field.name"
                        :name="field.name"
                        :model-value="field.state.value"
                        placeholder="••••••••"
                        autocomplete="new-password"
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
                    class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold sm:h-11 sm:rounded-2xl sm:text-base"
                    size="lg"
                    :disabled="isSubmitting"
                  >
                    <PhCircleNotch v-if="isSubmitting" class="h-4 w-4 shrink-0 animate-spin" />
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
            </Card>

            <p class="mx-auto w-full text-center text-xs leading-relaxed text-muted-foreground sm:mt-6 sm:max-w-xl sm:text-sm">
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

          <!-- Step 4: Phone OTP verify -->
          <div v-else key="verify" class="mx-auto flex w-full min-w-0 flex-col items-center gap-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="inline-flex gap-1.5 self-start rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted sm:px-4 sm:py-2 sm:text-sm"
              @click="step = 'form'"
            >
              <PhArrowLeft class="h-4 w-4" />
              Back
            </Button>

            <div class="w-full text-center">
              <h1 class="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">Verify your phone</h1>
              <p class="mt-2 text-sm text-muted-foreground">
                Enter the code sent to <strong>{{ pendingPhone }}</strong>
              </p>
            </div>

            <Card class="w-full rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
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
              <AuthDevOtpHint class="mt-4" />
              <AuthFormError :message="apiError" class="mt-4" />
              <Button
                type="button"
                class="mt-6 h-11 w-full cursor-pointer rounded-xl font-semibold"
                :disabled="isSubmitting || phoneOtp.length < 6"
                @click="completePhoneRegistration"
              >
                <PhCircleNotch v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
                Create account
              </Button>
            </Card>
          </div>
        </Transition>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import {
  PhArrowLeft,
  PhBriefcase,
  PhUser,
  PhCheck,
  PhCircleNotch,
} from '@phosphor-icons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { authPasswordSchema } from '~/lib/auth-password'
import { authClient } from '~/lib/auth-client'
import { isValidNgPhone } from '~/lib/phone'
import type { AuthMethod } from '@/components/auth/MethodTabs.vue'

definePageMeta({
  layout: false,
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
const authMethod = ref<AuthMethod>('email')
const pendingPhone = ref('')
const pendingPassword = ref('')
const pendingName = ref('')
const phoneOtp = ref('')
const otpError = ref('')
const otpBlocked = ref(false)
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
    'group w-full min-w-0 cursor-pointer overflow-hidden rounded-2xl border bg-card transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 sm:rounded-3xl',
    selectedRole.value === value
      ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
      : 'border-border hover:border-primary/40 hover:bg-muted sm:hover:-translate-y-0.5 sm:hover:shadow-lg',
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
