<template>
  <section class="overflow-hidden rounded-card border border-border bg-card">
    <header class="border-b border-border px-4.5 py-4.5 lg:px-5.75 xl:px-6">
      <h2 class="font-display text-lg font-normal tracking-tight">Sign-in details</h2>
      <p class="mt-0.75 text-sm text-muted-foreground">How you sign in, and where we send notices about your account.</p>
    </header>

    <div class="divide-y divide-border">
      <!-- Email: add one (phone sign-ups), confirm it, or see it confirmed -->
      <SettingsRow
        label="Email address"
        :hint="needsLinkEmail ? 'For notices and to recover your account.' : 'You sign in with it.'"
      >
        <template v-if="needsLinkEmail">
          <span class="text-muted-foreground">None yet</span>
        </template>
        <template v-else>
          <span class="min-w-0 truncate">{{ session?.user?.email }}</span>
          <span :class="needsVerifyEmail ? pending : confirmed">{{ needsVerifyEmail ? 'Not confirmed' : 'Confirmed' }}</span>
        </template>
        <template v-if="needsLinkEmail || needsVerifyEmail" #action>
          <Button type="button" variant="canopy" size="pill-sm" @click="openDialog">{{ needsLinkEmail ? 'Add an email' : 'Confirm it' }}</Button>
        </template>
      </SettingsRow>

      <!-- Phone: confirmed with a code sent by text -->
      <SettingsRow label="Mobile number" hint="To sign in with it and get texts about bookings.">
        <template v-if="phoneVerified">
          <span class="tabular-nums">{{ phoneForm.state.values.phone }}</span>
          <span :class="confirmed">Confirmed</span>
        </template>
        <span v-else class="text-muted-foreground">{{ addingPhone ? 'We text a 6-digit code to it.' : 'Not added' }}</span>
        <template v-if="!phoneVerified && !addingPhone" #action>
          <Button type="button" variant="line" size="pill-sm" @click="addingPhone = true">Add a number</Button>
        </template>
        <template v-if="!phoneVerified && addingPhone" #more>
          <form novalidate class="flex flex-col gap-3 sm:flex-row sm:items-start" @submit.prevent="phoneForm.handleSubmit">
            <phoneForm.Field v-slot="{ field }" name="phone">
              <Field :class="[canopyField, 'min-w-0 flex-1']" :data-invalid="isInvalid(field)">
                <AuthPhoneInput
                  label=""
                  :model-value="field.state.value"
                  :invalid="isInvalid(field)"
                  :disabled="isSendingOtp"
                  @blur="field.handleBlur"
                  @update:model-value="(v: string) => field.handleChange(v ?? '')"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </phoneForm.Field>
            <div class="flex flex-none gap-2">
              <Button type="submit" variant="canopy" size="pill" :disabled="isSendingOtp" :aria-busy="isSendingOtp">
                {{ isSendingOtp ? 'Sending…' : otpSent ? 'Send a new code' : 'Send a code' }}
              </Button>
              <Button type="button" variant="line" size="pill" :disabled="isSendingOtp || isVerifying" @click="cancelPhone">Cancel</Button>
            </div>
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
      </SettingsRow>

      <SettingsRow label="Password" hint="You need your current one to choose a new one.">
        <span class="tracking-widest text-muted-foreground" aria-label="Set">••••••••</span>
        <template #action>
          <Button type="button" variant="line" size="pill-sm" @click="changePasswordOpen = true">Change password</Button>
        </template>
      </SettingsRow>
    </div>

    <SettingsChangePasswordDialog v-model="changePasswordOpen" />
  </section>
</template>

<script setup lang="ts">
import { codeErrorMessage } from '~/lib/code-errors'
import { useForm } from '@tanstack/vue-form'
import SettingsChangePasswordDialog from '@/components/settings/SettingsChangePasswordDialog.vue'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { phoneToVerifySchema } from '~/lib/client-profile-forms'

/**
 * Sign-in details as one panel of rows, as on the other dashboard pages: the
 * email (add it, confirm it, or see it confirmed), the phone number (confirmed
 * with a code sent by text), and the password. The
 * phone number is a TanStack form; sending it asks for a code, and typing the
 * six digits confirms it.
 */
const { session, refetchSession } = useAuth()
const { sendPhoneOtp, verifyPhoneOtp, isTooManyAttemptsError } = usePhoneAuth()
const { needsLinkEmail, needsVerifyEmail } = useEmailVerificationPrompt()
const { openDialog } = useEmailVerificationDialog()

const changePasswordOpen = ref(false)
/** The phone form opens on asking, not as an empty field on every visit. */
const addingPhone = ref(false)

const confirmed = 'rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-deep'
const pending = 'rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground'

function cancelPhone() {
  addingPhone.value = false
  otpSent.value = false
  otpCode.value = ''
  otpError.value = ''
  linkError.value = ''
}

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
      else otpError.value = codeErrorMessage(error, 'That code is not right. Check it and try again.')
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
