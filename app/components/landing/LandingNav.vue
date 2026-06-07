<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getSessionUserType } from '~/lib/session-user'

interface Props { isScrolled?: boolean }
withDefaults(defineProps<Props>(), { isScrolled: false })

const { session } = useAuth()
const showFindLawyerCta = computed(
  () => getSessionUserType(session.value?.user) !== 'lawyer',
)

const links = [
  { label: 'How it works',   href: '/#how'      },
  { label: 'Practice areas', href: '/practice-areas' },
  { label: 'For lawyers',    href: '/for-lawyers'  },
  { label: 'Contact',        href: '/contact'  },
]

const isMobileMenuOpen = ref(false)

// Prevent scrolling when the mobile menu is open
watch(isMobileMenuOpen, (isOpen) => {
  if (import.meta.client) {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})
</script>

<template>
  <div>
    <nav class="sticky top-0 z-[100] bg-background/85 backdrop-blur-md border-b border-border/50">
      <div class="flex items-center justify-between max-w-7xl mx-auto px-6 md:px-8 py-5">

        <!-- Logo -->
        <LandingBrandLogo class="z-[110]" />

        <!-- Nav links — hidden on mobile -->
        <ul class="hidden lg:flex gap-9 list-none m-0 p-0">
          <li v-for="link in links" :key="link.href">
            <NuxtLink
              :to="link.href"
              class="text-foreground text-4 font-medium hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer font-sans no-underline"
            >{{ link.label }}</NuxtLink>
          </li>
        </ul>

        <!-- Desktop CTAs -->
        <div class="hidden lg:flex items-center gap-3">
          <NuxtLink
            to="/login"
            class="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-full text-foreground text-4 font-medium border border-border hover:bg-white hover:border-foreground transition-all duration-200 bg-transparent cursor-pointer font-sans no-underline"
          >Sign in</NuxtLink>
          <NuxtLink
            v-if="showFindLawyerCta"
            to="/find-lawyers"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-sidebar-foreground text-4 font-medium hover:bg-sidebar hover:-translate-y-px transition-all duration-200 border-none cursor-pointer font-sans no-underline"
          >Find a lawyer →</NuxtLink>
        </div>

        <!-- Mobile Hamburger Button -->
        <div class="flex lg:hidden items-center">
          <button
            @click="isMobileMenuOpen = true"
            class="flex items-center justify-center w-11 h-11 rounded-full bg-transparent hover:bg-border/30 transition-colors border-none cursor-pointer"
            aria-label="Open mobile menu"
          >
            <svg class="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8h16M4 16h12" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Full Screen Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-8"
    >
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 z-[200] bg-background flex flex-col h-[100dvh]"
      >
        <!-- Mobile Menu Header (Matches Main Header Layout) -->
        <div class="flex items-center justify-between px-8 py-5 border-b border-border/50 shrink-0">
          <LandingBrandLogo @click="isMobileMenuOpen = false" />

          <button
            @click="isMobileMenuOpen = false"
            class="flex items-center justify-center w-11 h-11 rounded-full bg-border/30 hover:bg-border/50 transition-colors border-none cursor-pointer"
            aria-label="Close mobile menu"
          >
            <PhIcon name="ph:x" class="w-5 h-5 text-foreground" />
          </button>
        </div>

        <!-- Mobile Menu Links -->
        <div class="flex-1 overflow-y-auto px-8 py-12 flex flex-col justify-center">
          <ul class="flex flex-col gap-8 list-none m-0 p-0">
            <li v-for="(link, index) in links" :key="link.href" class="overflow-hidden">
              <NuxtLink
                :to="link.href"
                @click="isMobileMenuOpen = false"
                class="block text-foreground text-5xl leading-[1.1] font-heading font-medium hover:text-primary transition-colors duration-200 no-underline animate-slide-up-fade"
                :style="{ animationDelay: `${index * 75 + 100}ms` }"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Mobile Menu Footer CTAs -->
        <div class="px-8 pb-12 pt-8 flex flex-col gap-4 shrink-0 animate-slide-up-fade" :style="{ animationDelay: `${links.length * 75 + 100}ms` }">
          <NuxtLink
            v-if="showFindLawyerCta"
            to="/find-lawyers"
            @click="isMobileMenuOpen = false"
            class="flex items-center justify-center w-full px-6 py-5 rounded-full bg-primary text-sidebar-foreground text-lg font-medium hover:bg-sidebar transition-all duration-200 border-none cursor-pointer font-sans shadow-sm no-underline"
          >
            Find a lawyer
          </NuxtLink>
          <NuxtLink
            to="/login"
            @click="isMobileMenuOpen = false"
            class="flex items-center justify-center w-full px-6 py-5 rounded-full text-foreground text-lg font-medium border border-border hover:bg-white transition-all duration-200 bg-transparent cursor-pointer font-sans no-underline"
          >
            Sign in
          </NuxtLink>
        </div>

      </div>
    </Transition>
  </div>
</template>

<style scoped>
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up-fade {
  animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}
</style>
