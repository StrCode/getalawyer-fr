<template>
  <div class="space-y-6">
    <Card
      v-if="!isClient"
      class="border-dashed"
    >
      <CardContent class="py-12 text-center text-sm text-muted-foreground">
        Lawyer account settings are coming soon. Use
        <NuxtLink
          to="/dashboard/profile"
          class="font-medium text-primary underline-offset-4 hover:underline"
        >
          Profile
        </NuxtLink>
        for now.
      </CardContent>
    </Card>

    <template v-else>
      <AppPageHeader
        title="Account settings"
        :description="activeNavItem?.description ?? 'Manage your account'"
        sticky
      >
        <template #extra>
          <p class="text-sm text-muted-foreground">
            Personal details and photo are on
            <NuxtLink
              to="/dashboard/profile"
              class="font-medium text-primary underline-offset-4 hover:underline"
            >
              Profile
            </NuxtLink>.
          </p>
          <Select
            class="mt-3 lg:hidden"
            :model-value="activeSection"
            @update:model-value="setSection"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="item in SETTINGS_NAV"
                :key="item.id"
                :value="item.id"
              >
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </template>
        <template
          v-if="isDirty"
          #actions
        >
          <Badge
            variant="outline"
            class="hidden font-normal sm:inline-flex"
          >
            Unsaved changes
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            @click="resetDraft"
          >
            Discard
          </Button>
          <ButtonBusy
            size="sm"
            :loading="isSaving"
            @click="saveDraft"
          >
            Save changes
          </ButtonBusy>
        </template>
      </AppPageHeader>

      <SettingsShell
        :active-section="activeSection"
        @update:active-section="setSection"
      >
        <SettingsLegalPreferencesSection
          v-if="activeSection === 'legal-preferences'"
          v-model:draft="draft.legalPreferences"
        />
        <SettingsIdentitySection
          v-else-if="activeSection === 'identity'"
          v-model:draft="draft.identity"
        />
        <SettingsDocumentsSection
          v-else-if="activeSection === 'documents'"
        />
        <SettingsCaseHistorySection
          v-else-if="activeSection === 'case-history'"
        />
        <SettingsSavedLawyersSection
          v-else-if="activeSection === 'saved-lawyers'"
        />
        <SettingsNotificationsSection
          v-else-if="activeSection === 'notifications'"
          v-model:draft="draft.notifications"
        />
        <SettingsPrivacySection
          v-else-if="activeSection === 'privacy'"
          v-model:draft="draft.privacy"
        />
        <SettingsHelpSection
          v-else-if="activeSection === 'help'"
        />
      </SettingsShell>
    </template>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import ButtonBusy from '@/components/ButtonBusy.vue'
import SettingsShell from '@/components/settings/SettingsShell.vue'
import SettingsCaseHistorySection from '@/components/settings/sections/SettingsCaseHistorySection.vue'
import SettingsDocumentsSection from '@/components/settings/sections/SettingsDocumentsSection.vue'
import SettingsHelpSection from '@/components/settings/sections/SettingsHelpSection.vue'
import SettingsIdentitySection from '@/components/settings/sections/SettingsIdentitySection.vue'
import SettingsLegalPreferencesSection from '@/components/settings/sections/SettingsLegalPreferencesSection.vue'
import SettingsNotificationsSection from '@/components/settings/sections/SettingsNotificationsSection.vue'
import SettingsPrivacySection from '@/components/settings/sections/SettingsPrivacySection.vue'
import SettingsSavedLawyersSection from '@/components/settings/sections/SettingsSavedLawyersSection.vue'
import { SETTINGS_NAV, isSettingsSectionId } from '@/components/settings/settings-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDefaultAccountSettingsDraft } from '~/composables/useAccountSettingsDraft'
import type { SettingsSectionId } from '~/types/account-settings'

useHead({
  title: 'Account settings - GetALawyer',
  meta: [
    { name: 'description', content: 'Legal preferences, documents, privacy, and notifications' },
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

const draft = reactive(createDefaultAccountSettingsDraft())
const snapshot = ref(JSON.stringify(draft))
const isSaving = ref(false)

const activeSection = computed<SettingsSectionId>(() => {
  const q = route.query.section
  if (typeof q === 'string' && isSettingsSectionId(q))
    return q
  return 'legal-preferences'
})

const activeNavItem = computed(() => SETTINGS_NAV.find(n => n.id === activeSection.value))

const isDirty = computed(() => JSON.stringify(draft) !== snapshot.value)

onMounted(() => {
  snapshot.value = JSON.stringify(draft)
})

watch(
  () => route.query.section,
  (section) => {
    if (section === 'profile') {
      navigateTo('/dashboard/profile', { replace: true })
    }
  },
  { immediate: true },
)

function setSection(id: SettingsSectionId | string) {
  const section = typeof id === 'string' && isSettingsSectionId(id) ? id : 'legal-preferences'
  router.replace({ query: { ...route.query, section } })
}

function resetDraft() {
  const parsed = JSON.parse(snapshot.value) as ReturnType<typeof createDefaultAccountSettingsDraft>
  Object.assign(draft, parsed)
}

async function saveDraft() {
  isSaving.value = true
  try {
    await new Promise(r => setTimeout(r, 400))
    snapshot.value = JSON.stringify(draft)
    toast.success('Settings saved')
  } finally {
    isSaving.value = false
  }
}
</script>
