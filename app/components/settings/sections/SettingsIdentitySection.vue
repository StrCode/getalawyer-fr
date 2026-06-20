<template>
  <div class="space-y-6">
    <SettingsSectionCard
      v-if="needsRealEmail"
      title="Email address"
      description="Link a real email to receive notifications and recover your account."
    >
      <p class="mb-4 text-sm text-muted-foreground">
        Your account uses a phone-based email placeholder. Add your real email below.
      </p>
      <Button as-child variant="outline" class="cursor-pointer">
        <NuxtLink to="/onboarding/link-email">Link email address</NuxtLink>
      </Button>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Verification status"
      description="Lawyers may require verified identity before sensitive consultations."
    >
      <div class="grid gap-3 sm:grid-cols-3">
        <div
          v-for="item in statusItems"
          :key="item.key"
          class="rounded-lg border border-border/80 p-4"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-medium text-foreground">
              {{ item.label }}
            </p>
            <Badge :variant="badgeVariant(item.status)">
              {{ statusLabel(item.status) }}
            </Badge>
          </div>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ item.hint }}
          </p>
        </div>
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Government-issued ID"
      description="NIN slip, international passport, or driver's licence."
    >
      <SettingsUploadField
        label="Upload ID document"
        accept=".pdf,.jpg,.jpeg,.png"
        :file-name="idFileName"
        @select="onIdSelect"
      />
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Proof of address"
      description="Utility bill or bank statement dated within the last 3 months."
    >
      <SettingsUploadField
        label="Upload proof of address"
        accept=".pdf,.jpg,.jpeg,.png"
        :file-name="addressFileName"
        @select="onAddressSelect"
      />
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Phone verification"
      description="We'll send a one-time code to confirm your number."
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
          class="shrink-0 cursor-pointer"
          :disabled="isSendingOtp"
          @click="handleSendOtp"
        >
          {{ isSendingOtp ? 'Sending…' : 'Send OTP' }}
        </Button>
        <Badge
          v-else
          variant="secondary"
          class="shrink-0"
        >
          <PhCheckCircle class="mr-1 size-3.5" />
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
        <p v-if="linkError" class="text-sm text-destructive">{{ linkError }}</p>
      </div>
    </SettingsSectionCard>
  </div>
</template>

<script setup lang="ts">
import { PhCheckCircle } from '@phosphor-icons/vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import SettingsUploadField from '@/components/settings/SettingsUploadField.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { isTempPhoneEmail } from '~/lib/auth-constants'
import type { AccountSettingsDraft, VerificationStatus } from '~/types/account-settings'

const draft = defineModel<AccountSettingsDraft['identity']>('draft', { required: true })

const { session, refetchSession } = useAuth()
const { sendPhoneOtp, verifyPhoneOtp, isTooManyAttemptsError } = usePhoneAuth()

const needsRealEmail = computed(() => isTempPhoneEmail(session.value?.user?.email))

const idFileName = ref('')
const addressFileName = ref('')
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
  return Boolean(user?.phoneNumberVerified) || draft.value.phoneVerified
})

const statusItems = computed(() => [
  {
    key: 'id',
    label: 'Government ID',
    status: draft.value.idDocumentStatus,
    hint: 'Passport, NIN, or licence',
  },
  {
    key: 'address',
    label: 'Proof of address',
    status: draft.value.addressProofStatus,
    hint: 'Utility bill or statement',
  },
  {
    key: 'phone',
    label: 'Phone OTP',
    status: phoneVerified.value ? 'verified' as VerificationStatus : 'not_submitted',
    hint: 'SMS verification',
  },
])

function statusLabel(status: VerificationStatus) {
  if (status === 'verified') return 'Verified'
  if (status === 'pending') return 'Pending'
  return 'Not submitted'
}

function onIdSelect(name: string) {
  idFileName.value = name
  if (name)
    draft.value.idDocumentStatus = 'pending'
}

function onAddressSelect(name: string) {
  addressFileName.value = name
  if (name)
    draft.value.addressProofStatus = 'pending'
}

function badgeVariant(status: VerificationStatus): 'default' | 'secondary' | 'outline' {
  if (status === 'verified') return 'default'
  if (status === 'pending') return 'secondary'
  return 'outline'
}

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
    draft.value.phoneVerified = true
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
