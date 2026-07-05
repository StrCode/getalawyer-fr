<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LawyerProfileSectionHeading from '@/components/lawyer-profile/LawyerProfileSectionHeading.vue'
import {
  formatEducationSubtitle,
  formatEducationYears,
  formatExperienceRange,
  formatLicenseDates,
} from '~/lib/profile-list-format'
import {
  getAboutPreview,
  shouldTruncateAbout,
} from '~/lib/lawyer-public-profile'
import type { LawyerPublicProfileSections } from '~/types/lawyer-profile-editor'
defineProps<{
  profile: LawyerPublicProfileSections
}>()

const aboutExpanded = ref(false)

const hasAbout = (profile: LawyerPublicProfileSections) =>
  Boolean(profile.about.headline?.trim() || profile.about.about?.trim())
</script>

<template>
  <div class="space-y-14">
    <section v-if="hasAbout(profile)">
      <LawyerProfileSectionHeading title="About">
        <template #icon>
          <AppIcon :icon="appIcons.user" />
        </template>
      </LawyerProfileSectionHeading>
      <p
        v-if="profile.about.headline?.trim()"
        class="font-heading text-2xl leading-snug tracking-[-0.02em] text-foreground md:text-3xl"
      >
        {{ profile.about.headline }}
      </p>
      <p
        v-if="profile.about.about?.trim()"
        class="whitespace-pre-line text-lg leading-relaxed text-muted-foreground"
        :class="profile.about.headline?.trim() ? 'mt-4' : 'mt-0'"
      >
        {{ getAboutPreview(profile.about.about, aboutExpanded) }}
      </p>
      <Button
        v-if="profile.about.about?.trim() && shouldTruncateAbout(profile.about.about) && !aboutExpanded"
        variant="link"
        class="mt-3 h-auto p-0 text-sm font-medium"
        @click="aboutExpanded = true"
      >
        Show more
      </Button>
      <Button
        v-else-if="profile.about.about?.trim() && shouldTruncateAbout(profile.about.about) && aboutExpanded"
        variant="link"
        class="mt-3 h-auto p-0 text-sm font-medium"
        @click="aboutExpanded = false"
      >
        Show less
      </Button>
    </section>

    <section v-if="profile.experiences.length">
      <LawyerProfileSectionHeading title="Experience">
        <template #icon>
          <AppIcon :icon="appIcons.briefcase" />
        </template>
      </LawyerProfileSectionHeading>
      <div class="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        <article
          v-for="item in profile.experiences"
          :key="item.id"
          class="p-5 md:p-6"
        >
          <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div class="min-w-0">
              <h3 class="text-base font-semibold tracking-tight text-foreground">
                {{ item.title }}
              </h3>
              <p class="mt-0.5 text-sm font-medium text-muted-foreground">
                {{ item.organization }}
              </p>
            </div>
            <p
              v-if="formatExperienceRange(item) || item.location"
              class="font-mono text-xs tabular-nums text-muted-foreground"
            >
              {{ [formatExperienceRange(item), item.location].filter(Boolean).join(' · ') }}
            </p>
          </div>
          <p
            v-if="item.description?.trim()"
            class="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
          >
            {{ item.description }}
          </p>
        </article>
      </div>
    </section>

    <section v-if="profile.education.length">
      <LawyerProfileSectionHeading title="Education">
        <template #icon>
          <AppIcon :icon="appIcons.graduationCap" />
        </template>
      </LawyerProfileSectionHeading>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article
          v-for="item in profile.education"
          :key="item.id"
          class="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
        >
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary ring-1 ring-border/70">
            <AppIcon :icon="appIcons.graduationCap" class="size-5" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base font-semibold leading-tight tracking-tight text-foreground">
              {{ item.school }}
            </h3>
            <p
              v-if="formatEducationSubtitle(item)"
              class="mt-1 text-sm text-muted-foreground"
            >
              {{ formatEducationSubtitle(item) }}
            </p>
            <p
              v-if="formatEducationYears(item)"
              class="mt-1 font-mono text-xs tabular-nums text-muted-foreground/80"
            >
              {{ formatEducationYears(item) }}
            </p>
            <p
              v-if="item.source === 'onboarding'"
              class="mt-2 text-xs text-muted-foreground"
            >
              From onboarding — update in profile editor for full details.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section v-if="profile.licenses.length">
      <LawyerProfileSectionHeading title="Licenses & certifications">
        <template #icon>
          <AppIcon :icon="appIcons.identificationCard" />
        </template>
      </LawyerProfileSectionHeading>
      <div class="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        <article
          v-for="item in profile.licenses"
          :key="item.id"
          class="p-5 md:p-6"
        >
          <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-base font-semibold tracking-tight text-foreground">
                  {{ item.name }}
                </h3>
                <Badge
                  v-if="item.isVerified"
                  variant="verified"
                  class="gap-1 text-[10px] uppercase tracking-wide"
                >
                  <AppIcon :icon="appIcons.sealCheck" class="size-3" />
                  Verified
                </Badge>
              </div>
              <p class="mt-0.5 text-sm text-muted-foreground">
                {{ item.issuingOrganization }}
              </p>
            </div>
            <p
              v-if="formatLicenseDates(item)"
              class="font-mono text-xs tabular-nums text-muted-foreground"
            >
              {{ formatLicenseDates(item) }}
            </p>
          </div>
          <p
            v-if="item.credentialId"
            class="mt-3 font-mono text-xs text-muted-foreground"
          >
            ID: {{ item.credentialId }}
          </p>
          <a
            v-if="item.credentialUrl"
            :href="item.credentialUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View credential
            <AppIcon :icon="appIcons.arrowSquareOut" class="size-3.5" />
          </a>
        </article>
      </div>
    </section>

    <section v-if="profile.skills.length">
      <LawyerProfileSectionHeading title="Skills">
        <template #icon>
          <AppIcon :icon="appIcons.sparkle" />
        </template>
      </LawyerProfileSectionHeading>
      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="skill in profile.skills"
          :key="skill.id"
          variant="soft"
          class="rounded-full px-3.5 py-1.5 text-sm font-medium"
        >
          {{ skill.name }}
        </Badge>
      </div>
    </section>
  </div>
</template>
