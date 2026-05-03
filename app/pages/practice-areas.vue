<script setup lang="ts">
import { MARKETING_PRACTICE_AREAS } from '~/data/marketing-practice-areas'

/** Same chrome as the homepage (`AppHeader` + wordmark + marketing nav). */
definePageMeta({
  layout: 'home',
})

useHead({
  title: 'Practice Areas - GetaLawyer',
  meta: [
    {
      name: 'description',
      content:
        'Browse every practice area on GetaLawyer and find verified lawyers by specialty—from family law and immigration to corporate, tax, and more.',
    },
  ],
})

const onSelectArea = (name: string) => {
  navigateTo({
    path: '/find-lawyers',
    ...(name ? { query: { q: name } } : {}),
  })
}
</script>

<template>
  <div class="min-h-screen bg-background pb-16">
    <section
      class="border-border border-b bg-marketing-canvas pb-14 pt-26 dark:bg-muted/40 sm:pt-28"
    >
      <div class="mx-auto max-w-6xl px-6 text-center sm:px-8 lg:px-10">
        <h1 class="text-balance text-3xl font-bold tracking-tight text-foreground md:text-[2rem] lg:text-[2.25rem]">
          All practice areas
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          Explore the full directory of categories. Tap an area to open the lawyer search with that focus, or browse the grid below.
        </p>
      </div>
    </section>

    <section class="py-14 md:py-16">
      <div class="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <PracticeAreasPhotoGrid
          :areas="MARKETING_PRACTICE_AREAS"
          ring-offset-class="ring-offset-background"
          @select="onSelectArea"
        />
      </div>
    </section>

    <FooterSection />
  </div>
</template>
