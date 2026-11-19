<script setup lang="ts">
import { Button } from '@/components/ui/button'

/**
 * Verified directory row. Shows real lawyers only: it needs four listed lawyers
 * with a photo, and renders nothing below that (no stand-ins).
 */
const NEEDED = 4
const { useLawyersList } = useLawyers()
const { data, suspense } = useLawyersList({ limit: 24, sortBy: 'experience' })
// Fetch during server render too, so the row is in the HTML and hydrates cleanly.
onServerPrefetch(async () => {
  await suspense().catch(() => {})
})

const featured = computed(() => (data.value?.results ?? []).filter(l => Boolean(l.image)).slice(0, NEEDED))
const ready = computed(() => featured.value.length >= NEEDED)
defineExpose({ ready })
</script>

<template>
  <section v-if="ready" id="lawyers" class="scroll-mt-24 py-[clamp(3.5rem,7vw,6.5rem)]">
    <CanopySectionHead kicker="Verified directory" title="Real lawyers. Checked before you meet them.">
      <div class="grid min-w-0 flex-[0_1_24rem] justify-items-start gap-[0.9rem]">
        <p class="max-w-[34rem] text-muted-foreground">Nobody is listed until their identity and Supreme Court enrolment are checked. Each profile shows how they meet clients and what a first consultation costs.</p>
        <Button as-child variant="line" size="pill">
          <NuxtLink to="/find-lawyers">Browse all lawyers →</NuxtLink>
        </Button>
      </div>
    </CanopySectionHead>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-[1.1rem] [scrollbar-width:thin] max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:gap-[0.9rem] max-sm:overflow-x-auto max-sm:pb-[0.6rem]">
      <CanopyLawyerCard v-for="lawyer in featured" :key="lawyer.id" :lawyer="lawyer" />
    </div>
  </section>
</template>
