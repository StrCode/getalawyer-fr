<script setup lang="ts">
import UserMenu from '@/components/UserMenu.vue'
import { Button } from '@/components/ui/button'
import { getSessionUserType } from '~/lib/session-user'

/**
 * Site header: a lime strip for the second audience (lawyers), then a bar that
 * condenses to a floating pill once the page scrolls. A highlight slides under
 * the hovered or current link; small screens get a full-screen menu.
 */
const route = useRoute()
const { session } = useAuth()
const isSignedIn = computed(() => Boolean(session.value?.user))
const showFindLawyer = computed(() => getSessionUserType(session.value?.user) !== 'lawyer')

const { data: pricing } = useMembershipPlans()
const fromPrice = computed(() => {
  const plans = pricing.value?.plans ?? []
  if (!plans.length) return null
  const cheapest = [...plans].sort((a, b) => a.priceNaira - b.priceNaira)[0]!
  return `${formatNairaAmount(cheapest.priceNaira)} ${cheapest.termMonths === 1 ? 'a month' : `for ${termPhrase(cheapest.termMonths)}`}`
})

// `label` is the short form for the bar; `full` is used where there is room (mobile menu).
const links = [
  { label: 'Areas', full: 'Practice areas', to: '/#areas', section: 'areas' },
  { label: 'Why us', full: 'Why getalawyer', to: '/#why', section: 'why' },
  { label: 'How it works', full: 'How it works', to: '/#how', section: 'how' },
  { label: 'For lawyers', full: 'For lawyers', to: '/#join', section: 'join' },
]

const stuck = ref(false)
const menuOpen = ref(false)
const current = ref<string | null>(null)
const linksEl = ref<HTMLElement | null>(null)
const glider = ref({ width: 0, x: 0, visible: false })

function moveTo(section: string | null) {
  const el = section ? linksEl.value?.querySelector<HTMLElement>(`[data-section="${section}"]`) : null
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
    if (window.scrollY < 300 && current.value) {
      current.value = null
      if (!linksEl.value?.matches(':hover')) moveTo(null)
    }
    ticking = false
  })
}

let spy: IntersectionObserver | null = null
function watchSections() {
  spy?.disconnect()
  current.value = null
  moveTo(null)
  if (route.path !== '/' || !('IntersectionObserver' in window)) return
  spy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      current.value = entry.target.id
      if (!linksEl.value?.matches(':hover')) moveTo(current.value)
    }
  }, { rootMargin: '-35% 0px -55% 0px' })
  for (const link of links) {
    const el = document.getElementById(link.section)
    if (el) spy.observe(el)
  }
}

function setMenu(open: boolean) {
  menuOpen.value = open
  document.documentElement.classList.toggle('c-menu-open', open)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  nextTick(watchSections)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  spy?.disconnect()
  document.documentElement.classList.remove('c-menu-open')
})
watch(() => route.fullPath, () => {
  setMenu(false)
  nextTick(watchSections)
})
</script>

<template>
  <div class="c-strip">
    <div class="c-wrap c-strip-in">
      <span>Message any lawyer free. You only agree a fee if you need more.</span>
      <NuxtLink to="/for-lawyers">
        Are you a lawyer? Join<template v-if="fromPrice"> from {{ fromPrice }}</template>
        <CanopyGlyph name="arrow" :stroke="2.4" />
      </NuxtLink>
    </div>
  </div>

  <header class="c-nav" :class="{ 'c-stuck': stuck }">
    <div class="c-wrap">
      <div class="c-nav-bar">
        <CanopyBrand />
        <nav ref="linksEl" class="c-nav-links" aria-label="Main" @mouseleave="moveTo(current)" @focusout="moveTo(current)">
          <span
            class="c-glider"
            aria-hidden="true"
            :style="{ width: `${glider.width}px`, transform: `translateX(${glider.x}px)`, opacity: glider.visible ? 1 : 0 }"
          />
          <NuxtLink
            v-for="link in links"
            :key="link.section"
            :to="link.to"
            :data-section="link.section"
            :aria-current="current === link.section ? 'true' : undefined"
            @mouseenter="moveTo(link.section)"
            @focus="moveTo(link.section)"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="c-nav-cta">
          <ClientOnly><CanopyThemeToggle /></ClientOnly>
          <UserMenu v-if="isSignedIn" variant="nav" />
          <NuxtLink v-else class="c-signin" to="/login">Sign in</NuxtLink>
          <Button v-if="showFindLawyer" as-child variant="canopy" size="pill-sm" class="gap-3 pr-1.5 max-sm:px-4">
            <NuxtLink to="/find-lawyers">Find a lawyer<CanopyArrowChip class="max-sm:hidden" /></NuxtLink>
          </Button>
          <button
            class="c-menu-btn"
            type="button"
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

  <div v-if="menuOpen" id="site-menu" class="c-menu" @keydown.esc="setMenu(false)">
    <NuxtLink v-for="link in links" :key="link.section" class="c-big" :to="link.to" @click="setMenu(false)">{{ link.full }}</NuxtLink>
    <NuxtLink class="c-big" to="/pricing" @click="setMenu(false)">Pricing</NuxtLink>
    <div class="c-acts">
      <ClientOnly><CanopyThemeSwitch /></ClientOnly>
      <Button v-if="showFindLawyer" as-child variant="canopy" size="pill" class="h-13 w-full">
        <NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink>
      </Button>
      <Button v-if="!isSignedIn" as-child variant="line" size="pill" class="h-13 w-full">
        <NuxtLink to="/login">Sign in</NuxtLink>
      </Button>
    </div>
  </div>
</template>
