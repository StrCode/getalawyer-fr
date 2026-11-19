<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { getSessionUserType, isOnboardingIncomplete } from '~/lib/session-user'
import { APPLICATION_HOME } from '~/lib/setup-paths'

/**
 * Site header: a lime strip for the second audience (lawyers), then a bar that
 * condenses to a floating pill once the page scrolls. A highlight slides under
 * the hovered or current link; small screens get a full-screen menu.
 *
 * The menu goes to the site's pages. "How it works" has no page of its own, so
 * it goes to that part of the homepage and lights up while it is on screen.
 */
const route = useRoute()
const { session } = useAuth()
const isSignedIn = computed(() => Boolean(session.value?.user))
const isLawyer = computed(() => getSessionUserType(session.value?.user) === 'lawyer')
/** The bar's one button: clients look for a lawyer; lawyers go to their own side of the site. */
const primary = computed(() => {
  if (!isLawyer.value) return { label: 'Find a lawyer', to: '/find-lawyers' }
  return isOnboardingIncomplete(session.value?.user)
    ? { label: 'Your application', to: APPLICATION_HOME }
    : { label: 'Dashboard', to: '/dashboard' }
})

const { data: pricing } = useMembershipPlans()
const fromPrice = computed(() => {
  const plans = pricing.value?.plans ?? []
  if (!plans.length) return null
  const cheapest = [...plans].sort((a, b) => a.priceNaira - b.priceNaira)[0]!
  return `${formatNairaAmount(cheapest.priceNaira)} ${cheapest.termMonths === 1 ? 'a month' : `for ${termPhrase(cheapest.termMonths)}`}`
})

// `key` names the link for the sliding highlight. A link with `section` goes to
// that part of the homepage and is current while it is on screen; the others
// are pages, current while the visitor is on them.
const links: { key: string, label: string, to: string, section?: string }[] = [
  { key: 'areas', label: 'Practice areas', to: '/practice-areas' },
  { key: 'how', label: 'How it works', to: '/#how', section: 'how' },
  { key: 'lawyers', label: 'For lawyers', to: '/for-lawyers' },
  { key: 'pricing', label: 'Pricing', to: '/pricing' },
]

const menuLinks = [
  { label: 'Find a lawyer', to: '/find-lawyers' },
  ...links,
  { label: 'Contact', to: '/contact' },
]

/** The link for the page the visitor is on, if it is one of the menu's pages. */
function pageKey() {
  return links.find(link => !link.section && (route.path === link.to || route.path.startsWith(`${link.to}/`)))?.key ?? null
}

const stuck = ref(false)
const menuOpen = ref(false)
const current = ref<string | null>(null)
const linksEl = ref<HTMLElement | null>(null)
const glider = ref({ width: 0, x: 0, visible: false })

function moveTo(key: string | null) {
  const el = key ? linksEl.value?.querySelector<HTMLElement>(`[data-key="${key}"]`) : null
  if (!el || !linksEl.value) {
    glider.value = { ...glider.value, visible: false }
    return
  }
  const box = linksEl.value.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  glider.value = { width: r.width, x: r.left - box.left, visible: true }
}

let ticking = false
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    stuck.value = window.scrollY > 40
    // Back in the hero: no section is current, so drop the highlight.
    if (route.path === '/' && window.scrollY < 300 && current.value) {
      current.value = null
      if (!linksEl.value?.matches(':hover')) moveTo(null)
    }
    ticking = false
  })
}

let spy: IntersectionObserver | null = null
function watchSections() {
  spy?.disconnect()
  current.value = pageKey()
  moveTo(current.value)
  if (route.path !== '/' || !('IntersectionObserver' in window)) return
  spy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const link = links.find(item => item.section === entry.target.id)
      if (!link) continue
      // Lit while its part of the homepage is on screen, and not after.
      if (entry.isIntersecting) current.value = link.key
      else if (current.value === link.key) current.value = null
      if (!linksEl.value?.matches(':hover')) moveTo(current.value)
    }
  }, { rootMargin: '-35% 0px -55% 0px' })
  for (const link of links) {
    const el = link.section ? document.getElementById(link.section) : null
    if (el) spy.observe(el)
  }
}

function setMenu(open: boolean) {
  menuOpen.value = open
  document.documentElement.classList.toggle('overflow-hidden', open)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  nextTick(watchSections)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  spy?.disconnect()
  document.documentElement.classList.remove('overflow-hidden')
})
watch(() => route.fullPath, () => {
  setMenu(false)
  nextTick(watchSections)
})
</script>

