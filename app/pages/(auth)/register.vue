<template>
  <div class="w-full">
    <Transition name="slide-fade" mode="out-in">
      <!-- Step 1: who is signing up -->
      <AuthFormShell
        v-if="step === 'role'"
        key="role"
        title="Create your account"
        description="First, tell us what brings you here."
      >
        <RadioGroup v-model="selectedRole" aria-label="Account type" class="grid gap-2.5">
          <Label :for="clientRoleId" :class="roleCardClass('client')">
            <RadioGroupItem :id="clientRoleId" value="client" class="sr-only" />
            <span :class="roleIcon"><CanopyGlyph name="search" :size="22" /></span>
            <span class="min-w-0">
              <b class="block font-display text-lg font-normal tracking-tight">I need a lawyer</b>
              <small class="mt-0.5 block text-sm leading-normal font-normal opacity-75">Find and book a verified Nigerian lawyer for legal assistance.</small>
            </span>
            <i aria-hidden="true" :class="roleDot(selectedRole === 'client')" />
          </Label>
          <Label :for="lawyerRoleId" :class="roleCardClass('lawyer')">
            <RadioGroupItem :id="lawyerRoleId" value="lawyer" class="sr-only" />
            <span :class="roleIcon"><CanopyGlyph name="scales" :size="22" /></span>
            <span class="min-w-0">
              <b class="block font-display text-lg font-normal tracking-tight">I am a lawyer</b>
              <small class="mt-0.5 block text-sm leading-normal font-normal opacity-75">List your services and grow your client base on our network.</small>
            </span>
            <i aria-hidden="true" :class="roleDot(selectedRole === 'lawyer')" />
          </Label>
        </RadioGroup>

        <p aria-live="polite" class="mt-3.5 mb-4.5 text-sm text-muted-foreground">{{ roleHint }}</p>

        <AuthSubmit type="button" :disabled="!selectedRole" @click="step = 'form'">
          Continue
        </AuthSubmit>

        <template #after>
          Already have an account? <NuxtLink to="/login" :class="authLink">Sign in</NuxtLink>
        </template>
      </AuthFormShell>

      <!-- Step 2: details. Clients may use Google, email or phone; lawyers use email. -->
      <AuthFormShell
        v-else-if="step === 'form'"
        key="form"
        :title="selectedRole === 'lawyer' ? 'Apply as a lawyer' : 'Create your account'"
        :description="selectedRole === 'lawyer'
          ? 'Create your account first. Your practice details and verification come next.'
          : 'Messaging a lawyer is free once you are in.'"
      >
        <template #back>
          <button type="button" :class="authBack" @click="step = 'role'">← Change selection</button>
        </template>

        <template v-if="selectedRole === 'client'">
          <AuthGoogleButton
            :loading="socialProvider === 'google'"
            :disabled="isSubmitting"
            @click="handleSocialSignup('google')"
          />
          <div class="my-5.25 flex items-center gap-3.5 text-sm text-muted-foreground">
            <span class="h-px flex-1 bg-border" />or<span class="h-px flex-1 bg-border" />
          </div>
        </template>

        <form novalidate @submit.prevent="form.handleSubmit">
          <FieldGroup class="gap-4.5">
            <div class="grid grid-cols-2 gap-2.75 max-sm:grid-cols-1 max-sm:gap-4.5">
              <form.Field v-slot="{ field }" name="firstName">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name" class="text-sm font-medium">First name</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    placeholder="Alex"
                    autocomplete="given-name"
                    :class="authInput"
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
                  <FieldLabel :for="field.name" class="text-sm font-medium">Last name</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    placeholder="Smith"
                    autocomplete="family-name"
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

            <!-- Clients choose email or phone with a quiet link in the label row,
                 as on sign in; lawyers register with email, so they see no link.
                 Both fields stay mounted (v-show) so each mounts once. -->
            <div v-show="authMethod === 'email'">
              <form.Field v-slot="{ field }" name="email">
                <Field :data-invalid="isInvalid(field)">
                  <div class="flex w-full items-baseline justify-between gap-4 text-sm">
                    <FieldLabel :for="field.name" class="w-auto font-medium">Email address</FieldLabel>
                    <button v-if="canUsePhone" type="button" :class="authLink" :disabled="isSubmitting" @click="authMethod = 'phone'">
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

            <div v-show="authMethod === 'phone'">
              <form.Field v-slot="{ field }" name="phone">
                <Field :data-invalid="isInvalid(field)">
                  <div class="flex w-full items-baseline justify-between gap-4 text-sm">
                    <span class="font-medium">Phone number</span>
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

            <form.Field v-slot="{ field }" name="password">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" class="text-sm font-medium">Password</FieldLabel>
                <AuthPasswordInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(v as any)"
                />
                <!-- only when empty: with something typed, the list below shows what is missing -->
                <FieldError v-if="isInvalid(field) && !field.state.value" :errors="field.state.meta.errors" />
                <AuthPasswordRequirements :password="field.state.value" :invalid="isInvalid(field)" />
              </Field>
            </form.Field>

            <AuthFormError :message="apiError" />

            <AuthSubmit :loading="isSubmitting" class="mt-1.25">
              {{
                isSubmitting
                  ? (authMethod === 'phone' ? 'Sending code…' : 'Creating account…')
                  : authMethod === 'phone'
                    ? 'Send verification code'
                    : selectedRole === 'lawyer'
                      ? 'Apply as a lawyer'
                      : 'Create account'
              }}
            </AuthSubmit>
          </FieldGroup>
        </form>

        <template #after>
          <p class="text-sm">
            By continuing, you agree to our
            <NuxtLink to="/terms" class="font-medium text-foreground underline underline-offset-3 hover:text-brand">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/privacy" class="font-medium text-foreground underline underline-offset-3 hover:text-brand">Privacy Policy</NuxtLink>.
          </p>
          <p class="mt-3.5">
            Already have an account? <NuxtLink to="/login" :class="authLink">Sign in</NuxtLink>
          </p>
        </template>
      </AuthFormShell>

      <!-- Step 3: confirm the phone number with a code -->
      <AuthFormShell v-else key="verify" title="Verify your phone">
        <template #back>
          <button type="button" :class="authBack" @click="step = 'form'">← Back</button>
        </template>
        <template #description>
          Enter the code sent to <b class="text-foreground">{{ pendingPhone }}</b>.
        </template>

        <div class="grid gap-4.5">
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
          <AuthSubmit
            type="button"
            :loading="isSubmitting"
            :disabled="phoneOtp.length < 6"
            @click="completePhoneRegistration"
          >
            Create account
          </AuthSubmit>
        </div>
      </AuthFormShell>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { codeErrorMessage } from '~/lib/code-errors'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { authPasswordSchema } from '~/lib/auth-password'
