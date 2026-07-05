<template>
  <div class="space-y-6">
    <SettingsSectionCard
      v-if="needsLinkEmail"
      title="Email address"
      description="Link a real email to receive notifications and recover your account."
    >
      <p class="mb-4 text-sm text-muted-foreground">
        Your account uses a phone-based sign-in. Add your email from the dashboard.
      </p>
      <Button
        as-child
        variant="outline"
        size="sm"
      >
        <NuxtLink to="/dashboard/verify-email">
          Link email address
        </NuxtLink>
      </Button>
    </SettingsSectionCard>

    <SettingsSectionCard
      v-else-if="needsVerifyEmail"
      title="Email verification"
      description="Confirm your email to receive booking and security notifications."
    >
      <p class="mb-4 text-sm text-muted-foreground">
        {{ session?.user?.email }}
      </p>
      <Button
        as-child
        variant="outline"
        size="sm"
      >
        <NuxtLink to="/dashboard/verify-email">
          Verify email
        </NuxtLink>
      </Button>
    </SettingsSectionCard>

    <SettingsSectionCard
      v-else
      title="Email address"
      description="Used for sign-in and account notifications."
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-foreground">
          {{ session?.user?.email }}
        </p>
        <Badge variant="secondary" class="font-normal">
          <AppIcon :icon="appIcons.checkCircle" class="mr-1 size-3.5" />
          Verified
        </Badge>
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Phone verification"
      description="Verify your mobile number for sign-in and SMS notifications."
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div class="min-w-0 flex-1">
          <AuthPhoneInput
            v-model="phone"
            :disabled="phoneVerified"
          />
        </div>
        <Button
          v-if="!phoneVerified"
          type="button"
          variant="outline"
          size="sm"
          class="shrink-0"
          :disabled="isSendingOtp"
          @click="handleSendOtp"
        >
          {{ isSendingOtp ? 'Sending…' : 'Send code' }}
        </Button>
        <Badge
          v-else
          variant="secondary"
          class="shrink-0"
        >
          <AppIcon :icon="appIcons.checkCircle" class="mr-1 size-3.5" />
          Verified
        </Badge>
      </div>

      <div
        v-if="otpSent && !phoneVerified"
        class="mt-4 space-y-4"
      >
        <AuthOtpStep
          v-model="otpCode"
          :error="otpError"
          :blocked="otpBlocked"
          :is-submitting="isVerifying"
          :is-resending="isSendingOtp"
          @resend="handleSendOtp"
          @request-new-code="handleSendOtp"
        />
        <AuthDevOtpHint />
        <p
          v-if="linkError"
          class="text-sm text-destructive"
        >
          {{ linkError }}
        </p>
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Password"
      description="Reset your password via email or phone verification."
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-sm text-muted-foreground">
          Use the secure reset flow if you need to change your password.
        </p>
        <Button
          as-child
          variant="outline"
          size="sm"
        >
          <NuxtLink to="/forgot-password">
            Reset password
          </NuxtLink>
        </Button>
      </div>
    </SettingsSectionCard>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const { session, refetchSession } = useAuth()
const { sendPhoneOtp, verifyPhoneOtp, isTooManyAttemptsError } = usePhoneAuth()
const { needsLinkEmail, needsVerifyEmail } = useEmailVerificationPrompt()

const phone = ref('')
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

async function handleSendOtp() {
  linkError.value = ''
  otpError.value = ''
  otpBlocked.value = false
  isSendingOtp.value = true
  try {
    const { error } = await sendPhoneOtp(phone.value)
    if (error) {
      linkError.value = error.message || 'Failed to send code'
      return
    }
    otpSent.value = true
  } finally {
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
      phone: phone.value,
      code: otpCode.value,
      updatePhoneNumber: true,
    })
    if (error) {
      if (isTooManyAttemptsError(error)) {
        otpBlocked.value = true
      } else {
        otpError.value = error.message || 'Invalid code'
      }
      return
    }
    await refetchSession()
  } finally {
    isVerifying.value = false
  }
}

watch(otpCode, (v) => {
  if (v.length === 6 && otpSent.value && !phoneVerified.value) {
    verifyOtp()
  }
})

onMounted(() => {
  const user = session.value?.user as { phoneNumber?: string } | undefined
  if (user?.phoneNumber) {
    phone.value = user.phoneNumber
  }
})
</script>
