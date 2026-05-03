<script setup lang="ts">
import type { Component } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { motion } from 'motion-v'
import {
  PhCalendarBlank,
  PhFileText,
  PhMagnifyingGlass,
  PhUserPlus,
  PhVideoCamera,
} from '@phosphor-icons/vue'

interface Step {
  number: number
  icon: Component
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: 1,
    icon: PhUserPlus,
    title: 'Create your account',
    description:
      'Sign up in a few minutes with email or Google. Add the basics for your profile so lawyers know who you are and you can book and message without friction later.',
  },
  {
    number: 2,
    icon: PhMagnifyingGlass,
    title: 'Search & filter',
    description:
      'Explore the directory by practice area, location, and how you like to meet—video, phone, or in person when it is offered. Narrow the list until the shortlist feels manageable.',
  },
  {
    number: 3,
    icon: PhFileText,
    title: 'Compare profiles',
    description:
      'Open each profile to see verification, qualifications, and experience at a glance. Where lawyers have shared them, you can also read reviews and get a clearer sense of fit before you reach out.',
  },
  {
    number: 4,
    icon: PhCalendarBlank,
    title: 'Book a consultation',
    description:
      'Choose a slot that works for you from the lawyer’s calendar. You will see fees, duration, and what is included up front, and you confirm only when the details look right.',
  },
  {
    number: 5,
    icon: PhVideoCamera,
    title: 'Meet your lawyer',
    description:
      'Join the session the way you agreed—secure video, phone, or in person when available. Afterward you can keep the conversation and documents in one place on the platform when messaging is enabled.',
  },
]

</script>

<template>
  <!-- No overflow-x clip here: overflow-x + visible y often forces y=auto and breaks page-sticky. -->
  <section
    id="how-it-works"
    class="scroll-mt-23 relative border-border border-y bg-white py-20 md:py-28 dark:bg-background"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-b from-muted/25 to-transparent dark:from-muted/20"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
      <div
        class="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-stretch lg:gap-16 xl:gap-20"
      >
        <!-- Left cell stretches to row height (tallest column = list); inner is sticky until row ends. -->
        <header class="min-h-0 lg:col-span-5 lg:self-stretch">
          <div
            class="mx-auto max-w-xl text-center lg:sticky lg:top-21 lg:mx-0 lg:max-w-lg lg:text-left lg:pb-4"
          >
            <motion.div
              class="mb-5 flex justify-center lg:justify-start"
              :initial="{ opacity: 0, y: 10 }"
              :whileInView="{ opacity: 1, y: 0 }"
              :viewport="{ once: true }"
              :transition="{ duration: 0.45 }"
            >
              <Badge
                variant="secondary"
                class="border border-border bg-muted/90 px-3 py-1.5 font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.12em] shadow-none hover:bg-muted"
              >
                How it works
              </Badge>
            </motion.div>

            <motion.h2
              :initial="{ opacity: 0, y: 16 }"
              :whileInView="{ opacity: 1, y: 0 }"
              :viewport="{ once: true }"
              :transition="{ duration: 0.45, delay: 0.05 }"
              class="text-balance font-bold tracking-tight text-foreground text-[2rem] leading-[1.12] sm:text-[2.1875rem] md:text-[2.4375rem] lg:text-[2.5rem] xl:text-[2.625rem]"
            >
              From your first search to your first consultation
            </motion.h2>

            <div class="flex justify-center py-6 lg:justify-start" role="presentation">
              <div class="w-16 shrink-0 sm:w-20">
                <Separator decorative orientation="horizontal" class="bg-border/70" />
              </div>
            </div>

            <motion.p
              :initial="{ opacity: 0, y: 12 }"
              :whileInView="{ opacity: 1, y: 0 }"
              :viewport="{ once: true }"
              :transition="{ duration: 0.45, delay: 0.09 }"
              class="text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base sm:leading-relaxed lg:max-w-[48ch]"
            >
              GetaLawyer is built around a simple idea: you should see who you are hiring, how they work, and what a first conversation costs before you commit. The steps on the right walk you from first visit to your first session.
            </motion.p>
          </div>
        </header>

        <!-- Right: step cards (two-up on tablet; single column in the lg+ rail for clarity) -->
        <ol
          role="list"
          class="grid list-none gap-3 p-0 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-1 lg:gap-3 lg:border-l lg:border-border/60 lg:pl-16 lg:pr-8 xl:pl-22 xl:pr-14"
        >
          <li
            v-for="(step, i) in steps"
            :key="step.number"
            class="min-h-0 list-none"
          >
            <motion.div
              class="group flex h-full flex-col rounded-md border border-border/80 bg-muted p-5 shadow-sm shadow-black/3 outline-none transition-[transform,box-shadow] duration-200 hover:border-border hover:shadow-md dark:shadow-black/20 dark:hover:shadow-lg motion-reduce:transition-none [@media(hover:hover)]:hover:-translate-y-0.5 motion-reduce:[@media(hover:hover)]:hover:translate-y-0"
              :initial="{ opacity: 0, y: 22 }"
              :whileInView="{ opacity: 1, y: 0 }"
              :viewport="{ once: true, margin: '-40px' }"
              :transition="{ duration: 0.45, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }"
            >
              <div class="mb-3 flex items-center justify-between gap-3">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background/85 transition-colors duration-200 group-hover:bg-background dark:border-border dark:bg-muted/50 dark:group-hover:bg-muted/60"
                >
                  <component :is="step.icon" class="size-6 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                </div>
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background/90 text-xs font-semibold tabular-nums leading-none text-muted-foreground dark:bg-muted/60"
                  aria-hidden="true"
                >
                  {{ step.number }}
                </div>
              </div>

              <h3 class="mb-1 text-lg font-semibold leading-snug tracking-tight">{{ step.title }}</h3>
              <p class="text-sm leading-relaxed text-muted-foreground">{{ step.description }}</p>
            </motion.div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
