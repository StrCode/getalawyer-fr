<script setup lang="ts">
import { MARKETING_PRACTICE_AREAS } from '~/data/marketing-practice-areas'
import { motion } from 'motion-v'
import { PhArrowRight, PhSquaresFour } from '@phosphor-icons/vue'

const emit = defineEmits<{ selectArea: [areaName: string] }>()
</script>

<template>
  <section
    id="practice-areas"
    class="bg-marketing-canvas py-20 md:py-28 dark:bg-background"
  >
    <div class="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
      <!-- Header (reference: brand eyebrow, strong question, grey subline) -->
      <div class="mb-12 text-center md:mb-14">
        <motion.p
          :initial="{ opacity: 0, y: 10 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.4 }"
          class="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-brand sm:text-xs dark:text-brand/90"
        >
          Practice areas
        </motion.p>
        <motion.h2
          :initial="{ opacity: 0, y: 14 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: 0.06 }"
          class="mb-4 text-balance text-[1.75rem] font-bold leading-tight tracking-tight text-foreground sm:text-[2rem] md:text-[2.25rem]"
        >
          Not sure what service you need?
        </motion.h2>
        <motion.p
          :initial="{ opacity: 0, y: 10 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.45, delay: 0.1 }"
          class="mx-auto max-w-xl text-pretty text-base text-muted-foreground md:text-lg"
        >
          Browse law firms by practice area.
        </motion.p>
      </div>

      <PracticeAreasPhotoGrid
        :areas="MARKETING_PRACTICE_AREAS"
        ring-offset-class="ring-offset-marketing-canvas dark:ring-offset-background"
        @select="emit('selectArea', $event)"
      />

      <motion.div
        class="mt-10 flex justify-center sm:mt-12"
        :initial="{ opacity: 0, y: 12 }"
        :whileInView="{ opacity: 1, y: 0 }"
        :viewport="{ once: true }"
        :transition="{ duration: 0.4, delay: 0.08 }"
      >
        <HomeStackLink
          to="/practice-areas"
          variant="ghost"
          inner-class="min-h-12 px-6 py-3 text-base sm:min-h-14 sm:px-7 sm:text-[1.0625rem]"
        >
          <PhSquaresFour class="size-5 shrink-0 text-brand" weight="duotone" aria-hidden="true" />
          View all practice areas
          <PhArrowRight class="size-4 shrink-0 text-brand" weight="bold" aria-hidden="true" />
        </HomeStackLink>
      </motion.div>
    </div>
  </section>
</template>
