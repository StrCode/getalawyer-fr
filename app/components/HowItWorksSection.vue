<script setup lang="ts">
import { useReducedMotion } from '~/composables/useReducedMotion'

interface Step {
  number: number
  icon: string
  title: string
  description: string
}

// Use reduced motion composable
const { prefersReducedMotion } = useReducedMotion()

const steps: Step[] = [
  {
    number: 1,
    icon: 'i-heroicons-user-plus',
    title: 'Create Your Account',
    description: 'Sign up in minutes with your email or social accounts'
  },
  {
    number: 2,
    icon: 'i-heroicons-magnifying-glass',
    title: 'Search & Filter',
    description: 'Find lawyers by specialty, location, and consultation type'
  },
  {
    number: 3,
    icon: 'i-heroicons-document-text',
    title: 'Review Profiles',
    description: 'Check credentials, reviews, and experience before deciding'
  },
  {
    number: 4,
    icon: 'i-heroicons-calendar',
    title: 'Book Consultation',
    description: 'Schedule at your convenience with instant confirmation'
  },
  {
    number: 5,
    icon: 'i-heroicons-video-camera',
    title: 'Consult & Connect',
    description: 'Meet via video, phone, or in-person at your preferred time'
  }
]
</script>

<template>
  <section id="how-it-works" class="bg-cream py-16 md:py-24">
    <div class="mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
      <!-- Section Header -->
      <div class="mb-12 text-center">
        <p class="mb-2 font-medium text-gold text-sm uppercase tracking-wider">
          How It Works
        </p>
        <h2 class="mb-4 font-playfair font-bold text-navy text-3xl md:text-4xl">
          Find Your Lawyer in 5 Simple Steps
        </h2>
        <p class="mx-auto max-w-2xl text-navy/70 text-lg">
          Our streamlined process makes it easy to connect with qualified legal professionals
        </p>
      </div>

      <!-- Step Cards Grid -->
      <div class="gap-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div
          v-for="step in steps"
          :key="step.number"
          :class="[
            'group relative bg-white hover:shadow-lg p-6 border border-navy/10 rounded-2xl',
            prefersReducedMotion ? 'transition-none' : 'transition-all hover:-translate-y-1 duration-200'
          ]"
        >
          <!-- Step Number Badge -->
          <div class="flex justify-center items-center bg-navy/5 mb-4 rounded-full w-12 h-12 font-bold text-navy text-xl">
            {{ step.number }}
          </div>

          <!-- Icon -->
          <div class="mb-4">
            <UIcon :name="step.icon" class="w-8 h-8 text-gold" />
          </div>

          <!-- Content -->
          <h3 class="mb-2 font-playfair font-semibold text-navy text-xl">
            {{ step.title }}
          </h3>
          <p class="text-navy/70 text-sm">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
