<script setup lang="ts">
import AskQuestionSheet from '@/components/lawyer-profile/AskQuestionSheet.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTimeLabel } from '~/lib/booking-calendar'
import { getAboutPreview, shouldTruncateAbout } from '~/lib/lawyer-public-profile'
import {
  formatEducationSubtitle,
  formatEducationYears,
  formatExperienceRange,
  formatLicenseDates,
} from '~/lib/profile-list-format'

/**
 * A lawyer's public profile, in the Canopy design: who they are and what was
 * checked, the long-form sections they have filled in, and a booking card that
 * stays in view. No sign-in gate: only messaging and confirming a booking need
 * an account, and both send the visitor through sign-in and back.
 *
 * Sits beside `book.vue` (not above it) so the booking page is its own route
 * rather than a child that would need a <NuxtPage> here.
 */
definePageMeta({
  layout: 'site',
  middleware: ['client-directory'],
})

const route = useRoute()
const lawyerId = computed(() => route.params.id as string)

const {
  lawyer,
  pending,
  error,
  refresh,
  isAuthenticated,
  isOwnProfile,
  profileSections,
  publishedArticles,
  loadErrorMessage,
  errorStatusCode,
  errorBackTo,
  errorBackLabel,
  yearsExperience,
  hasProfileContent,
  activeConsultationTypes,
  priceRange,
  workingDays,
  isAcceptingClients,
} = await useLawyerPublicProfilePage(lawyerId)

const primaryArea = computed(() => lawyer.value?.specializations[0] ?? null)

/** "Ikeja, Lagos"; a state whose city was left as the state name shows once. */
const location = computed(() => {
  const info = lawyer.value?.practiceInfo
  const parts = [info?.officeCity, info?.officeState].filter(Boolean) as string[]
  return parts.filter((part, index) => parts.indexOf(part) === index).join(', ') || 'Nigeria'
})

useHead({
  title: computed(() => lawyer.value
    ? `${lawyer.value.name} · ${primaryArea.value?.name ?? 'Lawyer'}`
    : 'Lawyer profile'),
})
useSeoMeta({
  description: computed(() => {
    if (!lawyer.value) return 'A verified lawyer on getalawyer.'
    const summary = profileSections.value?.about.headline?.trim()
    return summary
      ? `${lawyer.value.name}, ${location.value}. ${summary}`
      : `${lawyer.value.name} is a verified lawyer in ${location.value}. Message free or book a consultation on getalawyer.`
  }),
})

// ---- sections ----
const about = computed(() => profileSections.value?.about.about?.trim() ?? '')
const aboutExpanded = ref(false)
const experiences = computed(() => profileSections.value?.experiences ?? [])
const education = computed(() => profileSections.value?.education ?? [])
const licences = computed(() => profileSections.value?.licenses ?? [])
const skills = computed(() => profileSections.value?.skills ?? [])
const areas = computed(() => lawyer.value?.specializations ?? [])

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
/** Working days Monday first, then one closing row naming the days off. */
const hours = computed(() => {
  const byDay = new Map(workingDays.value.map(entry => [entry.day, entry]))
  const open = WEEK.filter(day => byDay.has(day)).map((day) => {
    const entry = byDay.get(day)!
    return { day, time: `${formatTimeLabel(entry.startTime)} – ${formatTimeLabel(entry.endTime)}`, off: false }
  })
  if (!open.length) return []
  const off = WEEK.filter(day => !byDay.has(day))
  return off.length ? [...open, { day: off.join(', '), time: 'Not available', off: true }] : open
})

const sectionLinks = computed(() => [
  about.value && { id: 'about', label: 'About' },
  areas.value.length && { id: 'practice-areas', label: 'Practice areas' },
  hours.value.length && { id: 'availability', label: 'Availability' },
  experiences.value.length && { id: 'experience', label: 'Experience' },
  education.value.length && { id: 'education', label: 'Education' },
  (licences.value.length || skills.value.length) && { id: 'licences', label: licences.value.length ? 'Licences' : 'Skills' },
  publishedArticles.value.length && { id: 'articles', label: 'Articles' },
].filter(Boolean) as Array<{ id: string, label: string }>)

