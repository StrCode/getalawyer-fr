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
    class="flex scroll-mt-24 flex-wrap items-center justify-between gap-x-10 gap-y-6 rounded-panel bg-forest px-[clamp(1.5rem,4.5vw,4.5rem)] py-[clamp(1.75rem,3.2vw,2.75rem)] text-white max-sm:rounded-[1.75rem]"
  >
    <div class="min-w-0 flex-[1_1_22rem]">
      <h2 id="join-title" class="text-[clamp(1.65rem,2.6vw,2.25rem)] leading-[1.05] font-[650] tracking-[-0.035em]">Are you a lawyer?</h2>
      <p class="mt-[0.6rem] text-[1.1rem] text-on-forest">Join getalawyer so clients can find you.</p>
    </div>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Button as-child variant="lime" size="pill" class="max-sm:w-full">
        <NuxtLink to="/register?role=lawyer">Join as a lawyer</NuxtLink>
      </Button>
      <NuxtLink to="/for-lawyers" class="font-semibold underline decoration-white/40 underline-offset-[5px] transition-colors duration-200 hover:decoration-lime">
        See how it works for lawyers
      </NuxtLink>
    </div>
  </section>
</template>
