<script setup lang="ts">
import { motion } from 'motion-v'
import { useReducedMotion, getTransition } from '~/composables/useReducedMotion'

interface Perk {
  icon: string
  title: string
  description: string
}

const perks: Perk[] = [
  {
    icon: 'i-heroicons-shield-check',
    title: 'Bar-Verified Credentials',
    description: 'Your credentials are verified and prominently displayed to build client trust'
  },
  {
    icon: 'i-heroicons-calendar',
    title: 'Smart Booking Calendar',
    description: 'Automated scheduling that syncs with your calendar and reduces no-shows'
  },
  {
    icon: 'i-heroicons-chat-bubble-left-right',
    title: 'Direct Client Communication',
    description: 'Secure messaging platform to communicate with clients before and after consultations'
  },
  {
    icon: 'i-heroicons-currency-dollar',
    title: 'Zero Commission Model',
    description: 'Keep 100% of your consultation fees. We charge lawyers a flat monthly subscription'
  }
]

// Use reduced motion composable
const { prefersReducedMotion } = useReducedMotion()
</script>

<template>
  <section id="for-lawyers" class="relative bg-navy py-16 md:py-24 overflow-hidden">
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy/90" />
    
    <div class="relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <!-- Two-column layout -->
      <div class="items-center gap-12 lg:gap-16 grid grid-cols-1 lg:grid-cols-2">
        <!-- Left column: Heading and CTA -->
        <div class="text-white">
          <motion.h2
            :initial="{ opacity: 0, y: 20 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="getTransition(prefersReducedMotion, { duration: 0.6 })"
            :viewport="{ once: true }"
            class="mb-6 font-playfair font-bold text-4xl md:text-5xl"
          >
            Grow Your Practice
          </motion.h2>
          
          <motion.p
            :initial="{ opacity: 0, y: 20 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="getTransition(prefersReducedMotion, { duration: 0.6, delay: 0.1 })"
            :viewport="{ once: true }"
            class="mb-8 text-white/90 text-lg md:text-xl leading-relaxed"
          >
            Join thousands of verified legal professionals who are expanding their client base 
            and building their reputation on LexConnect. Our platform provides the tools you 
            need to manage your practice efficiently while connecting with clients who need your expertise.
          </motion.p>
          
          <motion.div
            :initial="{ opacity: 0, y: 20 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="getTransition(prefersReducedMotion, { duration: 0.6, delay: 0.2 })"
            :viewport="{ once: true }"
          >
            <UButton
              size="xl"
              :class="[
                'bg-gold hover:bg-gold-light px-8 py-4 rounded-full font-semibold text-navy',
                prefersReducedMotion ? 'transition-none' : 'hover:scale-105 transition-all duration-200'
              ]"
              label="Register as a Lawyer"
            />
          </motion.div>
        </div>

        <!-- Right column: Perk cards -->
        <div class="gap-6 grid grid-cols-1 sm:grid-cols-2">
          <motion.div
            v-for="(perk, index) in perks"
            :key="perk.title"
            :initial="{ opacity: 0, y: 20 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="getTransition(prefersReducedMotion, { duration: 0.6, delay: 0.1 * index })"
            :viewport="{ once: true }"
            :class="[
              'bg-white/10 hover:bg-white/15 backdrop-blur-sm p-6 border border-white/20 rounded-2xl',
              prefersReducedMotion ? 'transition-none' : 'transition-all duration-200'
            ]"
          >
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="flex justify-center items-center bg-gold/20 rounded-full w-12 h-12">
                  <UIcon :name="perk.icon" class="w-6 h-6 text-gold" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="mb-2 font-semibold text-white text-lg">
                  {{ perk.title }}
                </h3>
                <p class="text-white/80 text-sm leading-relaxed">
                  {{ perk.description }}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
</template>
