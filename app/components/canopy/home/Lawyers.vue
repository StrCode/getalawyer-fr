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
  <section v-if="ready" id="lawyers" class="c-sec">
    <div class="c-sec-head">
      <div>
        <div class="c-kicker">Verified directory</div>
        <h2 class="c-display">Real lawyers. Checked before you meet them.</h2>
      </div>
      <div class="c-side">
        <p class="c-lede">Nobody is listed until their identity and Supreme Court enrolment are checked. Each profile shows how they meet clients and what a first consultation costs.</p>
        <Button as-child variant="line" size="pill">
          <NuxtLink to="/find-lawyers">Browse all lawyers →</NuxtLink>
        </Button>
      </div>
    </div>
    <div class="c-cards">
      <CanopyLawyerCard v-for="lawyer in featured" :key="lawyer.id" :lawyer="lawyer" />
    </div>
  </section>
</template>
