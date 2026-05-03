<script setup lang="ts">
import type { Component } from 'vue'
import { motion } from 'motion-v'
import {
  PhCalendarBlank,
  PhFileText,
  PhMagnifyingGlass,
  PhUserPlus,
  PhVideoCamera
} from '@phosphor-icons/vue'

interface Step {
  number: number
  icon: Component
  title: string
  description: string
}

const steps: Step[] = [
  { number: 1, icon: PhUserPlus, title: 'Create Your Account', description: 'Sign up in minutes with your email or social accounts' },
  { number: 2, icon: PhMagnifyingGlass, title: 'Search & Filter', description: 'Find lawyers by specialty, location, and consultation type' },
  { number: 3, icon: PhFileText, title: 'Review Profiles', description: 'Check credentials, reviews, and experience before deciding' },
  { number: 4, icon: PhCalendarBlank, title: 'Book Consultation', description: 'Schedule at your convenience with instant confirmation' },
  { number: 5, icon: PhVideoCamera, title: 'Consult & Connect', description: 'Meet via video, phone, or in-person at your preferred time' }
]
</script>

<template>
  <section id="how-it-works" class="relative overflow-hidden bg-marketing-canvas py-20 md:py-28">
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-[min(420px,55vw)] w-[min(720px,120%)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.35] blur-[100px] dark:opacity-[0.22]"
      style="background: radial-gradient(ellipse at center, var(--brand-soft-hover), transparent 70%)"
      aria-hidden="true"
    />
    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

      <!-- Header -->
      <header class="mx-auto mb-16 max-w-2xl text-center">
        <motion.span
          :initial="{ opacity: 0, y: 10 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.45 }"
          class="mb-5 inline-flex w-fit items-center rounded-full border border-brand/20 bg-brand-soft/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand shadow-sm backdrop-blur-sm dark:bg-brand-soft/30"
        >How It Works</motion.span>
        <motion.h2
          :initial="{ opacity: 0, y: 16 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: 0.06 }"
          class="text-3xl font-bold tracking-tight text-balance text-foreground md:text-[2.35rem] md:leading-[1.15]"
        >
          Find Your Lawyer in <span class="text-brand">5 Steps</span>
        </motion.h2>
        <div
          class="mx-auto my-5 h-px w-14 bg-linear-to-r from-transparent via-brand/45 to-transparent"
          aria-hidden="true"
        />
        <motion.p
          :initial="{ opacity: 0, y: 12 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: 0.1 }"
          class="text-pretty text-lg leading-relaxed text-muted-foreground"
        >
          Our streamlined process makes it easy to connect with qualified legal professionals.
        </motion.p>
      </header>

      <!-- Step cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <motion.div
          v-for="(step, i) in steps"
          :key="step.number"
          :initial="{ opacity: 0, y: 28 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, margin: '-40px' }"
          :transition="{ duration: 0.45, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }"
          :whileHover="{ y: -4, boxShadow: '0 10px 32px rgba(0,0,0,0.09)' }"
          class="group cursor-default rounded-xl border border-border bg-card p-6 shadow-sm shadow-black/5 transition-shadow duration-200 dark:shadow-black/20"
        >
          <!-- Step number + connector line -->
          <div class="flex items-center gap-3 mb-5">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand tabular-nums dark:bg-brand-soft/40">
              {{ step.number }}
            </div>
            <div v-if="i < steps.length - 1" class="hidden h-px flex-1 bg-border xl:block" />
          </div>

          <!-- Icon -->
          <div class="mb-4 flex size-10 items-center justify-center rounded-lg bg-brand-soft/60 transition-colors duration-200 group-hover:bg-brand-soft dark:bg-brand-soft/25 dark:group-hover:bg-brand-soft/40">
            <component :is="step.icon" class="size-5 text-brand" />
          </div>

          <!-- Text -->
          <h3 class="mb-1.5 text-[15px] font-semibold text-foreground">{{ step.title }}</h3>
          <p class="text-sm leading-relaxed text-muted-foreground">{{ step.description }}</p>
        </motion.div>
      </div>
    </div>
  </section>
</template>