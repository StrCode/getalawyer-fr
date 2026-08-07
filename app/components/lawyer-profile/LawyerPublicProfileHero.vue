<script setup lang="ts">
import { ArrowLeft01Icon, Briefcase01Icon, CheckmarkBadge01Icon, Clock01Icon, Location01Icon, Mail01Icon, Message02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { LawyerProfile } from '~/types/lawyer'
defineProps<{
  lawyer: LawyerProfile
  isOwnProfile: boolean
  isAuthenticated: boolean
  backLink: string
  backLinkLabel: string
  heroSubtitle: string
  displayLocation: string
  yearsExperience: number
  canMessage: boolean
  availabilitySummary: string | null
  isAcceptingClients: boolean
}>()

const emit = defineEmits<{
  ask: []
}>()
</script>

<template>
  <header class="border-b border-border bg-background">
    <div class="mx-auto max-w-7xl px-6 pb-10 pt-8 md:px-8 md:pb-12 md:pt-10">
      <div
        v-if="isOwnProfile"
        class="mb-6 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
      >
        You’re viewing your public profile — this is exactly what clients see.
      </div>

      <NuxtLink
        :to="backLink"
        class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon :icon="ArrowLeft01Icon" class="size-4 shrink-0" aria-hidden="true" />
        {{ backLinkLabel }}
      </NuxtLink>

      <p class="eyebrow mb-3 text-primary-strong">
        Lawyer profile
      </p>

      <div class="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
        <div
          class="relative size-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-background md:size-40"
        >
          <img
            v-if="lawyer.image"
            :src="lawyer.image"
            class="size-full object-cover"
            :alt="`${lawyer.name} profile photo`"
          >
          <div
            v-else
            class="flex size-full items-center justify-center bg-primary/10"
          >
            <span class="text-4xl font-semibold text-primary md:text-5xl">
              {{ lawyer.name.charAt(0) }}
            </span>
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <Badge
              v-if="lawyer.ninVerified"
              variant="verified"
              class="gap-1"
            >
              <HugeiconsIcon :icon="CheckmarkBadge01Icon" class="size-3.5" />
              NIN verified
            </Badge>
            <Badge
              v-if="lawyer.applicationStatus === 'approved'"
              variant="soft"
            >
              Approved
            </Badge>
            <Badge
              v-if="lawyer.professionalInfo?.yearOfCall"
              variant="soft"
            >
              Called {{ lawyer.professionalInfo.yearOfCall }}
            </Badge>
            <Badge
              v-if="isAcceptingClients"
              variant="secondary"
              class="border-primary/20 bg-primary/10 text-primary"
            >
              Accepting new clients
            </Badge>
          </div>

          <div class="mb-2 flex flex-wrap items-center gap-3">
           <h1 class="text-4xl font-medium tracking-[-0.02em] text-foreground md:text-5xl">
              {{ lawyer.name }}
            </h1>
            <HugeiconsIcon :icon="CheckmarkBadge01Icon"
              v-if="lawyer.ninVerified"
              class="size-7 text-primary"
            />
          </div>

          <p class="text-lg text-muted-foreground md:text-xl">
            {{ heroSubtitle }}
          </p>
          <p
            v-if="lawyer.practiceInfo?.firmName"
            class="mt-1 text-sm text-muted-foreground"
          >
            {{ lawyer.practiceInfo.firmName }}
          </p>

          <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span class="inline-flex items-center gap-1.5">
              <HugeiconsIcon :icon="Location01Icon" class="size-4 shrink-0" />
              {{ displayLocation }}
            </span>
            <span
              v-if="yearsExperience > 0"
              class="inline-flex items-center gap-1.5"
            >
              <HugeiconsIcon :icon="Briefcase01Icon" class="size-4 shrink-0" />
              {{ yearsExperience }} years experience
            </span>
            <span
              v-if="availabilitySummary"
              class="inline-flex items-center gap-1.5"
            >
              <HugeiconsIcon :icon="Clock01Icon" class="size-4 shrink-0" />
              {{ availabilitySummary }}
            </span>
          </div>
        </div>

        <div
          v-if="!isOwnProfile"
          class="flex w-full shrink-0 flex-col gap-3 lg:hidden"
        >
          <Button
            size="lg"
            class="h-12 w-full gap-2 px-8 font-semibold"
            :disabled="!canMessage"
            @click="emit('ask')"
          >
            <HugeiconsIcon :icon="Message02Icon" class="size-5 shrink-0" />
            Ask question
          </Button>
          <Button
            v-if="isAuthenticated && lawyer.email"
            variant="outline"
            size="lg"
            class="h-12 w-full gap-2 px-8 font-semibold"
            as-child
          >
            <a :href="`mailto:${lawyer.email}`">
              <HugeiconsIcon :icon="Mail01Icon" class="size-5 shrink-0" />
              Send email
            </a>
          </Button>
        </div>
      </div>
    </div>
  </header>
</template>
