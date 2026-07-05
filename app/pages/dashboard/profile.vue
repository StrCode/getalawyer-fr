<template>
  <motion.div
    class="mx-auto w-full max-w-3xl space-y-6"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <div
      v-if="authPending"
      class="space-y-4"
    >
      <Skeleton class="h-36 w-full rounded-xl" />
      <Skeleton class="h-64 w-full rounded-xl" />
    </div>

    <LawyerProfileEditorShell v-else-if="isLawyer" />

    <template v-else-if="isClient">
      <AppPageHeader
        title="Profile"
        sticky
      >
        <template #description>
          Your photo, contact details, and how you appear to lawyers.
          <NuxtLink
            to="/dashboard/settings"
            class="font-medium text-primary underline-offset-4 hover:underline"
          >
            Account settings
          </NuxtLink>
          for preferences, documents, and privacy.
        </template>
        <template
          v-if="!isLoading && !isError"
          #actions
        >
          <Badge
            v-if="isDirty"
            variant="outline"
            class="hidden font-normal sm:inline-flex"
          >
            Unsaved changes
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            :disabled="isSaving || !isDirty"
            @click="resetForm"
          >
            Discard
          </Button>
          <ButtonBusy
            size="sm"
            :loading="isSaving"
            :disabled="!canSave"
            @click="onSubmit"
          >
            Save changes
          </ButtonBusy>
        </template>
      </AppPageHeader>

      <motion.div
        v-if="isLoading"
        class="space-y-4"
      >
        <Skeleton class="h-36 w-full rounded-xl" />
        <Skeleton class="h-[28rem] w-full rounded-xl" />
      </motion.div>

      <Card
        v-else-if="isError"
        class="border-dashed"
      >
        <CardContent class="flex flex-col items-center gap-3 py-14 text-center">
          <AppIcon :icon="appIcons.warningCircle" class="size-9 text-muted-foreground" />
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

      <form
        v-else
        class="space-y-6"
        @submit.prevent="onSubmit"
      >
        <Card class="overflow-hidden border-border bg-card shadow-none">
          <!-- Avatar hero (Clay-style) -->
          <CardContent class="flex flex-col gap-6 border-b border-border/60 p-6 sm:flex-row sm:items-center sm:p-8">
            <div class="relative shrink-0 self-center sm:self-auto">
              <Avatar class="size-24 ring-4 ring-background sm:size-28">
                <AvatarImage
                  :src="avatarSrc"
                  :alt="form.name || 'Profile'"
                />
                <AvatarFallback class="bg-primary text-2xl text-primary-foreground">
                  {{ initials }}
                </AvatarFallback>
              </Avatar>
              <span
                v-if="isUploadingAvatar"
                class="absolute inset-0 flex items-center justify-center rounded-full bg-background/70"
              >
                <AppIcon :icon="appIcons.circleNotch" class="size-8 animate-spin text-muted-foreground" />
              </span>
            </div>

            <motion.div class="min-w-0 flex-1 text-center sm:text-left">
              <p class="font-heading text-xl font-semibold tracking-tight text-foreground">
                {{ displayName }}
              </p>
              <p class="mt-0.5 truncate text-sm text-muted-foreground">
                {{ profile?.email }}
              </p>
              <p
                v-if="stateLabel"
                class="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <AppIcon :icon="appIcons.mapPin" class="size-4 shrink-0" />
                {{ stateLabel }}, Nigeria
              </p>
            </motion.div>

            <motion.div class="flex shrink-0 flex-col gap-2 sm:items-end">
              <input
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                class="sr-only"
                @change="onAvatarSelected"
              >
              <ButtonBusy
                type="button"
                variant="outline"
                size="sm"
                :loading="isUploadingAvatar"
                class="w-full sm:w-auto"
                @click="fileInputRef?.click()"
              >
                <AppIcon :icon="appIcons.camera" class="size-4" />
                Upload photo
              </ButtonBusy>
              <p class="text-center text-xs text-muted-foreground sm:text-right">
                JPG, PNG, GIF or WebP · max 5 MB
              </p>
            </motion.div>
          </CardContent>

          <!-- Personal information -->
          <CardContent class="space-y-8 p-6 sm:p-8">
            <motion.div class="space-y-1">
              <h2 class="text-sm font-semibold text-foreground">
                Personal information
              </h2>
              <p class="text-sm text-muted-foreground">
                Details shared with lawyers when you book a consultation.
              </p>
            </motion.div>

            <FieldGroup class="gap-8">
              <ProfileSettingsRow
                title="Full name"
                description="Your legal name as it appears on bookings."
              >
                <div class="relative">
                  <AppIcon :icon="appIcons.user" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
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
                description="Contact support to change your sign-in email."
              >
                <motion.div class="relative">
                  <AppIcon :icon="appIcons.envelope" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    :model-value="profile?.email ?? ''"
                    type="email"
                    disabled
                    class="bg-background pl-9"
                  />
                </motion.div>
              </ProfileSettingsRow>

              <ProfileSettingsRow
                title="Gender"
                description="Optional — helps match you with the right lawyer if you prefer."
              >
                <Select v-model="form.gender">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">
                      Female
                    </SelectItem>
                    <SelectItem value="male">
                      Male
                    </SelectItem>
                    <SelectItem value="non_binary">
                      Non-binary
                    </SelectItem>
                    <SelectItem value="prefer_not">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </ProfileSettingsRow>

              <ProfileSettingsRow
                title="Date of birth"
                description="Used for identity verification when required."
              >
                <Input
                  id="profile-dob"
                  v-model="form.dateOfBirth"
                  type="date"
                />
              </ProfileSettingsRow>

              <ProfileSettingsRow
                title="Company"
                description="Optional — shown if you book on behalf of an organization."
              >
                <motion.div class="relative">
                  <AppIcon :icon="appIcons.buildings" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-company"
                    v-model="form.company"
                    autocomplete="organization"
                    placeholder="Acme Ltd"
                    class="pl-9"
                  />
                </motion.div>
              </ProfileSettingsRow>
            </FieldGroup>
          </CardContent>

          <Separator />

          <!-- Location -->
          <CardContent class="space-y-8 p-6 sm:p-8">
            <motion.div class="space-y-1">
              <h2 class="text-sm font-semibold text-foreground">
                Location
              </h2>
              <p class="text-sm text-muted-foreground">
                We use your region to surface lawyers who practice where you are.
              </p>
            </motion.div>

            <FieldGroup class="gap-8">
              <ProfileSettingsRow
                title="Country"
                description="GetALawyer is available in Nigeria for now."
              >
                <motion.div
                  class="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
                >
                  <span
                    class="flex size-10 shrink-0 items-center justify-center rounded-md bg-background text-lg shadow-sm ring-1 ring-border"
                    aria-hidden="true"
                  >
                    🇳🇬
                  </span>
                  <motion.div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-foreground">
                      Nigeria
                    </p>
                  </motion.div>
                  <Badge variant="secondary" class="shrink-0 font-normal">
                    Fixed
                  </Badge>
                </motion.div>
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

              <ProfileSettingsRow
                title="Preferred language"
                description="Consultations and documents in your preferred language."
              >
                <Select v-model="form.language">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      English
                    </SelectItem>
                    <SelectItem value="yo">
                      Yoruba
                    </SelectItem>
                    <SelectItem value="ig">
                      Igbo
                    </SelectItem>
                    <SelectItem value="ha">
                      Hausa
                    </SelectItem>
                    <SelectItem value="fr">
                      French
                    </SelectItem>
                  </SelectContent>
                </Select>
              </ProfileSettingsRow>
            </FieldGroup>
          </CardContent>

          <Separator />

          <!-- About you -->
          <CardContent class="space-y-8 p-6 sm:p-8">
            <motion.div class="space-y-1">
              <h2 class="text-sm font-semibold text-foreground">
                About you
              </h2>
              <p class="text-sm text-muted-foreground">
                Optional context for lawyers before your first consultation.
              </p>
            </motion.div>

            <FieldGroup>
              <ProfileSettingsRow
                title="Short bio / legal needs"
                description="A brief note on what you need help with."
              >
                <Textarea
                  id="profile-bio"
                  v-model="form.bio"
                  rows="4"
                  placeholder="e.g. I need advice on a tenancy agreement in Lagos…"
                  class="resize-y"
                />
              </ProfileSettingsRow>
            </FieldGroup>
          </CardContent>

          <Separator />

          <!-- Contact -->
          <CardContent class="space-y-8 p-6 sm:p-8">
            <motion.div class="space-y-1">
              <h2 class="text-sm font-semibold text-foreground">
                Contact
              </h2>
              <p class="text-sm text-muted-foreground">
                Optional — lawyers may use this to reach you about bookings.
              </p>
            </motion.div>

            <FieldGroup>
              <ProfileSettingsRow
                title="Phone number"
                description="International format, e.g. +2348012345678"
              >
                <motion.div class="space-y-2">
                  <motion.div class="relative">
                    <AppIcon :icon="appIcons.phone" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="profile-phone"
                      v-model="form.phoneNumber"
                      type="tel"
                      autocomplete="tel"
                      placeholder="+2348012345678"
                      class="pl-9"
                      :aria-invalid="!phoneValid"
                    />
                  </motion.div>
                  <p
                    v-if="!phoneValid"
                    class="text-sm text-destructive"
                  >
                    Enter a valid international phone number or leave blank.
                  </p>
                </motion.div>
              </ProfileSettingsRow>
            </FieldGroup>
          </CardContent>

          <!-- Mobile save bar -->
          <CardFooter class="flex flex-wrap justify-end gap-2 border-t border-border/60 bg-background p-4 sm:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="isSaving || !isDirty"
              @click="resetForm"
            >
              Discard
            </Button>
            <ButtonBusy
              type="submit"
              size="sm"
              :loading="isSaving"
              :disabled="!canSave"
            >
              Save changes
            </ButtonBusy>
          </CardFooter>
        </Card>
      </form>
    </template>
  </motion.div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { motion } from 'motion-v'
