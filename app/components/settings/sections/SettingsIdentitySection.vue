<template>
  <div class="space-y-6">
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
        <div class="min-w-0 flex-1 space-y-2">
          <Label for="otp-phone">Phone number</Label>
          <Input
            id="otp-phone"
            v-model="phone"
            type="tel"
            placeholder="+2348012345678"
            :disabled="draft.phoneVerified"
          />
        </div>
        <Button
          v-if="!draft.phoneVerified"
          type="button"
          variant="outline"
          class="shrink-0"
          @click="otpSent = true"
        >
          Send OTP
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
        v-if="otpSent && !draft.phoneVerified"
        class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div class="flex-1 space-y-2">
          <Label for="otp-code">Verification code</Label>
          <Input
            id="otp-code"
            v-model="otpCode"
            inputmode="numeric"
            maxlength="6"
            placeholder="6-digit code"
          />
        </div>
        <Button
          type="button"
          :disabled="otpCode.length < 6"
          @click="draft.phoneVerified = true"
        >
          Verify
        </Button>
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AccountSettingsDraft, VerificationStatus } from '~/types/account-settings'

const draft = defineModel<AccountSettingsDraft['identity']>('draft', { required: true })

const idFileName = ref('')
const addressFileName = ref('')
const phone = ref('+2348012345678')
const otpSent = ref(false)
const otpCode = ref('')

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
    status: draft.value.phoneVerified ? 'verified' as VerificationStatus : 'not_submitted',
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
</script>
