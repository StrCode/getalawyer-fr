<script setup lang="ts">
import type { LawyerSearchResult } from '~/lib/api'

/**
 * A lawyer on the homepage: a photo, who they are, what they do and where.
 * Everyone listed has passed verification, so the mark is an icon beside the
 * name, not a label. The whole card opens the profile; fees and how they meet
 * clients are on the profile and in the directory, not here.
 */
const props = defineProps<{ lawyer: LawyerSearchResult }>()

const primaryArea = computed(() => props.lawyer.specializations[0]?.name ?? 'Legal services')
const years = computed(() => Number(props.lawyer.yearsOfExperience) || 0)
const profile = computed(() => `/lawyers/${props.lawyer.id}`)
</script>

<template>
  <article
    data-rise
    class="group/card relative flex flex-col rounded-card border border-border bg-card px-2.5 pt-2.5 pb-4.5 transition-[translate,box-shadow,border-color] duration-200 ease-canopy hover:border-primary hover:shadow-lift has-[a:focus-visible]:border-primary max-sm:flex-[0_0_82%] max-sm:snap-start"
  >
    <div class="relative aspect-6/5 max-w-full overflow-hidden rounded-card bg-mint">
      <NuxtImg
        v-if="lawyer.image"
        :src="lawyer.image"
        width="640"
        height="533"
        sizes="320px"
        alt=""
        loading="lazy"
        class="size-full object-cover transition-transform duration-300 ease-canopy group-hover/card:scale-[1.03]"
      />
    </div>
    <div class="flex flex-1 flex-col px-2.25 pt-3.75">
      <p class="text-xs font-medium tracking-widest text-brand uppercase">{{ primaryArea }}</p>
      <h3 class="mt-1.25 flex items-center gap-1.75 text-xl font-normal tracking-tight">
        <!-- the link covers the whole card, so anywhere on it opens the profile -->
        <NuxtLink :to="profile" class="after:absolute after:inset-0 after:rounded-card focus-visible:outline-hidden">{{ lawyer.name }}</NuxtLink><CanopyVerifiedTick />
      </h3>
      <p class="mt-0.5 text-base text-muted-foreground">
        {{ lawyer.state }}<template v-if="years > 0"> · {{ years }} {{ years === 1 ? 'year' : 'years' }} at the Bar</template>
      </p>
      <span aria-hidden="true" class="mt-auto inline-flex items-center gap-1.5 pt-4 text-base font-medium text-brand">
        View profile
        <CanopyGlyph name="arrow" :stroke="2.2" class="transition-transform duration-200 ease-canopy group-hover/card:translate-x-0.75" />
      </span>
    </div>
  </article>
</template>
