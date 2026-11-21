<script setup lang="ts">
import { Button } from '@/components/ui/button'

/**
 * What a visitor sees when an address does not exist (`missing`) or a page
 * failed to load, in the Canopy design: a forest panel that says so, then the
 * places most people were trying to reach. Used by the catch-all page and by
 * error.vue, both inside the site layout, so the menu and footer are there too.
 */
const props = withDefaults(defineProps<{
  kind?: 'missing' | 'failed'
  /** What went wrong, for a page that failed to load. */
  message?: string
}>(), { kind: 'missing', message: '' })

defineEmits<{ retry: [] }>()

const missing = computed(() => props.kind === 'missing')

/** Where most people who land here were trying to go. */
const places = [
  { title: 'Find a lawyer', body: 'Search verified lawyers by practice area and state.', to: '/find-lawyers', icon: 'search' as const },
  { title: 'Practice areas', body: 'See what each area of law covers.', to: '/practice-areas', icon: 'scales' as const },
  { title: 'For lawyers', body: 'Join the directory and get client enquiries.', to: '/for-lawyers', icon: 'office' as const },
  { title: 'Contact', body: 'Tell us what you were looking for.', to: '/contact', icon: 'mail' as const },
]
</script>

<template>
  <div>
    <section data-surface="forest" class="relative overflow-hidden rounded-panel bg-forest px-5 md:px-8.75 lg:px-11.5 xl:px-14.5 py-9 md:py-11.5 lg:py-15.25 xl:py-19.25 text-white max-sm:rounded-2xl">
      <!-- the number, large and quiet, behind the words -->
      <span aria-hidden="true" class="pointer-events-none absolute right-[clamp(-1rem,2vw,3rem)] bottom-[-0.18em] font-display text-9xl leading-none font-medium tracking-tighter text-white/[0.06] select-none">
        {{ missing ? '404' : '500' }}
      </span>

      <div class="relative max-w-160">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/14 bg-forest-2 px-3.5 py-1.5 text-sm font-medium">
          <i class="size-2 rounded-full bg-lime" />{{ missing ? 'Error 404' : 'Something went wrong' }}
        </div>

        <template v-if="missing">
          <h1 class="mt-5 text-4xl md:text-5xl lg:text-6xl leading-none font-normal tracking-tighter text-balance">
            We can’t find <em class="text-lime not-italic">that page.</em>
          </h1>
          <p class="mt-4.5 max-w-128 text-lg text-on-forest">
            The link may be out of date, or the page may have moved. The lawyers are still where you left them.
          </p>
          <div class="mt-6.75 flex flex-wrap gap-2.75">
            <Button as-child variant="lime" size="pill"><NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink></Button>
            <Button as-child variant="on-forest" size="pill"><NuxtLink to="/">Back to home</NuxtLink></Button>
          </div>
        </template>

        <template v-else>
          <h1 class="mt-5 text-4xl md:text-5xl lg:text-6xl leading-none font-normal tracking-tighter text-balance">
            This page <em class="text-lime not-italic">did not load.</em>
          </h1>
          <p class="mt-4.5 max-w-128 text-lg text-on-forest">
            {{ message || 'Something failed on our side. Try again in a moment.' }}
          </p>
          <div class="mt-6.75 flex flex-wrap gap-2.75">
            <Button variant="lime" size="pill" @click="$emit('retry')">Try again</Button>
            <Button as-child variant="on-forest" size="pill"><NuxtLink to="/">Back to home</NuxtLink></Button>
          </div>
        </template>
      </div>
    </section>

    <nav aria-label="Popular pages" class="mt-5 md:mt-5.75 lg:mt-7.75 xl:mt-8 mb-10 md:mb-11.5 lg:mb-15.25 xl:mb-19.25 grid grid-cols-4 gap-3.25 max-tab:grid-cols-2 max-sm:grid-cols-1">
      <NuxtLink
        v-for="place in places"
        :key="place.to"
        :to="place.to"
        class="group/place grid content-start gap-2 rounded-card border border-border bg-card p-5 transition-[translate,box-shadow,border-color] duration-200 ease-canopy hover:border-brand"
      >
        <span class="grid size-10 place-items-center rounded-md bg-mint text-deep"><CanopyGlyph :name="place.icon" :size="18" /></span>
        <b class="mt-1.25 flex items-center justify-between gap-2 font-display text-lg font-normal tracking-tight">
          {{ place.title }}
          <CanopyGlyph name="arrow" :stroke="2.4" class="text-brand transition-transform duration-200 ease-canopy group-hover/place:translate-x-0.75" />
        </b>
        <span class="text-base text-muted-foreground">{{ place.body }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
