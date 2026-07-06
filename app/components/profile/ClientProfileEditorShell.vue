<script setup lang="ts">
import { AlertCircleIcon, Building01Icon, CallIcon, Mail01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { motion } from 'motion-v'
import { toast } from 'vue-sonner'
import ClientProfileShell from '@/components/profile/ClientProfileShell.vue'
import ClientProfileCompletenessAside from '@/components/profile/ClientProfileCompletenessAside.vue'
import ProfilePhotoSection from '@/components/profile/sections/ProfilePhotoSection.vue'
import ProfileSectionActions from '@/components/profile/ProfileSectionActions.vue'
import ProfileSettingsRow from '@/components/dashboard/ProfileSettingsRow.vue'
import { CLIENT_PROFILE_SECTIONS } from '@/components/profile/client-profile-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientProfile } from '~/composables/useClientProfile'
import type { ClientProfile } from '~/lib/api'
import { ApiError } from '~/lib/api/client'

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/
const DEFAULT_COUNTRY = 'NG'
const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

type ProfileSectionId = 'personal' | 'location' | 'about' | 'contact'

const { useProfile, useUpdateProfile, useUploadAvatar } = useClientProfile()
const { useCountries } = useClientOnboarding()

const {
  data: profile,
  isLoading,
  isError,
  refetch,
} = useProfile()

const { data: countriesData } = useCountries()
const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile()
const { mutateAsync: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar()

const avatarPreview = ref<string | null>(null)
const profileInitialized = ref(false)
const savingSection = ref<ProfileSectionId | null>(null)

const form = reactive({
  name: '',
  company: '',
  country: DEFAULT_COUNTRY,
  state: '',
  city: '',
  bio: '',
  phoneNumber: '',
})

const savedSnapshots = reactive({
  personal: '',
  location: '',
  about: '',
  contact: '',
})

function snapshotPersonal() {
  return JSON.stringify({ name: form.name, company: form.company })
}

function snapshotLocation() {
  return JSON.stringify({ country: form.country, state: form.state, city: form.city })
}

function snapshotAbout() {
  return JSON.stringify({ bio: form.bio })
}

function snapshotContact() {
  return JSON.stringify({ phoneNumber: form.phoneNumber })
}

function syncSnapshotsFromForm() {
  savedSnapshots.personal = snapshotPersonal()
  savedSnapshots.location = snapshotLocation()
  savedSnapshots.about = snapshotAbout()
  savedSnapshots.contact = snapshotContact()
}

function profileToForm(p: ClientProfile) {
  form.name = p.name ?? ''
  form.company = p.company ?? ''
  form.country = p.country || DEFAULT_COUNTRY
  form.state = p.state ?? ''
  form.city = p.city ?? ''
  form.bio = p.bio ?? ''
  form.phoneNumber = p.phoneNumber ?? ''
  syncSnapshotsFromForm()
}

watch(
  profile,
  (p) => {
    if (p && !profileInitialized.value) {
      profileToForm(p)
      profileInitialized.value = true
    }
  },
  { immediate: true },
)

const availableStates = computed(() => {
  const countries = countriesData.value?.data ?? []
  const country = countries.find(c => c.code2 === form.country)
  return (country?.states ?? []).map(s => ({
    label: s.name,
    value: s.code,
  }))
})

const displayName = computed(() => form.name.trim() || profile.value?.name || 'Your profile')

const avatarSrc = computed(() => avatarPreview.value ?? profile.value?.image ?? '')

const phoneValid = computed(() => {
  const phone = form.phoneNumber.trim()
  if (!phone) return true
  return PHONE_REGEX.test(phone)
})

const isPersonalDirty = computed(() => snapshotPersonal() !== savedSnapshots.personal)
const isLocationDirty = computed(() => snapshotLocation() !== savedSnapshots.location)
const isAboutDirty = computed(() => snapshotAbout() !== savedSnapshots.about)
const isContactDirty = computed(() => snapshotContact() !== savedSnapshots.contact)

const canSavePersonal = computed(
  () => isPersonalDirty.value && form.name.trim().length > 0 && !isSaving.value,
)
const canSaveLocation = computed(
  () => isLocationDirty.value && !!form.state && !isSaving.value,
)
const canSaveAbout = computed(() => isAboutDirty.value && !isSaving.value)
const canSaveContact = computed(
  () => isContactDirty.value && phoneValid.value && !isSaving.value,
)

function isSectionSaving(section: ProfileSectionId) {
  return isSaving.value && savingSection.value === section
}

const completionItems = computed(() => [
  { label: 'Profile photo', done: Boolean(profile.value?.image) },
  { label: 'Full name', done: Boolean(form.name.trim()) },
  { label: 'State or region', done: Boolean(form.state) },
  { label: 'Short bio', done: Boolean(form.bio.trim()), optional: true },
  { label: 'Phone number', done: Boolean(form.phoneNumber.trim()), optional: true },
])

const completionPercent = computed(() => {
  const required = completionItems.value.filter(item => !item.optional)
  const done = required.filter(item => item.done).length
  return Math.round((done / required.length) * 100)
})

function discardSection(section: ProfileSectionId) {
  const saved = JSON.parse(savedSnapshots[section]) as Record<string, string>

  if (section === 'personal') {
    form.name = saved.name ?? ''
    form.company = saved.company ?? ''
  } else if (section === 'location') {
    form.country = saved.country || DEFAULT_COUNTRY
    form.state = saved.state ?? ''
    form.city = saved.city ?? ''
  } else if (section === 'about') {
    form.bio = saved.bio ?? ''
  } else if (section === 'contact') {
    form.phoneNumber = saved.phoneNumber ?? ''
  }
}

async function saveSection(section: ProfileSectionId) {
  let payload: Parameters<typeof updateProfile>[0] = {}

  if (section === 'personal') {
    if (!canSavePersonal.value) return
    payload = {
      name: form.name.trim(),
      company: form.company.trim() || undefined,
    }
  } else if (section === 'location') {
    if (!canSaveLocation.value) return
    payload = {
      country: form.country,
      state: form.state,
      city: form.city.trim() || undefined,
    }
  } else if (section === 'about') {
    if (!canSaveAbout.value) return
    payload = { bio: form.bio.trim() || undefined }
  } else if (section === 'contact') {
    if (!canSaveContact.value) return
    payload = { phoneNumber: form.phoneNumber.trim() || undefined }
  }

  savingSection.value = section

  try {
    await updateProfile(payload)
    savedSnapshots[section] = {
      personal: snapshotPersonal,
      location: snapshotLocation,
      about: snapshotAbout,
      contact: snapshotContact,
    }[section]()
    toast.success('Section saved')
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Could not save profile'
    toast.error('Save failed', { description: message })
  } finally {
    savingSection.value = null
  }
}

async function onAvatarUpload(file: File) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    toast.error('Invalid file type', { description: 'Use JPEG, PNG, GIF, or WebP.' })
    return
  }

  if (file.size > MAX_AVATAR_BYTES) {
    toast.error('File too large', { description: 'Maximum size is 5 MB.' })
    return
  }

  avatarPreview.value = URL.createObjectURL(file)

  try {
    await uploadAvatar(file)
    toast.success('Photo updated')
    await refetch()
  } catch (error) {
    avatarPreview.value = null
    const message = error instanceof ApiError ? error.message : 'Upload failed'
    toast.error('Could not upload photo', { description: message })
  }
}

