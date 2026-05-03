<script setup lang="ts">
import { PhArrowRight, PhList, PhX } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'

const props = withDefaults(
  defineProps<{
    /** Overlays the hero on home; solidifies on scroll */
    transparent?: boolean
    /** Circle mark + wordmark (used on home layout) */
    showBrandName?: boolean
    /** Hide site nav links and mobile drawer (brand + CTAs only) */
    hideNavigation?: boolean
    /** Hide sign-in / dashboard / promo CTAs (brand-only strip) */
    hideHeaderActions?: boolean
  }>(),
  { transparent: false, showBrandName: false, hideNavigation: false, hideHeaderActions: false },
)

const isMenuOpen = ref(false)
const isElevated = ref(false)

// Auth
const { session, signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
  navigateTo('/')
}

let scrollTicking = false
const onWindowScroll = () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      isElevated.value = window.scrollY > 32
      scrollTicking = false
    })
    scrollTicking = true
  }
}

onMounted(() => {
  if (props.transparent) {
    window.addEventListener('scroll', onWindowScroll, { passive: true })
    onWindowScroll()
  }
})

onUnmounted(() => {
  if (props.transparent) {
    window.removeEventListener('scroll', onWindowScroll)
  }
})

const navLinks = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Practice Areas', to: '/practice-areas' },
  { label: 'For Lawyers', to: '/for-lawyers' }
]
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 motion-reduce:transition-none"
    :class="props.transparent
      ? (isElevated
        ? 'border-border bg-background/95 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/90'
        : 'border-transparent bg-transparent shadow-none')
      : 'border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80'"
  >
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div
        class="flex items-center gap-4 h-18"
        :class="props.hideHeaderActions ? 'justify-start' : 'justify-between'"
      >

        <!-- Logo -->
        <AppHeaderBrand
          :variant="props.showBrandName ? 'wordmark' : 'mark'"
          :on-hero="props.transparent && !isElevated"
        />

        <!-- Desktop Nav -->
        <nav v-if="!props.hideNavigation" class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="min-h-[44px] inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-black/4 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 dark:text-neutral-200 dark:hover:bg-white/6 dark:hover:text-white"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Right CTAs (always visible when nav is hidden — no hamburger) -->
        <div
          v-if="!props.hideHeaderActions"
          class="items-center gap-2"
          :class="props.hideNavigation ? 'flex' : 'hidden lg:flex'"
        >
          <template v-if="session">
            <NuxtLink
              to="/dashboard"
              class="min-h-[44px] inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-black/4 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 dark:text-neutral-200 dark:hover:bg-white/6 dark:hover:text-white"
            >
              Dashboard
            </NuxtLink>
            <button
              class="min-h-[44px] inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-black/4 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 dark:text-neutral-200 dark:hover:bg-white/6 dark:hover:text-white"
              @click="handleSignOut"
            >
              Sign out
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="min-h-[44px] inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-black/4 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 dark:text-neutral-200 dark:hover:bg-white/6 dark:hover:text-white"
            >
              Sign in
            </NuxtLink>
            <Button
              size="sm"
              as-child
              class="rounded-xl bg-brand-soft px-4 font-semibold text-brand shadow-none hover:bg-brand-soft-hover"
            >
              <NuxtLink to="/lawyers" class="inline-flex items-center gap-2">
                Find a Lawyer
                <PhArrowRight class="size-4 shrink-0" weight="bold" aria-hidden="true" />
              </NuxtLink>
            </Button>
          </template>
        </div>

        <!-- Mobile menu toggle -->
        <button
          v-if="!props.hideNavigation"
          type="button"
          class="flex size-11 items-center justify-center rounded-lg outline-none transition-colors hover:bg-black/6 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 lg:hidden dark:hover:bg-white/8"
          @click="isMenuOpen = !isMenuOpen"
          :aria-expanded="isMenuOpen"
          aria-label="Toggle menu"
        >
          <PhX v-if="isMenuOpen" class="size-5 text-neutral-700 dark:text-neutral-200" weight="bold" aria-hidden="true" />
          <PhList v-else class="size-5 text-neutral-700 dark:text-neutral-200" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-out"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="!props.hideNavigation && isMenuOpen"
        class="max-h-[80vh] overflow-y-auto border-t border-border bg-background lg:hidden"
      >
        <div class="space-y-1 mx-auto px-4 py-4 max-w-7xl">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block hover:bg-neutral-50 px-3 py-2.5 rounded-xl font-medium text-neutral-700 text-sm"
            @click="isMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>

          <div class="mt-2 flex flex-col gap-2 border-t border-border pt-4 pb-2">
            <template v-if="session">
              <Button variant="outline" as-child class="w-full rounded-xl font-semibold shadow-xs">
                <NuxtLink to="/dashboard" @click="isMenuOpen = false">Dashboard</NuxtLink>
              </Button>
              <button
                class="block hover:bg-neutral-50 px-4 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-700 text-sm text-center"
                @click="handleSignOut(); isMenuOpen = false"
              >
                Sign out
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="block hover:bg-neutral-50 px-4 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-700 text-sm text-center"
                @click="isMenuOpen = false"
              >
                Sign in
              </NuxtLink>
              <Button
                as-child
                class="w-full rounded-xl bg-brand-soft font-semibold text-brand shadow-none hover:bg-brand-soft-hover"
              >
                <NuxtLink to="/lawyers" class="inline-flex w-full items-center justify-center gap-2" @click="isMenuOpen = false">
                  Find a Lawyer
                  <PhArrowRight class="size-4 shrink-0" weight="bold" aria-hidden="true" />
                </NuxtLink>
              </Button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </header>

  <!-- Spacer: home overlays hero; other pages reserve bar height -->
  <div :class="props.transparent ? 'h-0' : 'h-18'" aria-hidden="true" />
</template>