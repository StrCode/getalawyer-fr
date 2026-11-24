<script setup lang="ts">
import { Button } from '@/components/ui/button'

/**
 * For lawyers: one slim green band at the foot of the homepage. The homepage is
 * for people looking for a lawyer, so this only asks the question and points to
 * the way in; plans, prices and the full pitch are on the For lawyers page.
 */
</script>

<template>
  <section
    id="join"
    data-rise
    data-surface="forest"
    aria-labelledby="join-title"
    class="flex scroll-mt-24 flex-wrap items-center justify-between gap-x-10 gap-y-6 rounded-panel bg-forest-night px-6 md:px-8.75 lg:px-11.5 xl:px-14.5 py-6 lg:py-7 xl:py-8.5 text-white max-sm:rounded-2xl"
  >
    <div class="min-w-0 grow basis-88">
      <h2 id="join-title" class="text-2xl md:text-3xl lg:text-4xl leading-none font-normal tracking-tight">Are you a lawyer?</h2>
      <p class="mt-2.5 text-lg text-on-forest">Join getalawyer so clients can find you.</p>
    </div>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Button as-child variant="lime" size="pill" class="max-sm:w-full">
        <NuxtLink to="/register?role=lawyer">Join as a lawyer</NuxtLink>
      </Button>
      <NuxtLink to="/for-lawyers" class="font-medium underline decoration-white/40 underline-offset-5 transition-colors duration-200 hover:decoration-lime">
        See how it works for lawyers
      </NuxtLink>
    </div>
  </section>
</template>
