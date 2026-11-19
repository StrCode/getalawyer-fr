<script setup lang="ts">
import type { LawyerSearchResult } from '~/lib/api'
import { Button } from '@/components/ui/button'

/**
 * A lawyer from the directory. Everyone listed has passed verification, so the
 * mark is an icon beside the name, not a label. The fee line and meeting types
 * render only when the search result carries them.
 */
const props = defineProps<{
  lawyer: LawyerSearchResult & {
    /** Lowest active consultation price; 0 means a free consultation exists. */
    consultationFromNaira?: number | null
    meetingTypes?: string[]
  }
}>()

const primaryArea = computed(() => props.lawyer.specializations[0]?.name ?? 'Legal services')
const otherAreas = computed(() => props.lawyer.specializations.slice(1, 3).map(s => s.name))
const years = computed(() => props.lawyer.yearsOfExperience)
const profile = computed(() => `/lawyers/${props.lawyer.id}`)
const MEETING_LABELS: Record<string, string> = { video: 'Video', phone: 'Phone', in_person: 'In person' }
const meeting = computed(() => (props.lawyer.meetingTypes ?? []).map(t => MEETING_LABELS[t]).filter(Boolean))
const fee = computed(() => props.lawyer.consultationFromNaira)
</script>

<template>
  <article class="c-lawyer c-rise">
    <NuxtLink class="c-ph" :to="profile" :aria-label="`${lawyer.name}: view profile`">
      <NuxtImg v-if="lawyer.image" :src="lawyer.image" width="640" height="533" sizes="320px" alt="" loading="lazy" />
    </NuxtLink>
    <div class="c-meta">
      <p class="c-area">{{ primaryArea }}</p>
      <h3><NuxtLink :to="profile">{{ lawyer.name }}</NuxtLink><CanopyVerifiedTick /></h3>
      <p class="c-where">
        {{ lawyer.state }}<template v-if="years > 0"> · {{ years }} {{ years === 1 ? 'year' : 'years' }} at the Bar</template>
      </p>
      <ul v-if="otherAreas.length || meeting.length" class="c-creds">
        <li v-for="area in otherAreas" :key="area">{{ area }}</li>
        <li v-for="mode in meeting" :key="mode">{{ mode }}</li>
      </ul>
      <div v-if="fee != null" class="c-fee">
        <span>Consultation from</span><b>{{ fee > 0 ? formatNairaAmount(fee) : 'Free' }}</b>
      </div>
      <div class="c-acts" :class="{ 'pt-4': fee == null }">
        <Button as-child variant="ink-pill" size="pill-sm" class="flex-1">
          <NuxtLink :to="profile">Message free</NuxtLink>
        </Button>
        <NuxtLink class="c-more" :to="profile">Profile →</NuxtLink>
      </div>
    </div>
  </article>
</template>
