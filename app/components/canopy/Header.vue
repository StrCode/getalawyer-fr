<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { getSessionUserType, isOnboardingIncomplete } from '~/lib/session-user'
import { APPLICATION_HOME } from '~/lib/setup-paths'

/**
 * Site header: a bar that condenses to a floating pill once the page scrolls. A highlight slides under
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
  <header class="sticky top-[env(safe-area-inset-top,0px)] z-30 py-2.75">
    <div class="mx-auto max-w-site safe-x">
      <div
        class="mx-auto flex items-center justify-between gap-4 rounded-full border py-1.75 pr-1.75 [transition:max-width_0.3s_var(--ease-canopy),padding_0.3s_var(--ease-canopy),background-color_0.3s,border-color_0.3s,box-shadow_0.3s]"
        :class="stuck
          ? 'max-w-232 border-border bg-card pl-4.5 shadow-pill'
          : 'max-w-site border-transparent pl-1'"
      >
        <CanopyBrand :condensed="stuck" />
        <nav
          ref="linksEl"
          aria-label="Main"
          class="relative flex gap-0.5 max-nav:hidden"
          @mouseleave="moveTo(current)"
          @focusout="moveTo(current)"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-mint [transition:transform_0.2s_var(--ease-canopy),width_0.2s_var(--ease-canopy),opacity_0.15s]"
            :style="{ width: `${glider.width}px`, transform: `translateX(${glider.x}px)`, opacity: glider.visible ? 1 : 0 }"
          />
          <NuxtLink
            v-for="link in links"
            :key="link.key"
            :to="link.to"
            :data-key="link.key"
            :aria-current="current === link.key ? 'true' : undefined"
            class="relative z-1 inline-flex min-h-10.5 items-center whitespace-nowrap rounded-full px-3.75 aria-[current=true]:text-foreground" :class="menuText"
            @mouseenter="moveTo(link.key)"
            @focus="moveTo(link.key)"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-1.5 text-sm font-normal">
          <ClientOnly><CanopyThemeToggle class="max-nav:hidden" /></ClientOnly>
          <CanopyAccountMenu v-if="isSignedIn" />
          <NuxtLink
            v-else
            to="/login"
            class="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4.5 transition-colors duration-250 hover:bg-mint max-nav:hidden"
          >
            Sign in
          </NuxtLink>
          <!-- Phones, signed in: the account button and the menu leave no room, so this
               button goes; the same link is in the menu. -->
          <Button as-child variant="canopy" size="pill-sm" class="group/btn gap-3 pr-1.5 max-sm:px-4" :class="isSignedIn && 'max-sm:hidden'">
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

  <Transition
    enter-active-class="transition-[opacity,translate] duration-200 ease-canopy"
    enter-from-class="translate-y-2 opacity-0"
    leave-active-class="transition-opacity duration-150 ease-out"
    leave-to-class="opacity-0"
  >
  <div
    v-if="menuOpen"
    id="site-menu"
    class="fixed inset-0 z-29 flex flex-col overflow-y-auto bg-background pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] safe-x"
    @keydown.esc="setMenu(false)"
  >
    <NuxtLink
      v-for="link in menuLinks"
      :key="link.to"
      :to="link.to"
      class="border-b border-border py-2.75 font-display text-3xl font-normal tracking-tight"
      @click="setMenu(false)"
    >
      {{ link.label }}
    </NuxtLink>
    <div class="mt-auto grid gap-2.5 pt-6">
      <ClientOnly><CanopyThemeSwitch block /></ClientOnly>
      <Button v-if="isLawyer" as-child variant="canopy" size="pill" class="w-full">
        <NuxtLink :to="primary.to">{{ primary.label }}</NuxtLink>
      </Button>
      <Button v-if="!isSignedIn" as-child variant="line" size="pill" class="w-full">
        <NuxtLink to="/login">Sign in</NuxtLink>
      </Button>
    </div>
  </div>
  </Transition>
</template>
