<script setup lang="ts">
import { useReducedMotion } from '~/composables/useReducedMotion'

interface NavigationBarProps {
  transparent?: boolean
}

const props = withDefaults(defineProps<NavigationBarProps>(), {
  transparent: false
})

// Use reduced motion composable
const { prefersReducedMotion } = useReducedMotion()

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ 
      behavior: prefersReducedMotion.value ? 'auto' : 'smooth', 
      block: 'start' 
    })
  }
}

const navLinks = [
  { label: 'How It Works', target: 'how-it-works' },
  { label: 'Find Lawyers', target: 'find-lawyers' },
  { label: 'Practice Areas', target: 'practice-areas' },
  { label: 'For Lawyers', target: 'for-lawyers' }
]
</script>

<template>
  <header 
    :class="[
      'top-0 right-0 left-0 z-50 fixed',
      transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md',
      prefersReducedMotion ? 'transition-none' : 'transition-colors duration-300'
    ]"
  >
    <div :class="transparent ? 'border-transparent' : 'border-neutral-200/50'" class="border-b transition-colors duration-300">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <button 
              @click="scrollToSection('hero')"
              :class="[
                'hover:opacity-80 font-serif font-bold text-2xl tracking-tight',
                transparent ? 'text-neutral-900' : 'text-neutral-900',
                prefersReducedMotion ? 'transition-none' : 'transition-opacity'
              ]"
            >
              Lex<span class="text-[#1d6b44]">Connect</span>
            </button>
          </div>

          <!-- Navigation Links (hidden on mobile) -->
          <nav class="hidden md:flex items-center space-x-8">
            <button
              v-for="link in navLinks"
              :key="link.target"
              @click="scrollToSection(link.target)"
              :class="[
                'font-medium text-sm',
                transparent ? 'text-neutral-700 hover:text-neutral-950' : 'text-neutral-600 hover:text-neutral-900',
                prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
              ]"
            >
              {{ link.label }}
            </button>
          </nav>

          <!-- CTA Button -->
          <div class="flex-shrink-0">
            <button
              :class="[
                'bg-[#e8f3ec] hover:bg-[#d1e8dc] px-6 py-2 rounded-full font-medium text-[#1d6b44] text-sm tracking-wide',
                prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
              ]"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
