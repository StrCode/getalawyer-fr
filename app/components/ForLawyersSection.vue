<script setup lang="ts">
import { motion } from 'motion-v'

interface Perk {
  icon: string
  title: string
  description: string
}

const perks: Perk[] = [
  { icon: 'i-lucide-shield-check',    title: 'Bar-Verified Credentials',    description: 'Your credentials are verified and prominently displayed to build client trust.' },
  { icon: 'i-lucide-calendar',        title: 'Smart Booking Calendar',      description: 'Automated scheduling that syncs with your calendar and reduces no-shows.' },
  { icon: 'i-lucide-message-circle',  title: 'Direct Client Messaging',     description: 'Secure messaging platform to communicate with clients before and after consultations.' },
  { icon: 'i-lucide-dollar-sign',     title: 'Zero Commission Model',       description: 'Keep 100% of your consultation fees. We charge lawyers a flat monthly subscription.' },
]
</script>

<template>
  <section
    id="for-lawyers"
    class="relative bg-white py-20 md:py-28 border-neutral-200 border-t overflow-hidden"
  >
    <!-- Dot texture -->
    <div class="absolute inset-0 opacity-[0.03]"
      style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 24px 24px;" />

    <!-- Glow -->
    <div class="bottom-0 left-1/3 absolute opacity-10 blur-3xl rounded-full w-96 h-96 pointer-events-none"
      style="background: radial-gradient(circle, #1d6b44, transparent)" />

    <div class="relative mx-auto px-6 lg:px-8 max-w-7xl">
      <div class="items-center gap-12 lg:gap-20 grid grid-cols-1 lg:grid-cols-2">

        <!-- Left: copy -->
        <div>
          <motion.p
            :initial="{ opacity: 0, y: 10 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.4 }"
            class="mb-4 font-semibold text-[#1d6b44] text-xs uppercase tracking-widest"
          >For Legal Professionals</motion.p>

          <motion.h2
            :initial="{ opacity: 0, y: 18 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.55, delay: 0.06 }"
            class="mb-6 font-bold text-neutral-900 text-4xl md:text-5xl leading-[1.1] tracking-tight"
          >
            Grow Your<br>Practice.
          </motion.h2>

          <motion.p
            :initial="{ opacity: 0, y: 14 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.5, delay: 0.12 }"
            class="mb-9 max-w-md text-neutral-500 text-lg leading-relaxed"
          >
            Join thousands of verified legal professionals expanding their client base on GetaLawyer.
            The tools you need to manage your practice, zero commission taken.
          </motion.p>

          <motion.div
            :initial="{ opacity: 0, y: 12 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.45, delay: 0.18 }"
            class="flex flex-wrap gap-3"
          >
            <motion.button
              :whileHover="{ scale: 1.03 }"
              :whileTap="{ scale: 0.97 }"
              :transition="{ duration: 0.15 }"
              class="px-7 py-3.5 rounded-full bg-[#1d6b44] text-white font-semibold text-sm border-none cursor-pointer font-dm shadow-sm"
            >
              Register as a Lawyer
            </motion.button>
            <motion.button
              :whileHover="{ backgroundColor: '#f9f9f9', borderColor: '#e5e5e5' }"
              :whileTap="{ scale: 0.97 }"
              :transition="{ duration: 0.15 }"
              class="px-7 py-3.5 rounded-full bg-white border border-neutral-200 text-neutral-700 font-semibold text-sm cursor-pointer font-dm shadow-sm"
            >
              Learn More
            </motion.button>
          </motion.div>

          <!-- Trust strip -->
          <motion.div
            :initial="{ opacity: 0 }"
            :whileInView="{ opacity: 1 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.5, delay: 0.28 }"
            class="flex items-center gap-5 mt-10"
          >
            <div v-for="(item, i) in [['2,500+', 'Lawyers'], ['$0', 'Commission'], ['4.8★', 'Avg Rating']]"
              :key="i"
              class="text-center"
              :class="i < 2 ? 'pr-5 border-r border-neutral-200' : ''"
            >
              <div class="font-bold text-neutral-900 text-lg">{{ item[0] }}</div>
              <div class="font-medium text-neutral-500 text-xs">{{ item[1] }}</div>
            </div>
          </motion.div>
        </div>

        <!-- Right: perk cards -->
        <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
          <motion.div
            v-for="(perk, i) in perks"
            :key="perk.title"
            :initial="{ opacity: 0, y: 22 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.45, delay: 0.06 * i, ease: [0.25, 0.46, 0.45, 0.94] }"
            :whileHover="{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }"
            class="bg-white p-5 border border-neutral-200 rounded-xl transition-shadow duration-200 cursor-default"
          >
            <div class="flex justify-center items-center bg-[#e8f3ec] mb-4 rounded-lg w-10 h-10">
              <UIcon :name="perk.icon" class="w-5 h-5 text-[#1d6b44]" />
            </div>
            <h3 class="mb-1.5 font-semibold text-[15px] text-neutral-900">{{ perk.title }}</h3>
            <p class="text-neutral-500 text-sm leading-relaxed">{{ perk.description }}</p>
          </motion.div>
        </div>

      </div>
    </div>
  </section>
</template>