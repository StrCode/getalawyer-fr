<template>
  <SettingsSectionCard
    title="Notification preferences"
    description="Choose how and when you want to be notified. Toggle channels per notification type."
  >
    <div class="space-y-6">
      <SettingsNotificationChannels
        v-for="item in notificationItems"
        :key="item.key"
        :title="item.title"
        :description="item.description"
        :model-value="draft[item.key]"
        @update:model-value="(v) => (draft[item.key] = v)"
      />
    </div>
  </SettingsSectionCard>
</template>

<script setup lang="ts">
import SettingsNotificationChannels from '@/components/settings/SettingsNotificationChannels.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import type { AccountSettingsDraft } from '~/types/account-settings'

const draft = defineModel<AccountSettingsDraft['notifications']>('draft', { required: true })

const notificationItems = [
  {
    key: 'lawyerMatch' as const,
    title: 'New lawyer match',
    description: 'When we find lawyers that fit your preferences',
  },
  {
    key: 'messages' as const,
    title: 'Message received',
    description: 'New messages from your lawyer',
  },
  {
    key: 'consultationReminder' as const,
    title: 'Consultation reminder',
    description: 'e.g. 30 minutes before your appointment',
  },
  {
    key: 'documents' as const,
    title: 'Document updated or shared',
    description: 'When a lawyer shares or updates a file',
  },
  {
    key: 'payments' as const,
    title: 'Payment receipt',
    description: 'Confirmations and receipts for bookings',
  },
  {
    key: 'announcements' as const,
    title: 'Platform tips & announcements',
    description: 'Product updates and legal tips',
  },
]
</script>
