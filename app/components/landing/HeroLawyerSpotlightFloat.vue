<script setup lang="ts">
import HeroLawyerSpotlightCard from '~/components/landing/HeroLawyerSpotlightCard.vue'
import { HERO_SPOTLIGHT_LAWYERS } from '~/lib/hero-spotlight-lawyers'

const floatSlots = [
  { tiltClass: '-rotate-2', positionClass: 'top-[8%] left-[0.5%] xl:left-[3%] 2xl:left-[7%]' },
  { tiltClass: 'rotate-1', positionClass: 'top-[12%] right-[0.5%] xl:right-[3%] 2xl:right-[7%]' },
  { tiltClass: 'rotate-2', positionClass: 'bottom-[20%] left-0 xl:left-[1.5%] 2xl:left-[5%]' },
  { tiltClass: '-rotate-1', positionClass: 'bottom-[16%] right-0 xl:right-[1.5%] 2xl:right-[5%]' },
] as const
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-0 hidden lg:block">
    <div
      v-for="(lawyer, index) in HERO_SPOTLIGHT_LAWYERS"
      :key="lawyer.id"
      class="hero-spotlight-enter pointer-events-none absolute"
      :class="floatSlots[index]?.positionClass"
      :style="{ animationDelay: `${120 + index * 90}ms` }"
    >
      <HeroLawyerSpotlightCard
        :lawyer="lawyer"
        :tilt-class="floatSlots[index]?.tiltClass"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes heroSpotlightEnter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-spotlight-enter {
  animation: heroSpotlightEnter 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .hero-spotlight-enter {
    animation: none;
  }
}
</style>
