<script setup lang="ts">
import { PhMagnifyingGlass } from '@phosphor-icons/vue'
import { motion } from 'motion-v'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Hero image URL; default is `public/images/find-lawyer.png`. */
    heroImageSrc?: string
    heroImageAlt?: string
  }>(),
  {
    heroImageSrc: '/images/find-lawyer.png',
    heroImageAlt:
      'Two professionals shaking hands in a bright office — trust and partnership',
  },
)

const emit = defineEmits<{
  search: [data: { practiceArea: string | null; location: string | null; consultationType: string | null }]
}>()

const searchQuery = ref('')

const runSearch = () => {
  const q = searchQuery.value.trim()
  emit('search', {
    practiceArea: q || null,
    location: null,
    consultationType: null,
  })
  navigateTo({
    path: '/lawyers',
    ...(q ? { query: { q } } : {}),
  })
}
</script>

<template>
  <section
    id="hero"
    class="relative scroll-mt-18 overflow-hidden border-b border-neutral-200/90 bg-white sm:scroll-mt-20 dark:border-border dark:bg-background"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_0%_0%,rgba(60,132,105,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_0%_0%,rgba(60,132,105,0.1),transparent_50%)]"
    />

    <!-- 55 / 45 split: copy + search | image -->
    <div
      class="relative z-10 grid min-h-0 w-full grid-cols-1 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:items-stretch lg:min-h-[min(44rem,calc(100vh-5.5rem))] xl:min-h-[min(48rem,calc(100vh-5rem))]"
    >
      <div
        class="flex w-full flex-col justify-center border-b border-neutral-200/90 bg-linear-to-b from-white to-neutral-50/80 px-6 py-14 sm:px-10 sm:py-16 lg:border-b-0 lg:border-r lg:border-neutral-200/90 lg:bg-linear-to-br lg:from-white lg:to-hero-panel-warm/25 lg:px-12 lg:py-24 xl:px-16 xl:py-28 dark:border-border dark:from-background dark:to-background dark:lg:to-neutral-950/40"
      >
        <!-- Left gutter wrapper (same inset as rail; no visible border stroke) -->
        <div class="relative pl-6 sm:pl-7 lg:pl-8">
          <motion.p
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            class="mb-3 inline-flex w-fit items-center rounded-full bg-brand-soft/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand ring-1 ring-brand/15 dark:bg-brand/15 dark:ring-brand/25"
          >
            Verified directory
          </motion.p>
          <motion.h1
            :initial="{ opacity: 0, y: 16 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.05, duration: 0.5 }"
            class="text-balance font-bold leading-[1.04] tracking-[-0.03em] text-neutral-950 text-[2.25rem] sm:text-5xl lg:text-[clamp(2.75rem,4vw,3.35rem)] xl:text-[clamp(2.85rem,3.6vw,3.5rem)] dark:text-foreground"
          >
            Legal help that fits your situation.
          </motion.h1>
          <motion.p
            :initial="{ opacity: 0, y: 12 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.1, duration: 0.45 }"
            class="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-neutral-600 sm:text-xl dark:text-muted-foreground"
          >
            Browse bar-checked lawyers, compare consultation formats, and book in one place.
          </motion.p>

          <motion.div
            :initial="{ opacity: 0, y: 12 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.16, duration: 0.4 }"
            class="mt-12 lg:max-w-none"
          >
            <div
              class="grid w-full max-w-4xl grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5 sm:gap-x-3 lg:gap-x-4"
            >
              <NuxtLink
                to="/lawyers"
                class="col-start-1 row-start-1 inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-md shadow-brand/25 outline-none transition-[colors,box-shadow,transform] hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/30 active:translate-y-px focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background sm:h-14 sm:px-7 sm:text-base lg:px-9 lg:text-lg"
              >
                Find a lawyer
              </NuxtLink>

              <span
                class="col-start-2 row-start-1 shrink-0 select-none font-semibold text-[12px] text-neutral-400 uppercase tracking-[0.18em] sm:text-[13px] sm:tracking-[0.2em] dark:text-muted-foreground"
                aria-hidden="true"
              >
                or
              </span>

              <div
                class="col-start-3 row-start-1 flex min-h-12 w-full items-center gap-1 rounded-xl border border-neutral-200/90 bg-background pl-1 pr-2 py-0.5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.1)] outline-none ring-offset-background transition-shadow focus-within:border-brand/40 focus-within:shadow-[0_4px_20px_-8px_rgba(15,23,42,0.14)] focus-within:ring-2 focus-within:ring-brand/20 sm:min-h-14 sm:pr-3 dark:border-input dark:bg-input/30 dark:shadow-none dark:focus-within:ring-brand/30"
                role="search"
              >
                <button
                  type="button"
                  class="-ml-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-brand outline-none transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-brand/30 sm:size-10 dark:hover:bg-neutral-800/80"
                  aria-label="Run search"
                  @click="runSearch"
                >
                  <PhMagnifyingGlass class="size-4.5 sm:size-5" weight="regular" aria-hidden="true" />
                </button>
                <input
                  id="hero-directory-search"
                  v-model="searchQuery"
                  type="search"
                  name="q"
                  autocomplete="off"
                  aria-label="Search directory"
                  placeholder="Browse by city or topic"
                  class="min-h-10 min-w-0 flex-1 border-0 bg-transparent py-2 pr-1 text-neutral-950 text-sm outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-foreground sm:min-h-11 sm:pr-2 sm:text-base [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
                  @keydown.enter.prevent="runSearch"
                >
              </div>

              <p
                class="col-start-3 row-start-2 text-neutral-500 text-xs leading-snug dark:text-muted-foreground"
              >
                Press Enter or tap the icon to search.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div class="relative min-h-[280px] w-full bg-neutral-100 sm:min-h-[320px] lg:min-h-0 dark:bg-neutral-950">
        <motion.div
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ delay: 0.06, duration: 0.45 }"
          class="absolute inset-0"
        >
          <img
            :src="props.heroImageSrc"
            :alt="props.heroImageAlt"
            width="1600"
            height="900"
            class="h-full w-full object-cover object-[center_28%]"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
          <div
            class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent lg:from-black/5 dark:from-black/20"
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </div>
  </section>
</template>
