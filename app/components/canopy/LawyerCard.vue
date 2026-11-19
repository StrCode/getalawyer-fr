<script setup lang="ts">
import type { LawyerSearchResult } from '~/lib/api'
import { Button } from '@/components/ui/button'

/**
 * A lawyer from the directory. Everyone listed has passed verification, so the
 * mark is an icon beside the name, not a label. The fee line and meeting types
 * render only when the search result carries them.
 */
const props = defineProps<{ lawyer: LawyerSearchResult }>()

const primaryArea = computed(() => props.lawyer.specializations[0]?.name ?? 'Legal services')
const otherAreas = computed(() => props.lawyer.specializations.slice(1, 3).map(s => s.name))
const years = computed(() => Number(props.lawyer.yearsOfExperience) || 0)
const profile = computed(() => `/lawyers/${props.lawyer.id}`)
const MEETING_LABELS: Record<string, string> = { video: 'Video', phone: 'Phone', in_person: 'In person' }
const meeting = computed(() => (props.lawyer.meetingTypes ?? []).map(t => MEETING_LABELS[t]).filter(Boolean))
const fee = computed(() => props.lawyer.consultationFromNaira)
// A narrow card has room for one row: how they meet clients, or their other areas if that is unknown.
const chips = computed(() => (meeting.value.length ? meeting.value : otherAreas.value))
</script>

<template>
  <article
    data-rise
    class="group/card flex flex-col rounded-card border border-border bg-card px-[0.6rem] pt-[0.6rem] pb-[1.1rem] transition-transform duration-[900ms] ease-canopy hover:-translate-y-1.5 hover:shadow-lift max-sm:flex-[0_0_82%] max-sm:snap-start"
  >
    <NuxtLink :to="profile" :aria-label="`${lawyer.name}: view profile`" class="relative block aspect-[6/5] max-w-full overflow-hidden rounded-[1.3rem] bg-mint">
      <NuxtImg
        v-if="lawyer.image"
        :src="lawyer.image"
        width="640"
        height="533"
        sizes="320px"
        alt=""
        loading="lazy"
        class="size-full object-cover transition-transform duration-[900ms] ease-canopy group-hover/card:scale-105"
      />
    </NuxtLink>
    <div class="flex flex-1 flex-col px-[0.55rem] pt-[0.95rem]">
      <p class="text-[0.78rem] font-bold tracking-[0.08em] text-brand uppercase">{{ primaryArea }}</p>
      <h3 class="mt-[0.3rem] flex items-center gap-[0.45rem] text-[1.3rem] font-[650] tracking-[-0.02em]">
        <NuxtLink :to="profile" class="hover:text-brand">{{ lawyer.name }}</NuxtLink><CanopyVerifiedTick />
      </h3>
      <p class="mt-[0.15rem] text-[0.95rem] text-muted-foreground">
        {{ lawyer.state }}<template v-if="years > 0"> · {{ years }} {{ years === 1 ? 'year' : 'years' }} at the Bar</template>
      </p>
      <ul v-if="chips.length" class="mt-[0.8rem] flex flex-wrap gap-[0.35rem] text-[0.74rem] font-bold tracking-[0.06em] text-deep uppercase">
        <li v-for="label in chips" :key="label" class="rounded-[0.5rem] border border-border bg-background px-[0.6rem] py-[0.28rem]">{{ label }}</li>
      </ul>
      <div v-if="fee != null" class="mt-[0.9rem] mb-4 flex items-baseline justify-between gap-2 border-t border-border pt-[0.85rem] text-[0.9rem] text-muted-foreground">
        <span>Consultation from</span>
        <b class="font-display text-[1.15rem] font-[650] tracking-[-0.02em] text-foreground tabular-nums">{{ fee > 0 ? formatNairaAmount(fee) : 'Free' }}</b>
      </div>
      <div class="mt-auto flex items-center gap-[0.9rem]" :class="{ 'pt-4': fee == null }">
        <Button as-child variant="ink-pill" size="pill-sm" class="flex-1">
          <NuxtLink :to="profile">Message free</NuxtLink>
        </Button>
        <NuxtLink :to="profile" class="text-[0.92rem] font-semibold whitespace-nowrap text-foreground hover:text-brand">Profile →</NuxtLink>
      </div>
    </div>
  </article>
</template>
