<script setup lang="ts">
import { Button } from '@/components/ui/button'
/**
 * "How it works": three connected steps, each with a small product view and a cost tag.
 *
 * The product views play once, in order, when the section scrolls into view: a
 * search is typed and lawyers appear, a question is sent, a booking is confirmed.
 * Each piece arrives at its own moment (`piece(at)`), about three seconds in all.
 * See usePlayOnce for when the sequence is skipped.
 */
const { target: list, piece, press } = usePlayOnce()

// Class lists shared by the three steps (full strings, so Tailwind sees them).
const step = 'flex flex-col rounded-card border border-border bg-card p-5.5'
const number = 'grid size-10 flex-none place-items-center rounded-full bg-mint font-display text-lg font-medium text-deep'
const cost = 'rounded-md border px-2.5 py-1.25 text-xs font-medium tracking-wider whitespace-nowrap uppercase'
const costFree = 'border-border bg-background text-deep'
const demo = 'mt-4.5 flex min-h-38 flex-col justify-center gap-2.5 rounded-card bg-background p-4 text-sm'
const title = 'mt-4.5 text-xl font-normal tracking-tight'
const body = 'mt-1.5 text-base text-muted-foreground'
</script>

<template>
  <section id="how" class="scroll-mt-24 pb-14 lg:pb-18 xl:pb-22.5">
    <CanopySectionHead kicker="How it works" title="Three steps. You only pay at the last one.">
      <div class="grid min-w-0 grow-0 basis-96 justify-items-start gap-3.5">
        <p class="max-w-136 text-muted-foreground">Searching and asking are free. A fee comes in only when you book a consultation, and you see it before you confirm.</p>
        <Button as-child variant="line" size="pill">
          <NuxtLink to="/find-lawyers">Start a search →</NuxtLink>
        </Button>
      </div>
    </CanopySectionHead>

    <ol ref="list" class="grid grid-cols-[repeat(auto-fit,minmax(17rem,1fr))] gap-4.5">
      <li data-rise :class="step">
        <div class="flex items-center gap-3"><span :class="number">1</span><i class="h-px flex-1 origin-left bg-border" v-bind="piece(0, 'draw')" /><span :class="[cost, costFree]">Free</span></div>
        <div aria-hidden="true" :class="demo">
          <div class="flex items-center gap-2 rounded-full border border-border bg-card py-2.5 pr-2.5 pl-3.5 font-medium" v-bind="piece(80)">
            <CanopyGlyph name="search" :stroke="2.2" class="flex-none text-muted-foreground" /><span class="inline-block" v-bind="piece(250, 'type')">Tenancy dispute</span>
            <span class="ml-auto rounded-full bg-mint px-2.5 py-0.5 text-xs text-deep" v-bind="piece(720, 'pop')">Lagos</span>
          </div>
          <div class="flex items-center gap-2.5 pl-1.25 text-muted-foreground">
            <span class="flex">
              <i
                v-for="(initials, index) in ['AO', 'CN', 'FB']"
                :key="initials"
                class="grid size-8 place-items-center rounded-full border-2 border-background bg-mint text-xs font-medium text-deep not-italic"
                :class="{ '-ml-2.25': index > 0 }"
                v-bind="piece(880 + index * 80, 'pop')"
              >{{ initials }}</i>
            </span>
            <span v-bind="piece(1150)">Verified lawyers who match</span>
          </div>
        </div>
        <h3 :class="title">Find your lawyer</h3>
        <p :class="body">Search by practice area and state, then compare experience, meeting options and fees.</p>
      </li>

      <li data-rise :class="step">
        <div class="flex items-center gap-3"><span :class="number">2</span><i class="h-px flex-1 origin-left bg-border" v-bind="piece(1350, 'draw')" /><span :class="[cost, costFree]">Free</span></div>
        <div aria-hidden="true" :class="demo">
          <!-- the box arrives, the button dips, then the sent question appears above it -->
          <p class="mt-1.5 max-w-11/12 origin-bottom-right self-end rounded-lg rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-snug text-white" v-bind="piece(1820, 'pop')">Can I end my tenancy early without losing my deposit?</p>
          <div class="flex items-center justify-between gap-2 rounded-full border border-border bg-card py-1.5 pr-1.5 pl-3.75 text-placeholder" v-bind="piece(1430)">
            <span>Write a message…</span>
            <span class="grid size-7.5 flex-none place-items-center rounded-full bg-primary text-white" v-bind="press(1700)"><CanopyGlyph name="arrow" :size="14" :stroke="2.8" /></span>
          </div>
        </div>
        <h3 :class="title">Ask your question</h3>
        <p :class="body">Message the lawyer directly and get a first answer before you commit to anything.</p>
      </li>

      <li data-rise :class="step">
        <div class="flex items-center gap-3"><span :class="number">3</span><i class="h-px flex-1 origin-left bg-border" v-bind="piece(2150, 'draw')" /><span :class="[cost, 'border-lime bg-lime text-night']">Fee agreed first</span></div>
        <div aria-hidden="true" :class="demo">
          <div class="flex items-center gap-2.75">
            <span class="grid size-7.5 flex-none place-items-center rounded-full bg-primary text-white" v-bind="piece(2430, 'pop')"><CanopyGlyph name="tick" :size="14" :stroke="3.2" /></span>
            <div v-bind="piece(2230)"><b class="block">Thu 19 Nov, 10:30 AM</b><small class="text-sm text-muted-foreground">Video call with your lawyer</small></div>
          </div>
          <div class="flex items-baseline justify-between gap-2 border-t border-dashed border-border pt-2.5 text-muted-foreground" v-bind="piece(2650)">
            <span>Consultation fee</span><b class="font-display text-base font-normal tracking-tight text-foreground">Shown before you book</b>
          </div>
        </div>
        <h3 :class="title">Book a consultation</h3>
        <p :class="body">Pick a time and meet by video, phone or in person. The thread stays open afterwards.</p>
      </li>
    </ol>
  </section>
</template>
