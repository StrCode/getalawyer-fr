<template>
  <div class="space-y-6">
    <SettingsSectionCard
      title="Password & authentication"
      description="Manage your password and two-factor authentication."
    >
      <div class="space-y-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-foreground">
              Change password
            </p>
            <p class="text-xs text-muted-foreground">
              Last changed 45 days ago
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            @click="showPasswordForm = !showPasswordForm"
          >
            {{ showPasswordForm ? 'Cancel' : 'Change password' }}
          </Button>
        </div>

        <div
          v-if="showPasswordForm"
          class="grid max-w-md gap-3"
        >
          <Input
            v-model="password.current"
            type="password"
            placeholder="Current password"
          />
          <Input
            v-model="password.new"
            type="password"
            placeholder="New password"
          />
          <Input
            v-model="password.confirm"
            type="password"
            placeholder="Confirm new password"
          />
          <Button
            type="button"
            size="sm"
            class="w-fit"
          >
            Update password
          </Button>
        </div>

        <Separator />

        <ProfileSettingsRow
          title="Two-factor authentication"
          description="Add an extra layer of protection via SMS or authenticator app."
        >
          <RadioGroup
            v-model="draft.twoFactorMethod"
            class="grid gap-3"
          >
            <label
              v-for="opt in twoFactorOptions"
              :key="opt.value"
              class="flex cursor-pointer items-center gap-3 rounded-lg border border-border/80 px-4 py-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem :value="opt.value" />
              <span class="text-sm">{{ opt.label }}</span>
            </label>
          </RadioGroup>
        </ProfileSettingsRow>
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Active sessions"
      description="Devices where you're currently signed in."
    >
      <ul class="divide-y divide-border/80">
        <li
          v-for="session in sessions"
          :key="session.id"
          class="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
        >
          <div>
            <p class="text-sm font-medium text-foreground">
              {{ session.device }}
              <Badge
                v-if="session.current"
                variant="secondary"
                class="ml-2 font-normal"
              >
                Current
              </Badge>
            </p>
            <p class="text-xs text-muted-foreground">
              {{ session.location }} · {{ session.lastActive }}
            </p>
          </div>
          <Button
            v-if="!session.current"
            type="button"
            variant="ghost"
            size="sm"
          >
            Sign out
          </Button>
        </li>
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        class="mt-4"
      >
        Sign out of all other sessions
      </Button>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Visibility & privacy"
      description="Control what lawyers see and how you appear on the platform."
    >
      <div class="divide-y divide-border/80">
        <SettingsToggleRow
          v-model="draft.profileVisibleToLawyers"
          label="Profile visible to lawyers"
          description="Allow matched lawyers to view your profile summary"
        />
        <SettingsToggleRow
          v-model="draft.hideContactFromLawyers"
          label="Hide contact details from lawyers"
          description="Lawyers can only reach you via in-app messaging"
        />
        <SettingsToggleRow
          v-model="draft.anonymousConsultation"
          label="Anonymous consultation mode"
          description="Hide your name until you choose to reveal it"
        />
        <SettingsToggleRow
          v-model="draft.dataUseConsent"
          label="Data use consent"
          description="Allow anonymised data to improve matching and product quality"
        />
        <SettingsToggleRow
          v-model="draft.loginAlerts"
          label="Login alerts"
          description="Email me when a new device signs in"
        />
      </div>
    </SettingsSectionCard>
  </div>
</template>

<script setup lang="ts">
import ProfileSettingsRow from '@/components/dashboard/ProfileSettingsRow.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import SettingsToggleRow from '@/components/settings/SettingsToggleRow.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import type { AccountSettingsDraft } from '~/types/account-settings'

const draft = defineModel<AccountSettingsDraft['privacy']>('draft', { required: true })

const showPasswordForm = ref(false)
const password = reactive({ current: '', new: '', confirm: '' })

const twoFactorOptions = [
  { value: 'none', label: 'Off' },
  { value: 'sms', label: 'SMS' },
  { value: 'authenticator', label: 'Authenticator app' },
] as const

const sessions = [
  { id: '1', device: 'MacBook Pro · Chrome', location: 'Lagos, NG', lastActive: 'Active now', current: true },
  { id: '2', device: 'iPhone 15 · Safari', location: 'Lagos, NG', lastActive: '2 days ago', current: false },
]
</script>
