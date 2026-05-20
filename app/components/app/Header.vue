<script setup lang="ts">
import { PhArrowRight, PhBriefcase, PhList, PhX } from '@phosphor-icons/vue'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

type LawyerMegaItem = {
  title: string
  description: string
  to: string
}

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

const route = useRoute()

const isMenuOpen = ref(false)
const isElevated = ref(false)

// Auth
const { session } = useAuth()

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

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
  },
)

const navItemBaseClass =
  'min-h-[52px] inline-flex items-center justify-center rounded-lg bg-transparent px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-none outline-none transition-colors hover:bg-black/4 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 data-[active]:bg-black/6 data-[active]:text-neutral-950 dark:text-neutral-200 dark:hover:bg-white/6 dark:hover:text-white dark:data-[active]:bg-white/8 dark:data-[active]:text-white'

/** Extra styles when route matches nav target (see `isPrimaryNavActive`). */
const navItemActiveClass =
  'bg-black/6 text-neutral-950 dark:bg-white/8 dark:text-white'

function isPrimaryNavActive(linkTo: string) {
  if (linkTo === '/practice-areas')
    return route.path === '/practice-areas'

  if (linkTo === '/contact')
    return route.path === '/contact'

  if (linkTo.includes('how-it-works'))
    return route.path === '/' && route.hash === '#how-it-works'

  return false
}

const isForLawyersSectionActive = computed(() => route.path === '/for-lawyers')

const primaryNavLinks = [
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Practice Areas', to: '/practice-areas' },
  { label: 'Contact', to: '/contact' },
] as const

const lawyerMegaSections: { heading: string; items: LawyerMegaItem[] }[] = [
  {
    heading: 'Explore',
    items: [
      {
        title: 'Overview',
        description: 'How GetaLawyer fits a modern practice.',
        to: '/for-lawyers',
      },
      {
        title: 'Membership',
        description: 'What subscription includes—verification, bookings, messaging.',
        to: '/for-lawyers#benefits',
      },
      {
        title: 'Pricing & plans',
        description: 'Monthly membership in Nigerian naira, no commissions on consults.',
        to: '/for-lawyers#pricing',
      },
      {
        title: 'Verification & credibility',
        description: 'Badge, bar verification, and how you go live.',
        to: '/for-lawyers#how-you-join',
      },
    ],
  },
  {
    heading: 'Get started',
    items: [
      {
        title: 'Register as a lawyer',
        description: 'Create your account and start onboarding.',
        to: '/register?role=lawyer',
      },
      {
        title: 'Lawyer dashboard',
        description: 'Bookings, listings, messages, and availability.',
        to: '/dashboard',
      },
    ],
  },
]

/** Hover matches top-level links (neutral wash); used in mega rows + mobile lawyer block. */
const megaRowClass =
  'block rounded-md p-3 no-underline outline-none transition-colors hover:bg-black/4 focus-visible:bg-black/4 dark:hover:bg-white/6 dark:focus-visible:bg-white/6'

/** Stacked “double button” backdrop (offset plate behind primary actions). */
const headerCtaStackShadow =
  'pointer-events-none absolute inset-0 z-0 rounded-xl bg-neutral-950 translate-x-[5px] translate-y-[5px] dark:bg-neutral-200'

const headerCtaStackMotion =
  'transition-[transform] duration-200 ease-out group-hover/header-cta:-translate-x-0.5 group-hover/header-cta:-translate-y-0.5 group-active/header-cta:translate-x-px group-active/header-cta:translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-x-0 motion-reduce:active:translate-y-0'

