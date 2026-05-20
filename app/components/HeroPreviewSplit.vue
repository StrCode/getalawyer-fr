<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { PhMagnifyingGlass } from '@phosphor-icons/vue'
import { motion } from 'motion-v'
import { ref } from 'vue'
import { lawyersListingQueryFromParts } from '~/composables/useLawyerFilters'

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
  const q = searchQuery.value.trim().replace(/\s+/g, ' ')

  emit('search', {
    practiceArea: q || null,
    location: null,
    consultationType: null,
  })

  const query = lawyersListingQueryFromParts({
    keywords: q || undefined,
  })

  navigateTo({
    path: '/find-lawyers',
    query,
  })
}
</script>

<template>
  <section
    id="hero"
    class="relative scroll-mt-23 overflow-hidden bg-white dark:bg-background"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_0%_0%,rgba(60,132,105,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_0%_0%,rgba(60,132,105,0.1),transparent_50%)]"
    />

    <!-- 55 / 45 split; desktop: fills viewport below fixed AppHeader (`h-23` / 5.75rem + layout spacer). -->
    <div
      class="relative z-10 grid min-h-0 w-full grid-cols-1 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:items-stretch lg:min-h-[calc(100dvh-5.75rem)]"
    >
      <!-- Same horizontal gutters as AppHeader (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`): left inset tracks centered shell on xl+ -->
      <div
        class="flex w-full flex-col justify-center border-b border-neutral-200/90 bg-linear-to-b from-white to-neutral-50/80 pl-4 pr-6 py-14 sm:pl-6 sm:pr-8 sm:py-16 lg:border-b-0 lg:border-r lg:border-neutral-200/90 lg:bg-linear-to-br lg:from-white lg:to-hero-panel-warm/25 lg:py-24 xl:py-28 lg:pr-10 xl:pr-12 dark:border-border dark:from-background dark:to-background dark:lg:to-neutral-950/40 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        <!-- Left rail: thin, low-contrast accent -->
        <div
          class="relative border-l border-primary/20 pl-4 sm:pl-5 lg:pl-6 dark:border-primary/15"
        >
          <motion.div
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            class="mb-3 w-fit"
          >
            <Badge
              variant="outline"
              class="border-primary/15 bg-muted/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/70 shadow-none hover:bg-muted/35 dark:border-primary/20 dark:bg-muted/15 dark:text-primary/65"
            >
              Verified directory
            </Badge>
          </motion.div>

          <motion.h1
            :initial="{ opacity: 0, y: 16 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.05, duration: 0.5 }"
            class="text-balance font-bold leading-[1.04] tracking-[-0.03em] text-neutral-950 text-[2.25rem] sm:text-[2.625rem] md:text-5xl lg:text-[clamp(3rem,5.2vw,3.875rem)] xl:text-[clamp(3.375rem,5vw,4.5rem)] dark:text-foreground"
          >
            Legal help that fits your situation.
          </motion.h1>

          <motion.p
            :initial="{ opacity: 0, y: 12 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.1, duration: 0.45 }"
            class="mt-5 max-w-lg text-pretty text-sm leading-snug text-neutral-600 sm:text-[0.9375rem] sm:leading-relaxed lg:max-w-md dark:text-muted-foreground"
          >
            Every listing shows verified credentials. Compare practice areas and consultation options, then book online with clear pricing and straightforward next steps.
          </motion.p>

          <motion.div
            :initial="{ opacity: 0, y: 12 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.16, duration: 0.4 }"
            class="mt-10 lg:max-w-none"
          >
            <div
              class="grid w-full max-w-4xl grid-cols-1 gap-y-3 gap-x-2 md:grid-cols-[auto_auto_minmax(0,1fr)] md:items-center md:gap-y-1.5 sm:gap-x-3 md:gap-x-4"
            >
              <HomeStackLink
                to="/find-lawyers"
                variant="primary"
                outer-class="col-start-1 row-start-1 inline-flex w-full shrink-0 justify-center md:w-auto md:justify-start"
                inner-class="h-12 w-full px-4 text-sm sm:h-14 sm:px-7 sm:text-base lg:px-9 lg:text-lg"
              >
                Find a lawyer
              </HomeStackLink>

              <span
                class="col-start-1 row-start-2 shrink-0 select-none font-semibold text-[12px] text-neutral-400 uppercase tracking-[0.18em] sm:text-[13px] sm:tracking-[0.2em] md:col-start-2 md:row-start-1 dark:text-muted-foreground"
                aria-hidden="true"
              >
                or
              </span>

              <div
                class="col-start-1 row-start-3 flex min-h-12 w-full items-center gap-1 rounded-xl border border-neutral-200/90 bg-background pl-1 pr-2 py-0.5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.1)] outline-none ring-offset-background transition-shadow focus-within:border-primary/40 focus-within:shadow-[0_4px_20px_-8px_rgba(15,23,42,0.14)] focus-within:ring-2 focus-within:ring-primary/20 sm:min-h-14 sm:pr-3 md:col-start-3 md:row-start-1 dark:border-input dark:bg-input/30 dark:shadow-none dark:focus-within:ring-primary/30"
                role="search"
              >
                <button
                  type="button"
                  class="-ml-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-primary outline-none transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary/30 sm:size-10 dark:hover:bg-neutral-800/80"
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
                class="col-start-1 row-start-4 text-neutral-500 text-xs leading-snug md:col-start-3 md:row-start-2 dark:text-muted-foreground"
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
