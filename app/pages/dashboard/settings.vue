<template>
  <div class="mx-auto w-full max-w-5xl space-y-6">
    <template v-if="isLawyer">
      <DashboardPageHeader
        title="Settings"
        description="Practice setup, billing, and account security."
      />

      <LawyerSettingsHub />
      <SettingsAccountSecuritySection />
      <SettingsHelpSection />
    </template>

    <Card
      v-else-if="!isClient"
      class="border-dashed"
    >
      <CardContent class="py-12 text-center text-sm text-muted-foreground">
        Settings are not available for this account type.
      </CardContent>
    </Card>

    <template v-else>
      <DashboardPageHeader
        title="Account settings"
        description="Legal interests, security, and help."
      />

      <SettingsShell
        :active-section="activeSection"
        @update:active-section="setSection"
      >
        <SettingsLegalInterestsSection
          v-if="activeSection === 'legal-interests'"
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
import LawyerSettingsHub from '@/components/settings/LawyerSettingsHub.vue'
import { isSettingsSectionId } from '@/components/settings/settings-nav'
import { Card, CardContent } from '@/components/ui/card'
import type { SettingsSectionId } from '~/types/account-settings'

useHead({
  title: 'Settings - GetALawyer',
  meta: [
    { name: 'description', content: 'Legal interests, account security, and support' },
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

const activeSection = computed<SettingsSectionId>(() => {
  const q = route.query.section
  if (typeof q === 'string' && isSettingsSectionId(q))
    return q
  return 'legal-interests'
})

watch(
  () => route.query.section,
  (section) => {
    if (section === 'profile' || section === 'legal-preferences') {
      navigateTo(
        section === 'profile'
          ? '/dashboard/profile'
          : { path: '/dashboard/settings', query: { section: 'legal-interests' } },
        { replace: true },
      )
    }
  },
  { immediate: true },
)

function setSection(id: SettingsSectionId | string) {
  const section = typeof id === 'string' && isSettingsSectionId(id) ? id : 'legal-interests'
  router.replace({ query: { ...route.query, section } })
}
</script>