<template>
  <div class="bg-lime text-[0.85rem] font-semibold text-night" data-surface="lime">
    <div class="mx-auto flex max-w-site flex-wrap items-center justify-between gap-x-6 gap-y-[0.2rem] py-[0.55rem] safe-x max-sm:justify-center">
      <span class="max-sm:hidden">Message any lawyer free. You only agree a fee if you need more.</span>
      <NuxtLink to="/for-lawyers" class="group/strip inline-flex items-center gap-[0.35rem] underline underline-offset-[3px]">
        Are you a lawyer? Join<template v-if="fromPrice"> from {{ fromPrice }}</template>
        <CanopyGlyph name="arrow" :stroke="2.4" class="transition-transform duration-300 ease-canopy group-hover/strip:translate-x-[3px]" />
      </NuxtLink>
    </div>
  </div>

  <header class="sticky top-[env(safe-area-inset-top,0px)] z-30 py-[0.7rem]">
    <div class="mx-auto max-w-site safe-x">
      <div
        class="mx-auto flex items-center justify-between gap-4 rounded-full border py-[0.45rem] pr-[0.45rem] [transition:max-width_0.6s_cubic-bezier(0.22,0.8,0.26,1),padding_0.6s_cubic-bezier(0.22,0.8,0.26,1),background-color_0.4s,border-color_0.4s,box-shadow_0.4s]"
        :class="stuck
          ? 'max-w-[58rem] border-border bg-glass pl-[1.1rem] shadow-pill backdrop-blur-[16px] backdrop-saturate-[1.4]'
          : 'max-w-site border-transparent pl-1'"
      >
        <CanopyBrand :condensed="stuck" />
        <nav
          ref="linksEl"
          aria-label="Main"
          class="relative flex gap-[0.15rem] text-[0.95rem] font-medium text-muted-foreground max-nav:hidden"
          @mouseleave="moveTo(current)"
          @focusout="moveTo(current)"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-mint [transition:transform_0.45s_cubic-bezier(0.22,0.8,0.26,1),width_0.45s_cubic-bezier(0.22,0.8,0.26,1),opacity_0.25s]"
            :style="{ width: `${glider.width}px`, transform: `translateX(${glider.x}px)`, opacity: glider.visible ? 1 : 0 }"
          />
          <NuxtLink
            v-for="link in links"
            :key="link.key"
            :to="link.to"
            :data-key="link.key"
            :aria-current="current === link.key ? 'true' : undefined"
            class="relative z-1 inline-flex min-h-[2.6rem] items-center whitespace-nowrap rounded-full px-[0.95rem] transition-colors duration-[250ms] hover:text-foreground aria-[current=true]:text-foreground"
            @mouseenter="moveTo(link.key)"
            @focus="moveTo(link.key)"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-[0.4rem] text-[0.95rem] font-semibold">
          <ClientOnly><CanopyThemeToggle class="max-nav:hidden" /></ClientOnly>
          <CanopyAccountMenu v-if="isSignedIn" />
          <NuxtLink
            v-else
            to="/login"
            class="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-[1.1rem] transition-colors duration-[250ms] hover:bg-mint max-nav:hidden"
          >
            Sign in
          </NuxtLink>
          <Button as-child variant="canopy" size="pill-sm" class="group/btn gap-3 pr-1.5 max-sm:px-4">
            <NuxtLink :to="primary.to">{{ primary.label }}<CanopyArrowChip class="max-sm:hidden" /></NuxtLink>
          </Button>
          <button
            type="button"
            class="hidden size-11 cursor-pointer place-items-center rounded-full border border-border bg-card text-foreground max-nav:grid"
            :aria-expanded="menuOpen"
            aria-controls="site-menu"
            :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
            @click="setMenu(!menuOpen)"
          >
            <CanopyGlyph :name="menuOpen ? 'close' : 'menu'" :size="20" :stroke="2.2" />
          </button>
        </div>
      </div>
    </div>
  </header>

  <div
    v-if="menuOpen"
    id="site-menu"
    class="fixed inset-0 z-29 flex animate-menu-in flex-col overflow-y-auto bg-background pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] safe-x"
    @keydown.esc="setMenu(false)"
  >
    <NuxtLink
      v-for="link in menuLinks"
      :key="link.to"
      :to="link.to"
      class="border-b border-border py-[0.7rem] font-display text-[2rem] font-[650] tracking-[-0.03em]"
      @click="setMenu(false)"
    >
      {{ link.label }}
    </NuxtLink>
    <div class="mt-auto grid gap-[0.6rem] pt-6">
      <ClientOnly><CanopyThemeSwitch block /></ClientOnly>
      <Button v-if="isLawyer" as-child variant="canopy" size="pill" class="h-13 w-full">
        <NuxtLink :to="primary.to">{{ primary.label }}</NuxtLink>
      </Button>
      <Button v-if="!isSignedIn" as-child variant="line" size="pill" class="h-13 w-full">
        <NuxtLink to="/login">Sign in</NuxtLink>
      </Button>
    </div>
  </div>
</template>
