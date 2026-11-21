<script setup lang="ts">
import type { LawyerSearchResult } from '~/lib/api'
import { Button } from '@/components/ui/button'

/**
 * A lawyer in the directory results: photo or initials, practice area, name
 * with the verified mark, where they are and how long at the Bar, then the two
 * actions. The summary line, fee and meeting types render only when the search
 * result carries them.
 */
const props = defineProps<{ lawyer: LawyerSearchResult }>()

const profile = computed(() => `/lawyers/${props.lawyer.id}`)
const primaryArea = computed(() => props.lawyer.specializations[0]?.name ?? 'Legal services')
const otherAreas = computed(() => props.lawyer.specializations.slice(1, 3).map(s => s.name))
const years = computed(() => Number(props.lawyer.yearsOfExperience) || 0)
const summary = computed(() => props.lawyer.headline || props.lawyer.bio || '')
const MEETING_LABELS: Record<string, string> = { video: 'Video', phone: 'Phone', in_person: 'In person' }
const meeting = computed(() => (props.lawyer.meetingTypes ?? []).map(t => MEETING_LABELS[t]).filter(Boolean))
const fee = computed(() => props.lawyer.consultationFromNaira)
const initials = computed(() =>
  props.lawyer.name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').toUpperCase().slice(0, 2),
)
</script>

<template>
  <article class="grid grid-cols-[6.5rem_minmax(0,1fr)] grid-rows-[1fr_auto] gap-x-4.5 rounded-card border border-border bg-card p-4.5 transition-[translate,box-shadow,border-color] duration-200 ease-canopy hover:shadow-lift max-sm:grid-cols-[4.5rem_minmax(0,1fr)] max-sm:p-3.75">
    <NuxtLink :to="profile" :aria-label="`${lawyer.name}: view profile`" class="grid aspect-square place-items-center self-start overflow-hidden rounded-card bg-mint">
      <NuxtImg v-if="lawyer.image" :src="lawyer.image" width="208" height="208" sizes="104px" alt="" loading="lazy" class="size-full object-cover object-[50%_20%]" />
      <span v-else aria-hidden="true" class="font-display text-3xl font-normal tracking-tight text-deep max-sm:text-xl">{{ initials }}</span>
    </NuxtLink>

    <div class="min-w-0">
      <p class="text-xs font-medium tracking-widest text-brand uppercase">{{ primaryArea }}</p>
      <h2 class="mt-1 flex items-center gap-1.75 text-xl font-normal tracking-tight">
        <NuxtLink :to="profile" class="truncate hover:text-brand">{{ lawyer.name }}</NuxtLink><CanopyVerifiedTick />
      </h2>
      <p class="mt-0.5 text-base text-muted-foreground">
        {{ lawyer.state }}<template v-if="years > 0"> · {{ years }} {{ years === 1 ? 'year' : 'years' }} at the Bar</template>
      </p>
      <p v-if="summary" class="mt-2.25 line-clamp-2 text-base">{{ summary }}</p>
      <ul v-if="otherAreas.length || meeting.length" class="mt-2.75 flex flex-wrap gap-1.5 text-xs font-medium tracking-wider text-deep uppercase">
        <li v-for="area in otherAreas" :key="area" class="rounded-md border border-border bg-background px-2.5 py-1">{{ area }}</li>
        <li v-for="mode in meeting" :key="mode" class="rounded-md border border-border px-2.5 py-1">{{ mode }}</li>
      </ul>
    </div>

    <div class="col-span-2 mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.75 border-t border-border pt-3.5">
      <div v-if="fee != null" class="flex items-baseline gap-2.5 text-sm text-muted-foreground">
        <span>Consultation from</span>
        <b class="font-display text-lg font-normal tracking-tight text-foreground">{{ fee > 0 ? formatNairaAmount(fee) : 'Free' }}</b>
      </div>
      <p v-else class="text-sm text-muted-foreground">Free to message</p>
      <div class="flex items-center gap-4.5 max-sm:w-full max-sm:justify-between">
        <NuxtLink :to="profile" class="text-base font-medium whitespace-nowrap hover:text-brand">View profile</NuxtLink>
        <Button as-child variant="ink-pill" size="pill-sm" class="max-sm:flex-1">
          <NuxtLink :to="profile">Message free</NuxtLink>
        </Button>
      </div>
    </div>
  </article>
</template>
