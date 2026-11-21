<template>
  <div class="grid grid-cols-1 gap-4 lg:gap-5 xl:gap-6">
    <SettingsSectionCard
      v-if="needsLinkEmail"
      title="Email address"
      description="Add an email to get notices about your bookings and to recover your account."
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-muted-foreground">You sign in with your phone. An email lets you get notices and recover your account.</p>
        <Button type="button" variant="canopy" size="pill-sm" @click="openDialog">Add an email</Button>
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard
      v-else-if="needsVerifyEmail"
      title="Email address"
      description="Confirm your email to get notices about your bookings and your account."
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate font-medium">{{ session?.user?.email }}</p>
          <p class="mt-0.5 text-sm text-muted-foreground">Not confirmed yet</p>
        </div>
        <Button type="button" variant="canopy" size="pill-sm" @click="openDialog">Confirm your email</Button>
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard
      v-else
      title="Email address"
      description="You sign in with it, and notices about your account go to it."
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="min-w-0 truncate font-medium">{{ session?.user?.email }}</p>
        <span class="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-deep">Confirmed</span>
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Phone number"
      description="Confirm your mobile number to sign in with it and get text messages about your bookings."
    >
      <div v-if="phoneVerified" class="flex flex-wrap items-center justify-between gap-3">
        <p class="min-w-0 font-medium tabular-nums">{{ phoneForm.state.values.phone }}</p>
        <span class="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-deep">Confirmed</span>
      </div>

      <template v-else>
        <form novalidate class="flex flex-col gap-3 sm:flex-row sm:items-start" @submit.prevent="phoneForm.handleSubmit">
          <phoneForm.Field v-slot="{ field }" name="phone">
            <Field :class="[canopyField, 'min-w-0 flex-1']" :data-invalid="isInvalid(field)">
              <AuthPhoneInput
                label="Mobile number"
                :model-value="field.state.value"
                :invalid="isInvalid(field)"
                :disabled="isSendingOtp"
                @blur="field.handleBlur"
                @update:model-value="(v: string) => field.handleChange(v ?? '')"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </phoneForm.Field>
          <Button type="submit" variant="line" size="pill" class="flex-none sm:mt-7.5" :disabled="isSendingOtp" :aria-busy="isSendingOtp">
            {{ isSendingOtp ? 'Sending…' : otpSent ? 'Send a new code' : 'Send a code' }}
          </Button>
        </form>

        <div v-if="otpSent" class="mt-4 grid gap-3.25">
          <AuthOtpStep
            v-model="otpCode"
            :error="otpError"
            :blocked="otpBlocked"
            :is-submitting="isVerifying"
            :is-resending="isSendingOtp"
            @resend="sendCode"
            @request-new-code="sendCode"
          />
          <AuthDevOtpHint />
        </div>
        <p v-if="linkError" role="alert" class="mt-2.75 text-sm font-medium text-destructive">{{ linkError }}</p>
      </template>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Password"
      description="You need your current password to choose a new one."
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-muted-foreground">Choose a new password at any time.</p>
        <Button type="button" variant="line" size="pill-sm" @click="changePasswordOpen = true">Change password</Button>
      </div>
    </SettingsSectionCard>

    <SettingsChangePasswordDialog v-model="changePasswordOpen" />
  </div>
</template>

<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import SettingsChangePasswordDialog from '@/components/settings/SettingsChangePasswordDialog.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { phoneToVerifySchema } from '~/lib/client-profile-forms'

/**
 * Sign-in details: the email (add it, confirm it, or see it confirmed), the
 * phone number (confirmed with a code sent by text), and the password. The
 * phone number is a TanStack form; sending it asks for a code, and typing the
 * six digits confirms it.
 */
const { session, refetchSession } = useAuth()
const { sendPhoneOtp, verifyPhoneOtp, isTooManyAttemptsError } = usePhoneAuth()
const { needsLinkEmail, needsVerifyEmail } = useEmailVerificationPrompt()
const { openDialog } = useEmailVerificationDialog()

const changePasswordOpen = ref(false)

const otpSent = ref(false)
const otpCode = ref('')
const otpError = ref('')
const otpBlocked = ref(false)
const linkError = ref('')
const isSendingOtp = ref(false)
const isVerifying = ref(false)

const phoneVerified = computed(() => {
  const user = session.value?.user as { phoneNumberVerified?: boolean } | undefined
  return Boolean(user?.phoneNumberVerified)
})

const phoneForm = useForm({
  defaultValues: { phone: '' },
  validators: {
    onChange: phoneToVerifySchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: () => sendCode(),
})

const { isInvalid } = useAuthFieldInvalid(phoneForm)

async function sendCode() {
  linkError.value = ''
  otpError.value = ''
  otpBlocked.value = false
  isSendingOtp.value = true
  try {
    const { error } = await sendPhoneOtp(phoneForm.state.values.phone)
    if (error) {
      linkError.value = error.message || 'We could not send a code. Try again.'
      return
    }
    otpSent.value = true
  }
  finally {
    isSendingOtp.value = false
  }
}

async function verifyOtp() {
  if (otpCode.value.length < 6) return
  isVerifying.value = true
  otpError.value = ''
  linkError.value = ''
  try {
    const { error } = await verifyPhoneOtp({
      phone: phoneForm.state.values.phone,
      code: otpCode.value,
      updatePhoneNumber: true,
    })
    if (error) {
      if (isTooManyAttemptsError(error)) otpBlocked.value = true
      else otpError.value = error.message || 'That code is not right.'
      return
    }
    await refetchSession()
  }
  finally {
    isVerifying.value = false
  }
}

watch(otpCode, (code) => {
  if (code.length === 6 && otpSent.value && !phoneVerified.value) void verifyOtp()
})

onMounted(() => {
  const user = session.value?.user as { phoneNumber?: string } | undefined
  if (user?.phoneNumber) phoneForm.reset({ phone: user.phoneNumber })
})
</script>
