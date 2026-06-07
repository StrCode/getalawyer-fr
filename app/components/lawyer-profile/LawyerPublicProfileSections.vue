<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import {
  formatEducationSubtitle,
  formatEducationYears,
  formatExperienceRange,
  formatLicenseDates,
} from '~/lib/profile-list-format'
import type { LawyerPublicProfileSections } from '~/types/lawyer-profile-editor'

defineProps<{
  profile: LawyerPublicProfileSections
}>()

const hasAbout = (profile: LawyerPublicProfileSections) =>
  Boolean(profile.about.headline?.trim() || profile.about.about?.trim())
</script>

<template>
  <div class="space-y-12">
    <section v-if="hasAbout(profile)">
      <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
        <PhUser class="size-6 text-muted-foreground" />
        About
      </h2>
      <div class="rounded-xl border border-border bg-card p-5">
        <p
          v-if="profile.about.headline?.trim()"
          class="text-lg font-semibold text-foreground"
        >
          {{ profile.about.headline }}
        </p>
        <p
          v-if="profile.about.about?.trim()"
          class="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground"
          :class="{ 'mt-0': !profile.about.headline?.trim() }"
        >
          {{ profile.about.about }}
        </p>
      </div>
    </section>

    <hr
      v-if="hasAbout(profile) && profile.experiences.length"
      class="border-border"
    >

    <section v-if="profile.experiences.length">
      <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
        <PhBriefcase class="size-6 text-muted-foreground" />
        Experience
      </h2>
      <div class="space-y-4">
        <article
          v-for="item in profile.experiences"
          :key="item.id"
          class="rounded-xl border border-border bg-card p-5"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="text-lg font-bold text-foreground">
                {{ item.title }}
              </h3>
              <p class="mt-1 text-sm font-medium text-muted-foreground">
                {{ item.organization }}
              </p>
            </div>
            <p
              v-if="formatExperienceRange(item) || item.location"
              class="text-sm tabular-nums text-muted-foreground"
            >
              {{ [formatExperienceRange(item), item.location].filter(Boolean).join(' · ') }}
            </p>
          </div>
          <p
            v-if="item.description?.trim()"
            class="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
          >
            {{ item.description }}
          </p>
        </article>
      </div>
    </section>

    <hr
      v-if="profile.experiences.length && profile.education.length"
      class="border-border"
    >

    <section v-if="profile.education.length">
      <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
        <PhGraduationCap class="size-6 text-muted-foreground" />
        Education
      </h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article
          v-for="item in profile.education"
          :key="item.id"
          class="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
        >
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/50"
          >
            <PhGraduationCap class="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base font-bold leading-tight text-foreground">
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
              class="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/80"
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

    <hr
      v-if="profile.education.length && profile.licenses.length"
      class="border-border"
    >

    <section v-if="profile.licenses.length">
      <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
        <PhIdentificationCard class="size-6 text-muted-foreground" />
        Licenses & certifications
      </h2>
      <div class="space-y-4">
        <article
          v-for="item in profile.licenses"
          :key="item.id"
          class="rounded-xl border border-border bg-card p-5"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-bold text-foreground">
                  {{ item.name }}
                </h3>
                <Badge
                  v-if="item.isVerified"
                  variant="secondary"
                  class="text-[10px] uppercase tracking-wide"
                >
                  Verified
                </Badge>
              </div>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ item.issuingOrganization }}
              </p>
            </div>
            <p
              v-if="formatLicenseDates(item)"
              class="text-sm text-muted-foreground"
            >
              {{ formatLicenseDates(item) }}
            </p>
          </div>
          <p
            v-if="item.credentialId"
            class="mt-3 text-xs text-muted-foreground"
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
            <PhArrowSquareOut class="size-3.5" />
          </a>
        </article>
      </div>
    </section>

    <hr
      v-if="profile.licenses.length && profile.skills.length"
      class="border-border"
    >

    <section v-if="profile.skills.length">
      <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
        <PhSparkle class="size-6 text-muted-foreground" />
        Skills
      </h2>
      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="skill in profile.skills"
          :key="skill.id"
          variant="secondary"
          class="rounded-full px-3.5 py-1.5 text-sm font-medium"
        >
          {{ skill.name }}
        </Badge>
      </div>
    </section>
  </div>
</template>
