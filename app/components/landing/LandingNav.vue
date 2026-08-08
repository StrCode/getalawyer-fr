<script setup lang="ts">
import { ArrowRight01Icon, Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import UserMenu from '@/components/UserMenu.vue'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)

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
              class="cursor-pointer font-heading text-sm font-medium no-underline transition-colors duration-200"
              :class="isLinkActive(link.href)
                ? 'text-primary'
                : 'text-foreground hover:text-primary'"
              :aria-current="isLinkActive(link.href) ? 'page' : undefined"
            >{{ link.label }}</NuxtLink>
          </li>
        </ul>

        <!-- Desktop CTAs -->
        <div class="hidden items-center gap-2 lg:flex">
          <UserMenu
            v-if="isSignedIn"
            variant="nav"
            @signed-out="isMobileMenuOpen = false"
          />
          <Button
            v-else
            as-child
            variant="ghost"
          >
            <NuxtLink to="/login">Sign in</NuxtLink>
          </Button>
          <Button
            v-if="showFindLawyerCta"
            as-child
          >
            <NuxtLink to="/find-lawyers">
              Find a lawyer
              <HugeiconsIcon :icon="ArrowRight01Icon" class="size-4" aria-hidden="true" />
            </NuxtLink>
          </Button>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Open menu"
            @click="isMobileMenuOpen = true"
          >
            <HugeiconsIcon :icon="Menu01Icon" class="size-6" />
          </Button>
        </div>
      </div>
    </nav>

    <!-- Mobile menu: full-screen Sheet — focus trap, Esc, and scroll lock come
         from the dialog primitive instead of hand-rolled body/overflow code. -->
    <Sheet v-model:open="isMobileMenuOpen">
      <SheetContent
        side="right"
        class="w-full gap-0 p-0 sm:max-w-none [&>button:last-of-type]:hidden"
      >
        <SheetHeader class="sr-only">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Site navigation</SheetDescription>
        </SheetHeader>

        <div class="flex h-full flex-col bg-background">
          <!-- Header -->
          <div class="flex shrink-0 items-center justify-between border-b border-border/50 px-8 py-5">
            <LandingBrandLogo @click="isMobileMenuOpen = false" />
            <Button
              variant="secondary"
              size="icon-lg"
              aria-label="Close menu"
              @click="isMobileMenuOpen = false"
            >
              <HugeiconsIcon :icon="Cancel01Icon" class="size-5" />
            </Button>
          </div>

          <!-- Links -->
          <div class="flex flex-1 flex-col justify-center overflow-y-auto px-8 py-12">
            <ul class="m-0 flex list-none flex-col gap-8 p-0">
              <li v-for="(link, index) in links" :key="link.href" class="overflow-hidden">
                <NuxtLink
                  :to="link.href"
                  class="block font-heading text-3xl font-medium leading-tight no-underline transition-colors duration-200"
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

          <!-- Footer CTAs -->
          <div class="flex shrink-0 flex-col gap-4 px-8 pb-12 pt-8">
            <template v-if="isSignedIn">
              <div class="flex w-full items-center rounded-2xl border border-border bg-background p-3">
                <UserMenu
                  variant="nav"
                  after-sign-out="stay"
                  @signed-out="isMobileMenuOpen = false"
                />
              </div>
              <Button as-child size="lg" class="w-full">
                <NuxtLink to="/dashboard" @click="isMobileMenuOpen = false">
                  Go to dashboard
                </NuxtLink>
              </Button>
              <Button
                v-if="showFindLawyerCta"
                as-child
                variant="outline"
                size="lg"
                class="w-full"
              >
                <NuxtLink to="/find-lawyers" @click="isMobileMenuOpen = false">
                  Find a lawyer
                </NuxtLink>
              </Button>
            </template>
            <template v-else>
              <Button
                v-if="showFindLawyerCta"
                as-child
                size="lg"
                class="w-full"
              >
                <NuxtLink to="/find-lawyers" @click="isMobileMenuOpen = false">
                  Find a lawyer
                </NuxtLink>
              </Button>
              <Button as-child variant="outline" size="lg" class="w-full">
                <NuxtLink to="/login" @click="isMobileMenuOpen = false">
                  Sign in
                </NuxtLink>
              </Button>
            </template>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
