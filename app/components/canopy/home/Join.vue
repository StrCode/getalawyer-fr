<script setup lang="ts">
/** For lawyers: the pitch on the forest panel, the membership card on a photo. */
const perks = [
  'Verified mark on your profile once your checks pass',
  'Turn auto-renew off whenever you like',
  'Switch plan at your next renewal',
]
</script>

<template>
  <section
    id="join"
    data-rise
    data-surface="forest"
    class="grid scroll-mt-24 grid-cols-2 overflow-hidden rounded-panel bg-forest text-white max-tab:grid-cols-1"
  >
    <div class="self-center p-[clamp(1.75rem,5vw,4.5rem)]">
      <div class="text-[0.8125rem] font-bold tracking-[0.08em] text-lime uppercase">For lawyers</div>
      <h2 class="mt-4 text-[clamp(2rem,3.7vw,3.35rem)] leading-[1.02] font-[650] tracking-[-0.035em] text-balance">
        Grow your practice. <em class="text-lime not-italic">Keep every naira you earn.</em>
      </h2>
      <p class="mt-[1.2rem] max-w-[34rem] text-on-forest">Clients find you in the directory and message you directly. One membership, paid for the term you choose, and no commission on your fees.</p>
      <ul class="mt-[1.6rem] grid gap-[0.65rem] font-medium">
        <li v-for="perk in perks" :key="perk" class="flex items-start gap-[0.65rem]">
          <CanopyGlyph name="tick" :stroke="3" class="mt-[0.3rem] flex-none text-lime" />{{ perk }}
        </li>
      </ul>
    </div>
    <div class="relative grid min-h-80 place-items-center p-[clamp(1.1rem,3vw,2.5rem)] max-tab:min-h-64 max-tab:py-6">
      <NuxtImg
        src="/images/canopy/desk.jpg"
        width="1000"
        height="1100"
        sizes="640px"
        alt="A lawyer working at a desk with papers and a laptop"
        loading="lazy"
        class="absolute inset-0 size-full object-cover"
      />
      <span aria-hidden="true" class="absolute inset-0 bg-forest/38" />
      <CanopyPlanCard />
    </div>
  </section>
</template>