import { toast } from 'vue-sonner'
import LawyerProfileEditorShell from '@/components/profile/LawyerProfileEditorShell.vue'
import ProfileSettingsRow from '@/components/dashboard/ProfileSettingsRow.vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useClientOnboarding } from '~/composables/useClientOnboarding'
import { useClientProfile } from '~/composables/useClientProfile'
import type { ClientProfile } from '~/lib/api'
import { ApiError } from '~/lib/api/client'
import { getSessionUserType } from '~/lib/session-user'

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/
const DEFAULT_COUNTRY = 'NG'
const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

useHead({
  title: 'Profile - GetALawyer',
  meta: [
    { name: 'description', content: 'Manage your profile and contact details' },
  ],
})

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { session, isPending: authPending } = useAuth()
const isLawyer = computed(() => getSessionUserType(session.value?.user) === 'lawyer')
const isClient = computed(() => getSessionUserType(session.value?.user) === 'client')

const { useProfile, useUpdateProfile, useUploadAvatar } = useClientProfile()
const { useCountries } = useClientOnboarding()

const {
  data: profile,
  isLoading,
  isError,
  refetch,
} = useProfile({ enabled: isClient })

const { data: countriesData } = useCountries()
const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile()
const { mutateAsync: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar()

const fileInputRef = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)

