<script setup lang="ts">
import { useReducedMotion } from '~/composables/useReducedMotion'

interface LinkSection {
  title: string
  links: { label: string; href: string }[]
}

// Use reduced motion composable
const { prefersReducedMotion } = useReducedMotion()

const linkSections: LinkSection[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Find a Lawyer', href: '#find-lawyers' },
      { label: 'Practice Areas', href: '#practice-areas' },
      { label: 'How It Works', href: '#how-it-works' },
    ],
  },
  {
    title: 'For Lawyers',
    links: [
      { label: 'Register Now', href: '#register' },
      { label: 'Benefits', href: '#benefits' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'Contact', href: '#contact' },
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
    ],
  },
]

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-[#07192e] text-white">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-7xl">
      <!-- Main Footer Content -->
      <div class="gap-8 lg:gap-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12">
        <!-- Brand Column -->
        <div class="lg:col-span-1">
          <div class="mb-4">
            <h3 class="font-playfair font-bold text-2xl">
              Lex<span class="text-gold">Connect</span>
            </h3>
          </div>
          <p class="text-gray-300 text-sm leading-relaxed">
            Connecting clients with verified legal professionals across all practice areas. 
            Find the right lawyer for your needs with transparent pricing and verified credentials.
          </p>
        </div>

        <!-- Link Columns -->
        <div
          v-for="section in linkSections"
          :key="section.title"
          class="lg:col-span-1"
        >
          <h4 class="mb-4 font-semibold text-white">{{ section.title }}</h4>
          <ul class="space-y-3">
            <li v-for="link in section.links" :key="link.label">
              <a
                :href="link.href"
                :class="[
                  'text-gray-300 hover:text-gold text-sm',
                  prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200'
                ]"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="pt-8 border-gray-700 border-t">
        <div class="flex md:flex-row flex-col justify-between items-center gap-4">
          <p class="text-gray-400 text-sm md:text-left text-center">
            &copy; {{ currentYear }} LexConnect. All rights reserved.
          </p>
          <p class="max-w-md text-gray-400 text-xs text-center md:text-right">
            LexConnect is a platform connecting clients with independent legal professionals. 
            We do not provide legal advice or services directly.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
