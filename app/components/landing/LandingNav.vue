<script setup lang="ts">
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import UserDropdown from '@/components/UserDropdown.vue'
import { getSessionUserType } from '~/lib/session-user'

const { session } = useAuth()
const isSignedIn = computed(() => Boolean(session.value?.user))
const showFindLawyerCta = computed(
  () => getSessionUserType(session.value?.user) !== 'lawyer',
)

const links = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Practice areas', href: '/practice-areas' },
  { label: 'For lawyers', href: '/for-lawyers' },
  { label: 'Contact', href: '/contact' },
]

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

const route = useRoute()

let scrollTicking = false
const handleScroll = () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      isScrolled.value = window.scrollY > 20
      scrollTicking = false
    })
    scrollTicking = true
  }
}

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (import.meta.client)
    document.body.style.overflow = ''
})

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)

watch(isMobileMenuOpen, (isOpen) => {
  if (!import.meta.client)
    return

  document.body.style.overflow = isOpen ? 'hidden' : ''
})

function isLinkActive(href: string) {
  if (href === '/practice-areas')
    return route.path === '/practice-areas'

  if (href === '/contact')
    return route.path === '/contact'

  if (href === '/for-lawyers')
    return route.path === '/for-lawyers'

  if (href.includes('how-it-works'))
    return route.path === '/' && route.hash === '#how-it-works'

  return false
}
</script>

<template>
  <div>
    <nav
      class="sticky top-0 z-100 transition-all duration-300"
      :class="isScrolled ? 'px-4 pt-3 md:px-6 md:pt-4' : 'px-0 pt-0'"
    >
      <div
        class="mx-auto flex items-center justify-between gap-4 bg-transparent transition-all duration-300"
        :class="isScrolled
          ? 'max-w-6xl rounded-2xl border border-border/70 px-4 py-3 shadow-sm md:px-5'
          : 'max-w-7xl rounded-none border-b border-border/40 px-6 py-4 md:px-8'"
      >
        <!-- Logo -->
        <LandingBrandLogo class="z-110" />

        <!-- Nav links — hidden on mobile -->
        <ul class="m-0 hidden list-none gap-8 p-0 lg:flex">
          <li v-for="link in links" :key="link.href">
            <NuxtLink
              :to="link.href"
              class="cursor-pointer font-sans text-sm font-medium no-underline transition-colors duration-200"
              :class="isLinkActive(link.href)
                ? 'text-primary'
                : 'text-foreground hover:text-primary'"
              :aria-current="isLinkActive(link.href) ? 'page' : undefined"
            >{{ link.label }}</NuxtLink>
          </li>
        </ul>

        <!-- Desktop CTAs -->
        <div class="hidden items-center gap-2 lg:flex">
          <UserDropdown
            v-if="isSignedIn"
            variant="landing"
            @signed-out="isMobileMenuOpen = false"
          />
          <NuxtLink
            v-else
            to="/login"
            class="hidden cursor-pointer items-center rounded-xl px-4 py-2 font-sans text-sm font-medium text-foreground no-underline transition-colors duration-200 hover:bg-muted sm:inline-flex"
          >Sign in</NuxtLink>
          <NuxtLink
            v-if="showFindLawyerCta"
            to="/find-lawyers"
            class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground no-underline transition-all duration-200 hover:-translate-y-px hover:bg-primary/90"
          >Find a lawyer →</NuxtLink>
        </div>

        <!-- Mobile Hamburger Button -->
        <div class="flex items-center lg:hidden">
          <button
            class="flex size-11 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent transition-colors hover:bg-muted"
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
        <!-- Mobile Menu Header -->
        <div class="flex shrink-0 items-center justify-between border-b border-border/50 px-8 py-5">
          <LandingBrandLogo @click="isMobileMenuOpen = false" />

          <button
            class="flex size-11 cursor-pointer items-center justify-center rounded-xl border-none bg-muted transition-colors hover:bg-accent"
            aria-label="Close mobile menu"
            @click="isMobileMenuOpen = false"
          >
            <HugeiconsIcon :icon="Cancel01Icon" class="size-5 text-foreground" />
          </button>
        </div>

        <!-- Mobile Menu Links -->
        <div class="flex flex-1 flex-col justify-center overflow-y-auto px-8 py-12">
          <ul class="m-0 flex list-none flex-col gap-8 p-0">
            <li v-for="(link, index) in links" :key="link.href" class="overflow-hidden">
              <NuxtLink
                :to="link.href"
                class="block font-sans text-3xl font-medium leading-tight no-underline transition-colors duration-200"
                :class="isLinkActive(link.href) ? 'text-primary' : 'text-foreground hover:text-primary'"
                :style="{ animationDelay: `${index * 75 + 100}ms` }"
                :aria-current="isLinkActive(link.href) ? 'page' : undefined"
                @click="isMobileMenuOpen = false"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Mobile Menu Footer CTAs -->
        <div class="flex shrink-0 flex-col gap-4 px-8 pb-12 pt-8">
          <template v-if="isSignedIn">
            <div class="w-full rounded-2xl border border-border bg-background p-2">
              <UserDropdown
                variant="sidebar"
                after-sign-out="stay"
                @signed-out="isMobileMenuOpen = false"
              />
            </div>
            <NuxtLink
              to="/dashboard"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl border-none bg-primary px-6 py-4 font-sans text-base font-medium text-primary-foreground no-underline shadow-sm transition-all duration-200 hover:bg-primary/90"
              @click="isMobileMenuOpen = false"
            >
              Go to dashboard
            </NuxtLink>
            <NuxtLink
              v-if="showFindLawyerCta"
              to="/find-lawyers"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-transparent px-6 py-4 font-sans text-base font-medium text-foreground no-underline transition-all duration-200 hover:bg-muted"
              @click="isMobileMenuOpen = false"
            >
              Find a lawyer
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink
              v-if="showFindLawyerCta"
              to="/find-lawyers"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl border-none bg-primary px-6 py-4 font-sans text-base font-medium text-primary-foreground no-underline shadow-sm transition-all duration-200 hover:bg-primary/90"
              @click="isMobileMenuOpen = false"
            >
              Find a lawyer
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-transparent px-6 py-4 font-sans text-base font-medium text-foreground no-underline transition-all duration-200 hover:bg-muted"
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

