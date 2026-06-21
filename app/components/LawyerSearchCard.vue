<script setup lang="ts">
import type { LawyerSearchResult } from '~/lib/api'
import {
  PhArrowRight,
  PhBriefcase,
  PhMapPin,
  PhSealCheck,
  PhStar,
  PhUser,
} from '@phosphor-icons/vue'

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
  return (props.lawyer.bio?.trim() || '').trim()
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

async function handleOpenProfile() {
  if (loggedIn.value) {
    await navigateTo(profileHref.value)
    return
  }
  await navigateTo(`/login?redirect=${encodeURIComponent(profileHref.value)}`)
}

</script>

<template>
  <!-- Default grid: Glide-style directory card -->
  <article
    v-if="layout === 'default' && density === 'grid'"
    class="lawyer-search-card group flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xs transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
    :aria-label="`${lawyer.name}, ${lawyer.state}`"
    @click="handleOpenProfile()"
  >
    <div class="mx-auto mb-4">
      <div class="relative size-20 overflow-hidden rounded-full border-2 border-border bg-surface-2 ring-4 ring-surface-2">
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
          class="flex size-full items-center justify-center bg-primary/10 text-lg font-semibold text-primary"
        >
          {{ getInitials(lawyer.name) }}
        </div>
      </div>
    </div>

    <div class="text-center">
      <h3 class="font-display text-balance text-xl font-semibold leading-snug tracking-tight text-foreground">
        {{ lawyer.name }}
      </h3>
      <p class="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <PhMapPin class="size-3.5 shrink-0" aria-hidden="true" />
        {{ lawyer.state }}, {{ lawyer.country }}
      </p>
    </div>

    <div
      v-if="reviewsLabel || ratingPreview != null"
      class="mt-4 flex items-center justify-center gap-1.5 font-mono text-sm tabular-nums"
    >
      <PhStar class="size-4 text-brass" weight="fill" aria-hidden="true" />
      <span v-if="ratingPreview != null" class="font-semibold text-foreground">{{ ratingPreview.toFixed(1) }}</span>
      <span v-if="reviewsLabel" class="text-muted-foreground">{{ reviewsLabel }}</span>
      <span class="text-muted-foreground/50" aria-hidden="true">·</span>
      <span class="text-muted-foreground">{{ lawyer.yearsOfExperience }} yrs exp.</span>
    </div>

    <LawyerSearchCardTail
      class="mt-5 grow"
      :lawyer="lawyer"
      :snippet-source="snippetSource"
      :logged-in="loggedIn"
      :is-pending="isPending"
      density="grid"
      @open-profile="handleOpenProfile"
    />
  </article>

  <!-- Default list row: Upwork-style horizontal card -->
  <article
    v-else-if="layout === 'default' && density === 'row'"
    class="lawyer-search-card group flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xs transition-[box-shadow,border-color] duration-200 hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 sm:flex-row sm:items-start sm:gap-5 sm:p-5"
    :aria-label="`${lawyer.name}, ${lawyer.state}`"
    @click="handleOpenProfile()"
  >
    <div class="relative shrink-0 self-start">
      <div class="size-16 overflow-hidden rounded-2xl border border-border bg-surface-2 sm:size-20">
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
          class="flex size-full items-center justify-center bg-primary/10 text-base font-semibold text-primary sm:text-lg"
        >
          {{ getInitials(lawyer.name) }}
        </div>
      </div>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-balance text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            {{ lawyer.name }}
          </h3>
          <p
            v-if="lawyer.specializations?.[0]?.name"
            class="mt-1 line-clamp-1 text-sm text-primary"
          >
            {{ lawyer.specializations[0].name }}
          </p>
        </div>

        <div
          v-if="reviewsLabel || ratingPreview != null"
          class="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 font-mono text-sm tabular-nums sm:inline-flex"
        >
          <PhStar class="size-3.5 text-brass" weight="fill" aria-hidden="true" />
          <span v-if="ratingPreview != null" class="font-semibold text-foreground">{{ ratingPreview.toFixed(1) }}</span>
          <span v-if="reviewsLabel" class="text-muted-foreground">{{ reviewsLabel }}</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span class="inline-flex max-w-full min-w-0 items-center gap-1.5">
          <PhMapPin class="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
          <span class="min-w-0 truncate">{{ lawyer.state }}, {{ lawyer.country }}</span>
        </span>
        <span class="inline-flex shrink-0 items-center gap-1.5 font-mono tabular-nums">
          <PhBriefcase class="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
          {{ lawyer.yearsOfExperience }} yrs
        </span>
        <span
          v-if="genderLabel"
          class="inline-flex items-center gap-1.5"
        >
          <PhUser class="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
          {{ genderLabel }}
        </span>
      </div>

      <LawyerSearchCardTail
        :lawyer="lawyer"
        :snippet-source="snippetSource"
        :logged-in="loggedIn"
        :is-pending="isPending"
        density="row"
        snippet-class="border-l-primary/40"
        @open-profile="handleOpenProfile"
      />
    </div>

    <div class="hidden shrink-0 self-center sm:flex">
      <span class="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface-2 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground">
        <PhArrowRight class="size-4" aria-hidden="true" />
      </span>
    </div>
  </article>

  <!-- Split: tall media band | body -->
  <article
    v-else-if="layout === 'split'"
    class="lawyer-search-card group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-foreground/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/15 md:flex-row md:items-stretch"
    @click="handleOpenProfile()"
  >
    <div
      class="flex shrink-0 flex-col justify-center gap-4 border-border bg-surface-2/60 p-6 md:w-[34%] md:border-e md:border-b-0 border-b px-8 py-10"
    >
      <div class="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-2xl border border-border md:mx-0 md:max-w-none">
        <img
          v-if="lawyer.image"
          :src="lawyer.image"
          :alt="lawyer.name"
          class="aspect-[3/4] w-full object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex aspect-[3/4] w-full items-center justify-center bg-primary/10 text-3xl font-semibold text-primary md:text-4xl"
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
        <PhSealCheck class="size-4 shrink-0 text-brass" weight="fill" aria-label="NIN verified" />
      </div>
      <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <span class="inline-flex min-w-0 items-center gap-1">
          <PhMapPin class="size-3.5 opacity-80" aria-hidden="true" />
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
    class="lawyer-search-card group/card flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-card-foreground shadow-sm transition-[box-shadow,border-color] hover:border-foreground/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/15"
    tabindex="0"
    @click="handleOpenProfile()"
  >
    <div class="flex items-center gap-3">
      <div class="relative shrink-0">
        <div class="relative size-11 overflow-hidden rounded-xl border border-border bg-surface-2">
          <img
            v-if="lawyer.image"
            :src="lawyer.image"
            class="size-full object-cover"
            :alt="lawyer.name"
            loading="lazy"
          />
          <div
            v-else
            class="flex size-full items-center justify-center bg-primary/10 text-sm font-semibold text-primary"
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
          <PhSealCheck class="size-4 shrink-0 text-brass" weight="fill" aria-label="NIN verified" />
        </div>
        <p class="truncate font-mono text-xs tabular-nums text-muted-foreground">
          {{ metaOneLine }}
        </p>
      </div>
      <PhArrowRight class="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
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
    class="lawyer-search-card group/card relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-foreground/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/15"
    @click="handleOpenProfile()"
  >
    <div
      class="h-1 shrink-0 bg-primary"
      aria-hidden="true"
    />
    <div class="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
      <div class="relative shrink-0">
        <div
          class="relative overflow-hidden rounded-2xl border border-border bg-surface-2"
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
            class="flex size-full items-center justify-center bg-primary/10 text-base font-semibold text-primary sm:text-xl"
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
          <PhSealCheck class="size-4 shrink-0 text-brass" weight="fill" aria-label="NIN verified" />
        </div>
        <p class="font-mono text-xs tabular-nums text-muted-foreground sm:text-sm">
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
    class="lawyer-search-card group relative mx-1 mb-6 mt-8 cursor-pointer rounded-2xl border border-border bg-card pb-5 text-card-foreground shadow-sm transition-[box-shadow,border-color] hover:border-foreground/20 hover:shadow-md focus-within:ring-3 focus-within:ring-primary/15"
    @click="handleOpenProfile()"
  >
    <div
      class="absolute -top-10 left-5 z-10 sm:left-6"
    >
      <div class="relative size-[4.5rem] overflow-hidden rounded-full border-4 border-card bg-surface-2 shadow-sm sm:size-20">
        <img
          v-if="lawyer.image"
          :src="lawyer.image"
          :alt="lawyer.name"
          class="size-full object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex size-full items-center justify-center bg-primary/10 text-xl font-semibold text-primary"
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
        <PhSealCheck class="size-4 shrink-0 text-brass" weight="fill" aria-label="NIN verified" />
      </div>
      <p class="font-mono text-sm tabular-nums text-muted-foreground sm:ps-1">
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
    class="lawyer-search-card group flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-[box-shadow,border-color] hover:border-foreground/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/15 sm:p-5"
    dir="ltr"
    @click="handleOpenProfile()"
  >
    <div class="flex min-w-0 flex-row-reverse items-start gap-3 sm:gap-4">
      <div class="relative shrink-0">
        <div
          class="relative overflow-hidden rounded-2xl border border-border bg-surface-2"
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
            class="flex size-full items-center justify-center bg-primary/10 text-base font-semibold tracking-tight text-primary sm:text-xl"
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
          <span class="inline-flex shrink-0 flex-row-reverse items-center gap-1">
            <PhSealCheck class="size-4 text-brass" weight="fill" aria-label="NIN verified" />
          </span>
        </div>
        <p class="flex flex-row-reverse flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          <span class="inline-flex max-w-full min-w-0 items-center gap-1 truncate flex-row-reverse">
            <PhMapPin class="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
            <span class="truncate">{{ lawyer.state }}, {{ lawyer.country }}</span>
          </span>
          <span class="hidden sm:inline opacity-55" aria-hidden="true">·</span>
          <span class="inline-flex items-center gap-1 whitespace-nowrap flex-row-reverse font-mono tabular-nums">
            {{ lawyer.yearsOfExperience }} yrs
            <PhBriefcase class="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
          </span>
          <template v-if="genderLabel">
            <span class="hidden sm:inline opacity-55" aria-hidden="true">·</span>
            <span class="inline-flex items-center gap-1 whitespace-nowrap flex-row-reverse">
              {{ genderLabel }}
              <PhUser class="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
            </span>
          </template>
          <template v-if="reviewsLabel">
            <span class="hidden sm:inline opacity-55" aria-hidden="true">·</span>
            <span class="inline-flex items-center gap-1 whitespace-nowrap font-mono tabular-nums flex-row-reverse">
              <span>{{ reviewsLabel }}</span>
              <template v-if="ratingPreview != null">
                <span class="opacity-50">·</span>
                <span class="font-medium text-foreground">{{ ratingPreview.toFixed(1) }}</span>
              </template>
              <PhStar class="size-3.5 shrink-0 text-brass" weight="fill" aria-hidden="true" />
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