const closeMobile = () => {
  isMenuOpen.value = false
}
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
        class="flex h-23 items-center gap-4 px-px"
        :class="props.hideHeaderActions ? 'justify-start' : 'justify-between'"
      >

        <!-- Logo -->
        <AppHeaderBrand
          :variant="props.showBrandName ? 'wordmark' : 'mark'"
          :on-hero="props.transparent && !isElevated"
        />

        <!-- Desktop: full navigation menu -->
        <NavigationMenu
          v-if="!props.hideNavigation"
          :viewport="false"
          class="group/navigation-menu relative hidden max-w-max flex-none items-center lg:flex"
        >
          <NavigationMenuList class="flex flex-none items-center justify-start gap-4">
            <NavigationMenuItem v-for="link in primaryNavLinks" :key="link.to">
              <NavigationMenuLink as-child>
                <NuxtLink
                  :to="link.to"
                  :class="cn(navItemBaseClass, 'gap-2', isPrimaryNavActive(link.to) && navItemActiveClass)"
                  :aria-current="isPrimaryNavActive(link.to) ? 'page' : undefined"
                >
                  {{ link.label }}
                </NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger
                :class="cn(
                  navItemBaseClass,
                  'h-auto! w-max gap-1 pr-3',
                  isForLawyersSectionActive && navItemActiveClass,
                )"
                :aria-current="isForLawyersSectionActive ? 'page' : undefined"
              >
                For Lawyers
              </NavigationMenuTrigger>
              <NavigationMenuContent class="origin-top-center left-1/2 -translate-x-1/2 rounded-2xl p-3 shadow-md">
                <div
                  class="grid w-[min(calc(100vw-3rem),46rem)] gap-4 md:grid-cols-[minmax(12rem,0.95fr)_minmax(0,1.2fr)] lg:w-184"
                >
                  <NavigationMenuLink as-child class="p-0">
                    <NuxtLink
                      to="/for-lawyers"
                      class="group/hero relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-lg border border-border bg-linear-to-br from-primary/30 via-neutral-900 to-neutral-950 no-underline outline-none ring-1 ring-black/10 ring-inset transition-[filter,box-shadow] hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2 dark:ring-white/15 dark:focus-visible:ring-white/25 md:min-h-[220px]"
                    >
                      <PhBriefcase
                        class="pointer-events-none absolute -bottom-6 -right-4 size-35 rotate-[-8deg] text-white/10"
                        weight="regular"
                        aria-hidden="true"
                      />
                      <div
                        class="pointer-events-none absolute inset-x-4 top-3 h-[3px] max-w-11 rounded-full bg-primary/90"
                        aria-hidden="true"
                      />
                      <div class="relative space-y-1 p-5 text-white">
                        <p class="text-xs font-medium uppercase tracking-widest text-white/75">
                          For legal professionals
                        </p>
                        <p class="text-lg font-semibold leading-snug tracking-tight">
                          Grow your practice on GetaLawyer
                        </p>
                        <p class="text-sm leading-relaxed text-white/85">
                          Verified presence, bookings, and client relationships—with no commissions on consultations.
                        </p>
                      </div>
                    </NuxtLink>
                  </NavigationMenuLink>

                  <div
                    class="grid grid-cols-1 content-start gap-6 p-1 sm:grid-cols-2 sm:gap-8 md:min-h-[220px]"
                  >
                    <div v-for="section in lawyerMegaSections" :key="section.heading">
                      <p class="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {{ section.heading }}
                      </p>
                      <ul class="flex flex-col gap-0.5">
                        <li v-for="item in section.items" :key="item.to">
                          <NavigationMenuLink as-child>
                            <NuxtLink
                              :to="item.to"
                              :class="megaRowClass"
                            >
                              <span class="block font-medium leading-none text-neutral-950 dark:text-neutral-50">
                                {{ item.title }}
                              </span>
                              <span class="mt-1.5 block text-xs leading-snug text-muted-foreground">
                                {{ item.description }}
                              </span>
                            </NuxtLink>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Auth shortcuts (marketing lawyers path) -->
                <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-border border-t px-2 pt-4">
                  <template v-if="session">
                    <NuxtLink
                      to="/dashboard"
                      class="text-sm font-semibold text-neutral-950 underline-offset-4 transition-colors hover:underline dark:text-neutral-50"
                      @click="isMenuOpen = false"
                    >
                      Lawyer dashboard
                    </NuxtLink>
                  </template>
                  <template v-else>
                    <NuxtLink
                      to="/login"
                      class="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white"
                      @click="isMenuOpen = false"
                    >
                      Login
                    </NuxtLink>
                    <span class="select-none text-muted-foreground text-xs">or</span>
                    <NuxtLink
                      to="/register?role=lawyer"
                      class="text-sm font-semibold text-primary hover:text-primary"
                      @click="isMenuOpen = false"
                    >
                      Register as a lawyer
                    </NuxtLink>
                  </template>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <!-- Right CTAs -->
        <div
          v-if="!props.hideHeaderActions"
          class="items-center gap-3"
          :class="props.hideNavigation ? 'flex' : 'hidden lg:flex'"
        >
          <template v-if="session">
            <UserDropdown variant="header" />
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="group/header-cta relative isolate inline-flex rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/35 focus-visible:ring-offset-2 dark:focus-visible:ring-white/30"
            >
              <span :class="headerCtaStackShadow" aria-hidden="true" />
              <span
                :class="cn(
                  'relative z-10 inline-flex min-h-[52px] items-center justify-center rounded-xl border-2 border-neutral-950 bg-background px-6 text-sm font-semibold text-neutral-900 dark:border-neutral-100 dark:bg-background dark:text-neutral-50',
                  headerCtaStackMotion,
                )"
              >
                Sign in
              </span>
            </NuxtLink>
            <span class="group/header-cta relative isolate inline-flex rounded-xl">
              <span :class="headerCtaStackShadow" aria-hidden="true" />
              <NuxtLink
                to="/find-lawyers"
                :class="cn(
                  'relative z-10 inline-flex min-h-[52px] items-center gap-2 rounded-xl border-2 border-neutral-950 bg-muted px-6 text-sm font-semibold text-primary hover:bg-muted/80 dark:border-neutral-100',
                  headerCtaStackMotion,
                )"
              >
                Find a Lawyer
                <PhArrowRight class="size-4 shrink-0" weight="bold" aria-hidden="true" />
              </NuxtLink>
            </span>
          </template>
        </div>

        <!-- Mobile menu toggle -->
        <button
          v-if="!props.hideNavigation"
          type="button"
          class="flex size-12 items-center justify-center rounded-lg outline-none transition-colors hover:bg-black/6 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 lg:hidden dark:hover:bg-white/8"
          @click="isMenuOpen = !isMenuOpen"
          :aria-expanded="isMenuOpen"
          aria-label="Toggle menu"
        >
          <PhX v-if="isMenuOpen" class="size-6 text-neutral-700 dark:text-neutral-200" weight="bold" aria-hidden="true" />
          <PhList v-else class="size-6 text-neutral-700 dark:text-neutral-200" weight="bold" aria-hidden="true" />
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
        <div class="mx-auto space-y-1 px-4 py-4 max-w-7xl">
          <NuxtLink
            v-for="link in primaryNavLinks"
            :key="link.to"
            :to="link.to"
            :class="cn(
              'block rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-black/4 dark:text-neutral-200 dark:hover:bg-white/6',
              isPrimaryNavActive(link.to) && 'bg-black/6 text-neutral-950 dark:bg-white/8 dark:text-white',
            )"
            :aria-current="isPrimaryNavActive(link.to) ? 'page' : undefined"
            @click="closeMobile"
          >
            {{ link.label }}
          </NuxtLink>

          <div
            class="mt-3 rounded-xl border border-border bg-muted/40 p-2 dark:bg-white/4"
            :class="isForLawyersSectionActive && 'ring-1 ring-neutral-900/10 dark:ring-white/15'"
          >
            <p class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              For lawyers
            </p>
            <div
              v-for="section in lawyerMegaSections"
              :key="`m-${section.heading}`"
              class="border-neutral-200/80 border-t pt-3 first:border-t-0 first:pt-0 dark:border-neutral-700/60"
            >
              <p class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {{ section.heading }}
              </p>
              <NuxtLink
                v-for="item in section.items"
                :key="item.to"
                :to="item.to"
                :class="cn('block rounded-lg px-3 py-2.5 text-neutral-950 dark:text-neutral-50', megaRowClass)"
                @click="closeMobile"
              >
                <span class="block text-sm font-medium">{{ item.title }}</span>
                <span class="mt-0.5 block text-xs leading-snug text-muted-foreground">{{ item.description }}</span>
              </NuxtLink>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-neutral-200/80 border-t px-3 pt-3 dark:border-neutral-700/60">
              <template v-if="session">
                <NuxtLink
                  to="/dashboard"
                  class="text-sm font-semibold text-neutral-950 dark:text-neutral-50"
                  @click="closeMobile"
                >
                  Lawyer dashboard
                </NuxtLink>
              </template>
              <template v-else>
                <NuxtLink
                  to="/login"
                  class="text-sm font-medium text-neutral-700 dark:text-neutral-200"
                  @click="closeMobile"
                >
                  Login
                </NuxtLink>
                <span class="text-muted-foreground text-xs">or</span>
                <NuxtLink
                  to="/register?role=lawyer"
                  class="text-sm font-semibold text-primary"
                  @click="closeMobile"
                >
                  Register
                </NuxtLink>
              </template>
            </div>
          </div>

          <div class="mt-2 flex flex-col gap-2 border-t border-border pt-4 pb-2">
            <template v-if="session">
              <div class="flex items-center gap-3">
                <NuxtLink
                  to="/dashboard"
                  class="group/header-cta relative isolate inline-flex min-w-0 flex-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/35 focus-visible:ring-offset-2 dark:focus-visible:ring-white/30"
                  @click="closeMobile"
                >
                  <span :class="headerCtaStackShadow" aria-hidden="true" />
                  <span
                    :class="cn(
                      'relative z-10 inline-flex min-h-[52px] w-full min-w-0 items-center justify-center rounded-xl border-2 border-neutral-950 bg-background px-4 text-sm font-semibold text-neutral-900 dark:border-neutral-100 dark:bg-background dark:text-neutral-50',
                      headerCtaStackMotion,
                    )"
                  >
                    Dashboard
                  </span>
                </NuxtLink>
                <UserDropdown variant="header" />
              </div>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="group/header-cta relative isolate flex w-full justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/35 focus-visible:ring-offset-2 dark:focus-visible:ring-white/30"
                @click="closeMobile"
              >
                <span :class="headerCtaStackShadow" aria-hidden="true" />
                <span
                  :class="cn(
                    'relative z-10 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-neutral-950 bg-background px-4 text-sm font-semibold text-neutral-900 dark:border-neutral-100 dark:bg-background dark:text-neutral-50',
                    headerCtaStackMotion,
                  )"
                >
                  Sign in
                </span>
              </NuxtLink>
              <span class="group/header-cta relative isolate flex w-full justify-center rounded-xl">
                <span :class="headerCtaStackShadow" aria-hidden="true" />
                <NuxtLink
                  to="/find-lawyers"
                  :class="cn(
                    'relative z-10 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-neutral-950 bg-muted px-4 text-sm font-semibold text-primary hover:bg-muted/80 dark:border-neutral-100',
                    headerCtaStackMotion,
                  )"
                  @click="closeMobile"
                >
                  Find a Lawyer
                  <PhArrowRight class="size-4 shrink-0" weight="bold" aria-hidden="true" />
                </NuxtLink>
              </span>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </header>

  <!-- Spacer: home overlays hero; other pages reserve bar height -->
  <div :class="props.transparent ? 'h-0' : 'h-23'" aria-hidden="true" />
</template>
