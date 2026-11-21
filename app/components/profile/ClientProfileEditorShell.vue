<script setup lang="ts">
import { toast } from 'vue-sonner'
import ClientProfileShell from '@/components/profile/ClientProfileShell.vue'
import ClientProfileCompletenessAside from '@/components/profile/ClientProfileCompletenessAside.vue'
import ClientAboutForm from '@/components/profile/client/ClientAboutForm.vue'
import ClientContactForm from '@/components/profile/client/ClientContactForm.vue'
import ClientLocationForm from '@/components/profile/client/ClientLocationForm.vue'
import ClientPersonalForm from '@/components/profile/client/ClientPersonalForm.vue'
import ProfilePhotoSection from '@/components/profile/sections/ProfilePhotoSection.vue'
import { CLIENT_PROFILE_SECTIONS } from '@/components/profile/client-profile-nav'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import { Button } from '@/components/ui/button'
import { PANEL, PANEL_TITLE } from '@/lib/dashboard-panel'
import { useClientProfile } from '~/composables/useClientProfile'
import { ApiError } from '~/lib/api/client'
import { NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'

/**
 * A client's profile: photo, details, where they are, what they need help
 * with, and a phone number. Each part is its own small form with its own
 * Save, built on TanStack Form like every other form in the dashboard.
 */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

type FormId = 'personal' | 'location' | 'about' | 'contact'

const { useProfile, useUpdateProfile, useUploadAvatar } = useClientProfile()

const { data: profile, isLoading, isError, refetch } = useProfile()
const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile()
const { mutateAsync: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar()

const avatarPreview = ref<string | null>(null)
const savingForm = ref<FormId | null>(null)

// The same list, and the same stored names, as sign-up, the directory and lawyers' profiles.
const states = [...NIGERIA_STATE_NAMES]
  .sort((a, b) => a.localeCompare(b))
  .map(name => ({ label: name === 'FCT' ? 'Abuja (FCT)' : name, value: name }))

const displayName = computed(() => profile.value?.name?.trim() || 'Your profile')
const avatarSrc = computed(() => avatarPreview.value ?? profile.value?.image ?? '')

const completionItems = computed(() => [
  { label: 'Profile photo', done: Boolean(profile.value?.image) },
  { label: 'Full name', done: Boolean(profile.value?.name?.trim()) },
  { label: 'State', done: Boolean(profile.value?.state) },
  { label: 'A short note', done: Boolean(profile.value?.bio?.trim()), optional: true },
  { label: 'Phone number', done: Boolean(profile.value?.phoneNumber?.trim()), optional: true },
])

const completionPercent = computed(() => {
  const required = completionItems.value.filter(item => !item.optional)
  return Math.round((required.filter(item => item.done).length / required.length) * 100)
})

function savingOf(id: FormId) {
  return isSaving.value && savingForm.value === id
}

async function save(id: FormId, payload: Parameters<typeof updateProfile>[0]) {
  savingForm.value = id
  try {
    await updateProfile(payload)
    toast.success('Saved.')
  }
  catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'We could not save that. Nothing has changed.')
  }
  finally {
    savingForm.value = null
  }
}

async function onAvatarUpload(file: File) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    toast.error('Use a JPEG, PNG, GIF or WebP picture.')
    return
  }
  if (file.size > MAX_AVATAR_BYTES) {
    toast.error('The picture is larger than 5 MB.')
    return
  }

  avatarPreview.value = URL.createObjectURL(file)
  try {
    await uploadAvatar(file)
    toast.success('Photo updated.')
    await refetch()
  }
  catch (error) {
    avatarPreview.value = null
    toast.error(error instanceof ApiError ? error.message : 'We could not upload the photo.')
  }
}

onBeforeUnmount(() => {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
})
</script>

<template>
  <div class="grid grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <DashboardPageHeader
      eyebrow="Account"
      title="Your profile"
      description="Your photo, your details and what a lawyer sees about you."
    />

    <LoadingProfile v-if="isLoading" role="client" />

    <section v-else-if="isError" :class="[PANEL, 'p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center']">
      <h2 :class="PANEL_TITLE">We could not load your profile.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" @click="() => refetch()">Try again</Button>
    </section>

    <template v-else>
      <ClientProfileCompletenessAside class="xl:hidden" :percent="completionPercent" :items="completionItems" />

      <ClientProfileShell :sections="CLIENT_PROFILE_SECTIONS">
        <template #sidebar>
          <ClientProfileCompletenessAside :percent="completionPercent" :items="completionItems" />
        </template>

        <div class="grid grid-cols-1 gap-4 lg:gap-5 xl:gap-6 [&>div]:scroll-mt-21">
          <div id="photo">
            <ProfilePhotoSection
              :name="displayName"
              :email="profile?.email"
              :image-url="avatarSrc"
              :uploading="isUploadingAvatar"
              title="Photo"
              description="Saved as soon as you choose it. A lawyer sees it on your bookings and messages."
              @upload="onAvatarUpload"
            />
          </div>
          <div id="personal">
            <ClientPersonalForm :profile="profile" :saving="savingOf('personal')" @save="(p) => save('personal', p)" />
          </div>
          <div id="location">
            <ClientLocationForm :profile="profile" :states="states" :saving="savingOf('location')" @save="(p) => save('location', p)" />
          </div>
          <div id="about">
            <ClientAboutForm :profile="profile" :saving="savingOf('about')" @save="(p) => save('about', p)" />
          </div>
          <div id="contact">
            <ClientContactForm :profile="profile" :saving="savingOf('contact')" @save="(p) => save('contact', p)" />
          </div>
        </div>
      </ClientProfileShell>

      <p class="text-sm text-muted-foreground">
        Your legal interests and sign-in details are in
        <NuxtLink to="/dashboard/settings" class="font-medium text-brand underline-offset-4 hover:underline">Settings</NuxtLink>.
      </p>
    </template>
  </div>
</template>
