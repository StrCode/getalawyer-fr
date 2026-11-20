<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { pickTurn } from '~/lib/take-turns'

/**
 * Lawyers on the homepage. Shows real lawyers only: it needs four listed
 * lawyers with a photo, and renders nothing below that (no stand-ins).
 *
 * The four change every hour, working through everyone eligible in turn, so no
 * lawyer holds the homepage. The pool is the first POOL lawyers the directory
 * returns; past that size the turn-taking belongs on the server.
 */
const NEEDED = 4
const POOL = 48
const { useLawyersList } = useLawyers()
const { data, suspense } = useLawyersList({ limit: POOL, sortBy: 'experience' })
// Fetch during server render too, so the row is in the HTML and hydrates cleanly.
onServerPrefetch(async () => {
  await suspense().catch(() => {})
})

// The hour, fixed at server render and reused by the browser, so both pick the same four.
const turn = useState('home-lawyers-turn', () => Math.floor(Date.now() / 3_600_000))

/** Everyone with a photo, in an order that does not depend on experience. */
const eligible = computed(() =>
  (data.value?.results ?? []).filter(l => Boolean(l.image)).sort((a, b) => a.id.localeCompare(b.id)),
)
const featured = computed(() => pickTurn(eligible.value, turn.value, NEEDED))
const ready = computed(() => featured.value.length >= NEEDED)
defineExpose({ ready })
</script>

<template>
  <section v-if="ready" id="lawyers" class="scroll-mt-24 py-[clamp(3.5rem,7vw,6.5rem)]">
    <CanopySectionHead title="Real lawyers. Checked before you meet them.">
      <div class="grid min-w-0 flex-[0_1_24rem] justify-items-start gap-[0.9rem]">
        <p class="max-w-[34rem] text-muted-foreground">Nobody is listed until their identity and Supreme Court enrolment are checked.</p>
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
