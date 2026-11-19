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

const menuLinks = [...links, { full: 'Pricing', to: '/pricing' }]

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
            :key="link.section"
            :to="link.to"
            :data-section="link.section"
            :aria-current="current === link.section ? 'true' : undefined"
            class="relative z-1 inline-flex min-h-[2.6rem] items-center whitespace-nowrap rounded-full px-[0.95rem] transition-colors duration-[250ms] hover:text-foreground aria-[current=true]:text-foreground"
            @mouseenter="moveTo(link.section)"
            @focus="moveTo(link.section)"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-[0.4rem] text-[0.95rem] font-semibold">
          <ClientOnly><CanopyThemeToggle class="max-nav:hidden" /></ClientOnly>
          <UserMenu v-if="isSignedIn" variant="nav" />
          <NuxtLink
            v-else
            to="/login"
            class="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-[1.1rem] transition-colors duration-[250ms] hover:bg-mint max-nav:hidden"
          >
            Sign in
          </NuxtLink>
          <Button v-if="showFindLawyer" as-child variant="canopy" size="pill-sm" class="group/btn gap-3 pr-1.5 max-sm:px-4">
            <NuxtLink to="/find-lawyers">Find a lawyer<CanopyArrowChip class="max-sm:hidden" /></NuxtLink>
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
      {{ link.full }}
    </NuxtLink>
    <div class="mt-auto grid gap-[0.6rem] pt-6">
      <ClientOnly><CanopyThemeSwitch block /></ClientOnly>
      <Button v-if="showFindLawyer" as-child variant="canopy" size="pill" class="h-13 w-full">
        <NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink>
      </Button>
      <Button v-if="!isSignedIn" as-child variant="line" size="pill" class="h-13 w-full">
        <NuxtLink to="/login">Sign in</NuxtLink>
      </Button>
    </div>
  </div>
</template>