import { authClient } from '~/lib/auth-client'
import { isValidNgPhone } from '~/lib/phone'
import { APPLICATION_HOME, WELCOME_HOME } from '~/lib/setup-paths'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

useHead({ title: 'Create an account' })

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

// Tell the layout's brand panel who is signing up, so it can speak to them.
// Client-side only: on the server the panel reads `?role=` from the address.
const panelRole = useState<'client' | 'lawyer' | null>('auth-panel-role', () => null)
onMounted(() => {
  panelRole.value = selectedRole.value ?? null
})
watch(selectedRole, (role) => {
  panelRole.value = role ?? null
})
onUnmounted(() => {
  panelRole.value = null
})

// Lawyers register with email only — their onboarding is email/NIN-gated.
// Clients keep the phone-or-email choice.
const canUsePhone = computed(() => selectedRole.value === 'client')
watch(selectedRole, (role) => {
  if (role !== 'client')
    authMethod.value = 'email'
})

const pendingPhone = ref('')
const pendingPassword = ref('')
const pendingName = ref('')
const phoneOtp = ref('')
const otpError = ref('')
const otpBlocked = ref(false)
/** True once the code has been accepted. The account exists from then on, so a retry must not check the (now used) code again. */
const phoneVerified = ref(false)
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
    'grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 rounded-card border p-4 text-left leading-normal transition-colors duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-mint',
    selectedRole.value === value
      ? 'border-brand bg-mint text-deep'
      : 'border-border bg-card hover:border-brand',
  )
}
const roleIcon = 'grid size-11.5 place-items-center rounded-md bg-background text-deep'
function roleDot(on: boolean) {
  return on
    ? 'size-5.5 rounded-full border-[0.42rem] border-primary bg-white'
    : 'size-5.5 rounded-full border-2 border-border'
}
const roleHint = computed(() => {
  if (selectedRole.value === 'client') return 'You can sign up with Google, email or your phone number.'
  if (selectedRole.value === 'lawyer') return 'Lawyers sign up with an email address.'
  return 'Choose one to continue.'
})

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
    onChange: registerSchema,
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
      const fullName = `${value.firstName} ${value.lastName}`.trim()

      if (authMethod.value === 'email') {
        // `accountType` is read by the backend's sign-up hook: the account's type
        // itself is read-only. Better Auth's typed body does not list it, so the
        // request is built first (an object literal passed inline would be refused).
        const signUpBody = {
          name: fullName,
          email: value.email,
          password: value.password,
          accountType: selectedRole.value || 'client',
          callbackURL: selectedRole.value === 'lawyer' ? APPLICATION_HOME : WELCOME_HOME,
        }
        const { error: signUpError } = await authClient.signUp.email(signUpBody)

        if (signUpError) {
          apiError.value = signUpError.message || 'Failed to create account. Please try again.'
          return
        }

        await refetchSession()
        await navigateTo(selectedRole.value === 'lawyer' ? APPLICATION_HOME : WELCOME_HOME)
        return
      }

      pendingPhone.value = value.phone
      phoneVerified.value = false
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

const { isInvalid } = useAuthFieldInvalid(form)

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
    // Two requests: the code (which creates the account and signs in), then the
    // password. If the second one failed, the code is spent but the account is
    // there, so pressing the button again only repeats the password step.
    if (!phoneVerified.value) {
      const { error: verifyError } = await verifyPhoneAndRegister({
        phone: pendingPhone.value,
        code: phoneOtp.value,
        name: pendingName.value,
        accountType: selectedRole.value || 'client',
      })

      if (verifyError) {
        if (isTooManyAttemptsError(verifyError)) {
          otpBlocked.value = true
        } else {
          otpError.value = codeErrorMessage(verifyError, 'That code is not right. Check it and try again.')
        }
        return
      }
      phoneVerified.value = true
    }

    const { error: pwdError } = await completePhoneRegistrationPassword({
      phone: pendingPhone.value,
      code: phoneOtp.value,
      password: pendingPassword.value,
      name: pendingName.value,
    })

    if (pwdError) {
      apiError.value = `Your phone number is confirmed, but your password was not saved (${pwdError.message || 'something went wrong'}). Press the button again to retry.`
      return
    }

    await refetchSession()
    await navigateTo(selectedRole.value === 'lawyer' ? APPLICATION_HOME : WELCOME_HOME)
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