const form = reactive({
  name: '',
  company: '',
  country: DEFAULT_COUNTRY,
  state: '',
  city: '',
  phoneNumber: '',
  gender: '',
  dateOfBirth: '',
  language: 'en',
  bio: '',
})

const snapshot = ref('')

function profileToForm(p: ClientProfile) {
  const extras = {
    gender: form.gender,
    dateOfBirth: form.dateOfBirth,
    city: form.city,
    language: form.language,
    bio: form.bio,
  }
  form.name = p.name ?? ''
  form.company = p.company ?? ''
  form.country = p.country || DEFAULT_COUNTRY
  form.state = p.state ?? ''
  form.phoneNumber = p.phoneNumber ?? ''
  Object.assign(form, extras)
  snapshot.value = JSON.stringify(form)
}

watch(
  profile,
  (p) => {
    if (p) {
      profileToForm(p)
    }
  },
  { immediate: true },
)

const availableStates = computed(() => {
  const countries = countriesData.value?.data ?? []
  const country = countries.find((c) => c.code2 === form.country)
  return (country?.states ?? []).map((s) => ({
    label: s.name,
    value: s.code,
  }))
})

const stateLabel = computed(() => {
  if (!form.state) return null
  return availableStates.value.find((s) => s.value === form.state)?.label ?? form.state
})

const displayName = computed(() => form.name.trim() || profile.value?.name || 'Your profile')

const initials = computed(() => {
  const parts = (form.name || profile.value?.name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
})

const avatarSrc = computed(() => avatarPreview.value ?? profile.value?.image ?? '')

const isDirty = computed(() => JSON.stringify(form) !== snapshot.value)

const phoneValid = computed(() => {
  const phone = form.phoneNumber.trim()
  if (!phone) return true
  return PHONE_REGEX.test(phone)
})

const canSave = computed(
  () =>
    isDirty.value
    && form.name.trim().length > 0
    && !!form.state
    && phoneValid.value
    && !isSaving.value,
)

function resetForm() {
  if (profile.value) {
    profileToForm(profile.value)
  }
  avatarPreview.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function onAvatarSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    toast.error('Invalid file type', {
      description: 'Use JPEG, PNG, GIF, or WebP.',
    })
    input.value = ''
    return
  }

  if (file.size > MAX_AVATAR_BYTES) {
    toast.error('File too large', { description: 'Maximum size is 5 MB.' })
    input.value = ''
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
  } finally {
    input.value = ''
  }
}

async function onSubmit() {
  if (!canSave.value) return

  const payload = {
    name: form.name.trim(),
    company: form.company.trim() || undefined,
    country: form.country,
    state: form.state,
    phoneNumber: form.phoneNumber.trim() || undefined,
  }

  try {
    const updated = await updateProfile(payload)
    profileToForm(updated)
    toast.success('Profile saved')
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Could not save profile'
    toast.error('Save failed', { description: message })
  }
}

onBeforeUnmount(() => {
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value)
  }
})
</script>
