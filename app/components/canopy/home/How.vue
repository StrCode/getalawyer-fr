<script setup lang="ts">
import { Button } from '@/components/ui/button'
/** "How it works": three connected steps, each with a small product view and a cost tag. */

// Class lists shared by the three steps (full strings, so Tailwind sees them).
const step = 'flex flex-col rounded-card border border-border bg-card p-[1.4rem]'
const number = 'grid size-10 flex-none place-items-center rounded-full bg-mint font-display text-[1.15rem] font-bold text-deep'
const cost = 'rounded-[0.5rem] border px-[0.65rem] py-[0.3rem] text-[0.74rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase'
const costFree = 'border-border bg-background text-deep'
const demo = 'mt-[1.1rem] flex min-h-[9.5rem] flex-col justify-center gap-[0.65rem] rounded-[1.2rem] bg-background p-4 text-[0.9rem]'
const title = 'mt-[1.1rem] text-[1.35rem] font-[650] tracking-[-0.02em]'
const body = 'mt-[0.4rem] text-[1rem] text-muted-foreground'
</script>

<template>
  <section id="how" class="scroll-mt-24 pb-[clamp(3.5rem,7vw,6.5rem)]">
    <CanopySectionHead kicker="How it works" title="Three steps. You only pay at the last one.">
      <div class="grid min-w-0 flex-[0_1_24rem] justify-items-start gap-[0.9rem]">
        <p class="max-w-[34rem] text-muted-foreground">Searching and asking are free. A fee comes in only when you book a consultation, and you see it before you confirm.</p>
        <Button as-child variant="line" size="pill">
          <NuxtLink to="/find-lawyers">Start a search →</NuxtLink>
        </Button>
      </div>
    </CanopySectionHead>

    <ol class="grid grid-cols-[repeat(auto-fit,minmax(17rem,1fr))] gap-[1.1rem]">
      <li data-rise :class="step">
        <div class="flex items-center gap-3"><span :class="number">1</span><i class="h-px flex-1 bg-border" /><span :class="[cost, costFree]">Free</span></div>
        <div aria-hidden="true" :class="demo">
          <div class="flex items-center gap-2 rounded-full border border-border bg-card py-[0.6rem] pr-[0.6rem] pl-[0.85rem] font-semibold">
            <CanopyGlyph name="search" :stroke="2.2" class="flex-none text-muted-foreground" />Tenancy dispute
            <span class="ml-auto rounded-full bg-mint px-[0.6rem] py-[0.15rem] text-[0.78rem] text-deep">Lagos</span>
          </div>
          <div class="flex items-center gap-[0.6rem] pl-[0.3rem] text-muted-foreground">
            <span class="flex">
              <i
                v-for="(initials, index) in ['AO', 'CN', 'FB']"
                :key="initials"
                class="grid size-8 place-items-center rounded-full border-2 border-background bg-mint text-[0.62rem] font-bold text-deep not-italic"
                :class="{ '-ml-[0.55rem]': index > 0 }"
              >{{ initials }}</i>
            </span>
            <span>Verified lawyers who match</span>
          </div>
        </div>
        <h3 :class="title">Find your lawyer</h3>
        <p :class="body">Search by practice area and state, then compare experience, meeting options and fees.</p>
      </li>

      <li data-rise :class="step">
        <div class="flex items-center gap-3"><span :class="number">2</span><i class="h-px flex-1 bg-border" /><span :class="[cost, costFree]">Free</span></div>
        <div aria-hidden="true" :class="demo">
          <p class="mt-[0.4rem] max-w-[92%] self-end rounded-[1.1rem] rounded-br-[0.3rem] bg-primary px-[0.9rem] py-[0.65rem] text-[0.9rem] leading-[1.4] text-white">Can I end my tenancy early without losing my deposit?</p>
          <div class="flex items-center justify-between gap-2 rounded-full border border-border bg-card py-[0.35rem] pr-[0.35rem] pl-[0.95rem] text-placeholder">
            <span>Write a message…</span>
            <span class="grid size-[1.9rem] flex-none place-items-center rounded-full bg-primary text-white"><CanopyGlyph name="arrow" :size="14" :stroke="2.8" /></span>
          </div>
        </div>
        <h3 :class="title">Ask your question</h3>
        <p :class="body">Message the lawyer directly and get a first answer before you commit to anything.</p>
      </li>

      <li data-rise :class="step">
        <div class="flex items-center gap-3"><span :class="number">3</span><i class="h-px flex-1 bg-border" /><span :class="[cost, 'border-lime bg-lime text-night']">Fee agreed first</span></div>
        <div aria-hidden="true" :class="demo">
          <div class="flex items-center gap-[0.7rem]">
            <span class="grid size-[1.9rem] flex-none place-items-center rounded-full bg-primary text-white"><CanopyGlyph name="tick" :size="14" :stroke="3.2" /></span>
            <div><b class="block">Thu 19 Nov, 10:30 AM</b><small class="text-[0.8rem] text-muted-foreground">Video call with your lawyer</small></div>
          </div>
          <div class="flex items-baseline justify-between gap-2 border-t border-dashed border-border pt-[0.65rem] text-muted-foreground">
            <span>Consultation fee</span><b class="font-display text-[0.95rem] font-[650] tracking-[-0.02em] text-foreground">Shown before you book</b>
          </div>
        </div>
        <h3 :class="title">Book a consultation</h3>
        <p :class="body">Pick a time and meet by video, phone or in person. The thread stays open afterwards.</p>
      </li>
    </ol>
  </section>
</template>
