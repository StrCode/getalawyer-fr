<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'

/**
 * Homepage hero: headline and proof points, a photo with practice-area tabs
 * that swap an example question, and a full-width search rail.
 */
const examples = [
  { key: 'property', tab: 'Property', area: 'Property & tenancy', text: 'My landlord won’t return my deposit. Where do I stand?' },
  { key: 'family', tab: 'Family', area: 'Family law', text: 'We are separating. How is custody of our children decided?' },
  { key: 'work', tab: 'Work', area: 'Employment', text: 'I was dismissed without notice. Can I challenge it?' },
  { key: 'business', tab: 'Business', area: 'Corporate & business', text: 'I am starting a company with a partner. What should we sign first?' },
] as const

const active = ref(0)
const shown = ref(0)
const swapping = ref(false)
let rotate: ReturnType<typeof setInterval> | null = null
let swapTimer: ReturnType<typeof setTimeout> | null = null

function show(index: number) {
  active.value = index
  swapping.value = true
  if (swapTimer) clearTimeout(swapTimer)
  swapTimer = setTimeout(() => {
    shown.value = index
    swapping.value = false
  }, 280)
}

function pick(index: number) {
  if (rotate) {
    clearInterval(rotate)
    rotate = null
  }
  show(index)
}

onMounted(() => {
  // The tabs rotate on their own until the visitor picks one.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  rotate = setInterval(() => show((active.value + 1) % examples.length), 4800)
})
onBeforeUnmount(() => {
  if (rotate) clearInterval(rotate)
  if (swapTimer) clearTimeout(swapTimer)
})

const need = ref('')
const where = ref('')
const popular = ['Family law', 'Property & tenancy', 'Criminal defence', 'Employment', 'Business']

function directoryLink(keywords?: string, location?: string) {
  const query: Record<string, string> = {}
  if (keywords?.trim()) query.keywords = keywords.trim()
  if (location) query.location = location
  return { path: '/find-lawyers', query }
}

function search() {
  return navigateTo(directoryLink(need.value, where.value))
}
</script>

<template>
  <section class="c-hero">
    <div class="c-hero-text">
      <div class="c-chip c-a"><i />Every lawyer NIN &amp; SCN verified</div>
      <h1 class="c-display c-a">Get legal help <em>without the runaround.</em></h1>
      <p class="c-lede c-a">Search verified Nigerian lawyers by practice area and state, compare them, and message one in minutes.</p>
      <ul class="c-ticks c-a">
        <li><CanopyGlyph name="tick" :stroke="3" />Free to message</li>
        <li><CanopyGlyph name="tick" :stroke="3" />No commission on fees</li>
        <li><CanopyGlyph name="tick" :stroke="3" />All 36 states + FCT</li>
      </ul>
    </div>

    <div class="c-collage">
      <div class="c-photo">
        <NuxtImg src="/images/canopy/hero.jpg" width="900" height="1125" sizes="100vw lg:46vw" alt="A barrister in wig and gown, smiling" preload />
        <div class="c-tabs" role="group" aria-label="Example questions by practice area">
          <button
            v-for="(example, index) in examples"
            :key="example.key"
            type="button"
            :aria-pressed="active === index"
            @click="pick(index)"
          >
            {{ example.tab }}
          </button>
        </div>
      </div>
      <div class="c-seal" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <defs><path id="hero-seal-ring" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" /></defs>
          <circle cx="60" cy="60" r="59" fill="#CDF36B" />
          <text font-size="10.5" font-weight="700" letter-spacing="2.1" fill="#0B3327"><textPath href="#hero-seal-ring">NIN VERIFIED · SCN VERIFIED · </textPath></text>
        </svg>
        <div class="c-mark"><CanopyGlyph name="tick" :size="30" :stroke="3" /></div>
      </div>
      <div class="c-widget c-w-chat" :class="{ 'c-swap': swapping }" aria-live="polite">
        <div class="c-who"><CanopyGlyph name="chat" :size="18" /><span>{{ examples[shown]!.area }}</span></div>
        <p>{{ examples[shown]!.text }}</p>
        <span class="c-dots" role="img" aria-label="A lawyer is typing a reply"><i /><i /><i /></span>
      </div>
      <div class="c-widget c-w-slot">
        <CanopyGlyph name="calendar" :size="22" />
        <div><small>Consultation booked</small>Thu, 10:30 AM</div>
      </div>
    </div>

    <div class="c-hero-search c-a">
      <form class="c-search" @submit.prevent="search">
        <div class="c-f c-grow">
          <label for="hero-need">What do you need help with?</label>
          <input id="hero-need" v-model="need" type="text" placeholder="Tenancy dispute, divorce, unpaid salary…">
        </div>
        <div class="c-f">
          <label for="hero-where">Where?</label>
          <select id="hero-where" v-model="where">
            <option value="">All states</option>
            <option v-for="state in NIGERIA_STATE_NAMES" :key="state" :value="state">{{ state }}</option>
          </select>
        </div>
        <Button type="submit" variant="canopy" class="m-2 h-16 gap-4 self-center rounded-[1.1rem] pl-8 pr-3 text-[1.1rem] max-sm:w-[calc(100%-1rem)] max-sm:justify-between">
          Search lawyers<CanopyArrowChip />
        </Button>
      </form>
      <div class="c-popular">
        <span>Popular</span>
        <NuxtLink v-for="term in popular" :key="term" :to="directoryLink(term)">{{ term }}</NuxtLink>
      </div>
    </div>
  </section>
</template>
