<script setup lang="ts">
import type { LawyerSearchResult } from '~/lib/api'

/** Layout explorations (+ `default`, directory grid/list). Preview at `/design/lawyer-search-cards`. */
export type LawyerSearchCardLayout =
  | 'default'
  | 'split'
  | 'compact'
  | 'accent'
  | 'profileStrip'
  | 'mirror'

/** Catalog density: tiles in `resultsLayout === 'grid'` vs full-width list rows on `/find-lawyers`. */
export type LawyerSearchCardDensity = 'grid' | 'row'

const props = withDefaults(
  defineProps<{
    lawyer: LawyerSearchResult
    density?: LawyerSearchCardDensity
    layout?: LawyerSearchCardLayout
  }>(),
  { density: 'row', layout: 'default' },
)

const { session, isPending } = useAuth()
const loggedIn = computed(() => !!session.value?.user)

const profileHref = computed(() => `/lawyers/${props.lawyer.id}`)

const snippetSource = computed(() => {
  const bio = props.lawyer.bio?.trim()
  const exp = props.lawyer.experienceDescription?.trim()
  return (bio || exp || '').trim()
})

const genderLabel = computed(() => {
  const g = props.lawyer.gender
  if (g == null || String(g).trim() === '') return null
  const s = String(g).trim().toLowerCase().replace(/\s+/g, '_')
  const map: Record<string, string> = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
    prefer_not_to_say: 'Prefer not to say',
    prefernottosay: 'Prefer not to say',
  }
  return map[s] ?? s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
})

const reviewsLabel = computed(() => {
  const n = props.lawyer.reviewCount
  if (n == null || n < 1) return null
  return n === 1 ? '1 review' : `${n} reviews`
})

const ratingPreview = computed(() => {
  const r = props.lawyer.rating
  if (r == null || Number.isNaN(Number(r))) return null
  return Math.min(5, Math.max(0, Number(r)))
})

/** Single line meta for compact layouts. */
const metaOneLine = computed(() => {
  const parts: string[] = []
  parts.push(`${props.lawyer.state}, ${props.lawyer.country}`)
  parts.push(`${props.lawyer.yearsOfExperience} yrs`)
  if (genderLabel.value) parts.push(genderLabel.value)
  if (reviewsLabel.value) {
    parts.push(
      ratingPreview.value != null
        ? `${ratingPreview.value.toFixed(1)} · ${reviewsLabel.value}`
        : reviewsLabel.value,
    )
  }
  return parts.join(' · ')
})

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarGradient(name: string) {
  const gradients = [
    'linear-gradient(145deg, hsl(239 70% 52%) 0%, hsl(280 50% 42%) 100%)',
    'linear-gradient(145deg, hsl(340 65% 48%) 0%, hsl(280 48% 45%) 100%)',
    'linear-gradient(145deg, hsl(200 85% 42%) 0%, hsl(190 72% 38%) 100%)',
    'linear-gradient(145deg, hsl(158 52% 36%) 0%, hsl(175 62% 32%) 100%)',
    'linear-gradient(145deg, hsl(32 92% 48%) 0%, hsl(16 76% 50%) 100%)',
  ]
  const index = (name.charCodeAt(0) || 0) % gradients.length
  return gradients[index]
}

async function handleOpenProfile() {
  if (loggedIn.value) {
    await navigateTo(profileHref.value)
    return
  }
  await navigateTo(`/login?redirect=${encodeURIComponent(profileHref.value)}`)
}

</script>