onBeforeUnmount(() => {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
})
</script>

<template>
  <motion.div
    class="mx-auto w-full max-w-5xl space-y-6"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <h1 class="text-2xl font-medium text-foreground">
        Profile
      </h1>
      <p class="mt-1 font-sans text-base text-muted-foreground">
        Your photo, contact details, and how you appear to lawyers.
      </p>
    </div>
  </div>

    <motion.div
      v-if="isLoading"
      class="space-y-4"
    >
      <Skeleton class="h-24 w-full rounded-xl" />
      <Skeleton class="h-36 w-full rounded-xl" />
      <Skeleton class="h-64 w-full rounded-xl" />
    </motion.div>

    <Card
      v-else-if="isError"
      class="border-dashed"
    >
      <CardContent class="flex flex-col items-center gap-3 py-14 text-center">
        <HugeiconsIcon :icon="AlertCircleIcon" class="size-9 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">
          We couldn't load your profile. Refresh and try again.
        </p>
        <Button
          variant="outline"
          size="sm"
          @click="() => refetch()"
        >
          Retry
        </Button>
      </CardContent>
    </Card>

    <template v-else>
      <ClientProfileCompletenessAside
        class="xl:hidden"
        :percent="completionPercent"
        :items="completionItems"
      />

      <ClientProfileShell :sections="CLIENT_PROFILE_SECTIONS">
        <template #sidebar>
          <ClientProfileCompletenessAside
            :percent="completionPercent"
            :items="completionItems"
          />
        </template>

        <div class="space-y-6">
          <div id="photo">
            <ProfilePhotoSection
              :name="displayName"
              :email="profile?.email"
              :image-url="avatarSrc"
              :uploading="isUploadingAvatar"
              title="Profile photo"
              description="Uploads automatically. Shown to lawyers on bookings and in messages."
              @upload="onAvatarUpload"
            />
          </div>

          <Card id="personal">
            <CardHeader class="pb-3">
              <CardTitle class="text-base">
                Personal information
              </CardTitle>
              <CardDescription>
                Details shared with lawyers when you book a consultation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup class="gap-8">
                <ProfileSettingsRow
                  title="Full name"
                  description="Your legal name as it appears on bookings."
                >
                  <div class="relative">
                    <HugeiconsIcon :icon="UserIcon" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="profile-name"
                      v-model="form.name"
                      autocomplete="name"
                      required
                      class="pl-9"
                    />
                  </div>
                </ProfileSettingsRow>

                <ProfileSettingsRow
                  title="Email"
                  description="Managed in Account settings — contact support to change your sign-in email."
                >
                  <div class="relative">
                    <HugeiconsIcon :icon="Mail01Icon" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="profile-email"
                      :model-value="profile?.email ?? ''"
                      type="email"
                      disabled
                      class="bg-background pl-9"
                    />
                  </div>
                </ProfileSettingsRow>

                <ProfileSettingsRow
                  title="Company"
                  description="Optional — shown if you book on behalf of an organization."
                >
                  <div class="relative">
                    <HugeiconsIcon :icon="Building01Icon" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="profile-company"
                      v-model="form.company"
                      autocomplete="organization"
                      placeholder="Acme Ltd"
                      class="pl-9"
                    />
                  </div>
                </ProfileSettingsRow>
              </FieldGroup>
            </CardContent>
            <ProfileSectionActions
              :dirty="isPersonalDirty"
              :can-save="canSavePersonal"
              :saving="isSectionSaving('personal')"
              @discard="discardSection('personal')"
              @save="saveSection('personal')"
            />
          </Card>

          <Card id="location">
            <CardHeader class="pb-3">
              <CardTitle class="text-base">
                Location
              </CardTitle>
              <CardDescription>
                We use your region to surface lawyers who practice where you are.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup class="gap-8">
                <ProfileSettingsRow
                  title="Country"
                  description="GetALawyer is available in Nigeria for now."
                >
                  <div class="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
                    <span
                      class="flex size-10 shrink-0 items-center justify-center rounded-md bg-background text-lg shadow-xs ring-1 ring-border"
                      aria-hidden="true"
                    >
                      🇳🇬
                    </span>
                    <p class="text-sm font-medium text-foreground">
                      Nigeria
                    </p>
                    <Badge variant="secondary" class="ms-auto shrink-0 font-normal">
                      Fixed
                    </Badge>
                  </div>
                </ProfileSettingsRow>

                <ProfileSettingsRow
                  title="State or region"
                  description="Required for lawyer matching in your area."
                >
                  <div class="grid gap-3 sm:grid-cols-2">
                    <Select v-model="form.state">
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Select state or region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="s in availableStates"
                          :key="s.value"
                          :value="s.value"
                        >
                          {{ s.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="profile-city"
                      v-model="form.city"
                      placeholder="City"
                      autocomplete="address-level2"
                    />
                  </div>
                </ProfileSettingsRow>
              </FieldGroup>
            </CardContent>
            <ProfileSectionActions
              :dirty="isLocationDirty"
              :can-save="canSaveLocation"
              :saving="isSectionSaving('location')"
              @discard="discardSection('location')"
              @save="saveSection('location')"
            />
          </Card>

          <Card id="about">
            <CardHeader class="pb-3">
              <CardTitle class="text-base">
                About you
              </CardTitle>
              <CardDescription>
                Optional context for lawyers before your first consultation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <ProfileSettingsRow
                  title="Short bio / legal needs"
                  description="A brief note on what you need help with."
                >
                  <Textarea
                    id="profile-bio"
                    v-model="form.bio"
                    rows="4"
                    maxlength="2000"
                    placeholder="e.g. I need advice on a tenancy agreement in Lagos…"
                    class="resize-y"
                  />
                </ProfileSettingsRow>
              </FieldGroup>
            </CardContent>
            <ProfileSectionActions
              :dirty="isAboutDirty"
              :can-save="canSaveAbout"
              :saving="isSectionSaving('about')"
              @discard="discardSection('about')"
              @save="saveSection('about')"
            />
          </Card>

          <Card id="contact">
            <CardHeader class="pb-3">
              <CardTitle class="text-base">
                Contact
              </CardTitle>
              <CardDescription>
                Optional — lawyers may use this to reach you about bookings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <ProfileSettingsRow
                  title="Phone number"
                  description="International format, e.g. +2348012345678"
                >
                  <div class="space-y-2">
                    <div class="relative">
                      <HugeiconsIcon :icon="CallIcon" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="profile-phone"
                        v-model="form.phoneNumber"
                        type="tel"
                        autocomplete="tel"
                        placeholder="+2348012345678"
                        class="pl-9"
                        :aria-invalid="!phoneValid"
                      />
                    </div>
                    <p
                      v-if="!phoneValid"
                      class="text-sm text-destructive"
                    >
                      Enter a valid international phone number or leave blank.
                    </p>
                  </div>
                </ProfileSettingsRow>
              </FieldGroup>
            </CardContent>
            <ProfileSectionActions
              :dirty="isContactDirty"
              :can-save="canSaveContact"
              :saving="isSectionSaving('contact')"
              @discard="discardSection('contact')"
              @save="saveSection('contact')"
            />
          </Card>
        </div>
      </ClientProfileShell>

      <p class="text-center text-sm text-muted-foreground xl:text-left">
        Legal interests and security are in
        <NuxtLink
          to="/dashboard/settings"
          class="font-medium text-primary underline-offset-4 hover:underline"
        >
          Account settings
        </NuxtLink>.
      </p>
    </template>
  </motion.div>
</template>
