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
    <section data-surface="forest" class="relative overflow-hidden rounded-panel bg-forest px-[clamp(1.25rem,4.5vw,4.5rem)] py-[clamp(2.25rem,6vw,5rem)] text-white max-sm:rounded-[1.75rem]">
      <!-- the number, large and quiet, behind the words -->
      <span aria-hidden="true" class="pointer-events-none absolute right-[clamp(-1rem,2vw,3rem)] bottom-[-0.18em] font-display text-[clamp(9rem,26vw,22rem)] leading-none font-bold tracking-[-0.06em] text-white/[0.06] select-none">
        {{ missing ? '404' : '500' }}
      </span>

      <div class="relative max-w-[40rem]">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/14 bg-forest-2 px-[0.9rem] py-[0.4rem] text-[0.85rem] font-semibold">
          <i class="size-2 rounded-full bg-lime" />{{ missing ? 'Error 404' : 'Something went wrong' }}
        </div>

        <template v-if="missing">
          <h1 class="mt-5 text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.02] font-[620] tracking-[-0.04em] text-balance">
            We can’t find <em class="text-lime not-italic">that page.</em>
          </h1>
          <p class="mt-[1.1rem] max-w-[32rem] text-[1.1rem] text-on-forest">
            The link may be out of date, or the page may have moved. The lawyers are still where you left them.
          </p>
          <div class="mt-[1.7rem] flex flex-wrap gap-[0.7rem]">
            <Button as-child variant="lime" size="pill"><NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink></Button>
            <Button as-child variant="on-forest" size="pill"><NuxtLink to="/">Back to home</NuxtLink></Button>
          </div>
        </template>

        <template v-else>
          <h1 class="mt-5 text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.02] font-[620] tracking-[-0.04em] text-balance">
            This page <em class="text-lime not-italic">did not load.</em>
          </h1>
          <p class="mt-[1.1rem] max-w-[32rem] text-[1.1rem] text-on-forest">
            {{ message || 'Something failed on our side. Try again in a moment.' }}
          </p>
          <div class="mt-[1.7rem] flex flex-wrap gap-[0.7rem]">
            <Button variant="lime" size="pill" @click="$emit('retry')">Try again</Button>
            <Button as-child variant="on-forest" size="pill"><NuxtLink to="/">Back to home</NuxtLink></Button>
          </div>
        </template>
      </div>
    </section>

    <nav aria-label="Popular pages" class="mt-[clamp(1.25rem,3vw,2rem)] mb-[clamp(2.5rem,6vw,5rem)] grid grid-cols-4 gap-[0.8rem] max-tab:grid-cols-2 max-sm:grid-cols-1">
      <NuxtLink
        v-for="place in places"
        :key="place.to"
        :to="place.to"
        class="group/place grid content-start gap-[0.5rem] rounded-card border border-border bg-card p-[1.25rem] [transition:border-color_0.2s,transform_0.3s_cubic-bezier(0.22,0.8,0.26,1)] hover:-translate-y-0.5 hover:border-brand"
      >
        <span class="grid size-10 place-items-center rounded-[0.9rem] bg-mint text-deep"><CanopyGlyph :name="place.icon" :size="18" /></span>
        <b class="mt-[0.3rem] flex items-center justify-between gap-2 font-display text-[1.12rem] font-[650] tracking-[-0.02em]">
          {{ place.title }}
          <CanopyGlyph name="arrow" :stroke="2.4" class="text-brand transition-transform duration-300 ease-canopy group-hover/place:translate-x-[3px]" />
        </b>
        <span class="text-[0.92rem] text-muted-foreground">{{ place.body }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