<template>
  <!-- Default: avatar + sentence meta beside each other -->
  <article
    v-if="layout === 'default'"
    class="lawyer-search-card border-border/80 hover:border-primary/30 group flex cursor-pointer flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground shadow-xs transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-px hover:shadow-md focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:p-5"
    :aria-label="`${lawyer.name}, ${lawyer.state}`"
    @click="handleOpenProfile()"
  >
    <div class="flex min-w-0 flex-row items-start gap-3 sm:gap-4">
      <div class="relative shrink-0">
        <div
          class="relative overflow-hidden rounded-2xl ring-1 ring-black/6 dark:ring-white/10"
          :class="density === 'grid' ? 'size-16 sm:size-18' : 'size-14.5 sm:size-18'"
        >
          <img
            v-if="lawyer.image"
            :src="lawyer.image"
            :alt="lawyer.name"
            class="size-full object-cover"
            loading="lazy"
            width="80"
            height="80"
          />
          <div
            v-else
            class="flex size-full items-center justify-center text-base font-bold tracking-tight text-white sm:text-xl"
            :style="{ background: getAvatarGradient(lawyer.name) }"
          >
            {{ getInitials(lawyer.name) }}
          </div>
        </div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-2 text-left">
        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 class="text-balance text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            {{ lawyer.name }}
          </h3>
          <span class="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-emerald-300/55 bg-emerald-500/9 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-500/35 dark:bg-emerald-500/12 dark:text-emerald-300">
            <PhIcon name="i-heroicons-check-badge-solid" class="size-3.5" aria-hidden="true" />
            Verified
          </span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span class="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-border/70 bg-muted/35 px-2.5 py-0.5 text-[0.7rem] text-muted-foreground">
            <PhIcon name="i-heroicons-map-pin" class="size-3 shrink-0 opacity-85" aria-hidden="true" />
            <span class="min-w-0 truncate">{{ lawyer.state }}, {{ lawyer.country }}</span>
          </span>
          <span class="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-muted/35 px-2.5 py-0.5 text-[0.7rem] tabular-nums text-muted-foreground">
            <PhIcon name="i-heroicons-briefcase" class="size-3 shrink-0 opacity-85" aria-hidden="true" />
            {{ lawyer.yearsOfExperience }} yrs
          </span>
          <span
            v-if="genderLabel"
            class="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/35 px-2.5 py-0.5 text-[0.7rem] text-muted-foreground"
          >
            <PhIcon name="i-heroicons-user" class="size-3 shrink-0 opacity-85" aria-hidden="true" />
            {{ genderLabel }}
          </span>
          <span
            v-if="reviewsLabel"
            class="inline-flex items-center gap-1 rounded-full border border-amber-200/65 bg-amber-500/8 px-2.5 py-0.5 text-[0.7rem] font-medium tabular-nums text-amber-950 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-300"
          >
            <PhIcon name="i-heroicons-star" class="size-3 shrink-0" aria-hidden="true" />
            <template v-if="ratingPreview != null">{{ ratingPreview.toFixed(1) }}</template>
            <span v-if="ratingPreview != null" class="mx-px opacity-50" aria-hidden="true">·</span>
            {{ reviewsLabel }}
          </span>
        </div>
      </div>
    </div>
    <LawyerSearchCardTail
      :lawyer="lawyer"
      :snippet-source="snippetSource"
      :logged-in="loggedIn"
      :is-pending="isPending"
      :profile-href="profileHref"
      @open-profile="handleOpenProfile"
    />
  </article>

  <!-- Split: tall media band | body -->
  <article
    v-else-if="layout === 'split'"
    class="lawyer-search-card border-border/80 hover:border-primary/25 group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-px hover:shadow-md focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 md:flex-row md:items-stretch"
    @click="handleOpenProfile()"
  >
    <div
      class="flex shrink-0 flex-col justify-center gap-4 border-border/60 bg-linear-to-br from-muted/50 to-muted/20 p-6 md:w-[34%] md:border-e md:border-b-0 border-b px-8 py-10"
    >
      <div class="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-2xl ring-1 ring-black/8 md:mx-0 md:max-w-none">
        <img
          v-if="lawyer.image"
          :src="lawyer.image"
          :alt="lawyer.name"
          class="aspect-[3/4] w-full object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex aspect-[3/4] w-full items-center justify-center text-3xl font-bold text-white md:text-4xl"
          :style="{ background: getAvatarGradient(lawyer.name) }"
        >
          {{ getInitials(lawyer.name) }}
        </div>
      </div>
    </div>
    <div class="flex min-w-0 min-h-0 flex-1 flex-col gap-3 p-4 sm:p-5 md:justify-between">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
        <h3 class="text-pretty text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {{ lawyer.name }}
        </h3>
        <span class="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-emerald-300/55 bg-emerald-500/9 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-500/35 dark:bg-emerald-500/12 dark:text-emerald-300">
          <PhIcon name="i-heroicons-check-badge-solid" class="size-3.5" aria-hidden="true" />
          Verified
        </span>
      </div>
      <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <span class="inline-flex min-w-0 items-center gap-1">
          <PhIcon name="i-heroicons-map-pin" class="size-3.5 opacity-80" aria-hidden="true" />
          {{ lawyer.state }}, {{ lawyer.country }}
        </span>
        <span class="opacity-45">·</span>
        <span>{{ lawyer.yearsOfExperience }} yrs exp.</span>
        <template v-if="genderLabel">
          <span class="opacity-45">·</span>
          {{ genderLabel }}
        </template>
        <template v-if="reviewsLabel">
          <span class="opacity-45">·</span>
          <span class="tabular-nums">{{ ratingPreview != null ? `${ratingPreview.toFixed(1)} · ` : '' }}{{ reviewsLabel }}</span>
        </template>
      </p>
    <LawyerSearchCardTail
      :lawyer="lawyer"
      :snippet-source="snippetSource"
      :logged-in="loggedIn"
      :is-pending="isPending"
      :profile-href="profileHref"
      class="grow"
      snippet-class="rounded-lg border-border/55 border-l-[3px] border-l-primary/45 mt-1"
      @open-profile="handleOpenProfile"
    />
    </div>
  </article>

  <!-- Compact: single dense row; snippet expands on hover/focus-within -->
  <article
    v-else-if="layout === 'compact'"
    class="lawyer-search-card border-border/80 hover:border-primary/35 group/card flex cursor-pointer flex-col gap-2 rounded-xl border bg-card px-3 py-2.5 text-card-foreground shadow-xs ring-offset-background transition-colors hover:bg-muted/[0.28] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    tabindex="0"
    @click="handleOpenProfile()"
  >
    <div class="flex items-center gap-3">
      <div class="relative shrink-0">
        <div class="relative size-11 overflow-hidden rounded-xl ring-1 ring-black/6">
          <img
            v-if="lawyer.image"
            :src="lawyer.image"
            class="size-full object-cover"
            :alt="lawyer.name"
            loading="lazy"
          />
          <div
            v-else
            class="flex size-full items-center justify-center text-sm font-bold text-white"
            :style="{ background: getAvatarGradient(lawyer.name) }"
          >
            {{ getInitials(lawyer.name) }}
          </div>
        </div>
      </div>
      <div class="min-w-0 flex-1 overflow-hidden">
        <div class="flex items-center gap-2">
          <h3 class="truncate text-sm font-semibold tracking-tight text-foreground">
            {{ lawyer.name }}
          </h3>
          <PhIcon name="i-heroicons-check-badge-solid" class="size-4 shrink-0 text-emerald-600" aria-label="Verified" />
        </div>
        <p class="truncate text-xs text-muted-foreground">
          {{ metaOneLine }}
        </p>
      </div>
      <PhIcon name="i-heroicons-arrow-right" class="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
    </div>
    <blockquote
      v-if="snippetSource"
      class="max-h-0 overflow-hidden px-1 text-muted-foreground opacity-0 transition-[max-height,opacity,padding,margin] duration-200 ease-out md:pointer-events-none md:group-hover/card:pointer-events-auto md:group-hover/card:max-h-28 md:group-hover/card:py-2 md:group-hover/card:opacity-100 md:group-focus-within/card:max-h-28 md:group-focus-within/card:opacity-100 md:group-focus-within/card:py-2"
    >
      <p class="line-clamp-3 border-t border-transparent pt-0 text-xs leading-snug md:group-hover/card:border-border/55 md:group-hover/card:pt-2 md:group-focus-within/card:border-border/55 md:group-focus-within/card:pt-2">
        {{ snippetSource }}
      </p>
    </blockquote>
    <LawyerSearchCardTail
      :lawyer="lawyer"
      :snippet-source="snippetSource"
      :logged-in="loggedIn"
      :is-pending="isPending"
      :profile-href="profileHref"
      hide-snippet
      compact-footer
      @open-profile="handleOpenProfile"
    />
  </article>

  <!-- Top accent stripe -->
  <article
    v-else-if="layout === 'accent'"
    class="lawyer-search-card border-border/80 hover:border-primary/35 group/card relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
    @click="handleOpenProfile()"
  >
    <div
      class="h-1.5 shrink-0 bg-linear-to-r from-primary via-teal-500/90 to-chart-5"
      aria-hidden="true"
    />
    <div class="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
      <div class="relative shrink-0">
        <div
          class="relative overflow-hidden rounded-2xl ring-1 ring-black/6 dark:ring-white/10"
          :class="density === 'grid' ? 'size-16 sm:size-[4.5rem]' : 'size-[3.625rem] sm:size-[4.5rem]'"
        >
          <img
            v-if="lawyer.image"
            :src="lawyer.image"
            :alt="lawyer.name"
            class="size-full object-cover"
            loading="lazy"
          />
          <div
            v-else
            class="flex size-full items-center justify-center text-base font-bold text-white sm:text-xl"
            :style="{ background: getAvatarGradient(lawyer.name) }"
          >
            {{ getInitials(lawyer.name) }}
          </div>
        </div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-1.5 text-left">
        <div class="flex flex-wrap items-baseline gap-2">
          <h3 class="text-lg font-semibold leading-snug tracking-tight text-balance text-foreground sm:text-xl">
            {{ lawyer.name }}
          </h3>
          <span class="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-emerald-300/55 bg-emerald-500/9 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-800">
            Verified
          </span>
        </div>
        <p class="text-xs text-muted-foreground sm:text-sm">
          {{ metaOneLine }}
        </p>
      </div>
    </div>
    <div class="border-border/65 border-t px-4 pb-4 sm:px-5">
      <LawyerSearchCardTail
        :lawyer="lawyer"
        :snippet-source="snippetSource"
        :logged-in="loggedIn"
        :is-pending="isPending"
        :profile-href="profileHref"
        snippet-class="mt-4 border-transparent bg-muted/25"
        @open-profile="handleOpenProfile"
      />
    </div>
  </article>

  <!-- Profile strip: pill avatar overlapping top -->
  <article
    v-else-if="layout === 'profileStrip'"
    class="lawyer-search-card border-border/80 hover:border-primary/35 group relative mx-1 mb-6 mt-8 cursor-pointer rounded-2xl border bg-card pb-5 text-card-foreground shadow-xs ring-1 ring-black/4 transition-[box-shadow,transform,border-color] hover:-translate-y-px hover:shadow-md focus-within:ring-2 focus-within:ring-primary/30"
    @click="handleOpenProfile()"
  >
    <div
      class="absolute -top-10 left-5 z-10 sm:left-6"
    >
      <div class="relative size-[4.5rem] overflow-hidden rounded-full ring-4 ring-card shadow-lg sm:size-20">
        <img
          v-if="lawyer.image"
          :src="lawyer.image"
          :alt="lawyer.name"
          class="size-full object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex size-full items-center justify-center text-xl font-bold text-white"
          :style="{ background: getAvatarGradient(lawyer.name) }"
        >
          {{ getInitials(lawyer.name) }}
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-3 pt-12 ps-5 pe-5 sm:pt-14 sm:ps-6 sm:pe-6">
      <div class="flex flex-wrap items-center gap-2 sm:ps-1">
        <h3 class="text-pretty text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {{ lawyer.name }}
        </h3>
        <span class="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-emerald-300/55 bg-emerald-500/9 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-800">
          Verified
        </span>
      </div>
      <p class="text-sm text-muted-foreground sm:ps-1">
        {{ metaOneLine }}
      </p>
      <LawyerSearchCardTail
        :lawyer="lawyer"
        :snippet-source="snippetSource"
        :logged-in="loggedIn"
        :is-pending="isPending"
        :profile-href="profileHref"
        snippet-class="sm:ps-1"
        @open-profile="handleOpenProfile"
      />
    </div>
  </article>

  <!-- Mirror / RTL-ish: avatar on the right -->
  <article
    v-else-if="layout === 'mirror'"
    class="lawyer-search-card border-border/80 hover:border-primary/35 group flex cursor-pointer flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground shadow-xs transition-[box-shadow,transform,border-color] hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 sm:p-5"
    dir="ltr"
    @click="handleOpenProfile()"
  >
    <div class="flex min-w-0 flex-row-reverse items-start gap-3 sm:gap-4">
      <div class="relative shrink-0">
        <div
          class="relative overflow-hidden rounded-2xl ring-1 ring-black/6 dark:ring-white/10"
          :class="density === 'grid' ? 'size-16 sm:size-[4.5rem]' : 'size-[3.625rem] sm:size-[4.5rem]'"
        >
          <img
            v-if="lawyer.image"
            :src="lawyer.image"
            :alt="lawyer.name"
            class="size-full object-cover"
            loading="lazy"
          />
          <div
            v-else
            class="flex size-full items-center justify-center text-base font-bold tracking-tight text-white sm:text-xl"
            :style="{ background: getAvatarGradient(lawyer.name) }"
          >
            {{ getInitials(lawyer.name) }}
          </div>
        </div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col items-end gap-1.5 text-end sm:gap-2">
        <div class="flex flex-row-reverse flex-wrap items-baseline justify-end gap-x-2 gap-y-1">
          <h3 class="text-lg font-semibold leading-snug tracking-tight text-balance text-foreground sm:text-xl">
            {{ lawyer.name }}
          </h3>
          <span class="inline-flex shrink-0 flex-row-reverse items-center gap-0.5 rounded-full border border-emerald-300/55 bg-emerald-500/9 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-800">
            Verified
            <PhIcon name="i-heroicons-check-badge-solid" class="size-3.5" aria-hidden="true" />
          </span>
        </div>
        <p class="flex flex-row-reverse flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          <span class="inline-flex max-w-full min-w-0 items-center gap-1 truncate flex-row-reverse">
            <PhIcon name="i-heroicons-map-pin" class="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
            <span class="truncate">{{ lawyer.state }}, {{ lawyer.country }}</span>
          </span>
          <span class="hidden sm:inline opacity-55" aria-hidden="true">·</span>
          <span class="inline-flex items-center gap-1 whitespace-nowrap flex-row-reverse">
            {{ lawyer.yearsOfExperience }} yrs
            <PhIcon name="i-heroicons-briefcase" class="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
          </span>
          <template v-if="genderLabel">
            <span class="hidden sm:inline opacity-55" aria-hidden="true">·</span>
            <span class="inline-flex items-center gap-1 whitespace-nowrap flex-row-reverse">
              {{ genderLabel }}
              <PhIcon name="i-heroicons-user" class="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
            </span>
          </template>
          <template v-if="reviewsLabel">
            <span class="hidden sm:inline opacity-55" aria-hidden="true">·</span>
            <span class="inline-flex items-center gap-1 whitespace-nowrap tabular-nums flex-row-reverse">
              <span>{{ reviewsLabel }}</span>
              <template v-if="ratingPreview != null">
                <span class="opacity-50">·</span>
                <span class="font-medium text-foreground">{{ ratingPreview.toFixed(1) }}</span>
              </template>
              <PhIcon name="i-heroicons-star" class="size-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            </span>
          </template>
        </p>
      </div>
    </div>
    <LawyerSearchCardTail
      :lawyer="lawyer"
      :snippet-source="snippetSource"
      :logged-in="loggedIn"
      :is-pending="isPending"
      :profile-href="profileHref"
      snippet-class="border-r-[3px] border-r-primary/50 border-l-0 bg-muted/30 text-end [&_p]:text-end"
      @open-profile="handleOpenProfile"
    />
  </article>
</template>
