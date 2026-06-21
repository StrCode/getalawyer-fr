<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import UserDropdown from '@/components/UserDropdown.vue'
import { getSessionUserType } from '~/lib/session-user'

interface Props { isScrolled?: boolean }
withDefaults(defineProps<Props>(), { isScrolled: false })

const { session } = useAuth()
const isSignedIn = computed(() => Boolean(session.value?.user))
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

const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)

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
    <nav
      class="sticky top-0 z-100 transition-all duration-300"
      :class="isScrolled ? 'px-4 pt-3 md:px-6 md:pt-4' : 'px-0 pt-0'"
    >
      <div
        class="mx-auto flex items-center justify-between gap-4 backdrop-blur-md transition-all duration-300"
        :class="isScrolled
          ? 'max-w-6xl rounded-2xl border border-border/70 bg-background/85 px-4 py-3 shadow-lg md:px-5'
          : 'max-w-7xl rounded-none border-b border-border/60 bg-background/80 px-6 py-4 md:px-8'"
      >
        <!-- Logo -->
        <LandingBrandLogo class="z-110" />

        <!-- Nav links — hidden on mobile -->
        <ul class="m-0 hidden list-none gap-8 p-0 lg:flex">
          <li v-for="link in links" :key="link.href">
            <NuxtLink
              :to="link.href"
              class="cursor-pointer font-sans text-base font-medium text-foreground no-underline transition-colors duration-200 hover:text-primary"
            >{{ link.label }}</NuxtLink>
          </li>
        </ul>

        <!-- Desktop CTAs -->
        <div class="hidden items-center gap-2 lg:flex">
          <UserDropdown
            v-if="isSignedIn"
            variant="landing"
          />
          <NuxtLink
            v-else
            to="/login"
            class="hidden cursor-pointer items-center rounded-full px-4 py-2.5 font-sans text-base font-medium text-foreground no-underline transition-colors duration-200 hover:bg-surface-2 sm:inline-flex"
          >Sign in</NuxtLink>
          <NuxtLink
            v-if="showFindLawyerCta"
            to="/find-lawyers"
            class="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-sans text-base font-medium text-primary-foreground no-underline transition-all duration-200 hover:-translate-y-px hover:bg-primary/90"
          >Find a lawyer →</NuxtLink>
        </div>

        <!-- Mobile Hamburger Button -->
        <div class="flex items-center lg:hidden">
          <button
            class="flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-colors hover:bg-surface-2"
            aria-label="Open mobile menu"
            @click="isMobileMenuOpen = true"
          >
            <svg class="size-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        class="fixed inset-0 z-200 flex h-dvh flex-col bg-background"
      >
        <!-- Mobile Menu Header (Matches Main Header Layout) -->
        <div class="flex shrink-0 items-center justify-between border-b border-border/50 px-8 py-5">
          <LandingBrandLogo @click="isMobileMenuOpen = false" />

          <button
            class="flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-surface-2 transition-colors hover:bg-surface-3"
            aria-label="Close mobile menu"
            @click="isMobileMenuOpen = false"
          >
            <PhX class="size-5 text-foreground" />
          </button>
        </div>

        <!-- Mobile Menu Links -->
        <div class="flex flex-1 flex-col justify-center overflow-y-auto px-8 py-12">
          <ul class="m-0 flex list-none flex-col gap-8 p-0">
            <li v-for="(link, index) in links" :key="link.href" class="overflow-hidden">
              <NuxtLink
                :to="link.href"
                class="animate-slide-up-fade block font-heading text-5xl font-medium leading-[1.1] text-foreground no-underline transition-colors duration-200 hover:text-primary"
                :style="{ animationDelay: `${index * 75 + 100}ms` }"
                @click="isMobileMenuOpen = false"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Mobile Menu Footer CTAs -->
        <div class="animate-slide-up-fade flex shrink-0 flex-col gap-4 px-8 pb-12 pt-8" :style="{ animationDelay: `${links.length * 75 + 100}ms` }">
          <template v-if="isSignedIn">
            <div class="w-full rounded-2xl border border-border bg-background p-2">
              <UserDropdown variant="sidebar" />
            </div>
            <NuxtLink
              to="/dashboard"
              class="flex w-full cursor-pointer items-center justify-center rounded-full border-none bg-primary px-6 py-5 font-sans text-lg font-medium text-primary-foreground no-underline shadow-sm transition-all duration-200 hover:bg-primary/90"
              @click="isMobileMenuOpen = false"
            >
              Go to dashboard
            </NuxtLink>
            <NuxtLink
              v-if="showFindLawyerCta"
              to="/find-lawyers"
              class="flex w-full cursor-pointer items-center justify-center rounded-full border border-border bg-transparent px-6 py-5 font-sans text-lg font-medium text-foreground no-underline transition-all duration-200 hover:bg-surface-2"
              @click="isMobileMenuOpen = false"
            >
              Find a lawyer
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink
              v-if="showFindLawyerCta"
              to="/find-lawyers"
              class="flex w-full cursor-pointer items-center justify-center rounded-full border-none bg-primary px-6 py-5 font-sans text-lg font-medium text-primary-foreground no-underline shadow-sm transition-all duration-200 hover:bg-primary/90"
              @click="isMobileMenuOpen = false"
            >
              Find a lawyer
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="flex w-full cursor-pointer items-center justify-center rounded-full border border-border bg-transparent px-6 py-5 font-sans text-lg font-medium text-foreground no-underline transition-all duration-200 hover:bg-surface-2"
              @click="isMobileMenuOpen = false"
            >
              Sign in
            </NuxtLink>
          </template>
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
