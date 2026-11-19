<script setup lang="ts">

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

const stats = [
  { value: 'Free', label: 'to message any lawyer' },
  { value: '0%', label: 'commission on fees' },
  { value: '36 + FCT', label: 'states covered' },
]

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
  <section
    data-surface="forest"
    class="relative grid grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] items-center gap-x-[clamp(2rem,5vw,4.5rem)] gap-y-[clamp(2.25rem,4vw,3.5rem)] overflow-hidden rounded-panel bg-forest px-[clamp(1.25rem,4.5vw,4.5rem)] py-[clamp(1.75rem,3.4vw,3rem)] text-white tab:min-h-[clamp(36rem,80svh,45rem)] max-tab:grid-cols-1 max-sm:rounded-[1.75rem]"
  >
    <div class="col-start-1 row-start-1 min-w-0 tab:relative tab:z-2">
      <div class="inline-flex animate-rise-in items-center gap-2 rounded-full border border-white/14 bg-forest-2 px-[0.9rem] py-[0.4rem] text-[0.85rem] font-semibold">
        <i class="size-2 rounded-full bg-lime" />Every lawyer NIN &amp; SCN verified
      </div>
      <h1 class="mt-5 animate-rise-in text-[clamp(2.7rem,5.3vw,4.7rem)] font-[620] leading-[1.02] tracking-[-0.04em] text-balance [animation-delay:80ms]">
        Get legal help <em class="text-lime not-italic">without the runaround.</em>
      </h1>
      <p class="mt-[1.4rem] max-w-[34rem] animate-rise-in text-[1.15rem] text-on-forest [animation-delay:160ms]">
        Search verified Nigerian lawyers by practice area and state, compare them, and message one in minutes.
      </p>
      <ul class="mt-8 flex animate-rise-in flex-wrap gap-y-[1.1rem] [animation-delay:240ms] max-sm:grid max-sm:grid-cols-3 max-sm:gap-0">
        <li
          v-for="stat in stats"
          :key="stat.value"
          class="grid gap-[0.15rem] border-l border-white/18 px-[1.4rem] first:border-l-0 first:pl-0 max-sm:content-start max-sm:px-[0.8rem] max-sm:first:pl-0"
        >
          <b class="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] font-[650] leading-[1.05] tracking-[-0.03em] whitespace-nowrap text-lime max-sm:text-[1.25rem]">{{ stat.value }}</b>
          <span class="text-[0.86rem] whitespace-nowrap text-on-forest max-sm:text-[0.78rem] max-sm:leading-[1.3] max-sm:whitespace-normal">{{ stat.label }}</span>
        </li>
      </ul>
    </div>

    <!-- Wide screens: the photo fills the right side of the panel and the cards sit on it.
         Narrower: a framed photo with the cards overlapping its edges, below the search. -->
    <div class="relative col-start-1 row-start-3 mx-auto w-[min(100%,22.5rem)] pb-8 pt-2 tab:absolute tab:inset-y-0 tab:right-0 tab:left-auto tab:col-auto tab:row-auto tab:m-0 tab:w-[47%] tab:max-w-none tab:p-0">
      <div class="relative aspect-[4/5] max-w-full animate-photo-in overflow-hidden rounded-[2.25rem] bg-forest-2 tab:absolute tab:inset-0 tab:aspect-auto tab:rounded-none">
        <NuxtImg
          src="/images/canopy/hero.jpg"
          width="1201"
          height="1800"
          sizes="100vw lg:46vw"
          alt="A lawyer seated between shelves of law books, smiling"
          preload
          class="size-full object-cover tab:object-[50%_10%]"
        />
        <span aria-hidden="true" class="pointer-events-none absolute inset-0 hidden hero-photo-fade tab:block" />
        <div
          role="group"
          aria-label="Example questions by practice area"
          class="absolute inset-x-[0.7rem] top-[0.7rem] flex gap-[0.2rem] rounded-full bg-white/84 p-[0.3rem] backdrop-blur-[10px] tab:top-[calc(44%-3.75rem)] tab:right-auto tab:left-[calc(50%-8.5rem)] tab:z-2 tab:w-[17rem]"
        >
          <button
            v-for="(example, index) in examples"
            :key="example.key"
            type="button"
            class="min-h-11 min-w-0 flex-1 cursor-pointer rounded-full px-[0.3rem] text-[0.82rem] font-semibold text-night transition-colors duration-300 aria-pressed:bg-forest aria-pressed:text-white tab:px-[0.15rem] tab:text-[0.78rem]"
            :aria-pressed="active === index"
            @click="pick(index)"
          >
            {{ example.tab }}
          </button>
        </div>
      </div>

      <div aria-hidden="true" class="absolute top-[4.2rem] -right-[1.8rem] size-[6.4rem] animate-widget [animation-delay:0.4s,0.8s] max-sm:-right-2 tab:top-7 tab:right-7 tab:z-2">
        <svg viewBox="0 0 120 120" class="size-full animate-seal">
          <defs><path id="hero-seal-ring" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" /></defs>
          <circle cx="60" cy="60" r="59" fill="#CDF36B" />
          <text font-size="10.5" font-weight="700" letter-spacing="2.1" fill="#0B3327"><textPath href="#hero-seal-ring">NIN VERIFIED · SCN VERIFIED · </textPath></text>
        </svg>
        <div class="absolute inset-0 grid place-items-center text-forest"><CanopyGlyph name="tick" :size="30" :stroke="3" /></div>
      </div>

      <div
        aria-live="polite"
        class="absolute -right-[2.6rem] bottom-[5.4rem] w-[14.5rem] animate-widget rounded-[1.25rem] bg-card px-4 py-[0.85rem] text-[0.9rem] leading-[1.35] text-foreground shadow-widget [animation-delay:0.75s,2.2s] max-sm:-right-[0.4rem] max-sm:w-[13rem] tab:top-[44%] tab:right-auto tab:bottom-auto tab:left-[calc(50%-8.5rem)] tab:z-2 tab:w-[17rem]"
      >
        <div class="flex items-center gap-[0.55rem] text-[0.85rem] font-bold transition-opacity duration-[280ms]" :class="{ 'opacity-0': swapping }">
          <CanopyGlyph name="chat" :size="18" class="flex-none" /><span>{{ examples[shown]!.area }}</span>
        </div>
        <p class="mt-2 rounded-[0.9rem_0.9rem_0.9rem_0.3rem] bg-mint px-3 py-[0.55rem] transition-opacity duration-[280ms]" :class="{ 'opacity-0': swapping }">
          {{ examples[shown]!.text }}
        </p>
        <span role="img" aria-label="A lawyer is typing a reply" class="mt-2 inline-flex gap-1 rounded-full bg-primary px-[0.7rem] py-2">
          <i class="size-[0.36rem] animate-typing rounded-full bg-white" />
          <i class="size-[0.36rem] animate-typing rounded-full bg-white [animation-delay:0.18s]" />
          <i class="size-[0.36rem] animate-typing rounded-full bg-white [animation-delay:0.36s]" />
        </span>
      </div>

      <div class="absolute bottom-[0.4rem] -left-[1.2rem] flex animate-widget items-center gap-[0.7rem] rounded-[1.25rem] bg-lime px-4 py-[0.85rem] text-[0.9rem] leading-[1.35] font-bold text-night shadow-widget [animation-delay:0.95s,3s] max-sm:-left-[0.2rem] tab:top-[24%] tab:right-6 tab:bottom-auto tab:left-auto tab:z-2">
        <CanopyGlyph name="calendar" :size="22" />
        <div><small class="block text-[0.76rem] font-semibold text-[#2C4A12]">Consultation booked</small>Thu, 10:30 AM</div>
      </div>
    </div>

    <div class="col-start-1 row-start-2 min-w-0 animate-rise-in [animation-delay:160ms] tab:relative tab:z-2 tab:col-span-2">
      <CanopySearchRail v-model:need="need" v-model:where="where" id-prefix="hero" @submit="search" />
      <div class="mt-[1.15rem] flex flex-wrap items-center gap-2 text-[0.9rem] text-on-forest">
        <span>Popular</span>
        <NuxtLink
          v-for="term in popular"
          :key="term"
          :to="directoryLink(term)"
          class="inline-flex min-h-[2.6rem] items-center rounded-full border border-white/20 px-4 font-medium text-white [transition:background-color_0.25s,color_0.25s,border-color_0.25s,transform_0.3s_cubic-bezier(0.22,0.8,0.26,1)] hover:-translate-y-0.5 hover:border-lime hover:bg-lime hover:text-night"
        >
          {{ term }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
