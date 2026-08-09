<template>
  <div class="space-y-6 md:space-y-8">
    <Card
      v-if="!isClient && !isLawyer"
      class="border-dashed"
    >
      <CardContent class="py-12 text-center text-sm text-muted-foreground">
        Settings are not available for this account type.
      </CardContent>
    </Card>

    <template v-else>
      <DashboardPageHeader
        eyebrow="Account"
        title="Settings"
        :description="pageDescription"
      />

      <SettingsShell
        :active-section="activeSection"
        :role="role"
        @update:active-section="setSection"
      >
        <SettingsLegalInterestsSection
          v-if="isClient && activeSection === 'legal-interests'"
        />
        <SettingsAccountSecuritySection
          v-else-if="activeSection === 'account-security'"
        />
        <SettingsHelpSection
          v-else-if="activeSection === 'help'"
        />
      </SettingsShell>
    </template>
  </div>
</template>

<script setup lang="ts">
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import SettingsShell from '@/components/settings/SettingsShell.vue'
import SettingsAccountSecuritySection from '@/components/settings/sections/SettingsAccountSecuritySection.vue'
import SettingsHelpSection from '@/components/settings/sections/SettingsHelpSection.vue'
import SettingsLegalInterestsSection from '@/components/settings/sections/SettingsLegalInterestsSection.vue'
import {
  getDefaultSettingsSection,
  isSettingsSectionId,
} from '@/components/settings/settings-nav'
import { Card, CardContent } from '@/components/ui/card'
import type { SettingsSectionId } from '~/types/account-settings'

useHead({
  title: 'Settings - GetALawyer',
  meta: [
    { name: 'description', content: 'Account security and support' },
  ],
})

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { session } = useAuth()

const isClient = computed(() => session.value?.user.userType === 'client')
const isLawyer = computed(() => session.value?.user.userType === 'lawyer')
const role = computed(() => {
  if (isLawyer.value) return 'lawyer' as const
  if (isClient.value) return 'client' as const
  return undefined
})

const pageDescription = computed(() =>
  isLawyer.value
    ? 'Email, phone, password, and support. Listing, bookings tools, and billing have their own pages.'
    : 'Legal interests, security, and help.',
)

const activeSection = computed<SettingsSectionId>(() => {
  const q = route.query.section
  if (typeof q === 'string' && isSettingsSectionId(q, role.value))
    return q
  return getDefaultSettingsSection(role.value)
})

watch(
  () => [route.query.section, role.value] as const,
  ([section, currentRole]) => {
    if (section === 'profile' || section === 'legal-preferences') {
      navigateTo(
        section === 'profile'
          ? '/dashboard/profile'
          : { path: '/dashboard/settings', query: { section: 'legal-interests' } },
        { replace: true },
      )
      return
    }

    // Lawyers landing on a client-only section (or stale ?section=legal-interests).
    if (
      currentRole === 'lawyer'
      && typeof section === 'string'
      && !isSettingsSectionId(section, 'lawyer')
    ) {
      navigateTo(
        { path: '/dashboard/settings', query: { section: 'account-security' } },
        { replace: true },
      )
    }
  },
  { immediate: true },
)

function setSection(id: SettingsSectionId | string) {
  const fallback = getDefaultSettingsSection(role.value)
  const section = typeof id === 'string' && isSettingsSectionId(id, role.value) ? id : fallback
  router.replace({ query: { ...route.query, section } })
}
</script>
