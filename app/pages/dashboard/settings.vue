<template>
  <div class="grid grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <section v-if="!isClient && !isLawyer" class="rounded-card border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center text-muted-foreground">
      Settings are not available for this kind of account.
    </section>

    <template v-else>
      <DashboardPageHeader eyebrow="Account" title="Settings" :description="pageDescription">
        <template #actions>
          <span class="rounded-full px-3.5 py-1.25 text-sm font-medium" :class="signInStatus.done ? 'bg-mint text-deep' : 'bg-muted text-foreground'">
            {{ signInStatus.label }}
          </span>
        </template>
      </DashboardPageHeader>

      <SettingsShell :active-section="activeSection" :role="role" @update:active-section="setSection">
        <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-5 xl:gap-6">
          <div class="grid min-w-0 gap-4 lg:gap-5 xl:gap-6">
            <SettingsLegalInterestsSection v-if="isClient && activeSection === 'legal-interests'" />
            <SettingsAccountSecuritySection v-else-if="activeSection === 'account-security'" />
            <SettingsHelpSection v-else-if="activeSection === 'help'" />
          </div>
          <SettingsElsewhere v-if="role" :role="role" />
        </div>
      </SettingsShell>
    </template>
  </div>
</template>

<script setup lang="ts">
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import SettingsElsewhere from '@/components/settings/SettingsElsewhere.vue'
import SettingsShell from '@/components/settings/SettingsShell.vue'
import SettingsAccountSecuritySection from '@/components/settings/sections/SettingsAccountSecuritySection.vue'
import SettingsHelpSection from '@/components/settings/sections/SettingsHelpSection.vue'
import SettingsLegalInterestsSection from '@/components/settings/sections/SettingsLegalInterestsSection.vue'
import {
  getDefaultSettingsSection,
  isSettingsSectionId,
} from '@/components/settings/settings-nav'
import type { SettingsSectionId } from '~/types/account-settings'

/**
 * Account settings: sign-in details and help for everyone, plus legal
 * interests for a client. The chosen section lives in the address
 * (`?section=`). Laid out as the other dashboard pages are: the shared
 * header, full width, and beside the section on a wide screen, links to the
 * account's other pages.
 */
useHead({ title: 'Settings' })
useSeoMeta({ description: 'Your sign-in details and support.' })

definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
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
    ? 'How you sign in, and how to reach us.'
    : 'What you need help with, how you sign in, and how to reach us.',
)

/** At a glance, beside the title: is everything you sign in with confirmed? */
const signInStatus = computed(() => {
  const user = session.value?.user as { email?: string | null, emailVerified?: boolean, phoneNumberVerified?: boolean } | undefined
  const emailDone = Boolean(user?.email && user.emailVerified)
  const phoneDone = Boolean(user?.phoneNumberVerified)
  if (emailDone && phoneDone) return { done: true, label: 'Email and phone confirmed' }
  if (emailDone) return { done: true, label: 'Email confirmed' }
  if (phoneDone) return { done: false, label: 'Add an email' }
  return { done: false, label: 'Confirm your email' }
})

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