function publishedOn(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
/** Articles open in place; long ones start folded. */
const ARTICLE_FOLD = 420
const openArticles = ref(new Set<string>())
function toggleArticle(id: string) {
  const next = new Set(openArticles.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openArticles.value = next
}

// ---- actions ----
const feeLabel = computed(() => {
  if (!activeConsultationTypes.value.length) return ''
  const { min, max } = priceRange.value
  if (max <= 0) return 'Free'
  const hasFree = activeConsultationTypes.value.some(type => Number(type.price) <= 0)
  if (hasFree) return `Free – ${formatNairaAmount(max)}`
  return max > min ? `${formatNairaAmount(min)} – ${formatNairaAmount(max)}` : formatNairaAmount(min)
})

const askOpen = ref(false)
function ask() {
  // Messaging needs an account: signed-out visitors go through sign-in and come back here.
  if (!isAuthenticated.value) {
    navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  askOpen.value = true
}

const block = 'scroll-mt-24 pt-[clamp(1.75rem,3vw,2.5rem)]'
const blockTitle = 'mb-[0.9rem] text-[1.6rem] font-[650] tracking-[-0.03em]'
const itemTitle = 'text-[1.12rem] font-[650] tracking-[-0.02em]'
const row = 'flex items-center justify-between gap-4 rounded-[1.25rem] border border-border bg-card px-[1.2rem] py-4 max-sm:flex-col max-sm:items-start'
const timelineItem = 'grid grid-cols-[10rem_minmax(0,1fr)] gap-4 border-t border-border py-4 first:border-t-0 first:pt-0 max-sm:grid-cols-1 max-sm:gap-[0.2rem]'
const when = 'text-[0.85rem] font-semibold text-muted-foreground tabular-nums'
</script>

<template>
  <div>
    <!-- loading: same geometry as the page, so nothing jumps when it arrives -->
    <div v-if="pending && !lawyer" class="grid grid-cols-[minmax(0,1fr)_24rem] gap-[clamp(1.5rem,3vw,2.75rem)] pt-10 max-tab:grid-cols-1" aria-busy="true" aria-label="Loading profile">
      <div class="space-y-6">
        <div class="flex gap-6">
          <Skeleton class="aspect-[4/5] w-[10.5rem] flex-none rounded-[1.75rem] max-sm:w-24" />
          <div class="flex-1 space-y-4 py-2">
            <Skeleton class="h-3 w-28 rounded-full" />
            <Skeleton class="h-10 w-3/4 rounded-full" />
            <Skeleton class="h-4 w-2/3 rounded-full" />
            <Skeleton class="h-4 w-1/2 rounded-full" />
          </div>
        </div>
        <Skeleton class="h-20 w-full rounded-[1.5rem]" />
        <Skeleton class="h-48 w-full rounded-[1.5rem]" />
      </div>
      <Skeleton class="h-[26rem] w-full rounded-[1.75rem]" />
    </div>

    <!-- could not load -->
    <div v-else-if="error || !lawyer" role="alert" class="mt-6 grid justify-items-center gap-[0.8rem] rounded-card border border-dashed border-border px-6 py-[clamp(2.5rem,6vw,4.5rem)] text-center">
      <h1 class="text-[clamp(1.6rem,2.8vw,2.3rem)] leading-[1.02] font-[650] tracking-[-0.035em]">
        {{ errorStatusCode === 403 ? 'This profile is not available.' : 'We could not find that profile.' }}
      </h1>
      <p class="max-w-[30rem] text-muted-foreground">{{ loadErrorMessage }}</p>
      <div class="mt-1 flex flex-wrap justify-center gap-2">
        <Button variant="line" size="pill" @click="refresh()">Try again</Button>
        <Button as-child variant="ink-pill" size="pill">
          <NuxtLink :to="errorBackTo">{{ errorBackLabel }}</NuxtLink>
        </Button>
      </div>
    </div>

    <template v-else>
      <nav aria-label="Breadcrumb" class="flex flex-wrap gap-2 pt-[0.4rem] pb-[1.1rem] text-[0.85rem] font-semibold text-muted-foreground">
        <NuxtLink to="/" class="underline underline-offset-[3px] hover:text-foreground">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/find-lawyers" class="underline underline-offset-[3px] hover:text-foreground">Find a lawyer</NuxtLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page" class="text-foreground">{{ lawyer.name }}</span>
      </nav>

      <p v-if="isOwnProfile" class="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-[1.25rem] bg-mint px-[1.2rem] py-[0.9rem] text-[0.95rem] font-semibold text-deep">
        This is your profile, exactly as clients see it.
        <NuxtLink to="/dashboard/profile" class="underline underline-offset-[3px]">Edit your profile</NuxtLink>
      </p>

      <div class="grid grid-cols-[minmax(0,1fr)_24rem] items-start gap-[clamp(1.5rem,3vw,2.75rem)] max-tab:grid-cols-1">
        <div class="min-w-0">
          <CanopyProfileHead :lawyer="lawyer" :location="location" :years-at-bar="yearsExperience" :accepting="isAcceptingClients" />

          <nav
            v-if="sectionLinks.length > 1"
            aria-label="On this page"
            class="mt-[1.6rem] flex gap-[0.3rem] overflow-x-auto border-b border-border pb-2 text-[0.95rem] font-semibold text-muted-foreground [scrollbar-width:thin]"
          >
            <NuxtLink
              v-for="link in sectionLinks"
              :key="link.id"
              :to="{ hash: `#${link.id}` }"
              class="inline-flex min-h-11 items-center rounded-full px-[0.95rem] whitespace-nowrap transition-colors duration-200 hover:bg-mint hover:text-deep"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <!-- the owner's own empty listing: say what to do next -->
          <section v-if="isOwnProfile && !hasProfileContent" class="mt-[1.6rem] rounded-card border border-dashed border-border px-6 py-8 text-center">
            <h2 class="text-[1.3rem] font-[650] tracking-[-0.02em]">Your profile is still empty</h2>
            <p class="mx-auto mt-2 max-w-md text-muted-foreground">Add a short summary and an about section. Clients decide in the first few seconds.</p>
            <Button as-child variant="line" size="pill-sm" class="mt-4">
              <NuxtLink to="/dashboard/profile#about">Complete your profile</NuxtLink>
            </Button>
          </section>

          <section v-if="about" id="about" :class="block">
            <h2 :class="blockTitle">About</h2>
            <p class="max-w-[42rem] whitespace-pre-line text-muted-foreground">{{ getAboutPreview(about, aboutExpanded) }}</p>
            <button
              v-if="shouldTruncateAbout(about)"
              type="button"
              class="mt-2 min-h-11 cursor-pointer text-[0.92rem] font-semibold underline underline-offset-[3px] hover:text-brand"
              :aria-expanded="aboutExpanded"
              @click="aboutExpanded = !aboutExpanded"
            >
              {{ aboutExpanded ? 'Show less' : 'Read more' }}
            </button>
          </section>

          <section v-if="areas.length" id="practice-areas" :class="block">
            <h2 :class="blockTitle">Practice areas</h2>
            <div class="grid gap-[0.7rem]">
              <article v-for="area in areas" :key="area.id" :class="row">
                <div class="min-w-0">
                  <h3 :class="itemTitle">
                    <NuxtLink :to="{ path: '/find-lawyers', query: { areas: area.id } }" class="hover:text-brand">{{ area.name }}</NuxtLink>
                  </h3>
                  <p v-if="area.description" class="mt-[0.2rem] text-[0.95rem] text-muted-foreground">{{ area.description }}</p>
                </div>
                <span
                  v-if="area.yearsOfExperience > 0"
                  class="flex-none rounded-[0.5rem] border border-border bg-background px-[0.7rem] py-[0.3rem] text-[0.74rem] font-bold tracking-[0.06em] whitespace-nowrap text-deep uppercase"
                >
                  {{ area.yearsOfExperience }} {{ area.yearsOfExperience === 1 ? 'year' : 'years' }}
                </span>
              </article>
            </div>
          </section>

          <section v-if="hours.length" id="availability" :class="block">
            <h2 :class="blockTitle">Availability</h2>
            <dl class="grid max-w-[42rem] grid-cols-2 gap-x-10 max-sm:grid-cols-1">
              <div v-for="entry in hours" :key="entry.day" class="flex justify-between gap-4 border-b border-border py-[0.65rem]">
                <dt class="font-semibold">{{ entry.day }}</dt>
                <dd class="text-right tabular-nums" :class="entry.off ? 'text-placeholder' : 'text-muted-foreground'">{{ entry.time }}</dd>
              </div>
            </dl>
            <p class="mt-[0.7rem] text-[0.85rem] text-muted-foreground">Times are Nigerian time (WAT).</p>
          </section>

          <section v-if="experiences.length" id="experience" :class="block">
            <h2 :class="blockTitle">Experience</h2>
            <ol>
              <li v-for="item in experiences" :key="item.id" :class="timelineItem">
                <div :class="when">{{ formatExperienceRange(item) }}</div>
                <div class="min-w-0">
                  <h3 :class="itemTitle">{{ item.title }}</h3>
                  <p class="mt-[0.15rem] text-[0.95rem] text-muted-foreground">{{ [item.organization, item.location].filter(Boolean).join(' · ') }}</p>
                  <p v-if="item.description?.trim()" class="mt-[0.45rem] whitespace-pre-line text-muted-foreground">{{ item.description }}</p>
                </div>
              </li>
            </ol>
          </section>

          <section v-if="education.length" id="education" :class="block">
            <h2 :class="blockTitle">Education</h2>
            <ol>
              <li v-for="item in education" :key="item.id" :class="timelineItem">
                <div :class="when">{{ formatEducationYears(item) }}</div>
                <div class="min-w-0">
                  <h3 :class="itemTitle">{{ item.school }}</h3>
                  <p v-if="formatEducationSubtitle(item)" class="mt-[0.15rem] text-[0.95rem] text-muted-foreground">{{ formatEducationSubtitle(item) }}</p>
                  <p v-if="item.description?.trim()" class="mt-[0.45rem] whitespace-pre-line text-muted-foreground">{{ item.description }}</p>
                  <!-- for the owner only: visitors should not see editor notes -->
                  <p v-if="isOwnProfile && item.source === 'onboarding'" class="mt-[0.45rem] text-[0.85rem] text-muted-foreground">
                    Taken from your registration. Add the details in the profile editor.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section v-if="licences.length || skills.length" id="licences" :class="block">
            <h2 :class="blockTitle">{{ licences.length ? 'Licences & certifications' : 'Skills' }}</h2>
            <div v-if="licences.length" class="grid gap-[0.7rem]">
              <article v-for="item in licences" :key="item.id" :class="row">
                <div class="min-w-0">
                  <h3 :class="itemTitle">
                    {{ item.name }}<span v-if="item.isVerified" class="ml-[0.6rem] rounded-full bg-mint px-[0.55rem] py-[0.15rem] align-middle font-text text-[0.74rem] font-bold tracking-normal text-deep">Verified</span>
                  </h3>
                  <p class="mt-[0.2rem] text-[0.95rem] text-muted-foreground">
                    {{ [item.issuingOrganization, formatLicenseDates(item), item.credentialId ? `ID ${item.credentialId}` : ''].filter(Boolean).join(' · ') }}
                  </p>
                </div>
                <a
                  v-if="item.credentialUrl"
                  :href="item.credentialUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex min-h-11 flex-none items-center gap-[0.35rem] text-[0.92rem] font-semibold whitespace-nowrap hover:text-brand"
                >
                  View credential<CanopyGlyph name="external" :size="14" /><span class="sr-only">(opens in a new tab)</span>
                </a>
              </article>
            </div>
            <ul v-if="skills.length" aria-label="Skills" class="flex flex-wrap gap-[0.35rem] text-[0.74rem] font-bold tracking-[0.06em] text-deep uppercase" :class="licences.length ? 'mt-4' : ''">
              <li v-for="skill in skills" :key="skill.id" class="rounded-[0.5rem] border border-border bg-card px-[0.6rem] py-[0.28rem]">{{ skill.name }}</li>
            </ul>
          </section>

          <section v-if="publishedArticles.length" id="articles" :class="block">
            <h2 :class="blockTitle">Articles</h2>
            <div class="grid gap-[0.9rem]" :class="publishedArticles.length > 1 ? 'grid-cols-2 max-tab:grid-cols-1' : ''">
              <article v-for="item in publishedArticles" :key="item.id" class="rounded-[1.4rem] border border-border bg-card p-[1.2rem]">
                <p v-if="publishedOn(item.publishedAt)" :class="when">{{ publishedOn(item.publishedAt) }}</p>
                <h3 class="mt-[0.45rem] text-[1.2rem] font-[650] tracking-[-0.02em]">{{ item.title }}</h3>
                <p v-if="item.excerpt?.trim()" class="mt-[0.4rem] text-[0.95rem] text-muted-foreground">{{ item.excerpt }}</p>
                <template v-if="item.body.length > ARTICLE_FOLD || item.excerpt?.trim()">
                  <p v-if="openArticles.has(item.id)" :id="`article-${item.id}`" class="mt-3 whitespace-pre-line text-[0.95rem] text-muted-foreground">{{ item.body }}</p>
                  <button
                    type="button"
                    class="mt-2 min-h-11 cursor-pointer text-[0.92rem] font-semibold underline underline-offset-[3px] hover:text-brand"
                    :aria-expanded="openArticles.has(item.id)"
                    @click="toggleArticle(item.id)"
                  >
                    {{ openArticles.has(item.id) ? 'Show less' : 'Read article' }}
                  </button>
                </template>
                <p v-else class="mt-[0.4rem] whitespace-pre-line text-[0.95rem] text-muted-foreground">{{ item.body }}</p>
              </article>
            </div>
          </section>
        </div>

        <CanopyProfileBookCard
          :lawyer-id="lawyer.id"
          :types="activeConsultationTypes"
          :practice-info="lawyer.practiceInfo"
          :is-authenticated="isAuthenticated"
          :is-own-profile="isOwnProfile"
          @ask="ask"
        />
      </div>

      <CanopyProfileSimilar
        v-if="primaryArea"
        :lawyer-id="lawyer.id"
        :area="primaryArea"
        :state="lawyer.practiceInfo?.officeState ?? ''"
      />

      <!-- phones and tablets: the two actions stay within reach while reading -->
      <div
        v-if="!isOwnProfile"
        class="sticky bottom-0 z-20 -mx-[max(16px,env(safe-area-inset-left,0px))] mt-6 hidden items-center gap-[0.6rem] border-t border-border bg-glass pt-[0.7rem] pb-[calc(0.7rem+env(safe-area-inset-bottom,0px))] backdrop-blur-lg safe-x max-tab:flex"
      >
        <div class="min-w-0 flex-1">
          <template v-if="feeLabel">
            <small class="block text-[0.74rem] text-muted-foreground">Consultation</small>
            <b class="font-display font-[650] whitespace-nowrap">{{ feeLabel }}</b>
          </template>
          <b v-else class="font-display font-[650]">Free to message</b>
        </div>
        <Button variant="line" size="pill-sm" @click="ask">Message</Button>
        <Button v-if="activeConsultationTypes.length" as-child variant="canopy" size="pill-sm">
          <NuxtLink :to="{ hash: '#book' }">Book</NuxtLink>
        </Button>
      </div>

      <AskQuestionSheet v-model:open="askOpen" :lawyer-info="lawyer" />
    </template>
  </div>
</template>
