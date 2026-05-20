<script setup lang="ts">
import { motion } from 'motion-v'
import type { MarketingPracticeArea } from '~/data/marketing-practice-areas'

const props = withDefaults(
  defineProps<{
    areas: MarketingPracticeArea[]
    /** Tailwind ring-offset-* class to match the surrounding section background. */
    ringOffsetClass?: string
  }>(),
  {
    ringOffsetClass: 'ring-offset-background',
  },
)

const emit = defineEmits<{ select: [areaName: string] }>()
</script>

<template>
  <div class="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4" role="list">
    <motion.button
      v-for="(area, i) in props.areas"
      :key="area.id"
      type="button"
      role="listitem"
      :initial="{ opacity: 0, y: 20 }"
      :whileInView="{ opacity: 1, y: 0 }"
      :viewport="{ once: true, margin: '-24px' }"
      :transition="{ duration: 0.38, delay: Math.min(i * 0.03, 0.36), ease: [0.25, 0.46, 0.45, 0.94] }"
      :whileTap="{ scale: 0.985 }"
      class="group relative aspect-4/3 w-full overflow-hidden rounded-[10px] text-left shadow-sm shadow-black/10 outline-none ring-offset-2 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/60 dark:shadow-black/25 dark:hover:shadow-lg"
      :class="props.ringOffsetClass"
      :aria-label="`Browse lawyers for ${area.name}`"
      @click="emit('select', area.name)"
    >
      <img
        :src="area.imageSrc"
        alt=""
        class="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        loading="lazy"
        decoding="async"
        sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-slate-950/82 via-slate-950/48 to-slate-950/28 opacity-95 transition-opacity duration-300 group-hover:opacity-100 dark:from-black/85 dark:via-black/52 dark:to-black/32"
        aria-hidden="true"
      />
      <div class="relative z-10 flex h-full w-full items-center justify-center p-3 sm:p-4">
        <span
          class="text-pretty text-center text-[13px] font-semibold leading-snug tracking-tight text-white antialiased drop-shadow-[0_2px_8px_rgb(0_0_0/0.45)] sm:text-sm md:text-[15px] md:leading-snug lg:text-base lg:leading-snug xl:text-[1.0625rem]"
        >
          {{ area.name }}
        </span>
      </div>
    </motion.button>
  </div>
</template>
