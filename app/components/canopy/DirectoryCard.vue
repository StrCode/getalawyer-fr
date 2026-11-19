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
  <article class="grid grid-cols-[6.5rem_minmax(0,1fr)] grid-rows-[1fr_auto] gap-x-[1.1rem] rounded-card border border-border bg-card p-[1.1rem] transition-[translate,box-shadow,border-color] duration-200 ease-canopy hover:-translate-y-1 hover:shadow-lift max-sm:grid-cols-[4.5rem_minmax(0,1fr)] max-sm:p-[0.95rem]">
    <NuxtLink :to="profile" :aria-label="`${lawyer.name}: view profile`" class="grid aspect-square place-items-center self-start overflow-hidden rounded-[1.2rem] bg-mint">
      <NuxtImg v-if="lawyer.image" :src="lawyer.image" width="208" height="208" sizes="104px" alt="" loading="lazy" class="size-full object-cover object-[50%_20%]" />
      <span v-else aria-hidden="true" class="font-display text-[1.9rem] font-[650] tracking-[-0.03em] text-deep max-sm:text-[1.4rem]">{{ initials }}</span>
    </NuxtLink>

    <div class="min-w-0">
      <p class="text-[0.78rem] font-bold tracking-[0.08em] text-brand uppercase">{{ primaryArea }}</p>
      <h2 class="mt-1 flex items-center gap-[0.45rem] text-[1.35rem] font-[650] tracking-[-0.02em]">
        <NuxtLink :to="profile" class="truncate hover:text-brand">{{ lawyer.name }}</NuxtLink><CanopyVerifiedTick />
      </h2>
      <p class="mt-[0.1rem] text-[0.95rem] text-muted-foreground">
        {{ lawyer.state }}<template v-if="years > 0"> · {{ years }} {{ years === 1 ? 'year' : 'years' }} at the Bar</template>
      </p>
      <p v-if="summary" class="mt-[0.55rem] line-clamp-2 text-[0.97rem]">{{ summary }}</p>
      <ul v-if="otherAreas.length || meeting.length" class="mt-[0.7rem] flex flex-wrap gap-[0.35rem] text-[0.74rem] font-bold tracking-[0.06em] text-deep uppercase">
        <li v-for="area in otherAreas" :key="area" class="rounded-[0.5rem] border border-border bg-background px-[0.6rem] py-[0.28rem]">{{ area }}</li>
        <li v-for="mode in meeting" :key="mode" class="rounded-[0.5rem] border border-border px-[0.6rem] py-[0.28rem]">{{ mode }}</li>
      </ul>
    </div>

    <div class="col-span-2 mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-[0.7rem] border-t border-border pt-[0.9rem]">
      <div v-if="fee != null" class="flex items-baseline gap-[0.6rem] text-[0.9rem] text-muted-foreground">
        <span>Consultation from</span>
        <b class="font-display text-[1.2rem] font-[650] tracking-[-0.02em] text-foreground tabular-nums">{{ fee > 0 ? formatNairaAmount(fee) : 'Free' }}</b>
      </div>
      <p v-else class="text-[0.9rem] text-muted-foreground">Free to message</p>
      <div class="flex items-center gap-[1.1rem] max-sm:w-full max-sm:justify-between">
        <NuxtLink :to="profile" class="text-[0.92rem] font-semibold whitespace-nowrap hover:text-brand">View profile</NuxtLink>
        <Button as-child variant="ink-pill" size="pill-sm" class="max-sm:flex-1">
          <NuxtLink :to="profile">Message free</NuxtLink>
        </Button>
      </div>
    </div>
  </article>
</template>
