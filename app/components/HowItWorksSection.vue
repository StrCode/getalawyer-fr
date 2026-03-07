<script setup lang="ts">
import { motion } from 'motion-v'

interface Step {
  number: number
  icon: string
  title: string
  description: string
}

const steps: Step[] = [
  { number: 1, icon: 'i-lucide-user-plus', title: 'Create Your Account', description: 'Sign up in minutes with your email or social accounts' },
  { number: 2, icon: 'i-lucide-search', title: 'Search & Filter', description: 'Find lawyers by specialty, location, and consultation type' },
  { number: 3, icon: 'i-lucide-file-text', title: 'Review Profiles', description: 'Check credentials, reviews, and experience before deciding' },
  { number: 4, icon: 'i-lucide-calendar', title: 'Book Consultation', description: 'Schedule at your convenience with instant confirmation' },
  { number: 5, icon: 'i-lucide-video', title: 'Consult & Connect', description: 'Meet via video, phone, or in-person at your preferred time' },
]
</script>

<template>
  <section id="how-it-works" class="bg-[#f9f9f6] py-20 md:py-28">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">

      <!-- Header -->
      <div class="text-center mb-14">
        <motion.p
          :initial="{ opacity: 0, y: 10 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.45 }"
          class="text-xs font-semibold uppercase tracking-widest text-[#1d6b44] mb-3"
        >How It Works</motion.p>
        <motion.h2
          :initial="{ opacity: 0, y: 16 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: 0.06 }"
          class="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight"
        >
          Find Your Lawyer in 5 Steps
        </motion.h2>
        <motion.p
          :initial="{ opacity: 0, y: 12 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: 0.1 }"
          class="text-neutral-500 text-lg max-w-xl mx-auto"
        >
          Our streamlined process makes it easy to connect with qualified legal professionals.
        </motion.p>
      </div>

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
          class="group bg-white border border-neutral-200 rounded-xl p-6 cursor-default transition-shadow duration-200"
        >
          <!-- Step number + connector line -->
          <div class="flex items-center gap-3 mb-5">
            <div class="w-8 h-8 rounded-full bg-[#e8f3ec] flex items-center justify-center text-[#1d6b44] text-sm font-bold flex-shrink-0">
              {{ step.number }}
            </div>
            <div v-if="i < steps.length - 1" class="flex-1 h-px bg-neutral-200 xl:block hidden" />
          </div>

          <!-- Icon -->
          <div class="w-10 h-10 rounded-lg bg-[#f2faf4] flex items-center justify-center mb-4 group-hover:bg-[#e8f3ec] transition-colors duration-200">
            <UIcon :name="step.icon" class="w-5 h-5 text-[#1d6b44]" />
          </div>

          <!-- Text -->
          <h3 class="font-semibold text-neutral-900 mb-1.5 text-[15px]">{{ step.title }}</h3>
          <p class="text-neutral-500 text-sm leading-relaxed">{{ step.description }}</p>
        </motion.div>
      </div>
    </div>
  </section>
</template>