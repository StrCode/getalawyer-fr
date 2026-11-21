<script setup lang="ts">
import { Button } from '@/components/ui/button'

/**
 * "More family lawyers in Lagos": up to three other listed lawyers in the same
 * practice area and state as the profile being read, or in the same area
 * anywhere when the state has no one else. Renders nothing when there are none.
 */
const props = defineProps<{
  lawyerId: string
  area: { id: string, name: string }
  state: string
}>()

const SHOWN = 3
/** Same state first; if nobody else is listed there, the same area anywhere. */
const everywhere = ref(!props.state)
const { useLawyersList } = useLawyers()
const { data, suspense } = useLawyersList(computed(() => ({
  specializations: [props.area.id],
  ...(everywhere.value ? {} : { state: props.state }),
  // One spare in case this lawyer is among the results; 5 is the endpoint's minimum.
  limit: 5,
  sortBy: 'experience' as const,
})))

const others = computed(() => (data.value?.results ?? []).filter(lawyer => lawyer.id !== props.lawyerId).slice(0, SHOWN))
watch(data, (result) => {
  if (result && !everywhere.value && others.value.length === 0) everywhere.value = true
}, { immediate: true })
onServerPrefetch(async () => {
  await suspense().catch(() => {})
  // The widened search has a new key; wait for that one too.
  if (everywhere.value) await suspense().catch(() => {})
})

/** "Family law" → "family", "Property & tenancy" → "property & tenancy". */
const areaWords = computed(() => {
  const name = props.area.name.replace(/\s+law$/i, '')
  return name.charAt(0).toLowerCase() + name.slice(1)
})
const title = computed(() => `More ${areaWords.value} lawyers${everywhere.value ? '' : ` in ${props.state}`}`)
const seeAll = computed(() => ({
  path: '/find-lawyers',
  query: { areas: props.area.id, ...(everywhere.value ? {} : { location: props.state }) },
}))

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').toUpperCase().slice(0, 2)
}
function line(lawyer: { state?: string, yearsOfExperience?: number | string, specializations: Array<{ name: string }> }) {
  const years = Number(lawyer.yearsOfExperience) || 0
  return [
    // Every result practises in this area, though it may not be the first they list.
    props.area.name,
    lawyer.state,
    years > 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : '',
  ].filter(Boolean).join(' · ')
}
</script>

<template>
  <section v-if="others.length" class="pt-[clamp(2.5rem,5vw,4rem)]">
    <div class="mb-[1.2rem] flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <h2 class="text-[clamp(1.5rem,2.3vw,1.95rem)] leading-[1.05] font-[650] tracking-[-0.035em] text-balance">{{ title }}</h2>
      <Button as-child variant="line" size="pill-sm">
        <NuxtLink :to="seeAll">See all →</NuxtLink>
      </Button>
    </div>
    <div class="grid grid-cols-3 gap-[0.9rem] max-tab:grid-cols-1">
      <NuxtLink
        v-for="lawyer in others"
        :key="lawyer.id"
        :to="`/lawyers/${lawyer.id}`"
        class="flex items-center gap-[0.9rem] rounded-[1.4rem] border border-border bg-card p-[0.9rem] transition-[translate,box-shadow,border-color] duration-200 ease-canopy hover:-translate-y-[3px] hover:border-brand"
      >
        <span class="grid size-[3.4rem] flex-none place-items-center overflow-hidden rounded-[1rem] bg-mint">
          <NuxtImg v-if="lawyer.image" :src="lawyer.image" width="108" height="108" alt="" loading="lazy" class="size-full object-cover object-[50%_20%]" />
          <span v-else aria-hidden="true" class="font-display text-[1.15rem] font-[650] text-deep">{{ initials(lawyer.name) }}</span>
        </span>
        <span class="min-w-0">
          <b class="block truncate">{{ lawyer.name }}</b>
          <small class="block truncate text-[0.85rem] text-muted-foreground">{{ line(lawyer) }}</small>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>
