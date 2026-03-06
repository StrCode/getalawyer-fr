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
      transparent ? 'bg-transparent' : 'bg-navy/90 backdrop-blur-md',
      prefersReducedMotion ? 'transition-none' : 'transition-colors duration-300'
    ]"
  >
    <div class="border-gold/20 border-b">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <button 
              @click="scrollToSection('hero')"
              :class="[
                'hover:opacity-80 font-serif font-bold text-white text-2xl',
                prefersReducedMotion ? 'transition-none' : 'transition-opacity'
              ]"
            >
              Lex<span class="text-gold">Connect</span>
            </button>
          </div>

          <!-- Navigation Links (hidden on mobile) -->
          <nav class="hidden md:flex items-center space-x-8">
            <button
              v-for="link in navLinks"
              :key="link.target"
              @click="scrollToSection(link.target)"
              :class="[
                'font-medium text-white/90 hover:text-gold text-sm',
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
                'bg-gold hover:bg-gold-light px-6 py-2 rounded-full font-medium text-navy text-sm',
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
