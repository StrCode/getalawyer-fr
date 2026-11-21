<template>
  <div class="mx-auto grid w-full max-w-232 grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <section v-if="!isClient && !isLawyer" class="rounded-card border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center text-muted-foreground">
      Settings are not available for this kind of account.
    </section>

    <template v-else>
      <header>
        <p class="text-xs font-medium tracking-widest text-brand uppercase">Account</p>
        <h1 class="mt-2.5 text-2xl md:text-3xl leading-none font-normal tracking-tighter">Settings</h1>
        <p class="mt-2.5 max-w-168 text-base text-muted-foreground">{{ pageDescription }}</p>
      </header>

      <SettingsShell :active-section="activeSection" :role="role" @update:active-section="setSection">
        <SettingsLegalInterestsSection v-if="isClient && activeSection === 'legal-interests'" />
        <SettingsAccountSecuritySection v-else-if="activeSection === 'account-security'" />
        <SettingsHelpSection v-else-if="activeSection === 'help'" />
      </SettingsShell>
    </template>
  </div>
</template>

<script setup lang="ts">
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
 * (`?section=`). A lawyer's profile, practice tools and membership have their
 * own pages.
 */
useHead({ title: 'Settings' })
useSeoMeta({ description: 'Your sign-in details and support.', robots: 'noindex, nofollow' })

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
    ? 'Your email, phone and password, and how to reach us. Your profile, practice tools and membership have their own pages.'
    : 'What you need help with, your sign-in details, and how to reach us.',
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
