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
    class="group/card relative flex flex-col rounded-card border border-border bg-card px-[0.6rem] pt-[0.6rem] pb-[1.1rem] transition-[translate,box-shadow,border-color] duration-200 ease-canopy hover:-translate-y-1 hover:border-primary hover:shadow-lift has-[a:focus-visible]:border-primary max-sm:flex-[0_0_82%] max-sm:snap-start"
  >
    <div class="relative aspect-[6/5] max-w-full overflow-hidden rounded-[1.3rem] bg-mint">
      <NuxtImg
        v-if="lawyer.image"
        :src="lawyer.image"
        width="640"
        height="533"
        sizes="320px"
        alt=""
        loading="lazy"
        class="size-full object-cover transition-[scale] duration-300 ease-canopy group-hover/card:scale-[1.03]"
      />
    </div>
    <div class="flex flex-1 flex-col px-[0.55rem] pt-[0.95rem]">
      <p class="text-[0.78rem] font-bold tracking-[0.08em] text-brand uppercase">{{ primaryArea }}</p>
      <h3 class="mt-[0.3rem] flex items-center gap-[0.45rem] text-[1.3rem] font-[650] tracking-[-0.02em]">
        <!-- the link covers the whole card, so anywhere on it opens the profile -->
        <NuxtLink :to="profile" class="after:absolute after:inset-0 after:rounded-card focus-visible:outline-hidden">{{ lawyer.name }}</NuxtLink><CanopyVerifiedTick />
      </h3>
      <p class="mt-[0.15rem] text-[0.95rem] text-muted-foreground">
        {{ lawyer.state }}<template v-if="years > 0"> · {{ years }} {{ years === 1 ? 'year' : 'years' }} at the Bar</template>
      </p>
      <span aria-hidden="true" class="mt-auto inline-flex items-center gap-[0.4rem] pt-4 text-[0.95rem] font-semibold text-brand">
        View profile
        <CanopyGlyph name="arrow" :stroke="2.2" class="transition-[translate] duration-200 ease-canopy group-hover/card:translate-x-[3px]" />
      </span>
    </div>
  </article>
</template>
