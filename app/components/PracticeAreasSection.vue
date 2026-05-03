<script setup lang="ts">
import { motion } from 'motion-v'

interface PracticeArea {
  id: string
  name: string
  /** Editorial photo covering the tile (shown with dark overlay + white title). */
  imageSrc: string
}

const emit = defineEmits<{ selectArea: [areaName: string] }>()

/**
 * Imagery loosely matched to labels; cropped for card aspect.
 * Hosted on Unsplash CDN — replace with your own assets anytime.
 */
const practiceAreas: PracticeArea[] = [
  {
    id: 'accidents-injuries',
    name: 'Accidents & Injuries',
    imageSrc:
      'https://images.unsplash.com/photo-1576091160399-112ba31d7035?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'banking-finance',
    name: 'Banking & Finance',
    imageSrc:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'bankruptcy-debt',
    name: 'Bankruptcy & Debt',
    imageSrc:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'business',
    name: 'Business',
    imageSrc:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'civil-human-rights',
    name: 'Civil & Human Rights',
    imageSrc:
      'https://images.unsplash.com/photo-1505664194779-8beace197937?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'consumer-rights',
    name: 'Consumer Rights',
    imageSrc:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'corporate-commercial',
    name: 'Corporate & Commercial',
    imageSrc:
      'https://images.unsplash.com/photo-1486325212027-8081e485458e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'criminal-defense',
    name: 'Criminal Defense',
    imageSrc:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'employment-labor',
    name: 'Employment & Labor',
    imageSrc:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'energy',
    name: 'Energy',
    imageSrc:
      'https://images.unsplash.com/photo-1466611653911-95081537e17b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'environment-esg',
    name: 'Environment & ESG',
    imageSrc:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'family',
    name: 'Family',
    imageSrc:
      'https://images.unsplash.com/photo-1519744346993-c43e315e2cdc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'immigration',
    name: 'Immigration',
    imageSrc:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'intellectual-property',
    name: 'Intellectual Property',
    imageSrc:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    imageSrc:
      'https://images.unsplash.com/photo-1560518887-ce43359bbc72?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tax',
    name: 'Tax Law',
    imageSrc:
      'https://images.unsplash.com/photo-1554224225-66155e9568d9?auto=format&fit=crop&w=800&q=80',
  },
]
</script>

<template>
  <section
    id="practice-areas"
    class="bg-marketing-canvas py-20 md:py-28 dark:bg-background"
  >
    <div class="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
      <!-- Header (reference: blue eyebrow, strong question, grey subline) -->
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

      <!-- Cards: photographic tiles, dark veil, centred white titles -->
      <div
        class="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
        role="list"
      >
        <motion.button
          v-for="(area, i) in practiceAreas"
          :key="area.id"
          type="button"
          role="listitem"
          :initial="{ opacity: 0, y: 20 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, margin: '-24px' }"
          :transition="{ duration: 0.38, delay: Math.min(i * 0.03, 0.36), ease: [0.25, 0.46, 0.45, 0.94] }"
          :whileTap="{ scale: 0.985 }"
          class="group relative aspect-4/3 w-full overflow-hidden rounded-[10px] text-left shadow-sm shadow-black/10 outline-none ring-offset-2 ring-offset-marketing-canvas transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand/60 dark:ring-offset-background dark:shadow-black/25 dark:hover:shadow-lg"
          :aria-label="`Browse lawyers for ${area.name}`"
          @click="emit('selectArea', area.name)"
        >
          <img
            :src="area.imageSrc"
            alt=""
            class="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            loading="lazy"
            decoding="async"
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
          />
          <!-- Overlay: ~45–55% veil so white centred type reads like the reference -->
          <div
            class="absolute inset-0 bg-linear-to-t from-slate-950/82 via-slate-950/48 to-slate-950/28 opacity-95 transition-opacity duration-300 group-hover:opacity-100 dark:from-black/85 dark:via-black/52 dark:to-black/32"
            aria-hidden="true"
          />
          <div
            class="relative z-10 flex h-full w-full items-center justify-center p-3 sm:p-4"
          >
            <span
              class="text-pretty text-center text-[13px] font-semibold leading-snug tracking-tight text-white antialiased drop-shadow-[0_2px_8px_rgb(0_0_0/0.45)] sm:text-sm md:text-[15px] md:leading-snug lg:text-base lg:leading-snug xl:text-[1.0625rem]"
            >
              {{ area.name }}
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  </section>
</template>
