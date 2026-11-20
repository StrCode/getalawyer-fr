<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { pickTurn } from '~/lib/take-turns'

/**
 * Lawyers on the homepage, with the two checks every lawyer passes before being
 * listed. The cards show real lawyers only: they need four listed lawyers with a
 * photo, and stay away below that (no stand-ins); the heading and checks remain.
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
  <!-- The heading and the two checks always show; the cards join them once there
       are four real lawyers with photos. -->
  <section id="lawyers" class="scroll-mt-24 py-[clamp(3.5rem,7vw,6.5rem)]">
    <CanopySectionHead title="Real lawyers. Checked before you meet them.">
      <div class="grid min-w-0 flex-[0_1_29rem] justify-items-start gap-[0.9rem]">
        <p class="text-muted-foreground">Nobody is listed until we check two things.</p>
        <ul class="grid gap-[0.6rem]">
          <li class="flex items-start gap-[0.7rem]">
            <CanopyVerifiedTick decorative class="mt-[0.2rem]" />
            <span><b class="font-semibold">Who they are.</b> We check their National Identification Number (NIN).</span>
          </li>
          <li class="flex items-start gap-[0.7rem]">
            <CanopyVerifiedTick decorative class="mt-[0.2rem]" />
            <span><b class="font-semibold">That they are a real lawyer.</b> We check their Supreme Court number (SCN).</span>
          </li>
        </ul>
        <Button as-child variant="line" size="pill" class="mt-[0.3rem]">
          <NuxtLink to="/find-lawyers">Browse all lawyers →</NuxtLink>
        </Button>
      </div>
    </CanopySectionHead>
    <div v-if="ready" class="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-[1.1rem] [scrollbar-width:thin] max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:gap-[0.9rem] max-sm:overflow-x-auto max-sm:pb-[0.6rem]">
      <CanopyLawyerCard v-for="lawyer in featured" :key="lawyer.id" :lawyer="lawyer" />
    </div>
  </section>
</template>
