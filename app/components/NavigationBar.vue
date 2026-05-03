<script setup lang="ts">
import { useReducedMotion } from '~/composables/useReducedMotion'

interface NavigationBarProps {
  transparent?: boolean
}

const props = withDefaults(defineProps<NavigationBarProps>(), {
  transparent: false,
})

const { prefersReducedMotion } = useReducedMotion()

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: prefersReducedMotion.value ? 'auto' : 'smooth',
      block: 'start',
    })
  }
}

type NavLink =
  | { label: string; to: string }
  | { label: string; target: string }

const navLinks: NavLink[] = [
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Practice Areas', target: 'practice-areas' },
  { label: 'For Lawyers', target: 'for-lawyers' },
]

const linkClass =
  'inline-flex min-h-[44px] items-center font-medium text-sm'
const linkClassTransparent =
  `${linkClass} text-neutral-700 hover:text-neutral-950`
const linkClassSolid = `${linkClass} text-neutral-600 hover:text-neutral-900`
const transitionClass = (usePref: boolean) =>
  usePref ? 'transition-none' : 'transition-colors duration-200'

function isRouteLink(link: NavLink): link is { label: string; to: string } {
  return 'to' in link
}
</script>

<template>
  <header
    :class="[
      'fixed left-0 right-0 top-0 z-50',
      transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md',
      prefersReducedMotion ? 'transition-none' : 'transition-colors duration-300',
    ]"
  >
    <div
      :class="transparent ? 'border-transparent' : 'border-neutral-200/50'"
      class="border-b transition-colors duration-300"
    >
      <div class="mx-auto h-18 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-full items-center justify-between">
          <div class="shrink-0">
            <NuxtLink to="/" class="flex items-center">
              <img src="/getalawyer-logo.svg" alt="GetALawyer" class="h-8 w-auto" />
            </NuxtLink>
          </div>

          <nav class="hidden items-center space-x-8 md:flex">
            <template v-for="link in navLinks" :key="link.label">
              <NuxtLink
                v-if="isRouteLink(link)"
                :to="link.to"
                :class="[
                  transparent ? linkClassTransparent : linkClassSolid,
                  transitionClass(!!prefersReducedMotion),
                ]"
              >
                {{ link.label }}
              </NuxtLink>
              <button
                v-else
                type="button"
                :class="[
                  transparent ? linkClassTransparent : linkClassSolid,
                  transitionClass(!!prefersReducedMotion),
                ]"
                @click="scrollToSection(link.target)"
              >
                {{ link.label }}
              </button>
            </template>
          </nav>

          <div class="shrink-0">
            <NuxtLink
              to="/login"
              :class="[
                'rounded-full bg-[#e8f3ec] px-6 py-2 text-sm font-medium tracking-wide text-[#1d6b44] hover:bg-[#d1e8dc]',
                prefersReducedMotion ? 'transition-none' : 'transition-colors duration-200',
              ]"
            >
              Sign In
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
